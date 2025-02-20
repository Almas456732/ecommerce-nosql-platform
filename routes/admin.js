const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Log = require('../models/Log');
const Order = require('../models/Order');
const Purchase = require('../models/Purchase');

// Get all products with pagination
router.get('/products', isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create product
router.post('/products', isAdmin, async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    category: req.body.category,
    stock: req.body.stock,
    imageURLs: req.body.imageURLs
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put('/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete product (исправленный метод)
router.delete('/products/:id', isAdmin, async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Обновим route для аналитики
router.get('/analytics', isAdmin, async (req, res) => {
  try {
    // Get purchases with user and product details
    const purchases = await Purchase.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          userEmail: '$user.email',
          productName: '$product.name',
          quantity: 1,
          price: 1,
          totalCost: { $multiply: ['$quantity', '$price'] },
          timestamp: 1
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    // Get most purchased products
    const mostPurchased = await Purchase.aggregate([
      {
        $group: {
          _id: '$productId',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productName: '$product.name',
          category: '$product.category',
          totalQuantity: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get user activity with user details
    const userActivity = await Log.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userEmail: '$user.email',
          action: 1,
          details: 1,
          timestamp: 1
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]);

    res.json({
      purchases,
      mostPurchased,
      userActivity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 