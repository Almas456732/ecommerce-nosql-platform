const express = require('express');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main_page.html'));
});

app.get('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login_page.html'));
});

app.get('/signupPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup_page.html'));
});

// Добавим маршрут для админ-панели
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin_panel.html'));
});

// Добавим маршрут для каталога
app.get('/catalog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'catalog.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/ordersPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'orders_page.html'));
});

// Start server
app.listen(port, () => {
  connectDB();
  console.log(`Server running on port ${port}`);
});