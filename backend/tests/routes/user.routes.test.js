const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/routes/user.routes');
const UserController = require('../../src/controllers/User.controller');

// Mock du controller
jest.mock('../../src/controllers/User.controller');

// Créer une app Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    
    test('devrait appeler UserController.createUser', async () => {
      UserController.createUser.mockImplementation((req, res) => {
        res.status(201).json({
          id: 1,
          nom: 'Dupont',
          email: 'jean@example.com'
        });
      });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean@example.com',
          mot_de_passe: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(UserController.createUser).toHaveBeenCalled();
    });
  });

  describe('POST /api/users/login', () => {
    
    test('devrait appeler UserController.authenticate', async () => {
      UserController.authenticate.mockImplementation((req, res) => {
        res.json({
          message: 'Authentification réussie',
          user: { id: 1, nom: 'Dupont' }
        });
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'jean@example.com',
          mot_de_passe: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(UserController.authenticate).toHaveBeenCalled();
    });
  });

  describe('GET /api/users', () => {
    
    test('devrait appeler UserController.getAllUsers', async () => {
      UserController.getAllUsers.mockImplementation((req, res) => {
        res.json([
          { id: 1, nom: 'Dupont' },
          { id: 2, nom: 'Martin' }
        ]);
      });

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(UserController.getAllUsers).toHaveBeenCalled();
    });
  });

  describe('GET /api/users/:id', () => {
    
    test('devrait appeler UserController.getUserById', async () => {
      UserController.getUserById.mockImplementation((req, res) => {
        res.json({ id: 1, nom: 'Dupont' });
      });

      const response = await request(app)
        .get('/api/users/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(UserController.getUserById).toHaveBeenCalled();
    });
  });

  describe('PUT /api/users/:id', () => {
    
    test('devrait appeler UserController.updateUser', async () => {
      UserController.updateUser.mockImplementation((req, res) => {
        res.json({ id: 1, nom: 'Nouveau Nom' });
      });

      const response = await request(app)
        .put('/api/users/1')
        .send({ nom: 'Nouveau Nom' });

      expect(response.status).toBe(200);
      expect(UserController.updateUser).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/users/:id', () => {
    
    test('devrait appeler UserController.deleteUser', async () => {
      UserController.deleteUser.mockImplementation((req, res) => {
        res.json({ message: 'Utilisateur supprimé' });
      });

      const response = await request(app)
        .delete('/api/users/1');

      expect(response.status).toBe(200);
      expect(UserController.deleteUser).toHaveBeenCalled();
    });
  });
});
