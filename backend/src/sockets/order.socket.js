const OrderService = require('../services/Order.service');

function setupOrderSocket(io) {
  
  io.on('connection', (socket) => {
    console.log('✅ Client connecté:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté:', socket.id);
    });

    // Client demande la file d'attente
    socket.on('get:queue', async () => {
      try {
        const queue = await OrderService.calculateQueuePositions();
        socket.emit('queue:updated', queue);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Client demande les stats
    socket.on('get:stats', async () => {
      try {
        const stats = await OrderService.getStats();
        socket.emit('stats:updated', stats);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
  });
}

module.exports = setupOrderSocket;
