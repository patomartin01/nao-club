'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  X, 
  Search, 
  UserPlus, 
  UserCheck, 
  MapPin, 
  Bike, 
  Clock,
  Compass,
  Loader2,
  Users
} from 'lucide-react';

interface SearchPilotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchPilotsModal: React.FC<SearchPilotsModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentUser,
    users,
    motorcycles,
    activities,
    followingUserIds,
    toggleFollowUser,
    isFollowingUser,
    requestToFollowUser,
    isFollowRequested,
    openPilotProfileById
  } = useApp();

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [remotePilots, setRemotePilots] = useState<User[]>([]);
  const [allCommunityPilots, setAllCommunityPilots] = useState<User[]>([]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setRemotePilots([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Cargar pilotos de la comunidad de Supabase inmediatamente al abrir
  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;
    const fetchCommunityProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, handle, email, avatar_url, bio, location, riding_level, phone, emergency_contact')
          .limit(200);

        if (!error && data && isSubscribed) {
          const mapped: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || 'Piloto NAO',
            handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
            email: p.email || '',
            avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
            bio: p.bio || 'Piloto en NAO.',
            location: p.location || 'México',
            ridingLevel: (p.riding_level as any) || 'Intermedio',
            phone: p.phone,
            emergencyContact: p.emergency_contact
          }));
          setAllCommunityPilots(mapped);
        }
      } catch (err) {
        console.warn('Error pre-cargando perfiles comunitarios:', err);
      }
    };

    fetchCommunityProfiles();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  // Búsqueda en vivo en la base de datos de usuarios de NAO con debounce corto
  useEffect(() => {
    const cleanQuery = query.trim().replace(/^@/, '');
    
    if (!cleanQuery) {
      setRemotePilots([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, handle, email, avatar_url, bio, location, riding_level, phone, emergency_contact')
          .or(`name.ilike.%${cleanQuery}%,handle.ilike.%${cleanQuery}%`)
          .limit(50);

        if (!error && data && !isCancelled) {
          const mapped: User[] = data.map((p: any) => ({
            id: p.id,
            name: p.name || 'Piloto NAO',
            handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
            email: p.email || '',
            avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
            bio: p.bio || 'Piloto en NAO.',
            location: p.location || 'México',
            ridingLevel: (p.riding_level as any) || 'Intermedio',
            phone: p.phone,
            emergencyContact: p.emergency_contact
          }));

          const filteredRemote = mapped.filter(
            u => u.id !== currentUser.id && u.handle !== currentUser.handle
          );

          if (!isCancelled) {
            setRemotePilots(filteredRemote);
          }
        }
      } catch (err) {
        console.warn('Error en búsqueda de pilotos Supabase:', err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, currentUser.id, currentUser.handle]);

  // Función auxiliar de normalización: minúsculas, sin acentos ni diacríticos
  const normalizeText = (text: string) => {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Función que calcula el puntaje de coincidencia flexible / difusa
  const calculateMatchScore = (user: User, rawQuery: string): number => {
    const q = normalizeText(rawQuery).replace(/^@/, '');
    if (!q) return 0;

    const name = normalizeText(user.name || '');
    const handle = normalizeText(user.handle || '').replace(/^@/, '');
    const location = normalizeText(user.location || '');
    const bio = normalizeText(user.bio || '');

    const nameWords = name.split(/\s+/).filter(Boolean);

    if (handle === q) return 1000;
    if (name === q) return 950;

    if (handle.startsWith(q)) return 800 - (handle.length - q.length);
    if (name.startsWith(q)) return 750 - (name.length - q.length);

    const wordStartsIdx = nameWords.findIndex(w => w.startsWith(q));
    if (wordStartsIdx !== -1) {
      return 600 - (wordStartsIdx * 10);
    }

    if (handle.includes(q)) return 400;
    if (name.includes(q)) return 350;

    if (location.startsWith(q)) return 200;
    if (location.includes(q)) return 150;
    if (bio.includes(q)) return 100;

    if (q.length >= 2) {
      let qIdx = 0;
      let matchedInName = 0;
      for (let i = 0; i < name.length && qIdx < q.length; i++) {
        if (name[i] === q[qIdx]) {
          matchedInName++;
          qIdx++;
        }
      }
      if (matchedInName === q.length) return 80;

      qIdx = 0;
      let matchedInHandle = 0;
      for (let i = 0; i < handle.length && qIdx < q.length; i++) {
        if (handle[i] === q[qIdx]) {
          matchedInHandle++;
          qIdx++;
        }
      }
      if (matchedInHandle === q.length) return 75;
    }

    return 0;
  };

  // Lista de pilotos de la comunidad disponible para sugerir cuando la búsqueda está vacía
  const communitySuggestedPilots = React.useMemo(() => {
    const map = new Map<string, User>();
    const isSelf = (u: User) => 
      !u || !u.id || u.id === 'guest' || u.id === currentUser.id ||
      (currentUser.handle && u.handle === currentUser.handle) ||
      (currentUser.name && u.name?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim());

    // 1. Pilotos de Supabase
    allCommunityPilots.forEach(u => {
      if (!isSelf(u)) map.set(u.id, u);
    });

    // 2. Pilotos locales en AppContext
    users.forEach(u => {
      if (!isSelf(u) && !map.has(u.id)) map.set(u.id, u);
    });

    // 3. Pilotos con actividades registradas
    activities.forEach(act => {
      if (act.pilotId && act.pilotId !== 'guest' && act.pilotId !== currentUser.id && !map.has(act.pilotId)) {
        map.set(act.pilotId, {
          id: act.pilotId,
          name: act.pilotName || 'Piloto NAO',
          handle: act.pilotHandle || `@${(act.pilotName || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
          email: '',
          avatar: act.pilotAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: `Piloto activo en NAO. Moto: ${act.motoModel}.`,
          location: act.location || 'México',
          ridingLevel: 'Intermedio'
        });
      }
    });

    return Array.from(map.values());
  }, [allCommunityPilots, users, activities, currentUser.id, currentUser.handle, currentUser.name]);

  // Combinar fuentes con ranking difuso cuando hay texto en query
  const filteredPilots = React.useMemo(() => {
    const cleanQuery = query.trim().replace(/^@/, '');
    if (!cleanQuery) return [];

    const pilotMap = new Map<string, { user: User; score: number }>();

    const considerUser = (u: User) => {
      if (!u || !u.id || u.id === 'guest' || u.id === currentUser.id) return;
      if (currentUser.handle && u.handle === currentUser.handle) return;
      if (currentUser.name && u.name?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) return;

      const score = calculateMatchScore(u, cleanQuery);
      if (score > 0) {
        const existing = pilotMap.get(u.id);
        if (!existing || score > existing.score) {
          pilotMap.set(u.id, { user: u, score });
        }
      }
    };

    remotePilots.forEach(considerUser);
    allCommunityPilots.forEach(considerUser);
    users.forEach(considerUser);

    activities.forEach(act => {
      if (act.pilotId && act.pilotId !== 'guest' && act.pilotId !== currentUser.id) {
        considerUser({
          id: act.pilotId,
          name: act.pilotName || 'Piloto NAO',
          handle: act.pilotHandle || `@${(act.pilotName || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
          email: '',
          avatar: act.pilotAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: `Piloto activo en NAO. Moto: ${act.motoModel}.`,
          location: act.location || 'México',
          ridingLevel: 'Intermedio'
        });
      }
    });

    return Array.from(pilotMap.values())
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.user);
  }, [query, remotePilots, allCommunityPilots, users, activities, currentUser.id, currentUser.handle, currentUser.name]);

  if (!isOpen) return null;

  const isQueryEmpty = !query.trim();
  const pilotsToRender = isQueryEmpty ? communitySuggestedPilots : filteredPilots;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-[#1A1918]/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF6ED] sm:border sm:border-[#1A1918] w-full sm:max-w-md h-full sm:h-auto sm:max-h-[85vh] sm:rounded-3xl overflow-hidden text-[#1A1918] sm:shadow-sm flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App Header / Search Input */}
        <div className="pt-[max(env(safe-area-inset-top),14px)] pb-3 px-4 bg-[#FAF6ED] border-b border-[#1A1918]/15 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1918]/50" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o @usuario..."
              className="w-full pl-9 pr-8 py-2 bg-[#F4EEDB] rounded-xl text-sm font-sans text-[#1A1918] placeholder:text-[#1A1918]/45 focus:outline-none focus:ring-1 focus:ring-[#1A1918] transition"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#1A1918]/40 hover:text-[#1A1918] transition cursor-pointer"
                title="Borrar texto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono font-bold text-[#1A1918]/70 hover:text-[#E6332A] transition px-1 py-1 cursor-pointer"
          >
            Listo
          </button>
        </div>

        {/* Section Title Banner */}
        <div className="px-4 py-2 bg-[#F4EEDB] border-b border-[#1A1918]/10 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1918]/70">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#E6332A]" />
            {isQueryEmpty 
              ? `Pilotos de la comunidad (${communitySuggestedPilots.length})` 
              : `Resultados (${pilotsToRender.length})`}
          </span>
          <span className="text-[#E6332A] font-bold">
            {isQueryEmpty ? 'Sugerencias para seguir' : 'Búsqueda en vivo'}
          </span>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1A1918]/10">
          {isSearching && filteredPilots.length === 0 ? (
            /* Buscando */
            <div className="py-16 text-center text-[#1A1918]/60 space-y-2">
              <Loader2 className="w-6 h-6 text-[#E6332A] animate-spin mx-auto" />
              <p className="text-xs font-mono">Buscando pilotos...</p>
            </div>
          ) : pilotsToRender.length === 0 ? (
            /* Sin resultados */
            <div className="py-16 text-center px-6 space-y-1">
              <p className="font-sans font-semibold text-sm text-[#1A1918]">
                Sin resultados
              </p>
              <p className="text-xs text-[#1A1918]/60">
                {isQueryEmpty 
                  ? 'Aún no hay otros pilotos registrados en la plataforma.'
                  : `No encontramos a nadie como "${query.trim()}"`}
              </p>
            </div>
          ) : (
            /* Lista de pilotos con botón Seguir / Siguiendo */
            pilotsToRender.map((pilot) => {
              const isFollowing = isFollowingUser(pilot.id);
              const pilotBikes = motorcycles.filter(m => m.userId === pilot.id);
              const motoName = pilotBikes[0] 
                ? `${pilotBikes[0].brand} ${pilotBikes[0].model}` 
                : (pilot.ridingLevel ? `Piloto ${pilot.ridingLevel}` : null);

              return (
                <div
                  key={pilot.id}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#F4EEDB]/60 transition"
                >
                  {/* Avatar + Info */}
                  <div
                    onClick={() => {
                      onClose();
                      openPilotProfileById(pilot.id);
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 group"
                  >
                    <img
                      src={pilot.avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'}
                      alt={pilot.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#1A1918]/20 shrink-0 bg-[#F4EEDB]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-sans font-semibold text-[#1A1918] truncate leading-tight group-hover:text-[#E6332A] transition">
                        {pilot.name}
                      </p>
                      <p className="text-xs font-mono text-[#1A1918]/60 truncate">
                        {pilot.handle}
                      </p>
                      {(pilot.location || motoName) && (
                        <p className="text-[10px] text-[#1A1918]/50 truncate mt-0.5">
                          {pilot.location}{pilot.location && motoName ? ' • ' : ''}{motoName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botón Seguir / Siguiendo */}
                  <div className="shrink-0">
                    {currentUser.id === 'guest' ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openPilotProfileById(pilot.id);
                        }}
                        className="px-3 py-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] text-xs font-sans font-bold rounded-lg border border-[#1A1918]/30 transition cursor-pointer"
                      >
                        Ver
                      </button>
                    ) : isFollowing ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollowUser(pilot.id);
                        }}
                        className="px-3.5 py-1.5 bg-[#F4EEDB] hover:bg-[#E6332A] hover:text-white text-[#1A1918] text-xs font-sans font-bold rounded-lg border border-[#1A1918]/20 transition group cursor-pointer flex items-center gap-1.5"
                        title="Dejar de seguir"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                        <span className="group-hover:hidden">Siguiendo</span>
                        <span className="hidden group-hover:inline">Dejar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollowUser(pilot.id);
                        }}
                        className="px-4 py-1.5 bg-[#E6332A] hover:bg-[#d02c24] text-white text-xs font-sans font-semibold rounded-lg shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
                        title="Seguir a este piloto"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Seguir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
