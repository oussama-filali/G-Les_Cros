// Payment Model - Gestion des paiements
const db = require('../config/database');

class PaymentModel {
  /**
   * Créer un paiement
   */
  static async create({ commande_id, montant, methode, transaction_id = null }) {
    const [result] = await db.execute(
      `INSERT INTO paiements (commande_id, montant, methode, transaction_id, statut) 
       VALUES (?, ?, ?, ?, 'en_attente')`,
      [commande_id, montant, methode, transaction_id]
    );
    return result.insertId;
  }

  /**
   * Récupérer un paiement par ID
   */
  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT * FROM paiements WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  /**
   * Récupérer un paiement par commande_id
   */
  static async findByCommandeId(commande_id) {
    const [rows] = await db.execute(
      `SELECT * FROM paiements WHERE commande_id = ?`,
      [commande_id]
    );
    return rows[0];
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  static async updateStatus(id, statut) {
    const [result] = await db.execute(
      `UPDATE paiements SET statut = ? WHERE id = ?`,
      [statut, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Valider un paiement
   */
  static async validate(commande_id, transaction_id = null) {
    const [result] = await db.execute(
      `UPDATE paiements 
       SET statut = 'valide', transaction_id = ? 
       WHERE commande_id = ?`,
      [transaction_id, commande_id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Marquer un paiement comme échoué
   */
  static async markFailed(commande_id) {
    const [result] = await db.execute(
      `UPDATE paiements SET statut = 'echoue' WHERE commande_id = ?`,
      [commande_id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Rembourser un paiement
   */
  static async refund(commande_id) {
    const [result] = await db.execute(
      `UPDATE paiements SET statut = 'rembourse' WHERE commande_id = ?`,
      [commande_id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = PaymentModel;
