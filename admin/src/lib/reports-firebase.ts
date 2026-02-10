// Script pour récupérer les données Firebase et les synchroniser avec PostgreSQL
import { 
  getAllFirebaseReports,
  getFirebaseReportsByUserId,
  getFirebaseReportsStatistics,
  createFirebaseReport,
  updateFirebaseReport,
  type FirebaseReport,
  type CreateFirebaseReportData
} from './firebase-reports';
import { 
  syncFirebaseToPostgres,
  getFirebaseSyncStats,
  testFirebaseConnection,
  type FirebaseSyncResult,
  type FirebaseSyncStats
} from './firebase-sync';

// Classe principale pour gérer les rapports Firebase
export class FirebaseReportsManager {
  private isConnected: boolean = false;

  constructor() {
    this.initializeConnection();
  }

  // Initialiser la connexion Firebase
  private async initializeConnection(): Promise<void> {
    try {
      this.isConnected = await testFirebaseConnection();
      console.log(this.isConnected ? '✅ Firebase connecté' : '❌ Firebase non connecté');
    } catch (error) {
      console.error('❌ Erreur de connexion Firebase:', error);
      this.isConnected = false;
    }
  }

  // Vérifier si Firebase est connecté
  isFirebaseConnected(): boolean {
    return this.isConnected;
  }

  // Récupérer tous les rapports Firebase
  async getAllReports(): Promise<FirebaseReport[]> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await getAllFirebaseReports();
  }

  // Récupérer les rapports d'un utilisateur
  async getUserReports(userId: string): Promise<FirebaseReport[]> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await getFirebaseReportsByUserId(userId);
  }

  // Créer un nouveau rapport
  async createReport(reportData: CreateFirebaseReportData): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await createFirebaseReport(reportData);
  }

  // Mettre à jour un rapport
  async updateReport(reportId: string, updates: Partial<FirebaseReport>): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    await updateFirebaseReport(reportId, updates);
  }

  // Obtenir les statistiques
  async getStatistics(): Promise<ReturnType<typeof getFirebaseReportsStatistics>> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await getFirebaseReportsStatistics();
  }

  // Synchroniser avec PostgreSQL
  async syncToPostgres(): Promise<FirebaseSyncResult> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await syncFirebaseToPostgres();
  }

  // Obtenir les statistiques de synchronisation
  async getSyncStats(): Promise<FirebaseSyncStats> {
    if (!this.isConnected) {
      throw new Error('Firebase n\'est pas connecté');
    }
    return await getFirebaseSyncStats();
  }

  // Filtrer les rapports par statut
  async getReportsByStatus(status: FirebaseReport['statut']): Promise<FirebaseReport[]> {
    const allReports = await this.getAllReports();
    return allReports.filter(report => report.statut === status);
  }

  // Filtrer les rapports par gravité
  async getReportsBySeverity(severity: FirebaseReport['gravite']): Promise<FirebaseReport[]> {
    const allReports = await this.getAllReports();
    return allReports.filter(report => report.gravite === severity);
  }

  // Obtenir les rapports récents (dernières 24h)
  async getRecentReports(hours: number = 24): Promise<FirebaseReport[]> {
    const allReports = await this.getAllReports();
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return allReports.filter(report => {
      const reportDate = new Date(report.dateCreation.toDate());
      return reportDate > cutoffTime;
    });
  }

  // Exporter les données pour analyse
  async exportData(): Promise<{
    reports: FirebaseReport[];
    statistics: Awaited<ReturnType<typeof getFirebaseReportsStatistics>>;
    syncStats: FirebaseSyncStats;
    exportDate: string;
  }> {
    const [reports, statistics, syncStats] = await Promise.all([
      this.getAllReports(),
      this.getStatistics(),
      this.getSyncStats()
    ]);

    return {
      reports,
      statistics,
      syncStats,
      exportDate: new Date().toISOString()
    };
  }
}

// Instance singleton du gestionnaire
export const firebaseReportsManager = new FirebaseReportsManager();

// Fonctions utilitaires pour les scripts
export const firebaseScripts = {
  // Script de synchronisation complète
  async runFullSync(): Promise<void> {
    console.log('🚀 Démarrage de la synchronisation complète...');
    
    try {
      const result = await firebaseReportsManager.syncToPostgres();
      
      if (result.success) {
        console.log('✅ Synchronisation réussie:', result.message);
        console.log(`📊 Importés: ${result.imported}, Mis à jour: ${result.updated}`);
      } else {
        console.error('❌ Synchronisation échouée:', result.message);
        if (result.errors.length > 0) {
          console.error('Erreurs:', result.errors);
        }
      }
    } catch (error) {
      console.error('❌ Erreur critique lors de la synchronisation:', error);
    }
  },

  // Script de rapport d'état
  async generateStatusReport(): Promise<void> {
    console.log('📋 Génération du rapport d\'état...');
    
    try {
      const [statistics, syncStats] = await Promise.all([
        firebaseReportsManager.getStatistics(),
        firebaseReportsManager.getSyncStats()
      ]);

      console.log('\n📊 Statistiques Firebase:');
      console.log(`Total rapports: ${statistics.total}`);
      console.log('Par statut:', statistics.byStatus);
      console.log('Par gravité:', statistics.bySeverity);

      console.log('\n🔄 Statistiques de synchronisation:');
      console.log(`Total routes: ${syncStats.totalRoutes}`);
      console.log(`Total utilisateurs: ${syncStats.totalUsers}`);
      console.log(`Dernière sync: ${syncStats.lastSyncDate || 'Jamais'}`);
      console.log(`En attente: ${syncStats.pendingSync}`);

    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error);
    }
  },

  // Script de test de connexion
  async testConnection(): Promise<void> {
    console.log('🔍 Test de connexion Firebase...');
    
    const isConnected = firebaseReportsManager.isFirebaseConnected();
    console.log(isConnected ? '✅ Firebase connecté' : '❌ Firebase non connecté');
    
    if (isConnected) {
      try {
        const reports = await firebaseReportsManager.getAllReports();
        console.log(`📊 ${reports.length} rapports trouvés dans Firebase`);
      } catch (error) {
        console.error('❌ Erreur lors de la lecture des données:', error);
      }
    }
  }
};

// Export par défaut
export default firebaseReportsManager;
