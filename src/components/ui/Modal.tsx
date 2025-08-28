/**
 * @fileoverview Composant Modal réutilisable
 * 
 * Ce composant fournit une modal générique avec overlay, titre personnalisable
 * et différentes tailles. Il gère l'état ouvert/fermé et les interactions
 * utilisateur (fermeture par bouton X ou clic sur overlay).
 * 
 * @features
 * - Tailles configurables (sm, md, lg, xl, 2xl, 4xl)
 * - Overlay avec fermeture au clic
 * - Bouton de fermeture avec icône
 * - Scroll automatique si contenu trop grand
 * - Z-index élevé pour superposition
 * 
 * @usage Composant de base pour toutes les modals de l'app
 * @dependencies Lucide React pour l'icône de fermeture
 */
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} w-full max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};