import { useState } from 'react';
import { routeService } from '../lib/services';
import type { RouteEndommagee } from '../types/firebase';

interface AddRouteFormProps {
  onRouteAdded?: (route: RouteEndommagee) => void;
  utilisateurId?: string;
}

export default function AddRouteForm({ onRouteAdded, utilisateurId }: AddRouteFormProps) {
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    gravite: 'moyenne' as 'faible' | 'moyenne' | 'elevee' | 'critique',
    description: '',
    longueurKm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newRoute: Omit<RouteEndommagee, 'routeId' | 'dateCreation' | 'dateMiseAJour'> = {
        utilisateurId: utilisateurId || undefined,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        gravite: formData.gravite,
        description: formData.description,
        statut: 'signale',
        longueurKm: parseFloat(formData.longueurKm) || 0
      };

      const routeId = await routeService.create(newRoute);
      
      // Récupérer la route complète
      const route = await routeService.getAll().then(routes => 
        routes.find(r => r.routeId === routeId)
      );

      if (route && onRouteAdded) {
        onRouteAdded(route);
      }

      // Reset form
      setFormData({
        latitude: '',
        longitude: '',
        gravite: 'moyenne',
        description: '',
        longueurKm: ''
      });
    } catch (err) {
      setError('Erreur lors de l\'ajout de la route');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Signaler une route endommagée</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="-18.8792"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="47.5079"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gravité *
          </label>
          <select
            name="gravite"
            value={formData.gravite}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="elevee">Élevée</option>
            <option value="critique">Critique</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description du problème..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longueur (km)
          </label>
          <input
            type="number"
            step="0.01"
            name="longueurKm"
            value={formData.longueurKm}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Envoi en cours...' : 'Signaler la route'}
        </button>
      </form>
    </div>
  );
}
