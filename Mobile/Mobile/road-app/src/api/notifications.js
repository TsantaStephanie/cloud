const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

// Enregistrer un token push
export const registerPushToken = async (token, userId, platform) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        token,
        userId,
        platform,
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur d\'enregistrement du token');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur d\'enregistrement du token push:', error);
    throw error;
  }
};

// Envoyer une notification push à tous les utilisateurs
export const sendBulkNotification = async (notificationData, targetUsers = null, channels = ['mobile']) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          largeBody: notificationData.largeBody,
          data: notificationData.data || {},
          sound: 'default',
          priority: notificationData.priority || 'normal'
        },
        targetUsers, // null pour tous, ou tableau d'IDs
        channels,
        options: {
          ttl: 3600, // 1 heure en secondes
          collapseKey: notificationData.collapseKey || null
        }
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

// Envoyer une notification ciblée
export const sendTargetedNotification = async (userId, notificationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/targeted`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        userId,
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          largeBody: notificationData.largeBody,
          data: notificationData.data || {},
          sound: 'default'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur d\'envoi de notification ciblée');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur d\'envoi de notification ciblée:', error);
    throw error;
  }
};

// Récupérer les paramètres de notification d'un utilisateur
export const getUserNotificationSettings = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/settings/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur de récupération des paramètres');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur de récupération des paramètres de notification:', error);
    throw error;
  }
};

// Mettre à jour les paramètres de notification d'un utilisateur
export const updateUserNotificationSettings = async (userId, settings) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/settings/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(settings)
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

// Récupérer les notifications envoyées
export const getSentNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/sent?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur de récupération des notifications envoyées');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur de récupération des notifications envoyées:', error);
    throw error;
  }
};

// Supprimer un token push
export const unregisterPushToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/unregister-token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ token })
    });

    if (!response.ok) {
      throw new Error('Erreur de suppression du token');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur de suppression du token:', error);
    throw error;
  }
};

// Récupérer les statistiques de notifications
export const getNotificationStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur de récupération des statistiques');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur de récupération des statistiques:', error);
    throw error;
  }
};
