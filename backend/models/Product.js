const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      answer: { type: String, default: "" }  // optional or default empty
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
