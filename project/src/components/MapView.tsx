import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
          <div style="min-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${report.title}</h3>
            <p style="margin-bottom: 4px; color: #666; font-size: 14px;">${report.description}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Date:</strong> ${new Date(report.created_at).toLocaleDateString('fr-FR')}</p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Status:</strong> <span style="color: ${color}; text-transform: capitalize;">${getStatusText(report.status)}</span></p>
              ${report.surface_m2 ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Surface:</strong> ${report.surface_m2.toLocaleString('fr-FR')} m²</p>` : ''}
              ${report.budget ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Budget:</strong> ${report.budget.toLocaleString('fr-FR')} €</p>` : ''}
              ${report.entreprise ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Entreprise:</strong> ${report.entreprise}</p>` : ''}
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Gravité:</strong> <span style="text-transform: capitalize;">${getPriorityText(report.priority)}</span></p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Longueur:</strong> ${report.longueur_km || 0} km</p>
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
