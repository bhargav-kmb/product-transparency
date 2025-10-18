const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Product = require("../models/Product");

// Step 1: Suggest AI questions
router.post("/suggest-questions", async (req, res) => {
  const { name, category } = req.body;

  let questions = [];
  if (category.toLowerCase().includes("food")) {
    questions = ["Is the product organic?", "List ingredients.", "Any allergens?"];
  } else if (category.toLowerCase().includes("cosmetic")) {
    questions = ["Does it have dermatological testing?", "Is it cruelty-free?", "Any harmful chemicals?"];
  } else {
    questions = ["Provide safety/compliance certifications."];
  }

  res.json({ questions });
});

// Step 2: Save product + answers
router.post("/products", async (req, res) => {
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

// Step 3: Generate PDF
router.get("/products/:id/report", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const doc = new PDFDocument();
    res.setHeader("Content-Disposition", `attachment; filename=${product.name}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.fontSize(18).text("📦 Product Transparency Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Product Name: ${product.name}`);
    doc.text(`Category: ${product.category}`);
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

module.exports = router;
