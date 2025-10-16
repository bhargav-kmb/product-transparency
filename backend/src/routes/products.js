const express = require("express");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const Product = require("../../models/Product");

const router = express.Router();

// ➕ Add a new product
router.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ id: product._id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 📄 Generate product PDF
router.get("/products/:id/report", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 14;

    let y = height - 50;
    page.drawText(`Product Report`, { x: 50, y, size: 20, font, color: rgb(0, 0, 0) });
    y -= 40;

    page.drawText(`Name: ${product.name}`, { x: 50, y, size: fontSize, font });
    y -= 25;
    page.drawText(`Category: ${product.category}`, { x: 50, y, size: fontSize, font });
    y -= 35;

    page.drawText("Questions & Answers:", { x: 50, y, size: fontSize + 2, font });
    y -= 25;

    product.questions.forEach((q, i) => {
      const text = typeof q === "object"
        ? `${i + 1}. ${q.question} - ${q.answer || ""}`
        : `${i + 1}. ${q}`;
      page.drawText(text, { x: 60, y, size: fontSize - 1, font });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${product.name}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
