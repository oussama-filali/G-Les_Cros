-- =============================================================================
-- BASE DE DONNÉES - GLesCrocs
-- Gestion de file d'attente de commandes restaurant
-- =============================================================================

DROP DATABASE IF EXISTS glescros_db;
CREATE DATABASE glescros_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE glescros_db;

-- =============================================================================
-- TABLE: UTILISATEURS (Clients)
-- =============================================================================
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20),
    mot_de_passe VARCHAR(255) NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: ADMINISTRATEURS (Personnel Restaurant)
-- =============================================================================
CREATE TABLE administrateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('gerant', 'cuisinier', 'serveur') NOT NULL DEFAULT 'serveur',
    actif BOOLEAN DEFAULT TRUE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: MENUS (Catalogue des plats)
-- =============================================================================
CREATE TABLE menus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    categorie ENUM('entree', 'plat', 'dessert', 'boisson', 'menu_complet') NOT NULL,
    prix DECIMAL(6,2) NOT NULL,
    image_url VARCHAR(500),
    disponible BOOLEAN DEFAULT TRUE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categorie (categorie),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: COMMANDES
-- =============================================================================
CREATE TABLE commandes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id INT,
    numero_commande INT UNIQUE NOT NULL,
    statut ENUM(
        'en_attente',
        'en_preparation', 
        'prete',
        'retard_client',
        'servie',
        'annulee'
    ) NOT NULL DEFAULT 'en_attente',
    prix_total DECIMAL(8,2) NOT NULL,
    raison_annulation VARCHAR(255),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    servie_le TIMESTAMP NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_statut (statut),
    INDEX idx_numero (numero_commande),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_cree_le (cree_le)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: COMMANDE_ITEMS (Détail des articles commandés)
-- =============================================================================
CREATE TABLE commande_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    menu_id INT,
    nom_article VARCHAR(150) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL,
    INDEX idx_commande (commande_id),
    INDEX idx_menu (menu_id)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: PAIEMENTS
-- =============================================================================
CREATE TABLE paiements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL UNIQUE,
    montant DECIMAL(8,2) NOT NULL,
    statut ENUM('en_attente', 'valide', 'echoue', 'rembourse') NOT NULL DEFAULT 'en_attente',
    methode ENUM('especes', 'carte', 'mobile', 'autre') NOT NULL,
    transaction_id VARCHAR(255),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    INDEX idx_statut (statut),
    INDEX idx_commande (commande_id)
) ENGINE=InnoDB;

