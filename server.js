const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { connectToDb } = require('./config/db');
const port = process.env.PORT || 5000;

const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
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

// Connect to DB and start server
connectToDb((err) => {
    if (!err) {
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } else {
        console.error('Failed to connect to MongoDb', err);
    }
});
