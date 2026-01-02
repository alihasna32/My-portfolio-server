const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const resetAdminPassword = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI is not defined in .env');
        process.exit(1);
    }
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('portfolio-server-db');
        const usersCollection = db.collection('users');

        const email = 'admin@example.com';
        const password = 'password123';

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update or insert the admin user
        const result = await usersCollection.updateOne(
            { email },
            {
                $set: {
                    password: hashedPassword,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    email,
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        if (result.matchedCount > 0) {
            console.log(`Successfully updated password for ${email}`);
        } else if (result.upsertedCount > 0) {
            console.log(`Created new admin user ${email}`);
        }

        console.log(`New credentials: ${email} / ${password}`);

    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
};

resetAdminPassword();
