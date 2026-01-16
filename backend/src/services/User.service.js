// User Service - Logique métier pour les utilisateurs
const UserModel = require('../models/User.model');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class UserService {
  
  /**
   * Créer un nouvel utilisateur
   */
  static async createUser(userData) {
    const { nom, prenom, email, telephone, mot_de_passe } = userData;

    if (!nom || !prenom || !email || !mot_de_passe) {
      throw new Error('Nom, prénom, email et mot de passe sont obligatoires');
    }

    // Vérifier si l'email existe déjà
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    const userId = await UserModel.create({
      nom,
      prenom,
      email,
      telephone,
      mot_de_passe: hashedPassword
    });

    // Retourner l'utilisateur sans le mot de passe
    return await UserModel.findById(userId);
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async getAllUsers() {
    return await UserModel.findAll();
  }

  /**
   * Récupérer un utilisateur par ID
   */
  static async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }
    return user;
  }

  /**
   * Récupérer un utilisateur par email
   */
  static async getUserByEmail(email) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }
    // Retirer le mot de passe
    const { mot_de_passe, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authentifier un utilisateur
   */
  static async authenticate(email, mot_de_passe) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Retourner l'utilisateur sans le mot de passe
    const { mot_de_passe: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(id, userData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const { nom, prenom, email, telephone } = userData;

    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    const updated = await UserModel.update(id, {
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      email: email || user.email,
      telephone: telephone !== undefined ? telephone : user.telephone
    });

    if (!updated) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return await UserModel.findById(id);
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Utilisateur introuvable');
    }

    const deleted = await UserModel.delete(id);
    if (!deleted) {
      throw new Error('Erreur lors de la suppression');
    }

    return { message: 'Utilisateur supprimé avec succès' };
  }
}

module.exports = UserService;
