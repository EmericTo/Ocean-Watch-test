/**
 * @fileoverview Graphique des types de pollution
 * 
 * Ce composant affiche la répartition des types de pollution sous forme
 * de cartes avec pourcentages et bouton d'export CSV.
 * 
 * @features
 * - Cartes par type de pollution avec icônes et couleurs
 * - Calcul automatique des pourcentages
 * - Bouton d'export CSV intégré
 * 
 * @usage Utilisé dans DashboardPage.tsx
 * @props pollutionTypeData: objet avec compteurs par type
 * @props recentReports: array des signalements pour les zones
 * @props onExportCSV: fonction de callback pour l'export
 */
import React from 'react';
import { Download } from 'lucide-react';
import { MockReport } from '../../lib/mockData';

interface PollutionTypeChartProps {
  pollutionTypeData: { [key: string]: number };
  recentReports: MockReport[];
  onExportCSV: () => void;
}

export const PollutionTypeChart: React.FC<PollutionTypeChartProps> = ({
  pollutionTypeData,
  onExportCSV
}) => {
  const typeLabels: { [key: string]: { label: string; color: string; icon: string } } = {
    plastic: { label: 'Plastiques', color: 'bg-red-500', icon: '🔴' },
    hydrocarbons: { label: 'Hydrocarbures', color: 'bg-orange-500', icon: '🟠' },
    organic: { label: 'Organiques', color: 'bg-green-500', icon: '🟢' },
    chemicals: { label: 'Chimiques', color: 'bg-purple-500', icon: '🟣' },
    other: { label: 'Autres', color: 'bg-gray-500', icon: '⚫' }
  };

  const total = Object.values(pollutionTypeData).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Types de pollution</h2>
        <button 
          onClick={onExportCSV}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Exporter CSV</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(pollutionTypeData)
          .filter(([type]) => typeLabels[type]) // Filtrer seulement les types reconnus
          .map(([type, count]) => {
          const typeInfo = typeLabels[type];
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          
          return (
            <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{typeInfo.icon}</div>
              <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
              <div className="text-sm text-gray-600 mb-2">{typeInfo.label}</div>
              <div className="text-xs text-gray-500 mb-3">{percentage}%</div>
              <div className={`h-2 ${typeInfo.color} rounded-full opacity-30`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};