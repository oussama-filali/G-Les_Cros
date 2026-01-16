const { Server } = require('socket.io');
const { createServer } = require('http');
const Client = require('socket.io-client');
const setupOrderSocket = require('../../src/sockets/order.socket');
const OrderService = require('../../src/services/Order.service');

// Mock du service
jest.mock('../../src/services/Order.service');

describe('Order Socket', () => {
  let io, serverSocket, clientSocket;
  let httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    
    // Setup socket handler
    setupOrderSocket(io);
    
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = Client(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection', () => {
    
    test('devrait connecter un client', (done) => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    test('devrait avoir un ID de socket', () => {
      expect(clientSocket.id).toBeDefined();
    });
  });

  describe('Event: get:queue', () => {
    
    test('devrait émettre queue:updated avec les données', (done) => {
      const mockQueue = [
        { id: 1, numero: 1, temps_attente: 15 },
        { id: 2, numero: 2, temps_attente: 30 }
      ];

      OrderService.calculateQueuePositions.mockResolvedValue(mockQueue);

      clientSocket.emit('get:queue');

      clientSocket.on('queue:updated', (data) => {
        expect(data).toEqual(mockQueue);
        expect(OrderService.calculateQueuePositions).toHaveBeenCalled();
        done();
      });
    });

    test('devrait émettre error en cas d\'échec', (done) => {
      OrderService.calculateQueuePositions.mockRejectedValue(
        new Error('Erreur de calcul')
      );

      clientSocket.emit('get:queue');

      clientSocket.on('error', (data) => {
        expect(data).toHaveProperty('message', 'Erreur de calcul');
        done();
      });
    });
  });

  describe('Event: get:stats', () => {
    
    test('devrait émettre stats:updated avec les statistiques', (done) => {
      const mockStats = {
        total_commandes: 50,
        commandes_actives: 10,
        temps_moyen: 20
      };

      OrderService.getStats.mockResolvedValue(mockStats);

      clientSocket.emit('get:stats');

      clientSocket.on('stats:updated', (data) => {
        expect(data).toEqual(mockStats);
        expect(OrderService.getStats).toHaveBeenCalled();
        done();
      });
    });

    test('devrait émettre error en cas d\'échec', (done) => {
      OrderService.getStats.mockRejectedValue(
        new Error('Erreur stats')
      );

      clientSocket.emit('get:stats');

      clientSocket.on('error', (data) => {
        expect(data).toHaveProperty('message', 'Erreur stats');
        done();
      });
    });
  });

  describe('Disconnection', () => {
    
    test('devrait gérer la déconnexion', (done) => {
      const tempClient = Client(`http://localhost:${httpServer.address().port}`);
      
      tempClient.on('connect', () => {
        expect(tempClient.connected).toBe(true);
        tempClient.disconnect();
        
        setTimeout(() => {
          expect(tempClient.connected).toBe(false);
          done();
        }, 100);
      });
    });
  });

  describe('Broadcasting', () => {
    
    test('devrait broadcaster queue:updated à tous les clients', (done) => {
      const mockQueue = [{ id: 1, numero: 1 }];
      
      // Simuler un broadcast depuis le serveur
      io.emit('queue:updated', mockQueue);

      clientSocket.on('queue:updated', (data) => {
        expect(data).toEqual(mockQueue);
        done();
      });
    });

    test('devrait broadcaster order:created à tous les clients', (done) => {
      const mockOrder = {
        id: 1,
        utilisateur_id: 1,
        statut: 'en_attente'
      };
      
      io.emit('order:created', mockOrder);

      clientSocket.on('order:created', (data) => {
        expect(data).toEqual(mockOrder);
        done();
      });
    });

    test('devrait broadcaster order:status_updated', (done) => {
      const mockUpdate = {
        order_id: 1,
        ancien_statut: 'en_attente',
        nouveau_statut: 'en_preparation'
      };
      
      io.emit('order:status_updated', mockUpdate);

      clientSocket.on('order:status_updated', (data) => {
        expect(data).toEqual(mockUpdate);
        expect(data).toHaveProperty('nouveau_statut', 'en_preparation');
        done();
      });
    });
  });
});
