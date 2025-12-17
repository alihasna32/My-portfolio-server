const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedUser = async () => {
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('portfolio-server-db');
        const usersCollection = db.collection('users');

        // Check if admin exists
        const email = 'admin@example.com';
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create Admin User
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await usersCollection.insertOne({
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log(`Admin user created:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    } finally {
        // await client.close();
    }
};

seedUser();
