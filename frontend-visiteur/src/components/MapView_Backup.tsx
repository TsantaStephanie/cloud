import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getRouteIcon } from '../lib/api';
import { syncService } from '../lib/syncService';
import { RouteEndommagee } from '../types/firebase';

// Interface unifiée pour supporter les deux formats de données
interface UnifiedReport {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  gravite?: string;
  statut?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  longueur_km?: number;
  longueurKm?: number;
  surface_m2?: number;
  surfaceM2?: number;
  budget?: number;
  entreprise?: string;
  created_at?: string;
  dateCreation?: Date;
  updated_at?: string;
  dateMiseAJour?: Date;
}

interface MapViewProps {
  onLocationSelect?: (lat: number, lng: number, locationName: string) => void;
  reports?: UnifiedReport[];
  center?: [number, number];
  zoom?: number;
}

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
    'faible': 'Faible',
    'moyenne': 'Moyenne',
    'elevee': 'Élevée',
    'critique': 'Critique',
  };
  return priorityMap[priority] || priority;
};

export default function MapView({ onLocationSelect, reports = [], center, zoom = 13 }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [realtimeReports, setRealtimeReports] = useState<RouteEndommagee[]>([]);

  const defaultCenter: [number, number] = center || [-18.8792, 47.5079];

  // Effet pour la synchronisation en temps réel
  useEffect(() => {
    console.log('🚀 Initialisation de la synchronisation en temps réel...');
    
    // Démarrer l'écoute des mises à jour
    const unsubscribeRoutes = syncService.listenToRouteUpdates((routes: RouteEndommagee[]) => {
      console.log('🔄 Mise à jour des routes en temps réel:', routes.length);
      setRealtimeReports(routes);
      
      // Mettre à jour les marqueurs sur la carte
      if (mapRef.current) {
        updateMarkersOnMap(routes);
      }
    });
    
    // Écouter les notifications système
    const unsubscribeSystem = syncService.listenToSystemNotifications((notification) => {
      console.log('📢 Notification système reçue:', notification);
      
      // Si la notification vient de l'application mobile
      if (notification.source === 'mobile-app' && notification.action === 'new-report') {
        console.log('📱 Nouveau signalement depuis l\'application mobile!');
        // Le listener de routes s'occupera déjà de la mise à jour
      }
    });
    
    // Nettoyer les listeners lors du démontage
    return () => {
      console.log('🧹 Nettoyage des listeners de synchronisation...');
      unsubscribeRoutes();
      unsubscribeSystem();
    };
  }, []);

  // Fonction pour mettre à jour les marqueurs
  const updateMarkersOnMap = (routes: RouteEndommagee[]) => {
    if (!mapRef.current) return;
    
    // Supprimer les marqueurs existants
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Ajouter les nouveaux marqueurs
    routes.forEach((route, index) => {
      console.log(`Report ${index + 1}:`, route.description, route.gravite);
      
      // Utiliser les nouvelles icônes SVG basées sur le type de problème
      const routeIcon = getRouteIcon(route.description || '', route.gravite);
      const color = routeIcon.color;
      const iconSvg = routeIcon.iconSvg;

      console.log('Icône SVG choisie:', routeIcon.iconType, 'Couleur:', color);

      const icon = L.divIcon({
        html: iconSvg,
        className: 'custom-svg-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      console.log('Création du marqueur avec SVG:', routeIcon.iconType);

      const marker = L.marker([route.latitude, route.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${route.description || 'Sans description'}</h3>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Date:</strong> ${new Date(route.dateCreation).toLocaleDateString('fr-FR')}</p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Status:</strong> <span style="color: ${color}; text-transform: capitalize;">${getStatusText(route.statut)}</span></p>
              ${route.surfaceM2 ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Surface:</strong> ${route.surfaceM2.toLocaleString('fr-FR')} m²</p>` : ''}
              ${route.budget ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Budget:</strong> ${route.budget.toLocaleString('fr-FR')} €</p>` : ''}
              ${route.entreprise ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Entreprise:</strong> ${route.entreprise}</p>` : ''}
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Gravité:</strong> <span style="text-transform: capitalize;">${getPriorityText(route.gravite)}</span></p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Longueur:</strong> ${route.longueurKm || 0} km</p>
            </div>
          </div>
        `);

      markersRef.current.push(marker);
    });
  };

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
  }, [defaultCenter, zoom, onLocationSelect]);

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

      console.log(`Report ${index + 1}:`, report.description, report.gravite || report.priority);
      
      // Utiliser les nouvelles icônes SVG basées sur le type de problème
      console.log('Description reçue:', report.description);
      console.log('Gravité reçue:', report.gravite || report.priority);
      
      // Utiliser gravite si disponible, sinon priority (compatibilité)
      const severity = report.gravite || report.priority || 'moyenne';
      const routeIcon = getRouteIcon(report.description || '', severity);
      const color = routeIcon.color;
      const iconSvg = routeIcon.iconSvg;

      console.log('Icône SVG choisie:', routeIcon.iconType, 'Couleur:', color);

      const icon = L.divIcon({
        html: iconSvg,
        className: 'custom-svg-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      console.log('Création du marqueur avec SVG:', routeIcon.iconType);
      console.log('Report data:', report); // Debug pour voir les données

      const marker = L.marker([report.latitude, report.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${report.title || report.description || 'Sans titre'}</h3>
            <p style="margin-bottom: 4px; color: #666; font-size: 14px;">${report.description || 'Sans description'}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Date:</strong> ${new Date(report.dateCreation || report.created_at).toLocaleDateString('fr-FR')}</p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Status:</strong> <span style="color: ${color}; text-transform: capitalize;">${getStatusText(report.statut || report.status)}</span></p>
              ${report.surfaceM2 || report.surface_m2 ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Surface:</strong> ${(report.surfaceM2 || report.surface_m2).toLocaleString('fr-FR')} m²</p>` : ''}
              ${report.budget ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Budget:</strong> ${report.budget.toLocaleString('fr-FR')} €</p>` : ''}
              ${report.entreprise ? `<p style="margin-bottom: 4px; font-size: 12px;"><strong>Entreprise:</strong> ${report.entreprise}</p>` : ''}
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Gravité:</strong> <span style="text-transform: capitalize;">${getPriorityText(severity)}</span></p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Longueur:</strong> ${(report.longueurKm || report.longueur_km || 0)} km</p>
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
  }, [reports, selectedLocation, onLocationSelect]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-lg shadow-lg" />;
}
