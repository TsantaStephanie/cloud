<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Historique des changements</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="historique-container">
        <!-- Filtres -->
        <div class="filters-section">
          <div class="filters-header">
            <ion-icon :icon="filterOutline" color="primary" size="large" />
            <h2>Filtres</h2>
          </div>
          
          <ion-item>
            <ion-label position="stacked">
              <ion-icon :icon="searchOutline" color="medium" size="small" />
              Type de changement
            </ion-label>
            <ion-select v-model="filters.type" placeholder="Tous les types">
              <ion-select-option value="">Tous</ion-select-option>
              <ion-select-option value="creation">
                <ion-icon :icon="addCircleOutline" color="success" slot="start" />
                Création
              </ion-select-option>
              <ion-select-option value="modification">
                <ion-icon :icon="createOutline" color="warning" slot="start" />
                Modification
              </ion-select-option>
              <ion-select-option value="statut">
                <ion-icon :icon="arrowForwardOutline" color="primary" slot="start" />
                Changement de statut
              </ion-select-option>
              <ion-select-option value="suppression">
                <ion-icon :icon="trashOutline" color="danger" slot="start" />
                Suppression
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">
              <ion-icon :icon="mapOutline" color="medium" size="small" />
              Signalement
            </ion-label>
            <ion-select v-model="filters.signalementId" placeholder="Tous les signalements">
              <ion-select-option value="">Tous</ion-select-option>
              <ion-select-option 
                v-for="report in reportsStore.reports" 
                :key="report.id" 
                :value="report.id"
              >
                <ion-icon :icon="locationOutline" color="primary" slot="start" />
                {{ report.description?.substring(0, 30) }}... ({{ report.id.substring(0, 8) }})
              </ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Liste de l'historique -->
        <div v-if="loading" class="loading-container">
          <ion-spinner name="dots" />
          <p>Chargement...</p>
        </div>

        <div v-else-if="filteredHistorique.length === 0" class="empty-state">
          <ion-icon :icon="informationCircleOutline" size="large" />
          <h3>Aucun changement trouvé</h3>
          <p>Aucun changement ne correspond à vos filtres.</p>
        </div>

        <div v-else class="historique-list">
          <div 
            v-for="changement in filteredHistorique" 
            :key="changement.id"
            class="historique-item"
            @click="goToSignalement(changement.signalementId)"
          >
            <div class="item-content">
              <ion-icon 
                :icon="getChangementIcon(changement.typeChangement)" 
                :color="getChangementColor(changement.typeChangement)"
                size="small"
              />
              <span class="changement-text">
                {{ getChangementLabel(changement.typeChangement) }} {{ getChampLabel(changement.champModifie) }}: 
                {{ formatValeur(changement.ancienneValeur) }} → {{ formatValeur(changement.nouvelleValeur) }}
              </span>
            </div>
            
            <div class="item-details">
              <span class="detail-info">
                <ion-icon :icon="documentTextOutline" color="medium" size="small" />
                {{ getSignalementDescription(changement.signalementId) }}
              </span>
              <span class="detail-info" v-if="getSignalementRouteName(changement.signalementId)">
                <ion-icon :icon="mapOutline" color="primary" size="small" />
                Route: {{ getSignalementRouteName(changement.signalementId) }}
              </span>
              <span class="detail-info" v-if="getSignalementRouteNumber(changement.signalementId)">
                <ion-icon :icon="locationOutline" color="primary" size="small" />
                N° Route: {{ getSignalementRouteNumber(changement.signalementId) }}
              </span>
              <span class="detail-info" v-if="getSignalementLongueur(changement.signalementId)">
                <ion-icon :icon="timeOutline" color="primary" size="small" />
                Longueur: {{ getSignalementLongueur(changement.signalementId) }} km
              </span>
              <span class="detail-info" v-if="getSignalementSurface(changement.signalementId)">
                <ion-icon :icon="constructOutline" color="primary" size="small" />
                Surface: {{ getSignalementSurface(changement.signalementId) }} m²
              </span>
              <span class="detail-info" v-if="getSignalementCoordinates(changement.signalementId)">
                <ion-icon :icon="mapOutline" color="primary" size="small" />
                Coords: {{ formatCoordinates(getSignalementCoordinates(changement.signalementId)) }}
              </span>
              <span class="detail-info" v-if="getSignalementGravite(changement.signalementId)">
                <ion-icon :icon="alertCircleOutline" color="warning" size="small" />
                Gravité: {{ getSignalementGravite(changement.signalementId) }}
              </span>
              <span class="detail-info" v-if="getSignalementStatut(changement.signalementId)">
                <ion-icon :icon="checkmarkDoneOutline" color="success" size="small" />
                Statut: {{ getSignalementStatut(changement.signalementId) }}
              </span>
              <span class="detail-info" v-if="getSignalementBudget(changement.signalementId)">
                <ion-icon :icon="cashOutline" color="success" size="small" />
                Budget: {{ formatBudget(getSignalementBudget(changement.signalementId)) }}
              </span>
              <span class="detail-info" v-if="getSignalementEntreprise(changement.signalementId)">
                <ion-icon :icon="businessOutline" color="primary" size="small" />
                Entreprise: {{ getSignalementEntreprise(changement.signalementId) }}
              </span>
              <span class="detail-info">
                <ion-icon :icon="timeOutline" color="medium" size="small" />
                {{ formatDate(changement.dateChangement) }}
              </span>
              <span class="detail-info" v-if="changement.utilisateurEmail">
                <ion-icon :icon="personOutline" color="medium" size="small" />
                {{ formatUserEmail(changement.utilisateurEmail) }}
              </span>
              <span class="detail-info">
                <ion-icon :icon="eyeOutline" color="primary" size="small" />
                {{ changement.signalementId?.substring(0, 8) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Barre de synchronisation -->
        <div v-if="isListening" class="sync-status">
          <small>
            <ion-icon :icon="syncOutline" color="success" />
            Synchronisation en temps réel
          </small>
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonSpinner
} from '@ionic/vue';
import { 
  refreshOutline, 
  documentTextOutline, 
  eyeOutline,
  addCircleOutline,
  createOutline,
  trashOutline,
  checkmarkCircleOutline,
  timeOutline,
  personOutline,
  locationOutline,
  imagesOutline,
  businessOutline,
  cashOutline,
  arrowForwardOutline,
  alertCircleOutline,
  checkmarkDoneOutline,
  closeCircleOutline,
  syncOutline,
  filterOutline,
  searchOutline,
  calendarOutline,
  mapOutline,
  cameraOutline,
  constructOutline,
  hammerOutline,
  warningOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { useHistoriqueStore } from '@/stores/historique';
import { useReportsStore } from '@/stores/reports';
import { useRealtimeSync } from '@/composables/useRealtimeSync';

const router = useRouter();
const historiqueStore = useHistoriqueStore();
const reportsStore = useReportsStore();
const { isListening, lastSync, startRealtimeSync, stopRealtimeSync } = useRealtimeSync();

const loading = ref(false);
const filters = ref({
  type: '',
  signalementId: ''
});

const filteredHistorique = computed(() => {
  let result = historiqueStore.historique;
  
  if (filters.value.type) {
    result = result.filter(h => h.typeChangement === filters.value.type);
  }
  
  if (filters.value.signalementId) {
    result = result.filter(h => h.signalementId === filters.value.signalementId);
  }
  
  return result.sort((a, b) => new Date(b.dateChangement) - new Date(a.dateChangement));
});

const getChangementIcon = (typeChangement) => {
  const icons = {
    'creation': addCircleOutline,
    'modification': createOutline,
    'statut': arrowForwardOutline,
    'suppression': trashOutline
  };
  
  return icons[typeChangement] || alertCircleOutline;
};

const getChampIcon = (champModifie) => {
  const icons = {
    'gravite': alertCircleOutline,
    'statut': checkmarkDoneOutline,
    'description': documentTextOutline,
    'longueurKm': locationOutline,
    'surfaceM2': timeOutline,
    'budget': cashOutline,
    'entreprise': businessOutline,
    'imageUrl': imagesOutline,
    'images': imagesOutline,
    'signalement': checkmarkCircleOutline
  };
  
  return icons[champModifie] || documentTextOutline;
};

const getChangementColor = (typeChangement) => {
  const colors = {
    'creation': 'success',
    'modification': 'warning',
    'statut': 'primary',
    'suppression': 'danger'
  };
  
  return colors[typeChangement] || 'medium';
};

const getChangementLabel = (typeChangement) => {
  const labels = {
    'creation': 'Création',
    'modification': 'Modification',
    'statut': 'Changement de statut',
    'suppression': 'Suppression'
  };
  
  return labels[typeChangement] || typeChangement;
};

const getChampLabel = (champModifie) => {
  const labels = {
    'gravite': 'Gravité',
    'statut': 'Statut',
    'description': 'Description',
    'longueurKm': 'Longueur (km)',
    'surfaceM2': 'Surface (m²)',
    'budget': 'Budget',
    'entreprise': 'Entreprise',
    'imageUrl': 'Image',
    'images': 'Images',
    'signalement': 'Signalement'
  };
  
  return labels[champModifie] || champModifie;
};

const formatValeur = (valeur) => {
  if (valeur === null || valeur === undefined) return 'N/A';
  if (typeof valeur === 'boolean') return valeur ? 'Oui' : 'Non';
  if (Array.isArray(valeur)) return `${valeur.length} élément(s)`;
  if (typeof valeur === 'object') return JSON.stringify(valeur).substring(0, 50) + '...';
  return String(valeur);
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

const formatUserEmail = (email) => {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length === 2) {
    const username = parts[0];
    const domain = parts[1];
    return `${username.substring(0, 3)}***@${domain.substring(0, 3)}***`;
  }
  return email.substring(0, 15) + '...';
};

const getSignalementRouteName = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.routeName || null;
};

const getSignalementRouteNumber = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.routeNumber || null;
};

