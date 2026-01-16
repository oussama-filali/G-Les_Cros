// Menu Service - Logique métier pour les menus
const MenuModel = require('../models/Menu.model');

class MenuService {
  
  /**
   * Créer un nouveau plat
   */
  static async createMenu(menuData) {
    const { nom, description, categorie, prix, image_url, disponible } = menuData;

    if (!nom || !categorie || !prix) {
      throw new Error('Nom, catégorie et prix sont obligatoires');
    }

    const validCategories = ['entree', 'plat', 'dessert', 'boisson', 'menu_complet'];
    if (!validCategories.includes(categorie)) {
      throw new Error(`Catégorie invalide. Valeurs: ${validCategories.join(', ')}`);
    }

    if (prix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    const menuId = await MenuModel.create({
      nom,
      description,
      categorie,
      prix,
      image_url,
      disponible: disponible !== undefined ? disponible : true
    });

    return await MenuModel.findById(menuId);
  }

  /**
   * Récupérer tous les menus (avec filtres optionnels)
   */
  static async getAllMenus(filters = {}) {
    return await MenuModel.findAll(filters);
  }

  /**
   * Récupérer les menus disponibles (pour les clients)
   */
  static async getAvailableMenus() {
    return await MenuModel.findAll({ disponibleOnly: true });
  }

  /**
   * Récupérer un menu par ID
   */
  static async getMenuById(id) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new Error('Menu introuvable');
    }
    return menu;
  }

  /**
   * Récupérer menus par catégorie
   */
  static async getMenusByCategorie(categorie) {
    const validCategories = ['entree', 'plat', 'dessert', 'boisson', 'menu_complet'];
    if (!validCategories.includes(categorie)) {
      throw new Error(`Catégorie invalide. Valeurs: ${validCategories.join(', ')}`);
    }
    return await MenuModel.findByCategorie(categorie);
  }

  /**
   * Mettre à jour un menu
   */
  static async updateMenu(id, menuData) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new Error('Menu introuvable');
    }

    const { nom, description, categorie, prix, image_url, disponible } = menuData;

    if (prix !== undefined && prix <= 0) {
      throw new Error('Le prix doit être supérieur à 0');
    }

    const validCategories = ['entree', 'plat', 'dessert', 'boisson', 'menu_complet'];
    if (categorie && !validCategories.includes(categorie)) {
      throw new Error(`Catégorie invalide. Valeurs: ${validCategories.join(', ')}`);
    }

    const updated = await MenuModel.update(id, {
      nom: nom || menu.nom,
      description: description !== undefined ? description : menu.description,
      categorie: categorie || menu.categorie,
      prix: prix !== undefined ? prix : menu.prix,
      image_url: image_url !== undefined ? image_url : menu.image_url,
      disponible: disponible !== undefined ? disponible : menu.disponible
    });

    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return await MenuModel.findById(id);
  }

  /**
   * Changer la disponibilité d'un menu
   */
  static async toggleDisponibilite(id, disponible) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new Error('Menu introuvable');
    }

    const updated = await MenuModel.toggleDisponibilite(id, disponible);
    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return await MenuModel.findById(id);
  }

  /**
   * Supprimer un menu
   */
  static async deleteMenu(id) {
    const menu = await MenuModel.findById(id);
    if (!menu) {
      throw new Error('Menu introuvable');
    }

    const deleted = await MenuModel.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression');
    }

    return { message: 'Menu supprimé avec succès' };
  }
}

module.exports = MenuService;
