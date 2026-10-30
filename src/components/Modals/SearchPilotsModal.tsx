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
  Loader2
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

  // Limpiar estado al cerrar o abrir
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setRemotePilots([]);
      setIsSearching(false);
    }
  }, [isOpen]);

  // Búsqueda en vivo en la base de datos de usuarios de NAO (Supabase profiles) con debounce
  useEffect(() => {
    const cleanQuery = query.trim().replace(/^@/, '');
    
    // Si no ha escrito nada, NUNCA mostrar sugerencias
    if (!cleanQuery) {
      setRemotePilots([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        if (isSupabaseConfigured()) {
          // Búsqueda directa en base de datos por nombre o handle (apodo/usuario)
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, handle, email, avatar_url, bio, location, riding_level, phone, emergency_contact')
            .or(`name.ilike.%${cleanQuery}%,handle.ilike.%${cleanQuery}%`)
            .limit(30);

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

            // Excluir al usuario actual
            const filteredRemote = mapped.filter(
              u => u.id !== currentUser.id && u.handle !== currentUser.handle
            );

            if (!isCancelled) {
              setRemotePilots(filteredRemote);
            }
          }
        }
      } catch (err) {
        console.warn('Error en búsqueda de pilotos Supabase:', err);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, currentUser.id, currentUser.handle]);

  // Combinar resultados remotos de Supabase con los usuarios y actividades locales coincidentes
  const filteredPilots = React.useMemo(() => {
    const cleanQuery = query.trim().toLowerCase().replace(/^@/, '');
    if (!cleanQuery) return [];

    const pilotMap = new Map<string, User>();

    // 1. Pilotos encontrados en la base de datos de Supabase
    remotePilots.forEach(p => {
      if (p.id && p.id !== currentUser.id) {
        pilotMap.set(p.id, p);
      }
    });

    // 2. Coincidencias en el estado local de users
    users.forEach(u => {
      if (u.id && u.id !== 'guest' && u.id !== currentUser.id && u.handle !== currentUser.handle) {
        const nameMatch = (u.name || '').toLowerCase().includes(cleanQuery);
        const handleMatch = (u.handle || '').toLowerCase().replace(/^@/, '').includes(cleanQuery);
        if (nameMatch || handleMatch) {
          if (!pilotMap.has(u.id)) {
            pilotMap.set(u.id, u);
          }
        }
      }
    });

    // 3. Coincidencias en actividades registradas
    activities.forEach(act => {
      if (act.pilotId && act.pilotId !== 'guest' && act.pilotId !== currentUser.id) {
        const nameMatch = (act.pilotName || '').toLowerCase().includes(cleanQuery);
        const handleMatch = (act.pilotHandle || '').toLowerCase().replace(/^@/, '').includes(cleanQuery);
        if ((nameMatch || handleMatch) && !pilotMap.has(act.pilotId)) {
          pilotMap.set(act.pilotId, {
            id: act.pilotId,
            name: act.pilotName || 'Piloto NAO',
            handle: act.pilotHandle || `@${act.pilotName.toLowerCase().replace(/\s+/g, '')}`,
            email: '',
            avatar: act.pilotAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
            bio: `Piloto activo en NAO. Moto: ${act.motoModel}.`,
            location: act.location || 'México',
            ridingLevel: 'Intermedio'
          });
        }
      }

      // Participantes de rodadas en grupo
      if (act.groupInfo?.participants) {
        act.groupInfo.participants.forEach(p => {
          if (p.userId && p.userId !== 'guest' && p.userId !== currentUser.id) {
            const nameMatch = (p.name || '').toLowerCase().includes(cleanQuery);
            const handleMatch = (p.handle || '').toLowerCase().replace(/^@/, '').includes(cleanQuery);
            if ((nameMatch || handleMatch) && !pilotMap.has(p.userId)) {
              pilotMap.set(p.userId, {
                id: p.userId,
                name: p.name || 'Piloto',
                handle: p.handle || `@${p.name.toLowerCase().replace(/\s+/g, '')}`,
                email: '',
                avatar: p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                bio: `Miembro de la tribu ${act.groupInfo?.crewName || 'NAO'}.`,
                location: 'México',
                ridingLevel: 'Intermedio'
              });
            }
          }
        });
      }
    });

    // Excluir usuario actual explícitamente
    pilotMap.delete(currentUser.id);
    if (currentUser.handle) {
      Array.from(pilotMap.entries()).forEach(([id, p]) => {
        if (p.handle === currentUser.handle) {
          pilotMap.delete(id);
        }
      });
    }

    return Array.from(pilotMap.values());
  }, [query, remotePilots, users, activities, currentUser.id, currentUser.handle]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-lg rounded-[28px] overflow-hidden text-[#1A1918] shadow-[8px_8px_0px_#1A1918] flex flex-col max-h-[85vh] animate-scaleUp cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#F4EEDB] border-b-2 border-[#1A1918] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#E6332A] bg-[#FAF6ED] px-2.5 py-1 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-lg shrink-0">
              EXPLORAR
            </span>
            <h2 className="font-display font-black text-sm sm:text-base uppercase tracking-wide truncate">
              Buscar Pilotos
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] flex items-center justify-center hover:bg-[#E6332A] hover:text-white transition shrink-0 shadow-[2px_2px_0px_#1A1918] cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b-2 border-[#1A1918] bg-[#FAF6ED]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1918]/60" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe el nombre o @usuario del piloto..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl text-xs sm:text-sm font-sans text-[#1A1918] placeholder:text-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] shadow-[2px_2px_0px_#1A1918] transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1918]/50 hover:text-[#E6332A] cursor-pointer"
                title="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#1A1918]/60 mt-2 px-1">
            <span className="flex items-center gap-1.5">
              {isSearching ? (
                <>
                  <Loader2 className="w-3 h-3 text-[#E6332A] animate-spin" />
                  <span>Buscando en la base de usuarios de NAO...</span>
                </>
              ) : query.trim() ? (
                <span>{filteredPilots.length} piloto(s) encontrado(s)</span>
              ) : (
                <span>Conéctate con otros pilotos de la comunidad</span>
              )}
            </span>
            {query.trim() && (
              <span className="text-[#E6332A] font-bold">
                "{query.trim()}"
              </span>
            )}
          </div>
        </div>

        {/* Results / Empty State */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {/* Caso 1: Input vacío -> CERO sugerencias */}
          {!query.trim() ? (
            <div className="py-14 text-center text-[#1A1918] space-y-3 px-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F4EEDB] border-2 border-[#1A1918] flex items-center justify-center shadow-[3px_3px_0px_#1A1918]">
                <Search className="w-7 h-7 text-[#1A1918]/60" />
              </div>
              <div className="space-y-1 max-w-xs mx-auto">
                <p className="font-display font-black text-sm uppercase tracking-wide">
                  Encuentra a cualquier piloto
                </p>
                <p className="text-xs text-[#1A1918]/70 font-sans leading-relaxed">
                  Escribe el <strong>nombre</strong> o <strong>@apodo/usuario</strong> con el que se registraron para encontrarlos y seguirlos.
                </p>
              </div>
            </div>
          ) : isSearching && filteredPilots.length === 0 ? (
            /* Caso 2: Buscando en Supabase */
            <div className="py-14 text-center text-[#1A1918]/70 space-y-2">
              <Loader2 className="w-8 h-8 text-[#E6332A] animate-spin mx-auto" />
              <p className="text-xs font-mono font-bold">Consultando base de datos...</p>
            </div>
          ) : filteredPilots.length === 0 ? (
            /* Caso 3: No se encontraron pilotos con ese query */
            <div className="py-12 text-center text-[#1A1918]/70 space-y-2">
              <Compass className="w-8 h-8 text-[#1A1918]/30 mx-auto" />
              <p className="font-display font-black text-xs uppercase text-[#1A1918]">
                No se encontraron pilotos
              </p>
              <p className="text-xs font-sans text-[#1A1918]/60 max-w-xs mx-auto">
                No hay coincidencias para &ldquo;<strong>{query}</strong>&rdquo;. Revisa que el nombre o apodo esté bien escrito.
              </p>
            </div>
          ) : (
            /* Caso 4: Resultados encontrados */
            filteredPilots.map((pilot) => {
              const isFollowing = isFollowingUser(pilot.id);
              const isRequested = isFollowRequested(pilot.id);
              const pilotBikes = motorcycles.filter(m => m.userId === pilot.id);
              const motoName = pilotBikes[0] 
                ? `${pilotBikes[0].brand} ${pilotBikes[0].model}` 
                : (pilot.ridingLevel ? `Piloto ${pilot.ridingLevel}` : null);

              return (
                <div
                  key={pilot.id}
                  className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] hover:bg-[#EDE6D3] transition"
                >
                  {/* Pilot Card info */}
                  <div
                    onClick={() => {
                      onClose();
                      openPilotProfileById(pilot.id);
                    }}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                    title="Ver perfil completo"
                  >
                    <img
                      src={pilot.avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'}
                      alt={pilot.name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-[#1A1918] shrink-0 group-hover:scale-105 transition bg-[#FAF6ED]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs sm:text-sm font-display font-black text-[#1A1918] truncate group-hover:text-[#E6332A] transition">
                          {pilot.name}
                        </p>
                      </div>
                      <p className="text-[11px] font-mono text-[#E6332A] font-bold truncate">
                        {pilot.handle}
                      </p>
                      
                      {/* Secondary meta info: Location or Bike */}
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#1A1918]/70 truncate">
                        {pilot.location && (
                          <span className="flex items-center gap-0.5 shrink-0">
                            <MapPin className="w-2.5 h-2.5 text-[#1A1918]/50" />
                            {pilot.location}
                          </span>
                        )}
                        {motoName && (
                          <span className="flex items-center gap-0.5 truncate">
                            • <Bike className="w-2.5 h-2.5 text-[#1A1918]/50 shrink-0" />
                            <span className="truncate">{motoName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Follow / Unfollow / Requested Button */}
                  <div className="shrink-0">
                    {currentUser.id === 'guest' ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openPilotProfileById(pilot.id);
                        }}
                        className="px-3 py-1.5 bg-[#FAF6ED] hover:bg-[#FAF6ED] text-[#1A1918] text-[10px] font-display font-black uppercase rounded-xl border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918] transition cursor-pointer"
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
                        className="px-3 py-1.5 bg-[#FAF6ED] hover:bg-[#E6332A] hover:text-white text-[#1A1918] text-[10px] font-display font-black uppercase rounded-xl border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918] flex items-center gap-1 transition group cursor-pointer"
                        title="Dejar de seguir"
                      >
                        <UserCheck className="w-3 h-3 text-[#E6332A] group-hover:text-white" />
                        <span className="group-hover:hidden">Siguiendo</span>
                        <span className="hidden group-hover:inline">Dejar</span>
                      </button>
                    ) : isRequested ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestToFollowUser(pilot.id);
                        }}
                        className="px-2.5 py-1.5 bg-[#EDE6D3] text-[#1A1918]/70 text-[10px] font-display font-black uppercase rounded-xl border-2 border-[#1A1918]/50 flex items-center gap-1 hover:border-[#E6332A] hover:text-[#E6332A] transition cursor-pointer"
                        title="Cancelar solicitud"
                      >
                        <Clock className="w-3 h-3 text-[#F7B32B]" />
                        <span>Enviada</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestToFollowUser(pilot.id);
                        }}
                        className="px-3 py-1.5 bg-[#1A1918] hover:bg-[#E6332A] text-white text-[10px] font-display font-black uppercase rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 transition cursor-pointer"
                        title="Enviar solicitud para seguir"
                      >
                        <UserPlus className="w-3 h-3 text-[#F7B32B]" />
                        <span>Seguir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#F4EEDB] border-t-2 border-[#1A1918] flex items-center justify-between text-[10px] font-mono text-[#1A1918]/70">
          <span>Toca a un piloto para ver su garaje y rutas</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#1A1918] hover:text-[#E6332A] uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

