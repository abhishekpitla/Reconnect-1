const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    signup,
    login,
    getMe,
    signupValidation,
    loginValidation,
} = require('../controllers/authController');

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', auth, getMe);

module.exports = router;
