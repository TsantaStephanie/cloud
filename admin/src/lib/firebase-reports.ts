import { 
  collections, 
  Utilisateur, 
  RouteEndommagee, 
  timestampToDate 
} from './firebase';
import { 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Types pour les rapports Firebase
export interface FirebaseReport {
  id: string;
  utilisateur_id?: string;
  latitude: number;
  longitude: number;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description?: string;
  statut: 'nouveau' | 'verifie' | 'en_cours' | 'termine';
  longueurKm?: number;  // Corrigé pour correspondre à Firestore
  surfaceM2?: number;   // Corrigé pour correspondre à Firestore
  budget?: number;
  entreprise?: string;
  dateCreation: any;    // Corrigé pour correspondre à Firestore
  dateMiseAJour: any;   // Corrigé pour correspondre à Firestore
}

export interface CreateFirebaseReportData {
  utilisateur_id?: string;
  latitude: number;
  longitude: number;
  gravite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description?: string;
  longueurKm?: number;  // Corrigé pour correspondre à Firestore
  surfaceM2?: number;   // Corrigé pour correspondre à Firestore
  budget?: number;
  entreprise?: string;
}

export interface UpdateFirebaseReportData {
  gravite?: 'faible' | 'moyenne' | 'elevee' | 'critique';
  description?: string;
  statut?: 'nouveau' | 'verifie' | 'en_cours' | 'termine';
  longueurKm?: number;  // Corrigé pour correspondre à Firestore
  surfaceM2?: number;   // Corrigé pour correspondre à Firestore
  budget?: number;
  entreprise?: string;
}

// Récupérer tous les rapports depuis Firebase
export async function getAllFirebaseReports(): Promise<FirebaseReport[]> {
  try {
    const q = query(
      collections.routes_endommagees, 
      orderBy('dateCreation', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    console.log('📊 Documents Firebase récupérés:', querySnapshot.docs.length);
    
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseReport[];
    
    console.log('✅ Données Firebase chargées:', reports.length, 'rapports');
    return reports;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rapports Firebase:', error);
    throw new Error('Impossible de récupérer les rapports depuis Firebase');
  }
}

// Récupérer les rapports d'un utilisateur spécifique
export async function getFirebaseReportsByUserId(userId: string): Promise<FirebaseReport[]> {
  try {
    const q = query(
      collections.routes_endommagees,
      where('utilisateur_id', '==', userId),
      orderBy('date_creation', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseReport[];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rapports utilisateur:', error);
    throw new Error('Impossible de récupérer les rapports utilisateur depuis Firebase');
  }
}

// Créer un nouveau rapport dans Firebase
export async function createFirebaseReport(reportData: CreateFirebaseReportData): Promise<string> {
  try {
    console.log('🏪 Création rapport Firebase avec:', reportData);
    
    const newReport = {
      ...reportData,
      statut: 'nouveau',
      date_creation: serverTimestamp(),
      date_mise_a_jour: serverTimestamp()
    };
    
    const docRef = await addDoc(collections.routes_endommagees, newReport);
    console.log('✅ Rapport Firebase créé avec ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur lors de la création du rapport Firebase:', error);
    throw new Error('Impossible de créer le rapport dans Firebase');
  }
}

// Mettre à jour un rapport dans Firebase
export async function updateFirebaseReport(
  reportId: string, 
  updates: UpdateFirebaseReportData
): Promise<void> {
  try {
    const reportRef = doc(db, 'routes_endommagees', reportId);
    
    await updateDoc(reportRef, {
      ...updates,
      date_mise_a_jour: serverTimestamp()
    });
    
    console.log('✅ Rapport Firebase mis à jour:', reportId);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du rapport Firebase:', error);
    throw new Error('Impossible de mettre à jour le rapport dans Firebase');
  }
}

// Mettre à jour le statut d'un rapport
export async function updateFirebaseReportStatus(
  reportId: string, 
  newStatus: 'nouveau' | 'verifie' | 'en_cours' | 'termine'
): Promise<void> {
  return updateFirebaseReport(reportId, { statut: newStatus });
}

// Récupérer les rapports par statut
export async function getFirebaseReportsByStatus(
  status: 'nouveau' | 'verifie' | 'en_cours' | 'termine'
): Promise<FirebaseReport[]> {
  try {
    const q = query(
      collections.routes_endommagees,
      where('statut', '==', status),
      orderBy('date_creation', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseReport[];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rapports par statut:', error);
    throw new Error('Impossible de récupérer les rapports par statut depuis Firebase');
  }
}

// Récupérer les rapports par gravité
export async function getFirebaseReportsBySeverity(
  severity: 'faible' | 'moyenne' | 'elevee' | 'critique'
): Promise<FirebaseReport[]> {
  try {
    const q = query(
      collections.routes_endommagees,
      where('gravite', '==', severity),
      orderBy('date_creation', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseReport[];
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rapports par gravité:', error);
    throw new Error('Impossible de récupérer les rapports par gravité depuis Firebase');
  }
}

// Obtenir des statistiques sur les rapports Firebase
export async function getFirebaseReportsStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
}> {
  try {
    const allReports = await getAllFirebaseReports();
    
    const stats = {
      total: allReports.length,
      byStatus: {
        nouveau: 0,
        verifie: 0,
        en_cours: 0,
        termine: 0
      },
      bySeverity: {
        faible: 0,
        moyenne: 0,
        elevee: 0,
        critique: 0
      }
    };
    
    allReports.forEach(report => {
      // Compter par statut
      if (report.statut && stats.byStatus[report.statut] !== undefined) {
        stats.byStatus[report.statut]++;
      }
      
      // Compter par gravité
      if (report.gravite && stats.bySeverity[report.gravite] !== undefined) {
        stats.bySeverity[report.gravite]++;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques Firebase:', error);
    throw new Error('Impossible de calculer les statistiques des rapports Firebase');
  }
}

// Fonctions utilitaires pour la synchronisation
export const firebaseReportsUtils = {
  // Convertir un rapport Firebase vers le format PostgreSQL
  toPostgresFormat: (firebaseReport: FirebaseReport) => {
    const status = firebaseReport.statut === 'nouveau' ? 'reported' as const : 
                  firebaseReport.statut === 'verifie' ? 'in_progress' as const :
                  firebaseReport.statut === 'en_cours' ? 'in_progress' as const : 'completed' as const;
    
    const priority = firebaseReport.gravite === 'critique' ? 'urgent' as const :
                    firebaseReport.gravite === 'elevee' ? 'high' as const :
                    firebaseReport.gravite === 'moyenne' ? 'medium' as const : 'low' as const;

    return {
      title: `Route endommagée - ${firebaseReport.gravite}`,
      description: firebaseReport.description || `Route de ${firebaseReport.longueurKm || 0}km endommagée`,
      status,
      priority,
      latitude: firebaseReport.latitude,
      longitude: firebaseReport.longitude,
      location_name: `Position: ${firebaseReport.latitude}, ${firebaseReport.longitude}`
    };
  },
  
  // Vérifier si un rapport est récent (pour la synchronisation)
  isRecent: (firebaseReport: FirebaseReport, hours: number = 24) => {
    const reportDate = timestampToDate(firebaseReport.dateCreation);
    const now = new Date();
    const diffInHours = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= hours;
  },
  
  // Filtrer les rapports à synchroniser
  getReportsToSync: async (lastSyncDate?: string) => {
    const allReports = await getAllFirebaseReports();
    
    if (!lastSyncDate) {
      return allReports; // Première synchronisation
    }
    
    const syncDateTime = new Date(lastSyncDate);
    return allReports.filter(report => {
      const reportDate = timestampToDate(report.dateCreation);
      return reportDate > syncDateTime;
    });
  }
};

export default {
  getAllFirebaseReports,
  getFirebaseReportsByUserId,
  createFirebaseReport,
  updateFirebaseReport,
  updateFirebaseReportStatus,
  getFirebaseReportsByStatus,
  getFirebaseReportsBySeverity,
  getFirebaseReportsStatistics,
  firebaseReportsUtils
};
