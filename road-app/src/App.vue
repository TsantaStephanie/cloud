<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuthListener();
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Work+Sans:wght@300;400;500;600;700&display=swap');

:root {
  /* Navy Blue & Cream White Palette */
  --navy-dark: #003049;
  --navy-medium: #0a4d68;
  --navy-light: #1a6b8a;
  --cream-white: #fcf8f3;
  --cream-light: #fefdfb;
  --accent-gold: #d4a574;
  --accent-coral: #f77f00;
  --danger-red: #d62828;
  --success-green: #2a9d8f;
  
  /* Severity Colors */
  --severity-faible: #2a9d8f;
  --severity-moyenne: #e9c46a;
  --severity-elevee: #f77f00;
  --severity-critique: #d62828;
  
  /* Status Colors */
  --status-signale: #0a4d68;
  --status-verifie: #2a9d8f;
  --status-en-cours: #f77f00;
  --status-repare: #2a9d8f;
  
  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Work Sans', sans-serif;
  
  /* Ionic overrides */
  --ion-background-color: var(--cream-white);
  --ion-text-color: var(--navy-dark);
  --ion-color-primary: var(--navy-dark);
  --ion-color-primary-rgb: 0, 48, 73;
  --ion-color-primary-contrast: var(--cream-white);
  --ion-color-primary-contrast-rgb: 252, 248, 243;
  --ion-color-primary-shade: #002a3f;
  --ion-color-primary-tint: #1a465b;
  
  --ion-toolbar-background: var(--navy-dark);
  --ion-toolbar-color: var(--cream-white);
  
  --ion-item-background: var(--cream-light);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background: var(--cream-white);
  color: var(--navy-dark);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--cream-light);
}

::-webkit-scrollbar-thumb {
  background: var(--navy-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--navy-dark);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.4s ease-out;
}

/* Custom Components */
.page-container {
  min-height: 100vh;
  background: var(--cream-white);
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  padding: 60px 24px 32px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(40%, -40%);
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 900;
  color: var(--cream-white);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;
}

.page-subtitle {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 300;
  color: rgba(252, 248, 243, 0.8);
  position: relative;
  z-index: 1;
}

/* Cards */
.custom-card {
  background: var(--cream-light);
  border-radius: 16px;
  padding: 20px;
  margin: 12px 16px;
  box-shadow: 0 2px 8px rgba(0, 48, 73, 0.06);
  border: 1px solid rgba(0, 48, 73, 0.08);
  transition: all 0.3s ease;
}

.custom-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 48, 73, 0.1);
}

/* Buttons */
.custom-button {
  --background: var(--navy-dark);
  --background-activated: var(--navy-medium);
  --background-hover: var(--navy-medium);
  --color: var(--cream-white);
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --box-shadow: 0 4px 12px rgba(0, 48, 73, 0.2);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  letter-spacing: 0.3px;
  margin: 8px 16px;
}

.custom-button-outline {
  --background: transparent;
  --background-activated: rgba(0, 48, 73, 0.05);
  --color: var(--navy-dark);
  --border-color: var(--navy-dark);
  --border-width: 2px;
  --border-style: solid;
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  text-transform: none;
  margin: 8px 16px;
}

/* Severity badges */
.severity-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.severity-faible {
  background: rgba(42, 157, 143, 0.15);
  color: var(--severity-faible);
}

.severity-moyenne {
  background: rgba(233, 196, 106, 0.15);
  color: #c69100;
}

.severity-elevee {
  background: rgba(247, 127, 0, 0.15);
  color: var(--severity-elevee);
}

.severity-critique {
  background: rgba(214, 40, 40, 0.15);
  color: var(--severity-critique);
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-signale {
  background: rgba(10, 77, 104, 0.15);
  color: var(--status-signale);
}

.status-verifie {
  background: rgba(42, 157, 143, 0.15);
  color: var(--status-verifie);
}

.status-en-cours {
  background: rgba(247, 127, 0, 0.15);
  color: var(--status-en-cours);
}

.status-repare {
  background: rgba(42, 157, 143, 0.15);
  color: var(--status-repare);
}

/* Loading states */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--cream-light);
  border-top-color: var(--navy-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Ionic component customizations */
ion-header {
  box-shadow: 0 2px 8px rgba(0, 48, 73, 0.1);
}

ion-toolbar {
  --background: var(--navy-dark);
  --color: var(--cream-white);
  --border-width: 0;
  --padding-top: 8px;
  --padding-bottom: 8px;
}

ion-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.3px;
}

ion-content {
  --background: var(--cream-white);
}

ion-tab-bar {
  --background: var(--cream-light);
  border-top: 1px solid rgba(0, 48, 73, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
  height: calc(60px + env(safe-area-inset-bottom));
}

ion-tab-button {
  --color: var(--navy-light);
  --color-selected: var(--navy-dark);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 11px;
}

ion-tab-button::part(native) {
  padding-top: 8px;
  padding-bottom: 8px;
}

ion-icon {
  font-size: 24px;
}

/* Input fields */
ion-input,
ion-textarea,
ion-select {
  --background: var(--cream-light);
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  --padding-start: 16px;
  --padding-end: 16px;
  font-family: var(--font-body);
  border-radius: 12px;
  border: 2px solid rgba(0, 48, 73, 0.1);
  margin: 8px 0;
}

ion-item {
  --background: var(--cream-light);
  --border-color: rgba(0, 48, 73, 0.08);
  --padding-start: 16px;
  --padding-end: 16px;
  --inner-padding-end: 0;
  --min-height: 56px;
  border-radius: 12px;
  margin: 8px 16px;
}

/* Leaflet map customization */
.leaflet-container {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 48, 73, 0.15);
}

/* Empty states */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}

.empty-state-icon {
  font-size: 80px;
  color: var(--navy-light);
  opacity: 0.3;
  margin-bottom: 20px;
}

.empty-state-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--navy-dark);
  margin-bottom: 12px;
}

.empty-state-text {
  font-family: var(--font-body);
  font-size: 15px;
  color: rgba(0, 48, 73, 0.6);
  line-height: 1.6;
  max-width: 280px;
}
</style>