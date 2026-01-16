const OrderService = require('../services/Order.service');

class OrderController {

  static async createOrder(req, res) {
    try {
      const order = await OrderService.createOrder(req.body);
      
      // Émettre événement Socket.io
      req.io.emit('order:created', order);
      req.io.emit('queue:updated', await OrderService.calculateQueuePositions());
      
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      
      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { statut, raison_annulation } = req.body;
      
      const order = await OrderService.updateOrderStatus(
        parseInt(id), 
        statut, 
        raison_annulation
      );
      
      // Émettre événement Socket.io
      req.io.emit('order:updated', order);
      req.io.emit('queue:updated', await OrderService.calculateQueuePositions());
      
      res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await OrderService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = OrderController;
