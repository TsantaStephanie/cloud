import { useState } from 'react';
import { uploadImage } from '../lib/cloudinary';

interface ImageUploadProps {
  onImagesChange: (images: { imageUrl?: string; images?: string[] }) => void;
  initialImages?: { imageUrl?: string; images?: string[] };
  maxImages?: number;
}

export default function ImageUpload({ 
  onImagesChange, 
  initialImages, 
  maxImages = 5 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{
    imageUrl?: string;
    images: string[];
  }>({
    imageUrl: initialImages?.imageUrl,
    images: initialImages?.images || []
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      // Si c'est la première image, la mettre en imageUrl
      // Sinon, l'ajouter au tableau images
      let newImageUrl = previewImages.imageUrl;
      let newImages = [...previewImages.images];

      if (files.length === 1 && !previewImages.imageUrl) {
        newImageUrl = uploadedUrls[0];
      } else {
        newImages = [...newImages, ...uploadedUrls].slice(0, maxImages);
      }

      const updatedImages = {
        imageUrl: newImageUrl,
        images: newImages
      };

      setPreviewImages(updatedImages);
      onImagesChange(updatedImages);

    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = previewImages.images.filter((_, i) => i !== index);
    const updatedImages = {
      imageUrl: previewImages.imageUrl,
      images: newImages
    };
    setPreviewImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const removeMainImage = () => {
    const updatedImages = {
      imageUrl: undefined,
      images: previewImages.images
    };
    setPreviewImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos du signalement
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="text-blue-600">
                  <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Upload en cours...</p>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple={true}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Image principale */}
      {previewImages.imageUrl && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Image principale</h4>
          <div className="relative inline-block">
            <img
              src={previewImages.imageUrl}
              alt="Image principale"
              className="w-32 h-32 object-cover rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={removeMainImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Images multiples */}
      {previewImages.images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Autres photos</h4>
          <div className="grid grid-cols-3 gap-2">
            {previewImages.images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Photo ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
