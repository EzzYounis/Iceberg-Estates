//Import required libraries
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config(); // Load environment variables

// Create Express app
const app = express();

const PORT = process.env.PORT || 3000;



app.get("/", (req, res) => {
  res.send("Welcome to Iceberg Estates API");
});
app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Started at: ${new Date().toLocaleString()}`);
});