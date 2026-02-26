const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
    createActivity,
    getFeed,
    getActivity,
    getUserActivities,
    deleteActivity,
    createActivityValidation,
} = require('../controllers/activityController');

router.post('/', auth, createActivityValidation, validate, createActivity);
router.get('/feed', auth, getFeed);
router.get('/user/:userId', auth, getUserActivities);
router.get('/:id', auth, getActivity);
router.delete('/:id', auth, deleteActivity);

module.exports = router;
