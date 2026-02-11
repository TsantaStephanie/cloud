<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-container">
        <!-- Hero Section -->
        <div class="hero-section">
          <div class="hero-icon">
            <ion-icon :icon="constructOutline" />
          </div>
          <h1 class="hero-title">Antananarivo</h1>
          <h2 class="hero-subtitle">Road Management</h2>
          <p class="hero-description">
            Signalez et suivez les problèmes routiers de notre capitale
          </p>
        </div>

        <!-- Login Form -->
        <div class="form-container">
          <div class="form-header">
            <h3 class="form-title">Connexion</h3>
            <p class="form-subtitle">Accédez à votre espace</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group">
              <ion-icon :icon="mailOutline" class="input-icon" />
              <ion-input
                v-model="email"
                type="email"
                placeholder="Email"
                required
                class="custom-input"
              />
            </div>

            <div class="input-group">
              <ion-icon :icon="lockClosedOutline" class="input-icon" />
              <ion-input
                v-model="password"
                type="password"
                placeholder="Mot de passe"
                required
                class="custom-input"
              />
            </div>

            <div v-if="error" class="error-message">
              <ion-icon :icon="alertCircleOutline" />
              <span>{{ error }}</span>
            </div>

            <ion-button
              expand="block"
              type="submit"
              :disabled="loading"
              class="login-button"
            >
              <span v-if="!loading">Se connecter</span>
              <span v-else>Connexion...</span>
            </ion-button>
          </form>

          <div class="divider">
            <span>ou</span>
          </div>

          <ion-button
            expand="block"
            fill="outline"
            @click="continueAsGuest"
            class="guest-button"
          >
            <ion-icon :icon="personOutline" slot="start" />
            Continuer en visiteur
          </ion-button>

          <!-- Demo Accounts -->
          <div class="demo-section">
            <p class="demo-title">Comptes de démonstration</p>
            <div class="demo-buttons">
              <button @click="fillCredentials('admin@route.mg', 'admin')" class="demo-btn">
                <ion-icon :icon="shieldCheckmarkOutline" />
                <span>Admin</span>
              </button>
              <button @click="fillCredentials('user1@route.mg', 'User456')" class="demo-btn">
                <ion-icon :icon="personCircleOutline" />
                <span>Utilisateur</span>
              </button>
            </div>
          </div>

          <!-- Identifiants de connexion -->
          <div class="credentials-section">
            <p class="credentials-title">Identifiants de connexion</p>
            <div class="credentials-list">
              
              
              <div class="credential-item">
                <div class="credential-role">
                  <ion-icon :icon="personCircleOutline" />
                  <span>Utilisateur</span>
                </div>
                <div class="credential-details">
                  <div class="credential-field">
                    <span class="field-label">Email:</span>
                    <span class="field-value">user1@route.mg</span>
                  </div>
                  <div class="credential-field">
                    <span class="field-label">Mot de passe:</span>
                    <span class="field-value">User456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p> 2026 Antananarivo Road Management</p>
          <p>© 2026 Antananarivo Road Management</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  alertController
} from '@ionic/vue';
import {
  mailOutline,
  lockClosedOutline,
  constructOutline,
  personOutline,
  alertCircleOutline,
  shieldCheckmarkOutline,
  personCircleOutline
} from 'ionicons/icons';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  const success = await authStore.login(email.value, password.value);

  if (success) {
    router.push('/tabs/map');
  } else {
    error.value = 'Email ou mot de passe incorrect';
  }

  loading.value = false;
};

const continueAsGuest = () => {
  router.push('/tabs/map');
};

const fillCredentials = (demoEmail, demoPassword) => {
  email.value = demoEmail;
  password.value = demoPassword;
};
</script>

<style scoped>
.login-content {
  --background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 50%, var(--navy-light) 100%);
}

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 40px 24px 24px;
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: 30px 0 24px;
  animation: fadeIn 0.6s ease-out;
}

