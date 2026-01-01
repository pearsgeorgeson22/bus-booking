// Vercel serverless function wrapper for Express app
const app = require('../server.js');

// Export as a serverless function handler for Vercel
module.exports = (req, res) => {
  return app(req, res);
};

