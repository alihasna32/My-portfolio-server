const express = require('express');
const router = express.Router();
const { getMessages, addMessage, deleteMessage, markMessageAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMessages).post(addMessage);
router.route('/:id').delete(protect, deleteMessage);
router.route('/:id/read').put(protect, markMessageAsRead);

module.exports = router;
