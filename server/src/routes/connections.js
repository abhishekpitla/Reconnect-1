const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    sendRequest,
    acceptRequest,
    removeConnection,
    getFriends,
    getPendingRequests,
} = require('../controllers/connectionController');

router.post('/request', auth, sendRequest);
router.put('/:connectionId/accept', auth, acceptRequest);
router.delete('/:connectionId', auth, removeConnection);
router.get('/friends', auth, getFriends);
router.get('/pending', auth, getPendingRequests);

module.exports = router;
