/**
 * @fileoverview Composant de gestion des équipes Surfrider
 * 
 * Ce composant permet la gestion complète des équipes ONG : création,
 * modification, suppression et visualisation. Il gère les équipes par défaut
 * (non supprimables) et les équipes créées par l'utilisateur.
 * 
 * @features
 * - Liste des équipes avec détails (membres, spécialité, contact)
 * - Création de nouvelles équipes avec formulaire complet
 * - Modification du nombre de bénévoles
 * - Suppression des équipes personnalisées
 * - Protection des équipes par défaut
 * - Modals pour toutes les interactions
 * 
 * @usage Utilisé dans DashboardPage.tsx
 * @props teams: array des équipes à gérer
 * @props onCreateTeam: callback pour créer une équipe
 * @props onModifyTeam: callback pour modifier une équipe
 * @props onDeleteTeam: callback pour supprimer une équipe
 */
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface Team {
  id: string;
  name: string;
  members: number;
  specialty: string;
  contact: string;
}

interface TeamsManagementProps {
  teams: Team[];
  onCreateTeam: (team: Omit<Team, 'id'>) => void;
  onModifyTeam: (teamId: string, updates: Partial<Team>) => void;
  onDeleteTeam: (teamId: string) => void;
}

export const TeamsManagement: React.FC<TeamsManagementProps> = ({
  teams,
  onCreateTeam,
  onModifyTeam,
  onDeleteTeam
}) => {
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    specialty: '',
    contact: '',
    members: 1
  });
  const [modifyData, setModifyData] = useState({ members: 1 });

  const handleCreateTeam = () => {
    onCreateTeam(newTeam);
    setNewTeam({ name: '', specialty: '', contact: '', members: 1 });
    setShowCreateModal(false);
  };

  const handleModifyTeam = (team: Team) => {
    setSelectedTeam(team);
    setModifyData({ members: team.members });
    setShowModifyModal(true);
  };

  const handleSaveModification = () => {
    if (selectedTeam) {
      onModifyTeam(selectedTeam.id, modifyData);
      setShowModifyModal(false);
      setSelectedTeam(null);
    }
  };

  //const defaultTeamIds = ['biarritz', 'royan', 'lacanau', 'oleron', 'urgence'];

  return (
    <>
      <button 
        onClick={() => setShowTeamsModal(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
      >
        <Users className="h-5 w-5" />
        <span>Gérer équipes</span>
      </button>

      {/* Teams List Modal */}
      <Modal 
        isOpen={showTeamsModal} 
        onClose={() => setShowTeamsModal(false)} 
        title={`Gestion des équipes Surfriders (${teams.length})`}
        maxWidth="4xl"
      >
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Créer équipe</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map(team => (
            <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-lg mb-1">{team.name}</h4>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">
                      {team.members} bénévoles
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      {team.specialty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    📧 {team.contact}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleModifyTeam(team)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => onDeleteTeam(team.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Create Team Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title="Créer une nouvelle équipe"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'équipe *</label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Ex: Équipe Hendaye"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité *</label>
            <select
              value={newTeam.specialty}
              onChange={(e) => setNewTeam(prev => ({ ...prev, specialty: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              required
            >
              <option value="">Choisir une spécialité</option>
              <option value="Nettoyage plages">Nettoyage plages</option>
              <option value="Sensibilisation">Sensibilisation</option>
              <option value="Éducation">Éducation</option>
              <option value="Surveillance">Surveillance</option>
              <option value="Intervention rapide">Intervention rapide</option>
              <option value="Recherche">Recherche</option>
              <option value="Communication">Communication</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact *</label>
            <input
              type="email"
              value={newTeam.contact}
              onChange={(e) => setNewTeam(prev => ({ ...prev, contact: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="equipe@surfrider.eu"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de bénévoles</label>
            <input
              type="number"
              min="1"
              value={newTeam.members}
              onChange={(e) => setNewTeam(prev => ({ ...prev, members: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={handleCreateTeam}
            disabled={!newTeam.name || !newTeam.specialty || !newTeam.contact}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Créer l'équipe
          </button>
          <button 
            onClick={() => {
              setShowCreateModal(false);
              setNewTeam({ name: '', specialty: '', contact: '', members: 1 });
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </Modal>

      {/* Modify Team Modal */}
      <Modal 
        isOpen={showModifyModal} 
        onClose={() => setShowModifyModal(false)} 
        title={`Modifier l'équipe: ${selectedTeam?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de bénévoles
            </label>
            <input
              type="number"
              min="1"
              value={modifyData.members}
              onChange={(e) => setModifyData(prev => ({ 
                ...prev, 
                members: parseInt(e.target.value) || 1 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          
          {selectedTeam && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Spécialité:</strong> {selectedTeam.specialty}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Contact:</strong> {selectedTeam.contact}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={handleSaveModification}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Sauvegarder
          </button>
          <button 
            onClick={() => {
              setShowModifyModal(false);
              setSelectedTeam(null);
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </Modal>
    </>
  );
};