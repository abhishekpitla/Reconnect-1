const { ChatMessage, User, Engagement, Activity } = require('../models');

exports.getActivityMessages = async (req, res) => {
    try {
        const { activityId } = req.params;

        // Verify if user is host or accepted participant
        const activity = await Activity.findByPk(activityId);
        if (!activity) return res.status(404).json({ error: 'Activity not found' });

        if (activity.userId !== req.user.id) {
            const engagement = await Engagement.findOne({
                where: { activityId, userId: req.user.id, status: 'accepted' }
            });
            if (!engagement) {
                return res.status(403).json({ error: 'Not authorized to view this chat' });
            }
        }

        const messages = await ChatMessage.findAll({
            where: { activityId },
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] }],
            order: [['createdAt', 'ASC']]
        });

        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { activityId, content } = req.body;

        // Verification logic (same as above)
        const activity = await Activity.findByPk(activityId);
        if (activity.userId !== req.user.id) {
            const engagement = await Engagement.findOne({
                where: { activityId, userId: req.user.id, status: 'accepted' }
            });
            if (!engagement) return res.status(403).json({ error: 'Forbidden' });
        }

        const message = await ChatMessage.create({
            activityId,
            userId: req.user.id,
            content
        });

        const populated = await ChatMessage.findByPk(message.id, {
            include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profilePicture'] }]
        });

        res.status(201).json({ message: populated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};
