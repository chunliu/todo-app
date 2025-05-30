require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for the homepage
const fs = require('fs'); // Require fs for file reading

app.get('/', (req, res) => {
  const deploymentSlot = process.env.DEPLOYMENT_SLOT || 'default'; // Get slot, default if not set
  fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading page');
    }
    // Replace a placeholder in HTML or add a script tag to set the value
    // For simplicity, let's add a script tag to set a global JS variable
    const modifiedHtml = data.replace(
      '</body>',
      `  <script>window.DEPLOYMENT_SLOT = "${deploymentSlot}";</script>\n</body>`
    );
    res.send(modifiedHtml);
  });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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