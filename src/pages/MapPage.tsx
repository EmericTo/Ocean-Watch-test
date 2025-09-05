/**
 * @fileoverview Page de visualisation cartographique des signalements
 * 
 * Cette page affiche tous les signalements sur une carte interactive avec
 * filtrage par type de pollution. Elle permet la consultation détaillée
 * et la suppression des signalements existants.
 * 
 * @features
 * - Carte interactive avec Leaflet
 * - Filtres par type de pollution
 * - Liste des signalements avec sélection
 * - Détails complets des signalements sélectionnés
 * - Suppression avec confirmation
 * - Marqueurs colorés par type de pollution
 * 
 * @usage Route "/map" dans App.tsx
 * @dependencies InteractiveMap, mockData, Lucide React
 */
import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Calendar, User, Eye } from 'lucide-react';
import { getMockReports, MockReport, deleteMockReport } from '../lib/mockData';
import { DeleteReportModal } from '../components/dashboard/DeleteReportModal';
import { InteractiveMap } from '../components/InteractiveMap';

export const MapPage: React.FC = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedType, setSelectedType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);
  const [reports, setReports] = useState<MockReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportToDelete, setReportToDelete] = useState<MockReport | null>(null);

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      await deleteMockReport(reportToDelete.id);
      setReports(prev => prev.filter(report => report.id !== reportToDelete.id));
      if (selectedReport?.id === reportToDelete.id) {
        setSelectedReport(null);
      }
      setReportToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getMockReports();
        setReports(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des signalements');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const pollutionTypes = [
    { value: 'all', label: 'Tous types', color: 'bg-gray-500' },
    { value: 'plastic', label: 'Déchets plastiques', color: 'bg-red-500' },
    { value: 'hydrocarbons', label: 'Hydrocarbures', color: 'bg-orange-500' },
    { value: 'organic', label: 'Déchets organiques', color: 'bg-green-500' },
    { value: 'chemicals', label: 'Produits chimiques', color: 'bg-purple-500' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Nouveau';
      case 'in-progress': return 'En cours';
      case 'resolved': return 'Résolu';
      default: return 'Inconnu';
    }
  };

  const filteredReports = selectedType === 'all' 
    ? reports 
    : reports.filter(report => report.type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Carte des signalements ONG
          </h1>
          <p className="text-gray-600">
            Visualisez tous les signalements de vos équipes terrain en temps réel
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
              </div>
              
              <div className="space-y-3">
                {pollutionTypes.map(type => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pollution-type"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-blue-600"
                    />
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Signalements ({loading ? '...' : filteredReports.length})
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          pollutionTypes.find(t => t.value === report.type)?.color || 'bg-gray-500'
                        }`}></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        {report.location_address}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {report.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                  
                  {filteredReports.length === 0 && !loading && (
                    <p className="text-gray-500 text-center py-4">
                      Aucun signalement trouvé
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="h-[400px] md:h-[500px] lg:h-[600px]">
                {loading ? (
                  <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement de la carte...</p>
                    </div>
                  </div>
                ) : (
                  <InteractiveMap
                    reports={reports}
                    selectedReport={selectedReport}
                    onReportSelect={setSelectedReport}
                    filteredType={selectedType}
                  />
                )}
              </div>
            </div>

            {/* Selected Report Details */}
            {selectedReport && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Détails du signalement
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Localisation</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedReport.location_address}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Date</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Signalé par</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedReport.organization_name || 'Équipe non spécifiée'}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Type</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {pollutionTypes.find(t => t.value === selectedReport.type)?.label}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">
                    {selectedReport.description}
                  </p>
                </div>
                
                {selectedReport.photo_url && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Photo</h4>
                    <img
                      src={selectedReport.photo_url}
                      alt="Photo du signalement"
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteReportModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        report={reportToDelete}
        onConfirm={confirmDeleteReport}
      />
    </div>
  );
};