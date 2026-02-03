// migrate-to-firebase.js
// Script pour migrer les données PostgreSQL vers Firebase Firestore

const admin = require('firebase-admin');

// Initialisez Firebase Admin avec configuration directe
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "cloud-project-389d0",
    clientEmail: "firebase-adminsdk-fbsvc@cloud-project-389d0.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0vDqzYuX/x9qm\nfZ22D/xArTBAm7eKPBjOXngD+1B+iBm4s3WQDq43a2s7ypKobGBon2SKvdtRmWvV\nD0IMAnMOfpKjzL3EDt/c/wQQ9nuVDxWvumPS3XN3xrLpLbZj5hRtBRZ0iEpymLxq\ne1zSbkWw4cARAoTE9e5VPf/UiCi1moT2I4hyRfsxi3O/TvkK/E2seVAR6/NFaHLu\n0kOLruBZOaP1+fSScaf54adiGlrhalBAwyR3zQ0o1yE7FAQyYRJHdoLqf0b5U6wj\nVIgr+jRanPLlHKCAUmSMTug3lEiAYqJvjPdzimUM77w6HtQky0zK4pZs6NVVgQ2R\nV/TQ/REJAgMBAAECggEAQfsTvQiGafYWs0BZsq0sTJpNatDOVSdycOiZDO8TKFZc\neYr+iMxrOq07FTVzjAwguCE0jdgY+LW3Ya1z0bmVMn3v39+viaNag64P2Hd7j2PV\n6XT023bgICKIj0sScm79Fv3MAFf/Qc3Tv1XxAZujUptfyHXwbY1Q6Iq9WmQo5H77\nLDEd6tIMb5WyOBRmKhdOkyGn34PQ7pg+2ZqPVi4fjTxIbwDRnW/3lEi927BXY2rL\nf6MqP87bilqGZGcZmJi3XHA0CVeI1ue24ms/uIEs6yUE3BjwOtqFFlpZgy6W4JKD\n/jZWMm0NPA2ZR5NrahKjtvFx1meVdO1Otc+f524ELwKBgQDXoUOFKi9wa1D9A8U6\nfkyyJeQlCJN4alJ/A/+bzCZVNSihavvI+3QvDRGPDRN+wLSfDIQJcmvxM0Ewb5Zm\nCzPgPNJk10rT9ALHwF0+ZTxjn7OAWMWaAhFWEwQm/+1D656F8jsbM3qq96ajDvfs\nqQIjdw8GSHq+xdPIYRKCk/1U/wKBgQDWkoevI249rMb8yHe1Ar5QD2OO3VRjRNSt\nw970lji4TR5JY560ZU9IkdFRk8YsRGGU0sjukvFmEzwACEQfOpwKlYe7IJxvJIhF\niOPowf9HLgLdbvRy/19M5fSQNMzAGaNpaJXQ9uM8LTDcCcxeBxDIinE3qqZyJZGS\nePfQ+XTx9wKBgDSbZnK1oQ9HT2H7KoIj0ChicC/M0NW+8tOEMTdcbjm5l2kSRc15\n85WLFa6V3Ry+fRKUph376XPWMmBTyRiqQQTDMf1iPSJK1ObQ+q6/WiVgEBYPEl6J\nhJtAVnIBXGyGro01VNBFFfdiJih//WKitR/b6zF4O2IRt6KadD6hRlwXAoGAX1Zl\n4SRt9AtTsrdjsNKSOsJLqwueVikcEkUISEaC1yi0v0j7GA43hvf7ODLfh4WukdCC\nJLa3eXIsY5tIoVOKR42e7D8WIq/puHOVSDMCON8xuK92/62F64X0/ynmm6gImmo0\nvs8jsfYmUm4sFs8u3tvcaC5znB4jKyCCg6CDHIsCgYEA1QbDFvhL4shvZQdj0Bul\n+ZGRcHun1fJ1UpfKhp9IGEvb97UsE98Tgmp3pdPpguPHU6NgHg+UjJiDZlwITNIU\nc6/RuVfKBP89AXR6C2izCynJeu4LPNy4bTLNBc8fyRMJQknX2z6tSzeqDxE4i9ex\ntcBSEz6FrRLp4XsU0Uy+rVg=\n-----END PRIVATE KEY-----\n"
  })
});

const db = admin.firestore();

// Données des utilisateurs (depuis table.sql et data.sql)1
const utilisateurs = [
  {
    email: 'user1@route.mg',
    role: 'utilisateur',
    mot_de_passe_note: 'User456'
  },
  {
    email: 'user2@route.mg',
    role: 'utilisateur',
    mot_de_passe_note: 'User123'
  }
];

