// Vercel serverless function wrapper for Express app
let app;

try {
  // Load the Express app
  app = require('../server.js');
  
  // Export as a serverless function handler for Vercel
  module.exports = async (req, res) => {
    try {
      // Handle the request with Express app
      return app(req, res);
    } catch (error) {
      console.error('Serverless function error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Internal server error',
          message: error.message 
        });
      }
    }
  };
} catch (error) {
  console.error('Failed to load server:', error);
  module.exports = (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message 
    });
  };
}

