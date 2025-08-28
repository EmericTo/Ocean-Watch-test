/**
 * @fileoverview Gestion des données mockées pour l'application Ocean Watch
 * 
 * Ce fichier simule une base de données en utilisant localStorage pour persister
 * les signalements de pollution. Il fournit toutes les fonctions CRUD nécessaires
 * et gère les données par défaut pour la démonstration.
 * 
 * @features
 * - CRUD complet des signalements (Create, Read, Update, Delete)
 * - Persistance via localStorage
 * - Données de démonstration par défaut
 * - Statistiques et analytics
 * - Géocodage avec Nominatim (OpenStreetMap)
 * 
 * @usage Utilisé par tous les composants pour les opérations de données
 * @storage localStorage avec clé 'oceanwatch_reports'
 */
// Mock data for demonstration purposes

// LocalStorage keys
const STORAGE_KEYS = {
  REPORTS: 'oceanwatch_reports',
  STATS: 'oceanwatch_stats'
};

export interface MockReport {
  id: string;
  type: 'plastic' | 'hydrocarbons' | 'organic' | 'chemicals' | 'other';
  description: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  photo_url?: string;
  status: 'new' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
  reporter_type?: 'citizen' | 'organization';
  organization_name?: string;
}

// Default reports data
const getDefaultReports = (): MockReport[] => [
  {
    id: '1',
    type: 'plastic',
    description: 'Nombreux déchets plastiques sur la plage de Biarritz, principalement des bouteilles et sacs.',
    location_lat: 43.4832,
    location_lng: -1.5586,
    location_address: 'Plage de Biarritz, 64200 Biarritz',
    photo_url: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg',
    status: 'new',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    reporter_type: 'organization',
    organization_name: 'Surfrider Foundation - Équipe Biarritz'
  },
  {
    id: '2',
    type: 'hydrocarbons',
    description: 'Traces d\'hydrocarbures observées sur le sable près du port.',
    location_lat: 45.6581,
    location_lng: -1.0414,
    location_address: 'Port de Royan, 17200 Royan',
    status: 'in-progress',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    reporter_type: 'organization',
    organization_name: 'Ville de Royan'
  },
  {
    id: '3',
    type: 'organic',
    description: 'Accumulation d\'algues en décomposition sur la côte.',
    location_lat: 44.9778,
    location_lng: -1.2147,
    location_address: 'Plage de Lacanau, 33680 Lacanau',
    status: 'resolved',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T17:30:00Z',
    reporter_type: 'organization',
    organization_name: 'Surfrider Foundation - Équipe Lacanau'
  },
  {
    id: '4',
    type: 'chemicals',
    description: 'Produits chimiques non identifiés rejetés près de la zone industrielle.',
    location_lat: 46.0417,
    location_lng: -1.3472,
    location_address: 'Île d\'Oléron, 17310 Saint-Pierre-d\'Oléron',
    status: 'new',
    created_at: '2024-01-12T16:45:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    reporter_type: 'organization',
    organization_name: 'Communauté de Communes'
  },
  {
    id: '5',
    type: 'other',
    description: 'Déchets métalliques et débris divers échoués après la tempête.',
    location_lat: 43.3917,
    location_lng: -1.6472,
    location_address: 'Plage d\'Hendaye, 64700 Hendaye',
    status: 'in-progress',
    created_at: '2024-01-11T11:20:00Z',
    updated_at: '2024-01-11T15:10:00Z',
    reporter_type: 'organization',
    organization_name: 'Surfrider Foundation - Équipe Hendaye'
  }
];

// Load reports from localStorage or use default data
const loadReportsFromStorage = (): MockReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (stored) {
      const parsedReports = JSON.parse(stored);
      if (Array.isArray(parsedReports) && parsedReports.length > 0) {
        return parsedReports;
      }
    }
  } catch (error) {
    console.warn('Error loading reports from localStorage:', error);
  }
  return getDefaultReports();
};

