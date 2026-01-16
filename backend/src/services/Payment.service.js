// Payment Service - Gestion des paiements Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  
  /**
   * Créer un Payment Intent Stripe
   * @param {number} montant - Montant en euros
   * @param {object} metadata - Données de la commande
   */
  static async createPaymentIntent(montant, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(montant * 100), // Stripe utilise les centimes
        currency: 'eur',
        metadata: {
          ...metadata,
          source: 'GLesCrocs'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: montant
      };
    } catch (error) {
      throw new Error(`Erreur création Payment Intent: ${error.message}`);
    }
  }

  /**
   * Vérifier le statut d'un paiement Stripe
   * @param {string} payment_intent_id - ID du Payment Intent
   */
  static async verifyPayment(payment_intent_id) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
      
      return {
        id: paymentIntent.id,
        status: paymentIntent.status, // succeeded, processing, requires_payment_method, etc.
        amount: paymentIntent.amount / 100, // Convertir centimes en euros
        isValid: paymentIntent.status === 'succeeded'
      };
    } catch (error) {
      throw new Error(`Erreur vérification paiement: ${error.message}`);
    }
  }

  /**
   * Annuler un paiement Stripe (remboursement)
   * @param {string} payment_intent_id - ID du Payment Intent
   */
  static async refundPayment(payment_intent_id) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment_intent_id,
      });

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error) {
      throw new Error(`Erreur remboursement: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
