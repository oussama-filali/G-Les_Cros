// Notification Model - Gestion des notifications
const db = require('../config/database');

class NotificationModel {
  /**
   * Créer une notification
   */
  static async create({ commande_id, utilisateur_id, administrateur_id, type, message }) {
    const [result] = await db.execute(
      `INSERT INTO notifications (commande_id, utilisateur_id, administrateur_id, type, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [commande_id, utilisateur_id || null, administrateur_id || null, type, message]
    );
    return result.insertId;
  }

  /**
   * Récupérer une notification par ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  static async findByUserId(utilisateur_id, unreadOnly = false) {
    const query = unreadOnly
      ? `SELECT n.*, c.numero_commande 
         FROM notifications n
         LEFT JOIN commandes c ON n.commande_id = c.id
         WHERE n.utilisateur_id = ? AND n.lue = FALSE 
         ORDER BY n.cree_le DESC`
      : `SELECT n.*, c.numero_commande 
         FROM notifications n
         LEFT JOIN commandes c ON n.commande_id = c.id
         WHERE n.utilisateur_id = ? 
         ORDER BY n.cree_le DESC`;
    
    const [rows] = await db.execute(query, [utilisateur_id]);
    return rows;
  }

  /**
   * Récupérer les notifications d'un admin
   */
  static async findByAdminId(administrateur_id, unreadOnly = false) {
    const query = unreadOnly
      ? `SELECT n.*, c.numero_commande 
         FROM notifications n
         LEFT JOIN commandes c ON n.commande_id = c.id
         WHERE n.administrateur_id = ? AND n.lue = FALSE 
         ORDER BY n.cree_le DESC`
      : `SELECT n.*, c.numero_commande 
         FROM notifications n
         LEFT JOIN commandes c ON n.commande_id = c.id
         WHERE n.administrateur_id = ? 
         ORDER BY n.cree_le DESC`;
    
    const [rows] = await db.execute(query, [administrateur_id]);
    return rows;
  }

  /**
   * Récupérer les notifications d'une commande
   */
  static async findByCommandeId(commande_id) {
    const [rows] = await db.execute(
      `SELECT * FROM notifications WHERE commande_id = ? ORDER BY cree_le DESC`,
      [commande_id]
    );
    return rows;
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(id) {
    const [result] = await db.execute(
      `UPDATE notifications SET lue = TRUE WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  static async markAllAsReadForUser(utilisateur_id) {
    const [result] = await db.execute(
      `UPDATE notifications SET lue = TRUE WHERE utilisateur_id = ?`,
      [utilisateur_id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   */
  static async countUnreadForUser(utilisateur_id) {
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE utilisateur_id = ? AND lue = FALSE`,
      [utilisateur_id]
    );
    return rows[0].count;
  }
}

module.exports = NotificationModel;
