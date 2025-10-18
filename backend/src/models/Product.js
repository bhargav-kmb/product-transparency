const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    questions: [
      {
        question: String,
        answer: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
