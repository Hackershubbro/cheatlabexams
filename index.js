require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectToDB = require("./config/db");
const DataBaseRoutes = require("./routes/DataBaseRouters");

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", DataBaseRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found. Please check the URL and try again.",
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      "GET /api/data", 
      "POST /api/data", 
      "DELETE /api/data"
    ]
  });
});

// ✅ Connect to MongoDB, then start server
connectToDB().then(() => {
  app.listen(port, () => {
    console.log("🚀 Server started on port", port);
  });
});
