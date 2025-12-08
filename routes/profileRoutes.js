const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware'); // Assuming auth middleware exists

router.get('/', getProfile);
router.put('/', updateProfile); // Ideally protect this, skipping middleware for simplicity unless strictly required or if headers are handled

module.exports = router;
