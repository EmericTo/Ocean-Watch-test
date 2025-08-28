/**
 * @fileoverview Point d'entrée de l'application React
 * 
 * Ce fichier initialise l'application React en montant le composant App
 * dans le DOM. Il configure le mode strict de React pour le développement.
 * 
 * @usage Appelé automatiquement par Vite au démarrage
 * @dependencies React 18 avec createRoot, App.tsx, styles globaux
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
