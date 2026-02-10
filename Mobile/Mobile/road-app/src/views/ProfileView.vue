<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="profile-container">
        <!-- User Info Section -->
        <div class="profile-header" v-if="authStore.isAuthenticated">
          <div class="avatar">
            <ion-icon :icon="personCircleOutline" />
          </div>
          <h1 class="profile-name">{{ authStore.userData?.email || 'Utilisateur' }}</h1>
          <div class="role-badge" :class="`role-${authStore.userRole}`">
            <ion-icon :icon="getRoleIcon(authStore.userRole)" />
            <span>{{ getRoleLabel(authStore.userRole) }}</span>
          </div>
        </div>

        <!-- Guest Banner -->
        <div class="guest-banner" v-else>
          <div class="guest-icon">
            <ion-icon :icon="personOutline" />
          </div>
          <h2 class="guest-title">Mode Visiteur</h2>
          <p class="guest-text">Connectez-vous pour signaler des problèmes routiers</p>
          <ion-button expand="block" @click="goToLogin" class="login-button">
            Se connecter
          </ion-button>
        </div>

        <!-- Statistics (for authenticated users) -->
        <div class="stats-section" v-if="authStore.isAuthenticated">
          <h3 class="section-title">
            <ion-icon :icon="statsChartOutline" />
            Mes statistiques
          </h3>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">{{ reportsStore.myReports.length }}</div>
              <div class="stat-label">Signalements</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ getMyResolvedCount() }}</div>
              <div class="stat-label">Réparés</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">{{ getMyPendingCount() }}</div>
              <div class="stat-label">En attente</div>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="menu-section">
          <h3 class="section-title">
            <ion-icon :icon="settingsOutline" />
            Paramètres
          </h3>

          <div class="menu-list">
            <button class="menu-item" @click="showAbout">
              <div class="menu-item-left">
                <ion-icon :icon="informationCircleOutline" />
                <span>À propos</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" />
            </button>

            <button class="menu-item" @click="showHelp">
              <div class="menu-item-left">
                <ion-icon :icon="helpCircleOutline" />
                <span>Aide</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" />
            </button>

            <button class="menu-item" v-if="authStore.isAuthenticated" @click="handleLogout">
              <div class="menu-item-left">
                <ion-icon :icon="logOutOutline" class="logout-icon" />
                <span class="logout-text">Déconnexion</span>
              </div>
            </button>
          </div>
        </div>

        <!-- App Info -->
        <div class="app-info">
          <p class="app-name">Antananarivo Road Management</p>
          <p class="app-version">Version 1.0.0</p>
          <p class="app-copyright">© 2026 Tous droits réservés</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  alertController
} from '@ionic/vue';
import {
  personCircleOutline,
  personOutline,
  statsChartOutline,
  settingsOutline,
  informationCircleOutline,
  helpCircleOutline,
  logOutOutline,
  chevronForwardOutline,
  shieldCheckmarkOutline,
  personAddOutline,
  eyeOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';
import { useReportsStore } from '@/stores/reports';

const router = useRouter();
const authStore = useAuthStore();
const reportsStore = useReportsStore();

const getRoleIcon = (role) => {
  const icons = {
    admin: shieldCheckmarkOutline,
    utilisateur: personAddOutline,
    visiteur: eyeOutline
  };
  return icons[role] || personOutline;
};

const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrateur',
    utilisateur: 'Utilisateur',
    visiteur: 'Visiteur'
  };
  return labels[role] || 'Visiteur';
};

const getMyResolvedCount = () => {
  return reportsStore.myReports.filter(r => r.statut === 'repare').length;
};

const getMyPendingCount = () => {
  return reportsStore.myReports.filter(r => 
    r.statut === 'signale' || r.statut === 'verifie' || r.statut === 'en_cours'
  ).length;
};

const goToLogin = () => {
  router.push('/login');
};

const handleLogout = async () => {
  const alert = await alertController.create({
    header: 'Déconnexion',
    message: 'Voulez-vous vraiment vous déconnecter ?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnexion',
        handler: async () => {
          await authStore.logout();
          router.push('/login');
        }
      }
    ]
  });

  await alert.present();
};

