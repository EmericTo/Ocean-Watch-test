/**
 * @fileoverview Grille des statistiques du dashboard
 * 
 * Ce composant affiche les statistiques principales des signalements
 * sous forme de cartes avec valeurs numériques. Il gère l'état de
 * chargement avec des animations de skeleton.
 * 
 * @features
 * - 4 cartes de statistiques principales
 * - Animation de chargement (skeleton)
 * - Layout responsive (1-2-4 colonnes)
 * - Valeurs numériques mises en évidence
 * 
 * @usage Utilisé dans DashboardPage.tsx
 * @props stats: objet avec total, new, resolved, inProgress, weekly
 * @props loading: boolean pour l'état de chargement
 */
import React from 'react';

interface StatsGridProps {
  stats: {
    total: number;
    new: number;
    resolved: number;
    inProgress: number;
    weekly: number;
  };
  loading: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading }) => {
  const statsDisplay = [
    { label: 'Signalements totaux', value: stats.total },
    { label: 'Nouveaux cette semaine', value: stats.weekly },
    { label: 'Résolus', value: stats.resolved },
    { label: 'En cours', value: stats.inProgress }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsDisplay.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          {loading && (
            <div className="animate-pulse bg-gray-200 h-4 w-16 rounded mt-1"></div>
          )}
        </div>
      ))}
    </div>
  );
};