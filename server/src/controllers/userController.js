const { body } = require('express-validator');
const { User } = require('../models');
const { Op } = require('sequelize');

exports.updateProfileValidation = [
    body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
    body('profilePicture').optional().isString(),
];

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, profilePicture } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (bio !== undefined) updates.bio = bio;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        await User.update(updates, { where: { id: req.user.id } });
        const user = await User.findByPk(req.user.id);

        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const users = await User.findAll({
            where: {
                id: { [Op.ne]: req.user.id },
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { email: { [Op.like]: `%${q}%` } },
                ],
            },
            attributes: ['id', 'name', 'email', 'profilePicture', 'bio'],
            limit: 20,
        });

        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
};
