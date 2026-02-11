<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/map"></ion-back-button>
        </ion-buttons>
        <ion-title>Modifier le signalement</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="edit-point-container">
        <!-- Header -->
        <div class="report-header">
          <div class="header-icon">
            <ion-icon :icon="createOutline" />
          </div>
          <h1 class="header-title">Modifier le signalement</h1>
          <p class="header-subtitle">Mettez à jour les informations</p>
        </div>

        <!-- Form -->
        <form class="edit-form" @submit.prevent="updatePoint">
          <!-- Location Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="locationOutline" />
              Localisation
            </h3>
            
            <div class="location-info">
              <div class="coord-item">
                <ion-icon :icon="mapOutline" />
                <span>Latitude: {{ reportData.latitude.toFixed(6) }}</span>
              </div>
              <div class="coord-item">
                <ion-icon :icon="mapOutline" />
                <span>Longitude: {{ reportData.longitude.toFixed(6) }}</span>
              </div>
            </div>
          </div>

          <!-- Description Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="documentTextOutline" />
              Description
            </h3>
            
            <ion-textarea
              v-model="reportData.description"
              placeholder="Décrivez le problème..."
              rows="3"
              class="custom-textarea"
            ></ion-textarea>
          </div>

          <!-- Severity Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="alertCircleOutline" />
              Gravité
            </h3>
            
            <ion-segment v-model="reportData.gravite" class="severity-segment">
              <ion-segment-button value="faible">
                <ion-label>Faible</ion-label>
              </ion-segment-button>
              <ion-segment-button value="moyenne">
                <ion-label>Moyenne</ion-label>
              </ion-segment-button>
              <ion-segment-button value="elevee">
                <ion-label>Élevée</ion-label>
              </ion-segment-button>
              <ion-segment-button value="critique">
                <ion-label>Critique</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>

          <!-- Status Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="checkmarkCircleOutline" />
              Statut
            </h3>
            
            <ion-select v-model="reportData.statut" placeholder="Choisir le statut" class="custom-select">
              <ion-select-option value="nouveau">Nouveau</ion-select-option>
              <ion-select-option value="verifie">Vérifié</ion-select-option>
              <ion-select-option value="en_cours">En cours</ion-select-option>
              <ion-select-option value="termine">Terminé</ion-select-option>
            </ion-select>
          </div>

          <!-- Technical Details Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="constructOutline" />
              Détails techniques
            </h3>
            
            <div class="form-row">
              <div class="form-group">
                <ion-label position="stacked">Longueur (km)</ion-label>
                <ion-input
                  v-model.number="reportData.longueurKm"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="custom-input"
                ></ion-input>
              </div>
              
              <div class="form-group">
                <ion-label position="stacked">Surface (m²)</ion-label>
                <ion-input
                  v-model.number="reportData.surfaceM2"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  class="custom-input"
                ></ion-input>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <ion-label position="stacked">Budget (Ar)</ion-label>
                <ion-input
                  v-model.number="reportData.budget"
                  type="number"
                  step="1000"
                  min="0"
                  placeholder="0"
                  class="custom-input"
                ></ion-input>
              </div>
              
              <div class="form-group">
                <ion-label position="stacked">Entreprise</ion-label>
                <ion-input
                  v-model="reportData.entreprise"
                  type="text"
                  placeholder="Nom de l'entreprise"
                  class="custom-input"
                ></ion-input>
              </div>
            </div>
          </div>

          <!-- Images Section -->
          <div class="form-section">
            <h3 class="section-title">
              <ion-icon :icon="cameraOutline" />
              Photos
            </h3>
            
            <!-- Images existantes avec options -->
            <div v-if="existingImages.length > 0" class="existing-images">
              <h4>Photos actuelles:</h4>
              <div class="image-preview-grid">
                <div 
                  v-for="(image, index) in existingImages" 
                  :key="index"
                  class="image-preview-item"
                >
                  <img :src="image" alt="Photo existante" />
                  <div class="image-actions">
                    <button 
                      @click="removeImage(index)"
                      class="remove-btn"
                      title="Supprimer cette photo"
                    >
                      <ion-icon :icon="trashOutline" />
                    </button>
                    <button 
                      @click="replaceImage(index)"
                      class="replace-btn"
                      title="Remplacer cette photo"
                    >
                      <ion-icon :icon="cameraOutline" />
                    </button>
                  </div>
                  <div class="image-badge">
                    <ion-icon :icon="checkmarkCircleOutline" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Composant ImageUpload pour ajouter de nouvelles photos -->
            <div class="upload-section">
              <h4>Ajouter de nouvelles photos:</h4>
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
            type="submit"
            :disabled="!canSubmit || submitting"
            class="submit-button"
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
          <h2 class="success-title">Signalement modifié !</h2>
          <p class="success-message">
            Les informations du signalement ont été mises à jour avec succès.
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
  IonBackButton,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput
} from '@ionic/vue';
import {
  createOutline,
  locationOutline,
  documentTextOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  constructOutline,
  cameraOutline,
  mapOutline,
  trashOutline
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

// Données du formulaire
const reportData = ref({
  latitude: 0,
  longitude: 0,
  description: '',
  gravite: 'moyenne',
  statut: 'nouveau',
  longueurKm: 0,
  surfaceM2: 0,
  budget: 0,
  entreprise: ''
});

// Gestion des photos
const removedImages = ref([]);
const replacedImages = ref(new Map()); // index -> nouvelle URL
const imageReplaceMode = ref(null); // index de l'image à remplacer

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
  return reportData.value.description.trim() !== '';
});

