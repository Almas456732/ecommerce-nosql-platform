const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const connectDB = async () => {
  mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log('MongoDB connected')) 
  .catch(err => console.log(err)); 
};

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password = 'user' } = req.body;

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ username, email, password});
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
      console.error('Error during registration:', err.message);
      res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, username: user.username } });
  } catch (err) {
      console.error('Error during login:', err.message);
      res.status(500).json({ error: 'Server error' });
  }
});

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