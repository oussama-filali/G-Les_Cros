// Menu Controller - Gestion des endpoints menus
const MenuService = require('../services/Menu.service');

class MenuController {

  static async createMenu(req, res) {
    try {
      const menu = await MenuService.createMenu(req.body);
      req.io.emit('menu:created', menu);
      res.status(201).json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAllMenus(req, res) {
    try {
      const { disponible, categorie } = req.query;
      const filters = {};
      
      if (disponible === 'true') {
        filters.disponibleOnly = true;
      }
      
      if (categorie) {
        filters.categorie = categorie;
      }
      
      const menus = await MenuService.getAllMenus(filters);
      res.json(menus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMenuById(req, res) {
    try {
      const menu = await MenuService.getMenuById(req.params.id);
      res.json(menu);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateMenu(req, res) {
    try {
      const menu = await MenuService.updateMenu(req.params.id, req.body);
      req.io.emit('menu:updated', menu);
      res.json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async toggleDisponibilite(req, res) {
    try {
      const { disponible } = req.body;
      const menu = await MenuService.toggleDisponibilite(req.params.id, disponible);
      req.io.emit('menu:updated', menu);
      res.json(menu);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteMenu(req, res) {
    try {
      const result = await MenuService.deleteMenu(req.params.id);
      req.io.emit('menu:deleted', { id: req.params.id });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = MenuController;
