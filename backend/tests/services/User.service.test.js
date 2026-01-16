const UserService = require('../../src/services/User.service');
const UserModel = require('../../src/models/User.model');
const bcrypt = require('bcrypt');

// Mock des dépendances
jest.mock('../../src/models/User.model');
jest.mock('bcrypt');

describe('UserService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    
    test('devrait créer un utilisateur avec succès', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephone: '0612345678',
        mot_de_passe: 'password123'
      };

      UserModel.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      UserModel.create.mockResolvedValue(1);
      UserModel.findById.mockResolvedValue({
        id: 1,
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        telephone: '0612345678'
      });

      const result = await UserService.createUser(userData);

      expect(UserModel.findByEmail).toHaveBeenCalledWith('jean.dupont@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(UserModel.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).not.toHaveProperty('mot_de_passe');
    });

    test('devrait échouer si email existe déjà', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'password123'
      };

      UserModel.findByEmail.mockResolvedValue({ id: 1 });

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Cet email est déjà utilisé');
    });

    test('devrait échouer si email invalide', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'email-invalide',
        mot_de_passe: 'password123'
      };

      UserModel.findByEmail.mockResolvedValue(null);

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Format d\'email invalide');
    });

    test('devrait échouer si champs obligatoires manquants', async () => {
      const userData = {
        nom: 'Dupont',
        prenom: 'Jean'
      };

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Nom, prénom, email et mot de passe sont obligatoires');
    });
  });

  describe('getAllUsers', () => {
    
    test('devrait retourner tous les utilisateurs', async () => {
      const mockUsers = [
        { id: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean@example.com' },
        { id: 2, nom: 'Martin', prenom: 'Marie', email: 'marie@example.com' }
      ];

      UserModel.findAll.mockResolvedValue(mockUsers);

      const result = await UserService.getAllUsers();

      expect(UserModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });

  describe('getUserById', () => {
    
    test('devrait retourner un utilisateur par ID', async () => {
      const mockUser = { 
        id: 1, 
        nom: 'Dupont', 
        prenom: 'Jean', 
        email: 'jean@example.com' 
      };

      UserModel.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserById(1);

      expect(UserModel.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    test('devrait throw une erreur si utilisateur introuvable', async () => {
      UserModel.findById.mockResolvedValue(null);

      await expect(UserService.getUserById(999))
        .rejects
        .toThrow('Utilisateur introuvable');
    });
  });
});
