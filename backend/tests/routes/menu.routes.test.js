const request = require('supertest');
const express = require('express');
const menuRoutes = require('../../src/routes/menu.routes');
const MenuController = require('../../src/controllers/Menu.controller');

// Mock du controller
jest.mock('../../src/controllers/Menu.controller');

// Créer une app Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/menus', menuRoutes);

describe('Menu Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/menus', () => {
    
    test('devrait appeler MenuController.createMenu', async () => {
      MenuController.createMenu.mockImplementation((req, res) => {
        res.status(201).json({
          id: 1,
          nom: 'Pizza',
          prix: 12.50
        });
      });

      const response = await request(app)
        .post('/api/menus')
        .send({
          nom: 'Pizza',
          categorie: 'plat',
          prix: 12.50
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(MenuController.createMenu).toHaveBeenCalled();
    });
  });

  describe('GET /api/menus', () => {
    
    test('devrait appeler MenuController.getAllMenus', async () => {
      MenuController.getAllMenus.mockImplementation((req, res) => {
        res.json([
          { id: 1, nom: 'Pizza', prix: 12.50 },
          { id: 2, nom: 'Burger', prix: 10.00 }
        ]);
      });

      const response = await request(app)
        .get('/api/menus');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(MenuController.getAllMenus).toHaveBeenCalled();
    });
  });

  describe('GET /api/menus/available', () => {
    
    test('devrait appeler MenuController.getAvailableMenus', async () => {
      MenuController.getAvailableMenus.mockImplementation((req, res) => {
        res.json([
          { id: 1, nom: 'Pizza', disponible: true }
        ]);
      });

      const response = await request(app)
        .get('/api/menus/available');

      expect(response.status).toBe(200);
      expect(MenuController.getAvailableMenus).toHaveBeenCalled();
    });
  });

  describe('GET /api/menus/:id', () => {
    
    test('devrait appeler MenuController.getMenuById', async () => {
      MenuController.getMenuById.mockImplementation((req, res) => {
        res.json({ id: 1, nom: 'Pizza', prix: 12.50 });
      });

      const response = await request(app)
        .get('/api/menus/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(MenuController.getMenuById).toHaveBeenCalled();
    });
  });

  describe('PUT /api/menus/:id', () => {
    
    test('devrait appeler MenuController.updateMenu', async () => {
      MenuController.updateMenu.mockImplementation((req, res) => {
        res.json({ id: 1, prix: 15.00 });
      });

      const response = await request(app)
        .put('/api/menus/1')
        .send({ prix: 15.00 });

      expect(response.status).toBe(200);
      expect(MenuController.updateMenu).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/menus/:id', () => {
    
    test('devrait appeler MenuController.deleteMenu', async () => {
      MenuController.deleteMenu.mockImplementation((req, res) => {
        res.json({ message: 'Menu supprimé' });
      });

      const response = await request(app)
        .delete('/api/menus/1');

      expect(response.status).toBe(200);
      expect(MenuController.deleteMenu).toHaveBeenCalled();
    });
  });
});
