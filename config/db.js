const { MongoClient } = require('mongodb');

let dbConnection;

const connectToDb = (cb) => {
    if (!process.env.MONGO_URI) {
        const error = new Error('MONGO_URI is missing from environment variables. Please add it to Vercel Settings.');
        console.error(error);
        return cb(error);
    }

    // Add timeout options to fail fast if IP is blocked or DB is unreachable
    MongoClient.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Fail after 5 seconds if server not found
        connectTimeoutMS: 10000 // TCP connection timeout
    })
        .then((client) => {
            dbConnection = client.db();
            return cb();
        })
        .catch((err) => {
            console.log(err);
            return cb(err);
        });
};

const getDb = () => dbConnection;

module.exports = { connectToDb, getDb };
