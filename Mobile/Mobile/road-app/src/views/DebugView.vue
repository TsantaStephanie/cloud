<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Debug Firebase</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="debug-container">
        <h2>🔍 Diagnostic Firebase</h2>
        
        <!-- Test de connexion -->
        <div class="test-section">
          <h3>1. Connexion Firebase</h3>
          <div class="test-result" :class="{ success: firebaseConnected, error: !firebaseConnected }">
            {{ firebaseConnected ? '✅ Connecté' : '❌ Non connecté' }}
          </div>
        </div>

        <!-- Test de collection -->
        <div class="test-section">
          <h3>2. Collection routesEndommagees</h3>
          <ion-button @click="testCollection" :disabled="testing">
            {{ testing ? 'Test en cours...' : 'Tester la collection' }}
          </ion-button>
          <div class="test-result" v-if="collectionResult">
            <pre>{{ JSON.stringify(collectionResult, null, 2) }}</pre>
          </div>
        </div>

        <!-- Test de création -->
        <div class="test-section">
          <h3>3. Création de test</h3>
          <ion-button @click="createTestReport" :disabled="creating">
            {{ creating ? 'Création en cours...' : 'Créer un signalement test' }}
          </ion-button>
          <div class="test-result" v-if="createResult">
            <pre>{{ JSON.stringify(createResult, null, 2) }}</pre>
          </div>
        </div>

        <!-- Affichage des données actuelles -->
        <div class="test-section">
          <h3>4. Données actuelles ({{ reports.length }} signalements)</h3>
          <div v-if="reports.length > 0">
            <div v-for="report in reports.slice(0, 3)" :key="report.id" class="report-item">
              <strong>{{ report.id }}</strong> - {{ report.description }} ({{ report.gravite }})
            </div>
          </div>
          <div v-else class="no-data">
            <p>❌ Aucun signalement trouvé</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <ion-button @click="refreshData" fill="outline">
            <ion-icon :icon="refreshOutline" slot="start" />
            Rafraîchir
          </ion-button>
          <ion-button @click="goToMap" fill="outline">
            <ion-icon :icon="mapOutline" slot="start" />
            Aller à la carte
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { refreshOutline, mapOutline } from 'ionicons/icons';
import { db } from '@/firebase/config';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { useReportsStore } from '@/stores/reports';

const router = useRouter();
const reportsStore = useReportsStore();

const testing = ref(false);
const creating = ref(false);
const firebaseConnected = ref(false);
const collectionResult = ref(null);
const createResult = ref(null);

const reports = computed(() => reportsStore.reports);

const testCollection = async () => {
  testing.value = true;
  collectionResult.value = null;
  
  try {
    console.log('🔍 Test de la collection routesEndommagees...');
    
    const q = query(collection(db, 'routesEndommagees'));
    const snapshot = await getDocs(q);
    
    collectionResult.value = {
      success: true,
      count: snapshot.docs.length,
      message: `✅ Collection accessible avec ${snapshot.docs.length} documents`,
      data: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).slice(0, 3) // Limiter à 3 pour l'affichage
    };
    
    firebaseConnected.value = true;
    console.log('✅ Test réussi:', collectionResult.value);
    
  } catch (error) {
    collectionResult.value = {
      success: false,
      error: error.message,
      message: `❌ Erreur: ${error.message}`
    };
    
    firebaseConnected.value = false;
    console.error('❌ Test échoué:', error);
  } finally {
    testing.value = false;
  }
};

const createTestReport = async () => {
  creating.value = true;
  createResult.value = null;
  
  try {
    console.log('🧪 Création d\'un signalement test...');
    
    const testReport = {
      utilisateurId: 'debug-user',
      latitude: -18.8792,
      longitude: 47.5079,
      gravite: 'moyenne',
      description: 'Signalement de test depuis DebugView',
      statut: 'nouveau',
      longueurKm: 0.1,
      dateCreation: serverTimestamp(),
      dateMiseAJour: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'routesEndommagees'), testReport);
    
    createResult.value = {
      success: true,
      id: docRef.id,
      message: `✅ Signalement test créé avec ID: ${docRef.id}`
    };
    
    console.log('✅ Création réussie:', createResult.value);
    
    // Rafraîchir les données
    await reportsStore.fetchReports();
    
  } catch (error) {
    createResult.value = {
      success: false,
      error: error.message,
      message: `❌ Erreur de création: ${error.message}`
    };
    
    console.error('❌ Création échouée:', error);
  } finally {
    creating.value = false;
  }
};

const refreshData = async () => {
  await reportsStore.fetchReports();
};

const goToMap = () => {
  router.push('/tabs/map');
};

onMounted(async () => {
  // Test automatique de la connexion
  await testCollection();
});
</script>

<style scoped>
.debug-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  color: var(--ion-color-primary);
  margin-bottom: 24px;
  text-align: center;
}

.test-section {
  background: var(--ion-color-light);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.test-section h3 {
  margin: 0 0 12px 0;
  color: var(--ion-color-dark);
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 12px;
}

.test-result.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #065f46;
}

.test-result.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #991b1b;
}

.report-item {
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.report-item:last-child {
  border-bottom: none;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: var(--ion-color-medium);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
