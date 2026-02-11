// src/stores/historique.js
import { defineStore } from 'pinia';
import { db } from '@/firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { useAuthStore } from './auth';

export const useHistoriqueStore = defineStore('historique', {
  state: () => ({
    historique: [],
    loading: false,
    error: null
  }),

  getters: {
    historiqueParSignalement: (state) => (signalementId) => {
      return state.historique.filter(item => item.signalementId === signalementId);
    },

    historiqueRecent: (state) => {
      return state.historique.slice(0, 20); // 20 derniers changements
    }
  },

  actions: {
    async ajouterChangement(signalementId, typeChangement, ancienneValeur, nouvelleValeur, champModifie) {
      const authStore = useAuthStore();
      
      try {
        const changement = {
          signalementId: signalementId,
          typeChangement: typeChangement, // 'creation', 'modification', 'statut', 'suppression'
          champModifie: champModifie, // 'gravite', 'statut', 'description', etc.
          ancienneValeur: ancienneValeur,
          nouvelleValeur: nouvelleValeur,
          utilisateurId: authStore.user?.uid || null,
          utilisateurEmail: authStore.user?.email || null,
          dateChangement: serverTimestamp(),
          timestamp: Date.now() // Pour le tri côté client
        };

        console.log('📝 Ajout au historique:', changement);
        
        const docRef = await addDoc(collection(db, 'historique_changement'), changement);
        console.log('✅ Changement enregistré dans l\'historique:', docRef.id);
        
        // Rafraîchir l'historique
        await this.fetchHistorique();
        
        return docRef.id;
      } catch (error) {
        console.error('❌ Erreur ajout historique:', error);
        this.error = error.message;
        return null;
      }
    },

    async fetchHistorique() {
      this.loading = true;
      try {
        const q = query(
          collection(db, 'historique_changement'),
          orderBy('dateChangement', 'desc')
        );
        
        const snapshot = await getDocs(q);
        this.historique = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('📊 Historique chargé:', this.historique.length, 'changements');
      } catch (error) {
        this.error = error.message;
        console.error('❌ Erreur fetch historique:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchHistoriqueSignalement(signalementId) {
      this.loading = true;
      try {
        const q = query(
          collection(db, 'historique_changement'),
          where('signalementId', '==', signalementId),
          orderBy('dateChangement', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const historiqueSignalement = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`📊 Historique du signalement ${signalementId}:`, historiqueSignalement.length, 'changements');
        return historiqueSignalement;
      } catch (error) {
        this.error = error.message;
        console.error('❌ Erreur fetch historique signalement:', error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    // Méthode utilitaire pour formater l'affichage
    formaterChangement(changement) {
      const typeLabels = {
        'creation': '🆕 Création',
        'modification': '✏️ Modification',
        'statut': '🔄 Changement de statut',
        'suppression': '🗑️ Suppression'
      };

      const champLabels = {
        'gravite': 'Gravité',
        'statut': 'Statut',
        'description': 'Description',
        'longueurKm': 'Longueur',
        'surfaceM2': 'Surface',
        'budget': 'Budget',
        'entreprise': 'Entreprise',
        'imageUrl': 'Image principale',
        'images': 'Images'
      };

      return {
        ...changement,
        typeLabel: typeLabels[changement.typeChangement] || changement.typeChangement,
        champLabel: champLabels[changement.champModifie] || changement.champModifie
      };
    }
  }
});