const showAbout = async () => {
  const alert = await alertController.create({
    header: 'À propos',
    message: `
      <div style="font-family: var(--font-body); line-height: 1.6;">
        <p><strong>Antananarivo Road Management</strong></p>
        <p>Application de signalement et de suivi des problèmes routiers de la capitale.</p>
        <p style="margin-top: 16px;">Cette application permet aux citoyens de signaler les dégradations routières et aux autorités de suivre et gérer les réparations.</p>
        <p style="margin-top: 16px;"><strong>Fonctionnalités:</strong></p>
        <ul style="padding-left: 20px;">
          <li>Signalement géolocalisé</li>
          <li>Carte interactive</li>
          <li>Suivi en temps réel</li>
          <li>Filtres et statistiques</li>
        </ul>
      </div>
    `,
    buttons: ['Fermer']
  });

  await alert.present();
};

const showHelp = async () => {
  const alert = await alertController.create({
    header: 'Aide',
    message: `
      <div style="font-family: var(--font-body); line-height: 1.6;">
        <p><strong>Comment utiliser l'application ?</strong></p>
        
        <p style="margin-top: 12px;"><strong>1. Signaler un problème</strong></p>
        <p>Cliquez sur l'onglet "Signaler", activez votre géolocalisation, décrivez le problème et choisissez sa gravité.</p>
        
        <p style="margin-top: 12px;"><strong>2. Consulter la carte</strong></p>
        <p>Visualisez tous les signalements sur une carte interactive. Utilisez les filtres pour affiner votre recherche.</p>
        
        <p style="margin-top: 12px;"><strong>3. Suivre les signalements</strong></p>
        <p>Consultez la liste complète des signalements et leur statut de traitement.</p>
        
        <p style="margin-top: 12px;"><strong>Besoin d'aide ?</strong></p>
        <p>Contactez-nous à: support@route.mg</p>
      </div>
    `,
    buttons: ['Fermer']
  });

  await alert.present();
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await reportsStore.fetchMyReports();
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 100%;
  background: var(--cream-white);
}

.profile-header {
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  padding: 60px 24px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -80px;
  left: -80px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  background: var(--cream-white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.6s ease-out;
}

.avatar ion-icon {
  font-size: 70px;
  color: var(--navy-dark);
}

.profile-name {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--cream-white);
  margin: 0 0 16px 0;
  word-break: break-word;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba(252, 248, 243, 0.2);
  border-radius: 24px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--cream-white);
  backdrop-filter: blur(10px);
}

.role-badge ion-icon {
  font-size: 18px;
}

.role-admin {
  background: rgba(212, 165, 116, 0.3);
}

.guest-banner {
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  padding: 60px 32px;
  text-align: center;
}

.guest-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: rgba(252, 248, 243, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.guest-icon ion-icon {
  font-size: 60px;
  color: var(--cream-white);
}

.guest-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--cream-white);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.guest-text {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 300;
  color: rgba(252, 248, 243, 0.8);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.login-button {
  --background: var(--cream-white);
  --background-activated: var(--cream-light);
  --color: var(--navy-dark);
  --border-radius: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 16px;
  text-transform: none;
  margin: 0;
  height: 54px;
}

.stats-section,
.menu-section {
  padding: 24px 16px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--navy-dark);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.3px;
}

.section-title ion-icon {
  font-size: 22px;
  color: var(--navy-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-box {
  background: var(--cream-light);
  padding: 24px 16px;
  border-radius: 16px;
  text-align: center;
  border: 2px solid rgba(0, 48, 73, 0.06);
  transition: all 0.3s ease;
}

.stat-box:active {
  transform: scale(0.96);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--navy-dark);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 48, 73, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-list {
  background: var(--cream-light);
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(0, 48, 73, 0.06);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(0, 48, 73, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--navy-dark);
  text-align: left;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: rgba(0, 48, 73, 0.04);
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-item-left ion-icon {
  font-size: 24px;
  color: var(--navy-light);
}

.menu-item > ion-icon {
  font-size: 20px;
  color: rgba(0, 48, 73, 0.4);
}

.logout-icon {
  color: var(--danger-red) !important;
}

.logout-text {
  color: var(--danger-red);
}

.app-info {
  text-align: center;
  padding: 32px 24px;
}

.app-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--navy-dark);
  margin: 0 0 8px 0;
}

.app-version {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 48, 73, 0.5);
  margin: 0 0 4px 0;
}

.app-copyright {
  font-family: var(--font-body);
  font-size: 12px;
  color: rgba(0, 48, 73, 0.4);
  margin: 0;
}
</style>