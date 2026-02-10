import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useHistoriqueStore } from '@/stores/historique';
import { useReportsStore } from '@/stores/reports';

export function useRealtimeSync() {
  const historiqueStore = useHistoriqueStore();
  const reportsStore = useReportsStore();
  const isListening = ref(false);
  const lastSync = ref(null);
  
  let unsubscribeHistorique = null;
  let unsubscribeReports = null;

  // Écouter les changements en temps réel
  const startRealtimeSync = () => {
    if (isListening.value) return;
    
    console.log('🔄 Démarrage de la synchronisation temps réel...');
    
    // 1. Écouter les changements d'historique
    const historiqueQuery = query(
      collection(db, 'historique_changement'),
      orderBy('dateChangement', 'desc')
    );
    
    unsubscribeHistorique = onSnapshot(historiqueQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newChange = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          console.log('🆕 Nouveau changement détecté:', newChange);
          
          // Ajouter à l'historique local
          historiqueStore.historique.unshift(newChange);
          
          // Notification
          showNotification(newChange);
        }
      });
      
      lastSync.value = new Date();
      console.log('✅ Historique synchronisé à', lastSync.value);
    }, (error) => {
      console.error('❌ Erreur synchronisation historique:', error);
    });
    
    // 2. Écouter les changements de signalements
    const reportsQuery = query(
      collection(db, 'routesEndommagees'),
      orderBy('dateMiseAJour', 'desc')
    );
    
    unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const updatedReport = {
            id: change.doc.id,
            ...change.doc.data()
          };
          
          console.log('🔄 Signalement modifié détecté:', updatedReport);
          
          // Mettre à jour le store local
          const index = reportsStore.reports.findIndex(r => r.id === updatedReport.id);
          if (index !== -1) {
            reportsStore.reports[index] = updatedReport;
          }
          
          // Notification de modification
          showReportNotification(updatedReport);
        }
      });
      
      console.log('✅ Signalements synchronisés');
    }, (error) => {
      console.error('❌ Erreur synchronisation signalements:', error);
    });
    
    isListening.value = true;
  };
  
  // Arrêter l'écoute
  const stopRealtimeSync = () => {
    if (unsubscribeHistorique) {
      unsubscribeHistorique();
      unsubscribeHistorique = null;
    }
    
    if (unsubscribeReports) {
      unsubscribeReports();
      unsubscribeReports = null;
    }
    
    isListening.value = false;
    console.log('⏹️ Synchronisation temps réel arrêtée');
  };
  
  // Notification pour nouveaux changements
  const showNotification = (change) => {
    const typeLabels = {
      'creation': '🆕 Création',
      'modification': '✏️ Modification',
      'statut': '🔄 Changement de statut',
      'suppression': '🗑️ Suppression'
    };
    
    const message = `${typeLabels[change.typeChangement]} - ${change.champModifie}`;
    
    // Notification navigateur
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouveau changement détecté', {
        body: message,
        icon: '/icon.png',
        badge: '/icon.png'
      });
    }
    
    // Notification dans l'app (vous pouvez ajouter un toast Ionic ici)
    console.log('🔔 Notification:', message);
  };
  
  // Notification pour modifications de signalements
  const showReportNotification = (report) => {
    const message = `Signalement modifié: ${report.description?.substring(0, 50)}...`;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Signalement mis à jour', {
        body: message,
        icon: '/icon.png',
        badge: '/icon.png'
      });
    }
    
    console.log('🔔 Notification signalement:', message);
  };
  
  // Demander la permission de notification
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Permission notification:', permission);
      return permission === 'granted';
    }
    return true;
  };
  
  // Nettoyage au démontage
  onMounted(async () => {
    await requestNotificationPermission();
    startRealtimeSync();
  });
  
  onUnmounted(() => {
    stopRealtimeSync();
  });
  
  return {
    isListening,
    lastSync,
    startRealtimeSync,
    stopRealtimeSync,
    requestNotificationPermission
  };
}
