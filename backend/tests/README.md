# Tests Backend - G-Les_Cros

## Structure des tests

Les tests sont organisés par type :

```
tests/
├── services/           # Tests des services (logique métier)
│   ├── User.service.test.js
│   ├── Menu.service.test.js
│   ├── Order.service.test.js
│   └── Payment.service.test.js
├── controllers/        # Tests des controllers (endpoints)
│   ├── User.controller.test.js
│   ├── Menu.controller.test.js
│   └── Order.controller.test.js
├── routes/            # Tests des routes (intégration)
│   ├── user.routes.test.js
│   ├── menu.routes.test.js
│   └── order.routes.test.js
└── sockets/           # Tests WebSocket
    └── order.socket.test.js
```

## Commandes de test

```bash
# Exécuter tous les tests
npm test

# Exécuter en mode watch (re-run automatique)
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage

# Exécuter un fichier de test spécifique
npm test -- User.service.test.js

# Exécuter les tests d'un dossier
npm test -- tests/services
```

## Technologies utilisées

- **Jest** : Framework de test
- **supertest** : Tests HTTP/API
- **socket.io-client** : Tests WebSocket
- **Mocking** : Jest mocks pour isoler les tests

## Couverture des tests

Les tests couvrent :

✅ **Services** : Validation logique métier, gestion erreurs
✅ **Controllers** : Gestion des requêtes/réponses HTTP
✅ **Routes** : Tests d'intégration des endpoints
✅ **Sockets** : Events temps réel, broadcasting

## Exemple d'exécution

```bash
cd backend
npm test
```

## Bonnes pratiques

- Chaque test est isolé (pas d'interdépendance)
- Les dépendances externes sont mockées
- Les tests vérifient les cas normaux ET les erreurs
- Nomenclature : `nomFichier.test.js`
