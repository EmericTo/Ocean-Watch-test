/**
 * @fileoverview Point d'entrée principal de l'application Ocean Watch
 * 
 * Ce fichier configure le routage principal de l'application et la structure globale.
 * Il définit les routes pour toutes les pages (Accueil, Signalement, Carte, Dashboard)
 * et applique le layout commun avec la navigation.
 * 
 * @usage Composant racine rendu dans main.tsx
 * @dependencies react-router-dom pour la navigation, Navigation pour le header
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { ReportPage } from './pages/ReportPage';
import { MapPage } from './pages/MapPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;