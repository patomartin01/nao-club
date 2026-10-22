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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#0D0B0A] border border-white/15 w-full max-w-2xl my-auto max-h-[94vh] overflow-y-auto text-chalk shadow-2xl relative font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#1c1815] via-[#2A1D17] to-[#12100E] border-b border-white/10 p-3.5 sm:p-4 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-earth bg-black/60 px-2.5 py-1 border border-earth/30 backdrop-blur-sm">
            [ TELEMETRÍA PILOTO // MOTOMAMI GPS ]
          </span>
          <button 
            onClick={() => setSelectedPilotProfile(null)}
            className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-earth transition shrink-0"
            title="Cerrar perfil"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity Bar */}
        <div className="p-4 sm:p-6 md:p-7 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img 
                  src={selectedPilotProfile.avatar} 
                  alt={selectedPilotProfile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-earth/50 object-cover shadow-2xl bg-black"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" title="Piloto en línea" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-normal leading-snug break-words">
                  {selectedPilotProfile.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-xs">
                  <span className="text-earth font-mono font-bold">{selectedPilotProfile.handle}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-ash flex items-center gap-1 text-[11px] truncate">
                    <MapPin className="w-3 h-3 text-earth shrink-0" />
                    {selectedPilotProfile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="px-2.5 py-1.5 bg-white/5 border border-white/15 text-[10px] text-chalk font-mono font-bold uppercase tracking-wider whitespace-nowrap">
                Nivel: {selectedPilotProfile.ridingLevel}
              </span>

              {selectedPilotProfile.id !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => toggleFollowUser(selectedPilotProfile.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isFollowingUser(selectedPilotProfile.id)
                      ? 'bg-white/10 hover:bg-red-500/15 text-white hover:text-red-400 border border-white/20 hover:border-red-500/40'
                      : 'bg-earth hover:bg-earth/80 text-white border border-earth shadow-lg'
                  }`}
                >
                  {isFollowingUser(selectedPilotProfile.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Followers & Community Stats Counter */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-ash border-y border-white/10 py-2.5 overflow-x-auto">
            <div>
              <strong className="text-white font-mono">
                {isFollowingUser(selectedPilotProfile.id) ? 143 : 142}
              </strong>{' '}
              <span className="text-[11px] uppercase">Seguidores</span>
            </div>
            <span>•</span>
            <div>
              <strong className="text-white font-mono">88</strong>{' '}
              <span className="text-[11px] uppercase">Siguiendo</span>
            </div>
            <span>•</span>
            <div>
              <strong className="text-earth font-mono">{pilotBikes.length}</strong>{' '}
              <span className="text-[11px] uppercase">{pilotBikes.length === 1 ? 'Moto' : 'Motos'}</span>
            </div>
          </div>

          {/* Bio statement */}
          <div className="p-3.5 sm:p-4 bg-white/[0.03] border border-white/10 text-xs text-white/80 leading-relaxed font-light break-words">
            &ldquo;{selectedPilotProfile.bio}&rdquo;
          </div>

          {/* GPS METRICS HUD */}
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[10px] text-ash uppercase tracking-widest font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-earth shrink-0" />
                Estadísticas de Temporada (Telemetría GPS)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase whitespace-nowrap">
                Verificado GPS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-2.5 sm:p-3.5 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Km en Tierra</span>
                <p className="font-mono font-bold text-sm sm:text-base text-white mt-1 whitespace-nowrap">
                  {stats.totalKm.toLocaleString()}
                </p>
                <span className="text-[9px] text-earth block mt-0.5">Kilómetros rodados</span>
              </div>

              <div className="p-2.5 sm:p-3.5 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Expediciones</span>
                <p className="font-mono font-bold text-sm sm:text-base text-white mt-1 whitespace-nowrap">
                  {stats.completedCount}
                </p>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Rutas concluidas</span>
              </div>

              <div className="p-2.5 sm:p-3.5 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Desnivel Positivo</span>
                <p className="font-mono font-bold text-sm sm:text-base text-cyan-300 mt-1 whitespace-nowrap">
                  +{stats.elevationGain.toLocaleString()}m
                </p>
                <span className="text-[9px] text-ash block mt-0.5">Metros de altitud</span>
              </div>
            </div>
          </div>

          {/* HANGAR / MOTORCYCLES */}
          {pilotBikes.length > 0 && (
            <div>
              <span className="text-[10px] text-ash uppercase tracking-widest font-bold block mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-earth shrink-0" />
                Hangar &amp; Flotilla del Piloto ({pilotBikes.length})
              </span>
              <div className={`grid gap-3 ${pilotBikes.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {pilotBikes.map(bike => (
                  <div key={bike.id} className="p-3.5 bg-[#110F0D] border border-white/10 flex items-center gap-3.5">
                    <img 
                      src={bike.photoUrl} 
                      alt={bike.model} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-white/10 shrink-0 bg-black"
                    />
                    <div className="text-xs min-w-0 flex-1">
                      <p className="font-bold text-white uppercase text-sm truncate">{bike.brand} {bike.model}</p>
                      <p className="text-[10px] text-earth mt-0.5">{bike.type} • {bike.displacementCc}cc</p>
                      <p className="text-[10px] text-ash mt-1">
                        Llantas: <strong className="text-white font-mono">{bike.tires}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RUTAS TRAZADAS POR EL PILOTO */}
          {pilotCreatedRoutes.length > 0 && (
            <div>
              <span className="text-[10px] text-ash uppercase tracking-widest font-bold block mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-earth shrink-0" />
                Rutas Trazadas por {selectedPilotProfile.name} ({pilotCreatedRoutes.length})
              </span>
              <div className="space-y-2">
                {pilotCreatedRoutes.map(route => (
                  <div 
                    key={route.id}
                    className="p-3 bg-white/[0.02] border border-white/10 hover:border-earth flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white uppercase truncate">{route.title}</p>
                      <p className="text-[10px] text-ash truncate">{route.destination}, {route.state} • {route.totalKm} km ({route.offroadPercentage}% brecha)</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setSelectedPilotProfile(null);
                        enterRodada(route.rodadaId);
                      }}
                      className="px-3 py-1.5 bg-earth text-white font-bold text-[10px] uppercase tracking-wider hover:bg-earth/80 transition flex items-center gap-1 shrink-0"
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
                href={`https://wa.me/${selectedPilotProfile.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedPilotProfile.name}! Vi tu perfil en NAO Moto Expeditions, ¿qué tal si organizamos una rodada?`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-[#25D366]/20 hover:bg-[#25D366] text-white border border-[#25D366]/40 text-center font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-[#25D366] group-hover:text-black" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
