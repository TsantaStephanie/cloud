import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteEndommagee } from '../types/firebase';
import { routeService } from '../lib/services';
import ImageUpload from '../components/ImageUpload';

export default function Signalement() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<RouteEndommagee>>({
    gravite: 'moyenne',
    statut: 'nouveau',
    longueurKm: 0,
    surfaceM2: 0,
    budget: 0,
    entreprise: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'longueurKm' || name === 'surfaceM2' || name === 'budget' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Veuillez entrer les coordonnées manuellement.');
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const signalementData = {
        ...formData,
        utilisateurId: 'current-user', // À remplacer avec l'ID utilisateur réel
        dateCreation: new Date(),
        dateMiseAJour: new Date()
      } as RouteEndommagee;

      await routeService.create(signalementData);
      alert('Signalement créé avec succès !');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création du signalement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Nouveau Signalement de Route Endommagée
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Localisation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="-18.8792"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="47.5079"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleLocationClick}
                className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                📍 Utiliser ma position actuelle
              </button>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez le problème (ex: nid-de-poule, route effondrée, etc.)"
                />
              </div>

              {/* Gravité et Statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gravité *
                  </label>
                  <select
                    name="gravite"
                    value={formData.gravite}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="faible">Faible</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="elevee">Élevée</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="verifie">Vérifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longueur (km)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="longueurKm"
                    value={formData.longueurKm}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="surfaceM2"
                    value={formData.surfaceM2}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Budget et Entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Budget (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SARL Routes Plus"
                  />
                </div>
              </div>

              {/* Upload d'images */}
              <ImageUpload
                onImagesChange={(images) => {
                  setFormData(prev => ({
                    ...prev,
                    imageUrl: images.imageUrl,
                    images: images.images
                  }));
                }}
                initialImages={{
                  imageUrl: formData.imageUrl,
                  images: formData.images
                }}
              />

              {/* Boutons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Création en cours...' : 'Créer le signalement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
