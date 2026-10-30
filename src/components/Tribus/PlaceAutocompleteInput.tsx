'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation, Search, Sparkles } from 'lucide-react';

export interface PlaceResult {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface PlaceAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectPlace?: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  dropUp?: boolean;
}

// Lugares populares de encuentro motociclista y destinos en México
const CURATED_BIKER_SPOTS: PlaceResult[] = [
  { name: 'Interlomas, Huixquilucan', address: 'Estado de México', lat: 19.3985, lng: -99.2783 },
  { name: 'Caseta Tlalpan (México - Cuernavaca)', address: 'Tlalpan, CDMX', lat: 19.2632, lng: -99.1627 },
  { name: 'Perisur, CDMX', address: 'Coyoacán, CDMX', lat: 19.3044, lng: -99.1895 },
  { name: 'Caseta Tepotzotlán (México - Querétaro)', address: 'Estado de México', lat: 19.7214, lng: -99.2312 },
  { name: 'Santa Fe (Samara Shops)', address: 'Cuajimalpa, CDMX', lat: 19.3601, lng: -99.2608 },
  { name: 'Tres Marías (Parada Motociclista)', address: 'Huitzilac, Morelos', lat: 19.0528, lng: -99.2435 },
  { name: 'Mineral del Chico, Pueblo Mágico', address: 'Hidalgo', lat: 20.2154, lng: -98.7310 },
  { name: 'Real del Monte, Pueblo Mágico', address: 'Hidalgo', lat: 20.1415, lng: -98.6738 },
  { name: 'Valle de Bravo (Avándaro)', address: 'Estado de México', lat: 19.1931, lng: -100.1328 },
  { name: 'Tepoztlán, Pueblo Mágico', address: 'Morelos', lat: 18.9863, lng: -99.0988 },
  { name: 'Peña de Bernal', address: 'Ezequiel Montes, Querétaro', lat: 20.7489, lng: -99.9486 },
  { name: 'Malinalco, Pueblo Mágico', address: 'Estado de México', lat: 18.9486, lng: -99.4975 },
  { name: 'Paso de Cortés (Iztaccíhuatl - Popocatépetl)', address: 'Puebla / Edomex', lat: 19.0864, lng: -98.6472 },
  { name: 'Parque Ecoturístico Corral de Piedra', address: 'Amanalco, Estado de México', lat: 19.2108, lng: -99.9689 },
  { name: 'Presa Corral de Piedra', address: 'Amanalco, Estado de México', lat: 19.2122, lng: -99.9566 },
  { name: 'Presa Iturbide', address: 'Isidro Fabela, Estado de México', lat: 19.5298, lng: -99.4658 },
  { name: 'La Marquesa', address: 'Ocoyoacac, Estado de México', lat: 19.2986, lng: -99.3698 }
];

export const PlaceAutocompleteInput: React.FC<PlaceAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Buscar negocio, local, gasolinera o punto en Maps...',
  className = '',
  autoFocus = false,
  dropUp = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [openUpward, setOpenUpward] = useState(dropUp);
  const containerRef = useRef<HTMLDivElement>(null);

  // Position detection: if dropUp is requested or not enough space below
  useEffect(() => {
    if (dropUp) {
      setOpenUpward(true);
      return;
    }
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 250);
    }
  }, [isOpen, dropUp, suggestions.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-engine search: Google Places / Suggest API + Geocoding
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      const qLower = trimmed.toLowerCase();
      const localMatches = CURATED_BIKER_SPOTS.filter(s => 
        s.name.toLowerCase().includes(qLower) || 
        (s.address && s.address.toLowerCase().includes(qLower))
      );

      try {
        // Query server route which handles Google Places API, Google Suggest and Geocoding
        const res = await fetch(`/api/places/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const apiResults: PlaceResult[] = (data.results || []).map((r: any) => ({
            name: r.name,
            address: r.address || '',
            lat: r.lat || 19.4000,
            lng: r.lng || -99.2000,
            placeId: r.placeId
          }));

          // Deduplicate
          const combined = [...localMatches];
          for (const item of apiResults) {
            const key = `${item.name.toLowerCase()}|${(item.address || '').toLowerCase()}`;
            if (!combined.some(c => `${c.name.toLowerCase()}|${(c.address || '').toLowerCase()}` === key)) {
              combined.push(item);
            }
          }
          setSuggestions(combined.slice(0, 8));
        } else {
          setSuggestions(localMatches);
        }
      } catch (err) {
        setSuggestions(localMatches);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (place: PlaceResult) => {
    let cleanAddress = (place.address || '').trim();
    if (
      cleanAddress.toLowerCase().includes('google maps') ||
      cleanAddress.toLowerCase().includes('sugerencia') ||
      cleanAddress.toLowerCase().includes('búsqueda')
    ) {
      cleanAddress = '';
    }

    // Only append if it's a genuine distinct address (e.g. from Photon or curated spot)
    const fullSpecificAddress = cleanAddress && 
      !place.name.toLowerCase().includes(cleanAddress.toLowerCase())
        ? `${place.name}, ${cleanAddress}`
        : place.name;

    onChange(fullSpecificAddress);
    if (onSelectPlace) {
      onSelectPlace({
        ...place,
        name: fullSpecificAddress,
        address: cleanAddress || undefined
      });
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else if (value.trim()) {
        handleSelect({
          name: value.trim(),
          lat: 19.3985,
          lng: -99.2783
        });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const trimmedQuery = value.trim();

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim().length >= 2 || suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full bg-white border border-[#DDD7CB] hover:border-[#141312] focus:border-[#141312] px-3.5 py-2.5 text-xs text-[#141312] placeholder-stone-400 focus:outline-none transition rounded-xl shadow-xs ${className}`}
        />
        {loading ? (
          <div className="absolute right-3 text-[#C84B31] animate-spin pointer-events-none">
            <Loader2 className="w-3.5 h-3.5" />
          </div>
        ) : (
          <div className="absolute right-3 text-stone-400 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown list */}
      {isOpen && trimmedQuery.length >= 2 && suggestions.length > 0 && (
        <div 
          className={`absolute left-0 right-0 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-[100] bg-white border border-[#E5DFD5] shadow-2xl rounded-xl max-h-56 overflow-y-auto divide-y divide-[#F0EDE8] font-sans`}
        >
          {suggestions.map((item, idx) => {
            const showAddress = item.address && 
              !item.address.toLowerCase().includes('sugerencia') && 
              !item.address.toLowerCase().includes('google maps') &&
              !item.address.toLowerCase().includes('búsqueda');

            return (
              <button
                key={`${item.name}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-[#FAF8F5] text-xs transition flex items-center gap-2.5 group cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C84B31] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#141312] font-display font-bold uppercase truncate">
                    {item.name}
                  </div>
                  {showAddress && (
                    <div className="text-[10px] text-stone-500 font-serif italic truncate mt-0.5">
                      {item.address}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
