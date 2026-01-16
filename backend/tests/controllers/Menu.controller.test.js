const MenuController = require('../../src/controllers/Menu.controller');
const MenuService = require('../../src/services/Menu.service');

// Mock du service
jest.mock('../../src/services/Menu.service');

describe('MenuController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      params: {},
      query: {},
      io: {
        emit: jest.fn()
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('createMenu', () => {
    
    test('devrait créer un menu avec succès', async () => {
      const menuData = {
        nom: 'Pizza',
        categorie: 'plat',
        prix: 12.50
      };

      const mockMenu = { id: 1, ...menuData };
      req.body = menuData;

      MenuService.createMenu.mockResolvedValue(mockMenu);

      await MenuController.createMenu(req, res);

      expect(MenuService.createMenu).toHaveBeenCalledWith(menuData);
      expect(req.io.emit).toHaveBeenCalledWith('menu:created', mockMenu);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMenu);
    });

    test('devrait retourner erreur 400 si données invalides', async () => {
      req.body = { nom: 'Pizza' };

      MenuService.createMenu.mockRejectedValue(
        new Error('Prix requis')
      );

      await MenuController.createMenu(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Prix requis' });
    });
  });

  describe('getAllMenus', () => {
    
    test('devrait retourner tous les menus', async () => {
      const mockMenus = [
        { id: 1, nom: 'Pizza', prix: 12.50 },
        { id: 2, nom: 'Burger', prix: 10.00 }
      ];

      MenuService.getAllMenus.mockResolvedValue(mockMenus);

      await MenuController.getAllMenus(req, res);

      expect(MenuService.getAllMenus).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockMenus);
    });
  });

  describe('getMenuById', () => {
    
    test('devrait retourner un menu par ID', async () => {
      req.params.id = '1';
      const mockMenu = { id: 1, nom: 'Pizza', prix: 12.50 };

      MenuService.getMenuById.mockResolvedValue(mockMenu);

      await MenuController.getMenuById(req, res);

      expect(MenuService.getMenuById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockMenu);
    });

    test('devrait retourner erreur 404 si menu introuvable', async () => {
      req.params.id = '999';

      MenuService.getMenuById.mockRejectedValue(
        new Error('Menu introuvable')
      );

      await MenuController.getMenuById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Menu introuvable'
      });
    });
  });

  describe('updateMenu', () => {
    
    test('devrait mettre à jour un menu', async () => {
      req.params.id = '1';
      req.body = { prix: 15.00 };

      const mockUpdatedMenu = {
        id: 1,
        nom: 'Pizza',
        prix: 15.00
      };

      MenuService.updateMenu.mockResolvedValue(mockUpdatedMenu);

      await MenuController.updateMenu(req, res);

      expect(MenuService.updateMenu).toHaveBeenCalledWith('1', req.body);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMenu);
    });
  });

  describe('deleteMenu', () => {
    
    test('devrait supprimer un menu', async () => {
      req.params.id = '1';

      MenuService.deleteMenu.mockResolvedValue(true);

      await MenuController.deleteMenu(req, res);

      expect(MenuService.deleteMenu).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Menu supprimé avec succès'
      });
    });
  });
});
