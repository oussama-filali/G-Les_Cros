const MenuService = require('../../src/services/Menu.service');
const MenuModel = require('../../src/models/Menu.model');

// Mock du modèle
jest.mock('../../src/models/Menu.model');

describe('MenuService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMenu', () => {
    
    test('devrait créer un menu avec succès', async () => {
      const menuData = {
        nom: 'Pizza Margherita',
        description: 'Pizza classique',
        categorie: 'plat',
        prix: 12.50,
        image_url: 'pizza.jpg',
        disponible: true
      };

      MenuModel.create.mockResolvedValue(1);
      MenuModel.findById.mockResolvedValue({
        id: 1,
        ...menuData
      });

      const result = await MenuService.createMenu(menuData);

      expect(MenuModel.create).toHaveBeenCalledWith(menuData);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('nom', 'Pizza Margherita');
    });

    test('devrait échouer si champs obligatoires manquants', async () => {
      const menuData = {
        nom: 'Pizza',
        description: 'Bonne pizza'
      };

      await expect(MenuService.createMenu(menuData))
        .rejects
        .toThrow('Nom, catégorie et prix sont obligatoires');
    });

    test('devrait échouer si catégorie invalide', async () => {
      const menuData = {
        nom: 'Pizza',
        categorie: 'invalide',
        prix: 12.50
      };

      await expect(MenuService.createMenu(menuData))
        .rejects
        .toThrow('Catégorie invalide');
    });

    test('devrait échouer si prix <= 0', async () => {
      const menuData = {
        nom: 'Pizza',
        categorie: 'plat',
        prix: -5
      };

      await expect(MenuService.createMenu(menuData))
        .rejects
        .toThrow('Le prix doit être supérieur à 0');
    });

    test('devrait définir disponible à true par défaut', async () => {
      const menuData = {
        nom: 'Pizza',
        categorie: 'plat',
        prix: 12.50
      };

      MenuModel.create.mockResolvedValue(1);
      MenuModel.findById.mockResolvedValue({ id: 1, disponible: true });

      await MenuService.createMenu(menuData);

      expect(MenuModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ disponible: true })
      );
    });
  });

  describe('getAllMenus', () => {
    
    test('devrait retourner tous les menus', async () => {
      const mockMenus = [
        { id: 1, nom: 'Pizza', categorie: 'plat', prix: 12.50 },
        { id: 2, nom: 'Salade', categorie: 'entree', prix: 8.00 }
      ];

      MenuModel.findAll.mockResolvedValue(mockMenus);

      const result = await MenuService.getAllMenus();

      expect(MenuModel.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(mockMenus);
      expect(result).toHaveLength(2);
    });

    test('devrait appliquer les filtres', async () => {
      const filters = { categorie: 'plat' };

      MenuModel.findAll.mockResolvedValue([]);

      await MenuService.getAllMenus(filters);

      expect(MenuModel.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('getAvailableMenus', () => {
    
    test('devrait retourner uniquement les menus disponibles', async () => {
      const mockMenus = [
        { id: 1, nom: 'Pizza', disponible: true },
        { id: 2, nom: 'Burger', disponible: true }
      ];

      MenuModel.findAll.mockResolvedValue(mockMenus);

      const result = await MenuService.getAvailableMenus();

      expect(MenuModel.findAll).toHaveBeenCalledWith({ disponibleOnly: true });
      expect(result).toEqual(mockMenus);
    });
  });

  describe('getMenuById', () => {
    
    test('devrait retourner un menu par ID', async () => {
      const mockMenu = { 
        id: 1, 
        nom: 'Pizza', 
        prix: 12.50 
      };

      MenuModel.findById.mockResolvedValue(mockMenu);

      const result = await MenuService.getMenuById(1);

      expect(MenuModel.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMenu);
    });

    test('devrait throw une erreur si menu introuvable', async () => {
      MenuModel.findById.mockResolvedValue(null);

      await expect(MenuService.getMenuById(999))
        .rejects
        .toThrow('Menu introuvable');
    });
  });
});
