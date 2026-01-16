// Admin Model - Gestion des administrateurs
const db = require('../config/database');

class AdminModel {
  /**
   * Créer un administrateur
   */
  static async create({ nom, prenom, email, mot_de_passe, role = 'serveur' }) {
    const [result] = await db.execute(
      `INSERT INTO administrateurs (nom, prenom, email, mot_de_passe, role) 
       VALUES (?, ?, ?, ?, ?)`,
      [nom, prenom, email, mot_de_passe, role]
    );
    return result.insertId;
  }

  /**
   * Récupérer un admin par ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, nom, prenom, email, role, actif, cree_le, modifie_le 
       FROM administrateurs WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupérer un admin par email
   */
  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT * FROM administrateurs WHERE email = ?`,
      [email]
    );
    return rows[0];
  }

  /**
   * Récupérer tous les admins actifs
   */
  static async findAll(includeInactive = false) {
    const query = includeInactive 
      ? `SELECT id, nom, prenom, email, role, actif, cree_le FROM administrateurs ORDER BY cree_le DESC`
      : `SELECT id, nom, prenom, email, role, actif, cree_le FROM administrateurs WHERE actif = TRUE ORDER BY cree_le DESC`;
    
    const [rows] = await db.execute(query);
    return rows;
  }

  /**
   * Mettre à jour un admin
   */
  static async update(id, { nom, prenom, email, role, actif }) {
    const [result] = await db.execute(
      `UPDATE administrateurs 
       SET nom = ?, prenom = ?, email = ?, role = ?, actif = ? 
       WHERE id = ?`,
      [nom, prenom, email, role, actif, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Désactiver un admin
   */
  static async deactivate(id) {
    const [result] = await db.execute(
      `UPDATE administrateurs SET actif = FALSE WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = AdminModel;
