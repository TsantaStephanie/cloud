import { 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { collections, timestampToDate } from './firebase';
import { getAllReports, createReport, updateReport, type Report } from './reports';
import { 
  getAllFirebaseReports, 
  type FirebaseReport,
  firebaseReportsUtils 
} from './firebase-reports';
import type { ReportStatus, ReportPriority } from '../types/database';

// Interfaces pour les données Firebase
export interface FirebaseUtilisateur {
  id?: string;
  email: string;
  mot_de_passe_hash: string;
  role: 'admin' | 'utilisateur';
  date_creation: any;
}

export interface FirebaseRoute extends FirebaseReport {}

export interface FirebaseSyncResult {
  success: boolean;
  message: string;
  imported: number;
  updated: number;
  errors: string[];
}

export interface FirebaseSyncStats {
  totalUsers: number;
  totalRoutes: number;
  lastSyncDate: string | null;
  pendingSync: number;
}

// Conversion des données Firebase vers le format admin PostgreSQL
function convertFirebaseToAdmin(firebaseRoute: FirebaseRoute): Omit<Report, 'id' | 'created_at' | 'updated_at'> {
  // Mapping de la gravité vers la priorité
  const priorityMap: Record<string, ReportPriority> = {
    'critique': 'urgent',
    'elevee': 'high',
    'moyenne': 'medium',
    'faible': 'low'
  };

  // Mapping du statut
  const statusMap: Record<string, ReportStatus> = {
    'nouveau': 'reported',
    'verifie': 'in_progress',
    'en_cours': 'in_progress',
    'termine': 'completed'
  };

  return {
    title: `Route endommagée - ${firebaseRoute.gravite}`,
    description: firebaseRoute.description || `Route de ${firebaseRoute.longueurKm || 0}km endommagée`,
    status: statusMap[firebaseRoute.statut] || 'reported',
    priority: priorityMap[firebaseRoute.gravite] || 'medium',
    latitude: firebaseRoute.latitude,
    longitude: firebaseRoute.longitude,
    location_name: `Position: ${firebaseRoute.latitude}, ${firebaseRoute.longitude}`
  };
}

// Récupérer tous les utilisateurs depuis Firebase
export async function fetchFirebaseUsers(): Promise<FirebaseUtilisateur[]> {
  try {
    const querySnapshot = await getDocs(collections.utilisateurs);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseUtilisateur[];
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs Firebase:', error);
    throw new Error('Impossible de récupérer les utilisateurs depuis Firebase');
  }
}

// Récupérer toutes les routes endommagées depuis Firebase
export async function fetchFirebaseRoutes(): Promise<FirebaseRoute[]> {
  try {
    return await getAllFirebaseReports();
  } catch (error) {
    console.error('Erreur lors de la récupération des routes Firebase:', error);
    throw new Error('Impossible de récupérer les routes depuis Firebase');
  }
}

// Vérifier si une route existe déjà dans PostgreSQL (basé sur la localisation et la date)
async function findExistingReport(firebaseRoute: FirebaseRoute): Promise<Report | null> {
  const allReports = await getAllReports();
  
  // Recherche par localisation approximative et date de création
  const existing = allReports.find(report => {
    const locationMatch = 
      Math.abs(report.latitude - firebaseRoute.latitude) < 0.0001 &&
      Math.abs(report.longitude - firebaseRoute.longitude) < 0.0001;
    
    const dateMatch = 
      new Date(report.created_at).toISOString().split('T')[0] === 
      timestampToDate(firebaseRoute.dateCreation).toISOString().split('T')[0];
    
    return locationMatch && dateMatch;
  });
  
  return existing || null;
}

// Synchroniser les utilisateurs depuis Firebase vers PostgreSQL
export async function syncFirebaseUsers(): Promise<{ imported: number; errors: string[] }> {
  const result = { imported: 0, errors: [] as string[] };
  
  try {
    const firebaseUsers = await fetchFirebaseUsers();
    
    for (const user of firebaseUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà dans PostgreSQL
        // Note: Vous devrez implémenter cette fonction dans votre service users
        // Pour l'instant, nous allons simplement compter
        result.imported++;
      } catch (error) {
        result.errors.push(`Erreur utilisateur ${user.id}: ${error}`);
      }
    }
  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`);
  }
  
  return result;
}

// Synchroniser les routes depuis Firebase vers PostgreSQL
export async function syncFirebaseRoutes(): Promise<{ imported: number; updated: number; errors: string[] }> {
  const result = { imported: 0, updated: 0, errors: [] as string[] };
  
  try {
    const firebaseRoutes = await fetchFirebaseRoutes();
    
    for (const firebaseRoute of firebaseRoutes) {
      try {
        const existingReport = await findExistingReport(firebaseRoute);
        const adminData = firebaseReportsUtils.toPostgresFormat(firebaseRoute);

        if (existingReport) {
          // Mettre à jour le rapport existant
          await updateReport(existingReport.id, adminData);
          result.updated++;
          console.log(`Route mise à jour: ${existingReport.id}`);
        } else {
          // Créer un nouveau rapport
          await createReport(adminData);
          result.imported++;
          console.log(`Nouvelle route importée: ${firebaseRoute.id}`);
        }
      } catch (error) {
        const errorMsg = `Erreur lors du traitement de la route ${firebaseRoute.id}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`);
  }
  
  return result;
}

// Synchronisation complète Firebase vers PostgreSQL
export async function syncFirebaseToPostgres(): Promise<FirebaseSyncResult> {
  const result: FirebaseSyncResult = {
    success: true,
    message: '',
    imported: 0,
    updated: 0,
    errors: []
  };

  try {
    console.log('Début de la synchronisation Firebase vers PostgreSQL...');
    
    // Synchroniser les utilisateurs
    const userResult = await syncFirebaseUsers();
    result.imported += userResult.imported;
    result.errors.push(...userResult.errors);
    
    // Synchroniser les routes
    const routeResult = await syncFirebaseRoutes();
    result.imported += routeResult.imported;
    result.updated += routeResult.updated;
    result.errors.push(...routeResult.errors);

    // Sauvegarder la date de synchronisation
    await saveLastSyncDate();

    result.message = `Synchronisation terminée: ${result.imported} importés, ${result.updated} mis à jour`;
    
    if (result.errors.length > 0) {
      result.message += `, ${result.errors.length} erreurs`;
      result.success = false;
    }

  } catch (error) {
    result.success = false;
    result.message = `Erreur de synchronisation: ${error}`;
    result.errors.push(`Erreur générale: ${error}`);
  }

  return result;
}

// Obtenir les statistiques de synchronisation Firebase
export async function getFirebaseSyncStats(): Promise<FirebaseSyncStats> {
  try {
    const [users, routes] = await Promise.all([
      fetchFirebaseUsers(),
      fetchFirebaseRoutes()
    ]);
    
    const lastSyncDate = await getLastSyncDate();
    
    // Compter les routes créées depuis la dernière synchronisation
    const pendingSync = lastSyncDate 
      ? routes.filter(route => 
          timestampToDate(route.dateCreation) > new Date(lastSyncDate)
        ).length
      : routes.length;

    return {
      totalUsers: users.length,
      totalRoutes: routes.length,
      lastSyncDate,
      pendingSync
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques Firebase:', error);
    return {
      totalUsers: 0,
      totalRoutes: 0,
      lastSyncDate: null,
      pendingSync: 0
    };
  }
}

// Tester la connexion Firebase
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Essayer de récupérer un document pour tester la connexion
    const querySnapshot = await getDocs(query(collections.utilisateurs, limit(1)));
    return true; // Si nous arrivons ici, la connexion fonctionne
  } catch (error) {
    console.error('Test de connexion Firebase échoué:', error);
    return false;
  }
}

// Sauvegarder la date de dernière synchronisation
async function saveLastSyncDate(): Promise<void> {
  try {
    const syncDate = new Date().toISOString();
    localStorage.setItem('firebase_last_sync_date', syncDate);
    console.log('Date de synchronisation Firebase sauvegardée:', syncDate);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la date de synchronisation:', error);
  }
}

// Récupérer la date de dernière synchronisation
async function getLastSyncDate(): Promise<string | null> {
  try {
    return localStorage.getItem('firebase_last_sync_date');
  } catch (error) {
    console.error('Erreur lors de la récupération de la date de synchronisation:', error);
    return null;
  }
}

// Forcer une synchronisation complète
export async function forceSyncFirebaseToPostgres(): Promise<FirebaseSyncResult> {
  // Effacer la date de dernière synchronisation
  localStorage.removeItem('firebase_last_sync_date');
  
  // Lancer une synchronisation normale
  return await syncFirebaseToPostgres();
}
