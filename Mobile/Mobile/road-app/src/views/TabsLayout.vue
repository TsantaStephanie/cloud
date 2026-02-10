<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="map" href="/tabs/map">
          <ion-icon :icon="mapOutline" />
          <ion-label>Carte</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="report" href="/tabs/report" v-if="authStore.isAuthenticated">
          <ion-icon :icon="addCircleOutline" />
          <ion-label>Signaler</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="reports" href="/tabs/reports">
          <ion-icon :icon="listOutline" />
          <ion-label>Signalements</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="historique" href="/tabs/historique" v-if="authStore.isAuthenticated">
          <ion-icon :icon="timeOutline" />
          <ion-label>Historique</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="personOutline" />
          <ion-label>Profil</ion-label>
        </ion-tab-button>

        <!-- Tab Admin (seulement pour les admins) -->
        <ion-tab-button 
          v-if="authStore.userRole === 'admin'" 
          tab="admin" 
          href="/admin"
        >
          <ion-icon :icon="settingsOutline" />
          <ion-label>Admin</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from '@ionic/vue';
import { mapOutline, addCircleOutline, listOutline, personOutline, timeOutline, settingsOutline } from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.custom-tab-bar {
  box-shadow: 0 -2px 12px rgba(0, 48, 73, 0.08);
}

ion-tab-button {
  transition: all 0.3s ease;
}

ion-tab-button.tab-selected {
  animation: pulse 0.3s ease;
}
</style>