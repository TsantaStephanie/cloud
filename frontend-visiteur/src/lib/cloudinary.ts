// Configuration de Cloudinary
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'VOTRE_CLOUD_NAME';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'VOTRE_UPLOAD_PRESET';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// Fonction pour uploader une image vers Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Fonction pour générer une URL optimisée Cloudinary
export const getOptimizedImageUrl = (publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: number;
}): string => {
  const params = new URLSearchParams();
  
  if (options?.width) params.append('w', options.width.toString());
  if (options?.height) params.append('h', options.height.toString());
  if (options?.crop) params.append('c', options.crop);
  if (options?.quality) params.append('q', options.quality.toString());
  
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  return `${baseUrl}/${params.toString()}/${publicId}`;
};

// Fonction pour extraire le public_id d'une URL Cloudinary
export const extractPublicId = (url: string): string => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return matches ? matches[1] : '';
};
