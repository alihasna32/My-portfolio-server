const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = async (req, res) => {
    try {
        const db = getDb();
        const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new message (Public Contact Form)
// @route   POST /api/messages
// @access  Public
const addMessage = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }

    try {
        const db = getDb();
        const newMessage = {
            name,
            email,
            subject: subject || 'No Subject',
            message,
            read: false,
            createdAt: new Date(),
        };

        const result = await db.collection('messages').insertOne(newMessage);
        res.status(201).json({ ...newMessage, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }


        const result = await db.collection('messages').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markMessageAsRead = async (req, res) => {
    try {
        const db = getDb();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const result = await db.collection('messages').updateOne(
            { _id: new ObjectId(id) },
            { $set: { read: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    addMessage,
    deleteMessage,
    markMessageAsRead,
};
