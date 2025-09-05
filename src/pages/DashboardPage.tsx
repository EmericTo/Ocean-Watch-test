/**
 * @fileoverview Dashboard de gestion interne pour les ONG
 * 
 * Cette page fournit une vue d'ensemble complète des signalements avec
 * statistiques, graphiques, gestion des équipes et exports de données.
 * C'est l'interface principale pour les gestionnaires d'ONG.
 * 
 * @features
 * - Statistiques en temps réel
 * - Graphiques de répartition des pollutions
 * - Tableau de gestion des signalements
 * - Gestion des équipes Surfrider
 * - Export CSV des données
 * - Suppression avec confirmation
 * 
 * @usage Route "/dashboard" dans App.tsx
 * @dependencies Composants dashboard modulaires, mockData
 */
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Bell, Activity } from 'lucide-react';
import { getMockReports, updateMockReportStatus, MockReport, getPollutionTypeStats, deleteMockReport } from '../lib/mockData';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { PollutionTypeChart } from '../components/dashboard/PollutionTypeChart';
import { ReportsTable } from '../components/dashboard/ReportsTable';
import { DeleteReportModal } from '../components/dashboard/DeleteReportModal';
import { TeamsManagement } from '../components/dashboard/TeamsManagement';

interface Team {
  id: string;
  name: string;
  members: number;
  specialty: string;
  contact: string;
}

