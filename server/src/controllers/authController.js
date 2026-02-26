const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User } = require('../models');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

exports.signupValidation = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user.id);

        // Exclude password from response
        const userData = user.toJSON();
        delete userData.password;

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: userData,
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.scope('withPassword').findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        const userData = user.toJSON();
        delete userData.password;

        res.json({
            message: 'Login successful',
            token,
            user: userData,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
