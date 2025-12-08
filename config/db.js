const { MongoClient } = require('mongodb');

let dbConnection;

const connectToDb = (cb) => {
    MongoClient.connect(process.env.MONGO_URI)
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
