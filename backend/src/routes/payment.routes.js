// Routes pour les paiements Stripe
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/Payment.controller');

// POST /api/payments/create-intent - Créer un Payment Intent Stripe
router.post('/create-intent', PaymentController.createPaymentIntent);

// GET /api/payments/verify/:payment_intent_id - Vérifier un paiement
router.get('/verify/:payment_intent_id', PaymentController.verifyPayment);

// POST /api/payments/refund/:payment_intent_id - Rembourser un paiement
router.post('/refund/:payment_intent_id', PaymentController.refundPayment);

module.exports = router;
