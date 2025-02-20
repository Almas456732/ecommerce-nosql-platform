const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get products with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const search = req.query.search;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    
    let query = {};
    
    // Фильтр по категории
    if (category) {
      query.category = category;
    }
    
    // Поиск по названию
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Фильтр по цене
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Получаем уникальные категории для фильтра
    const categories = await Product.distinct('category');

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      categories
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/purchase', async (req, res) => {
  const productIds = req.body.productIds;
  console.log('Полученные productIds:', productIds);
  try {
    const products = await Product.find({ _id: { $in: productIds } });
    console.log('Найденные продукты:', products);

    for (const product of products) {
      if (product.stock <= 0) {
        console.log(`Продукт ${product.name} отсутствует на складе.`);
        return res.status(400).json({ message: `Product ${product.name} is out of stock.` });
      }
    }

    for (const product of products) {
      product.stock -= 1;
      await product.save();
      console.log(`Обновленный запас для продукта ${product.name}: ${product.stock}`);
    }

    res.json({ message: 'Purchase successful!' });
  } catch (err) {
    console.error('Ошибка при покупке:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 