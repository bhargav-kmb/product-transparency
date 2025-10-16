const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./db");
const productRoutes = require("./routes/products");

connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use("/api", productRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
