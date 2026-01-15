/**
 * @fileoverview Modal de remerciement après signalement
 * 
 * Ce composant affiche un écran de remerciement après qu'un signalement
 * ait été créé avec succès. Il explique les étapes suivantes et propose
 * de créer un nouveau signalement.
 * 
 * @features
 * - Message de remerciement personnalisé
 * - Explication des étapes suivantes
 * - Bouton pour nouveau signalement
 * - Bouton pour voir la carte
 * - Animation d'apparition
 * 
 * @usage Utilisé dans ReportPage après création réussie
 * @dependencies Lucide React pour les icônes
 */
import React from 'react';
import { CheckCircle, MapPin, Plus, ArrowRight } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewReport: () => void;
  onViewMap: () => void;
  reportType?: string;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  onNewReport,
  onViewMap,
  reportType
}) => {
  if (!isOpen) return null;

  const getTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      plastic: 'déchets plastiques',
      hydrocarbons: 'hydrocarbures',
      organic: 'déchets organiques',
      chemicals: 'produits chimiques',
      other: 'pollution'
    };
    return types[type || ''] || 'pollution';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Merci pour votre signalement !
          </h2>
          <p className="text-emerald-100">
            Votre signalement {getTypeLabel(reportType)} a été enregistré
          </p>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sky-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Signalement enregistré</h3>
                <p className="text-sm text-gray-600">
                  Votre signalement est maintenant visible par toutes les équipes ONG
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Coordination des équipes</h3>
                <p className="text-sm text-gray-600">
                  Les équipes terrain vont évaluer et planifier une intervention
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Action sur le terrain</h3>
                <p className="text-sm text-gray-600">
                  Une équipe interviendra pour traiter la pollution signalée
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-sky-700">
              <strong>💡 Conseil :</strong> Vous pouvez suivre l'évolution de votre signalement 
              sur la carte interactive et dans le dashboard.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={onNewReport}
              className="w-full bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Faire un autre signalement</span>
            </button>
            
            <button
              onClick={onViewMap}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="w-5 h-5" />
              <span>Voir sur la carte</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Fermer cette fenêtre
          </button>
        </div>
      </div>
    </div>
  );
};