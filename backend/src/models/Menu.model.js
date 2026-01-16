// Menu Model - Gestion du catalogue des plats
const db = require('../config/database');

class MenuModel {
  /**
   * Créer un nouveau plat
   */
  static async create({ nom, description, categorie, prix, image_url, disponible = true }) {
    const [result] = await db.execute(
      `INSERT INTO menus (nom, description, categorie, prix, image_url, disponible) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, description || null, categorie, prix, image_url || null, disponible]
    );
    return result.insertId;
  }

  /**
   * Récupérer un plat par ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM menus WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupérer tous les plats
   */
  static async findAll(options = {}) {
    const { disponibleOnly = false, categorie = null } = options;
    
    let query = 'SELECT * FROM menus WHERE 1=1';
    const params = [];
    
    if (disponibleOnly) {
      query += ' AND disponible = TRUE';
    }
    
    if (categorie) {
      query += ' AND categorie = ?';
      params.push(categorie);
    }
    
    query += ' ORDER BY categorie, nom';
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  /**
   * Récupérer plats par catégorie
   */
  static async findByCategorie(categorie) {
    const [rows] = await db.execute(
      `SELECT * FROM menus WHERE categorie = ? AND disponible = TRUE ORDER BY nom`,
      [categorie]
    );
    return rows;
  }

  /**
   * Mettre à jour un plat
   */
  static async update(id, { nom, description, categorie, prix, image_url, disponible }) {
    const [result] = await db.execute(
      `UPDATE menus 
       SET nom = ?, description = ?, categorie = ?, prix = ?, image_url = ?, disponible = ? 
       WHERE id = ?`,
      [nom, description || null, categorie, prix, image_url || null, disponible, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Changer la disponibilité d'un plat
   */
  static async toggleDisponibilite(id, disponible) {
    const [result] = await db.execute(
      `UPDATE menus SET disponible = ? WHERE id = ?`,
      [disponible, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprimer un plat
   */
  static async delete(id) {
    const [result] = await db.execute(
      `DELETE FROM menus WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = MenuModel;
