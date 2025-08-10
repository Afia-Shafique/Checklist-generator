const express = require('express');
const cors = require('cors');
const authRoutes = require('./auth');
const { testConnection } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint to test database connection
app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        status: 'healthy', 
        database: 'connected',
        message: 'Auth server is running and database is connected'
      });
    } else {
      res.status(500).json({ 
        status: 'unhealthy', 
        database: 'disconnected',
        message: 'Database connection failed'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5001;

// Test database connection on startup
testConnection().then(isConnected => {
  if (isConnected) {
    app.listen(PORT, () => console.log(`✅ Auth server running on port ${PORT}`));
  } else {
    console.error('❌ Failed to connect to database. Server not started.');
    process.exit(1);
  }
});
