const OrderModel = require('../models/Order.model');
const PaymentModel = require('../models/Payment.model');
const NotificationModel = require('../models/Notification.model');
const MenuModel = require('../models/Menu.model');
const PaymentService = require('./Payment.service');

const VALID_STATUSES = ['en_attente', 'en_preparation', 'prete', 'retard_client', 'servie', 'annulee'];
const ESTIMATED_TIME_PER_ORDER = 15; // minutes

// Transitions de statuts autorisées
const STATUS_TRANSITIONS = {
  'en_attente': ['en_preparation', 'annulee'],
  'en_preparation': ['prete', 'annulee'],
  'prete': ['servie', 'retard_client', 'annulee'],
  'retard_client': ['servie', 'annulee'],
  'servie': [], // État final
  'annulee': [] // État final
};

class OrderService {

  /**
   * Créer une nouvelle commande (APRÈS validation paiement Stripe)
   */
  static async createOrder(orderData) {
    const { utilisateur_id, items, payment_intent_id, methode_paiement = 'carte' } = orderData;
    
    // OBLIGATOIRE: payment_intent_id doit être fourni (sauf en mode test)
    const skipStripeVerification = process.env.SKIP_STRIPE_VERIFICATION === 'test'; // Skip juste pour les testes 
    
    if (!payment_intent_id && !skipStripeVerification) {
      throw new Error('payment_intent_id requis - le paiement doit être validé avant création commande');
    }

    // Vérifier que le paiement Stripe est bien validé (sauf en mode test/dev)
    if (payment_intent_id && !skipStripeVerification) {
      const paymentVerification = await PaymentService.verifyPayment(payment_intent_id);
      if (!paymentVerification.isValid) {
        throw new Error(`Paiement non validé. Statut Stripe: ${paymentVerification.status}`);
      }
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('La commande doit contenir au moins un article');
    }

    // Valider et enrichir chaque item avec menu_id si fourni
    const enrichedItems = [];
    for (const item of items) {
      // Si menu_id fourni, récupérer les infos du menu
      if (item.menu_id) {
        const menu = await MenuModel.findById(item.menu_id);
        if (!menu) {
          throw new Error(`Menu ID ${item.menu_id} introuvable`);
        }
        if (!menu.disponible) {
          throw new Error(`Le plat "${menu.nom}" n'est plus disponible`);
        }
        enrichedItems.push({
          menu_id: item.menu_id,
          nom: menu.nom,
          quantite: item.quantite || 1,
          prix: menu.prix
        });
      } else {
        // Validation manuelle
        if (!item.nom || !item.quantite || !item.prix) {
          throw new Error('Chaque article doit avoir: nom, quantite, prix (ou menu_id)');
        }
        if (item.quantite <= 0 || item.prix <= 0) {
          throw new Error('Quantité et prix doivent être supérieurs à 0');
        }
        enrichedItems.push({
          menu_id: null,
          nom: item.nom,
          quantite: item.quantite,
          prix: item.prix
        });
      }
    }

    // Calculer le prix total
    const prix_total = enrichedItems.reduce((total, item) => {
      return total + (item.prix * item.quantite);
    }, 0);

    // Créer la commande avec items (paiement déjà validé par Stripe)
    const orderId = await OrderModel.create({ 
      utilisateur_id, 
      items: enrichedItems, 
      prix_total 
    });

    // Enregistrer le paiement VALIDÉ (transaction_id = payment_intent_id Stripe)
    await PaymentModel.create({
      commande_id: orderId,
      montant: prix_total,
      methode: methode_paiement,
      transaction_id: payment_intent_id || `TEST_${orderId}_${Date.now()}`, // ID fictif en mode test
      statut: 'valide' // Déjà validé par Stripe (ou simulé en test)
    });

    // Créer notification pour le client
    if (utilisateur_id) {
      const order = await OrderModel.findById(orderId);
      await NotificationModel.create({
        commande_id: orderId,
        utilisateur_id,
        administrateur_id: null,
        type: 'commande_creee',
        message: `Votre commande N°${order.numero_commande} a été créée avec succès`
      });
    }

    const order = await OrderModel.findById(orderId);
    return this.enrichOrderWithPosition(order);
  }

