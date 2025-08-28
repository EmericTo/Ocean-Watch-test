/**
 * @fileoverview Modal d'export avancé des données
 * 
 * Ce composant permet de configurer l'export des données avec différentes
 * options (format, période, données à inclure). Il s'agit d'une interface
 * pour les exports personnalisés des signalements.
 * 
 * @features
 * - Sélection du format d'export (CSV, Excel, JSON)
 * - Choix de la période (7j, 30j, 3 mois, année)
 * - Options des données à inclure (signalements, stats, photos)
 * - Interface utilisateur intuitive avec formulaire
 * 
 * @usage Utilisé dans DashboardPage.tsx
 * @props isOpen: boolean pour afficher/masquer la modal
 * @props onClose: callback pour fermer la modal
 * @props onExport: callback pour déclencher l'export
 * @note Actuellement les options sont simulées, seul CSV est implémenté
 */
import React from 'react';
import { Modal } from '../ui/Modal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport
}) => {
  const handleExport = () => {
    onExport();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export avancé des données">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>CSV</option>
            <option>Excel</option>
            <option>JSON</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
          <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>3 derniers mois</option>
            <option>Année complète</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Données à inclure</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Signalements</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-2" />
              <span className="text-sm">Statistiques</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">Photos</span>
            </label>
          </div>
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button 
          onClick={handleExport}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Exporter
        </button>
        <button 
          onClick={onClose}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </Modal>
  );
};