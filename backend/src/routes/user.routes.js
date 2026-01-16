// Routes pour les utilisateurs
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User.controller');

// POST /api/users/register - Créer un utilisateur
router.post('/register', UserController.createUser);

// POST /api/users/login - Authentifier un utilisateur
router.post('/login', UserController.authenticate);

// GET /api/users - Récupérer tous les utilisateurs
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Récupérer un utilisateur par ID
router.get('/:id', UserController.getUserById);

// PUT /api/users/:id - Mettre à jour un utilisateur
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Supprimer un utilisateur
router.delete('/:id', UserController.deleteUser);

module.exports = router;
