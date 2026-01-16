// User Model - Gestion des clients
const db = require('../config/database');

class UserModel {
  /**
   * Créer un nouvel utilisateur
   */
  static async create({ nom, prenom, email, telephone, mot_de_passe }) {
    const [result] = await db.execute(
      `INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe) 
       VALUES (?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone || null, mot_de_passe]
    );
    return result.insertId;
  }

  /**
   * Récupérer un utilisateur par ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, nom, prenom, email, telephone, cree_le, modifie_le 
       FROM utilisateurs WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupérer un utilisateur par email
   */
  static async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT * FROM utilisateurs WHERE email = ?`,
      [email]
    );
    return rows[0];
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async findAll() {
    const [rows] = await db.execute(
      `SELECT id, nom, prenom, email, telephone, cree_le, modifie_le 
       FROM utilisateurs 
       ORDER BY cree_le DESC`
    );
    return rows;
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async update(id, { nom, prenom, email, telephone }) {
    const [result] = await db.execute(
      `UPDATE utilisateurs 
       SET nom = ?, prenom = ?, email = ?, telephone = ? 
       WHERE id = ?`,
      [nom, prenom, email, telephone || null, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Supprimer un utilisateur
   */
  static async delete(id) {
    const [result] = await db.execute(
      `DELETE FROM utilisateurs WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;
