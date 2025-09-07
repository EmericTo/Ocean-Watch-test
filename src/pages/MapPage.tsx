/**
 * @fileoverview Page de visualisation cartographique des signalements
 * 
 * Cette page affiche tous les signalements avec un système de toggle entre
 * vue carte et vue liste. Elle permet le filtrage par type de pollution
 * et par statut, avec consultation détaillée des signalements.
 * 
 * @features
 * - Toggle entre vue carte et vue liste
 * - Filtres par type de pollution et statut
 * - Carte interactive avec Leaflet
 * - Liste des signalements avec pagination
 * - Détails complets des signalements sélectionnés
 * - Suppression avec confirmation
 * - Marqueurs colorés par type de pollution
 * 
 * @usage Route "/map" dans App.tsx
 * @dependencies InteractiveMap, mockData, Lucide React
 */
import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Calendar, User, Eye, Map, List, Grid } from 'lucide-react';
import { getMockReports, MockReport, deleteMockReport } from '../lib/mockData';
import { DeleteReportModal } from '../components/dashboard/DeleteReportModal';
import { InteractiveMap } from '../components/InteractiveMap';
import { getImage } from '../lib/imageStorage';
import { ImagePreview } from '../components/ImagePreview';

type ViewMode = 'map' | 'list';

export const MapPage: React.FC = () => {
  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<MockReport | null>(null);
  const [reports, setReports] = useState<MockReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportToDelete, setReportToDelete] = useState<MockReport | null>(null);
  const [selectedReportImage, setSelectedReportImage] = useState<string | null>(null);

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

  useEffect(() => {
    const loadSelectedReportImage = async () => {
      if (selectedReport?.photo_key) {
        try {
          const imageUrl = await getImage(selectedReport.photo_key);
          setSelectedReportImage(imageUrl);
        } catch (error) {
          console.error('Erreur lors du chargement de l\'image:', error);
          setSelectedReportImage(null);
        }
      } else {
        setSelectedReportImage(null);
      }
    };

    loadSelectedReportImage();
  }, [selectedReport]);

  const pollutionTypes = [
    { value: 'all', label: 'Tous types', color: 'bg-gray-500', count: reports.length },
    { value: 'plastic', label: 'Déchets plastiques', color: 'bg-red-500', count: reports.filter(r => r.type === 'plastic').length },
    { value: 'hydrocarbons', label: 'Hydrocarbures', color: 'bg-orange-500', count: reports.filter(r => r.type === 'hydrocarbons').length },
    { value: 'organic', label: 'Déchets organiques', color: 'bg-green-500', count: reports.filter(r => r.type === 'organic').length },
    { value: 'chemicals', label: 'Produits chimiques', color: 'bg-purple-500', count: reports.filter(r => r.type === 'chemicals').length },
    { value: 'other', label: 'Autre', color: 'bg-gray-600', count: reports.filter(r => r.type === 'other').length }
  ];

  const statusTypes = [
    { value: 'all', label: 'Tous statuts', count: reports.length },
    { value: 'new', label: 'Nouveaux', count: reports.filter(r => r.status === 'new').length },
    { value: 'in-progress', label: 'En cours', count: reports.filter(r => r.status === 'in-progress').length },
    { value: 'resolved', label: 'Résolus', count: reports.filter(r => r.status === 'resolved').length }
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


  let filteredReports = reports;
  
  if (selectedType !== 'all') {
    filteredReports = filteredReports.filter(report => report.type === selectedType);
  }
  
  if (selectedStatus !== 'all') {
    filteredReports = filteredReports.filter(report => report.status === selectedStatus);
  }

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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* View Toggle and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Type Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">Type de pollution</h3>
              </div>
              <div className="space-y-2">
                {pollutionTypes.map(type => (
                  <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pollution-type"
                      value={type.value}
                      checked={selectedType === type.value}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="text-sky-600"
                    />
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <span className="text-sm text-gray-700 flex-1">{type.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {type.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Eye className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">Statut</h3>
              </div>
              <div className="space-y-2">
                {statusTypes.map(status => (
                  <label key={status.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="status-type"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="text-sky-600"
                    />
                    <span className="text-sm text-gray-700 flex-1">{status.label}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {status.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Vue :</span>
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Map className="h-4 w-4" />
                  <span>Carte</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-sky-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>Liste</span>
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {loading ? 'Chargement...' : `${filteredReports.length} signalement(s) trouvé(s)`}
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'map' ? (
          /* Map View */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="h-[500px] lg:h-[600px]">
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
                      filteredStatus={selectedStatus}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Selected Report Details */}
            <div className="lg:col-span-1">
              {selectedReport ? (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Détails du signalement
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedReport.status)}`}>
                      {getStatusLabel(selectedReport.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Localisation</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedReport.location_address}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Date</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Signalé par</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedReport.organization_name || 'Équipe non spécifiée'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">
                        {selectedReport.description}
                      </p>
                    </div>
                    
                    {(selectedReportImage || selectedReport.photo_url) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Photo</h4>
                        <ImagePreview
                          image={selectedReportImage || selectedReport.photo_url || null}
                          showRemoveButton={false}
                          showModifyButton={false}
                          alt="Photo du signalement"
                          className="w-full max-w-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Sélectionnez un signalement
                    </h3>
                    <p className="text-gray-600">
                      Cliquez sur un marqueur de la carte pour voir les détails
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Reports List - Full Width */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Liste des signalements ({filteredReports.length})
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedReport?.id === report.id
                          ? 'border-sky-500 bg-sky-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            pollutionTypes.find(t => t.value === report.type)?.color || 'bg-gray-500'
                          }`}></div>
                          <h4 className="font-medium text-gray-800 text-sm">
                            {pollutionTypes.find(t => t.value === report.type)?.label}
                          </h4>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 font-medium line-clamp-2">
                            {report.location_address}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{report.organization_name || 'Équipe terrain'}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredReports.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">
                        Aucun signalement trouvé
                      </h3>
                      <p className="text-gray-600">
                        Essayez de modifier les filtres pour voir plus de résultats
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Report Details - Full Width Below */}
            {selectedReport && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Détails du signalement sélectionné
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedReport.status)}`}>
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Localisation</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedReport.location_address}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Date</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedReport.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Signalé par</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedReport.organization_name || 'Équipe non spécifiée'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedReport.description}
                    </p>
                  </div>
                  
                  {(selectedReportImage || selectedReport.photo_url) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Photo</h4>
                      <ImagePreview
                        image={selectedReportImage || selectedReport.photo_url || null}
                        showRemoveButton={false}
                        showModifyButton={false}
                        alt="Photo du signalement"
                        className="w-full max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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