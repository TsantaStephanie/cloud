import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fonction pour générer des icônes SVG
const getIconSvg = (iconName: string, size: number = 16, color: string = '#374151') => {
  const icons: Record<string, string> = {
    calendar: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>`,
    chartBar: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/></svg>`,
    ruler: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M1 3v4h2V5h16v2h2V3c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2zm8 6H3v12h6V9zm0 10H5v-8h4v8zm10 0h-6v2h6v-2zm0-4h-6v2h6v-2zm0-4h-6v2h6v-2z"/></svg>`,
    cash: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>`,
    building: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
    warning: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
    straighten: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`,
    camera: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 15.2A3.2 3.2 0 1 0 8.8 12 3.2 3.2 0 0 0 12 15.2zm0-4.8A1.6 1.6 0 1 1 10.4 12 1.6 1.6 0 0 1 12 10.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`,
    images: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`
  };
  return icons[iconName] || '';
};

// Fonction globale pour gérer l'affichage des photos
declare global {
  interface Window {
    togglePhotos: (reportId: string) => void;
  }
}

// Fonction globale pour afficher/masquer les photos
window.togglePhotos = (reportId: string) => {
  const photosDiv = document.getElementById(`photos-${reportId}`);
  if (photosDiv) {
    const currentDisplay = photosDiv.style.display;
    photosDiv.style.display = currentDisplay === 'none' ? 'block' : 'none';
  }
};

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  location_name: string;
  longueur_km: number;
  surface_m2?: number;
  budget?: number;
  entreprise?: string;
  imageUrl?: string;  // Photo principale
  images?: string[];  // Tableau de photos additionnelles
  created_at: string;
  updated_at: string;
}

import { getRouteIcon } from '../lib/api';

// Fonctions utilitaires pour traduire les statuts et priorités
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'nouveau': 'Nouveau',
    'verifie': 'Vérifié',
    'en_cours': 'En cours',
    'termine': 'Terminé',
  };
  return statusMap[status] || status;
};

