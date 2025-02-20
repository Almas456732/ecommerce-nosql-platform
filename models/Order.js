const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  products: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  totalCost: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

OrderSchema.index({ userId: 1 });
OrderSchema.index({ timestamp: -1 }); 
OrderSchema.index({ 'products.productId': 1 });

module.exports = mongoose.model('Order', OrderSchema); 