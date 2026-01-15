/**
 * @fileoverview Utilitaires de géolocalisation
 * 
 * Ce module fournit des fonctions pour obtenir la position GPS de l'utilisateur
 * et convertir les coordonnées en adresses lisibles via le géocodage inverse.
 * 
 * @features
 * - Géolocalisation GPS avec gestion d'erreurs
 * - Géocodage inverse (coordonnées -> adresse)
 * - Gestion des permissions et timeouts
 * - Messages d'erreur localisés
 * 
 * @usage Utilisé dans ReportPage pour la géolocalisation automatique
 * @dependencies API Geolocation native, Nominatim pour le géocodage
 */

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}


export const getCurrentPosition = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'La géolocalisation n\'est pas supportée par ce navigateur'
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Erreur de géolocalisation';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible';
            break;
          case error.TIMEOUT:
            message = 'Timeout de géolocalisation';
            break;
        }
        
        reject({
          code: error.code,
          message
        });
      },
      options
    );
  });
};


export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18'
    }).toString();

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'Accept': 'application/json' },
    });
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur de géocodage inverse:', error);
    return null;
  }
};