<template>
  <div class="image-upload">
    <ion-label class="ion-text-wrap ion-margin-bottom">
      <h3>Photos du signalement</h3>
    </ion-label>

    <!-- Zone d'upload -->
    <div class="upload-zone" @click="selectImages">
      <ion-icon 
        :icon="cloudUploadOutline" 
        class="upload-icon"
        :class="{ 'uploading': uploading }"
      ></ion-icon>
      <p class="upload-text">
        {{ uploading ? 'Upload en cours...' : 'Cliquez pour ajouter des photos' }}
      </p>
      <p class="upload-subtitle">PNG, JPG jusqu'à 10MB</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      @change="handleFileSelect"
      style="display: none"
    />

    <!-- Prévisualisation des images -->
    <div class="image-preview-grid" v-if="previewImages.length > 0">
      <div 
        v-for="(image, index) in previewImages" 
        :key="index"
        class="image-preview-item"
      >
        <img :src="image.url" :alt="`Photo ${index + 1}`" />
        <div class="image-overlay">
          <ion-button 
            fill="clear" 
            size="small" 
            @click="removeImage(index)"
            class="remove-button"
          >
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
          <ion-button 
            fill="clear" 
            size="small" 
            @click="setMainImage(index)"
            class="main-button"
            :class="{ 'is-main': image.isMain }"
          >
            <ion-icon :icon="starOutline"></ion-icon>
          </ion-button>
        </div>
        <div class="main-badge" v-if="image.isMain">
          <ion-icon :icon="star"></ion-icon>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <ion-progress-bar 
      v-if="uploading" 
      type="indeterminate" 
      class="upload-progress"
    ></ion-progress-bar>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import { 
  IonLabel, 
  IonIcon, 
  IonButton, 
  IonProgressBar,
  toastController
} from '@ionic/vue';
import { 
  cloudUploadOutline, 
  closeOutline, 
  starOutline, 
  star 
} from 'ionicons/icons';
import { uploadMultipleImages, createImageObject } from '../services/cloudinary';

const props = defineProps({
  initialImages: {
    type: Array,
    default: () => []
  },
  maxImages: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['images-change']);

const fileInput = ref(null);
const uploading = ref(false);
const previewImages = ref([]);

// Initialiser avec les images existantes
if (props.initialImages.length > 0) {
  previewImages.value = props.initialImages.map((img, index) => 
    createImageObject(img, index === 0)
  );
}

const selectImages = () => {
  if (uploading.value) return;
  fileInput.value?.click();
};

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  
  if (files.length === 0) return;
  if (previewImages.value.length + files.length > props.maxImages) {
    showToast(`Maximum ${props.maxImages} images autorisées`);
    return;
  }

  uploading.value = true;

  try {
    const uploadedUrls = await uploadMultipleImages(files);
    
    // Ajouter les nouvelles images à la prévisualisation
    const newImages = uploadedUrls.map((url, index) => {
      const isFirstImage = previewImages.value.length === 0 && index === 0;
      return createImageObject(url, isFirstImage);
    });

    previewImages.value = [...previewImages.value, ...newImages];
    emitImagesChange();
    
    showToast(`${files.length} image(s) uploadée(s) avec succès`);
    
  } catch (error) {
    console.error('Erreur upload:', error);
    showToast('Erreur lors de l\'upload des images');
  } finally {
    uploading.value = false;
    // Réinitialiser l'input
    event.target.value = '';
  }
};

const removeImage = (index) => {
  previewImages.value.splice(index, 1);
  
  // Si on supprime l'image principale, la première devient principale
  if (previewImages.value.length > 0 && !previewImages.value.some(img => img.isMain)) {
    previewImages.value[0].isMain = true;
  }
  
  emitImagesChange();
  showToast('Image supprimée');
};

const setMainImage = (index) => {
  // Toutes les images deviennent non principales
  previewImages.value.forEach(img => img.isMain = false);
  // L'image sélectionnée devient principale
  previewImages.value[index].isMain = true;
  
  emitImagesChange();
  showToast('Image principale définie');
};

const emitImagesChange = () => {
  const mainImage = previewImages.value.find(img => img.isMain);
  const otherImages = previewImages.value.filter(img => !img.isMain);
  
  emit('images-change', {
    imageUrl: mainImage?.url,
    images: otherImages.map(img => img.url)
  });
};

const showToast = async (message) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'bottom'
  });
  await toast.present();
};
</script>

<style scoped>
.image-upload {
  margin: 16px 0;
}

.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
}

.upload-zone:hover {
  border-color: #3880ff;
  background: #f0f8ff;
}

.upload-icon {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.upload-icon.uploading {
  color: #3880ff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.upload-text {
  margin: 8px 0 4px;
  font-weight: 600;
  color: #333;
}

.upload-subtitle {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 16px;
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

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview-item:hover .image-overlay {
  opacity: 1;
}

.remove-button {
  --color: #ff4961;
}

.main-button {
  --color: #ffc107;
}

.main-button.is-main {
  --color: #ffc107;
}

.main-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ffc107;
  color: #333;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.upload-progress {
  margin-top: 16px;
}
</style>
