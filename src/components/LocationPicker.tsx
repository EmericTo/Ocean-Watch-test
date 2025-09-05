/**
 * @fileoverview Composant de sélection de localisation avec carte
 * 
 * Ce composant permet de sélectionner une localisation précise sur une carte
 * interactive. L'utilisateur peut cliquer sur la carte pour placer un marqueur
 * et obtenir les coordonnées exactes.
 * 
 * @features
 * - Carte interactive Leaflet
 * - Placement de marqueur par clic
 * - Géocodage inverse automatique
 * - Centrage sur la position utilisateur
 * - Interface modale responsive
 * 
 * @usage Utilisé dans ReportPage pour la sélection précise de localisation
 * @dependencies Leaflet, geolocation utils
 */
import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { X, MapPin, Navigation } from 'lucide-react';
import { getCurrentPosition, reverseGeocode } from '../lib/geolocation';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  
  const createMarkerIcon = () => {
    return L.divIcon({
      className: 'custom-location-marker',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Initialiser la carte
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([46.2276, 2.2137], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      const marker = L.marker([lat, lng], { icon: createMarkerIcon() }).addTo(map);
      markerRef.current = marker;
      
      setSelectedLocation({ lat, lng });
      setIsLoadingAddress(true);
      const geocodedAddress = await reverseGeocode(lat, lng);
      setAddress(geocodedAddress || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setIsLoadingAddress(false);
    });

    mapInstanceRef.current = map;

    
    if (initialLocation) {
      map.setView([initialLocation.lat, initialLocation.lng], 15);
      const marker = L.marker([initialLocation.lat, initialLocation.lng], { 
        icon: createMarkerIcon() 
      }).addTo(map);
      markerRef.current = marker;
      setSelectedLocation(initialLocation);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialLocation]);

  // Géolocaliser l'utilisateur
  const handleLocateUser = async () => {
    if (!mapInstanceRef.current) return;
    
    setIsLocating(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position;
      
      mapInstanceRef.current.setView([latitude, longitude], 15);
      
     
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      
      
      const marker = L.marker([latitude, longitude], { 
        icon: createMarkerIcon() 
      }).addTo(mapInstanceRef.current);
      markerRef.current = marker;
      
      setSelectedLocation({ lat: latitude, lng: longitude });
      
      
      setIsLoadingAddress(true);
      const geocodedAddress = await reverseGeocode(latitude, longitude);
      setAddress(geocodedAddress || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setIsLoadingAddress(false);
      
    } catch (error: any) {
      alert(`Erreur de géolocalisation: ${error.message}`);
    } finally {
      setIsLocating(false);
    }
  };

 
  const handleConfirm = () => {
    if (selectedLocation && address) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Sélectionner la localisation</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Cliquez sur la carte pour sélectionner l'emplacement exact de la pollution
            </p>
            <button
              onClick={handleLocateUser}
              disabled={isLocating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{isLocating ? 'Localisation...' : 'Me localiser'}</span>
            </button>
          </div>
          
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200 mb-4">
            <div ref={mapRef} className="h-full w-full" />
          </div>
          
          {selectedLocation && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Adresse sélectionnée</p>
                  {isLoadingAddress ? (
                    <p className="text-sm text-gray-600">Recherche de l'adresse...</p>
                  ) : (
                    <p className="text-sm text-gray-600">{address}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Coordonnées: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-white">
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation || isLoadingAddress}
            className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Confirmer la localisation
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};