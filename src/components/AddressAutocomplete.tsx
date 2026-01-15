/**
 * @fileoverview Composant d'autocomplétion d'adresses
 * 
 * Ce composant fournit une autocomplétion d'adresses en utilisant l'API
 * Nominatim d'OpenStreetMap. Il affiche des suggestions en temps réel
 * pendant que l'utilisateur tape.
 * 
 * @features
 * - Autocomplétion en temps réel
 * - Debouncing pour limiter les requêtes
 * - Sélection par clic ou clavier
 * - Validation de l'adresse sélectionnée
 * - Interface accessible
 * 
 * @usage Utilisé dans ReportPage pour la saisie d'adresse
 * @dependencies API Nominatim pour les suggestions
 */
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, AlertCircle } from 'lucide-react';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Saisissez l'adresse...",
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValidated, setIsValidated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        addressdetails: '1',
        countrycodes: 'fr',
        limit: '5'
      }).toString();

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { 'Accept': 'application/json' },
      });
      
      const data = await response.json();
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && !isValidated) {
      debounceRef.current = setTimeout(() => {
        searchAddresses(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, isValidated]);

  
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    
    onChange(suggestion.display_name);
    onAddressSelect(suggestion.display_name, lat, lng);
    setIsValidated(true);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsValidated(false);
    setSelectedIndex(-1);
  };

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${className}`}
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
          ) : isValidated ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : value.length > 0 ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-sky-50 border-sky-200' : ''
              }`}
            >
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800 leading-relaxed">
                  {suggestion.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isValidated && (
        <p className="mt-1 text-xs text-green-600 flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>Adresse validée</span>
        </p>
      )}
    </div>
  );
};