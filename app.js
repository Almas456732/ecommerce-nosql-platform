const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

const connectDB = async () => {
  mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log('MongoDB connected')) 
  .catch(err => console.log(err)); 
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main_page.html'));
});

app.get('/loginPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login_page.html'));
});

app.get('/signupPage', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup_page.html'));
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});