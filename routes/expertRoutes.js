const express = require('express');
const router = express.Router();
const { getExperts, addExpert, deleteExpert } = require('../controllers/expertController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getExperts)
    .post(protect, addExpert);

router.route('/:id')
    .delete(protect, deleteExpert);

module.exports = router;
