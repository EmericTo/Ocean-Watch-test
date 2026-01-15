/**
 * @fileoverview Composant de prévisualisation d'image
 * 
 * Ce composant affiche une prévisualisation d'une image uploadée avec
 * possibilité de suppression. Il gère les images sous forme de File
 * ou d'URL blob depuis IndexedDB.
 * 
 * @features
 * - Prévisualisation responsive de l'image
 * - Bouton de suppression avec confirmation
 * - Support File et URL blob
 * - Gestion des erreurs de chargement
 * - Interface accessible
 * 
 * @usage Utilisé dans ReportPage et détails de signalement
 * @dependencies Lucide React pour les icônes
 */
import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Edit, Trash2 } from 'lucide-react';

interface ImagePreviewProps {
  image: File | string | null;
  onRemove?: () => void;
  onModify?: () => void;
  className?: string;
  showRemoveButton?: boolean;
  showModifyButton?: boolean;
  alt?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onRemove,
  onModify,
  className = "",
  showRemoveButton = true,
  showModifyButton = true,
  alt = "Prévisualisation de l'image"
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!image) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    if (typeof image === 'string') {
      setImageUrl(image);
      setIsLoading(false);
    } else if (image instanceof File) {
      // Créer une URL pour le File
      const url = URL.createObjectURL(image);
      setImageUrl(url);
      setIsLoading(false);

      // Nettoyer l'URL quand le composant se démonte
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [image]);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!image) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {isLoading && (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
        </div>
      )}
      
      {hasError && (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Erreur de chargement</p>
          </div>
        </div>
      )}
      
      {imageUrl && !hasError && (
        <div className="space-y-3">
          <img
            src={imageUrl}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`rounded-lg shadow-md max-w-full h-auto ${isLoading ? 'hidden' : ''}`}
            style={{ maxHeight: '200px' }}
          />
          
          {(showModifyButton || showRemoveButton) && (
            <div className="flex justify-center space-x-2">
              {showModifyButton && onModify && (
                <button
                  type="button"
                  onClick={onModify}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center space-x-1"
                  title="Modifier la photo"
                >
                  <Edit className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
              )}
              
              {showRemoveButton && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md transition-colors flex items-center space-x-1"
                  title="Supprimer la photo"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Supprimer</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};