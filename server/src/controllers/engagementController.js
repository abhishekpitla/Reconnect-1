const { Engagement, Activity, Notification, User } = require('../models');
const { getIO, getUserSocket } = require('../config/socket');

exports.toggleEngagement = async (req, res) => {
    try {
        const { activityId, type } = req.body;

        if (!activityId || !type) {
            return res.status(400).json({ error: 'activityId and type are required' });
        }

        if (!['interested', 'me_too'].includes(type)) {
            return res.status(400).json({ error: 'Type must be interested or me_too' });
        }

        const activity = await Activity.findByPk(activityId);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Toggle: if exists, remove; if not, create
        const existing = await Engagement.findOne({
            where: { userId: req.user.id, activityId, type },
        });

        if (existing) {
            await existing.destroy();
            return res.json({ message: 'Engagement removed', engaged: false });
        }

        const engagement = await Engagement.create({
            userId: req.user.id,
            activityId,
            type,
            status: type === 'me_too' ? 'pending' : 'accepted',
        });

        // Notify activity owner
        if (activity.userId !== req.user.id) {
            const typeLabel = type === 'me_too' ? 'Join Request' : 'Interested';
            const notification = await Notification.create({
                userId: activity.userId,
                type: 'engagement',
                relatedActivityId: activityId,
                relatedUserId: req.user.id,
                message: type === 'me_too'
                    ? `${req.user.name} wants to join your activity "${activity.title}"`
                    : `${req.user.name} reacted "Interested" to your activity "${activity.title}"`,
            });

            const populatedNotif = await Notification.findByPk(notification.id, {
                include: [
                    { model: User, as: 'relatedUser', attributes: ['id', 'name', 'profilePicture'] },
                    { model: Activity, as: 'relatedActivity', attributes: ['id', 'title'] },
                ],
            });

            const io = getIO();
            const socketId = getUserSocket(activity.userId.toString());
            if (socketId) {
                io.to(socketId).emit('notification', populatedNotif);
            }
        }

        res.status(201).json({ message: 'Engagement added', engaged: true, engagement });
    } catch (error) {
        console.error('Toggle engagement error:', error);
        res.status(500).json({ error: 'Failed to toggle engagement' });
    }
};

exports.respondToInvite = async (req, res) => {
    try {
        const { engagementId, status } = req.body;

        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const engagement = await Engagement.findByPk(engagementId, {
            include: [{ model: Activity, as: 'activity' }]
        });

        if (!engagement) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (engagement.activity.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        engagement.status = status;
        await engagement.save();

        // Notify requester
        const notification = await Notification.create({
            userId: engagement.userId,
            type: 'engagement_response',
            relatedActivityId: engagement.activityId,
            relatedUserId: req.user.id,
            message: `Your request to join "${engagement.activity.title}" was ${status}`,
        });

        const io = getIO();
        const socketId = getUserSocket(engagement.userId.toString());
        if (socketId) {
            io.to(socketId).emit('notification', notification);
        }

        res.json({ message: `Request ${status}`, engagement });
    } catch (error) {
        res.status(500).json({ error: 'Failed to respond to request' });
    }
};

exports.getPendingInvites = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { userId: req.user.id },
            attributes: ['id']
        });
        const activityIds = activities.map(a => a.id);

        const invites = await Engagement.findAll({
            where: {
                activityId: activityIds,
                type: 'me_too',
                status: 'pending'
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] },
                { model: Activity, as: 'activity', attributes: ['id', 'title'] }
            ]
        });

        res.json({ invites });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get pending invites' });
    }
};

exports.getActivityEngagements = async (req, res) => {
    try {
        const engagements = await Engagement.findAll({
            where: { activityId: req.params.activityId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
        });

        const interested = engagements.filter((e) => e.type === 'interested');
        const accepted = engagements.filter((e) => e.type === 'me_too' && e.status === 'accepted');
        const pending = engagements.filter((e) => e.type === 'me_too' && e.status === 'pending');

        res.json({
            interested: { count: interested.length, users: interested },
            accepted: { count: accepted.length, users: accepted },
            pending: { count: pending.length, users: pending },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get engagements' });
    }
};

exports.getUserEngagements = async (req, res) => {
    try {
        const engagements = await Engagement.findAll({
            where: { userId: req.user.id },
            include: [{ model: Activity, as: 'activity' }],
        });
        res.json({ engagements });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get engagements' });
    }
};
