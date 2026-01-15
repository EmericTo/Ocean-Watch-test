/**
 * @fileoverview Page de création de signalements de pollution
 * 
 * Cette page permet aux équipes ONG de créer de nouveaux signalements de pollution
 * côtière. Elle inclut un formulaire complet avec géolocalisation, géocodage d'adresses,
 * upload de photos et validation des données.
 * 
 * @features
 * - Formulaire de signalement avec validation
 * - Géolocalisation GPS automatique
 * - Géocodage d'adresses avec Nominatim
 * - Upload de photos (simulation)
 * - Types de pollution prédéfinis
 * - Feedback utilisateur avec notifications
 * 
 * @usage Route "/report" dans App.tsx
 * @dependencies mockData pour la sauvegarde, Lucide React pour les icônes
 */
import React, { useState, useEffect } from 'react';
import { Camera, Send, Navigation, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createMockReport } from '../lib/mockData';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { LocationPicker } from '../components/LocationPicker';
import { ImagePreview } from '../components/ImagePreview';
import { ThankYouModal } from '../components/ThankYouModal';
import { getCurrentPosition, reverseGeocode } from '../lib/geolocation';
import { storeImage } from '../lib/imageStorage';

// Fonction de géocodage avec Nominatim (OpenStreetMap) - déplacée vers geolocation.ts
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const params = new URLSearchParams({
      q: address,
      format: 'jsonv2',
      addressdetails: '1',
      countrycodes: 'fr',
      limit: '1',
    }).toString();

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      const best = data[0];
      const result = {
        lat: Number(best.lat),
        lng: Number(best.lon),
      };
      
      if (!Number.isFinite(result.lat) || !Number.isFinite(result.lng)) {
        return null;
      }
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
};

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    coordinates: { lat: 0, lng: 0 }
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [lastCreatedReportType, setLastCreatedReportType] = useState<string>('');

  const pollutionTypes = [
    { value: 'plastic', label: 'Déchets plastiques', color: 'bg-rose-500' },
    { value: 'hydrocarbons', label: 'Hydrocarbures', color: 'bg-amber-500' },
    { value: 'organic', label: 'Déchets organiques', color: 'bg-emerald-500' },
    { value: 'chemicals', label: 'Produits chimiques', color: 'bg-violet-500' },
    { value: 'other', label: 'Autre', color: 'bg-gray-500' }
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const handleModifyPhoto = () => { 
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      coordinates: { lat, lng }
    }));
    setAddressValidated(true);
  };

  const handleLocationFromPicker = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      coordinates: { lat: location.lat, lng: location.lng }
    }));
    setAddressValidated(true);
  };

  const handleLocateUser = async () => {
    setIsLocating(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position;
      const address = await reverseGeocode(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        location: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        coordinates: { lat: latitude, lng: longitude }
      }));
      setAddressValidated(true);
      
    } catch (error: any) {
      alert(`Erreur de géolocalisation: ${error.message}`);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      let finalCoordinates = formData.coordinates;
      let photoKey: string | undefined;

      if (formData.coordinates.lat === 0 && formData.coordinates.lng === 0 && formData.location) {
        const geocoded = await geocodeAddress(formData.location);
        if (geocoded) {
          finalCoordinates = geocoded;
        } else {
          finalCoordinates = { lat: 46.2276, lng: 2.2137 }; 
        }
      }
      
      if (photo) {
        photoKey = await storeImage(photo);
      }
      
      await createMockReport({
        type: formData.type as any,
        description: formData.description,
        location_lat: finalCoordinates.lat,
        location_lng: finalCoordinates.lng,
        location_address: formData.location,
        photo_key: photoKey
      });

      setLastCreatedReportType(formData.type);
      setShowThankYou(true);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi du signalement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ type: '', description: '', location: '', coordinates: { lat: 0, lng: 0 } });
    setPhoto(null);
    setAddressValidated(false);
  };

  const handleNewReport = () => {
    resetForm();
    setShowThankYou(false);
  };

  const handleViewMap = () => {
    setShowThankYou(false);
    navigate('/map');
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    resetForm();
  };

  // Reset validation when address changes manually
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    if (addressValidated && value !== formData.location) {
      setAddressValidated(false);
      setFormData({ type: '', description: '', location: '', coordinates: { lat: 0, lng: 0 } });
      setPhoto(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-emerald-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white mb-2">Nouveau signalement terrain</h1>
              <p className="text-sky-200">Signalement interne ONG - Pollution observée par vos équipes</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Type de pollution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de pollution *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pollutionTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.type === type.value
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={formData.type === type.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full mr-3 ${type.color}`}></div>
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description détaillée *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Décrivez la pollution observée (taille, quantité, état, etc.)"
                  required
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo (optionnelle)
                </label>
                
                {photo ? (
                  <div className="space-y-3">
                    <ImagePreview 
                      image={photo} 
                      onRemove={handleRemovePhoto}
                      onModify={handleModifyPhoto}
                      className="w-full max-w-xs"
                    />
                    {/* Input caché pour la modification */}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      key={photo ? photo.name : 'photo-input'} // Force re-render pour permettre de sélectionner le même fichier
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Cliquez pour ajouter</span> une photo
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation *
                </label>
                
                <AddressAutocomplete
                  value={formData.location}
                  onChange={handleLocationChange}
                  onAddressSelect={handleAddressSelect}
                  placeholder="Saisissez l'adresse du lieu de pollution"
                />
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleLocateUser}
                    disabled={isLocating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isLocating ? 'Localisation...' : 'Me géolocaliser'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                  >
                    <Map className="w-4 h-4" />
                    <span>Choisir sur la carte</span>
                  </button>
                </div>
                
                <p className="mt-2 text-xs text-gray-500">
                  Exemple: Plage de Biarritz, 64200 Biarritz
                </p>
              </div>

              {/* Bouton d'envoi */}
              <div className="pt-4">
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-sky-700">
                    ℹ️ <strong>Signalement interne ONG :</strong> Ce signalement sera ajouté à votre base de données 
                    interne et visible par toutes vos équipes pour coordination des actions.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.type || !formData.description || !formData.location}
                  className="w-full bg-gradient-to-r from-sky-700 to-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-sky-800 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-5 h-5 mr-2" />
                      Enregistrer le signalement
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationFromPicker}
        initialLocation={formData.coordinates.lat !== 0 ? formData.coordinates : undefined}
      />

      {/* Thank You Modal */}
      <ThankYouModal
        isOpen={showThankYou}
        onClose={handleThankYouClose}
        onNewReport={handleNewReport}
        onViewMap={handleViewMap}
        reportType={lastCreatedReportType}
      />
    </>
  );
};