const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { collection } = require("../db");

// Step 2: Generate questions based on category
router.post("/suggest-questions", async (req, res) => {
  const { name, category } = req.body;

  let questions = [];
  if (category.toLowerCase().includes("food")) {
    questions = ["Is the product organic?", "List ingredients.", "Any allergens?"];
  } else {
    questions = ["Provide safety/compliance certifications."];
  }

  // Save to DB
  await collection.insertOne({ name, category, questions, answers: [] });

  res.json({ questions });
});

// Step 3: Generate PDF with answers
router.post("/generate-pdf", async (req, res) => {
  const { name, category, answers } = req.body;

  const doc = new PDFDocument();
  let filename = `${name.replace(/\s/g, "_")}.pdf`;

  // Set headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  doc.pipe(res);

  doc.fontSize(18).text(`Product Transparency Report`, { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Product Name: ${name}`);
  doc.text(`Category: ${category}`);
  doc.moveDown();

  doc.text("Questions & Answers:");
  answers.forEach((item, idx) => {
    doc.moveDown(0.5);
    doc.text(`${idx + 1}. Q: ${item.question}`);
    doc.text(`   A: ${item.answer}`);
  });

  doc.end();
});

module.exports = router;