  /**
   * Récupérer toutes les commandes
   */
  static async getAllOrders() {
    const orders = await OrderModel.findAll();
    return orders.map(order => this.enrichOrderWithPosition(order));
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  static async updateOrderStatus(id, statut, raisonAnnulation = null) {
    if (!VALID_STATUSES.includes(statut)) {
      throw new Error(`Statut invalide. Valeurs acceptées: ${VALID_STATUSES.join(', ')}`);
    }

    // Vérifier la commande existe et son statut actuel
    const currentOrder = await OrderModel.findById(id);
    if (!currentOrder) {
      throw new Error('Commande non trouvée');
    }

    // Valider la transition de statut
    const allowedTransitions = STATUS_TRANSITIONS[currentOrder.statut];
    if (!allowedTransitions.includes(statut)) {
      throw new Error(
        `Transition non autorisée: ${currentOrder.statut} → ${statut}. ` +
        `Transitions possibles: ${allowedTransitions.join(', ') || 'aucune (état final)'}`
      );
    }

    const updated = await OrderModel.updateStatus(id, statut, raisonAnnulation);
    
    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }

    // Créer notification selon le nouveau statut
    const order = await OrderModel.findById(id);
    if (order.utilisateur_id) {
      const notificationMessages = {
        'en_preparation': `Votre commande N°${order.numero_commande} est en cours de préparation`,
        'prete': `Votre commande N°${order.numero_commande} est prête ! Venez la récupérer`,
        'servie': `Votre commande N°${order.numero_commande} a été servie. Bon appétit !`,
        'retard_client': `Nous avons pris note de votre retard pour la commande N°${order.numero_commande}`,
        'annulee': `Votre commande N°${order.numero_commande} a été annulée${raisonAnnulation ? ': ' + raisonAnnulation : ''}`
      };

      const message = notificationMessages[statut];
      if (message) {
        await NotificationModel.create({
          commande_id: id,
          utilisateur_id: order.utilisateur_id,
          administrateur_id: null,
          type: `commande_${statut}`,
          message: `Statut de la commande: ${statut}`
        });
      }

      // Rembourser via Stripe si annulation
      if (statut === 'annulee') {
        try {
          // Récupérer le paiement pour obtenir le payment_intent_id
          const paiement = await PaymentModel.findByCommandeId(id);
          if (paiement && paiement.transaction_id) {
            // Effectuer le remboursement via Stripe
            await PaymentService.refundPayment(paiement.transaction_id);
          }
          // Marquer comme remboursé dans notre BDD
          await PaymentModel.refund(id);
        } catch (error) {
          console.error('Erreur remboursement Stripe:', error.message);
          // Marquer quand même comme remboursé localement
          await PaymentModel.refund(id);
        }
      } else if (statut === 'servie') {
        // Aucune action - déjà validé à la création
        await PaymentModel.validate(id);
      }
    }

    return this.enrichOrderWithPosition(order);
  }

  /**
   * Enrichir une commande avec position dans la file
   */
  static enrichOrderWithPosition(order) {
    // Calculer la position dans la file uniquement pour les commandes actives
    if (order.statut === 'en_attente' || order.statut === 'en_preparation') {
      order.position_file = null; // À calculer avec toutes les commandes
      order.temps_estime = ESTIMATED_TIME_PER_ORDER;
    } else {
      order.position_file = null;
      order.temps_estime = null;
    }
    
    return order;
  }

  /**
   * Calculer les positions dans la file d'attente
   */
  static async calculateQueuePositions() {
    const orders = await OrderModel.findAll();
    const activeOrders = orders.filter(o => 
      o.statut === 'en_attente' || o.statut === 'en_preparation'
    );

    return activeOrders.map((order, index) => ({
      ...order,
      position_file: index + 1,
      temps_estime: (index + 1) * ESTIMATED_TIME_PER_ORDER
    }));
  }

  /**
   * Récupérer les statistiques
   */
  static async getStats() {
    return await OrderModel.getStats();
  }
}

module.exports = OrderService;
