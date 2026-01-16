const request = require('supertest');
const express = require('express');
const orderRoutes = require('../../src/routes/order.routes');
const OrderController = require('../../src/controllers/Order.controller');

// Mock du controller
jest.mock('../../src/controllers/Order.controller');

// Créer une app Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders', () => {
    
    test('devrait appeler OrderController.createOrder', async () => {
      OrderController.createOrder.mockImplementation((req, res) => {
        res.status(201).json({
          id: 1,
          statut: 'en_attente',
          montant_total: 25.00
        });
      });

      const response = await request(app)
        .post('/api/orders')
        .send({
          utilisateur_id: 1,
          payment_intent_id: 'pi_123456',
          items: [{ menu_id: 1, quantite: 2 }]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(OrderController.createOrder).toHaveBeenCalled();
    });
  });

  describe('GET /api/orders', () => {
    
    test('devrait appeler OrderController.getAllOrders', async () => {
      OrderController.getAllOrders.mockImplementation((req, res) => {
        res.json([
          { id: 1, statut: 'en_attente' },
          { id: 2, statut: 'en_preparation' }
        ]);
      });

      const response = await request(app)
        .get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(OrderController.getAllOrders).toHaveBeenCalled();
    });
  });

  describe('GET /api/orders/active', () => {
    
    test('devrait appeler OrderController.getActiveOrders', async () => {
      OrderController.getActiveOrders.mockImplementation((req, res) => {
        res.json([
          { id: 1, statut: 'en_attente' },
          { id: 2, statut: 'en_preparation' }
        ]);
      });

      const response = await request(app)
        .get('/api/orders/active');

      expect(response.status).toBe(200);
      expect(OrderController.getActiveOrders).toHaveBeenCalled();
    });
  });

  describe('GET /api/orders/:id', () => {
    
    test('devrait appeler OrderController.getOrderById', async () => {
      OrderController.getOrderById.mockImplementation((req, res) => {
        res.json({ id: 1, statut: 'en_attente' });
      });

      const response = await request(app)
        .get('/api/orders/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(OrderController.getOrderById).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    
    test('devrait appeler OrderController.updateOrderStatus', async () => {
      OrderController.updateOrderStatus.mockImplementation((req, res) => {
        res.json({ id: 1, statut: 'en_preparation' });
      });

      const response = await request(app)
        .patch('/api/orders/1/status')
        .send({ statut: 'en_preparation' });

      expect(response.status).toBe(200);
      expect(OrderController.updateOrderStatus).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/orders/:id', () => {
    
    test('devrait appeler OrderController.deleteOrder', async () => {
      OrderController.deleteOrder.mockImplementation((req, res) => {
        res.json({ message: 'Commande annulée' });
      });

      const response = await request(app)
        .delete('/api/orders/1');

      expect(response.status).toBe(200);
      expect(OrderController.deleteOrder).toHaveBeenCalled();
    });
  });
});
