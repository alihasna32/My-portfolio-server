const { MongoClient } = require('mongodb');

let dbConnection;

const connectToDb = (cb) => {
    if (!process.env.MONGO_URI) {
        const error = new Error('MONGO_URI is missing from environment variables. Please add it to Vercel Settings.');
        console.error(error);
        return cb(error);
    }

    console.log('[Debug-DB] Starting connection attempt...');
    // Log masked URI to verify it's loaded and looks correct (e.g. mongodb+srv://)
    const uri = process.env.MONGO_URI;
    console.log('[Debug-DB] URI Loaded:', uri ? (uri.substring(0, 14) + '*****' + uri.substring(uri.length - 5)) : 'undefined');

    // Add timeout options to fail fast if IP is blocked or DB is unreachable
    MongoClient.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if server not found
        connectTimeoutMS: 5000,        // TCP connection timeout
        socketTimeoutMS: 45000,        // Close sockets after 45 seconds of inactivity
    })
        .then((client) => {
            console.log('[Debug-DB] MongoClient.connect resolved successfully.');
            dbConnection = client.db('portfolio-server-db');
            return cb();
        })
        .catch((err) => {
            console.log(err);
            return cb(err);
        });
};

const getDb = () => dbConnection;

module.exports = { connectToDb, getDb };
