-- ============================================
-- GLESCROS - CRÉATION BASE DE DONNÉES
-- Version: 1.0
-- Date: 18 Décembre 2025
-- ============================================

-- Supprimer la base si elle existe (DEV ONLY)
DROP DATABASE IF EXISTS glescros;

-- Créer la base de données
CREATE DATABASE glescros 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE glescros;

-- ============================================
-- TABLE: orders
-- Description: Gestion des commandes restaurant
-- ============================================
CREATE TABLE orders (
  -- Identifiant unique
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Numéro de commande (visible client)
  order_number INT NOT NULL UNIQUE,
  
  -- Statut de la commande
  status ENUM(
    'waiting',      -- En attente de préparation
    'preparing',    -- En cours de préparation
    'ready',        -- Prête à être servie
    'delayed',      -- Retardée (rupture stock, etc.)
    'cancelled'     -- Annulée
  ) NOT NULL DEFAULT 'waiting',
  
  -- Prix de la commande
  price DECIMAL(6,2) NOT NULL,
  
  -- Raison du retard (optionnel)
  delay_reason VARCHAR(255) DEFAULT NULL,
  
  -- Horodatage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Index pour optimiser les requêtes
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_order_number (order_number)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UTILISATEUR APPLICATION
-- ============================================
-- Supprimer l'utilisateur s'il existe
DROP USER IF EXISTS 'glescros_user'@'localhost';

-- Créer utilisateur avec mot de passe fort
CREATE USER 'glescros_user'@'localhost' 
  IDENTIFIED BY 'glescros2025!';

-- Accorder permissions (CRUD uniquement, pas de DDL)
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON glescros.* 
  TO 'glescros_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- ============================================
-- DONNÉES DE TEST
-- ============================================
INSERT INTO orders (order_number, price, status) VALUES
  (1001, 15.50, 'waiting'),
  (1002, 22.00, 'preparing'),
  (1003, 18.75, 'ready'),
  (1004, 12.00, 'waiting'),
  (1005, 25.50, 'delayed');

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Afficher toutes les commandes
SELECT * FROM orders ORDER BY created_at DESC;

-- Afficher les statistiques
SELECT 
  COUNT(*) as total_commandes,
  SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as en_attente,
  SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as en_preparation,
  SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as pretes,
  SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as retardees,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as annulees,
  SUM(price) as chiffre_affaires_total
FROM orders;

-- ============================================
-- REQUÊTES UTILES
-- ============================================

-- File d'attente (commandes actives seulement)
-- SELECT * FROM orders 
-- WHERE status IN ('waiting', 'preparing') 
-- ORDER BY created_at ASC;

-- Statistiques du jour
-- SELECT 
--   COUNT(*) as total,
--   SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
--   SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) as delayed_count,
--   SUM(CASE WHEN status = 'cancelled' THEN price ELSE 0 END) as lost_revenue
-- FROM orders
-- WHERE DATE(created_at) = CURDATE();

-- Chercher une commande par numéro
-- SELECT * FROM orders WHERE order_number = 1001;

-- Mettre à jour le statut
-- UPDATE orders SET status = 'preparing' WHERE id = 1;

-- Annuler une commande avec raison
-- UPDATE orders 
-- SET status = 'cancelled', delay_reason = 'Client absent' 
-- WHERE id = 1;
