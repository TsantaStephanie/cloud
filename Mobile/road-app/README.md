# Antananarivo Road Management - Mobile App

Application mobile de signalement et gestion des problèmes routiers d'Antananarivo, développée avec Ionic Vue et Firebase.

## 🎨 Design

L'application utilise une palette de couleurs sophistiquée :
- **Navy Blue** (#003049) - Couleur principale
- **Cream White** (#fcf8f3) - Arrière-plan
- **Gold Accent** (#d4a574) - Accents
- **Coral** (#f77f00) - Éléments d'action

Typographies :
- **Playfair Display** - Titres et en-têtes (serif élégant)
- **Work Sans** - Corps de texte (sans-serif moderne)

## ✨ Fonctionnalités

### Pour les Utilisateurs
- 📍 **Signalement géolocalisé** : Signaler des problèmes routiers avec localisation GPS précise
- 🗺️ **Carte interactive** : Visualiser tous les signalements sur une carte avec Leaflet/OpenStreetMap
- 🔍 **Filtres avancés** : Filtrer par gravité, statut, et afficher uniquement ses signalements
- 📊 **Statistiques personnelles** : Suivre ses contributions et leur résolution
- 🔔 **Authentification Firebase** : Système de connexion sécurisé

### Pour les Administrateurs
- ✅ **Gestion des signalements** : Changer le statut (Signalé → Vérifié → En cours → Réparé)
- 📈 **Vue d'ensemble** : Statistiques globales sur tous les signalements
- 👥 **Gestion des utilisateurs** : Accès aux fonctionnalités d'administration

### Modes de Gravité
- 🟢 **Faible** : Petites dégradations
- 🟡 **Moyenne** : Problèmes modérés
- 🟠 **Élevée** : Dégradations importantes
- 🔴 **Critique** : Situations dangereuses

## 🚀 Installation et Configuration

### Prérequis
```bash
- Node.js (v16 ou supérieur)
- npm ou yarn
- Android Studio (pour le développement Android)
- Compte Firebase
- Émulateur Android ou appareil physique
```

### 1. Installation des dépendances

```bash
cd antananarivo-road-app
npm install
```

### 2. Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)

2. Activez les services suivants :
   - **Authentication** : Email/Password
   - **Firestore Database** : Base de données NoSQL
   - **Storage** : Pour les photos (optionnel)

3. Créez une application Web et copiez les credentials

4. Configurez `src/firebase/config.js` :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

### 3. Structure Firestore

Créez ces collections dans Firestore :

**Collection : `utilisateurs`**
```javascript
{
  email: string,
  role: "admin" | "utilisateur" | "visiteur",
  date_creation: timestamp
}
```

**Collection : `routes_endommagees`**
```javascript
{
  utilisateur_id: string,
  latitude: number,
  longitude: number,
  gravite: "faible" | "moyenne" | "elevee" | "critique",
  description: string,
  statut: "signale" | "verifie" | "en_cours" | "repare",
  longueur_km: number,
  date_creation: timestamp,
  date_mise_a_jour: timestamp
}
```

### 4. Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs - lecture pour tous, écriture pour admin
    match /utilisateurs/{userId} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.uid == userId || 
         get(/databases/$(database)/documents/utilisateurs/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Routes endommagées - lecture pour tous, création pour authentifiés
    match /routes_endommagees/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (resource.data.utilisateur_id == request.auth.uid || 
         get(/databases/$(database)/documents/utilisateurs/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

### 5. Créer des utilisateurs de test

Dans Firebase Authentication, créez manuellement :
- **admin@route.mg** / **admin** (puis ajoutez role: "admin" dans Firestore)
- **user1@route.mg** / **user1** (role: "utilisateur")
- **user2@route.mg** / **user2** (role: "utilisateur")

## 🔧 Développement

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8100`

### Tester sur navigateur

Ouvrez Chrome DevTools et activez le mode mobile pour simuler un appareil.

## 📱 Build pour Android

### 1. Ajouter la plateforme Android

```bash
# Installer Capacitor CLI si ce n'est pas fait
npm install -g @capacitor/cli

# Ajouter Android
npx cap add android
```

### 2. Build de l'application

```bash
# Build de production
npm run build

# Synchroniser avec Android
npx cap sync android
```

### 3. Ouvrir dans Android Studio

```bash
npx cap open android
```

### 4. Configuration Android Studio

1. Attendez que Gradle termine la synchronisation
2. Connectez un appareil Android ou lancez un émulateur
3. Cliquez sur "Run" (▶️) pour installer l'application

### 5. Générer l'APK

Dans Android Studio :
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. L'APK sera généré dans : `android/app/build/outputs/apk/debug/app-debug.apk`

Pour un APK de production :
1. **Build** → **Generate Signed Bundle / APK**
2. Créez ou sélectionnez un keystore
3. Configurez les signatures
4. L'APK signé sera dans : `android/app/build/outputs/apk/release/`

## 🔐 Permissions Android

L'application nécessite ces permissions (déjà configurées) :
- `ACCESS_FINE_LOCATION` - Géolocalisation précise
- `ACCESS_COARSE_LOCATION` - Géolocalisation approximative
- `INTERNET` - Connexion réseau

## 📂 Structure du Projet

```
antananarivo-road-app/
├── src/
│   ├── views/              # Pages de l'application
│   │   ├── LoginView.vue          # Page de connexion
│   │   ├── MapView.vue            # Carte interactive
│   │   ├── ReportView.vue         # Créer un signalement
│   │   ├── ReportsListView.vue    # Liste des signalements
│   │   ├── ProfileView.vue        # Profil utilisateur
│   │   └── TabsLayout.vue         # Navigation par onglets
│   ├── stores/             # Pinia stores (état global)
│   │   ├── auth.js               # Authentification
│   │   └── reports.js            # Gestion des signalements
│   ├── firebase/
│   │   └── config.js             # Configuration Firebase
│   ├── router/
│   │   └── index.js              # Routes de l'application
│   ├── App.vue             # Composant racine
│   └── main.js             # Point d'entrée
├── android/                # Projet Android natif (généré)
├── capacitor.config.json   # Configuration Capacitor
├── vite.config.js         # Configuration Vite
├── package.json           # Dépendances npm
└── index.html             # HTML principal
```

## 🎯 Utilisation de l'Application

### Mode Visiteur
- Visualiser la carte des signalements
- Consulter la liste des problèmes
- Filtrer par gravité et statut
- Accès en lecture seule

### Mode Utilisateur Authentifié
- Toutes les fonctionnalités du visiteur
- Créer de nouveaux signalements
- Suivre ses propres signalements
- Accéder aux statistiques personnelles

### Mode Administrateur
- Toutes les fonctionnalités utilisateur
- Changer le statut des signalements
- Gérer tous les signalements

## 🧪 Tests

### Tester l'application

1. **Test de connexion** : Utilisez admin@route.mg / admin
2. **Test de signalement** :
   - Allez sur l'onglet "Signaler"
   - Acceptez la géolocalisation
   - Remplissez le formulaire
   - Envoyez le signalement
3. **Test de carte** :
   - Visualisez les marqueurs
   - Cliquez sur un marqueur pour voir les détails
   - Utilisez les filtres
4. **Test de liste** :
   - Consultez tous les signalements
   - Filtrez par statut
   - Si admin, changez les statuts

## 📊 Migration des Données PostgreSQL vers Firebase

Si vous avez déjà des données dans PostgreSQL (fichiers fournis) :

1. Exportez vos données depuis PostgreSQL
2. Créez un script de migration pour importer dans Firestore
3. Utilisez Firebase Admin SDK pour l'import en masse

Exemple de script de migration (Node.js) :

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Vos données PostgreSQL
const reports = [
  {
    latitude: -18.8792,
    longitude: 47.5079,
    gravite: 'critique',
    description: 'Grand nid-de-poule avenue Independence',
    statut: 'signale',
    longueur_km: 0.05
  }
  // ... autres signalements
];

// Import
reports.forEach(async (report) => {
  await db.collection('routes_endommagees').add({
    ...report,
    date_creation: admin.firestore.FieldValue.serverTimestamp(),
    date_mise_a_jour: admin.firestore.FieldValue.serverTimestamp()
  });
});
```

## 🐛 Débogage

### Problèmes courants

**Erreur de géolocalisation**
- Vérifiez que les permissions sont accordées
- Sur Android, allez dans Paramètres → Applications → Antananarivo Roads → Permissions

**Firebase ne se connecte pas**
- Vérifiez votre configuration dans `src/firebase/config.js`
- Assurez-vous que les règles Firestore sont correctes
- Vérifiez que Authentication est activé

**L'application ne se lance pas sur Android**
- Nettoyez le build : Build → Clean Project
- Invalidez le cache : File → Invalidate Caches / Restart
- Vérifiez les versions SDK (minSdkVersion: 22, targetSdkVersion: 33)

## 📝 Notes Importantes

- Les coordonnées par défaut sont centrées sur Antananarivo (-18.8792, 47.5079)
- L'application utilise OpenStreetMap (gratuit, pas de clé API requise)
- Firebase offre un quota gratuit généreux pour les petits projets
- Pour la production, configurez un domaine personnalisé et activez App Check

## 🔄 Mises à Jour Futures

Fonctionnalités potentielles :
- 📸 Upload de photos pour les signalements
- 🔔 Notifications push pour les mises à jour
- 📍 Itinéraires alternatifs
- 💬 Système de commentaires
- 📊 Dashboard analytique avancé
- 🌙 Mode sombre
- 🌍 Support multilingue (FR/EN/MG)

## 👥 Support

Pour toute question ou problème :
- Email : support@route.mg
- Documentation Firebase : https://firebase.google.com/docs
- Documentation Ionic : https://ionicframework.com/docs
- Documentation Capacitor : https://capacitorjs.com/docs

## 📄 Licence

© 2026 Antananarivo Road Management - Tous droits réservés

---

**Développé avec ❤️ pour améliorer les infrastructures d'Antananarivo**