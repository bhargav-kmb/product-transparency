const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db");
const productRoutes = require("./routes/products");

connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", productRoutes);

app.get("/", (req, res) => {
  res.send("Backend running!");
});

module.exports = app;
