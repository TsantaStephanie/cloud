import { db } from './firebase';
import { doc, onSnapshot, collection, DocumentSnapshot, QuerySnapshot, Timestamp } from 'firebase/firestore';
import { routeService } from './services';
import { RouteEndommagee } from '../types/firebase';

// Service de synchronisation en temps réel pour écouter les mises à jour depuis l'application mobile
export const syncService = {
  listeners: new Map<string, () => void>(),
  
  // Écouter les mises à jour de la collection routesEndommagees
  listenToRouteUpdates(callback: (routes: RouteEndommagee[]) => void): () => void {
    console.log('👂 Démarrage de l\'écoute des mises à jour des routes...');
    
    // Écouter tous les changements dans la collection
    const unsubscribe = onSnapshot(
      collection(db, 'routesEndommagees'),
      (snapshot: QuerySnapshot) => {
        console.log('📡 Nouvelles données reçues de Firebase:', snapshot.docChanges().length, 'changements');
        
        const routes = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            routeId: doc.id,
            ...data,
            dateCreation: data.dateCreation?.toDate() || new Date(),
            dateMiseAJour: data.dateMiseAJour?.toDate() || new Date()
          } as RouteEndommagee;
        });
        
        console.log('🔄 Routes mises à jour:', routes.length, 'éléments');
        callback(routes);
      },
      (error: Error) => {
        console.error('💥 Erreur d\'écoute des mises à jour:', error);
      }
    );
    
    this.listeners.set('routes', unsubscribe);
    return unsubscribe;
  },
  
  // Écouter les notifications système
  listenToSystemNotifications(callback: (notification: { timestamp: Timestamp; source: string; action: string }) => void): () => void {
    console.log('👂 Démarrage de l\'écoute des notifications système...');
    
    const unsubscribe = onSnapshot(
      doc(db, 'system', 'lastUpdate'),
      (snapshot: DocumentSnapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log('📢 Notification système reçue:', data);
          callback(data as { timestamp: Timestamp; source: string; action: string });
        }
      },
      (error: Error) => {
        console.error('💥 Erreur d\'écoute des notifications système:', error);
      }
    );
    
    this.listeners.set('system', unsubscribe);
    return unsubscribe;
  },
  
  // Arrêter tous les listeners
  stopAllListeners(): void {
    console.log('🛑 Arrêt de tous les listeners de synchronisation...');
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log(`✅ Listener ${key} arrêté`);
    });
    this.listeners.clear();
  },
  
  // Arrêter un listener spécifique
  stopListener(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
      console.log(`✅ Listener ${key} arrêté`);
    }
  }
};

// Hook React pour utiliser la synchronisation
export const useRealtimeSync = (onRoutesUpdate: (routes: RouteEndommagee[]) => void) => {
  // Cette fonction peut être utilisée dans les composants React
  // pour gérer la synchronisation en temps réel
  
  const startSync = () => {
    console.log('🚀 Démarrage de la synchronisation en temps réel...');
    
    // Écouter les mises à jour des routes
    const unsubscribeRoutes = syncService.listenToRouteUpdates((routes) => {
      console.log('🔄 Mise à jour des routes en temps réel:', routes.length);
      onRoutesUpdate(routes);
    });
    
    // Écouter les notifications système
    const unsubscribeSystem = syncService.listenToSystemNotifications((notification) => {
      console.log('📢 Notification système:', notification);
      
      // Si la notification vient de l'application mobile, rafraîchir les données
      if (notification.source === 'mobile-app' && notification.action === 'new-report') {
        console.log('📱 Nouveau signalement depuis l\'application mobile, rafraîchissement...');
        routeService.getAll().then(routes => {
          onRoutesUpdate(routes);
        });
      }
    });
    
    return () => {
      unsubscribeRoutes();
      unsubscribeSystem();
    };
  };
  
  return { startSync };
};
