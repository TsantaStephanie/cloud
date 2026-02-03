# Guide de Configuration et Build Android

Ce guide vous accompagne pas à pas pour transformer cette application Ionic Vue en APK Android fonctionnel.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation Initiale](#installation-initiale)
3. [Configuration Firebase](#configuration-firebase)
4. [Test en Mode Web](#test-en-mode-web)
5. [Configuration Android](#configuration-android)
6. [Build et Test sur Émulateur](#build-et-test-sur-émulateur)
7. [Génération de l&#39;APK](#génération-de-lapk)
8. [Résolution de Problèmes](#résolution-de-problèmes)

---

## Prérequis

### 1. Installer Node.js

Téléchargez et installez Node.js v16+ depuis : https://nodejs.org/

Vérifiez l'installation :

```bash
node --version  # Devrait afficher v16.x.x ou supérieur
npm --version   # Devrait afficher 8.x.x ou supérieur
```

### 2. Installer Android Studio

1. Téléchargez Android Studio : https://developer.android.com/studio
2. Installez Android Studio avec les composants par défaut
3. Lors du premier lancement, suivez l'assistant de configuration
4. Installez le SDK Android (API Level 33 recommandé)

### 3. Configurer les Variables d'Environnement Android

**Windows :**

```powershell
# Ajoutez à vos variables d'environnement système
ANDROID_HOME = C:\Users\VOTRE_NOM\AppData\Local\Android\Sdk
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\cmdline-tools\latest\bin
```

**macOS/Linux :**

```bash
# Ajoutez à ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Vérifiez :

```bash
adb --version  # Devrait afficher la version d'Android Debug Bridge
```

---

## Installation Initiale

### Étape 1 : Extraire et Naviguer

```bash
# Naviguez vers le dossier du projet
cd antananarivo-road-app

# Installez toutes les dépendances
npm install
```

Cette commande télécharge toutes les bibliothèques nécessaires (cela peut prendre 2-5 minutes).

### Étape 2 : Vérifier l'Installation

```bash
# Vérifiez que tout est bien installé
npm list --depth=0
```

Vous devriez voir Ionic, Vue, Firebase, Leaflet, etc.

---

## Configuration Firebase

### Étape 1 : Créer un Projet Firebase

1. Allez sur https://console.firebase.google.com/
2. Cliquez sur "Ajouter un projet"
3. Nom du projet : `antananarivo-roads` (ou votre choix)
4. Désactivez Google Analytics (optionnel)
5. Cliquez sur "Créer le projet"

### Étape 2 : Configurer Authentication

1. Dans le menu de gauche, cliquez sur **Authentication**
2. Cliquez sur "Commencer"
3. Sélectionnez **E-mail/Mot de passe**
4. Activez la première option (E-mail/Mot de passe)
5. Cliquez sur "Enregistrer"

### Étape 3 : Créer des Utilisateurs de Test

1. Dans Authentication, onglet "Users"
2. Cliquez sur "Ajouter un utilisateur"
3. Créez ces comptes :
   - Email : `admin@route.mg`, Mot de passe : `admin123`
   - Email : `user1@route.mg`, Mot de passe : `user123`

### Étape 4 : Configurer Firestore

1. Dans le menu de gauche, cliquez sur **Firestore Database**
2. Cliquez sur "Créer une base de données"
3. Choisissez **Mode test** (pour le développement)
4. Sélectionnez une région proche (ex: europe-west)
5. Cliquez sur "Activer"

### Étape 5 : Créer la Structure Firestore

1. Créez une collection `utilisateurs`
2. Ajoutez un document avec l'ID de l'utilisateur admin créé plus tôt
3. Champs du document :

   ```
   email: "admin@route.mg"
   role: "admin"
   date_creation: (timestamp actuel)
   ```
4. Créez une collection `routes_endommagees` (laissez vide pour l'instant)

### Étape 6 : Configurer les Règles de Sécurité

Dans Firestore, onglet "Règles" :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /utilisateurs/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  
    match /routes_endommagees/{reportId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
  }
}
```

Cliquez sur "Publier".

### Étape 7 : Obtenir les Credentials Firebase

1. Cliquez sur l'icône ⚙️ (paramètres) → "Paramètres du projet"
2. Descendez jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Nom de l'application : `Antananarivo Roads Web`
5. **NE cochez PAS** Firebase Hosting
6. Cliquez sur "Enregistrer l'application"
7. **Copiez la configuration** qui apparaît

### Étape 8 : Configurer l'Application

Ouvrez `src/firebase/config.js` et remplacez les valeurs :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",              // Copiez depuis Firebase
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Sauvegardez le fichier !**

---

## Test en Mode Web

### Étape 1 : Lancer le Serveur de Développement

```bash
npm run dev
```

Attendez que le message apparaisse :

```
Local:   http://localhost:8100/
Network: http://192.168.x.x:8100/
```

### Étape 2 : Tester dans le Navigateur

1. Ouvrez Chrome : http://localhost:8100
2. Ouvrez les DevTools (F12)
3. Activez le mode "Device Toolbar" (Ctrl+Shift+M)
4. Sélectionnez un appareil mobile (ex: iPhone 12 Pro)

### Étape 3 : Tester les Fonctionnalités

**Test 1 : Connexion**

- Cliquez sur "Se connecter"
- Email : `admin@route.mg`
- Mot de passe : `admin123`
- Vérifiez que vous êtes redirigé vers la carte

**Test 2 : Créer un Signalement**

- Allez sur l'onglet "Signaler"
- Autorisez la géolocalisation (le navigateur demandera)
- Remplissez :
  - Description : "Test de signalement"
  - Gravité : Moyenne
  - Longueur : 0.1 km
- Cliquez sur "Envoyer le signalement"

**Test 3 : Voir les Signalements**

- Allez sur l'onglet "Carte"
- Vous devriez voir un marqueur pour votre signalement
- Cliquez dessus pour voir les détails

Si tout fonctionne correctement, passez à la configuration Android !

---

## Configuration Android

### Étape 1 : Arrêter le Serveur Web

Appuyez sur `Ctrl+C` dans le terminal pour arrêter le serveur de développement.

### Étape 2 : Build de l'Application

```bash
# Build de production optimisé
npm run build
```

Attendez que le build se termine (20-60 secondes).

### Étape 3 : Ajouter la Plateforme Android

```bash
# Ajouter Capacitor Android
npx cap add android
```

Cette commande crée le dossier `android/` avec le projet Android natif.

### Étape 4 : Synchroniser les Fichiers

```bash
# Copier les fichiers web vers Android
npx cap sync android
```

### Étape 5 : Ouvrir dans Android Studio

```bash
# Ouvrir le projet Android
npx cap open android
```

Android Studio s'ouvre automatiquement.

---

## Build et Test sur Émulateur

### Étape 1 : Créer un Émulateur (si nécessaire)

Dans Android Studio :

1. Cliquez sur **Device Manager** (icône téléphone en haut à droite)
2. Cliquez sur "Create Device"
3. Sélectionnez **Pixel 5** (ou un appareil récent)
4. Cliquez sur "Next"
5. Sélectionnez **System Image** : API Level 33 (Android 13)
   - Si non téléchargé, cliquez sur "Download" à côté
6. Cliquez sur "Next" puis "Finish"

### Étape 2 : Attendre la Synchronisation Gradle

Première ouverture dans Android Studio :

- Une barre de progression apparaît : "Gradle sync in progress..."
- **Attendez que cela se termine** (2-10 minutes selon votre connexion)
- Ne fermez pas Android Studio pendant ce temps

### Étape 3 : Lancer l'Application

1. En haut, sélectionnez votre émulateur dans la liste déroulante
2. Cliquez sur le bouton ▶️ **Run 'app'**
3. L'émulateur démarre (cela peut prendre 1-2 minutes la première fois)
4. L'application s'installe et se lance automatiquement

### Étape 4 : Tester sur l'Émulateur

**Configuration de la Géolocalisation sur Émulateur :**

1. Dans Android Studio, avec l'émulateur lancé
2. Cliquez sur les "..." (More) sur le panneau de l'émulateur
3. Allez dans **Location**
4. Entrez les coordonnées d'Antananarivo :
   - Latitude : `-18.8792`
   - Longitude : `47.5079`
5. Cliquez sur "Send"

**Tests à Effectuer :**

- ✅ L'application démarre correctement
- ✅ Vous pouvez vous connecter avec admin@route.mg
- ✅ La géolocalisation fonctionne (coordonnées Antananarivo)
- ✅ Vous pouvez créer un signalement
- ✅ La carte affiche les marqueurs
- ✅ Les filtres fonctionnent

---

## Génération de l'APK

### APK de Débogage (pour tests)

#### Méthode 1 : Via Terminal

```bash
cd android
./gradlew assembleDebug    # Sur macOS/Linux
gradlew.bat assembleDebug  # Sur Windows
```

L'APK sera généré dans :

```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### Méthode 2 : Via Android Studio

1. Menu : **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Attendez la fin du build (1-5 minutes)
3. Une notification apparaît : "APK(s) generated successfully"
4. Cliquez sur "locate" pour trouver l'APK

### Installer l'APK sur un Appareil Physique

**Option 1 : Via USB**

1. Activez le **Mode Développeur** sur votre téléphone Android :

   - Paramètres → À propos du téléphone
   - Tapez 7 fois sur "Numéro de build"
   - Revenez et allez dans "Options pour les développeurs"
   - Activez le "Débogage USB"
2. Connectez le téléphone au PC via USB
3. Dans Android Studio :

   - Votre appareil apparaît dans la liste déroulante en haut
   - Cliquez sur ▶️ Run

**Option 2 : Transfert Manuel**

1. Copiez `app-debug.apk` sur votre téléphone
2. Sur le téléphone, ouvrez le gestionnaire de fichiers
3. Localisez le fichier APK
4. Tapez dessus pour l'installer
5. Acceptez l'installation depuis des sources inconnues si demandé

### APK de Production (signé)

Pour publier sur Google Play Store ou distribuer officiellement :

#### 1. Créer un Keystore

```bash
keytool -genkey -v -keystore antananarivo-roads.keystore -alias antananarivo -keyalg RSA -keysize 2048 -validity 10000
```

Répondez aux questions :

- Mot de passe du keystore : (choisissez un mot de passe fort)
- Nom, organisation, etc. (informations de votre organisation)

**⚠️ IMPORTANT : Sauvegardez ce fichier et le mot de passe en lieu sûr !**

#### 2. Configurer Gradle

Créez `android/key.properties` :

```properties
storePassword=VOTRE_MOT_DE_PASSE
keyPassword=VOTRE_MOT_DE_PASSE
keyAlias=antananarivo
storeFile=../antananarivo-roads.keystore
```

#### 3. Modifier `android/app/build.gradle`

Ajoutez avant `android {` :

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dans `android { ... }`, ajoutez :

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 4. Build l'APK Signé

```bash
cd android
./gradlew assembleRelease    # macOS/Linux
gradlew.bat assembleRelease  # Windows
```

L'APK signé sera dans :

```
android/app/build/outputs/apk/release/app-release.apk
```

Cet APK peut être publié sur le Play Store !

---

## Résolution de Problèmes

### Problème : Gradle Sync Failed

**Solution :**

```bash
# Dans le terminal Android Studio
./gradlew clean
./gradlew build --refresh-dependencies
```

### Problème : SDK Not Found

**Solution :**

1. File → Project Structure
2. SDK Location → Android SDK Location
3. Définissez le chemin correct (ex: `C:\Users\VOUS\AppData\Local\Android\Sdk`)

### Problème : Émulateur Lent

**Solutions :**

- Allouez plus de RAM dans AVD Manager → Edit → Show Advanced
- Activez l'accélération matérielle (Intel HAXM ou AMD Hypervisor)
- Utilisez un appareil physique via USB

### Problème : L'Application Crash au Démarrage

**Vérifications :**

1. Vérifiez les logs dans Android Studio (onglet "Logcat")
2. Assurez-vous que Firebase est bien configuré
3. Vérifiez que les permissions sont dans `AndroidManifest.xml`

### Problème : Géolocalisation Ne Fonctionne Pas

**Sur Émulateur :**

- Configurez manuellement la position (voir section Émulateur)

**Sur Appareil Réel :**

- Vérifiez que les permissions de localisation sont accordées
- Paramètres → Applications → Antananarivo Roads → Permissions → Localisation → Autoriser

### Problème : Erreur Firebase "Network Error"

**Solutions :**

1. Vérifiez votre connexion Internet
2. Désactivez temporairement le pare-feu
3. Vérifiez que les règles Firestore sont en mode test
4. Attendez quelques minutes (latence de configuration Firebase)

### Problème : APK Trop Volumineux

**Solutions :**

- Utilisez App Bundle au lieu d'APK : `./gradlew bundleRelease`
- Activez la compression dans `build.gradle` :
  ```gradle
  android {
      buildTypes {
          release {
              minifyEnabled true
              shrinkResources true
          }
      }
  }
  ```

---

## Checklist Finale Avant Distribution

- [ ] Firebase configuré et fonctionnel
- [ ] Authentication testée avec plusieurs comptes
- [ ] Firestore stocke correctement les données
- [ ] Géolocalisation fonctionne
- [ ] Carte affiche correctement les marqueurs
- [ ] Filtres fonctionnent
- [ ] APK signé généré
- [ ] Testé sur au moins un appareil physique
- [ ] Icône de l'application personnalisée (optionnel)
- [ ] Nom de l'application vérifié dans `capacitor.config.json`

---

## Prochaines Étapes

Une fois l'APK fonctionnel :

1. **Tests Utilisateurs** : Distribuez à un groupe test
2. **Corrections de Bugs** : Basé sur les retours
3. **Optimisations** : Performance et UX
4. **Publication Play Store** : Créez un compte développeur Google ($25 unique)
5. **Maintenance** : Mises à jour régulières

---

## Ressources Utiles

- **Ionic Docs** : https://ionicframework.com/docs
- **Capacitor Docs** : https://capacitorjs.com/docs
- **Firebase Docs** : https://firebase.google.com/docs
- **Android Studio** : https://developer.android.com/studio/intro

---

**Bon développement ! 🚀**

Si vous rencontrez des problèmes non couverts ici, consultez la documentation ou les forums communautaires Ionic/Capacitor.