const getSignalementDescription = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  if (!report || !report.description) return 'Non spécifiée';
  return report.description.length > 100 ? report.description.substring(0, 100) + '...' : report.description;
};

const getSignalementGravite = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.gravite || null;
};

const getSignalementStatut = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.statut || null;
};

const getSignalementBudget = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.budget || null;
};

const getSignalementEntreprise = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.entreprise || null;
};

const getSignalementCoordinates = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.coordinates || null;
};

const getSignalementLongueur = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.longueurKm || null;
};

const getSignalementSurface = (signalementId) => {
  const report = reportsStore.reports.find(r => r.id === signalementId);
  return report?.surfaceM2 || null;
};

const getGraviteClass = (gravite) => {
  const classes = {
    'faible': 'gravite-faible',
    'moyenne': 'gravite-moyenne',
    'critique': 'gravite-critique',
    'élevée': 'gravite-eleve'
  };
  return classes[gravite] || 'gravite-moyenne';
};

const getStatutClass = (statut) => {
  const classes = {
    'nouveau': 'statut-nouveau',
    'en cours': 'statut-encours',
    'terminé': 'statut-termine',
    'annulé': 'statut-annule'
  };
  return classes[statut] || 'statut-nouveau';
};

const formatCoordinates = (coordinates) => {
  if (!coordinates) return 'Non spécifiées';
  if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
    return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
  }
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    return `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`;
  }
  return String(coordinates).substring(0, 20) + '...';
};

