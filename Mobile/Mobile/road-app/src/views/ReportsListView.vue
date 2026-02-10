<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Signalements</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshReports">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Search Section -->
      <div class="search-section">
        <div class="search-row">
          <!-- Description Search -->
          <div class="search-bar">
            <ion-icon :icon="searchOutline" class="search-icon" />
            <input
              v-model="searchDescription"
              type="text"
              placeholder="Rechercher par description..."
              class="search-input"
            />
            <ion-button
              v-if="searchDescription"
              @click="clearDescriptionSearch"
              fill="clear"
              size="small"
              class="clear-btn"
            >
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
        </div>
        
        <div class="search-row">
          <!-- Date Search -->
          <div class="search-bar">
            <ion-icon :icon="calendarOutline" class="search-icon" />
            <input
              v-model="searchDate"
              type="text"
              placeholder="Rechercher par date (ex: 2024-01-15, janvier, aujourd'hui)"
              class="search-input"
            />
            <ion-button
              v-if="searchDate"
              @click="clearDateSearch"
              fill="clear"
              size="small"
              class="clear-btn"
            >
              <ion-icon :icon="closeOutline" />
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filter-row">
          <button
            @click="toggleMyReports"
            :class="['filter-toggle', { active: reportsStore.filters.showOnlyMine }]"
            v-if="authStore.isAuthenticated"
          >
            <ion-icon :icon="personOutline" />
            <span>Mes signalements</span>
          </button>
        </div>

        <div class="filter-chips">
          <button
            @click="setStatusFilter(null)"
            :class="['status-chip', { active: reportsStore.filters.status === null }]"
          >
            Tous
          </button>
          <button
            v-for="status in statuses"
            :key="status.value"
            @click="setStatusFilter(status.value)"
            :class="['status-chip', `status-${status.value}`, { active: reportsStore.filters.status === status.value }]"
          >
            {{ status.label }}
          </button>
        </div>
      </div>

      <!-- Reports List -->
      <div class="reports-list" v-if="!loading && filteredReports.length > 0">
        <div
          v-for="report in filteredReports"
          :key="report.id"
          class="report-card"
          @click="viewReportDetails(report)"
        >
          <div class="report-header">
            <div class="report-badges">
              <span :class="['severity-badge', `severity-${report.gravite}`]">
                {{ report.gravite }}
              </span>
              <span :class="['status-badge', `status-${report.statut}`]">
                {{ getStatusLabel(report.statut) }}
              </span>
            </div>
            <div class="report-date">
              {{ formatDate(report.date_creation) }}
            </div>
          </div>

          <div class="report-content">
            <h3 class="report-title">{{ report.description }}</h3>
            <div class="report-meta">
              <div class="meta-item">
                <ion-icon :icon="resizeOutline" />
                <span>{{ report.longueur_km }} km</span>
              </div>
              <div class="meta-item" v-if="report.entreprise">
                <ion-icon :icon="businessOutline" />
                <span>{{ report.entreprise }}</span>
              </div>
              <div class="meta-item" v-if="report.budget">
                <ion-icon :icon="cardOutline" />
                <span>{{ formatBudget(report.budget) }}</span>
              </div>
              <div class="meta-item">
                <ion-icon :icon="calendarOutline" />
                <span>{{ formatDate(report.date_signalement || report.date_creation) }}</span>
              </div>
            </div>
          </div>

          <div class="report-footer" v-if="authStore.isAdmin">
            <button
              v-for="action in getAvailableActions(report.statut)"
              :key="action.value"
              @click.stop="updateStatus(report.id, action.value)"
              :class="['action-btn', `action-${action.value}`]"
            >
              <ion-icon :icon="action.icon" />
              <span>{{ action.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!loading">
        <div class="empty-state-icon">
          <ion-icon :icon="documentTextOutline" />
        </div>
        <h2 class="empty-state-title">Aucun signalement</h2>
        <p class="empty-state-text">
          {{ reportsStore.filters.showOnlyMine 
            ? "Vous n'avez pas encore créé de signalement" 
            : "Aucun signalement n'a été trouvé" }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement des signalements...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  alertController,
  modalController
} from '@ionic/vue';
import {
  refreshOutline,
  personOutline,
  resizeOutline,
  locationOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  playOutline,
  eyeOutline,
  searchOutline,
  closeOutline,
  calendarOutline,
  businessOutline,
  cardOutline
} from 'ionicons/icons';
import { useReportsStore } from '@/stores/reports';
import { useAuthStore } from '@/stores/auth';

const reportsStore = useReportsStore();
const authStore = useAuthStore();
const loading = ref(false);
const searchDescription = ref('');
const searchDate = ref('');

const statuses = [
  { value: 'signale', label: 'Signalé' },
  { value: 'verifie', label: 'Vérifié' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'repare', label: 'Réparé' }
];

const filteredReports = computed(() => {
  let reports = reportsStore.filteredReports;
  
  // Apply description search filter
  if (searchDescription.value) {
    const descQuery = searchDescription.value.toLowerCase();
    reports = reports.filter(report => 
      report.description.toLowerCase().includes(descQuery)
    );
  }
  
  // Apply date search filter
  if (searchDate.value) {
    const dateQuery = searchDate.value.toLowerCase();
    reports = reports.filter(report => {
      // Search in formatted date
      const reportDate = formatDate(report.date_creation).toLowerCase();
      const formattedMatch = reportDate.includes(dateQuery);
      
      // Search in raw date format (YYYY-MM-DD, YYYY-MM, etc.)
      let rawDateMatch = false;
      if (report.date_creation) {
        let date;
        if (report.date_creation?.toDate) {
          date = report.date_creation.toDate();
        } else if (report.date_creation?.seconds) {
          date = new Date(report.date_creation.seconds * 1000);
        } else {
          date = new Date(report.date_creation);
        }
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        const dateStrShort = dateStr.substring(0, 7); // YYYY-MM format
        const monthName = date.toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase();
        rawDateMatch = dateStr.includes(dateQuery) || 
                      dateStrShort.includes(dateQuery) || 
                      monthName.includes(dateQuery);
      }
      
      return formattedMatch || rawDateMatch;
    });
  }
  
  return reports;
});

const toggleMyReports = () => {
  reportsStore.setFilter('showOnlyMine', !reportsStore.filters.showOnlyMine);
  if (reportsStore.filters.showOnlyMine && authStore.isAuthenticated) {
    reportsStore.fetchMyReports();
  }
};

const setStatusFilter = (status) => {
  reportsStore.setFilter('status', status);
};

const clearDescriptionSearch = () => {
  searchDescription.value = '';
};

const clearDateSearch = () => {
  searchDate.value = '';
};

const refreshReports = async () => {
  loading.value = true;
  await reportsStore.fetchReports();
  if (authStore.isAuthenticated) {
    await reportsStore.fetchMyReports();
  }
  loading.value = false;
};

const getStatusLabel = (status) => {
  const statusObj = statuses.find(s => s.value === status);
  return statusObj ? statusObj.label : status;
};

const getAvailableActions = (currentStatus) => {
  const actions = {
    signale: [
      { value: 'verifie', label: 'Vérifier', icon: eyeOutline }
    ],
    verifie: [
      { value: 'en_cours', label: 'Démarrer', icon: playOutline }
    ],
    en_cours: [
      { value: 'repare', label: 'Terminer', icon: checkmarkCircleOutline }
    ],
    repare: []
  };
  return actions[currentStatus] || [];
};

const updateStatus = async (reportId, newStatus) => {
  const alert = await alertController.create({
    header: 'Confirmer',
    message: `Voulez-vous vraiment changer le statut de ce signalement ?`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Confirmer',
        handler: async () => {
          await reportsStore.updateReportStatus(reportId, newStatus);
        }
      }
    ]
  });

  await alert.present();
};

