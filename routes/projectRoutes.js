const express = require('express');
const router = express.Router();
const {
    getProjects,
    addProject,
    updateProject,
    deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getProjects).post(protect, addProject);
router.route('/:id').put(protect, updateProject).delete(protect, deleteProject);

module.exports = router;
