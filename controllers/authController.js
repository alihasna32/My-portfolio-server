const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const User = require('../models/User');
const { getDb } = require('../config/db');

// @desc    Register new user (Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findByEmail(email);

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    try {
        const user = await User.create(email, password);
        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findByEmail(email);

    if (user && (await User.matchPassword(password, user.password))) {
        res.json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        email: req.user.email,
    });
};

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Update user profile (Email & Password)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { email, password, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If changing password, require current password
        if (newPassword && !password) {
            return res.status(400).json({ message: 'Current password is required to set a new password' });
        }

        // Verify current password if provided
        if (password) {
            const isMatch = await User.matchPassword(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid current password' });
            }
        }

        const updates = {};
        if (email) updates.email = email;
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(newPassword, salt);
        }

        // Only update if there are changes
        if (Object.keys(updates).length > 0) {
            const db = getDb();
            // userId is already an ObjectId from middleware populating req.user which gets from DB
            // But just to be safe, we can ensure it is treated as ObjectId filter
            await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updates }
            );
        }

        res.status(200).json({
            _id: user._id,
            email: email || user.email,
            token: generateToken(user._id) // Issue new token
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
};
