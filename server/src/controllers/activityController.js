const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Activity, Connection, Notification, User } = require('../models');
const { getIO, getUserSocket } = require('../config/socket');

exports.createActivityValidation = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('description').optional().isLength({ max: 1000 }),
    body('location').optional().isLength({ max: 200 }),
    body('time').notEmpty().withMessage('Time is required').isISO8601().withMessage('Invalid date format'),
    body('audience').optional().isIn(['friends', 'public']).withMessage('Audience must be friends or public'),
];

exports.createActivity = async (req, res) => {
    try {
        const { title, description, location, time, audience } = req.body;

        const activity = await Activity.create({
            userId: req.user.id,
            title,
            description,
            location,
            time,
            audience: audience || 'friends',
        });

        const populated = await Activity.findByPk(activity.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
        });

        // Notify friends about new activity
        if (audience === 'friends' || !audience) {
            const connections = await Connection.findAll({
                where: {
                    status: 'accepted',
                    [Op.or]: [
                        { requesterId: req.user.id },
                        { recipientId: req.user.id },
                    ],
                },
            });

            const friendIds = connections.map((c) =>
                c.requesterId === req.user.id ? c.recipientId : c.requesterId
            );

            const io = getIO();
            for (const friendId of friendIds) {
                const notification = await Notification.create({
                    userId: friendId,
                    type: 'new_activity',
                    relatedActivityId: activity.id,
                    relatedUserId: req.user.id,
                    message: `${req.user.name} posted a new activity: "${title}"`,
                });

                const populatedNotif = await Notification.findByPk(notification.id, {
                    include: [
                        { model: User, as: 'relatedUser', attributes: ['id', 'name', 'profilePicture'] },
                        { model: Activity, as: 'relatedActivity', attributes: ['id', 'title'] },
                    ],
                });

                const socketId = getUserSocket(friendId.toString());
                if (socketId) {
                    io.to(socketId).emit('notification', populatedNotif);
                }
            }
        }

        res.status(201).json({ message: 'Activity created', activity: populated });
    } catch (error) {
        console.error('Create activity error:', error);
        res.status(500).json({ error: 'Failed to create activity' });
    }
};

exports.getFeed = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get friend IDs
        const connections = await Connection.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { requesterId: req.user.id },
                    { recipientId: req.user.id },
                ],
            },
        });

        const friendIds = connections.map((c) =>
            c.requesterId === req.user.id ? c.recipientId : c.requesterId
        );

        // Feed = own activities + friends' activities + public activities
        const { count, rows: activities } = await Activity.findAndCountAll({
            where: {
                [Op.or]: [
                    { userId: req.user.id },
                    { userId: { [Op.in]: friendIds }, audience: 'friends' },
                    { audience: 'public' },
                ],
            },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        res.json({
            activities,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Failed to get feed' });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id, {
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
        });
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json({ activity });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get activity' });
    }
};

exports.getUserActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            where: { userId: req.params.userId },
            include: [{ model: User, as: 'user', attributes: ['id', 'name', 'profilePicture'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json({ activities });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get activities' });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByPk(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        if (activity.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        await activity.destroy();
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete activity' });
    }
};
