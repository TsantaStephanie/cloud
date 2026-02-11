import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../lib/api';
import type { RouteGravite } from '../types/database';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedLocation?: { lat: number; lng: number; locationName: string } | null;
}

export default function ReportModal({ isOpen, onClose, onSuccess, selectedLocation }: ReportModalProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [gravite, setGravite] = useState<RouteGravite>('moyenne');
  const [longueurKm, setLongueurKm] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiService.addRoute({
        utilisateur_id: user?.id || null,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        gravite,
        description,
        statut: 'signale',
        longueur_km: longueurKm,
      });

      setDescription('');
      setGravite('moyenne');
      setLongueurKm(0.1);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la création du signalement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Signaler Route Endommagée</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {selectedLocation && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Emplacement:</strong> {selectedLocation.locationName}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Décrivez le problème de la route..."
            />
          </div>

          <div>
            <label htmlFor="gravite" className="block text-sm font-medium text-gray-700 mb-2">
              Gravité
            </label>
            <select
              id="gravite"
              value={gravite}
              onChange={(e) => setGravite(e.target.value as RouteGravite)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="faible">Faible</option>
              <option value="moyenne">Moyenne</option>
              <option value="elevee">Élevée</option>
              <option value="critique">Critique</option>
            </select>
          </div>

          <div>
            <label htmlFor="longueur" className="block text-sm font-medium text-gray-700 mb-2">
              Longueur (km)
            </label>
            <input
              id="longueur"
              type="number"
              step="0.01"
              min="0.01"
              max="10"
              required
              value={longueurKm}
              onChange={(e) => setLongueurKm(parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.10"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Signaler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