const formatBudget = (budget) => {
  if (!budget) return 'Non spécifié';
  if (typeof budget === 'number') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(budget);
  }
  return String(budget);
};

const refreshHistorique = async () => {
  loading.value = true;
  try {
    await historiqueStore.fetchHistorique();
    await reportsStore.fetchReports();
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error);
  } finally {
    loading.value = false;
  }
};

const goToSignalement = (signalementId) => {
  if (signalementId) {
    router.push(`/tabs/report/${signalementId}`);
  }
};

onMounted(async () => {
  await refreshHistorique();
});
</script>

<style scoped>
.historique-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.filters-section {
  margin-bottom: 32px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(56, 128, 255, 0.2);
}

.filters-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filters-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3880ff 0%, #0652dd 50%, #3880ff 100%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.filters-section ion-item {
  --background: rgba(255, 255, 255, 0.8);
  --border-color: rgba(56, 128, 255, 0.2);
  --border-width: 2px;
  --border-radius: 12px;
  --inner-padding-start: 0;
  --inner-padding-end: 0;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filters-section ion-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(56, 128, 255, 0.02) 0%, transparent 50%);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filters-section ion-item:hover::before {
  opacity: 1;
}

.filters-section ion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(56, 128, 255, 0.15);
  --border-color: rgba(56, 128, 255, 0.4);
}

