const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Log = require('./models/Log');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Electronic products dataset
const electronicProducts = [
  {
    name: "iPhone 14 Pro Max",
    price: 1299.99,
    description: "Latest iPhone with dynamic island and 48MP camera system",
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: ["https://picsum.photos/id/1/200/300"]
  },
  {
    name: "Samsung Galaxy S23 Ultra",
    price: 1199.99,
    description: "Premium Android smartphone with S Pen and 200MP camera",
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: ["https://picsum.photos/id/2/200/300"]
  },
  {
    name: "MacBook Pro 16-inch M2",
    price: 2499.99,
    description: "Powerful laptop with M2 Pro chip and stunning Retina display",
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: ["https://picsum.photos/id/3/200/300"]
  },
  {
    name: "Sony WH-1000XM5",
    price: 399.99,
    description: "Industry-leading noise-canceling headphones with exceptional sound",
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: ["https://picsum.photos/id/4/200/300"]
  },
  {
    name: "iPad Pro 12.9-inch",
    price: 1099.99,
    description: "Professional tablet with M2 chip and Liquid Retina XDR display",
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: ["https://picsum.photos/id/5/200/300"]
  }
];

// Generate additional products programmatically
const brands = [
  'Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 
  'Microsoft', 'Bose', 'Canon', 'Nikon', 'Logitech', 'Razer', 'JBL', 'DJI'
];

const productTypes = {
  'Laptop': {
    priceRange: [699, 2999],
    descriptionTemplate: "Powerful laptop with {feature} and {feature}",
    features: ['high-performance processor', '4K display', 'long battery life', 'premium build quality', 'dedicated graphics']
  },
  'Smartphone': {
    priceRange: [299, 1499],
    descriptionTemplate: "Feature-rich smartphone with {feature} and {feature}",
    features: ['advanced camera system', 'all-day battery', '5G connectivity', 'AMOLED display', 'fast charging']
  },
  'Headphones': {
    priceRange: [99, 599],
    descriptionTemplate: "Premium headphones featuring {feature} and {feature}",
    features: ['noise cancellation', 'high-resolution audio', 'comfortable fit', 'long battery life', 'premium sound quality']
  },
  'Tablet': {
    priceRange: [199, 1299],
    descriptionTemplate: "Versatile tablet with {feature} and {feature}",
    features: ['high-resolution display', 'powerful processor', 'stylus support', 'slim design', 'all-day battery']
  },
  'Smartwatch': {
    priceRange: [149, 899],
    descriptionTemplate: "Advanced smartwatch with {feature} and {feature}",
    features: ['health tracking', 'GPS', 'water resistance', 'long battery life', 'cellular connectivity']
  }
};

// Generate remaining products
for (let i = electronicProducts.length; i < 100; i++) {
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const type = Object.keys(productTypes)[Math.floor(Math.random() * Object.keys(productTypes).length)];
  const typeInfo = productTypes[type];
  
  // Generate random price within range
  const price = (Math.random() * (typeInfo.priceRange[1] - typeInfo.priceRange[0]) + typeInfo.priceRange[0]).toFixed(2);
  
  // Generate random features
  const features = [...typeInfo.features];
  const feature1 = features.splice(Math.floor(Math.random() * features.length), 1)[0];
  const feature2 = features.splice(Math.floor(Math.random() * features.length), 1)[0];
  
  electronicProducts.push({
    name: `${brand} ${type} ${Math.floor(Math.random() * 1000)}`,
    price: parseFloat(price),
    description: typeInfo.descriptionTemplate
      .replace('{feature}', feature1)
      .replace('{feature}', feature2),
    category: "electronics",
    stock: Math.floor(Math.random() * 100),
    imageURLs: [`https://picsum.photos/id/${i + 6}/200/300`]
  });
}

const seedData = async () => {
  try {
    // Log environment variables (for debugging)
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_db';
    console.log('Attempting to connect to MongoDB at:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
      Log.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create products
    const products = await Product.create(electronicProducts);
    console.log(`${products.length} products created`);

    // Create sample cart
    await Cart.create({
      userId: admin._id,
      products: [{
        product: products[0]._id,
        quantity: 1
      }]
    });
    console.log('Sample cart created');

    // Create sample order
    await Order.create({
      userId: admin._id,
      products: [{
        product: products[0]._id,
        quantity: 1,
        price: products[0].price
      }],
      totalCost: products[0].price,
      status: 'pending'
    });
    console.log('Sample order created');

    // Create sample log
    await Log.create({
      userId: admin._id,
      action: 'login',
      details: {
        timestamp: new Date(),
        ip: '127.0.0.1'
      }
    });
    console.log('Sample log created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error('Full error:', error.stack);
    process.exit(1);
  }
};

// Run the seed function
seedData(); 