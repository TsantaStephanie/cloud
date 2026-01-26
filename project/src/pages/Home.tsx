import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import MapView from '../components/MapView';
import { useAuth } from '../contexts/AuthContext';
import { routeService } from '../lib/services';
import type { RouteEndommagee } from '../types/firebase';

export default function Home() {
  const [routes, setRoutes] = useState<RouteEndommagee[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    signale: 0,
    enCours: 0,
    repare: 0,
  });
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await routeService.getAll();
        
        // Si aucune route n'existe, ajouter des données de test
        if (routesData.length === 0) {
          const testRoutes = [
            {
              utilisateurId: 'system',
              latitude: -18.8792,
              longitude: 47.5079,
              gravite: 'critique' as const,
              description: 'Grand nid-de-poule avenue Independence',
              statut: 'nouveau' as const,
              longueurKm: 0.05,
              surfaceM2: 50,
              budget: 5000,
              entreprise: 'SARL Routes Plus'
            },
            {
              utilisateurId: 'system',
              latitude: -18.9136,
              longitude: 47.5361,
              gravite: 'elevee' as const,
              description: 'Chaussee effondree Ambohijanahary',
              statut: 'verifie' as const,
              longueurKm: 0.15,
              surfaceM2: 150,
              budget: 15000,
              entreprise: 'Construction Tana'
            },
            {
              utilisateurId: 'system',
              latitude: -18.8667,
              longitude: 47.5167,
              gravite: 'moyenne' as const,
              description: 'Route defoncee Analakely',
              statut: 'en_cours' as const,
              longueurKm: 0.30,
              surfaceM2: 300,
              budget: 25000,
              entreprise: 'BTP Madagascar'
            },
            {
              utilisateurId: 'system',
              latitude: -18.9036,
              longitude: 47.5272,
              gravite: 'faible' as const,
              description: 'Petite fissure route Andrainarivo',
              statut: 'termine' as const,
              longueurKm: 0.02,
              surfaceM2: 20,
              budget: 2000,
              entreprise: 'SARL Routes Plus'
            },
            {
              utilisateurId: 'system',
              latitude: -18.8900,
              longitude: 47.5500,
              gravite: 'elevee' as const,
              description: 'Inondation Andravoahangy',
              statut: 'nouveau' as const,
              longueurKm: 0.80,
              surfaceM2: 800,
              budget: 45000,
              entreprise: 'Hydro Services'
            },
            {
              utilisateurId: 'system',
              latitude: -18.9200,
              longitude: 47.5250,
              gravite: 'moyenne' as const,
              description: 'Trottoir endommage Anosy',
              statut: 'verifie' as const,
              longueurKm: 0.10,
              surfaceM2: 100,
              budget: 8000,
              entreprise: 'Urbanisme Tana'
            },
            {
              utilisateurId: 'system',
              latitude: -18.8783,
              longitude: 47.5125,
              gravite: 'critique' as const,
              description: 'Trou profond route Mahamasina',
              statut: 'en_cours' as const,
              longueurKm: 0.08,
              surfaceM2: 80,
              budget: 12000,
              entreprise: 'Construction Tana'
            },
            {
              utilisateurId: 'system',
              latitude: -18.8994,
              longitude: 47.5339,
              gravite: 'faible' as const,
              description: 'Fissures legeres Isotry',
              statut: 'nouveau' as const,
              longueurKm: 0.03,
              surfaceM2: 30,
              budget: 3000,
              entreprise: 'SARL Routes Plus'
            }
          ];

          for (const route of testRoutes) {
            await routeService.create(route);
          }
          
          // Recharger les données après l'ajout
          const updatedRoutesData = await routeService.getAll();
          setRoutes(updatedRoutesData);
          
          const total = updatedRoutesData.length;
          const signale = updatedRoutesData.filter((r: RouteEndommagee) => r.statut === 'nouveau').length;
          const enCours = updatedRoutesData.filter((r: RouteEndommagee) => r.statut === 'en_cours').length;
          const repare = updatedRoutesData.filter((r: RouteEndommagee) => r.statut === 'termine').length;

          setStats({ total, signale, enCours, repare });
        } else {
          // Utiliser les données existantes
          setRoutes(routesData);
          
          const total = routesData.length;
          const signale = routesData.filter((r: RouteEndommagee) => r.statut === 'nouveau').length;
          const enCours = routesData.filter((r: RouteEndommagee) => r.statut === 'en_cours').length;
          const repare = routesData.filter((r: RouteEndommagee) => r.statut === 'termine').length;

          setStats({ total, signale, enCours, repare });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des routes:', error);
      }
    };

    loadRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Project-Cloud
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              View road works in Antananarivo
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Reports</p>
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


        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Road Works Map</h2>
          <div className="h-[600px]">
            <MapView reports={routes.map(route => ({
              id: route.routeId,
              user_id: route.utilisateurId,
              title: route.description || 'Sans description',
              description: route.description || 'Sans description',
              status: route.statut === 'nouveau' ? 'reported' as const : 
                     route.statut === 'en_cours' ? 'in_progress' as const :
                     route.statut === 'termine' ? 'completed' as const : 
                     route.statut === 'verifie' ? 'verified' as const : 'rejected' as const,
              priority: route.gravite === 'faible' ? 'low' as const :
                      route.gravite === 'moyenne' ? 'medium' as const :
                      route.gravite === 'elevee' ? 'high' as const : 'urgent' as const,
              latitude: route.latitude,
              longitude: route.longitude,
              location_name: `${route.latitude.toFixed(4)}, ${route.longitude.toFixed(4)}`,
              longueur_km: route.longueurKm,
              surface_m2: route.surfaceM2,
              budget: route.budget,
              entreprise: route.entreprise,
              created_at: route.dateCreation.toISOString(),
              updated_at: route.dateMiseAJour.toISOString()
            }))} />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tableau de récapitulatif</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Nb de points</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total surface</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {routes.reduce((sum, route) => sum + (route.surfaceM2 || 0), 0).toLocaleString('fr-FR')} m²
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avancement</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.total > 0 ? Math.round((stats.repare / stats.total) * 100) : 0}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total budget</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {routes.reduce((sum, route) => sum + (route.budget || 0), 0).toLocaleString('fr-FR')} €
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reports</h2>
          <div className="space-y-4">
            {routes.slice(0, 5).map((route) => (
              <div key={route.routeId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{route.description}</h3>
                    <p className="text-gray-600 text-sm mt-1">Gravité: {route.gravite}</p>
                    <p className="text-gray-500 text-xs mt-2">{route.latitude.toFixed(4)}, {route.longitude.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      route.statut === 'nouveau' ? 'bg-red-100 text-red-800' :
                      route.statut === 'en_cours' ? 'bg-amber-100 text-amber-800' :
                      route.statut === 'termine' ? 'bg-green-100 text-green-800' :
                      route.statut === 'verifie' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {route.statut === 'nouveau' ? 'Nouveau' :
                       route.statut === 'en_cours' ? 'En cours' :
                       route.statut === 'termine' ? 'Terminé' :
                       route.statut === 'verifie' ? 'Vérifié' :
                       route.statut}
                    </span>
                    <p className="text-gray-500 text-xs mt-2">{route.dateCreation.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
