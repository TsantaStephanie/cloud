import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  syncFirebaseToPostgres, 
  getFirebaseSyncStats, 
  testFirebaseConnection,
  forceSyncFirebaseToPostgres,
  type FirebaseSyncResult, 
  type FirebaseSyncStats 
} from '../lib/firebase-sync';
import { getAllReports, type Report } from '../lib/reports';

const Admin: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<FirebaseSyncResult | null>(null);
  const [syncStats, setSyncStats] = useState<FirebaseSyncStats | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

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
    </div>
  );
};

export default Admin;
