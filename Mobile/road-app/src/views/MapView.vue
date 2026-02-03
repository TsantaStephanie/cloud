<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Carte des Routes</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="refreshMap">
            <ion-icon :icon="refreshOutline" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <!-- Filter Chips -->
      <div class="filter-container">
        <div class="filter-chips">
          <button
            v-for="severity in severities"
            :key="severity.value"
            @click="toggleFilter(severity.value)"
            :class="['filter-chip', `chip-${severity.value}`, { active: activeFilters.includes(severity.value) }]"
          >
            <div class="chip-dot" :style="{ background: severity.color }"></div>
            <span>{{ severity.label }}</span>
            <span class="chip-count">{{ reportsStore.severityCounts[severity.value] }}</span>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div class="map-wrapper">
        <div id="map" ref="mapContainer" class="map-container"></div>
        
        <!-- Legend -->
        <div class="map-legend">
          <div class="legend-title">Légende</div>
          <div class="legend-items">
            <div v-for="severity in severities" :key="severity.value" class="legend-item">
              <div class="legend-marker" :style="{ background: severity.color }"></div>
              <span>{{ severity.label }}</span>
            </div>
          </div>
        </div>

        <!-- Current Location Button -->
        <button @click="centerOnUser" class="location-btn">
          <ion-icon :icon="locateOutline" />
        </button>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">{{ reportsStore.reports.length }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ reportsStore.severityCounts.critique }}</div>
          <div class="stat-label">Critiques</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ reportsStore.severityCounts.elevee }}</div>
          <div class="stat-label">Élevées</div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Chargement de la carte...</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/vue';
import { refreshOutline, locateOutline } from 'ionicons/icons';
import { useReportsStore } from '@/stores/reports';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const reportsStore = useReportsStore();
const mapContainer = ref(null);
const map = ref(null);
const markers = ref([]);
const loading = ref(true);
const userLocation = ref(null);
const activeFilters = ref([]);
const tempMarker = ref(null);

const severities = [
  { value: 'faible', label: 'Faible', color: '#10b981' },
  { value: 'moyenne', label: 'Moyenne', color: '#f59e0b' },
  { value: 'elevee', label: 'Élevée', color: '#ef4444' },
  { value: 'critique', label: 'Critique', color: '#7f1d1d' }
];