const viewReportDetails = async (report) => {
  const alert = await alertController.create({
    header: report.description,
    message: `
      <div style="font-family: var(--font-body); line-height: 1.6;">
        <p><strong>Gravité:</strong> ${report.gravite}</p>
        <p><strong>Statut:</strong> ${getStatusLabel(report.statut)}</p>
        <p><strong>Longueur:</strong> ${report.longueur_km} km</p>
        <p><strong>Position:</strong><br/>${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}</p>
        <p><strong>Date:</strong> ${formatDate(report.date_creation)}</p>
      </div>
    `,
    buttons: ['Fermer']
  });

  await alert.present();
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue';
  
  // Handle Firestore timestamp
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatBudget = (budget) => {
  if (!budget) return 'Non spécifié';
  if (typeof budget === 'number') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  }
  return budget;
};

onMounted(async () => {
  loading.value = true;
  await reportsStore.fetchReports();
  if (authStore.isAuthenticated) {
    await reportsStore.fetchMyReports();
  }
  loading.value = false;
});

</script>

<style scoped>
.filters-section {
  background: var(--cream-light);
  padding: 16px;
  border-bottom: 1px solid rgba(0, 48, 73, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-row {
  margin-bottom: 12px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--cream-white);
  border: 2px solid rgba(0, 48, 73, 0.1);
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-toggle.active {
  background: var(--navy-dark);
  color: var(--cream-white);
  border-color: var(--navy-dark);
}

.filter-toggle ion-icon {
  font-size: 18px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.filter-chips::-webkit-scrollbar {
  height: 4px;
}

.status-chip {
  padding: 8px 16px;
  background: var(--cream-white);
  border: 2px solid rgba(0, 48, 73, 0.1);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--navy-dark);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-chip.active {
  background: var(--navy-dark);
  color: var(--cream-white);
  border-color: var(--navy-dark);
}

.reports-list {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.report-card {
  background: var(--cream-light);
  border-radius: 10px;
  padding: 10px;
  border: 2px solid rgba(0, 48, 73, 0.06);
  box-shadow: 0 2px 8px rgba(0, 48, 73, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: fadeIn 0.5s ease-out;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.report-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 48, 73, 0.08);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.report-badges {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.report-date {
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 500;
  color: rgba(0, 48, 73, 0.5);
  white-space: nowrap;
}

.report-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.report-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--navy-dark);
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.1px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.report-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-body);
  font-size: 10px;
  color: rgba(0, 48, 73, 0.7);
}

.meta-item ion-icon {
  font-size: 11px;
  color: var(--navy-light);
  flex-shrink: 0;
}

.report-footer {
  display: flex;
  gap: 3px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 48, 73, 0.08);
  margin-top: auto;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 5px 3px;
  background: var(--navy-dark);
  border: none;
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 600;
  color: var(--cream-white);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:active {
  transform: scale(0.96);
}

.action-btn ion-icon {
  font-size: 10px;
}

.action-verifie {
  background: var(--status-verifie);
}

.action-en_cours {
  background: var(--status-en_cours);
}

.action-repare {
  background: var(--status-repare);
}

/* Badge Styles */
.severity-badge,
.status-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}

.severity-faible {
  background: #2a9d8f;
  color: white;
}

.severity-moyenne {
  background: #e9c46a;
  color: #333;
}

.severity-elevee {
  background: #f77f00;
  color: white;
}

.severity-critique {
  background: #d62828;
  color: white;
}

.status-signale {
  background: #6c757d;
  color: white;
}

.status-verifie {
  background: #17a2b8;
  color: white;
}

.status-en_cours {
  background: #ffc107;
  color: #333;
}

.status-repare {
  background: #28a745;
  color: white;
}

/* Search Styles */
.search-section {
  background: var(--cream-light);
  padding: 16px;
  border-bottom: 1px solid rgba(0, 48, 73, 0.08);
  position: sticky;
  top: 0;
  z-index: 101;
}

.search-row {
  margin-bottom: 12px;
}

.search-row:last-child {
  margin-bottom: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--cream-white);
  border: 2px solid rgba(0, 48, 73, 0.1);
  border-radius: 16px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.search-bar:focus-within {
  border-color: var(--navy-dark);
  box-shadow: 0 0 0 4px rgba(0, 48, 73, 0.1);
}

.search-icon {
  font-size: 20px;
  color: var(--navy-light);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--navy-dark);
  outline: none;
  padding: 0;
}

.search-input::placeholder {
  color: rgba(0, 48, 73, 0.5);
}

.search-input:focus {
  outline: none;
}

.clear-btn {
  flex-shrink: 0;
  --color: var(--navy-light);
  --background: transparent;
  --box-shadow: none;
  padding: 4px;
  min-height: auto;
}

.clear-btn ion-icon {
  font-size: 18px;
}
</style>