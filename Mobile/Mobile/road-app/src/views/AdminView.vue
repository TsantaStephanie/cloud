<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Administration</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshData">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="admin-container">
        <!-- Stats Overview -->
        <div class="stats-section">
          <h2 class="section-title">
            <ion-icon :icon="statsChartOutline" />
            Vue d'ensemble
          </h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="documentTextOutline" color="primary" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalReports }}</div>
                <div class="stat-label">Total Signalements</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="timeOutline" color="warning" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingReports }}</div>
                <div class="stat-label">En Attente</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="checkmarkCircleOutline" color="success" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ resolvedReports }}</div>
                <div class="stat-label">Résolus</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">
                <ion-icon :icon="peopleOutline" color="secondary" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalUsers }}</div>
                <div class="stat-label">Utilisateurs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="notification-section">
          <h2 class="section-title">
            <ion-icon :icon="notificationsOutline" />
            Paramètres de Notification
          </h2>
          
          <div class="settings-card">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Notifications pour nouveaux signalements</h3>
                <p>Recevoir une alerte quand un utilisateur signale un problème</p>
              </div>
              <ion-toggle 
                v-model="notificationSettings.newReports"
                @ionChange="updateSetting('newReports', $event.detail.value)"
                color="primary"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Notifications pour mises à jour</h3>
                <p>Recevoir une alerte quand un signalement est modifié</p>
              </div>
              <ion-toggle 
                v-model="notificationSettings.updates"
                @ionChange="updateSetting('updates', $event.detail.value)"
                color="primary"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Notifications pour changements de statut</h3>
                <p>Recevoir une alerte quand le statut d'un signalement change</p>
              </div>
              <ion-toggle 
                v-model="notificationSettings.statusChanges"
                @ionChange="updateSetting('statusChanges', $event.detail.value)"
                color="primary"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Notifications d'urgence</h3>
                <p>Recevoir immédiatement les alertes urgentes</p>
              </div>
              <ion-toggle 
                v-model="notificationSettings.emergencies"
                @ionChange="updateSetting('emergencies', $event.detail.value)"
                color="danger"
              />
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Mode silencieux</h3>
                <p>Désactiver toutes les notifications temporairement</p>
              </div>
              <ion-toggle 
                v-model="notificationSettings.silentMode"
                @ionChange="updateSetting('silentMode', $event.detail.value)"
                color="medium"
              />
            </div>
          </div>
        </div>

        <!-- Recent Reports -->
        <div class="recent-section">
          <h2 class="section-title">
            <ion-icon :icon="timeOutline" />
            Signalements Récents
          </h2>
          <div class="reports-list">
            <div 
              v-for="report in recentReports" 
              :key="report.id"
              class="report-item"
              @click="viewReport(report.id)"
            >
              <div class="report-header">
                <div class="report-type">
                  <ion-icon :icon="getReportIcon(report.type)" color="primary" />
                  <span>{{ report.type || 'Non spécifié' }}</span>
                </div>
                <div class="report-date">
                  {{ formatDate(report.createdAt) }}
                </div>
              </div>
              <div class="report-content">
                <p>{{ report.description }}</p>
                <div class="report-meta">
                  <span class="meta-item">
                    <ion-icon :icon="alertCircleOutline" color="warning" />
                    {{ report.gravite || 'Non spécifiée' }}
                  </span>
                  <span class="meta-item">
                    <ion-icon :icon="checkmarkDoneOutline" color="success" />
                    {{ report.statut || 'Non spécifié' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Notification Button -->
        <div class="test-section">
          <ion-button 
            expand="block" 
            fill="outline" 
            @click="testNotification"
            class="test-button"
          >
            <ion-icon :icon="notificationsOutline" slot="start" />
            Tester les Notifications
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonButtons,
  IonToggle,
  IonIcon
} from '@ionic/vue';
import { 
  refreshOutline,
  statsChartOutline,
  notificationsOutline,
  documentTextOutline,
  timeOutline,
  checkmarkCircleOutline,
  peopleOutline,
  alertCircleOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';
import { useReportsStore } from '@/stores/reports';
import { useAuthStore } from '@/stores/auth';
import notificationService from '@/services/notificationService';

const router = useRouter();
const reportsStore = useReportsStore();
const authStore = useAuthStore();

const loading = ref(false);
const notificationSettings = ref({
  newReports: true,
  updates: true,
  statusChanges: true,
  emergencies: true,
  silentMode: false
});

// Stats calculées
const totalReports = computed(() => reportsStore.reports.length);
const pendingReports = computed(() => 
  reportsStore.reports.filter(r => r.statut === 'en attente' || r.statut === 'nouveau').length
);
const resolvedReports = computed(() => 
  reportsStore.reports.filter(r => r.statut === 'terminé' || r.statut === 'résolu').length
);
const totalUsers = ref(0);

// Rapports récents (derniers 10)
const recentReports = computed(() => 
  [...reportsStore.reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
);

const getReportIcon = (type) => {
  const icons = {
    'nids-de-poule': 'alertCircleOutline',
    'chaussée dégradée': 'warningOutline',
    'glissance': 'constructOutline',
    'accident': 'carOutline',
    'obstacle': 'warningOutline'
  };
  return icons[type] || 'documentTextOutline';
};

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await reportsStore.fetchReports();
    await fetchUsersCount();
  } catch (error) {
    console.error('Erreur de rafraîchissement:', error);
  } finally {
    loading.value = false;
  }
};

const fetchUsersCount = async () => {
  try {
    const response = await fetch('/api/users/count');
    if (response.ok) {
      const data = await response.json();
      totalUsers.value = data.count;
    }
  } catch (error) {
    console.error('Erreur de récupération du nombre d\'utilisateurs:', error);
  }
};

const updateSetting = async (setting, value) => {
  notificationSettings.value[setting] = value;
  
  try {
    // Sauvegarder les préférences
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings.value));
    
    // Envoyer au backend
    await fetch('/api/admin/notification-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        [setting]: value
      })
    });
  } catch (error) {
    console.error('Erreur de mise à jour des paramètres:', error);
  }
};

