const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { connectToDb, getDb, resetDb } = require('./config/db');
const port = process.env.PORT || 5000;
const path = require('path');
const serverless = require('serverless-http');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    // Skip DB connection for health check and static files
    if (req.path === '/' || req.path === '/favicon.ico' || req.path.startsWith('/uploads')) {
        return next();
    }

    // Check if we have a valid connection
    const currentDb = getDb();
    if (currentDb) {
        // Optional: Ping to verify it's still alive (can be expensive to do every request)
        // For high traffic, you might want to throttle this check
        next();
    } else {
        try {
            console.log('[Server] Connecting to MongoDB...');
            await connectToDb();
            console.log('[Server] Connected.');
            next();
        } catch (error) {
            console.error('[Server] Database Connection Error:', error);
            res.status(500).json({ error: 'Database connection failed' });
        }
    }
});

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

// Start Server for Local Development
if (require.main === module) {
    // For local dev, connect once and then start listening
    connectToDb()
        .then(() => {
            app.listen(port, () => {
                console.log(`Server started on port ${port}`);
            });
        })
        .catch(err => {
            console.error('Failed to connect to MongoDb', err);
        });
} else {
    // Export for Vercel
    module.exports = serverless(app);
}
