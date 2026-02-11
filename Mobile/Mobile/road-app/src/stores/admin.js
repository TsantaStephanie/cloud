import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAdminStore = defineStore('admin', () => {
  // State
  const notificationSettings = ref({
    newReports: true,
    updates: true,
    statusChanges: true,
    emergencies: true,
    silentMode: false
  });

  const stats = ref({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0
  });

  const recentReports = ref([]);
  const loading = ref(false);

  // Getters
  const hasNotificationsEnabled = computed(() => {
    return !notificationSettings.value.silentMode && (
      notificationSettings.value.newReports ||
      notificationSettings.value.updates ||
      notificationSettings.value.statusChanges ||
      notificationSettings.value.emergencies
    );
  });

  const activeSettingsCount = computed(() => {
    let count = 0;
    if (notificationSettings.value.newReports) count++;
    if (notificationSettings.value.updates) count++;
    if (notificationSettings.value.statusChanges) count++;
    if (notificationSettings.value.emergencies) count++;
    return count;
  });

  // Actions
  const updateNotificationSetting = async (setting, value) => {
    notificationSettings.value[setting] = value;
    
    // Sauvegarder dans localStorage
    localStorage.setItem('adminNotificationSettings', JSON.stringify(notificationSettings.value));
    
    try {
      // Envoyer au backend
      const response = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          setting,
          value
        })
      });

      if (!response.ok) {
        throw new Error('Erreur de mise à jour des paramètres');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de mise à jour des paramètres de notification:', error);
      throw error;
    }
  };

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('adminNotificationSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        notificationSettings.value = { ...notificationSettings.value, ...parsed };
      } catch (error) {
        console.error('Erreur de chargement des paramètres:', error);
      }
    }
  };

  const updateStats = (newStats) => {
    stats.value = { ...stats.value, ...newStats };
  };

  const addRecentReport = (report) => {
    recentReports.value.unshift(report);
    // Garder seulement les 20 plus récents
    if (recentReports.value.length > 20) {
      recentReports.value = recentReports.value.slice(0, 20);
    }
  };

  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur de récupération des statistiques');
      }

      const data = await response.json();
      updateStats(data);
    } catch (error) {
      console.error('Erreur de récupération des statistiques:', error);
    } finally {
      loading.value = false;
    }
  };

  const fetchRecentReports = async () => {
    loading.value = true;
    try {
      const response = await fetch('/api/admin/reports/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur de récupération des rapports récents');
      }

      const data = await response.json();
      recentReports.value = data.reports || [];
    } catch (error) {
      console.error('Erreur de récupération des rapports récents:', error);
    } finally {
      loading.value = false;
    }
  };

  const sendBulkNotification = async (notificationData, targetUsers = null) => {
    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          notification: notificationData,
          targetUsers, // null pour tous les utilisateurs, ou tableau d'IDs
          channels: ['mobile'] // Cibler spécifiquement les mobiles
        })
      });

      if (!response.ok) {
        throw new Error('Erreur d\'envoi de notification bulk');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur d\'envoi de notification bulk:', error);
      throw error;
    }
  };

  const notifyAllUsers = async (type, data) => {
    const notifications = {
      'new_report': {
        title: '🚨 Nouveau Signalement',
        body: 'Un nouveau signalement a été ajouté',
        largeBody: `Type: ${data.type}\nDescription: ${data.description?.substring(0, 50)}...`
      },
      'emergency': {
        title: '🚨 URGENT',
        body: 'Signalement urgent détecté!',
        largeBody: `URGENT: ${data.description?.substring(0, 100)}...`
      },
      'system_update': {
        title: '🔧 Mise à jour système',
        body: 'Le système a été mis à jour',
        largeBody: 'Veuillez redémarrer l\'application'
      }
    };

    const notification = notifications[type] || notifications['new_report'];
    await sendBulkNotification({ ...notification, ...data });
  };

  const initializeStore = async () => {
    loadNotificationSettings();
    await fetchStats();
    await fetchRecentReports();
  };

  return {
    // State
    notificationSettings,
    stats,
    recentReports,
    loading,
    
    // Getters
    hasNotificationsEnabled,
    activeSettingsCount,
    
    // Actions
    updateNotificationSetting,
    loadNotificationSettings,
    updateStats,
    addRecentReport,
    fetchStats,
    fetchRecentReports,
    sendBulkNotification,
    notifyAllUsers,
    initializeStore
  };
});
