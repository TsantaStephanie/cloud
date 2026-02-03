<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Nouveau Signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="report-container">
        <!-- Header -->
        <div class="report-header">
          <div class="header-icon">
            <ion-icon :icon="warningOutline" />
          </div>
          <h1 class="header-title">Signaler un problème routier</h1>
          <p class="header-subtitle">Aidez à améliorer nos routes</p>
        </div>

        <!-- Form -->
        <form class="report-form">
          <!-- Location Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="locationOutline" />
              Localisation
            </h3>
            
            <div class="location-display" v-if="location">
              <div class="location-info">
                <ion-icon :icon="pinOutline" />
                <div>
                  <div class="location-coords">
                    {{ location.latitude.toFixed(6) }}, {{ location.longitude.toFixed(6) }}
                  </div>
                  <div class="location-label">Coordonnées GPS</div>
                </div>
              </div>
              <button type="button" @click="getCurrentLocation" class="refresh-location-btn">
                <ion-icon :icon="refreshOutline" />
              </button>
            </div>

            <button type="button" @click="getCurrentLocation" class="get-location-btn" v-else>
              <ion-icon :icon="locateOutline" />
              <span>Obtenir ma position</span>
            </button>

            <!-- Mini Map Preview -->
            <div v-if="location" class="mini-map" ref="miniMapContainer"></div>
          </div>

          <!-- Two Column Layout -->
          <div class="form-columns">
            <!-- Left Column -->
            <div class="form-column">
              <!-- Description -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="documentTextOutline" />
                  Description
                </h3>
                <ion-textarea
                  v-model="description"
                  placeholder="Décrivez le problème routier (ex: Grand nid-de-poule, route effondrée...)"
                  :rows="3"
                  required
                  class="custom-textarea"
                />
              </div>

              <!-- Severity -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="alertCircleOutline" />
                  Gravité
                </h3>
                <div class="severity-grid">
                  <button
                    v-for="sev in severities"
                    :key="sev.value"
                    type="button"
                    @click="severity = sev.value"
                    :class="['severity-btn', `severity-${sev.value}`, { active: severity === sev.value }]"
                  >
                    <ion-icon :icon="sev.icon" />
                    <span>{{ sev.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="form-column">
              <!-- Length -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="resizeOutline" />
                  Longueur (km)
                </h3>
                <ion-input
                  v-model.number="length"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  class="custom-input"
                />
              </div>

              <!-- Budget -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="cardOutline" />
                  Budget (Ar)
                </h3>
                <ion-input
                  v-model.number="budget"
                  type="number"
                  step="100000"
                  min="0"
                  placeholder="5000000"
                  class="custom-input"
                />
              </div>

              <!-- Enterprise -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="businessOutline" />
                  Entreprise
                </h3>
                <ion-input
                  v-model="entreprise"
                  type="text"
                  placeholder="Nom de l'entreprise"
                  class="custom-input"
                />
              </div>

              <!-- Date -->
              <div class="form-section">
                <h3 class="section-title">
                  <ion-icon :icon="calendarOutline" />
                  Date
                </h3>
                <ion-input
                  v-model="reportDate"
                  type="date"
                  :max="today"
                  required
                  class="custom-input"
                />
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-banner">
            <ion-icon :icon="alertCircleOutline" />
            <span>{{ error }}</span>
          </div>

          <!-- Submit Button -->
          <ion-button
            expand="block"
            :disabled="!canSubmit || submitting"
            class="submit-button"
            @click="submitReport"
          >
            <ion-icon v-if="!submitting" :icon="checkmarkCircleOutline" slot="start" />
            <span v-if="!submitting">Envoyer le signalement</span>
            <span v-else>Envoi en cours...</span>
          </ion-button>
        </form>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-modal" @click.stop>
          <div class="success-icon">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          <h2 class="success-title">Signalement envoyé !</h2>
          <p class="success-message">
            Votre signalement a été enregistré avec succès. Vous allez être redirigé vers la carte pour le voir.
          </p>
          <ion-button expand="block" @click="closeSuccess" class="success-button">
            Voir sur la carte
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonTextarea,
  IonIcon
} from '@ionic/vue';
import {
  locationOutline,
  documentTextOutline,
  alertCircleOutline,
  resizeOutline,
  warningOutline,
  locateOutline,
  pinOutline,
  refreshOutline,
  checkmarkCircleOutline,
  warningSharp,
  alertSharp,
  closeCircleSharp,
  cardOutline,
  businessOutline,
  calendarOutline
} from 'ionicons/icons';
import { useReportsStore } from '@/stores/reports';
import L from 'leaflet';

const router = useRouter();
const reportsStore = useReportsStore();

const location = ref(null);
const description = ref('');
const severity = ref('moyenne');
const length = ref(0.05);
const budget = ref(null);
const entreprise = ref('');
const reportDate = ref(new Date().toISOString().split('T')[0]); // Date du jour
const submitting = ref(false);
const error = ref('');
const showSuccess = ref(false);
const miniMapContainer = ref(null);
const miniMap = ref(null);

const today = new Date().toISOString().split('T')[0];

const severities = [
  { value: 'faible', label: 'Faible', icon: warningOutline },
  { value: 'moyenne', label: 'Moyenne', icon: warningSharp },
  { value: 'elevee', label: 'Élevée', icon: alertSharp },
  { value: 'critique', label: 'Critique', icon: closeCircleSharp }
];

const canSubmit = computed(() => {
  const isValid = location.value && description.value && severity.value && length.value > 0;
  console.log('🔍 Validation formulaire:', {
    location: !!location.value,
    description: !!description.value,
    severity: !!severity.value,
    length: length.value,
    isValid: isValid
  });
  return isValid;
});

const getCurrentLocation = () => {
  console.log('📍 getCurrentLocation appelé');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        location.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setTimeout(initMiniMap, 100);
      },
      (err) => {
        error.value = 'Impossible d\'obtenir votre position. Vérifiez vos paramètres de localisation.';
      }
    );
  } else {
    error.value = 'La géolocalisation n\'est pas supportée par votre appareil.';
  }
};