-- =============================================================================
-- TABLE: NOTIFICATIONS
-- =============================================================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    commande_id INT NOT NULL,
    utilisateur_id INT,
    administrateur_id INT,
    type ENUM(
        'commande_creee',
        'commande_en_preparation',
        'commande_prete',
        'retard_client',
        'commande_servie',
        'commande_annulee'
    ) NOT NULL,
    message TEXT NOT NULL,
    lue BOOLEAN DEFAULT FALSE,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (administrateur_id) REFERENCES administrateurs(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_administrateur (administrateur_id),
    INDEX idx_lue (lue),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- =============================================================================
-- UTILISATEUR BDD
-- =============================================================================
CREATE USER IF NOT EXISTS 'glescros_user'@'localhost' IDENTIFIED BY 'glescros2025!';
GRANT SELECT, INSERT, UPDATE, DELETE ON glescros_db.* TO 'glescros_user'@'localhost';
FLUSH PRIVILEGES;

-- =============================================================================
-- DONNÉES DE TEST
-- =============================================================================

-- Utilisateurs de test
INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0612345678', '$2b$10$abcdefghijklmnopqrstuv'), -- hash fictif
('Martin', 'Sophie', 'sophie.martin@email.com', '0623456789', '$2b$10$abcdefghijklmnopqrstuv'),
('Anonyme', 'Client', 'anonyme@glescros.local', NULL, '$2b$10$abcdefghijklmnopqrstuv');

-- Administrateurs de test
INSERT INTO administrateurs (nom, prenom, email, mot_de_passe, role) VALUES
('Cros', 'Gerard', 'gerard@glescros.com', '$2b$10$abcdefghijklmnopqrstuv', 'gerant'),
('Dubois', 'Marie', 'marie@glescros.com', '$2b$10$abcdefghijklmnopqrstuv', 'cuisinier'),
('Petit', 'Luc', 'luc@glescros.com', '$2b$10$abcdefghijklmnopqrstuv', 'serveur');

-- Menus de test
INSERT INTO menus (nom, description, categorie, prix, disponible) VALUES
('Menu Poulet - Riz au Curry', 'Poulet mariné avec riz parfumé au curry', 'menu_complet', 12.50, TRUE),
('Menu Poisson - Attiéké', 'Poisson braisé avec attiéké et sauce pimentée', 'menu_complet', 14.00, TRUE),
('Alloco Plantain', 'Bananes plantains frites avec sauce piquante', 'entree', 5.50, TRUE),
('Coca Cola 33cl', 'Boisson fraîche', 'boisson', 3.00, TRUE),
('Jus de Bissap', 'Jus d\'hibiscus fait maison', 'boisson', 2.50, TRUE),
('Tiep Bou Dien', 'Riz au poisson sénégalais', 'plat', 13.50, TRUE),
('Mafé Bœuf', 'Ragoût de bœuf sauce arachide', 'plat', 12.00, TRUE),
('Pastels au Thon', '4 pastels frits garnis au thon', 'entree', 6.00, TRUE);

-- Commandes de test
INSERT INTO commandes (utilisateur_id, numero_commande, statut, prix_total) VALUES
(1, 1001, 'en_attente', 15.50),
(2, 1002, 'en_preparation', 27.50),
(1, 1003, 'prete', 12.50),
(3, 1004, 'servie', 18.00),
(2, 1005, 'annulee', 14.00);

-- Items des commandes
INSERT INTO commande_items (commande_id, menu_id, nom_article, quantite, prix_unitaire) VALUES
-- Commande 1001
(1, 1, 'Menu Poulet - Riz au Curry', 1, 12.50),
(1, 4, 'Coca Cola 33cl', 1, 3.00),
-- Commande 1002
(2, 2, 'Menu Poisson - Attiéké', 1, 14.00),
(2, 1, 'Menu Poulet - Riz au Curry', 1, 12.50),
(2, 5, 'Jus de Bissap', 1, 2.50),
-- Commande 1003
(3, 1, 'Menu Poulet - Riz au Curry', 1, 12.50),
-- Commande 1004
(4, 6, 'Tiep Bou Dien', 1, 13.50),
(4, 3, 'Alloco Plantain', 1, 5.50),
-- Commande 1005 (annulée)
(5, 2, 'Menu Poisson - Attiéké', 1, 14.00);

-- Paiements
INSERT INTO paiements (commande_id, montant, statut, methode) VALUES
(1, 15.50, 'en_attente', 'carte'),
(2, 27.50, 'valide', 'especes'),
(3, 12.50, 'valide', 'mobile'),
(4, 18.00, 'valide', 'carte'),
(5, 14.00, 'rembourse', 'carte');

-- Notifications
INSERT INTO notifications (commande_id, utilisateur_id, type, message) VALUES
(1, 1, 'commande_creee', 'Votre commande N°1001 a été créée avec succès'),
(2, 2, 'commande_en_preparation', 'Votre commande N°1002 est en cours de préparation'),
(3, 1, 'commande_prete', 'Votre commande N°1003 est prête ! Venez la récupérer'),
(4, 3, 'commande_servie', 'Votre commande N°1004 a été servie. Bon appétit !'),
(5, 2, 'commande_annulee', 'Votre commande N°1005 a été annulée');

-- =============================================================================
-- VUES UTILES
-- =============================================================================

-- Vue: Statistiques quotidiennes
CREATE VIEW vue_stats_quotidiennes AS
SELECT 
    DATE(cree_le) AS date,
    COUNT(*) AS total_commandes,
    SUM(CASE WHEN statut = 'servie' THEN 1 ELSE 0 END) AS commandes_servies,
    SUM(CASE WHEN statut = 'annulee' THEN 1 ELSE 0 END) AS commandes_annulees,
    SUM(CASE WHEN statut = 'retard_client' THEN 1 ELSE 0 END) AS retards_client,
    SUM(CASE WHEN statut = 'servie' THEN prix_total ELSE 0 END) AS ca_total,
    SUM(CASE WHEN statut = 'annulee' THEN prix_total ELSE 0 END) AS pertes_total
FROM commandes
GROUP BY DATE(cree_le);

-- Vue: File d'attente active
CREATE VIEW vue_file_attente AS
SELECT 
    c.id,
    c.numero_commande,
    c.statut,
    c.prix_total,
    c.cree_le,
    u.nom,
    u.prenom,
    GROUP_CONCAT(ci.nom_article SEPARATOR ', ') AS articles
FROM commandes c
LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id
LEFT JOIN commande_items ci ON c.id = ci.commande_id
WHERE c.statut IN ('en_attente', 'en_preparation', 'prete', 'retard_client')
GROUP BY c.id
ORDER BY c.cree_le ASC;

-- =============================================================================
-- FIN DU SCHÉMA
-- =============================================================================
