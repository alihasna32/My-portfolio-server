const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
    try {
        const db = getDb();
        const skills = await db.collection('skills').find({}).toArray();
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a skill
// @route   POST /api/skills
// @access  Private/Admin
const addSkill = async (req, res) => {
    const { name, level, category } = req.body;

    if (!name || !level || !category) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        const db = getDb();
        const newSkill = {
            name,
            level,
            category,
            createdAt: new Date(),
        };

        const result = await db.collection('skills').insertOne(newSkill);
        res.status(201).json({ ...newSkill, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const result = await db.collection('skills').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        res.status(200).json({ message: 'Skill removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSkills,
    addSkill,
    deleteSkill,
};
