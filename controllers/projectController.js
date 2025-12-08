const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get all projects (with optional filtering)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
    try {
        const db = getDb();
        const { status } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }

        const projects = await db.collection('projects').find(query).toArray();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a project
// @route   POST /api/projects
// @access  Private/Admin
const addProject = async (req, res) => {
    const { title, category, status, image, link, codeLink, description } = req.body;

    if (!title || !category) {
        return res.status(400).json({ message: 'Title and Category are required' });
    }

    try {
        const db = getDb();
        const newProject = {
            title,
            category, // Expected: 'Frontend', 'Full Stack', 'Mern Stack'
            status: status || 'In Progress',
            image: image || '',
            link: link || '', // Live Preview Link
            codeLink: codeLink || '', // GitHub/Code Link
            description: description || '', // Short Description
            createdAt: new Date(),
        };

        const result = await db.collection('projects').insertOne(newProject);
        res.status(201).json({ ...newProject, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;
        const updates = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        // Exclude _id from updates if present
        delete updates._id;

        const result = await db.collection('projects').updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const result = await db.collection('projects').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json({ message: 'Project removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getProjects,
    addProject,
    updateProject,
    deleteProject,
};
