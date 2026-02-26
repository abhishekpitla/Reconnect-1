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
        });

        // Notify activity owner
        if (activity.userId !== req.user.id) {
            const typeLabel = type === 'me_too' ? 'Me Too!' : 'Interested';
            const notification = await Notification.create({
                userId: activity.userId,
                type: 'engagement',
                relatedActivityId: activityId,
                relatedUserId: req.user.id,
                message: `${req.user.name} reacted "${typeLabel}" to your activity "${activity.title}"`,
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

exports.getActivityEngagements = async (req, res) => {
    try {
        const engagements = await Engagement.findAll({
            where: { activityId: req.params.activityId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
        });

        const interested = engagements.filter((e) => e.type === 'interested');
        const meToo = engagements.filter((e) => e.type === 'me_too');

        res.json({
            interested: { count: interested.length, users: interested },
            me_too: { count: meToo.length, users: meToo },
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
