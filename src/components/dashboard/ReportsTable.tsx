/**
 * @fileoverview Tableau de gestion des signalements
 * 
 * Ce composant affiche la liste des signalements sous forme de tableau
 * avec possibilité de modifier le statut et de supprimer les entrées.
 * Il gère l'état de chargement et les interactions utilisateur.
 * 
 * @features
 * - Tableau responsive avec colonnes principales
 * - Dropdown pour changer le statut des signalements
 * - Bouton de suppression avec icône
 * - Formatage des dates en français
 * - État de chargement avec spinner
 * - Message si aucun signalement
 * 
 * @usage Utilisé dans DashboardPage.tsx
 * @props reports: array des signalements à afficher
 * @props loading: boolean pour l'état de chargement
 * @props onStatusUpdate: callback pour changement de statut
 * @props onDeleteReport: callback pour suppression
 */
import React from 'react';
import { Trash2 } from 'lucide-react';
import { MockReport } from '../../lib/mockData';

interface ReportsTableProps {
  reports: MockReport[];
  loading: boolean;
  onStatusUpdate: (reportId: string, status: MockReport['status']) => void;
  onDeleteReport: (report: MockReport) => void;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  loading,
  onStatusUpdate,
  onDeleteReport
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Signalements récents ({reports.length})
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-xs md:text-sm font-medium text-gray-600 min-w-[120px]">Type</th>
                <th className="text-left p-2 text-xs md:text-sm font-medium text-gray-600 min-w-[150px]">Localisation</th>
                <th className="text-left p-2 text-xs md:text-sm font-medium text-gray-600 min-w-[100px]">Date</th>
                <th className="text-left p-2 text-xs md:text-sm font-medium text-gray-600 min-w-[100px]">Statut</th>
                <th className="text-left p-2 text-xs md:text-sm font-medium text-gray-600 min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-xs md:text-sm text-gray-800">{getTypeLabel(report.type)}</td>
                  <td className="p-2 text-xs md:text-sm text-gray-800 max-w-[200px] truncate">{report.location_address}</td>
                  <td className="p-2 text-xs md:text-sm text-gray-600">
                    {new Date(report.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-2">
                    <select
                      value={report.status}
                      onChange={(e) => onStatusUpdate(report.id, e.target.value as MockReport['status'])}
                      className={`px-2 py-1 rounded-full text-xs border-0 min-w-[80px] ${getStatusColor(report.status)}`}
                    >
                      <option value="new">Nouveau</option>
                      <option value="in-progress">En cours</option>
                      <option value="resolved">Résolu</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => onDeleteReport(report)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
                      title="Supprimer le signalement"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {reports.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Aucun signalement trouvé
            </p>
          )}
        </div>
      )}
    </div>
  );
};