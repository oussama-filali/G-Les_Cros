require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const setupOrderSocket = require('./sockets/order.socket');

const PORT = process.env.PORT || 3000;

// Créer serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

// Rendre io accessible dans l'app
app.set('io', io);

// Setup socket handlers
setupOrderSocket(io);

// Démarrer serveur
server.listen(PORT, () => {
  console.log(`
🚀 Serveur démarré
📡 API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
  `);
});
