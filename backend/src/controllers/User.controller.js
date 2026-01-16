// User Controller - Gestion des endpoints utilisateurs
const UserService = require('../services/User.service');

class UserController {

  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async authenticate(req, res) {
    try {
      const { email, mot_de_passe } = req.body;
      if (!email || !mot_de_passe) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
      }
      const user = await UserService.authenticate(email, mot_de_passe);
      res.json({ message: 'Authentification réussie', user });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
