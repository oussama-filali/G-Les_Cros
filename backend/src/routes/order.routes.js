const express = require('express');
const OrderController = require('../controllers/Order.controller');

const router = express.Router();

// Routes pour /api/orders
router.post('/', OrderController.createOrder);
router.get('/', OrderController.getAllOrders);
router.patch('/:id', OrderController.updateOrderStatus);
router.get('/stats', OrderController.getStats);

module.exports = router;
