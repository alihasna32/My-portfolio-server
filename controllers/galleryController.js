const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get all gallery items (with optional filtering)
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const galleryItems = await db.collection('gallery').find(query).toArray();
        res.status(200).json(galleryItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a gallery item
// @route   POST /api/gallery
// @access  Private/Admin
const addGalleryItem = async (req, res) => {
    const { title, category, status, image, link, codeLink, description } = req.body;

    if (!title || !category) {
        return res.status(400).json({ message: 'Title and Category are required' });
    }

    try {
        const db = getDb();
        const newGalleryItem = {
            title,
            category,
            status: status || 'In Progress',
            image: image || '',
            link: link || '', // Live Preview Link
            codeLink: codeLink || '', // GitHub/Code Link
            description: description || '', // Short Description
            technologies: req.body.technologies || [], // Array of technologies
            createdAt: new Date(),
        };

        const result = await db.collection('gallery').insertOne(newGalleryItem);
        res.status(201).json({ ...newGalleryItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
const updateGalleryItem = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        delete updates._id;

        const result = await db.collection('gallery').updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
const deleteGalleryItem = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const result = await db.collection('gallery').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getGalleryItems,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
};
