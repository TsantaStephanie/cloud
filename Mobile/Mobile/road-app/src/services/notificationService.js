// Service de notifications pour navigateur (laptop/desktop) - pas de dépendances Capacitor
class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.permissionGranted = false;
    this.subscribers = [];
  }

  async initialize() {
    try {
      // Vérifier la permission pour les notifications du navigateur
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        this.permissionGranted = permission === 'granted';
        
        if (this.permissionGranted) {
          console.log('✅ Notifications autorisées sur le navigateur');
        } else {
          console.log('⚠️ Notifications non autorisées');
        }
      } else {
        console.warn('❌ Notifications non supportées par ce navigateur');
        this.permissionGranted = false;
      }

      this.isInitialized = true;
      console.log('🔔 Service de notifications initialisé (mode navigateur)');
    } catch (error) {
      console.error('❌ Erreur d\'initialisation des notifications:', error);
    }
  }

  async handlePushNotification(notification) {
    const data = notification.data || notification;
    
    // Afficher une notification locale
    await this.showLocalNotification({
      title: data.title || 'Nouveau signalement',
      body: data.body || 'Un nouveau signalement a été ajouté',
      data: data,
      largeBody: data.largeBody || 'Cliquez pour voir les détails'
    });

    // Émettre un événement pour les autres composants
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: data
    }));
  }

  async showLocalNotification(options) {
    try {
      if (!this.permissionGranted) {
        console.log('🔕 Permission de notification non accordée');
        return;
      }

      // Utiliser l'API Notification du navigateur
      if ('Notification' in window) {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: '/icon.png',
          badge: '/icon.png',
          tag: options.data?.reportId || 'default',
          data: options.data || {},
          requireInteraction: true
        });

        // Gérer le clic sur la notification
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Naviguer vers le rapport si disponible
          if (options.data?.reportId) {
            // Émettre un événement de navigation
            window.dispatchEvent(new CustomEvent('navigateToReport', {
              detail: { reportId: options.data.reportId }
            }));
          }
        };

        // Auto-fermeture après 8 secondes
        setTimeout(() => {
          notification.close();
        }, 8000);
      }
    } catch (error) {
      console.error('❌ Erreur d\'envoi de notification locale:', error);
    }
  }

  async notifyNewReport(reportData) {
    const notification = {
      title: '🚨 Nouveau Signalement',
      body: `${reportData.description?.substring(0, 60) || 'Nouveau problème routier'}...`,
      largeBody: `Type: ${reportData.type || 'Non spécifié'}\nGravité: ${reportData.gravite || 'Non spécifiée'}\nLieu: ${reportData.location || 'Non spécifié'}`,
      data: {
        type: 'new_report',
        reportId: reportData.id,
        reportData: reportData
      }
    };

    await this.showLocalNotification(notification);
    console.log('📝 Notification nouveau signalement envoyée:', notification);
  }

  async notifyReportUpdate(reportData, changeType) {
    const changeLabels = {
      'creation': 'Créé',
      'modification': 'Modifié',
      'statut': 'Statut changé',
      'suppression': 'Supprimé'
    };

    const notification = {
      title: '📝 Mise à jour de Signalement',
      body: `Un signalement a été ${changeType || 'modifié'}`,
      largeBody: `Changement: ${changeLabels[changeType] || changeType}\nDescription: ${reportData.description?.substring(0, 50) || 'Non spécifiée'}...`,
      data: {
        type: 'report_update',
        reportId: reportData.id,
        changeType: changeType,
        reportData: reportData
      }
    };

    await this.showLocalNotification(notification);
    console.log('📝 Notification mise à jour envoyée:', notification);
  }

  async notifyStatusChange(reportData, oldStatus, newStatus) {
    const notification = {
      title: '🔄 Changement de Statut',
      body: `Statut changé de "${oldStatus}" vers "${newStatus}"`,
      largeBody: `Signalement: ${reportData.description?.substring(0, 50) || 'Non spécifiée'}...\nAncien statut: ${oldStatus}\nNouveau statut: ${newStatus}`,
      data: {
        type: 'status_change',
        reportId: reportData.id,
        oldStatus: oldStatus,
        newStatus: newStatus,
        reportData: reportData
      }
    };

    await this.showLocalNotification(notification);
    console.log('🔄 Notification changement statut envoyée:', notification);
  }

  async notifyAssignment(reportData, assignedTo) {
    const notification = {
      title: '👋 Nouvelle Assignation',
      body: `Un signalement vous a été assigné`,
      largeBody: `Assigné à: ${assignedTo}\nSignalement: ${reportData.description?.substring(0, 50) || 'Non spécifiée'}...`,
      data: {
        type: 'assignment',
        reportId: reportData.id,
        assignedTo: assignedTo,
        reportData: reportData
      }
    };

    await this.showLocalNotification(notification);
    console.log('👋 Notification assignation envoyée:', notification);
  }

  async notifyEmergency(reportData) {
    const notification = {
      title: '🚨 URGENT',
      body: `Signalement urgent détecté!`,
      largeBody: `URGENT: ${reportData.description?.substring(0, 100) || 'Problème urgent'}\nGravité: ${reportData.gravite || 'Critique'}\nLocalisation: ${reportData.location || 'Non spécifiée'}`,
      data: {
        type: 'emergency',
        reportId: reportData.id,
        reportData: reportData
      }
    };

    await this.showLocalNotification(notification);
    console.log('🚨 Notification d\'urgence envoyée:', notification);
  }

  async saveToken(token) {
    try {
      // Sauvegarder le token dans le localStorage pour l'envoyer au backend
      localStorage.setItem('pushToken', token);
      
      // Envoyer le token au backend
      await this.sendTokenToBackend(token);
    } catch (error) {
      console.error('❌ Erreur de sauvegarde du token:', error);
    }
  }

  async sendTokenToBackend(token) {
    try {
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          platform: navigator.platform || 'web',
          userId: localStorage.getItem('userId') || null
        })
      });

      if (!response.ok) {
        throw new Error('Erreur d\'enregistrement du token');
      }

      const result = await response.json();
      console.log('✅ Token enregistré avec succès:', result);
    } catch (error) {
      console.error('❌ Erreur d\'envoi du token au backend:', error);
    }
  }

  async clearNotifications() {
    try {
      // Fermer toutes les notifications actives
      if ('Notification' in window) {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(n => n.close());
      }
    } catch (error) {
      console.error('❌ Erreur de nettoyage des notifications:', error);
    }
  }

  // S'abonner aux notifications
  subscribe(callback) {
    this.subscribers.push(callback);
  }

  // Se désabonner
  unsubscribe(callback) {
    const index = this.subscribers.indexOf(callback);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  // Notifier tous les abonnés
  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  getPermissionStatus() {
    return this.permissionGranted;
  }

  isReady() {
    return this.isInitialized;
  }

  // Méthode pour tester les notifications
  async testNotification() {
    const testNotification = {
      title: '🧪 Test de Notification',
      body: 'Ceci est une notification de test sur votre laptop',
      largeBody: 'Test du système de notifications pour l\'administration',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };

    await this.showLocalNotification(testNotification);
    console.log('🧪 Notification de test envoyée');
  }
}

export default new NotificationService();
