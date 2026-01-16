/**
 * Script de test Stripe
 * Vérifie que les clés Stripe fonctionnent correctement
 * 
 * Usage: node test-stripe.js
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
  console.log('\n🔧 Test de connexion Stripe...\n');

  try {
    // Test 1: Vérifier que la clé est chargée
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('❌ STRIPE_SECRET_KEY non définie dans .env');
    }
    console.log('✅ Clé Stripe chargée depuis .env');
    console.log(`   Clé: ${process.env.STRIPE_SECRET_KEY.substring(0, 20)}...`);

    // Test 2: Créer un Payment Intent de test
    console.log('\n💳 Test création Payment Intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1050, // 10.50€ en centimes
      currency: 'eur',
      metadata: {
        test: 'Configuration Stripe',
        source: 'GLesCrocs'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Payment Intent créé avec succès');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Montant: ${paymentIntent.amount / 100}€`);
    console.log(`   Statut: ${paymentIntent.status}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret.substring(0, 30)}...`);

    // Test 3: Récupérer le Payment Intent
    console.log('\n🔍 Test récupération Payment Intent...');
    const retrieved = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log('✅ Payment Intent récupéré avec succès');
    console.log(`   Statut: ${retrieved.status}`);

    // Test 4: Annuler le Payment Intent (pour ne pas laisser de traces)
    console.log('\n❌ Annulation du Payment Intent de test...');
    const cancelled = await stripe.paymentIntents.cancel(paymentIntent.id);
    console.log('✅ Payment Intent annulé avec succès');
    console.log(`   Statut final: ${cancelled.status}`);

    console.log('\n✅ ✅ ✅ Tous les tests Stripe ont réussi ! ✅ ✅ ✅\n');
    console.log('📋 Configuration actuelle:');
    console.log(`   - Clé publique: ${process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...`);
    console.log(`   - Mode: TEST (clés sk_test_* et pk_test_*)`);
    console.log(`   - Backend prêt pour les paiements réels\n`);

  } catch (error) {
    console.error('\n❌ Erreur Stripe:', error.message);
    console.error('\n🔧 Vérifications à faire:');
    console.error('   1. Le fichier .env contient STRIPE_SECRET_KEY');
    console.error('   2. La clé commence par sk_test_ (mode test)');
    console.error('   3. La connexion Internet est active');
    console.error('   4. Les clés Stripe sont valides (dashboard.stripe.com)\n');
    process.exit(1);
  }
}

// Exécuter le test
testStripe();
