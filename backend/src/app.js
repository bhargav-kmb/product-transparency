const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

// Load environment variables (for local)
if (process.env.NODE_ENV !== "production") require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) throw new Error("MONGO_URI is not defined!");

// Connect to MongoDB
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

// Enable CORS
app.use(cors({
  origin: "*", // allow all origins for testing
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// -------------------- Step 1: AI question generation --------------------
app.post("/api/suggest-questions", async (req, res) => {
  try {
    const { name, category } = req.body;

    let questions;
    if (category.toLowerCase().includes("food")) {
      questions = ["Is the product organic?", "List ingredients.", "Any allergens?"];
    } else {
      questions = ["Provide safety/compliance certifications."];
    }

    res.json({ questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// -------------------- Step 2: Save product + answers --------------------
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

// -------------------- Step 3: Generate PDF --------------------
app.get("/api/products/:id/report", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename=${product.name}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.fontSize(16).text(`Product Name: ${product.name}`, { underline: true });
    doc.fontSize(14).text(`Category: ${product.category}`);
    doc.moveDown();

    product.questions.forEach((q, i) => {
      doc.fontSize(12).text(`${i + 1}. ${q.question}`);
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

// -------------------- Export app for serverless deployment --------------------
module.exports = app;
