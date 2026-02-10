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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import { useReportsStore } from '@/stores/reports';
import { trashOutline, refreshOutline, locateOutline, arrowUpOutline, cameraOutline, createOutline, businessOutline, cashOutline, locationOutline, globeOutline, imagesOutline, checkmarkCircleOutline } from 'ionicons/icons';
import 'leaflet/dist/leaflet.css';

const router = useRouter();
const reportsStore = useReportsStore();

// Fonction pour convertir les icônes ionicons en SVG
const getIconSvg = (iconName, size = 16, color = '#003049') => {
  const icons = {
    arrowUpOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 4l-8 8h5v8h6v-8h5l-8-8z"/></svg>`,
    cameraOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 15.2A3.2 3.2 0 1 0 8.8 12 3.2 3.2 0 0 0 12 15.2zm0-4.8A1.6 1.6 0 1 1 10.4 12 1.6 1.6 0 0 1 12 10.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`,
    createOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    businessOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
    cashOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
    locationOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    globeOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
    imagesOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`,
    checkmarkCircleOutline: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
  };
  return icons[iconName] || '';
};
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

window.addPhotosToReport = (reportId) => {
  console.log('📷 Ajout de photos au signalement:', reportId);
  router.push(`/tabs/edit-report/${reportId}`);
};

window.editPoint = (reportId) => {
  console.log('✏️ Modification du signalement:', reportId);
  router.push(`/tabs/edit-point/${reportId}`);
};