const viewReport = (reportId) => {
  router.push(`/admin/report/${reportId}`);
};

const testNotification = async () => {
  await notificationService.testNotification();
};

// Écouter les nouvelles notifications
const handleNewNotification = (event) => {
  const notification = event.detail;
  
  // Rafraîchir les données si nécessaire
  if (notification.type === 'new_report' || notification.type === 'report_update') {
    refreshData();
  }
  
  // Afficher une alerte dans l'interface admin
  console.log('Nouvelle notification reçue:', notification);
};

onMounted(async () => {
  // Charger les paramètres de notification
  const savedSettings = localStorage.getItem('notificationSettings');
  if (savedSettings) {
    notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(savedSettings) };
  }
  
  // Initialiser le service de notifications
  await notificationService.initialize();
  
  // Charger les données initiales
  await refreshData();
  
  // Écouter les notifications
  window.addEventListener('newNotification', handleNewNotification);
});

onUnmounted(() => {
  window.removeEventListener('newNotification', handleNewNotification);
});
</script>

<style scoped>
.admin-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.stats-section {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #3880ff;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(56, 128, 255, 0.1);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.notification-section {
  margin-bottom: 32px;
}

.settings-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.setting-info p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.4;
}

.recent-section {
  margin-bottom: 32px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid #3880ff;
}

.report-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.report-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #3880ff;
}

.report-date {
  font-size: 12px;
  color: #6c757d;
}

.report-content p {
  margin: 0 0 8px 0;
  color: #2c3e50;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

.test-section {
  margin-top: 32px;
}

.test-button {
  --background: #3880ff;
  --color: white;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 12px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    gap: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .settings-card {
    padding: 20px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;
  }
}
</style>
