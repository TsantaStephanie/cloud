// Import des services Firebase
import { 
  syncFirebaseToPostgres, 
  getFirebaseSyncStats, 
  testFirebaseConnection, 
  forceSyncFirebaseToPostgres,
  type FirebaseSyncResult, 
  type FirebaseSyncStats 
} from './firebase-sync';

// Types pour la compatibilité avec l'interface Admin
export type SyncResult = FirebaseSyncResult;
export type SyncStats = FirebaseSyncStats;

// Export des fonctions Firebase avec les noms attendus par l'interface
export const syncVisitorReports = syncFirebaseToPostgres;
export const getSyncStats = getFirebaseSyncStats;
export const testBackendConnection = testFirebaseConnection;
export const forceSyncVisitorReports = forceSyncFirebaseToPostgres;