.filters-section ion-label {
  --color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-section ion-select {
  --placeholder-color: #6c757d;
  --placeholder-opacity: 0.8;
  --color: #2c3e50;
  --background: rgba(255, 255, 255, 0.9);
  --border-color: rgba(56, 128, 255, 0.3);
  --border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filters-section ion-select:focus {
  --border-color: #3880ff;
  --box-shadow: 0 0 0 3px rgba(56, 128, 255, 0.1);
}

.filters-section ion-select::part(icon) {
  color: #3880ff;
  font-size: 18px;
}

.filters-section ion-select::part(placeholder) {
  color: #6c757d;
  font-style: italic;
}

.filters-section ion-select-option {
  --background: #ffffff;
  --color: #2c3e50;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filters-section ion-select-option:hover {
  --background: rgba(56, 128, 255, 0.1);
  --color: #3880ff;
}

.filters-section ion-select-option:active {
  --background: rgba(56, 128, 255, 0.2);
}

.filters-section ion-item {
  --background: rgba(255, 255, 255, 0.8);
  --border-color: rgba(56, 128, 255, 0.2);
  --border-width: 2px;
  --border-radius: 12px;
  --inner-padding-start: 0;
  --inner-padding-end: 0;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 20px;
  --padding-bottom: 20px;
  margin-bottom: 20px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.filters-section ion-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(56, 128, 255, 0.02) 0%, transparent 50%);
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.filters-section ion-item:hover::before {
  opacity: 1;
}

.filters-section ion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(56, 128, 255, 0.15);
  --border-color: rgba(56, 128, 255, 0.4);
}

.filters-section ion-label {
  --color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filters-section ion-select {
  --placeholder-color: #6c757d;
  --placeholder-opacity: 0.8;
  --color: #2c3e50;
  --background: rgba(255, 255, 255, 0.9);
  --border-color: rgba(56, 128, 255, 0.3);
  --border-radius: 12px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filters-section ion-select:focus {
  --border-color: #3880ff;
  --box-shadow: 0 0 0 3px rgba(56, 128, 255, 0.1);
}

.filters-section ion-select::part(icon) {
  color: #3880ff;
  font-size: 18px;
}

.filters-section ion-select::part(placeholder) {
  color: #6c757d;
  font-style: italic;
}

.filters-section ion-select-option {
  --background: #ffffff;
  --color: #2c3e50;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filters-section ion-select-option:hover {
  --background: rgba(56, 128, 255, 0.1);
  --color: #3880ff;
}

.filters-section ion-select-option:active {
  --background: rgba(56, 128, 255, 0.2);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.loading-container ion-spinner {
  --color: #3880ff;
  width: 48px;
  height: 48px;
}

.loading-container p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #495057;
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 2px dashed #dee2e6;
}

.empty-state ion-icon {
  color: #6c757d;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0;
  color: #495057;
  font-size: 20px;
  font-weight: 600;
}

.historique-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.historique-item {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #3880ff;
  position: relative;
  overflow: hidden;
}

.historique-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3880ff 0%, #0652dd 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.historique-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-left-color: #0652dd;
}

.historique-item:hover::before {
  opacity: 1;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.changement-text {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.detail-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 12px;
  font-size: 11px;
  color: #6c757d;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.detail-info:hover {
  background: rgba(56, 128, 255, 0.1);
  color: #3880ff;
  transform: scale(1.05);
}

.sync-status {
  padding: 16px;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-top: 2px solid #28a745;
  text-align: center;
  margin-top: 24px;
  border-radius: 0 0 16px 16px;
}

.sync-status small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #155724;
}

.sync-status ion-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .historique-container {
    padding: 12px;
  }
  
  .filters-section {
    padding: 20px;
    margin-bottom: 24px;
    border-radius: 16px;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .filters-header h2 {
    font-size: 16px;
  }
  
  .filters-section ion-item {
    --padding-top: 16px;
    --padding-bottom: 16px;
    --padding-start: 12px;
    --padding-end: 12px;
    margin-bottom: 16px;
  }
  
  .filters-section ion-label {
    font-size: 13px;
    margin-bottom: 6px;
  }
  
  .filters-section ion-select {
    font-size: 14px;
    --padding-top: 10px;
    --padding-bottom: 10px;
  }
  
  .historique-item {
    padding: 16px;
  }
  
  .item-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .changement-text {
    font-size: 13px;
  }
  
  .item-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .detail-info {
    width: 100%;
    white-space: normal;
  }
}

@media (prefers-color-scheme: dark) {
  .filters-section {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.02) 100%);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
  
  .filters-section::before {
    background: linear-gradient(90deg, rgba(56, 128, 255, 0.8) 0%, rgba(6, 82, 221, 0.8) 50%, rgba(56, 128, 255, 0.8) 100%);
  }
  
  .filters-section ion-item {
    --background: rgba(255, 255, 255, 0.06);
    --border-color: rgba(56, 128, 255, 0.3);
  }
  
  .filters-section ion-item::before {
    background: linear-gradient(135deg, rgba(56, 128, 255, 0.05) 0%, transparent 50%);
  }
  
  .filters-section ion-item:hover {
    box-shadow: 0 12px 24px rgba(56, 128, 255, 0.25);
    --border-color: rgba(56, 128, 255, 0.6);
  }
  
  .filters-section ion-label {
    --color: #f8f9fa;
  }
  
  .filters-section ion-select {
    --placeholder-color: rgba(248, 249, 250, 0.6);
    --color: #f8f9fa;
    --background: rgba(255, 255, 255, 0.08);
    --border-color: rgba(56, 128, 255, 0.4);
  }
  
  .filters-section ion-select:focus {
    --border-color: rgba(56, 128, 255, 0.8);
    --box-shadow: 0 0 0 3px rgba(56, 128, 255, 0.2);
  }
  
  .filters-section ion-select::part(icon) {
    color: rgba(56, 128, 255, 0.9);
  }
  
  .filters-section ion-select-option {
    --background: rgba(255, 255, 255, 0.95);
    --color: #2c3e50;
  }
  
  .filters-section ion-select-option:hover {
    --background: rgba(56, 128, 255, 0.15);
    --color: #3880ff;
  }
  
  .loading-container,
  .empty-state {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  }
  
  .historique-item {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.08) 100%);
    border-left-color: rgba(56, 128, 255, 0.6);
  }
  
  .historique-item:hover {
    border-left-color: rgba(56, 128, 255, 0.8);
  }
  
  .loading-container p,
  .empty-state h3 {
    color: #f8f9fa;
  }
  
  .item-values {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