// Save reports to localStorage
const saveReportsToStorage = (reports: MockReport[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (error) {
    console.warn('Error saving reports to localStorage:', error);
  }
};

// Initialize reports from localStorage or default data
let mockReports: MockReport[] = loadReportsFromStorage();

// Helper functions for mock data
export const getMockReports = async (filters?: {
  type?: MockReport['type'];
  status?: MockReport['status'];
  limit?: number;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Always get fresh data from storage
  mockReports = loadReportsFromStorage();
  
  let filteredReports = [...mockReports];
  
  if (filters?.type) {
    filteredReports = filteredReports.filter(report => report.type === filters.type);
  }
  
  if (filters?.status) {
    filteredReports = filteredReports.filter(report => report.status === filters.status);
  }
  
  if (filters?.limit) {
    filteredReports = filteredReports.slice(0, filters.limit);
  }
  
  return filteredReports;
};

export const updateMockReportStatus = async (reportId: string, status: MockReport['status']) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Load fresh data from storage
  mockReports = loadReportsFromStorage();
  
  const reportIndex = mockReports.findIndex(report => report.id === reportId);
  if (reportIndex !== -1) {
    mockReports[reportIndex].status = status;
    mockReports[reportIndex].updated_at = new Date().toISOString();
    
    // Save to localStorage
    saveReportsToStorage(mockReports);
    
    return mockReports[reportIndex];
  }
  throw new Error('Report not found');
};

export const deleteMockReport = async (reportId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Load fresh data from storage
  mockReports = loadReportsFromStorage();
  
  const reportIndex = mockReports.findIndex(report => report.id === reportId);
  if (reportIndex !== -1) {
    const deletedReport = mockReports[reportIndex];
    mockReports.splice(reportIndex, 1);
    
    // Save to localStorage
    saveReportsToStorage(mockReports);
    
    return deletedReport;
  }
  throw new Error('Report not found');
};

export const createMockReport = async (reportData: {
  type: MockReport['type'];
  description: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  photo_url?: string;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newReport: MockReport = {
    id: Date.now().toString(),
    ...reportData,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reporter_type: 'organization',
    organization_name: 'Surfrider Foundation - Équipe Terrain'
  };
  
  mockReports.unshift(newReport);
  
  // Save to localStorage
  saveReportsToStorage(mockReports);
  
  return newReport;
};

// Helper function to get pollution type distribution
export const getPollutionTypeStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const reports = loadReportsFromStorage();
  
  const typeStats = {
    plastic: 0,
    hydrocarbons: 0,
    organic: 0,
    chemicals: 0,
    other: 0
  };
  
  reports.forEach(report => {
    typeStats[report.type]++;
  });
  
  return typeStats;
};

// Helper function to get reports by month for chart
export const getReportsByMonth = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Always get fresh data from storage
  const reports = loadReportsFromStorage();
  
  // Group reports by month
  const monthlyData: { [key: string]: number } = {};
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  // Initialize all months with 0
  months.forEach(month => {
    monthlyData[month] = 0;
  });
  
  // Count reports by month
  reports.forEach(report => {
    const date = new Date(report.created_at);
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];
    monthlyData[monthName]++;
  });
  
  return monthlyData;
};

// Dynamic stats function with period support
export const getDynamicReportStats = async (period: string = 'month') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const reports = loadReportsFromStorage();
  
  // Calculate date ranges based on period
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;
  
  switch (period) {
    case 'week':
      // Current week (Monday to Sunday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      // Previous week
      previousEndDate = new Date(startDate);
      previousEndDate.setDate(startDate.getDate() - 1);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousEndDate.getDate() - 6);
      break;
      
    case 'quarter':
      // Current quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      
      // Previous quarter
      if (currentQuarter === 0) {
        previousStartDate = new Date(now.getFullYear() - 1, 9, 1); // Q4 of previous year
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
      } else {
        previousStartDate = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousEndDate = new Date(now.getFullYear(), currentQuarter * 3, 0);
      }
      break;
      
    case 'year':
      // Current year
      startDate = new Date(now.getFullYear(), 0, 1);
      
      // Previous year
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
      break;
      
    default: // 'month'
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Previous month
      if (now.getMonth() === 0) {
        previousStartDate = new Date(now.getFullYear() - 1, 11, 1);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
      } else {
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      }
      break;
  }
  
  // Filter reports for current period
  const currentPeriodReports = reports.filter(report => {
    const reportDate = new Date(report.created_at);
    return reportDate >= startDate && reportDate <= now;
  });
  
  // Filter reports for previous period
  const previousPeriodReports = reports.filter(report => {
    const reportDate = new Date(report.created_at);
    return reportDate >= previousStartDate && reportDate <= previousEndDate;
  });
  
  // Calculate current period stats
  const currentStats = {
    total: currentPeriodReports.length,
    new: currentPeriodReports.filter(r => r.status === 'new').length,
    resolved: currentPeriodReports.filter(r => r.status === 'resolved').length,
    inProgress: currentPeriodReports.filter(r => r.status === 'in-progress').length,
  };
  
  // Calculate previous period stats for comparison
  const previousStats = {
    total: previousPeriodReports.length,
    new: previousPeriodReports.filter(r => r.status === 'new').length,
    resolved: previousPeriodReports.filter(r => r.status === 'resolved').length,
    inProgress: previousPeriodReports.filter(r => r.status === 'in-progress').length,
  };
  
  // Calculate weekly stats (always last 7 days for "Nouveaux cette semaine")
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyNewReports = reports.filter(report => {
    const reportDate = new Date(report.created_at);
    return reportDate >= oneWeekAgo && report.status === 'new';
  }).length;
  
  return {
    total: currentStats.total,
    new: currentStats.new,
    resolved: currentStats.resolved,
    inProgress: currentStats.inProgress,
    weekly: weeklyNewReports,
    // Add percentage changes
    totalChange: previousStats.total > 0 ? Math.round(((currentStats.total - previousStats.total) / previousStats.total) * 100) : 0,
    newChange: previousStats.new > 0 ? Math.round(((currentStats.new - previousStats.new) / previousStats.new) * 100) : 0,
    resolvedChange: previousStats.resolved > 0 ? Math.round(((currentStats.resolved - previousStats.resolved) / previousStats.resolved) * 100) : 0,
    inProgressChange: previousStats.inProgress > 0 ? Math.round(((currentStats.inProgress - previousStats.inProgress) / previousStats.inProgress) * 100) : 0,
  };
};

// Export function to reset data (useful for demo)
export const resetMockData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    mockReports = getDefaultReports();
    saveReportsToStorage(mockReports);
  } catch (error) {
    console.warn('Error resetting data:', error);
  }
};

// Export function to get current data count
export const getDataInfo = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
  return {
    hasStoredData: !!stored,
    currentCount: mockReports.length,
    defaultCount: getDefaultReports().length
  };
};