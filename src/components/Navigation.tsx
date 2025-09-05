/**
 * @fileoverview Composant de navigation principal de l'application
 * 
 * Ce composant fournit la barre de navigation avec logo, menu principal,
 * bouton de reset des données et navigation responsive pour mobile.
 * Il affiche également le statut des données (nombre de signalements ajoutés).
 * 
 * @features
 * - Navigation responsive (desktop/mobile)
 * - Indicateur de page active
 * - Bouton de reset des données avec compteur
 * - Modal de confirmation pour le reset
 * - Logo et branding Ocean Watch
 * 
 * @usage Utilisé dans App.tsx comme header global
 * @dependencies React Router pour la navigation, mockData pour le reset
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Home, FileText, BarChart3, Menu, X } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, path: '/' },
    { id: 'map', label: 'Carte', icon: MapPin, path: '/map' },
    { id: 'report', label: 'Signaler', icon: FileText, path: '/report' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' }
  ];

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-600 to-sky-700 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ocean Watch</h1>
                <p className="text-xs text-gray-500">Outil ONG - Gestion interne</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => window.scrollTo(0, 0)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 shadow-sm'
                        : 'text-gray-600 hover:text-sky-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Espace réservé pour futurs éléments */}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => {
                        setIsMenuOpen(false);
                        window.scrollTo(0, 0);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-sky-50 text-sky-700'
                          : 'text-gray-600 hover:text-sky-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile User Menu */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* Espace réservé pour futurs éléments mobiles */}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}