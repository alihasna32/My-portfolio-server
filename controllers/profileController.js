const { getDb } = require('../config/db');

// @desc    Get profile
// @route   GET /api/profile
// @access  Public
const getProfile = async (req, res) => {
    try {
        const db = getDb();
        const profile = await db.collection('profiles').findOne({});

        if (!profile) {
            return res.status(200).json({});
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const db = getDb();
        // updates the first document found, or creates a new one if collection is empty
        const result = await db.collection('profiles').findOneAndUpdate(
            {},
            { $set: req.body },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        // findOneAndUpdate returns an object with `value` (the doc) or directly the doc depending on driver version.
        // In newer drivers (v4+), returns { value: ... } or check documentation.
        // Actually, let's just fetch it again to be safe and simple, or rely on `result` if we verify.
        // If result.value exists use it, otherwise result might be the doc.
        // Let's check typical behavior. `returnDocument: 'after'` usually works for returning the modified doc.

        // Safer approach if unsure of driver version: just return the body merged or fetch again.
        // But let's try to use the result properly.
        // If using mongodb 6.3.0 as per package.json:
        // findOneAndUpdate returns specific structure.

        const updatedProfile = await db.collection('profiles').findOne({});
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
};