const getPriorityText = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': 'Faible',
    'medium': 'Moyenne',
    'high': 'Élevée',
    'urgent': 'Critique',
  };
  return priorityMap[priority] || priority;
};

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, locationName: string) => void;
  reports?: Report[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ onLocationSelect, reports = [], center, zoom = 13 }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const defaultCenter: [number, number] = center || [-18.8792, 47.5079];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(defaultCenter, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    if (onLocationSelect) {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect(lat, lng, locationName);
        } catch (error) {
          const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          onLocationSelect(lat, lng, locationName);
        }
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    console.log('MapView useEffect - Nombre de reports:', reports.length);
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (reports.length === 0) {
      console.log('Aucun report à afficher');
      return;
    }

    console.log('Début du traitement des', reports.length, 'reports');

    reports.forEach((report, index) => {
      if (!mapRef.current) return;

      console.log(`Report ${index + 1}:`, report.description, report.priority);

      // Utiliser les nouvelles icônes SVG basées sur le type de problème
      console.log('Description reçue:', report.description);
      console.log('Priority reçue:', report.priority);
      
      const routeIcon = getRouteIcon(report.description, report.priority);
      const color = routeIcon.color;
      const iconSvg = routeIcon.iconSvg;

      console.log('Icône SVG choisie:', routeIcon.iconType, 'Couleur:', color);
      console.log('SVG généré:', iconSvg.substring(0, 100) + '...');

      const icon = L.divIcon({
        html: iconSvg,
        className: 'custom-svg-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      console.log('Création du marqueur avec SVG:', routeIcon.iconType);

      const marker = L.marker([report.latitude, report.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 350px; max-width: 450px; max-height: 80vh; overflow-y: auto; padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <!-- En-tête -->
            <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6;">
              <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 20px; color: #1f2937; line-height: 1.3;">${report.title}</h3>
              <p style="margin-bottom: 0; color: #4b5563; font-size: 15px; line-height: 1.5;">${report.description}</p>
            </div>
            
            <!-- Bouton Voir Photo -->
            ${(report.images && report.images.length > 0) || report.imageUrl ? `
            <div style="margin: 20px 0;">
              <button 
                id="voir-photo-${report.id}"
                onclick="togglePhotos('${report.id}')"
                style="
                  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                  color: white;
                  border: none;
                  padding: 14px 24px;
                  border-radius: 10px;
                  cursor: pointer;
                  font-size: 15px;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  transition: all 0.3s ease;
                  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
                  width: 100%;
                  justify-content: center;
                "
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(59, 130, 246, 0.4)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 16px rgba(59, 130, 246, 0.3)'"
              >
                📷 Voir ${(report.images && report.images.length > 1) ? 'les Photos' : 'la Photo'}
              </button>
              ${(report.images && report.images.length > 1) ? `
                <div style="margin-top: 10px; font-size: 14px; color: #6b7280; text-align: center;">
                  ${report.images.length} photo${report.images.length > 1 ? 's' : ''} disponible${report.images.length > 1 ? 's' : ''}
                </div>
              ` : ''}
            </div>
            ` : ''}
            
            <!-- Conteneur des photos (caché par défaut) -->
            <div id="photos-${report.id}" style="display: none; margin: 20px 0;">
              <div style="border-top: 2px solid #f3f4f6; padding-top: 20px;">
                <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #374151;">
                  ${getIconSvg('images', 18, '#374151')} Photo${(report.images && report.images.length > 1) ? 's' : ''} du signalement
                </h4>
                <div style="display: flex; flex-direction: column; gap: 16px;">
                  ${(() => {
                    // Combiner toutes les photos : imageUrl + images
                    const allPhotos = [];
                    
                    // Ajouter l'image principale si elle existe
                    if (report.imageUrl) {
                      allPhotos.push({
                        url: report.imageUrl,
                        index: 0,
                        isMain: true
                      });
                    }
                    
                    // Ajouter les images additionnelles si elles existent
                    if (report.images && report.images.length > 0) {
                      report.images.forEach((img) => {
                        allPhotos.push({
                          url: img,
                          index: allPhotos.length,
                          isMain: false
                        });
                      });
                    }
                    
                    // Afficher toutes les photos
                    if (allPhotos.length > 0) {
                      return allPhotos.map(photo => `
                        <div style="position: relative;">
                          <img 
                            src="${photo.url}" 
                            alt="Photo ${photo.index + 1} du signalement ${photo.isMain ? '(principale)' : ''}"
                            style="
                              width: 100%;
                              max-height: 280px;
                              object-fit: cover;
                              border-radius: 10px;
                              border: 2px solid ${photo.isMain ? '#3b82f6' : '#e5e7eb'};
                              cursor: pointer;
                              transition: all 0.3s ease;
                              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            "
                            onclick="window.open('${photo.url}', '_blank')"
                            onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
                          />
                          <div style="position: absolute; top: 16px; right: 16px; background: ${photo.isMain ? 'rgba(59, 130, 246, 0.9)' : 'rgba(0,0,0,0.8)'}; color: white; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                            ${photo.index + 1}/${allPhotos.length} ${photo.isMain ? '⭐' : ''}
                          </div>
                        </div>
                      `).join('');
                    } else {
                      return `
                        <div style="padding: 30px; text-align: center; color: #6b7280; font-style: italic; background: #f9fafb; border-radius: 10px; border: 2px solid #e5e7eb;">
                          📷 Aucune photo disponible pour ce signalement
                        </div>
                      `;
                    }
                  })()}
                </div>
              </div>
            </div>
            
            <!-- Section détails -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f3f4f6;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                <div>
                  <p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('calendar', 14, '#1f2937')} Date:</strong> ${new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('chartBar', 14, '#1f2937')} Status:</strong> <span style="color: ${color}; font-weight: 600; text-transform: capitalize; padding: 4px 10px; border-radius: 6px; background: ${color + '20'}; font-size: 13px;">${getStatusText(report.status)}</span></p>
                  ${report.surface_m2 ? `<p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('ruler', 14, '#1f2937')} Surface:</strong> ${report.surface_m2.toLocaleString('fr-FR')} m²</p>` : ''}
                </div>
                <div>
                  ${report.budget ? `<p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('cash', 14, '#1f2937')} Budget:</strong> <span style="font-weight: 600; color: #059669;">${report.budget.toLocaleString('fr-FR')} €</span></p>` : ''}
                  ${report.entreprise ? `<p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('building', 14, '#1f2937')} Entreprise:</strong> ${report.entreprise}</p>` : ''}
                  <p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('warning', 14, '#1f2937')} Gravité:</strong> <span style="font-weight: 600; text-transform: capitalize; padding: 4px 10px; border-radius: 6px; background: #fef3c7; color: #92400e; font-size: 13px;">${getPriorityText(report.priority)}</span></p>
                  <p style="margin-bottom: 12px; color: #374151;"><strong style="color: #1f2937;">${getIconSvg('straighten', 14, '#1f2937')} Longueur:</strong> ${report.longueur_km || 0} km</p>
                </div>
              </div>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });

    if (selectedLocation && onLocationSelect) {
      const tempMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
        icon: L.divIcon({
          html: '<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          className: 'temp-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapRef.current);

      markersRef.current.push(tempMarker);
    }
  }, [reports, selectedLocation]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg shadow-lg" />;
}
