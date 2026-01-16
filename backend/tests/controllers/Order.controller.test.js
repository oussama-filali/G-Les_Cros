const OrderController = require('../../src/controllers/Order.controller');
const OrderService = require('../../src/services/Order.service');

// Mock du service
jest.mock('../../src/services/Order.service');

describe('OrderController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createOrder', () => {
    
    test('devrait créer une commande avec succès', async () => {
      const orderData = {
        utilisateur_id: 1,
        payment_intent_id: 'pi_123456',
        items: [{ menu_id: 1, quantite: 2 }]
      };

      const mockOrder = {
        id: 1,
        ...orderData,
        statut: 'en_attente'
      };

      req.body = orderData;

      OrderService.createOrder.mockResolvedValue(mockOrder);

      await OrderController.createOrder(req, res);

      expect(OrderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    test('devrait retourner erreur 400 si données invalides', async () => {
      req.body = { items: [] };

      OrderService.createOrder.mockRejectedValue(
        new Error('Items requis')
      );

      await OrderController.createOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Items requis' });
    });
  });

  describe('getAllOrders', () => {
    
    test('devrait retourner toutes les commandes', async () => {
      const mockOrders = [
        { id: 1, utilisateur_id: 1, statut: 'en_attente' },
        { id: 2, utilisateur_id: 2, statut: 'en_preparation' }
      ];

      OrderService.getAllOrders.mockResolvedValue(mockOrders);

      await OrderController.getAllOrders(req, res);

      expect(OrderService.getAllOrders).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
  });

  describe('getOrderById', () => {
    
    test('devrait retourner une commande par ID', async () => {
      req.params.id = '1';
      const mockOrder = {
        id: 1,
        utilisateur_id: 1,
        statut: 'en_attente'
      };

      OrderService.getOrderById.mockResolvedValue(mockOrder);

      await OrderController.getOrderById(req, res);

      expect(OrderService.getOrderById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    test('devrait retourner erreur 404 si commande introuvable', async () => {
      req.params.id = '999';

      OrderService.getOrderById.mockRejectedValue(
        new Error('Commande introuvable')
      );

      await OrderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Commande introuvable'
      });
    });
  });

  describe('updateOrderStatus', () => {
    
    test('devrait mettre à jour le statut d\'une commande', async () => {
      req.params.id = '1';
      req.body = { statut: 'en_preparation' };

      const mockUpdatedOrder = {
        id: 1,
        statut: 'en_preparation'
      };

      OrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      await OrderController.updateOrderStatus(req, res);

      expect(OrderService.updateOrderStatus).toHaveBeenCalledWith(
        '1',
        'en_preparation'
      );
      expect(res.json).toHaveBeenCalledWith(mockUpdatedOrder);
    });

    test('devrait retourner erreur 400 si statut invalide', async () => {
      req.params.id = '1';
      req.body = { statut: 'invalide' };

      OrderService.updateOrderStatus.mockRejectedValue(
        new Error('Statut invalide')
      );

      await OrderController.updateOrderStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Statut invalide'
      });
    });
  });
});