const getMarkerIcon = (report) => {
  // Utiliser le même système d'icônes que le frontend-visiteur
  const description = report.description || '';
  const gravite = report.gravite || 'moyenne';
  
  // Déterminer le type de problème
  let iconType = 'default';
  const desc = description.toLowerCase();
  
  if (desc.includes('nid-de-poule') || desc.includes('nid') || desc.includes('trou')) {
    iconType = 'pothole';
  } else if (desc.includes('effondr') || desc.includes('affaissement')) {
    iconType = 'collapse';
  } else if (desc.includes('fissur') || desc.includes('craquelur')) {
    iconType = 'crack';
  } else if (desc.includes('inond') || desc.includes('eau')) {
    iconType = 'flood';
  } else if (desc.includes('défon') || desc.includes('détérior') || desc.includes('endommag')) {
    iconType = 'damaged';
  } else if (desc.includes('trottoir') || desc.includes('bordur')) {
    iconType = 'damaged'; // Utiliser damaged pour les trottoirs
  }
  
  // Couleurs selon la gravité
  const colors = {
    faible: '#10b981',      // vert
    moyenne: '#f59e0b',     // orange
    elevee: '#ef4444',      // rouge
    critique: '#7f1d1d'     // rouge foncé
  };
  
  const color = colors[gravite] || '#6b7280';
  
  // SVG des icônes (identiques au frontend-visiteur)
  const icons = {
    pothole: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
        <circle cx="16" cy="16" r="5" fill="${color}"/>
        <path d="M 12 12 Q 16 14 20 12" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 12 20 Q 16 18 20 20" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `,
    collapse: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 8 12 L 24 12 L 20 20 L 12 20 Z" fill="white" opacity="0.9"/>
        <path d="M 10 14 L 14 18 M 18 14 L 22 18" stroke="white" stroke-width="2.5"/>
      </svg>
    `,
    crack: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 8 L 14 14 L 18 16 L 14 20 L 16 24" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>
    `,
    flood: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 8 14 Q 10 12 12 14 T 16 14 T 20 14 T 24 14" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 8 18 Q 10 16 12 18 T 16 18 T 20 18 T 24 18" stroke="white" stroke-width="2" fill="none"/>
        <path d="M 8 22 Q 10 20 12 22 T 16 22 T 20 22 T 24 22" stroke="white" stroke-width="2" fill="none"/>
      </svg>
    `,
    damaged: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 10 L 18 14 L 22 14 L 19 17 L 20 21 L 16 19 L 12 21 L 13 17 L 10 14 L 14 14 Z" fill="white" opacity="0.9"/>
      </svg>
    `,
    default: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="${color}" stroke="white" stroke-width="2"/>
        <path d="M 16 10 L 16 18" stroke="white" stroke-width="3" stroke-linecap="round"/>
        <circle cx="16" cy="22" r="1.5" fill="white"/>
      </svg>
    `
  };
  
  const iconSvg = icons[iconType] || icons.default;

  return L.divIcon({
    html: iconSvg,
    className: 'custom-svg-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const getTempMarkerIcon = () => {
  const svgIcon = '<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30c0-11-9-20-20-20z" fill="#ff6b6b" stroke="#fff" stroke-width="3"/><circle cx="20" cy="20" r="8" fill="#fff"/><text x="20" y="25" text-anchor="middle" fill="#ff6b6b" font-size="14" font-weight="bold">✓</text></svg>';

  return L.divIcon({
    html: svgIcon,
    className: 'temp-marker',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

const handleMapClick = (e) => {
  const clickedElement = e.originalEvent.target;
  if (clickedElement.classList.contains('custom-marker') || 
      clickedElement.closest('.custom-marker') ||
      clickedElement.classList.contains('leaflet-marker-icon')) {
    console.log(' Clic sur un marqueur existant - annulation');
    return;
  }

  const { lat, lng } = e.latlng;
  console.log(' Clic sur la carte vide à:', lat, lng);
  
  if (tempMarker.value) {
    map.value.removeLayer(tempMarker.value);
  }
  
  tempMarker.value = L.marker([lat, lng], {
    icon: getTempMarkerIcon()
  }).addTo(map.value);
  
  const popupContent = '<div style="font-family: var(--font-body); min-width: 200px; text-align: center;"><h4 style="margin: 0 0 12px 0; color: var(--navy-dark);">Nouveau Signalement</h4><p style="margin: 0 0 12px 0; font-size: 13px; color: rgba(0, 48, 73, 0.7);">Position: ' + lat.toFixed(6) + ', ' + lng.toFixed(6) + '</p><button onclick="window.createReportAt(' + lat + ', ' + lng + ')" style="background: var(--navy-dark); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; width: 100%;">Créer un signalement</button></div>';
  
  tempMarker.value.bindPopup(popupContent).openPopup();
};

window.createReportAt = (lat, lng) => {
  sessionStorage.setItem('reportLocation', JSON.stringify({ latitude: lat, longitude: lng }));
  router.push('/tabs/report');
};

const initMap = () => {
  if (map.value) return;

  const center = [-18.8792, 47.5079];
  map.value = L.map(mapContainer.value).setView(center, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ' OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 10,
    updateWhenIdle: false,
    updateWhenZooming: false,
    keepBuffer: 2,
    preferCanvas: true
  }).addTo(map.value);

  map.value.on('click', handleMapClick);
  getUserLocation();
};

const addMarkersToMap = () => {
  markers.value.forEach(marker => marker.remove());
  markers.value = [];

  const reports = activeFilters.value.length > 0
    ? reportsStore.reports.filter(r => activeFilters.value.includes(r.gravite))
    : reportsStore.reports;

  reports.forEach(report => {
    const marker = L.marker([report.latitude, report.longitude], {
      icon: getMarkerIcon(report)
    }).addTo(map.value);

    const popupContent = '<div style="font-family: var(--font-body); min-width: 250px;"><h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: var(--navy-dark);">' + report.description + '</h4><div style="margin-bottom: 8px;"><span class="severity-badge severity-' + report.gravite + '">' + report.gravite + '</span><span class="status-badge status-' + report.statut + '" style="margin-left: 8px;">' + report.statut.replace('_', ' ') + '</span></div><div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 4px;"><strong>Longueur:</strong> ' + report.longueur_km + ' km</div><div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 4px;"><strong>Latitude:</strong> ' + report.latitude + '</div><div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 4px;"><strong>Longitude:</strong> ' + report.longitude + '</div>' + (report.budget ? '<div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 4px;"><strong>Budget:</strong> ' + Number(report.budget).toLocaleString('fr-MG') + ' Ar</div>' : '') + (report.entreprise ? '<div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 4px;"><strong>Entreprise:</strong> ' + report.entreprise + '</div>' : '') + '</div>';

    marker.bindPopup(popupContent);
    markers.value.push(marker);
  });
};

const toggleFilter = (severity) => {
  const index = activeFilters.value.indexOf(severity);
  if (index > -1) {
    activeFilters.value.splice(index, 1);
  } else {
    activeFilters.value.push(severity);
  }
  addMarkersToMap();
};

const centerOnUser = () => {
  if (userLocation.value && map.value) {
    map.value.setView(userLocation.value, 15);
  }
};

const refreshMap = async () => {
  loading.value = true;
  await reportsStore.fetchReports();
  addMarkersToMap();
  loading.value = false;
};

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = [position.coords.latitude, position.coords.longitude];
        
        if (map.value) {
          L.marker(userLocation.value, {
            icon: L.divIcon({
              html: '<div style="background: #4285f4; border: 3px solid #fff; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
              className: 'user-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })
          }).addTo(map.value);
        }
      },
      (err) => {
        console.warn('Impossible d\'obtenir votre position:', err);
      }
    );
  }
};

onMounted(async () => {
  const reportsPromise = reportsStore.fetchReports();
  initMap();
  await reportsPromise;
  addMarkersToMap();
  
  setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize();
      console.log(' Carte redimensionnée');
    }
  }, 100);
  
  const newReportLocation = sessionStorage.getItem('newReportLocation');
  if (newReportLocation) {
    const { latitude, longitude } = JSON.parse(newReportLocation);
    sessionStorage.removeItem('newReportLocation');
    
    if (map.value) {
      map.value.setView([latitude, longitude], 16);
      
      // Créer un marqueur spécial plus visible qui dure plus longtemps
      const newReportMarker = L.marker([latitude, longitude], {
        icon: getTempMarkerIcon()
      }).addTo(map.value);
      
      const popupContent = '<div style="font-family: var(--font-body); min-width: 200px; text-align: center;"><h4 style="margin: 0 0 8px 0; color: #2a9d8f;">✅ Nouveau Signalement</h4><p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(0, 48, 73, 0.7);">Votre signalement a été ajouté avec succès !</p><p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(0, 48, 73, 0.6);">Position: ' + latitude.toFixed(6) + ', ' + longitude.toFixed(6) + '</p><p style="margin: 8px 0 0 0; font-size: 11px; color: #d62828; font-weight: bold;">⚠️ Ce marqueur spécial disparaîtra dans 30 secondes</p></div>';
      
      newReportMarker.bindPopup(popupContent).openPopup();
      
      // Garder le marqueur spécial plus longtemps (30 secondes au lieu de 5)
      setTimeout(() => {
        if (map.value) {
          map.value.removeLayer(newReportMarker);
          console.log('🗑️ Marqueur spécial supprimé après 30 secondes');
        }
      }, 30000);
    }
  }
  
  loading.value = false;
});
</script>

<style scoped>
.filter-container {
  padding: 16px;
  background: var(--cream-light);
  border-bottom: 1px solid rgba(0, 48, 73, 0.08);
}

.filter-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.filter-chips::-webkit-scrollbar {
  height: 4px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--cream-white);
  border: 2px solid rgba(0, 48, 73, 0.1);
  border-radius: 24px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--navy-dark);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip.active {
  background: var(--navy-dark);
  color: var(--cream-white);
  border-color: var(--navy-dark);
  box-shadow: 0 4px 12px rgba(0, 48, 73, 0.2);
}

.chip-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-count {
  background: rgba(0, 48, 73, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  margin-left: 4px;
}

.filter-chip.active .chip-count {
  background: rgba(252, 248, 243, 0.2);
}

.map-wrapper {
  position: relative;
  height: calc(100vh - 280px);
  margin: 0;
  min-height: 400px;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 0;
  background: #f0f0f0;
}

.map-legend {
  position: absolute;
  top: 16px;
  right: 16px;
  background: var(--cream-white);
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 48, 73, 0.15);
  z-index: 1000;
  min-width: 140px;
}

.legend-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--navy-dark);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--navy-dark);
}

.legend-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.location-btn {
  position: absolute;
  bottom: 100px;
  right: 16px;
  width: 48px;
  height: 48px;
  background: var(--navy-dark);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 48, 73, 0.3);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
}

.location-btn:active {
  transform: scale(0.95);
}

.location-btn ion-icon {
  font-size: 24px;
  color: var(--cream-white);
}

.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 16px;
  background: var(--cream-light);
  border-top: 1px solid rgba(0, 48, 73, 0.08);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--navy-dark);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 48, 73, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(0, 48, 73, 0.15);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(252, 248, 243, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 9999;
}

.loading-overlay p {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--navy-dark);
}
</style>
