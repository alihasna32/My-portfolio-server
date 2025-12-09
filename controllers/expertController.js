const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get all expert items
// @route   GET /api/experts
// @access  Public
const getExperts = async (req, res) => {
    try {
        const db = getDb();
        const experts = await db.collection('experts').find().toArray();
        res.status(200).json(experts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new expert item
// @route   POST /api/experts
// @access  Private/Admin
const addExpert = async (req, res) => {
    try {
        const { name } = req.body;
        // Check if an image file was uploaded
        let imageUrl = '';
        if (req.file) {
            // Construct URL based on where we are hosting. 
            // Assuming uploads folder is served at /uploads
            // In server.js: app.use('/uploads', express.static(...))

            // We need the full URL or relative path.
            // Using ENV var for base URL is best, but relative path '/uploads/...' works if client handles base.
            // Based on previous Plan, client uses full URL.
            // Let's assume we store the relative path and client prepends, or we store full path if we can.
            // Better: Store relative path `/uploads/filename` and let client/API prepend base URL.
            // However, existing Resume upload seems to return full URL or client constructs it. 
            // Let's store `/uploads/${req.file.filename}`.

            imageUrl = `/uploads/${req.file.filename}`;
        }

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const newExpert = {
            name,
            image: imageUrl,
            createdAt: new Date()
        };

        const db = getDb();
        const result = await db.collection('experts').insertOne(newExpert);

        res.status(201).json({ ...newExpert, _id: result.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an expert item
// @route   DELETE /api/experts/:id
// @access  Private/Admin
const deleteExpert = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const result = await db.collection('experts').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Expert item not found' });
        }

        res.status(200).json({ message: 'Expert item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getExperts,
    addExpert,
    deleteExpert
};
