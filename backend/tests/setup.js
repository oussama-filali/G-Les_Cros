// Configuration Jest pour éviter les connexions DB réelles pendant les tests

// Définir NODE_ENV=test pour désactiver automatiquement Stripe
process.env.NODE_ENV = 'test';
process.env.SKIP_STRIPE_VERIFICATION = 'true';

// Mock du module database avec le bon chemin relatif
jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  getConnection: jest.fn(),
  promise: jest.fn(),
}));

// Supprimer le mock de process.exit qui cause des problèmes
// Les tests vont gérer les erreurs normalement
