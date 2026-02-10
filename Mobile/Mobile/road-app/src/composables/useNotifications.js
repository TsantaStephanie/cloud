import { ref, onMounted, onUnmounted } from 'vue';
import notificationService from '@/services/notificationService';

export function useNotifications() {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isListening = ref(false);

  // Écouter les nouvelles notifications
  const handleNewNotification = (event) => {
    const notification = event.detail;
    notifications.value.unshift(notification);
    
    // Incrémenter le compteur de non lus
    if (!notification.read) {
      unreadCount.value++;
    }
    
    // Émettre un événement personnalisé
    console.log('Notification reçue:', notification);
  };

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    unreadCount.value = 0;
  };

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      notifications.value.splice(index, 1);
    }
  };

  // Vider toutes les notifications
  const clearNotifications = () => {
    notifications.value = [];
    unreadCount.value = 0;
  };

  // Envoyer une notification de test
  const sendTestNotification = async (type = 'new_report') => {
    const testData = {
      id: 'test-' + Date.now(),
      description: 'Ceci est une notification de test',
      type: 'Test',
      gravite: 'Test',
      location: 'Test Location',
      createdAt: new Date().toISOString()
    };

    switch (type) {
      case 'new_report':
        await notificationService.notifyNewReport(testData);
        break;
      case 'emergency':
        await notificationService.notifyEmergency(testData);
        break;
      case 'status_change':
        await notificationService.notifyStatusChange(testData, 'ancien', 'nouveau');
        break;
      default:
        await notificationService.notifyNewReport(testData);
    }
  };

  // Initialiser l'écoute
  onMounted(() => {
    window.addEventListener('newNotification', handleNewNotification);
    isListening.value = true;
  });

  // Nettoyer l'écoute
  onUnmounted(() => {
    window.removeEventListener('newNotification', handleNewNotification);
    isListening.value = false;
  });

  return {
    // State
    notifications,
    unreadCount,
    isListening,
    
    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    sendTestNotification
  };
}
