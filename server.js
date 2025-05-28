require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import API routes
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// Import database initialization
const { initializeDatabase } = require('./db');

// Start the server
async function startServer() {
  await initializeDatabase(); // Initialize DB before starting server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});