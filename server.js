const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { connectToDb, getDb } = require('./config/db');
const port = process.env.PORT || 5000;
const path = require('path');
// const serverless = require('serverless-http'); // Removed for Vercel native support

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
// Note: On Vercel, this file system is ephemeral. Uploads won't persist.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

app.get('/', (req, res) => {
    res.send('Portfolio API is running...');
});

// Configure Serverless Handler
// const handler = serverless(app); // No longer needed for Vercel native

// Export Handler for Vercel
module.exports = async (req, res) => {
    // Debug Log 1: Entry
    console.log('[Vercel-Debug] Request received:', req.method, req.url);
    // Verify connection is alive with a ping
    if (dbConnection) {
        try {
            await dbConnection.command({ ping: 1 });
            console.log('[Vercel-Debug] Connection alive and pinged.');
        } catch (pingErr) {
            console.warn('[Vercel-Debug] Connection timed out or stale. Reconnecting...');
            dbConnection = null; // Force reconnect
        }
    }

    try {
        // Ensure DB connection is established
        // We check getDb() to see if connection exists
        if (!getDb()) {
            console.log('[Vercel-Debug] No active DB connection. Connecting now...');
            await new Promise((resolve, reject) => {
                connectToDb((err) => {
                    if (err) {
                        console.error('[Vercel-Debug] Connect Callback Error:', err);
                        return reject(err);
                    }
                    console.log('[Vercel-Debug] Connected to MongoDB!');
                    resolve();
                });
            });
        } else {
            console.log('[Vercel-Debug] Reusing existing DB connection.');
        }
    } catch (error) {
        console.error('[Vercel-Debug] Caught Exception:', error);
        // Return a JSON error to the client instead of crashing the function
        return res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
    // Process request
    console.log('[Vercel-Debug] Forwarding to Express app...');
    app(req, res);
};

// Start Server for Local Development
if (require.main === module) {
    connectToDb((err) => {
        if (!err) {
            app.listen(port, () => {
                console.log(`Server started on port ${port}`);
            });
        } else {
            console.error('Failed to connect to MongoDb', err);
        }
    });
}
