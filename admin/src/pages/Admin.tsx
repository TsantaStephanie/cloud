import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, CheckCircle, AlertCircle, Clock, Shield, User, X, Mail, Phone, Key } from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  syncFirebaseToPostgres, 
  getFirebaseSyncStats, 
  testFirebaseConnection,
  forceSyncFirebaseToPostgres,
  type FirebaseSyncResult, 
  type FirebaseSyncStats 
} from '../lib/firebase-sync';
import { getAllReports, type Report } from '../lib/reports';
import { createUserInBothDatabases, validateCreateUserData, type CreateUserData, type CreateUserResult } from '../lib/user-management';
import type { UserRole } from '../types/database';

const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<FirebaseSyncResult | null>(null);
  const [syncStats, setSyncStats] = useState<FirebaseSyncStats | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // États pour la création d'utilisateur
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserResult, setCreateUserResult] = useState<CreateUserResult | null>(null);
  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    phone: ''
  });

  // Vérifier si l'utilisateur est admin
  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès Refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // Vérifier la connexion et charger les stats au montage
  useEffect(() => {
    checkConnection();
    loadSyncStats();
    loadReports();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await testFirebaseConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadSyncStats = async () => {
    try {
      const stats = await getFirebaseSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const loadReports = async () => {
    try {
      const reportsData = await getAllReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    }
  };

  const handleCreateUser = async () => {
    // Validation des données
    const validation = validateCreateUserData(newUser);
    if (!validation.isValid) {
      setCreateUserResult({
        success: false,
        message: `Erreurs de validation: ${validation.errors.join(', ')}`
      });
      return;
    }

    setCreateUserLoading(true);
    setCreateUserResult(null);

    try {
      const result = await createUserInBothDatabases(newUser);
      setCreateUserResult(result);
      
      if (result.success) {
        // Réinitialiser le formulaire
        setNewUser({
          email: '',
          password: '',
          fullName: '',
          role: 'user',
          phone: ''
        });
      }
    } catch (error) {
      setCreateUserResult({
        success: false,
        message: `Erreur inattendue: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const result = await syncFirebaseToPostgres();
      setSyncResult(result);
      
      // Recharger les statistiques et les rapports après synchronisation
      await loadSyncStats();
      await loadReports();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        imported: 0,
        updated: 0,
        errors: []
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncButtonColor = () => {
    if (isConnected === null) return 'bg-gray-600 hover:bg-gray-700';
    if (isConnected) return 'bg-green-600 hover:bg-green-700';
    return 'bg-red-600 hover:bg-red-700';
  };

  const getSyncButtonText = () => {
    if (isSyncing) return 'Synchronisation...';
    if (isConnected === null) return 'Vérification...';
    if (isConnected) return 'Synchroniser';
    return 'Hors ligne';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        {/* Statut de connexion */}
        <div className="mb-6 p-3 rounded-lg border">
          <div className="flex items-center space-x-2">
            {isConnected === null ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isConnected === null ? 'Vérification de la connexion...' : 
               isConnected ? 'Connecté à Firebase' : 
               'Firebase indisponible'}
            </span>
          </div>
        </div>

        {/* Statistiques de synchronisation */}
        {syncStats && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Statistiques de synchronisation</h3>
            <div className="space-y-1 text-xs text-blue-700">
              <div>Total routes: {syncStats.totalRoutes}</div>
              <div>Total utilisateurs: {syncStats.totalUsers}</div>
              {syncStats.lastSyncDate && (
                <div>Dernière sync: {new Date(syncStats.lastSyncDate).toLocaleString()}</div>
              )}
              {syncStats.pendingSync > 0 && (
                <div className="font-semibold">En attente: {syncStats.pendingSync}</div>
              )}
            </div>
          </div>
        )}
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search signalement..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setShowCreateUserModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <User className="h-5 w-5" />
            <span>Créer un utilisateur</span>
          </button>
          
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5" />
            <span>Add Signalement</span>
          </button>
          
          <button 
            onClick={() => {
              setShowSyncModal(true);
              handleSync();
            }}
            disabled={isSyncing || isConnected === false}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getSyncButtonColor()}`}
          >
            <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{getSyncButtonText()}</span>
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Map
          initialViewState={{
            longitude: 47.5215,
            latitude: -18.8792,
            zoom: 10
          }}
          style={{width: '100%', height: '100%'}}
          mapStyle="http://localhost:8081/styles/basic-preview/style.json"
        >
          {/* Marqueurs pour les rapports PostgreSQL */}
          {reports.map((report) => (
            <Marker
              key={report.id}
              longitude={report.longitude}
              latitude={report.latitude}
              anchor="bottom"
            >
              <div
                className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-700 transition-colors cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                !
              </div>
            </Marker>
          ))}

          {/* Popup pour le rapport sélectionné */}
          {selectedReport && (
            <Popup
              longitude={selectedReport.longitude}
              latitude={selectedReport.latitude}
              anchor="top"
              onClose={() => setSelectedReport(null)}
              closeOnClick={false}
              className="bg-white rounded-lg shadow-lg p-4 max-w-xs"
            >
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900">{selectedReport.title}</h3>
                <p className="text-sm text-gray-600">{selectedReport.description}</p>
                <div className="flex justify-between text-xs">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {selectedReport.status}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                    {selectedReport.priority}
                  </span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Modal de synchronisation */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Synchronisation</h2>
            
            {isSyncing ? (
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span>Synchronisation en cours...</span>
              </div>
            ) : syncResult ? (
              <div className={`space-y-3 ${syncResult.success ? 'text-green-600' : 'text-red-600'}`}>
                <div className="flex items-center space-x-2">
                  {syncResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{syncResult.message}</span>
                </div>
                
                {(syncResult.imported > 0 || syncResult.updated > 0) && (
                  <div className="text-sm space-y-1">
                    {syncResult.imported > 0 && <div>• {syncResult.imported} rapports importés</div>}
                    {syncResult.updated > 0 && <div>• {syncResult.updated} rapports mis à jour</div>}
                  </div>
                )}
                
                {syncResult.errors.length > 0 && (
                  <div className="text-sm text-red-600">
                    <div className="font-medium">Erreurs:</div>
                    {syncResult.errors.map((error: string, index: number) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
            
            <div className="mt-6 flex justify-end space-x-3">
              {!isSyncing && (
                <>
                  <button
                    onClick={() => setShowSyncModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Fermer
                  </button>
                  {syncResult?.success && (
                    <button
                      onClick={() => setShowSyncModal(false)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      OK
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Créer un utilisateur</h2>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="utilisateur@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Key className="inline h-4 w-4 mr-1" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="visitor">Visiteur</option>
                  <option value="user">Utilisateur</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+261 34 12 345 67"
                />
              </div>
            </div>

            {/* Résultat de la création */}
            {createUserResult && (
              <div className={`mt-4 p-3 rounded-lg ${createUserResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <div className="flex items-center space-x-2">
                  {createUserResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm">{createUserResult.message}</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateUser}
                disabled={createUserLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUserLoading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
