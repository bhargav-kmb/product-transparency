// backend/src/app.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db"); // ✅ connect to MongoDB
const productRoutes = require("./routes/products");

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", productRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running on Vercel!");
});

// Export the app for Vercel serverless functions
module.exports = app;
