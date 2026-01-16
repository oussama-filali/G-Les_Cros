// Routes pour les menus
const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/Menu.controller');

// POST /api/menus - Créer un menu
router.post('/', MenuController.createMenu);

// GET /api/menus - Récupérer tous les menus (avec filtres optionnels ?disponible=true&categorie=plat)
router.get('/', MenuController.getAllMenus);

// GET /api/menus/:id - Récupérer un menu par ID
router.get('/:id', MenuController.getMenuById);

// PUT /api/menus/:id - Mettre à jour un menu
router.put('/:id', MenuController.updateMenu);

// PATCH /api/menus/:id/disponibilite - Changer disponibilité
router.patch('/:id/disponibilite', MenuController.toggleDisponibilite);

// DELETE /api/menus/:id - Supprimer un menu
router.delete('/:id', MenuController.deleteMenu);

module.exports = router;
