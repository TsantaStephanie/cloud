import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { routeService } from '../lib/services';
import type { RouteEndommagee } from '../types/firebase';

export default function Dashboard() {
  const [routes, setRoutes] = useState<RouteEndommagee[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    signale: 0,
    enCours: 0,
    repare: 0,
    verifie: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const routesData = await routeService.getAll();
        setRoutes(routesData);
        
        const total = routesData.length;
        const signale = routesData.filter((r: RouteEndommagee) => r.statut === 'signale').length;
        const enCours = routesData.filter((r: RouteEndommagee) => r.statut === 'en_cours').length;
        const repare = routesData.filter((r: RouteEndommagee) => r.statut === 'repare').length;
        const verifie = routesData.filter((r: RouteEndommagee) => r.statut === 'verifie').length;

        setStats({ total, signale, enCours, repare, verifie });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateStatus = async (routeId: string, newStatus: RouteEndommagee['statut']) => {
    try {
      await routeService.update(routeId, { statut: newStatus });
      setRoutes(prev => prev.map(route => 
        route.routeId === routeId 
          ? { ...route, statut: newStatus, dateMiseAJour: new Date() }
          : route
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Gestion des routes endommagées</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <MapPin className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Signalé</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.signale}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Vérifié</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.verifie}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Cours</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.enCours}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Réparé</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.repare}</p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Routes endommagées</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gravité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.routeId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {route.description || 'Sans description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        route.gravite === 'critique' ? 'bg-red-100 text-red-800' :
                        route.gravite === 'elevee' ? 'bg-orange-100 text-orange-800' :
                        route.gravite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {route.gravite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={route.statut}
                        onChange={(e) => handleUpdateStatus(route.routeId, e.target.value as RouteEndommagee['statut'])}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="signale">Signalé</option>
                        <option value="verifie">Vérifié</option>
                        <option value="en_cours">En cours</option>
                        <option value="repare">Réparé</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.latitude.toFixed(4)}, {route.longitude.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.dateCreation.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}