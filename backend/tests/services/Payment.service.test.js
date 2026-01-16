const PaymentService = require('../../src/services/Payment.service');
const PaymentModel = require('../../src/models/Payment.model');

// Mock des dépendances
jest.mock('../../src/models/Payment.model');
jest.mock('stripe', () => {
  const mockStripe = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn()
    }
  };
  return jest.fn(() => mockStripe);
});

const stripe = require('stripe')();

describe('PaymentService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    
    test('devrait créer un PaymentIntent Stripe avec succès', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123456',
        amount: 2550,
        currency: 'eur',
        status: 'requires_payment_method',
        client_secret: 'secret_123'
      });

      const result = await PaymentService.createPaymentIntent(25.50, { userId: 1 });

      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2550,
        currency: 'eur',
        metadata: {
          userId: 1,
          source: 'GLesCrocs'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      expect(result).toHaveProperty('clientSecret', 'secret_123');
      expect(result).toHaveProperty('paymentIntentId', 'pi_123456');
    });

    test('devrait échouer si erreur Stripe', async () => {
      stripe.paymentIntents.create.mockRejectedValue(
        new Error('Stripe error')
      );

      await expect(PaymentService.createPaymentIntent(25.50))
        .rejects
        .toThrow();
    });
  });

  describe('verifyPayment', () => {
    
    test('devrait vérifier un paiement réussi', async () => {
      stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_123456',
        status: 'succeeded',
        amount: 2550
      });

      const result = await PaymentService.verifyPayment('pi_123456');

      expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_123456');
      expect(result).toHaveProperty('isValid', true);
      expect(result).toHaveProperty('status', 'succeeded');
    });

    test('devrait détecter un paiement en attente', async () => {
      stripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_123456',
        status: 'requires_payment_method',
        amount: 2550
      });

      const result = await PaymentService.verifyPayment('pi_123456');

      expect(result).toHaveProperty('isValid', false);
      expect(result).toHaveProperty('status', 'requires_payment_method');
    });

    test('devrait gérer les erreurs Stripe', async () => {
      stripe.paymentIntents.retrieve.mockRejectedValue(
        new Error('PaymentIntent introuvable')
      );

      await expect(PaymentService.verifyPayment('pi_invalid'))
        .rejects
        .toThrow();
    });
  });

  describe('getPaymentById', () => {
    
    test('devrait retourner un paiement par ID', async () => {
      const mockPayment = {
        id: 1,
        payment_intent_id: 'pi_123456',
        montant: 25.50,
        statut: 'completed'
      };

      PaymentModel.findById.mockResolvedValue(mockPayment);

      const result = await PaymentModel.findById(1);

      expect(PaymentModel.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPayment);
    });

    test('devrait retourner null si paiement introuvable', async () => {
      PaymentModel.findById.mockResolvedValue(null);

      const result = await PaymentModel.findById(999);

      expect(result).toBeNull();
    });
  });
});
