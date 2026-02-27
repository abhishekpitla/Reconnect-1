const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getActivityMessages, sendMessage } = require('../controllers/chatController');

router.get('/:activityId', auth, getActivityMessages);
router.post('/', auth, sendMessage);

module.exports = router;
