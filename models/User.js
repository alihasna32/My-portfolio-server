const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class User {
    static async create(email, password) {
        const db = getDb();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.collection('users').insertOne({
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { _id: result.insertedId, email };
    }

    static async findByEmail(email) {
        const db = getDb();
        return await db.collection('users').findOne({ email });
    }

    static async findById(id) {
        const db = getDb();
        // Handle both string and ObjectId inputs
        const queryId = typeof id === 'string' ? new ObjectId(id) : id;
        return await db.collection('users').findOne({ _id: queryId });
    }

    static async matchPassword(enteredPassword, storedPassword) {
        return await bcrypt.compare(enteredPassword, storedPassword);
    }
}

module.exports = User;
