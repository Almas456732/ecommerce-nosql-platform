const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const authenticateUser = require('../middleware/authenticateUser');

router.post('/', authenticateUser, async (req, res) => {
  const cart = req.body.cart;
  const userId = req.user.id; // Используем id из токена
  try {
    const productIds = Object.keys(cart);
    const products = await Product.find({ _id: { $in: productIds } });

    let totalCost = 0;
    const orderProducts = [];

    for (const product of products) {
      const quantity = cart[product._id];
      if (product.stock < quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock.` });
      }
      totalCost += product.price * quantity;
      orderProducts.push({
        productId: product._id,
        quantity: quantity,
        price: product.price
      });
    }

    // Создание нового заказа
    const order = new Order({
      userId: userId,
      products: orderProducts,
      totalCost: totalCost
    });

    await order.save();

    // Обновление запасов продуктов
    for (const product of products) {
      const quantity = cart[product._id];
      product.stock -= quantity;
      await product.save();
    }

    res.json({ message: 'Purchase successful!', orderId: order._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authenticateUser, async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user.id }).populate('products.productId');
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

module.exports = router;