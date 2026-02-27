const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    toggleEngagement,
    getActivityEngagements,
    getUserEngagements,
    respondToInvite,
    getPendingInvites,
} = require('../controllers/engagementController');

router.post('/toggle', auth, toggleEngagement);
router.get('/activity/:activityId', auth, getActivityEngagements);
router.get('/me', auth, getUserEngagements);
router.post('/respond', auth, respondToInvite);
router.get('/pending', auth, getPendingInvites);

module.exports = router;
