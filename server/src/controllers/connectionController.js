const { Op } = require('sequelize');
const { Connection, Notification, User } = require('../models');
const { getIO, getUserSocket } = require('../config/socket');

exports.sendRequest = async (req, res) => {
    try {
        const { recipientId } = req.body;
        if (!recipientId) {
            return res.status(400).json({ error: 'Recipient ID is required' });
        }

        if (parseInt(recipientId) === req.user.id) {
            return res.status(400).json({ error: 'Cannot send request to yourself' });
        }

        const recipient = await User.findByPk(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existing = await Connection.findOne({
            where: {
                [Op.or]: [
                    { requesterId: req.user.id, recipientId },
                    { requesterId: recipientId, recipientId: req.user.id },
                ],
            },
        });

        if (existing) {
            if (existing.status === 'accepted') {
                return res.status(400).json({ error: 'Already connected' });
            }
            return res.status(400).json({ error: 'Connection request already exists' });
        }

        const connection = await Connection.create({
            requesterId: req.user.id,
            recipientId,
        });

        const notification = await Notification.create({
            userId: recipientId,
            type: 'connection_request',
            relatedUserId: req.user.id,
            message: `${req.user.name} sent you a connection request`,
        });

        const populatedNotif = await Notification.findByPk(notification.id, {
            include: [{ model: User, as: 'relatedUser', attributes: ['id', 'name', 'profilePicture'] }],
        });

        const io = getIO();
        const socketId = getUserSocket(recipientId.toString());
        if (socketId) {
            io.to(socketId).emit('notification', populatedNotif);
        }

        res.status(201).json({ message: 'Connection request sent', connection });
    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ error: 'Failed to send connection request' });
    }
};

exports.acceptRequest = async (req, res) => {
    try {
        const connection = await Connection.findByPk(req.params.connectionId);
        if (!connection) {
            return res.status(404).json({ error: 'Connection request not found' });
        }

        if (connection.recipientId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (connection.status === 'accepted') {
            return res.status(400).json({ error: 'Already accepted' });
        }

        connection.status = 'accepted';
        await connection.save();

        const notification = await Notification.create({
            userId: connection.requesterId,
            type: 'connection_accepted',
            relatedUserId: req.user.id,
            message: `${req.user.name} accepted your connection request`,
        });

        const populatedNotif = await Notification.findByPk(notification.id, {
            include: [{ model: User, as: 'relatedUser', attributes: ['id', 'name', 'profilePicture'] }],
        });

        const io = getIO();
        const socketId = getUserSocket(connection.requesterId.toString());
        if (socketId) {
            io.to(socketId).emit('notification', populatedNotif);
        }

        res.json({ message: 'Connection accepted', connection });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept request' });
    }
};

exports.removeConnection = async (req, res) => {
    try {
        const connection = await Connection.findByPk(req.params.connectionId);
        if (!connection) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        if (connection.requesterId !== req.user.id && connection.recipientId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await connection.destroy();
        res.json({ message: 'Connection removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove connection' });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const connections = await Connection.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { requesterId: req.user.id },
                    { recipientId: req.user.id },
                ],
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'name', 'email', 'profilePicture', 'bio'] },
                { model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'profilePicture', 'bio'] },
            ],
        });

        const friends = connections.map((conn) => {
            const friend = conn.requesterId === req.user.id ? conn.recipient : conn.requester;
            return { connectionId: conn.id, ...friend.toJSON() };
        });

        res.json({ friends });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get friends' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const incoming = await Connection.findAll({
            where: { recipientId: req.user.id, status: 'pending' },
            include: [{ model: User, as: 'requester', attributes: ['id', 'name', 'email', 'profilePicture', 'bio'] }],
        });

        const outgoing = await Connection.findAll({
            where: { requesterId: req.user.id, status: 'pending' },
            include: [{ model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'profilePicture', 'bio'] }],
        });

        res.json({ incoming, outgoing });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get pending requests' });
    }
};
