const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

// Connect to MongoDB
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("MONGO_URI is not defined!");

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Mongoose schema
const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  questions: [
    {
      question: String,
      answer: String,
    },
  ],
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

const app = express();

// CORS
app.use(cors({
  origin: "*", // allow all origins for testing
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// Save product (Step 2)
app.post("/api/products", async (req, res) => {
  try {
    const { name, category, questions } = req.body;
    const product = new Product({ name, category, questions });
    await product.save();
    res.json({ id: product._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Generate PDF (Step 3)
app.get("/api/products/:id/report", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename=${product.name}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.text(`Product Name: ${product.name}`, { underline: true });
    doc.text(`Category: ${product.category}`);
    doc.moveDown();

    product.questions.forEach((q, i) => {
      doc.text(`${i + 1}. ${q.question}`);
      doc.text(`Answer: ${q.answer}`);
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF");
  }
});

// Export app for Vercel serverless
module.exports = app;
