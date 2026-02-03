import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration Firebase - à remplacer avec vos vraies configurations
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "votre-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "votre-projet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "votre-projet-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "votre-projet.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "votre-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Références aux collections
export const collections = {
  utilisateurs: collection(db, 'utilisateurs'),
  routes_endommagees: collection(db, 'routesEndommagees')
};

// Types pour les documents Firestore
export interface Utilisateur {
  id?: string;
  email: string;
  mot_de_passe_hash: string;
  role: 'admin' | 'utilisateur';
  date_creation: Timestamp;
}

export interface RouteEndommagee {
  id?: string;
  utilisateur_id?: string;
  latitude: number;
  longitude: number;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description?: string;
  statut: 'nouveau' | 'verifie' | 'en_cours' | 'termine';
  longueur_km?: number;
  surface_m2?: number;
  budget?: number;
  entreprise?: string;
  date_creation: Timestamp;
  date_mise_a_jour: Timestamp;
}

// Fonctions utilitaires pour convertir les timestamps
export const timestampToDate = (timestamp: Timestamp): Date => timestamp.toDate();
export const dateToTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

export default app;