// Fonction pour gérer les changements d'images Cloudinary
const handleImagesChange = (imagesData) => {
  console.log('🖼️ Nouvelles images:', imagesData);
  
  if (imageReplaceMode.value !== null) {
    // Mode remplacement : remplacer l'image spécifique
    replacedImages.value.set(imageReplaceMode.value, imagesData.imageUrl || imagesData.images[0]);
    imageReplaceMode.value = null;
  } else {
    // Mode ajout normal
    newImages.value = imagesData;
  }
};

// Fonction pour supprimer une image existante
const removeImage = (index) => {
  console.log('🗑️ Suppression de l\'image:', index);
  removedImages.value.push(index);
};

// Fonction pour remplacer une image existante
const replaceImage = (index) => {
  console.log('🔄 Remplacement de l\'image:', index);
  imageReplaceMode.value = index;
  // Simuler un clic sur le composant ImageUpload
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ici vous pourriez utiliser le service Cloudinary pour uploader
      // Pour l'instant, nous allons simuler avec une URL
      const newUrl = URL.createObjectURL(file);
      replacedImages.value.set(index, newUrl);
      imageReplaceMode.value = null;
    }
  };
  fileInput.click();
};

const updatePoint = async () => {
  console.log('🚀 Mise à jour du signalement');
  
  submitting.value = true;
  error.value = '';
  console.log('✅ Début de la mise à jour');

  try {
    // Construire la liste finale des images
    let finalImages = [...existingImages.value];
    
    // Supprimer les images marquées pour suppression
    const sortedRemovedIndices = [...removedImages.value].sort((a, b) => b - a); // Trier par ordre décroissant
    for (const index of sortedRemovedIndices) {
      finalImages.splice(index, 1);
    }
    
    // Appliquer les remplacements
    for (const [index, newUrl] of replacedImages.value) {
      if (index < finalImages.length) {
        finalImages[index] = newUrl;
      }
    }
    
    // Ajouter les nouvelles images
    if (newImages.value.imageUrl) {
      finalImages.unshift(newImages.value.imageUrl);
    }
    if (newImages.value.images && newImages.value.images.length > 0) {
      finalImages.push(...newImages.value.images);
    }
    
    const updateData = {
      // Conserver les coordonnées existantes
      latitude: reportData.value.latitude,
      longitude: reportData.value.longitude,
      // Mettre à jour les autres champs
      description: reportData.value.description,
      gravite: reportData.value.gravite,
      statut: reportData.value.statut,
      longueurKm: reportData.value.longueurKm,
      surfaceM2: reportData.value.surfaceM2,
      budget: reportData.value.budget,
      entreprise: reportData.value.entreprise,
      // Mettre à jour les images
      imageUrl: finalImages.length > 0 ? finalImages[0] : null,
      images: finalImages.length > 1 ? finalImages.slice(1) : []
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
  console.log('📋 Chargement du signalement pour modification:', reportId);
  
  try {
    // Récupérer le signalement depuis le store
    const reports = reportsStore.reports;
    const foundReport = reports.find(r => r.id === reportId);
    
    if (foundReport) {
      report.value = foundReport;
      
      // Initialiser les données du formulaire
      reportData.value = {
        latitude: foundReport.latitude,
        longitude: foundReport.longitude,
        description: foundReport.description || '',
        gravite: foundReport.gravite || 'moyenne',
        statut: foundReport.statut || 'nouveau',
        longueurKm: foundReport.longueurKm || 0,
        surfaceM2: foundReport.surfaceM2 || 0,
        budget: foundReport.budget || 0,
        entreprise: foundReport.entreprise || ''
      };
      
      console.log('✅ Signalement chargé pour modification:', foundReport);
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
.edit-point-container {
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

.location-info {
  background: var(--cream-light);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(0, 48, 73, 0.08);
}

.coord-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--navy-dark);
}

.coord-item:last-child {
  margin-bottom: 0;
}

.coord-item ion-icon {
  font-size: 18px;
  color: var(--navy-light);
  flex-shrink: 0;
}

.custom-textarea {
  --background: var(--cream-light);
  --border: 2px solid rgba(0, 48, 73, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  font-family: var(--font-body);
  font-size: 15px;
}

.severity-segment {
  --background: var(--cream-light);
  --border-radius: 12px;
  margin-bottom: 8px;
}

.custom-select {
  --background: var(--cream-light);
  --border: 2px solid rgba(0, 48, 73, 0.08);
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --placeholder-color: rgba(0, 48, 73, 0.5);
  font-family: var(--font-body);
  font-size: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group ion-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  color: var(--navy-dark);
  margin-bottom: 6px;
}

.custom-input {
  --background: var(--cream-light);
  --border: 2px solid rgba(0, 48, 73, 0.08);
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  font-family: var(--font-body);
  font-size: 15px;
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

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-item:hover .image-actions {
  opacity: 1;
}

.remove-btn, .replace-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.remove-btn {
  background: #ef4444;
  color: white;
}

.remove-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.replace-btn {
  background: #3b82f6;
  color: white;
}

.replace-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.image-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
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

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
