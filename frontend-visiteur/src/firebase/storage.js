// Firebase Storage configuration
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload une image vers Firebase Storage
export const uploadImage = async (file, userId, reportId, imageName) => {
  try {
    // Créer une référence pour le fichier
    const storageRef = ref(storage, `routes/${userId}/${reportId}/${imageName}`);
    
    // Uploader le fichier
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtenir l'URL de téléchargement
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Image uploadée avec succès:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Erreur upload image:', error);
    throw error;
  }
};

// Uploader plusieurs images
export const uploadMultipleImages = async (files, userId, reportId) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const imageName = `image_${Date.now()}_${index}.${file.name.split('.').pop()}`;
      return await uploadImage(file, userId, reportId, imageName);
    });
    
    const urls = await Promise.all(uploadPromises);
    console.log('✅ Images uploadées:', urls);
    return urls;
  } catch (error) {
    console.error('❌ Erreur upload multiple images:', error);
    throw error;
  }
};

// Supprimer une image
export const deleteImage = async (imageUrl) => {
  try {
    // Extraire le chemin de l'URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/o/');
    if (pathParts.length < 2) return;
    
    const filePath = decodeURIComponent(pathParts[1].split('?')[0]);
    const storageRef = ref(storage, filePath);
    
    await deleteObject(storageRef);
    console.log('✅ Image supprimée:', filePath);
  } catch (error) {
    console.error('❌ Erreur suppression image:', error);
    throw error;
  }
};

// Obtenir l'URL d'une image existante
export const getImageUrl = async (userId, reportId, imageName) => {
  try {
    const storageRef = ref(storage, `routes/${userId}/${reportId}/${imageName}`);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('❌ Erreur récupération URL image:', error);
    throw error;
  }
};
