const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    index: true // Adding index for better search performance
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  imageURLs: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

// Add compound index for price range queries and category filtering
productSchema.index({ price: 1, category: 1 });

// Add index for stock queries
productSchema.index({ stock: 1 });

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

// Add compound index for latest products by category
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema); 