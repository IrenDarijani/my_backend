// server.js (optional minimal backend)

const express = require("express");

const app = express();
const PORT = 8080;

// Minimal test route
app.get("/", (req, res) => {
  res.send("Backend is no longer serving any data. All data is now in frontend.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

 