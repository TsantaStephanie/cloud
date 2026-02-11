<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Ajouter des photos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="edit-report-container">
        <!-- Header -->
        <div class="report-header">
          <div class="header-icon">
            <ion-icon :icon="cameraOutline" />
          </div>
          <h1 class="header-title">Ajouter des photos</h1>
          <p class="header-subtitle">Compléter le signalement avec des photos</p>
        </div>

        <!-- Report Info -->
        <div class="report-info" v-if="report">
          <div class="info-card">
            <h3 class="info-title">Informations du signalement</h3>
            <div class="info-item">
              <ion-icon :icon="documentTextOutline" />
              <span>{{ report.description }}</span>
            </div>
            <div class="info-item">
              <ion-icon :icon="alertCircleOutline" />
              <span>Gravité: {{ report.gravite }}</span>
            </div>
            <div class="info-item">
              <ion-icon :icon="locationOutline" />
              <span>{{ report.latitude.toFixed(6) }}, {{ report.longitude.toFixed(6) }}</span>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form class="edit-form">
          <!-- Images Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="cameraOutline" />
              Photos du signalement
            </h3>
            
            <!-- Images existantes -->
            <div v-if="existingImages.length > 0" class="existing-images">
              <h4>Photos existantes:</h4>
              <div class="image-preview-grid">
                <div 
                  v-for="(image, index) in existingImages" 
                  :key="index"
                  class="image-preview-item"
                >
                  <img :src="image" alt="Photo existante" />
                  <div class="image-badge">
                    <ion-icon :icon="checkmarkCircleOutline" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Composant ImageUpload avec Cloudinary -->
            <div class="upload-section">
              <h4 v-if="existingImages.length === 0">Ajouter des photos:</h4>
              <h4 v-else>Ajouter d'autres photos:</h4>
              <ImageUpload 
                :initial-images="initialImages"
                :max-images="5 - existingImages.length"
                @images-change="handleImagesChange"
              />
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
            @click="updateReport"
          >
            <ion-icon v-if="!submitting" :icon="checkmarkCircleOutline" slot="start" />
            <span v-if="!submitting">Mettre à jour le signalement</span>
            <span v-else>Mise à jour en cours...</span>
          </ion-button>
        </form>
      </div>

      <!-- Success Modal -->
      <div v-if="showSuccess" class="success-overlay" @click="closeSuccess">
        <div class="success-modal" @click.stop>
          <div class="success-icon">
            <ion-icon :icon="checkmarkCircleOutline" />
          </div>
          <h2 class="success-title">Photos ajoutées !</h2>
          <p class="success-message">
            Les photos ont été ajoutées avec succès au signalement.
          </p>
          <ion-button expand="block" @click="closeSuccess" class="success-button">
            Retour à la carte
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonBackButton
} from '@ionic/vue';
import {
  cameraOutline,
  documentTextOutline,
  alertCircleOutline,
  locationOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useReportsStore } from '@/stores/reports';
import ImageUpload from '@/components/ImageUpload.vue';

const router = useRouter();
const route = useRoute();
const reportsStore = useReportsStore();

const report = ref(null);
const submitting = ref(false);
const error = ref('');
const showSuccess = ref(false);

// Données pour les images Cloudinary
const initialImages = ref([]);
const newImages = ref({
  imageUrl: null,
  images: []
});

const existingImages = computed(() => {
  if (!report.value) return [];
  const images = [];
  if (report.value.imageUrl) images.push(report.value.imageUrl);
  if (report.value.images && report.value.images.length > 0) {
    images.push(...report.value.images);
  }
  return images;
});

const canSubmit = computed(() => {
  // Permet la soumission même sans nouvelles images (pour juste valider)
  return true;
});

// Fonction pour gérer les changements d'images Cloudinary
const handleImagesChange = (imagesData) => {
  console.log('🖼️ Nouvelles images:', imagesData);
  newImages.value = imagesData;
};

const updateReport = async () => {
  console.log('🚀 Mise à jour du signalement');
  
  submitting.value = true;
  error.value = '';
  console.log('✅ Début de la mise à jour');

  try {
    const updateData = {
      // Conserver les données existantes
      ...report.value,
      // Ajouter les nouvelles images Cloudinary
      imageUrl: newImages.value.imageUrl || report.value.imageUrl,
      images: [
        ...(report.value.images || []),
        ...(newImages.value.images || [])
      ]
    };
    
    console.log('📦 Données à mettre à jour:', updateData);

    const success = await reportsStore.updateReport(report.value.id, updateData);
    console.log('📋 Réponse du store:', success);

    if (success) {
      console.log('✅ Signalement mis à jour avec succès');
      showSuccess.value = true;
    } else {
      console.log('❌ Erreur lors de la mise à jour');
      error.value = 'Une erreur est survenue lors de la mise à jour. Veuillez réessayer.';
    }
  } catch (err) {
    console.log('💥 Erreur catchée:', err);
    error.value = 'Une erreur est survenue. Veuillez réessayer.';
  } finally {
    submitting.value = false;
    console.log('🏁 Fin de la mise à jour');
  }
};

const closeSuccess = () => {
  showSuccess.value = false;
  router.push('/tabs/map');
};

onMounted(async () => {
  const reportId = route.params.id;
  console.log('📋 Chargement du signalement:', reportId);
  
  try {
    // Récupérer le signalement depuis le store
    const reports = reportsStore.reports;
    const foundReport = reports.find(r => r.id === reportId);
    
    if (foundReport) {
      report.value = foundReport;
      console.log('✅ Signalement chargé:', foundReport);
    } else {
      error.value = 'Signalement non trouvé';
    }
  } catch (err) {
    console.error('Erreur lors du chargement du signalement:', err);
    error.value = 'Erreur lors du chargement du signalement';
  }
});
</script>

<style scoped>
.edit-report-container {
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

.report-info {
  padding: 20px 16px;
}

.info-card {
  background: var(--cream-light);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(0, 48, 73, 0.08);
}

.info-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--navy-dark);
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--navy-dark);
}

.info-item ion-icon {
  font-size: 18px;
  color: var(--navy-light);
  flex-shrink: 0;
}

.edit-form {
  padding: 22px 16px;
}

.form-section {
  margin-bottom: 24px;
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

.existing-images {
  margin-bottom: 20px;
}

.existing-images h4 {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
  margin: 0 0 12px 0;
}

.upload-section h4 {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
  margin: 0 0 12px 0;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.image-preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #dc2626;
  font-family: var(--font-body);
  font-size: 14px;
}

.error-banner ion-icon {
  font-size: 18px;
  color: #dc2626;
}

.submit-button {
  margin-top: 20px;
  --background: var(--navy-dark);
  --background-hover: var(--navy-medium);
}

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon ion-icon {
  font-size: 48px;
  color: white;
}

.success-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--navy-dark);
  margin: 0 0 12px 0;
}

.success-message {
  font-family: var(--font-body);
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.success-button {
  --background: #10b981;
  --background-hover: #059669;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