export const DashboardPage: React.FC = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    resolved: 0,
    inProgress: 0,
    weekly: 0
  });
  const [recentReports, setRecentReports] = useState<MockReport[]>([]);
  const [pollutionTypeData, setPollutionTypeData] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<MockReport | null>(null);
  const [surfriderTeams, setSurfriderTeams] = useState<Team[]>([
    {
      id: 'biarritz',
      name: 'Équipe Biarritz',
      members: 12,
      specialty: 'Nettoyage plages',
      contact: 'biarritz@surfrider.eu'
    },
    {
      id: 'royan',
      name: 'Équipe Royan',
      members: 8,
      specialty: 'Sensibilisation',
      contact: 'royan@surfrider.eu'
    },
    {
      id: 'lacanau',
      name: 'Équipe Lacanau',
      members: 15,
      specialty: 'Éducation',
      contact: 'lacanau@surfrider.eu'
    },
    {
      id: 'oleron',
      name: 'Équipe Oléron',
      members: 6,
      specialty: 'Surveillance',
      contact: 'oleron@surfrider.eu'
    },
    {
      id: 'urgence',
      name: 'Équipe Intervention Urgence',
      members: 4,
      specialty: 'Intervention rapide',
      contact: 'urgence@surfrider.eu'
    }
  ]);

  // Function to calculate stats from current reports
  const calculateStatsFromReports = (reports: MockReport[]) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyNewReports = reports.filter(report => {
      const reportDate = new Date(report.created_at);
      return reportDate >= oneWeekAgo && report.status === 'new';
    }).length;

    return {
      total: reports.length,
      new: reports.filter(r => r.status === 'new').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      inProgress: reports.filter(r => r.status === 'in-progress').length,
      weekly: weeklyNewReports
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Load reports
        const reports = await getMockReports();
        setRecentReports(reports);
        
        // Calculate stats from reports
        const calculatedStats = calculateStatsFromReports(reports);
        setStats(calculatedStats);
        
        // Load pollution type data
        const typeStats = await getPollutionTypeStats();
        setPollutionTypeData(typeStats);
        
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStatusUpdate = async (reportId: string, newStatus: MockReport['status']) => {
    try {
      await updateMockReportStatus(reportId, newStatus);
      setRecentReports(prev => {
        const updatedReports = prev.map(report => 
          report.id === reportId 
            ? { ...report, status: newStatus }
            : report
        );
        
        // Recalculate stats with updated reports
        const newStats = calculateStatsFromReports(updatedReports);
        setStats(newStats);
        
        return updatedReports;
      });
      
      // Also refresh pollution type data if needed
      const newTypeStats = await getPollutionTypeStats();
      setPollutionTypeData(newTypeStats);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteReport = async (report: MockReport) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteMockReport(reportToDelete.id);
      
      // Update local state
      setRecentReports(prev => {
        const updatedReports = prev.filter(report => report.id !== reportToDelete.id);
        
        // Recalculate stats with updated reports
        const newStats = calculateStatsFromReports(updatedReports);
        setStats(newStats);
        
        return updatedReports;
      });
      
      // Refresh pollution type data
      const newTypeStats = await getPollutionTypeStats();
      setPollutionTypeData(newTypeStats);
      
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleExportCSV = () => {
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

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'new': return 'Nouveau';
        case 'in-progress': return 'En cours';
        case 'resolved': return 'Résolu';
        default: return 'Inconnu';
      }
    };

    // Simulation d'export CSV
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Type,Localisation,Statut,Description\n" +
      recentReports.map(report => 
        `${new Date(report.created_at).toLocaleDateString('fr-FR')},${getTypeLabel(report.type)},${report.location_address},${getStatusLabel(report.status)},"${report.description}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `signalements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Team management handlers
  const handleCreateTeam = (teamData: Omit<Team, 'id'>) => {
    const team: Team = {
      id: Date.now().toString(),
      ...teamData
    };
    setSurfriderTeams(prev => [...prev, team]);
  };

  const handleModifyTeam = (teamId: string, updates: Partial<Team>) => {
    setSurfriderTeams(prev => 
      prev.map(team => 
        team.id === teamId 
          ? { ...team, ...updates }
          : team
      )
    );
  };

  const handleDeleteTeam = (teamId: string) => {
    setSurfriderTeams(prev => prev.filter(team => team.id !== teamId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Dashboard ONG - Gestion Interne
          </h1>
          <p className="text-gray-600">
            Tableau de bord interne : analysez vos signalements terrain et coordonnez vos équipes
          </p>
        </div>

        {/* ONG Access Notice */}
        <div className="bg-gradient-to-r from-sky-600 to-emerald-500 text-white p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">🌊 Outil Interne ONG - Gestion Centralisée</h2>
              <div className="text-sky-100 space-y-1">
                <p>✓ Signalements terrain de vos équipes</p>
                <p>✓ Coordination des interventions</p>
                <p>✓ Suivi des actions et résolutions</p>
                <p>✓ Exports pour rapports d'activité</p>
                <p>✓ Gestion des équipes terrain</p>
              </div>
            </div>
          </div>
        </div>

        {/* ONG Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-emerald-500">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Exports CSV</h3>
                <p className="text-sm text-gray-600">Données complètes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-slate-500">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-sky-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Alertes Actions</h3>
                <p className="text-sm text-gray-600">Mobilisation citoyenne</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-lg border-l-4 border-violet-500">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-violet-500" />
              <div>
                <h3 className="font-semibold text-gray-800">Statistiques</h3>
                <p className="text-sm text-gray-600">Impact environnemental</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} loading={loading} />

        {/* Pollution Type Chart */}
        <div className="mb-8">
          <PollutionTypeChart 
            pollutionTypeData={pollutionTypeData}
            recentReports={recentReports}
            onExportCSV={handleExportCSV}
          />
        </div>

        {/* Actions entre graphique et signalements */}
        <div className="flex justify-center space-x-4 my-8">
          <TeamsManagement
            teams={surfriderTeams}
            onCreateTeam={handleCreateTeam}
            onModifyTeam={handleModifyTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        </div>

        {/* Reports Table */}
        <ReportsTable
          reports={recentReports}
          loading={loading}
          onStatusUpdate={handleStatusUpdate}
          onDeleteReport={handleDeleteReport}
        />
        <DeleteReportModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteReport}
          report={reportToDelete}
        />
      </div>
    </div>
  );
};