// Données des routes endommagées (depuis data.sql)
const routesEndommagees = [
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.8792,
    longitude: 47.5079,
    gravite: 'critique',
    description: 'Grand nid-de-poule avenue Independence',
    statut: 'signale',
    longueur_km: 0.05
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.9136,
    longitude: 47.5361,
    gravite: 'elevee',
    description: 'Chaussee effondree Ambohijanahary',
    statut: 'verifie',
    longueur_km: 0.15
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.8667,
    longitude: 47.5167,
    gravite: 'moyenne',
    description: 'Route defoncee Analakely',
    statut: 'en_cours',
    longueur_km: 0.30
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.9036,
    longitude: 47.5272,
    gravite: 'faible',
    description: 'Petite fissure route Andrainarivo',
    statut: 'repare',
    longueur_km: 0.02
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8900,
    longitude: 47.5500,
    gravite: 'elevee',
    description: 'Inondation Andravoahangy',
    statut: 'signale',
    longueur_km: 0.80
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.9200,
    longitude: 47.5250,
    gravite: 'moyenne',
    description: 'Trottoir endommage Anosy',
    statut: 'verifie',
    longueur_km: 0.10
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8783,
    longitude: 47.5125,
    gravite: 'critique',
    description: 'Trou profond route Mahamasina',
    statut: 'en_cours',
    longueur_km: 0.08
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.8994,
    longitude: 47.5339,
    gravite: 'faible',
    description: 'Fissures legeres Isotry',
    statut: 'signale',
    longueur_km: 0.03
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.9108,
    longitude: 47.5192,
    gravite: 'elevee',
    description: 'Chaussee cassee Antanimena',
    statut: 'repare',
    longueur_km: 0.25
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8878,
    longitude: 47.5411,
    gravite: 'moyenne',
    description: 'Route bosselee Ampasanimalo',
    statut: 'signale',
    longueur_km: 0.12
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.8961,
    longitude: 47.5283,
    gravite: 'critique',
    description: 'Eboulement route Ambohimanarina',
    statut: 'verifie',
    longueur_km: 0.40
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8744,
    longitude: 47.5056,
    gravite: 'elevee',
    description: 'Pont fissure Ankadimbahoaka',
    statut: 'en_cours',
    longueur_km: 0.20
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8850,
    longitude: 47.5178,
    gravite: 'moyenne',
    description: 'Deformation chaussee Tsaralalana',
    statut: 'repare',
    longueur_km: 0.18
  },
  {
    utilisateur_email: 'user1@route.mg',
    latitude: -18.9083,
    longitude: 47.5111,
    gravite: 'faible',
    description: 'Nid-de-poule mineur Faravohitra',
    statut: 'signale',
    longueur_km: 0.04
  },
  {
    utilisateur_email: 'user2@route.mg',
    latitude: -18.8933,
    longitude: 47.5233,
    gravite: 'elevee',
    description: 'Inondation Antaninarenina',
    statut: 'verifie',
    longueur_km: 0.60
  }
];

async function migrateData() {
  console.log('🚀 Début de la migration des données...\n');

  // Étape 1: Créer les utilisateurs dans Firestore
  // Note: Les comptes Authentication doivent être créés manuellement via Firebase Console
  console.log('📝 Étape 1: Migration des utilisateurs...');

  const userMap = {}; // Pour mapper les emails aux UIDs

  for (const user of utilisateurs) {
    try {
      // Recherche si l'utilisateur existe déjà dans Authentication
      let authUser;
      try {
        authUser = await admin.auth().getUserByEmail(user.email);
        userMap[user.email] = authUser.uid;
        console.log(`✅ Utilisateur trouvé: ${user.email} (UID: ${authUser.uid})`);
      } catch (error) {
        console.log(`⚠️  Utilisateur ${user.email} n'existe pas dans Authentication`);
        console.log(`   Veuillez le créer manuellement dans Firebase Console`);
        continue;
      }

      // Créer/Mettre à jour le document utilisateur dans Firestore
      await db.collection('utilisateurs').doc(authUser.uid).set({
        email: user.email,
        role: user.role,
        date_creation: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ Document Firestore créé pour: ${user.email}`);
    } catch (error) {
      console.error(`❌ Erreur pour ${user.email}:`, error.message);
    }
  }

  console.log('\n📝 Étape 2: Migration des signalements de routes...');

  // Étape 2: Créer les signalements
  let successCount = 0;
  let errorCount = 0;

  for (const route of routesEndommagees) {
    try {
      const reportData = {
        latitude: route.latitude,
        longitude: route.longitude,
        gravite: route.gravite,
        description: route.description,
        statut: route.statut,
        longueur_km: route.longueur_km,
        date_creation: admin.firestore.FieldValue.serverTimestamp(),
        date_mise_a_jour: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('routes_endommagees').add(reportData);
      successCount++;
      console.log(`✅ Signalement créé: ${route.description}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Erreur pour ${route.description}:`, error.message);
    }
  }

  console.log('\n📊 Résumé de la migration:');
  console.log(`   ✅ Signalements créés avec succès: ${successCount}`);
  console.log(`   ❌ Erreurs: ${errorCount}`);
  console.log('\n✨ Migration terminée!');
  console.log('\n⚠️  N\'oubliez pas de:');
  console.log('   1. Créer les comptes Authentication manuellement dans Firebase Console');
  console.log('   2. Vérifier les règles de sécurité Firestore');
  console.log('   3. Tester l\'application avec les données migrées');
}

// Exécuter la migration
migrateData()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

// ============================================
// INSTRUCTIONS D'UTILISATION:
// ============================================
//
// 1. Installez Firebase Admin SDK:
//    npm install firebase-admin
//
// 2. Téléchargez votre clé de compte de service:
//    - Allez dans Firebase Console
//    - Paramètres du projet → Comptes de service
//    - Générez une nouvelle clé privée
//    - Renommez-la en "serviceAccountKey.json"
//    - Placez-la dans le même dossier que ce script
//
// 3. Créez les comptes utilisateurs dans Firebase Authentication:
//    - admin@route.mg (mot de passe: admin)
//    - user1@route.mg (mot de passe: user1)
//    - user2@route.mg (mot de passe: user2)
//
// 4. Exécutez le script:
//    node migrate-to-firebase.js
//
// 5. Vérifiez dans Firebase Console que les données sont importées
//
// ============================================