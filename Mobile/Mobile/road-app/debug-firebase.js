// debug-firebase.js - Fichier de test pour la connexion Firebase
import { auth } from './src/firebase/config.js';
import { onAuthStateChanged } from 'firebase/auth';

console.log('🔥 Test de connexion Firebase...');

// Test 1: Vérifier si Firebase est bien initialisé
console.log('Auth object:', auth);
console.log('Firebase app:', auth.app);

// Test 2: Écouter les changements d'authentification
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('✅ Utilisateur connecté:', user.email);
    console.log('UID:', user.uid);
    console.log('Token:', user.accessToken);
  } else {
    console.log('❌ Aucun utilisateur connecté');
  }
});

// Test 3: Vérifier l'état actuel
console.log('État actuel:', auth.currentUser);

export { auth };
