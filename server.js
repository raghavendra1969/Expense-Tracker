const express = require('express');
const mongoose = require('mongoose');
const Expense = require('./models/Expense');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/moneytracker')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const expense = new Expense({ title, amount, category, date });
    await expense.save();
    res.status(201).json(expense);
  } catch {
    res.status(400).json({ error: 'Failed to add expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch {
    res.status(400).json({ error: 'Failed to delete expense' });
  }
});

// Basic Route Handlers
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
