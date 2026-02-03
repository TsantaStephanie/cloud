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
  { value: 'faible', label: 'Faible', color: '#2a9d8f' },
  { value: 'moyenne', label: 'Moyenne', color: '#e9c46a' },
  { value: 'elevee', label: 'Élevée', color: '#f77f00' },
  { value: 'critique', label: 'Critique', color: '#d62828' }
];

const getMarkerIcon = (severity) => {
  const colors = {
    faible: '#2a9d8f',
    moyenne: '#e9c46a',
    elevee: '#f77f00',
    critique: '#d62828'
  };

  const svgIcon = '<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z" fill="' + colors[severity] + '" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>';

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

const getTempMarkerIcon = () => {
  const svgIcon = '<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24c0-8.8-7.2-16-16-16z" fill="#ff6b6b" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#fff"/><text x="16" y="20" text-anchor="middle" fill="#ff6b6b" font-size="12" font-weight="bold">+</text></svg>';

  return L.divIcon({
    html: svgIcon,
    className: 'temp-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
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
      icon: getMarkerIcon(report.gravite)
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
      
      const newReportMarker = L.marker([latitude, longitude], {
        icon: getTempMarkerIcon()
      }).addTo(map.value);
      
      const popupContent = '<div style="font-family: var(--font-body); min-width: 200px; text-align: center;"><h4 style="margin: 0 0 8px 0; color: #2a9d8f;"> Nouveau Signalement</h4><p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(0, 48, 73, 0.7);">Votre signalement a été ajouté avec succès !</p><p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(0, 48, 73, 0.6);">Position: ' + latitude.toFixed(6) + ', ' + longitude.toFixed(6) + '</p></div>';
      
      newReportMarker.bindPopup(popupContent).openPopup();
      
      setTimeout(() => {
        if (map.value) {
          map.value.removeLayer(newReportMarker);
        }
      }, 5000);
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
