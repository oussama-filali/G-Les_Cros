# Configuration Stripe & Paiements

## État actuel : MODE TEST/DÉVELOPPEMENT

Actuellement, **Stripe n'est pas encore configuré** pour permettre les tests et le développement sans API keys.

### Mode de fonctionnement actuel

1. **En mode TEST** (`NODE_ENV=test` ou `SKIP_STRIPE_VERIFICATION=true`) :
   - ✅ Les commandes peuvent être créées **sans** `payment_intent_id` réel
   - ✅ La vérification Stripe est **désactivée** automatiquement
   - ✅ Un `transaction_id` fictif est généré : `TEST_{orderId}_{timestamp}`
   - ⚠️ **Ne PAS utiliser en production**

2. **En mode PRODUCTION** :
   - ❌ Nécessite obligatoirement un `payment_intent_id` Stripe valide
   - ❌ La vérification Stripe est **activée**
   - ❌ Échec si Stripe n'est pas configuré

---

## Configuration Stripe (À FAIRE pour la production)

### 1. Obtenir les clés Stripe

1. Créer un compte sur [https://stripe.com](https://stripe.com)
2. Aller dans **Developers > API Keys**
3. Récupérer :
   - `Publishable key` (clé publique - pour le frontend)
   - `Secret key` (clé secrète - pour le backend)

### 2. Configurer les variables d'environnement

Créer/modifier le fichier `.env` dans `backend/` :

```env
# Stripe Configuration
STRIPE_SECRET_KEY=votre_clé_secrète_ici
STRIPE_PUBLISHABLE_KEY=votre_clé_publique_ici

# Mode (ne pas mettre en production)
# SKIP_STRIPE_VERIFICATION=true  # Uniquement pour tests locaux
NODE_ENV=development
```

### 3. Installer le SDK Stripe (déjà fait)

```bash
npm install stripe
```

### 4. Workflow de paiement complet

#### **Frontend (à implémenter)**

```javascript
// 1. Créer un Payment Intent côté serveur
const response = await fetch('/api/payments/create-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    montant: 25.50,
    items: [{ menu_id: 1, quantite: 2 }]
  })
});

const { clientSecret, paymentIntentId } = await response.json();

// 2. Confirmer le paiement avec Stripe.js (frontend)
const stripe = Stripe('pk_test_XXXXXX'); // Clé publique
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement, // Élément Stripe Card
    billing_details: { name: 'Client Name' }
  }
});

// 3. Créer la commande avec le payment_intent_id validé
if (paymentIntent.status === 'succeeded') {
  await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      utilisateur_id: 1,
      payment_intent_id: paymentIntent.id,
      items: [{ menu_id: 1, quantite: 2 }]
    })
  });
}
```

#### **Backend (déjà implémenté)**

Le backend vérifie automatiquement le paiement :

```javascript
// Order.service.js
const paymentVerification = await PaymentService.verifyPayment(payment_intent_id);
if (!paymentVerification.isValid) {
  throw new Error('Paiement non validé');
}
```

---

## Tests actuels

Les tests fonctionnent **sans Stripe** grâce au mode test :

```javascript
// Les tests peuvent créer des commandes comme ça :
const orderData = {
  utilisateur_id: 1,
  items: [{ menu_id: 1, quantite: 2 }],
  // payment_intent_id est optionnel en mode test
};

const order = await OrderService.createOrder(orderData);
```

---

## Checklist avant production

- [ ] Créer compte Stripe
- [ ] Configurer les clés API dans `.env`
- [ ] Implémenter l'interface de paiement frontend (Stripe Elements)
- [ ] Tester avec les clés de test Stripe (format: `sk_test_...`)
- [ ] Passer en mode production avec clés live (format: `sk_live_...`)
- [ ] **SUPPRIMER** `SKIP_STRIPE_VERIFICATION` de la production
- [ ] Configurer les webhooks Stripe pour les notifications

---

## Documentation Stripe

- [Guide d'intégration](https://stripe.com/docs/payments/accept-a-payment)
- [Stripe Elements (UI)](https://stripe.com/docs/stripe-js)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Webhooks](https://stripe.com/docs/webhooks)
