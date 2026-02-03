import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Report = Database['public']['Tables']['reports']['Row'];

const STATUS_COLORS = {
  reported: '#EF4444',
  in_progress: '#F59E0B',
  completed: '#10B981',
  rejected: '#6B7280',
};

const PRIORITY_ICONS = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
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
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    reports.forEach((report) => {
      if (!mapRef.current) return;

      const color = STATUS_COLORS[report.status];
      const priorityIcon = PRIORITY_ICONS[report.priority];

      const icon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">${priorityIcon}</div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${report.title}</h3>
            <p style="margin-bottom: 4px; color: #666; font-size: 14px;">${report.description}</p>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Status:</strong> <span style="color: ${color}; text-transform: capitalize;">${report.status.replace('_', ' ')}</span></p>
              <p style="margin-bottom: 4px; font-size: 12px;"><strong>Priority:</strong> <span style="text-transform: capitalize;">${report.priority}</span></p>
              <p style="font-size: 12px; color: #888;">${new Date(report.created_at).toLocaleDateString()}</p>
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
