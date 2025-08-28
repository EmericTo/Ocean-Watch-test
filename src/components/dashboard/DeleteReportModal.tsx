/**
 * @fileoverview Modal de confirmation de suppression de signalement
 * 
 * Ce composant affiche une modal de confirmation avant la suppression
 * d'un signalement. Il montre les détails du signalement à supprimer
 * et demande une confirmation explicite de l'utilisateur.
 * 
 * @features
 * - Confirmation de suppression avec avertissement
 * - Aperçu du signalement (type, localisation, date)
 * - Boutons d'action (Supprimer/Annuler)
 * - Icône d'avertissement visuelle
 * - Utilise le composant Modal réutilisable
 * 
 * @usage Utilisé dans DashboardPage.tsx et MapPage.tsx
 * @props isOpen: boolean pour afficher/masquer la modal
 * @props onClose: callback pour fermer la modal
 * @props report: objet signalement à supprimer (ou null)
 * @props onConfirm: callback pour confirmer la suppression
 */
import React from 'react';
import { Trash2 } from 'lucide-react';
import { MockReport } from '../../lib/mockData';
import { Modal } from '../ui/Modal';

interface DeleteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MockReport | null;
  onConfirm: () => void;
}

export const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onConfirm
}) => {
  if (!report) return null;

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      plastic: 'Déchets plastiques',
      hydrocarbons: 'Hydrocarbures',
      organic: 'Déchets organiques',
      chemicals: 'Produits chimiques',
      other: 'Autre'
    };
    return types[type] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supprimer le signalement">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer ce signalement ? Cette action est irréversible.
          </p>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="text-sm">
          <p className="font-medium text-gray-800 mb-1">
            {getTypeLabel(report.type)}
          </p>
          <p className="text-gray-600 mb-2">
            📍 {report.location_address}
          </p>
          <p className="text-gray-600 text-xs">
            📅 {new Date(report.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
        >
          Supprimer définitivement
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors font-medium"
        >
          Annuler
        </button>
      </div>
    </Modal>
  );
};