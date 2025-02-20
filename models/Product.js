const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0 
  },
  imageURLs: [{ 
    type: String 
  }]
}, {
  timestamps: true
});

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 }); 

module.exports = mongoose.model('Product', ProductSchema); 