const express = require('express');
const router = express.Router();
const {
    getGalleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getGalleryItems).post(protect, addGalleryItem);
router.route('/:id').put(protect, updateGalleryItem).delete(protect, deleteGalleryItem);

module.exports = router;
