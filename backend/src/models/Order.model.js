const pool = require('../config/database');

class OrderModel {
  
  /**
   * Générer le prochain numéro de commande
   */
  static async getNextOrderNumber() {
    const [rows] = await pool.execute(
      'SELECT MAX(numero_commande) as max_num FROM commandes'
    );
    const maxNum = rows[0].max_num || 1000; // Commence à 1001
    return maxNum + 1;
  }

  /**
   * Créer une nouvelle commande avec items
   */
  static async create(orderData) {
    const { utilisateur_id, items, prix_total } = orderData;
    
    // Générer automatiquement le numéro de commande
    const numero_commande = await this.getNextOrderNumber();
    
    // Démarrer une transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 1. Créer la commande
      const [result] = await connection.execute(
        `INSERT INTO commandes (utilisateur_id, numero_commande, prix_total, statut) 
         VALUES (?, ?, ?, ?)`,
        [utilisateur_id || null, numero_commande, prix_total, 'en_attente']
      );
      const commandeId = result.insertId;
      
      // 2. Insérer les items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO commande_items (commande_id, menu_id, nom_article, quantite, prix_unitaire) 
           VALUES (?, ?, ?, ?, ?)`,
          [commandeId, item.menu_id || null, item.nom, item.quantite, item.prix]
        );
      }
      
      await connection.commit();
      return commandeId;
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Récupérer toutes les commandes avec leurs items
   */
  static async findAll() {
    const [commandes] = await pool.execute(
      `SELECT c.*, u.nom as client_nom, u.prenom as client_prenom 
       FROM commandes c 
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id 
       ORDER BY c.cree_le ASC`
    );
    
    // Récupérer les items pour chaque commande
    for (const commande of commandes) {
      const [items] = await pool.execute(
        `SELECT * FROM commande_items WHERE commande_id = ?`,
        [commande.id]
      );
      commande.items = items;
    }
    
    return commandes;
  }

  /**
   * Récupérer une commande par ID avec ses items
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT c.*, u.nom as client_nom, u.prenom as client_prenom 
       FROM commandes c 
       LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id 
       WHERE c.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const commande = rows[0];
    
    // Récupérer les items
    const [items] = await pool.execute(
      `SELECT * FROM commande_items WHERE commande_id = ?`,
      [id]
    );
    commande.items = items;
    
    return commande;
  }

  /**
   * Mettre à jour le statut d'une commande
   */
  static async updateStatus(id, statut, raisonAnnulation = null) {
    const fields = ['statut = ?', 'raison_annulation = ?'];
    const values = [statut, raisonAnnulation];
    
    // Si statut = servie, enregistrer l'heure de service
    if (statut === 'servie') {
      fields.push('servie_le = NOW()');
    }
    
    values.push(id);
    
    const [result] = await pool.execute(
      `UPDATE commandes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * Récupérer les statistiques quotidiennes
   */
  static async getStats() {
    const [rows] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) as annulees,
        SUM(CASE WHEN statut = 'retard_client' THEN 1 ELSE 0 END) as retards_client,
        SUM(CASE WHEN statut = 'prete' THEN 1 ELSE 0 END) as au_pass_chaud,
        SUM(CASE WHEN statut = 'servie' THEN 1 ELSE 0 END) as servies,
        SUM(CASE WHEN statut = 'annulee' THEN prix_total ELSE 0 END) as pertes_totales
      FROM commandes
      WHERE DATE(cree_le) = CURDATE()
    `);
    return rows[0];
  }
}

module.exports = OrderModel;
