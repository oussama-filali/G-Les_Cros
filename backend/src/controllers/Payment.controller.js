// Payment Controller - Endpoints paiement Stripe
const PaymentService = require('../services/Payment.service');

class PaymentController {

  /**
   * POST /api/payments/create-intent
   * Créer un Payment Intent Stripe (AVANT création commande)
   */
  static async createPaymentIntent(req, res) {
    try {
      const { montant, items, utilisateur_id } = req.body;
      
      if (!montant || montant <= 0) {
        return res.status(400).json({ error: 'Montant invalide' });
      }

      const paymentIntent = await PaymentService.createPaymentIntent(montant, {
        utilisateur_id: utilisateur_id || 'anonyme',
        nb_items: items?.length || 0
      });

      res.json(paymentIntent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/payments/verify/:payment_intent_id
   * Vérifier le statut d'un paiement Stripe
   */
  static async verifyPayment(req, res) {
    try {
      const { payment_intent_id } = req.params;
      const verification = await PaymentService.verifyPayment(payment_intent_id);
      res.json(verification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/payments/refund/:payment_intent_id
   * Rembourser un paiement
   */
  static async refundPayment(req, res) {
    try {
      const { payment_intent_id } = req.params;
      const refund = await PaymentService.refundPayment(payment_intent_id);
      res.json(refund);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