.hero-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-coral) 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.hero-icon ion-icon {
  font-size: 44px;
  color: var(--cream-white);
}

.hero-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 900;
  color: var(--cream-white);
  margin: 0 0 4px 0;
  letter-spacing: -1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--accent-gold);
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}

.hero-description {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 300;
  color: rgba(252, 248, 243, 0.85);
  line-height: 1.5;
  max-width: 240px;
  margin: 0 auto;
}

/* Form Container */
.form-container {
  background: var(--cream-white);
  border-radius: 24px 24px 0 0;
  padding: 24px 20px;
  flex: 1;
  box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.5s ease-out 0.2s backwards;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 900;
  color: var(--navy-dark);
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 48, 73, 0.6);
  margin: 0;
}

/* Form Inputs */
.login-form {
  margin-bottom: 20px;
}

.input-group {
  position: relative;
  margin-bottom: 14px;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--navy-light);
  z-index: 10;
}

.custom-input {
  --background: rgba(0, 48, 73, 0.04);
  --color: var(--navy-dark);
  --placeholder-color: rgba(0, 48, 73, 0.5);
  --padding-start: 42px;
  --padding-end: 14px;
  --border-radius: 14px;
  height: 48px;
  font-family: var(--font-body);
  font-size: 15px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  --background: var(--cream-light);
  border-color: var(--navy-light);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(214, 40, 40, 0.1);
  border-radius: 10px;
  margin-bottom: 14px;
  animation: fadeIn 0.3s ease-out;
}

.error-message ion-icon {
  font-size: 18px;
  color: var(--danger-red);
  flex-shrink: 0;
}

.error-message span {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--danger-red);
  font-weight: 500;
}

/* Buttons */
.login-button {
  --background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-medium) 100%);
  --background-activated: var(--navy-medium);
  --color: var(--cream-white);
  --border-radius: 14px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --box-shadow: 0 6px 20px rgba(0, 48, 73, 0.3);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 16px;
  text-transform: none;
  letter-spacing: 0.5px;
  margin: 20px 0 0 0;
  height: 52px;
}

.guest-button {
  --border-color: var(--navy-light);
  --color: var(--navy-dark);
  --border-width: 2px;
  --border-radius: 14px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 15px;
  text-transform: none;
  margin: 0;
  height: 50px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 25px);
  height: 1px;
  background: rgba(0, 48, 73, 0.15);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 48, 73, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Demo Section */
.demo-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 48, 73, 0.1);
}

.demo-title {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 48, 73, 0.6);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.demo-btn {
  background: rgba(0, 48, 73, 0.04);
  border: 2px solid rgba(0, 48, 73, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  color: var(--navy-dark);
}

.demo-btn:active {
  transform: scale(0.96);
  background: rgba(0, 48, 73, 0.08);
}

.demo-btn ion-icon {
  font-size: 18px;
  color: var(--navy-light);
}

/* Footer */
.login-footer {
  text-align: center;
  padding: 20px 0 0;
}

.login-footer p {
  font-family: var(--font-body);
  font-size: 11px;
  color: rgba(0, 48, 73, 0.4);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 30px 16px 20px;
    max-width: 100%;
  }
  
  .hero-section {
    padding: 20px 0 20px;
  }
  
  .hero-icon {
    width: 70px;
    height: 70px;
    margin: 0 auto 16px;
  }
  
  .hero-icon ion-icon {
    font-size: 38px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-description {
    font-size: 13px;
    max-width: 220px;
  }
  
  .form-container {
    padding: 20px 16px;
  }
  
  .form-header {
    margin-bottom: 20px;
  }
  
  .form-title {
    font-size: 22px;
  }
  
  .custom-input {
    height: 46px;
    font-size: 14px;
    --padding-start: 40px;
  }
  
  .input-icon {
    font-size: 16px;
    left: 12px;
  }
  
  .login-button {
    height: 50px;
    font-size: 15px;
  }
  
  .guest-button {
    height: 48px;
    font-size: 14px;
  }
}
</style>