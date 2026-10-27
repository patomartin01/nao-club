'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MapPin, 
  Compass, 
  Award, 
  Bike, 
  Navigation, 
  CheckCircle, 
  Share2, 
  Phone,
  ArrowUpRight,
  TrendingUp,
  Mountain,
  UserPlus,
  Check
} from 'lucide-react';

export const PilotProfileModal: React.FC = () => {
  const { 
    currentUser,
    selectedPilotProfile, 
    setSelectedPilotProfile, 
    motorcycles, 
    routeProposals, 
    setSelectedRoute, 
    enterRodada,
    isFollowingUser,
    toggleFollowUser
  } = useApp();

  if (!selectedPilotProfile || selectedPilotProfile.id === currentUser.id) return null;

  const pilotBikes = motorcycles.filter(m => m.userId === selectedPilotProfile.id);
  const pilotCreatedRoutes = routeProposals.filter(r => r.proposedByUserId === selectedPilotProfile.id);
  const pilotCompletedRoutes = routeProposals.filter(r => 
    selectedPilotProfile.completedRouteIds?.includes(r.id)
  );

  const stats = selectedPilotProfile.stats || {
    totalKm: 1450,
    completedCount: 5,
    elevationGain: 8200
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-2xl my-auto max-h-[94vh] overflow-y-auto text-[#1A1918] shadow-[8px_8px_0px_#1A1918] relative font-sans rounded-[28px] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-[#F4EEDB] border-b-2 border-[#1A1918] p-4 flex items-center justify-between rounded-t-[26px]">
          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#E6332A] bg-[#FAF6ED] px-3 py-1 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-lg">
            ★ DOSSIER DE PILOTO ★
          </span>
          <button 
            onClick={() => setSelectedPilotProfile(null)}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] flex items-center justify-center hover:bg-[#E6332A] hover:text-white transition shrink-0 shadow-[2px_2px_0px_#1A1918]"
            title="Cerrar perfil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity Bar */}
        <div className="p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img 
                  src={selectedPilotProfile.avatar} 
                  alt={selectedPilotProfile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#1A1918] object-cover shadow-[3px_3px_0px_#1A1918] bg-[#F4EEDB]"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#1A1918] shadow-xs" title="Piloto en línea" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-black text-xl sm:text-2xl text-[#1A1918] uppercase tracking-wide leading-tight break-words">
                  {selectedPilotProfile.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs">
                  <span className="text-[#E6332A] font-mono font-black">{selectedPilotProfile.handle}</span>
                  <span className="text-[#1A1918]/30">•</span>
                  <span className="text-[#1A1918]/70 font-serif italic flex items-center gap-1 text-xs truncate font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#E06423] shrink-0" />
                    {selectedPilotProfile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <span className="px-3 py-1.5 bg-[#F4EEDB] border-2 border-[#1A1918] text-[10px] text-[#1A1918] font-display font-black uppercase tracking-wider whitespace-nowrap shadow-[2px_2px_0px_#1A1918] rounded-xl">
                Nivel: {selectedPilotProfile.ridingLevel}
              </span>

              {selectedPilotProfile.id !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => toggleFollowUser(selectedPilotProfile.id)}
                  className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    isFollowingUser(selectedPilotProfile.id)
                      ? 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918]'
                      : 'bg-[#E6332A] hover:bg-[#d02c24] text-white'
                  }`}
                >
                  {isFollowingUser(selectedPilotProfile.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1A1918]" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#F7B32B]" />
                      <span>+ Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Followers & Community Stats Counter */}
          <div className="flex items-center gap-4 text-xs text-[#1A1918]/70 border-y-2 border-[#1A1918] py-3 overflow-x-auto font-medium">
            <div>
              <strong className="text-[#1A1918] font-display font-black text-sm">
                {isFollowingUser(selectedPilotProfile.id) ? 143 : 142}
              </strong>{' '}
              <span className="text-[11px] uppercase tracking-wider">Seguidores</span>
            </div>
            <span className="text-[#1A1918]/30">•</span>
            <div>
              <strong className="text-[#1A1918] font-display font-black text-sm">88</strong>{' '}
              <span className="text-[11px] uppercase tracking-wider">Siguiendo</span>
            </div>
            <span className="text-[#1A1918]/30">•</span>
            <div>
              <strong className="text-[#E6332A] font-display font-black text-sm">{pilotBikes.length}</strong>{' '}
              <span className="text-[11px] uppercase tracking-wider">{pilotBikes.length === 1 ? 'Moto' : 'Motos'}</span>
            </div>
          </div>

          {/* Bio statement */}
          <div className="p-4 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl text-xs text-[#1A1918] leading-relaxed font-serif italic break-words shadow-[3px_3px_0px_#1A1918] font-medium">
            &ldquo;{selectedPilotProfile.bio}&rdquo;
          </div>

          {/* GPS METRICS HUD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-2">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-black flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                Estadísticas de Temporada (Telemetría)
              </span>
              <span className="text-[10px] text-[#1A1918] font-mono font-black uppercase whitespace-nowrap bg-[#F7B32B] px-2 py-0.5 border-2 border-[#1A1918] rounded-md shadow-[1px_1px_0px_#1A1918]">
                Verificado GPS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] text-center rounded-2xl shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-display font-black">Km en Tierra</span>
                <p className="font-display font-black text-base sm:text-lg text-[#1A1918] mt-1 whitespace-nowrap">
                  {stats.totalKm.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#1A1918]/60 block mt-0.5 font-serif italic font-medium">Kilómetros rodados</span>
              </div>

              <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] text-center rounded-2xl shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-display font-black">Expediciones</span>
                <p className="font-display font-black text-base sm:text-lg text-[#1A1918] mt-1 whitespace-nowrap">
                  {stats.completedCount}
                </p>
                <span className="text-[9px] text-[#1D4477] block mt-0.5 font-serif italic font-bold">Rutas concluidas</span>
              </div>

              <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] text-center rounded-2xl shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-display font-black">Desnivel Positivo</span>
                <p className="font-display font-black text-base sm:text-lg text-[#E06423] mt-1 whitespace-nowrap">
                  +{stats.elevationGain.toLocaleString()}m
                </p>
                <span className="text-[9px] text-[#1A1918]/60 block mt-0.5 font-serif italic font-medium">Metros de altitud</span>
              </div>
            </div>
          </div>

          {/* HANGAR / MOTORCYCLES */}
          {pilotBikes.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-black block border-b-2 border-[#1A1918] pb-2 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-[#1A1918] shrink-0" />
                Hangar &amp; Flotilla del Piloto ({pilotBikes.length})
              </span>
              <div className={`grid gap-3 ${pilotBikes.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {pilotBikes.map(bike => (
                  <div key={bike.id} className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center gap-3.5 shadow-[3px_3px_0px_#1A1918]">
                    <img 
                      src={bike.photoUrl} 
                      alt={bike.model} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-[#1A1918] rounded-xl shrink-0 bg-[#FAF6ED]"
                    />
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-display font-black text-[#1A1918] uppercase text-sm truncate">{bike.brand} {bike.model}</p>
                      <p className="text-[10px] text-[#E6332A] font-mono font-black mt-0.5 uppercase">{bike.type} • {bike.displacementCc}cc</p>
                      <p className="text-[10px] text-[#1A1918]/70 mt-1 font-serif italic font-medium">
                        Llantas: <strong className="text-[#1A1918] font-mono font-black not-italic">{bike.tires}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RUTAS TRAZADAS POR EL PILOTO */}
          {pilotCreatedRoutes.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-black block border-b-2 border-[#1A1918] pb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                Rutas Trazadas por {selectedPilotProfile.name} ({pilotCreatedRoutes.length})
              </span>
              <div className="space-y-2">
                {pilotCreatedRoutes.map(route => (
                  <div 
                    key={route.id}
                    className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center justify-between gap-3 text-xs transition shadow-[3px_3px_0px_#1A1918]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-black text-[#1A1918] uppercase truncate">{route.title}</p>
                      <p className="text-[11px] text-[#1A1918]/70 font-serif italic truncate font-medium">{route.destination}, {route.state} • {route.totalKm} km ({route.offroadPercentage}% brecha)</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setSelectedPilotProfile(null);
                        enterRodada(route.rodadaId);
                      }}
                      className="px-3.5 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] font-display font-black text-[10px] uppercase tracking-widest transition flex items-center gap-1 shrink-0 rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <span>Ver Ruta</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTACT / WHATSAPP ACTION */}
          {selectedPilotProfile.phone && (
            <div className="pt-2">
              <a
                href={`https://wa.me/${selectedPilotProfile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedPilotProfile.name}! Vi tu perfil en NAO, ¿qué tal si organizamos una rodada?`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] text-center font-display font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Phone className="w-4 h-4 text-[#1D4477]" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
