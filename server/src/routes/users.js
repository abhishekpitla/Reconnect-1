const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    getProfile,
    updateProfile,
    searchUsers,
    updateProfileValidation,
} = require('../controllers/userController');

router.get('/search', auth, searchUsers);
router.get('/:userId', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

module.exports = router;
