// src/stores/auth.js
import { defineStore } from 'pinia';
import { auth, db } from '@/firebase/config';
import { 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userData: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => {
      const isAuth = !!state.user;
      console.log('🔍 isAuthenticated check:', { 
        user: !!state.user, 
        userEmail: state.user?.email, 
        result: isAuth 
      });
      return isAuth;
    },
    isAdmin: (state) => state.userData?.role === 'admin',
    userRole: (state) => state.userData?.role || 'visiteur'
  },

  actions: {
    async login(email, password) {
      console.log(' Tentative de login avec:', email);
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        console.log(' Login réussi pour:', userCredential.user.uid);
        return true;
      } catch (error) {
        console.error(' Erreur de login:', error.message);
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserData(uid) {
      try {
        const userDoc = await getDoc(doc(db, 'utilisateurs', uid));
        if (userDoc.exists()) {
          this.userData = { id: userDoc.id, ...userDoc.data() };
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.userData = null;
      } catch (error) {
        this.error = error.message;
      }
    },

    initAuthListener() {
      console.log(' Initialisation du listener d\'authentification');
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log(' Utilisateur connecté:', user.uid);
          this.user = user;
          await this.fetchUserData(user.uid);
          console.log(' Données utilisateur chargées:', this.userData);
        } else {
          console.log(' Utilisateur déconnecté');
          this.user = null;
          this.userData = null;
        }
      });
    }
  }
});