import axios from 'axios';

// Configuration Cloudinary
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ddmnsomc5';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'signalements_upload';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Logs pour vérifier la configuration
console.log('🔧 Configuration Cloudinary:');
console.log('  Cloud Name:', CLOUD_NAME);
console.log('  Upload Preset:', UPLOAD_PRESET);
console.log('  Upload URL:', CLOUDINARY_URL);
console.log('  Env VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('  Env VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

/**
 * Upload une image vers Cloudinary
 * @param {File} file - Le fichier image à uploader
 * @returns {Promise<string>} - L'URL de l'image uploadée
 */
export const uploadImage = async (file) => {
  try {
    console.log('📤 Upload image - File:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('🔧 Upload URL:', CLOUDINARY_URL);
    console.log('⚙️ Upload preset:', UPLOAD_PRESET);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Upload successful:', response.data);
    return response.data.secure_url;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload Cloudinary:', error);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
      console.error('📊 Response headers:', error.response.headers);
    }
    throw new Error('Échec de l\'upload de l\'image');
  }
};

/**
 * Upload plusieurs images vers Cloudinary
 * @param {File[]} files - Les fichiers images à uploader
 * @returns {Promise<string[]>} - Les URLs des images uploadées
 */
export const uploadMultipleImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    throw error;
  }
};

/**
 * Génère une URL optimisée Cloudinary
 * @param {string} publicId - L'ID public de l'image
 * @param {Object} options - Options de transformation
 * @returns {string} - L'URL optimisée
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.crop) params.append('c', options.crop);
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);
  
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  return `${baseUrl}/${params.toString()}/${publicId}`;
};

/**
 * Extrait le public_id d'une URL Cloudinary
 * @param {string} url - L'URL Cloudinary
 * @returns {string} - Le public_id
 */
export const extractPublicId = (url) => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return matches ? matches[1] : '';
};

/**
 * Crée un objet image pour le stockage
 * @param {string} url - L'URL de l'image
 * @param {boolean} isMain - Si c'est l'image principale
 * @returns {Object} - Objet image formaté
 */
export const createImageObject = (url, isMain = false) => {
  return {
    url,
    publicId: extractPublicId(url),
    isMain,
    uploadedAt: new Date().toISOString()
  };
};
