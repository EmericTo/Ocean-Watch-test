/**
 * @fileoverview Gestion du stockage des images avec IndexedDB
 * 
 * Ce module gère le stockage et la récupération des images de signalements
 * en utilisant IndexedDB via idb-keyval pour persister les images localement.
 * 
 * @features
 * - Stockage des images en binaire dans IndexedDB
 * - Génération de clés uniques pour les images
 * - Conversion File -> Blob -> ObjectURL
 * - Nettoyage automatique des ObjectURLs
 * 
 * @usage Utilisé dans ReportPage et composants d'affichage
 * @dependencies idb-keyval pour IndexedDB
 */
import { set, get, del } from 'idb-keyval';


export const generateImageKey = (): string => {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


export const storeImage = async (file: File): Promise<string> => {
  const imageKey = generateImageKey();
  const blob = new Blob([file], { type: file.type });
  await set(imageKey, blob);
  return imageKey;
};

export const getImage = async (imageKey: string): Promise<string | null> => {
  try {
    const blob = await get(imageKey);
    if (blob instanceof Blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    return null;
  }
};

export const deleteImage = async (imageKey: string): Promise<void> => {
  try {
    await del(imageKey);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
  }
};


export const revokeImageUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};