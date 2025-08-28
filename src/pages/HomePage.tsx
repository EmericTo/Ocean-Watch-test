/**
 * @fileoverview Page d'accueil de l'application 
 * 
 * Cette page présente l'application comme un outil interne pour les ONG
 * environnementales. Elle affiche les fonctionnalités principales, un hero
 * section attractif et des call-to-action vers les autres pages.
 * 
 * @features
 * - Hero section avec présentation de l'outil
 * - Grille des fonctionnalités ONG
 * - Call-to-action vers signalement et carte
 * - Design responsive avec Tailwind CSS
 * 
 * @usage Route "/" dans App.tsx
 * @dependencies Lucide React pour les icônes, React Router pour la navigation
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Map, Users, Shield, Waves, Leaf } from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: 'Signalement Interne',
      description: 'Équipes ONG signalent rapidement les pollutions observées sur le terrain'
    },
    {
      icon: Map,
      title: 'Carte Interactive',
      description: 'Visualisez tous les signalements de vos équipes sur une carte centralisée'
    },
    {
      icon: Users,
      title: 'Coordination Équipes',
      description: 'Coordonnez les actions entre vos différentes équipes terrain'
    },
    {
      icon: Shield,
      title: 'Suivi Centralisé',
      description: 'Données centralisées et suivi des actions de vos équipes'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-sky-700 to-sky-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 p-4 rounded-full">
                <Waves className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Ocean Watch
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Outil de gestion interne pour ONG environnementales
            </p>
            <p className="text-lg mb-12 text-sky-200 max-w-3xl mx-auto">
              Plateforme interne pour les équipes ONG : signalement terrain, 
              coordination des actions, suivi des interventions et gestion centralisée 
              des données de pollution côtière. <strong>Outil professionnel pour organisations.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/report"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Nouveau signalement</span>
              </Link>
              <Link
                to="/map"
                className="bg-white text-sky-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Map className="h-5 w-5" />
                <span>Carte des signalements</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Fonctionnalités ONG
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Outil professionnel pour la gestion interne des actions environnementales liés aux pollutions côtières
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="bg-sky-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 p-3 rounded-full">
              <Leaf className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Optimisez vos actions environnementales
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Centralisez vos données terrain et 
            optimisez l'impact de vos actions pour protéger les plages et océans. 
            <strong> Outil professionnel pour ONG.</strong>
          </p>
          <Link
            to="/report"
            className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>Accéder à l'outil</span>
          </Link>
        </div>
      </div>
    </div>
  );
};