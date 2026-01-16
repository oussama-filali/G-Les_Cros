const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/order.routes');
const menuRoutes = require('./routes/menu.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware pour passer io aux controllers
app.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Route test
app.get('/', (req, res) => {
  res.json({ 
    message: 'GLesCrocs API', 
    status: 'running',
    endpoints: {
      orders: '/api/orders',
      menus: '/api/menus',
      users: '/api/users',
      payments: '/api/payments',
      stats: '/api/stats'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Erreur serveur'
  });
});

module.exports = app;