window.scrollToTop = (reportId) => {
  console.log('⬆️ Scroll vers le haut pour:', reportId);
  requestAnimationFrame(() => {
    const popupWrapper = document.querySelector(`.popup-wrapper-${reportId}`);
    if (popupWrapper) {
      popupWrapper.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
};

window.togglePhotos = (reportId) => {
  console.log('📷 Toggle photos pour:', reportId);
  
  requestAnimationFrame(() => {
    const photosDiv = document.getElementById(`photos-${reportId}`);
    const popupWrapper = document.querySelector(`.popup-wrapper-${reportId}`);
    
    if (photosDiv && popupWrapper) {
      try {
        const isVisible = photosDiv.style.display === 'block';
        photosDiv.style.display = isVisible ? 'none' : 'block';
        console.log(isVisible ? '🙈 Photos masquées' : '✅ Photos affichées');
        
        if (!isVisible) {
          // Scroll vers la section photos
          setTimeout(() => {
            const photosPosition = photosDiv.offsetTop;
            popupWrapper.scrollTo({ top: photosPosition - 20, behavior: 'smooth' });
          }, 100);
        }
      } catch (error) {
        console.error('💥 Erreur lors du toggle des photos:', error);
      }
    }
  });
};

window.showPhoto = (reportId, photoIndex) => {
  console.log('🖼️ Affichage de la photo:', reportId, photoIndex);
  
  requestAnimationFrame(() => {
    const report = reportsStore.reports.find(r => r.id === reportId);
    
    if (!report) {
      console.log('❌ Signalement non trouvé:', reportId);
      return;
    }
    
    const photoUrls = [];
    if (report.imageUrl) {
      photoUrls.push(report.imageUrl);
    }
    if (report.images && report.images.length > 0) {
      photoUrls.push(...report.images);
    }
    
    if (photoIndex >= 0 && photoIndex < photoUrls.length) {
      const photoUrl = photoUrls[photoIndex];
      const container = document.getElementById(`photo-container-${reportId}`);
      
      if (container) {
        try {
          container.innerHTML = `
            <div style="position: relative; display: inline-block; max-width: 100%;">
              <img src="${photoUrl}" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); display: block;" alt="Photo ${photoIndex + 1}">
              <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                ${photoIndex + 1}/${photoUrls.length}
              </div>
            </div>
          `;
          
          const photosDiv = document.getElementById(`photos-${reportId}`);
          if (photosDiv) {
            const dots = photosDiv.querySelectorAll('[onclick^="window.showPhoto"]');
            
            dots.forEach((dot, index) => {
              if (dot && dot.style) {
                if (index === photoIndex) {
                  dot.style.background = '#1d4ed8';
                  dot.style.transform = 'scale(1.2)';
                } else {
                  dot.style.background = '#3b82f6';
                  dot.style.transform = 'scale(1)';
                }
              }
            });
          }
        } catch (error) {
          console.error('💥 Erreur lors de l\'insertion de la photo:', error);
        }
      }
    }
  });
};

const initMap = () => {
  if (map.value) return;

  const center = [-18.8792, 47.5079];
  map.value = L.map(mapContainer.value, {
    center: center,
    zoom: 13,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
  });

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

    const hasPhotos = report.imageUrl || (report.images && report.images.length > 0);
    
    // Début de la popup avec classe unique pour le scroll
    let popupContent = `
      <div class="popup-wrapper popup-wrapper-${report.id}" style="
        font-family: var(--font-body);
        min-width: 280px;
        max-width: 320px;
        max-height: 65vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        scroll-behavior: smooth;
        position: relative;
      ">
        <!-- Bouton scroll to top fixe -->
        <button onclick="window.scrollToTop('${report.id}')" style="
          position: sticky;
          top: 0;
          right: 0;
          float: right;
          background: rgba(0, 48, 73, 0.9);
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          margin-bottom: 8px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(0, 48, 73, 1)'" onmouseout="this.style.background='rgba(0, 48, 73, 0.9)'">
          ${getIconSvg('arrowUpOutline', 16, 'white')}
        </button>
        
        <div style="clear: both;"></div>
        
        <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; margin: 0 0 12px 0; color: var(--navy-dark); line-height: 1.3;">
          ${report.description}
        </h4>
        
        <div style="margin-bottom: 12px;">
          <span class="severity-badge severity-${report.gravite}">${report.gravite}</span>
          <span class="status-badge status-${report.statut}" style="margin-left: 8px;">${report.statut.replace('_', ' ')}</span>
        </div>
        
        <div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 8px; line-height: 1.4;">
          <strong>${getIconSvg('locationOutline', 14, '#003049')} Longueur:</strong> ${report.longueur_km} km
        </div>
        <div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 8px; line-height: 1.4;">
          <strong>${getIconSvg('globeOutline', 14, '#003049')} Latitude:</strong> ${report.latitude}
        </div>
        <div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 8px; line-height: 1.4;">
          <strong>${getIconSvg('globeOutline', 14, '#003049')} Longitude:</strong> ${report.longitude}
        </div>`;
    
    if (report.budget) {
      popupContent += `
        <div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 8px; line-height: 1.4;">
          <strong>${getIconSvg('cashOutline', 14, '#003049')} Budget:</strong> ${Number(report.budget).toLocaleString('fr-MG')} Ar
        </div>`;
    }
    
    if (report.entreprise) {
      popupContent += `
        <div style="font-size: 13px; color: rgba(0, 48, 73, 0.7); margin-bottom: 8px; line-height: 1.4;">
          <strong>${getIconSvg('businessOutline', 14, '#003049')} Entreprise:</strong> ${report.entreprise}
        </div>`;
    }
    
    // Section photos
    if (hasPhotos) {
      popupContent += `
        <div style="margin: 16px 0; padding-top: 12px; border-top: 1px solid #e5e7eb;">
          <button onclick="window.togglePhotos('${report.id}')" style="
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            width: 100%;
            margin-top: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
          ">
            ${getIconSvg('cameraOutline', 16, 'white')} Voir les Photos
          </button>
          
          <div id="photos-${report.id}" style="display: none; margin-top: 16px;">`;
      
      const totalPhotos = (report.imageUrl ? 1 : 0) + (report.images ? report.images.length : 0);
      
      if (totalPhotos > 0) {
        popupContent += '<div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; flex-wrap: wrap;">';
        
        for (let i = 0; i < totalPhotos; i++) {
          popupContent += `
            <div onclick="window.showPhoto('${report.id}', ${i})" style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              transition: all 0.3s ease;
            " title="Photo ${i + 1}"></div>`;
        }
        
        popupContent += `
          </div>
          <div id="photo-container-${report.id}" style="
            text-align: center;
            margin-top: 12px;
            max-height: 200px;
            overflow-y: auto;
            padding: 8px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          "></div>`;
      }
      
      popupContent += '</div></div>';
    } else {
      popupContent += `
        <div style="margin: 16px 0; padding: 12px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b; text-align: center;">
          <div style="font-size: 14px; color: #92400e; font-weight: 600;">${getIconSvg('imagesOutline', 16, '#92400e')} Aucune photo</div>
          <div style="font-size: 12px; color: #92400e; margin-top: 4px;">Ajoutez des photos pour documenter ce signalement</div>
        </div>`;
    }
    
    // Boutons d'action
    popupContent += `
      <div style="display: flex; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <button onclick="window.editPoint('${report.id}')" style="
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        ">
          ${getIconSvg('createOutline', 16, 'white')} Modifier
        </button>`;
    
    if (!hasPhotos) {
      popupContent += `
        <button onclick="window.addPhotosToReport('${report.id}')" style="
          background: linear-gradient(135deg, var(--navy-dark) 0%, #1e3a8a 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
          box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
          transition: all 0.3s ease;
        ">
          ${getIconSvg('cameraOutline', 16, 'white')} Ajouter
        </button>`;
    }
    
    popupContent += '</div></div>';

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
  console.log('🔄 Actualisation de la carte...');
  reportsStore.fetchReports();
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
      
      const popupContent = '<div style="font-family: var(--font-body); min-width: 240px; max-width: 280px; max-height: 50vh; overflow-y: auto; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); text-align: center;"><h4 style="margin: 0 0 12px 0; color: #10b981; font-size: 18px; font-weight: 700;">' + getIconSvg('checkmarkCircleOutline', 20, '#10b981') + ' Nouveau Signalement</h4><p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(0, 48, 73, 0.8); line-height: 1.4;">Votre signalement a été ajouté avec succès !</p><div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 6px; padding: 12px; margin: 12px 0;"><p style="margin: 0 0 8px 0; font-size: 13px; color: #047857; font-weight: 600;">' + getIconSvg('locationOutline', 14, '#047857') + ' Position GPS:</p><p style="margin: 0; font-size: 12px; color: #065f46; font-family: monospace;">' + latitude.toFixed(6) + ', ' + longitude.toFixed(6) + '</p></div><div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px; margin: 12px 0;"><p style="margin: 0; font-size: 12px; color: #92400e; font-weight: 600;">⏱️ Disparition automatique</p><p style="margin: 4px 0 0 0; font-size: 11px; color: #78350f;">Ce marqueur spécial disparaîtra dans 30 secondes</p></div></div>';
      
      newReportMarker.bindPopup(popupContent).openPopup();
      
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

/* Styles pour les popups avec scroll */
:deep(.leaflet-popup-content-wrapper) {
  padding: 0 !important;
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  margin: 0 !important;
  max-height: 65vh;
  overflow: hidden;
}

/* Personnalisation de la scrollbar pour les popups */
:deep(.popup-wrapper::-webkit-scrollbar) {
  width: 8px;
}

:deep(.popup-wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

:deep(.popup-wrapper::-webkit-scrollbar-thumb) {
  background: var(--navy-dark);
  border-radius: 4px;
}

:deep(.popup-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #002030;
}
</style>