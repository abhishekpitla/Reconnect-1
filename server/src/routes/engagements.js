const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    toggleEngagement,
    getActivityEngagements,
    getUserEngagements,
} = require('../controllers/engagementController');

router.post('/toggle', auth, toggleEngagement);
router.get('/activity/:activityId', auth, getActivityEngagements);
router.get('/me', auth, getUserEngagements);

module.exports = router;
