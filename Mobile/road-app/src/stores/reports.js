// src/stores/reports.js
import { defineStore } from 'pinia';
import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthStore } from './auth';

export const useReportsStore = defineStore('reports', {
  state: () => ({
    reports: [],
    myReports: [],
    loading: false,
    error: null,
    filters: {
      showOnlyMine: false,
      severity: null,
      status: null
    }
  }),

  getters: {
    filteredReports: (state) => {
      let filtered = state.filters.showOnlyMine ? state.myReports : state.reports;
      
      if (state.filters.severity) {
        filtered = filtered.filter(r => r.gravite === state.filters.severity);
      }
      
      if (state.filters.status) {
        filtered = filtered.filter(r => r.statut === state.filters.status);
      }
      
      return filtered;
    },

    severityCounts: (state) => {
      const counts = { faible: 0, moyenne: 0, elevee: 0, critique: 0 };
      state.reports.forEach(report => {
        if (report.gravite) counts[report.gravite]++;
      });
      return counts;
    }
  },

  actions: {
    async fetchReports() {
      this.loading = true;
      try {
        const q = query(collection(db, 'routesEndommagees'));
        const snapshot = await getDocs(q);
        console.log('📊 Documents récupérés:', snapshot.docs.length);
        this.reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('✅ Données chargées:', this.reports.length, 'rapports');
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching reports:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchMyReports() {
      const authStore = useAuthStore();
      if (!authStore.user) return;

      this.loading = true;
      try {
        const q = query(
          collection(db, 'routesEndommagees'),
          where('utilisateurId', '==', authStore.user.uid),
          orderBy('dateCreation', 'desc')
        );
        const snapshot = await getDocs(q);
        this.myReports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        this.error = error.message;
        console.error('Error fetching my reports:', error);
      } finally {
        this.loading = false;
      }
    },

    async createReport(reportData) {
      console.log('🏪 createReport appelé avec:', reportData);
      const authStore = useAuthStore();
      console.log('👤 Utilisateur connecté:', authStore.user);
      
      // Créer les données utilisateur si nécessaire
      if (authStore.user && !authStore.userData) {
        console.log('📝 Création des données utilisateur pour le signalement');
        try {
          const newUser = {
            email: authStore.user.email,
            role: 'visiteur',
            dateCreation: new Date(),
            nom: authStore.user.displayName || 'Utilisateur'
          };
          
          await setDoc(doc(db, 'utilisateurs', authStore.user.uid), newUser);
          authStore.userData = { id: authStore.user.uid, ...newUser };
          console.log('✅ Données utilisateur créées pour le signalement');
        } catch (error) {
          console.error('💥 Erreur création données utilisateur:', error);
        }
      }
      
      this.loading = true;
      try {
        // Harmoniser le format avec le frontend-visiteur
        const newReport = {
          utilisateurId: authStore.user?.uid || null,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          gravite: reportData.gravite,
          description: reportData.description || '',
          statut: 'nouveau', // Utiliser 'nouveau' au lieu de 'signale'
          longueurKm: reportData.longueur_km || 0,
          surfaceM2: reportData.surface_m2 || null,
          budget: reportData.budget || null,
          entreprise: reportData.entreprise || null,
          dateCreation: serverTimestamp(),
          dateMiseAJour: serverTimestamp()
        };
        
        console.log('📄 Nouveau rapport à créer (format harmonisé):', newReport);
        
        const docRef = await addDoc(collection(db, 'routesEndommagees'), newReport);
        console.log('✅ Document créé avec ID:', docRef.id);
        
        // Rafraîchir les données dans les deux applications
        await this.fetchReports();
        console.log('🔄 Données rafraîchies dans l\'application mobile');
        
        // Notifier le frontend-visiteur qu'il y a de nouvelles données
        this.notifyDataUpdate();
        
        return docRef.id;
      } catch (error) {
        console.error('💥 Erreur lors de la création:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
        console.log('🏁 Fin de createReport');
      }
    },

    // Nouvelle méthode pour notifier les mises à jour aux autres applications
    notifyDataUpdate() {
      // Créer un événement personnalisé ou utiliser un mécanisme de notification
      console.log('📢 Notification de mise à jour envoyée au frontend-visiteur');
      
      // Option 1: Utiliser un champ de métadonnées dans Firebase
      const notificationRef = doc(db, 'system', 'lastUpdate');
      updateDoc(notificationRef, {
        timestamp: serverTimestamp(),
        source: 'mobile-app',
        action: 'new-report'
      }).catch(() => {
        // Si le document n'existe pas, le créer
        setDoc(notificationRef, {
          timestamp: serverTimestamp(),
          source: 'mobile-app',
          action: 'new-report'
        });
      });
    },

    async updateReportStatus(reportId, newStatus) {
      try {
        const reportRef = doc(db, 'routesEndommagees', reportId);
        await updateDoc(reportRef, {
          statut: newStatus,
          date_mise_a_jour: serverTimestamp()
        });
        await this.fetchReports();
        await this.fetchMyReports();
      } catch (error) {
        this.error = error.message;
        console.error('Error updating report:', error);
      }
    },

    setFilter(filterType, value) {
      this.filters[filterType] = value;
    },

    clearFilters() {
      this.filters = {
        showOnlyMine: false,
        severity: null,
        status: null
      };
    }
  }
});