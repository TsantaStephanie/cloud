// src/firebase/services.js
import { db, auth } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export const routeService = {
  async getAll() {
    const q = query(collection(db, 'routesEndommagees'), orderBy('date_creation', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  async create(routeData) {
    return await addDoc(collection(db, 'routesEndommagees'), {
      ...routeData,
      date_creation: Timestamp.now(),
      date_mise_a_jour: Timestamp.now()
    });
  }
};

export const authService = {
  async signIn(email, password) {
    try {
      console.log('Tentative de connexion:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Connexion réussie:', result.user.uid);
      return result;
    } catch (error) {
      console.error('Erreur de connexion:', error.code, error.message);
      throw error;
    }
  },
  
  async signUp(email, password) {
    try {
      console.log('Tentative d\'inscription:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Inscription réussie:', result.user.uid);
      return result;
    } catch (error) {
      console.error('Erreur d\'inscription:', error.code, error.message);
      throw error;
    }
  },
  
  async signOut() {
    try {
      await signOut(auth);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error.message);
      throw error;
    }
  }
};