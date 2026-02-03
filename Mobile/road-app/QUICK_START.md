# 🚀 Quick Start Guide - Antananarivo Road App

## Pour tester rapidement l'application (5 minutes)

### Option 1 : Test en Navigateur (Le plus rapide)

1. **Extraire le projet**
   ```bash
   tar -xzf antananarivo-road-app.tar.gz
   cd antananarivo-road-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```
   ⏱️ Durée : 2-3 minutes

3. **Configurer Firebase (Temporairement avec démo)**
   
   Pour un test rapide, vous pouvez utiliser une configuration Firebase de démonstration (non recommandé en production).
   
   Ou créez rapidement votre projet Firebase :
   - Allez sur https://console.firebase.google.com/
   - Créez un projet (30 secondes)
   - Activez Authentication (Email/Password)
   - Activez Firestore (Mode test)
   - Copiez la config dans `src/firebase/config.js`

4. **Lancer l'application**
   ```bash
   npm run dev
   ```

5. **Ouvrir dans le navigateur**
   - URL : http://localhost:8100
   - Ouvrez Chrome DevTools (F12)
   - Activez le mode mobile (Ctrl+Shift+M)
   - Sélectionnez "iPhone 12 Pro" ou similaire

6. **Tester avec les comptes démo**
   - Cliquez sur les boutons "Admin" ou "Utilisateur" sur la page de connexion
   - Ou entrez manuellement :
     - Admin : admin@route.mg / admin
     - User : user1@route.mg / user1

---

### Option 2 : Test sur Android (15-20 minutes)

**Prérequis** : Android Studio installé

1. **Suivre les étapes 1-3 de l'Option 1**

2. **Build l'application**
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```

3. **Dans Android Studio**
   - Attendez la synchronisation Gradle (5 minutes)
   - Créez un émulateur (Device Manager → Create Device → Pixel 5)
   - Cliquez sur Run ▶️
   - L'app s'installe et se lance

4. **Configurer la géolocalisation sur l'émulateur**
   - Cliquez sur "..." sur le panneau de l'émulateur
   - Allez dans "Location"
   - Entrez : Latitude `-18.8792`, Longitude `47.5079`
   - Cliquez "Send"

5. **Tester l'application**
   - Connectez-vous avec admin@route.mg / admin
   - Créez un signalement
   - Visualisez-le sur la carte

---

## 🎯 Checklist de Test Rapide

### Tests de Base (5 minutes)
- [ ] L'application se lance correctement
- [ ] La page de connexion s'affiche bien
- [ ] Connexion avec admin@route.mg fonctionne
- [ ] Navigation entre les onglets (Carte, Signaler, Signalements, Profil)
- [ ] La carte OpenStreetMap se charge
- [ ] Les filtres de la carte fonctionnent

### Tests Complets (15 minutes)
- [ ] Géolocalisation activée et fonctionnelle
- [ ] Création d'un nouveau signalement réussie
- [ ] Le signalement apparaît sur la carte
- [ ] Le signalement apparaît dans la liste
- [ ] Filtres par gravité fonctionnent
- [ ] Filtre "Mes signalements" fonctionne (si authentifié)
- [ ] Admin peut changer les statuts
- [ ] Statistiques du profil s'affichent
- [ ] Déconnexion fonctionne

---

## 🐛 Problèmes Courants et Solutions Rapides

### "Firebase ne se connecte pas"
**Solution** : Vérifiez que vous avez bien configuré `src/firebase/config.js` avec vos vraies credentials Firebase.

### "npm install échoue"
**Solution** : 
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "La carte ne se charge pas"
**Solution** : Vérifiez votre connexion Internet. OpenStreetMap nécessite une connexion active.

### "Géolocalisation ne fonctionne pas"
**Solution sur navigateur** : Autorisez la géolocalisation quand Chrome demande.
**Solution sur émulateur** : Configurez manuellement la position (voir étapes ci-dessus).

### "Gradle sync failed" dans Android Studio
**Solution** :
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

---

## 📚 Prochaines Étapes

Une fois le test rapide terminé :

1. **Lisez le README.md** pour la documentation complète
2. **Consultez SETUP_GUIDE.md** pour un guide détaillé Android
3. **Explorez PROJECT_SUMMARY.md** pour comprendre l'architecture
4. **Utilisez migrate-to-firebase.js** pour importer vos données PostgreSQL

---

## 💡 Conseils pour une Démo Réussie

1. **Préparez des données** : Créez 5-10 signalements de test avant la démo
2. **Testez la connexion** : Vérifiez que Firebase fonctionne bien
3. **Vérifiez la géolocalisation** : Assurez-vous qu'elle est activée
4. **Ayez un backup** : Gardez quelques captures d'écran au cas où
5. **Préparez les comptes** : Ayez les identifiants prêts (admin/user)

---

## 🎨 Points à Montrer dans une Démo

### Design
- Palette de couleurs Navy Blue & Cream White
- Typographie élégante (Playfair Display + Work Sans)
- Animations fluides
- Interface intuitive

### Fonctionnalités Utilisateur
- Connexion rapide (démo accounts)
- Géolocalisation automatique
- Création de signalement en 3 clics
- Carte interactive avec filtres
- Statistiques personnelles

### Fonctionnalités Admin
- Changement de statut en temps réel
- Vue d'ensemble complète
- Gestion des signalements

---

## 📱 Pour Installer sur Votre Téléphone

**Si vous avez l'APK** :
1. Transférez `app-debug.apk` sur votre téléphone
2. Autorisez l'installation depuis des sources inconnues
3. Installez l'APK
4. Lancez "Antananarivo Roads"

**Pour générer l'APK** :
```bash
cd android
./gradlew assembleDebug
# L'APK sera dans : android/app/build/outputs/apk/debug/
```

---

## ⏱️ Temps Estimés

| Tâche | Durée |
|-------|-------|
| Installation Node.js | 5 min |
| npm install | 2-3 min |
| Créer projet Firebase | 2 min |
| Test en navigateur | 2 min |
| Installation Android Studio | 15 min |
| Premier build Android | 10 min |
| **Total test navigateur** | **~10 min** |
| **Total test Android** | **~35 min** |

---

## 🎯 Résultat Attendu

Après avoir suivi ce guide, vous devriez avoir :

✅ Une application fonctionnelle sur navigateur OU Android  
✅ Capacité à créer des signalements géolocalisés  
✅ Visualisation sur carte interactive  
✅ Système d'authentification opérationnel  
✅ Filtres et statistiques qui fonctionnent  

---

## 📞 Besoin d'Aide ?

- Consultez les fichiers README.md et SETUP_GUIDE.md
- Vérifiez la console du navigateur (F12) pour les erreurs
- Vérifiez les logs Android Studio (onglet Logcat)

---

**Bonne découverte de l'application ! 🚀**