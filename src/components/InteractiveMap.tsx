/**
 * @fileoverview Composant de carte interactive avec Leaflet
 * 
 * Ce composant affiche une carte interactive des signalements de pollution
 * avec marqueurs colorés, popups informatifs et légende. Il gère la sélection
 * des signalements et le filtrage par type de pollution.
 * 
 * @features
 * - Carte Leaflet avec tuiles OpenStreetMap
 * - Marqueurs personnalisés colorés par type de pollution
 * - Popups avec détails des signalements
 * - Sélection visuelle des marqueurs
 * - Légende des types de pollution
 * - Auto-zoom sur les marqueurs
 * 
 * @usage Utilisé dans MapPage.tsx
 * @dependencies Leaflet, types MockReport
 */
import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet/dist/leaflet-src.esm.js';
import 'leaflet/dist/leaflet.css';

const pollutionTypeColors = {
  plastic: '#ef4444', // red-500
  hydrocarbons: '#f59e0b', // amber-500
  organic: '#10b981', // emerald-500
  chemicals: '#8b5cf6', // violet-500
  other: '#6b7280' // gray-500
};

const pollutionTypeLabels = {
  plastic: 'Déchets plastiques',
  hydrocarbons: 'Hydrocarbures',
  organic: 'Déchets organiques',
  chemicals: 'Produits chimiques',
  other: 'Autre'
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-red-100 text-red-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'new': return 'Nouveau';
    case 'in-progress': return 'En cours';
    case 'resolved': return 'Résolu';
    default: return 'Inconnu';
  }
};

interface InteractiveMapProps {
  reports: MockReport[];
  selectedReport: MockReport | null;
  onReportSelect: (report: MockReport) => void;
  filteredType: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  reports,
  selectedReport,
  onReportSelect,
  filteredType
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const isMapInitialized = useRef(false);

  // Filter reports based on selected type
  const filteredReports = filteredType === 'all' 
    ? reports 
    : reports.filter(report => report.type === filteredType);

  // Create custom icon for each pollution type
  const createCustomIcon = (type: string, isSelected: boolean = false) => {
    const color = pollutionTypeColors[type as keyof typeof pollutionTypeColors];
    const size = isSelected ? 35 : 25;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
            opacity: 0.9;
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || isMapInitialized.current) return;

    // Create map centered on French Atlantic coast
    try {
      const map = L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        attributionControl: true
      }).setView([44.5, -1.0], 8);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      isMapInitialized.current = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Erreur lors de la suppression de la carte:', error);
        }
        mapInstanceRef.current = null;
        isMapInitialized.current = false;
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      try {
        if (mapInstanceRef.current && marker) {
          mapInstanceRef.current.removeLayer(marker);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du marqueur:', error);
      }
    });
    markersRef.current = [];

    // Add new markers
    filteredReports.forEach(report => {
      if (!mapInstanceRef.current || !isMapInitialized.current) return;
      
      // Debug des coordonnées
      console.debug('Création marqueur pour:', report.location_address);
      console.debug('Coordonnées:', report.location_lat, report.location_lng, typeof report.location_lat, typeof report.location_lng);
      
      const lat = Number(report.location_lat);
      const lng = Number(report.location_lng);
      
      // Garde-fou : ne pas créer le marqueur si les coordonnées sont invalides
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.error('Coordonnées invalides pour le rapport:', report.id, 'lat:', lat, 'lng:', lng);
        return;
      }
      
      console.debug('Coordonnées validées:', lat, lng);

      const isSelected = selectedReport?.id === report.id;
      
      try {
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(report.type, isSelected)
        });

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-64">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-semibold text-gray-800 text-sm">
                ${pollutionTypeLabels[report.type as keyof typeof pollutionTypeLabels]}
              </h4>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}">
                ${getStatusLabel(report.status)}
              </span>
            </div>
            
            <div class="space-y-2 text-xs text-gray-600">
              <div class="flex items-start space-x-2">
                <span class="text-gray-500">📍</span>
                <span class="font-medium text-gray-700">${report.location_address}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-gray-500">📅</span>
                <span>${new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-gray-500">👤</span>
                <span>${report.organization_name || 'Équipe terrain'}</span>
              </div>
              <div class="mt-3 pt-2 border-t border-gray-100">
                <p class="text-gray-700 text-sm leading-relaxed">
                  ${report.description.length > 100 
                    ? `${report.description.substring(0, 100)}...` 
                    : report.description
                  }
                </p>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        // Handle marker click
        marker.on('click', () => {
          onReportSelect(report);
        });

        if (mapInstanceRef.current) {
          marker.addTo(mapInstanceRef.current);
          markersRef.current.push(marker);
        }
      } catch (error) {
        console.error('Erreur lors de la création du marqueur:', error);
      }
    });

    // Fit map to show all markers if there are any
    if (filteredReports.length > 0 && markersRef.current.length > 0 && mapInstanceRef.current) {
      try {
        const group = new L.FeatureGroup(markersRef.current);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds.pad(0.1));
        }
      } catch (error) {
        console.error('Erreur lors du fit bounds:', error);
      }
    }
  }, [filteredReports, selectedReport, onReportSelect]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized.current) return;

    markersRef.current.forEach((marker, index) => {
      const report = filteredReports[index];
      if (report && marker) {
        try {
          const isSelected = selectedReport?.id === report.id;
          marker.setIcon(createCustomIcon(report.type, isSelected));
        } catch (error) {
          console.error('Erreur lors de la mise à jour de l\'icône:', error);
        }
      }
    });
  }, [selectedReport, filteredReports]);

  return (
    <div className="h-full w-full relative rounded-lg overflow-hidden">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Loading overlay */}
      {filteredReports.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun signalement</h3>
            <p className="text-gray-600">Aucun signalement trouvé pour ce type de pollution</p>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-1000">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Légende</h4>
        <div className="space-y-1">
          {Object.entries(pollutionTypeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: pollutionTypeColors[type as keyof typeof pollutionTypeColors] }}
              ></div>
              <span className="text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for popups */}
      <style jsx>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};