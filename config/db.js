const { MongoClient } = require('mongodb');

let dbConnection;

const connectToDb = async () => {
    if (dbConnection) return dbConnection;

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing from environment variables.');
    }

    console.log('[Debug-DB] Connecting to MongoDB...');

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        console.log('[Debug-DB] Connected successfully.');
        dbConnection = client.db('portfolio-server-db');
        return dbConnection;
    } catch (err) {
        console.error('[Debug-DB] Connection failed:', err);
        throw err;
    }
};

const getDb = () => dbConnection;

const resetDb = () => {
    dbConnection = null;
    console.log('[Debug-DB] Database connection reset.');
};

module.exports = { connectToDb, getDb, resetDb };

