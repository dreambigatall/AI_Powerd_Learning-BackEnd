const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
dotenv.config(); // Load .env variables

connectDB(); // Connect to database

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To accept JSON data in the body

// Health Check Route (to test if the server is running)
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));