const initMiniMap = () => {
  if (!miniMapContainer.value || !location.value) return;

  if (miniMap.value) {
    miniMap.value.remove();
  }

  miniMap.value = L.map(miniMapContainer.value).setView(
    [location.value.latitude, location.value.longitude],
    15
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(miniMap.value);

  L.marker([location.value.latitude, location.value.longitude], {
    icon: L.divIcon({
      html: `<div style="background: #d62828; border: 3px solid #fff; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
      className: 'report-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  }).addTo(miniMap.value);
};

const testClick = () => {
  console.log('🔘 Test clic sur le bouton !');
  console.log('📋 État du formulaire:', {
    location: !!location.value,
    description: description.value,
    severity: severity.value,
    length: length.value,
    canSubmit: canSubmit.value,
    submitting: submitting.value
  });
};

const submitReport = async () => {
  console.log('🚀 submitReport appelé');
  console.log('📝 Données du formulaire:', {
    location: location.value,
    description: description.value,
    severity: severity.value,
    length: length.value,
    budget: budget.value,
    entreprise: entreprise.value,
    reportDate: reportDate.value
  });
  
  if (!canSubmit.value) {
    console.log('❌ Formulaire non valide');
    return;
  }

  submitting.value = true;
  error.value = '';
  console.log('✅ Début de la soumission');

  try {
    const reportData = {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
      description: description.value,
      gravite: severity.value,
      longueur_km: length.value,
      budget: budget.value,
      entreprise: entreprise.value,
      date_signalement: reportDate.value
    };
    
    console.log('📦 Données à envoyer:', reportData);

    const reportId = await reportsStore.createReport(reportData);
    console.log('📋 Réponse du store:', reportId);

    if (reportId) {
      console.log('✅ Signalement créé avec succès');
      showSuccess.value = true;
      resetForm();
    } else {
      console.log('❌ Erreur lors de la création');
      error.value = 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer.';
    }
  } catch (err) {
    console.log('💥 Erreur catchée:', err);
    error.value = 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    submitting.value = false;
    console.log('🏁 Fin de la soumission');
  }
};

const resetForm = () => {
  location.value = null;
  description.value = '';
  severity.value = 'moyenne';
  length.value = 0.05;
  budget.value = null;
  entreprise.value = '';
  reportDate.value = new Date().toISOString().split('T')[0];
  if (miniMap.value) {
    miniMap.value.remove();
    miniMap.value = null;
  }
};

const closeSuccess = () => {
  showSuccess.value = false;
  // Store the new report location for map centering
  if (location.value) {
    sessionStorage.setItem('newReportLocation', JSON.stringify({
      latitude: location.value.latitude,
      longitude: location.value.longitude
    }));
  }
  router.push('/tabs/map');
};

onMounted(() => {
  // Check if we have stored location from map click
  const storedLocation = sessionStorage.getItem('reportLocation');
  if (storedLocation) {
    const { latitude, longitude } = JSON.parse(storedLocation);
    location.value = { latitude, longitude };
    sessionStorage.removeItem('reportLocation'); // Clear after use
    setTimeout(initMiniMap, 100);
  } else {
    getCurrentLocation();
  }
});

watch(location, () => {
  if (location.value) {
    setTimeout(initMiniMap, 100);
  }
});
</script>

<style scoped>
.report-container {
  min-height: 100%;
  background: var(--cream-white);
  max-width: 650px;
  margin: 0 auto;
}

.report-header {
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  padding: 32px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.report-header::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(247, 127, 0, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header-icon {
  width: 65px;
  height: 65px;
  margin: 0 auto 18px;
  background: rgba(247, 127, 0, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s ease-in-out infinite;
}

.header-icon ion-icon {
  font-size: 38px;
  color: var(--accent-coral);
}

.header-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  color: var(--cream-white);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 300;
  color: rgba(252, 248, 243, 0.8);
  margin: 0;
}

.report-form {
  padding: 22px 16px;
}

.form-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 22px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-section {
  margin-bottom: 18px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--navy-dark);
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.3px;
}

.section-title ion-icon {
  font-size: 19px;
  color: var(--navy-light);
}

.location-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--cream-light);
  padding: 12px;
  border-radius: 12px;
  border: 2px solid rgba(0, 48, 73, 0.08);
  margin-bottom: 12px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.location-info > ion-icon {
  font-size: 24px;
  color: var(--navy-light);
  flex-shrink: 0;
}

.location-coords {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
  margin-bottom: 3px;
}

.location-label {
  font-family: var(--font-body);
  font-size: 11px;
  color: rgba(0, 48, 73, 0.6);
}

.refresh-location-btn {
  width: 36px;
  height: 36px;
  background: var(--navy-dark);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-location-btn:active {
  transform: scale(0.95);
}

.refresh-location-btn ion-icon {
  font-size: 18px;
  color: var(--cream-white);
}

.get-location-btn {
  width: 100%;
  padding: 14px;
  background: var(--navy-dark);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--cream-white);
}

.get-location-btn:active {
  transform: scale(0.98);
}

.get-location-btn ion-icon {
  font-size: 20px;
}

.mini-map {
  height: 160px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 48, 73, 0.1);
}

.custom-textarea {
  --background: var(--cream-light);
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  --padding-start: 15px;
  --padding-end: 15px;
  --padding-top: 15px;
  --padding-bottom: 15px;
  font-family: var(--font-body);
  font-size: 15px;
  border: 2px solid rgba(0, 48, 73, 0.08);
  border-radius: 12px;
  line-height: 1.5;
}

.severity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.severity-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 14px;
  background: var(--cream-light);
  border: 2px solid rgba(0, 48, 73, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
}

.severity-btn ion-icon {
  font-size: 30px;
}

.severity-btn.severity-faible ion-icon {
  color: var(--severity-faible);
}

.severity-btn.severity-moyenne ion-icon {
  color: #c69100;
}

.severity-btn.severity-elevee ion-icon {
  color: var(--severity-elevee);
}

.severity-btn.severity-critique ion-icon {
  color: var(--severity-critique);
}

.severity-btn.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 48, 73, 0.15);
}

.severity-btn.severity-faible.active {
  border-color: var(--severity-faible);
  background: rgba(42, 157, 143, 0.1);
}

.severity-btn.severity-moyenne.active {
  border-color: #c69100;
  background: rgba(233, 196, 106, 0.1);
}

.severity-btn.severity-elevee.active {
  border-color: var(--severity-elevee);
  background: rgba(247, 127, 0, 0.1);
}

.severity-btn.severity-critique.active {
  border-color: var(--severity-critique);
  background: rgba(214, 40, 40, 0.1);
}

.custom-input {
  --background: var(--cream-light);
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  --padding-start: 15px;
  --padding-end: 15px;
  height: 52px;
  font-family: var(--font-body);
  font-size: 16px;
  border: 2px solid rgba(0, 48, 73, 0.08);
  border-radius: 12px;
}

.field-hint {
  font-family: var(--font-body);
  font-size: 12px;
  color: rgba(0, 48, 73, 0.6);
  margin: 8px 0 0 0;
  font-style: italic;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(214, 40, 40, 0.1);
  border: 2px solid rgba(214, 40, 40, 0.2);
  border-radius: 12px;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-out;
}

.error-banner ion-icon {
  font-size: 20px;
  color: var(--danger-red);
  flex-shrink: 0;
}

.error-banner span {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--danger-red);
  line-height: 1.4;
}

.submit-button {
  --background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  --background-activated: var(--navy-medium);
  --color: var(--cream-white);
  --border-radius: 12px;
  --padding-top: 18px;
  --padding-bottom: 18px;
  --box-shadow: 0 6px 20px rgba(0, 48, 73, 0.3);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 17px;
  text-transform: none;
  letter-spacing: 0.5px;
  margin: 22px 0 0 0;
  height: 56px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-columns {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-column {
    gap: 12px;
  }
  
  .form-section {
    margin-bottom: 12px;
  }
  
  .severity-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .severity-btn {
    padding: 12px 8px;
    font-size: 12px;
  }
  
  .severity-btn ion-icon {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .report-container {
    max-width: 100%;
  }
  
  .report-header {
    padding: 20px 16px;
  }
  
  .header-title {
    font-size: 20px;
  }
  
  .form-columns {
    gap: 10px;
  }
  
  .form-column {
    gap: 10px;
  }
  
  .form-section {
    margin-bottom: 10px;
  }
  
  .section-title {
    font-size: 14px;
  }
  
  .severity-grid {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }
  
  .severity-btn {
    padding: 10px 6px;
    font-size: 11px;
    gap: 4px;
  }
  
  .severity-btn ion-icon {
    font-size: 20px;
  }
}

/* Success Modal */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 48, 73, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 24px;
  animation: fadeIn 0.3s ease-out;
}

.success-modal {
  background: var(--cream-white);
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: slideInRight 0.4s ease-out;
}

.success-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, var(--success-green) 0%, #2a9d8f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 1s ease-in-out;
}

.success-icon ion-icon {
  font-size: 60px;
  color: var(--cream-white);
}

.success-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--navy-dark);
  margin: 0 0 16px 0;
  letter-spacing: -0.5px;
}

.success-message {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 400;
  color: rgba(0, 48, 73, 0.7);
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.success-button {
  --background: var(--navy-dark);
  --background-activated: var(--navy-medium);
  --color: var(--cream-white);
  --border-radius: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  margin: 0;
  height: 54px;
}
</style>