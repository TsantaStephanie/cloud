const { utilisateurService, routeService, signalementService } = require('../src/lib/services');

async function migrateData() {
  console.log('Début de la migration...');
  
  try {
    // 1. Migration des utilisateurs
    console.log('Migration des utilisateurs...');
    // Remplacer par vos données PostgreSQL réelles
    const utilisateurs = [
      {
        email: 'admin@example.com',
        motDePasseHash: 'hashed_password_here',
        role: 'admin'
      }
    ];
    
    for (const utilisateur of utilisateurs) {
      await utilisateurService.create(utilisateur);
    }
    
    // 2. Migration des routes endommagées
    console.log('Migration des routes endommagées...');
    const routes = [
      {
        utilisateurId: null,
        latitude: 48.8566,
        longitude: 2.3522,
        gravite: 'moyenne',
        description: 'Route endommagée',
        statut: 'signale',
        longueurKm: 0.5
      }
    ];
    
    for (const route of routes) {
      await routeService.create(route);
    }
    
    // 3. Migration des signalements hors ligne
    console.log('Migration des signalements hors ligne...');
    const signalements = [
      {
        idAppareil: 'device_123',
        donneesSignalement: { latitude: 48.8566, longitude: 2.3522 }
      }
    ];
    
    for (const signalement of signalements) {
      await signalementService.create(signalement);
    }
    
    console.log('Migration terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
}

// Uncomment pour exécuter
// migrateData();
