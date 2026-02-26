const { Notification, User, Activity } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const notifications = await Notification.findAll({
            where: { userId: req.user.id },
            include: [
                { model: User, as: 'relatedUser', attributes: ['id', 'name', 'profilePicture'] },
                { model: Activity, as: 'relatedActivity', attributes: ['id', 'title'] },
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit,
        });

        const unreadCount = await Notification.count({
            where: { userId: req.user.id, read: false },
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        if (notification.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();
        res.json({ message: 'Marked as read', notification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { read: true },
            { where: { userId: req.user.id, read: false } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications' });
    }
};
