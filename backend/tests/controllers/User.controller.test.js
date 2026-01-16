const UserController = require('../../src/controllers/User.controller');
const UserService = require('../../src/services/User.service');

// Mock du service
jest.mock('../../src/services/User.service');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock request et response
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

  describe('createUser', () => {
    
    test('devrait créer un utilisateur avec succès', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean@example.com',
        mot_de_passe: 'password123'
      };

      const mockUser = { id: 1, ...userData };
      req.body = userData;

      UserService.createUser.mockResolvedValue(mockUser);

      await UserController.createUser(req, res);

      expect(UserService.createUser).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('devrait retourner erreur 400 si données invalides', async () => {
      req.body = { nom: 'Dupont' };

      UserService.createUser.mockRejectedValue(new Error('Email requis'));

      await UserController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email requis' });
    });
  });

  describe('authenticate', () => {
    
    test('devrait authentifier un utilisateur avec succès', async () => {
      req.body = {
        email: 'jean@example.com',
        mot_de_passe: 'password123'
      };

      const mockUser = { id: 1, nom: 'Dupont', email: 'jean@example.com' };
      UserService.authenticate.mockResolvedValue(mockUser);

      await UserController.authenticate(req, res);

      expect(UserService.authenticate).toHaveBeenCalledWith(
        'jean@example.com',
        'password123'
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentification réussie',
        user: mockUser
      });
    });

    test('devrait retourner erreur 400 si email ou mot de passe manquant', async () => {
      req.body = { email: 'jean@example.com' };

      await UserController.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email et mot de passe requis'
      });
    });

    test('devrait retourner erreur 401 si authentification échoue', async () => {
      req.body = {
        email: 'jean@example.com',
        mot_de_passe: 'wrong'
      };

      UserService.authenticate.mockRejectedValue(
        new Error('Identifiants invalides')
      );

      await UserController.authenticate(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Identifiants invalides'
      });
    });
  });

  describe('getAllUsers', () => {
    
    test('devrait retourner tous les utilisateurs', async () => {
      const mockUsers = [
        { id: 1, nom: 'Dupont', email: 'jean@example.com' },
        { id: 2, nom: 'Martin', email: 'marie@example.com' }
      ];

      UserService.getAllUsers.mockResolvedValue(mockUsers);

      await UserController.getAllUsers(req, res);

      expect(UserService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test('devrait retourner erreur 500 si échec', async () => {
      UserService.getAllUsers.mockRejectedValue(
        new Error('Erreur serveur')
      );

      await UserController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Erreur serveur'
      });
    });
  });

  describe('getUserById', () => {
    
    test('devrait retourner un utilisateur par ID', async () => {
      req.params.id = '1';
      const mockUser = { id: 1, nom: 'Dupont', email: 'jean@example.com' };

      UserService.getUserById.mockResolvedValue(mockUser);

      await UserController.getUserById(req, res);

      expect(UserService.getUserById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('devrait retourner erreur 404 si utilisateur introuvable', async () => {
      req.params.id = '999';

      UserService.getUserById.mockRejectedValue(
        new Error('Utilisateur introuvable')
      );

      await UserController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Utilisateur introuvable'
      });
    });
  });

  describe('updateUser', () => {
    
    test('devrait mettre à jour un utilisateur', async () => {
      req.params.id = '1';
      req.body = { nom: 'Nouveau Nom' };

      const mockUpdatedUser = {
        id: 1,
        nom: 'Nouveau Nom',
        email: 'jean@example.com'
      };

      UserService.updateUser.mockResolvedValue(mockUpdatedUser);

      await UserController.updateUser(req, res);

      expect(UserService.updateUser).toHaveBeenCalledWith('1', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });
});
