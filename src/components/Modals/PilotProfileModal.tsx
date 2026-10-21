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
  Mountain
} from 'lucide-react';

export const PilotProfileModal: React.FC = () => {
  const { 
    selectedPilotProfile, 
    setSelectedPilotProfile, 
    motorcycles, 
    routeProposals, 
    setSelectedRoute, 
    enterRodada 
  } = useApp();

  if (!selectedPilotProfile) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0D0B0A] border border-white/15 w-full max-w-2xl max-h-[90vh] overflow-y-auto text-chalk shadow-2xl relative font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-[#1c1815] via-[#2A1D17] to-[#12100E] border-b border-white/10 relative p-6 flex justify-between items-start">
          <span className="text-[10px] uppercase font-bold tracking-widest text-earth bg-black/60 px-2.5 py-1 border border-earth/30 backdrop-blur-sm">
            [ TELEMETRÍA PILOTO // STRAVA & WIKILOC SYNC ]
          </span>
          <button 
            onClick={() => setSelectedPilotProfile(null)}
            className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-earth transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 sm:px-8 pb-8 -mt-12 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img 
                  src={selectedPilotProfile.avatar} 
                  alt={selectedPilotProfile.name}
                  className="w-24 h-24 rounded-full border-4 border-[#0D0B0A] object-cover shadow-2xl bg-black"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" title="Piloto en línea" />
              </div>
              <div className="pb-1">
                <h3 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight">
                  {selectedPilotProfile.name}
                </h3>
                <p className="text-xs text-earth font-bold">
                  {selectedPilotProfile.handle}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-ash">
                  <MapPin className="w-3.5 h-3.5 text-ash" />
                  <span>{selectedPilotProfile.location}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-white/5 border border-white/15 text-[10px] text-chalk font-bold uppercase tracking-wider">
                Nivel: {selectedPilotProfile.ridingLevel}
              </span>
            </div>
          </div>

          {/* Bio statement */}
          <div className="p-4 bg-white/[0.03] border border-white/10 text-xs text-white/80 leading-relaxed font-light">
            "{selectedPilotProfile.bio}"
          </div>

          {/* STRAVA METRICS HUD */}
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[10px] text-ash uppercase tracking-widest font-bold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-earth" />
                Estadísticas de Temporada (Strava Feed)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                Verificado GPS ✓
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Km en Tierra</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  {stats.totalKm.toLocaleString()}
                </p>
                <span className="text-[9px] text-earth block mt-0.5">Kilómetros rodados</span>
              </div>

              <div className="p-4 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Expediciones</span>
                <p className="font-display font-extrabold text-2xl text-white mt-1">
                  {stats.completedCount}
                </p>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Rutas concluidas</span>
              </div>

              <div className="p-4 bg-[#12100E] border border-white/10 text-center">
                <span className="text-[9px] text-ash uppercase block tracking-wider">Desnivel Positivo</span>
                <p className="font-display font-extrabold text-2xl text-cyan-300 mt-1">
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
                <Bike className="w-3.5 h-3.5 text-earth" />
                Hangar & Flotilla del Piloto ({pilotBikes.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pilotBikes.map(bike => (
                  <div key={bike.id} className="p-3 bg-[#110F0D] border border-white/10 flex items-center gap-3">
                    <img 
                      src={bike.photoUrl} 
                      alt={bike.model} 
                      className="w-16 h-16 object-cover border border-white/10"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-white uppercase">{bike.brand} {bike.model}</p>
                      <p className="text-[10px] text-earth">{bike.type} • {bike.displacementCc}cc</p>
                      <p className="text-[10px] text-ash mt-1">Llantas: <strong className="text-white">{bike.tires}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CREATED OR COMPLETED ROUTES (WIKILOC STYLE) */}
          {pilotCreatedRoutes.length > 0 && (
            <div>
              <span className="text-[10px] text-ash uppercase tracking-widest font-bold block mb-3 border-b border-white/10 pb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-earth" />
                Rutas Trazadas por {selectedPilotProfile.name} ({pilotCreatedRoutes.length})
              </span>
              <div className="space-y-2">
                {pilotCreatedRoutes.map(route => (
                  <div 
                    key={route.id}
                    className="p-3 bg-white/[0.02] border border-white/10 hover:border-earth flex items-center justify-between gap-3 text-xs transition"
                  >
                    <div>
                      <p className="font-bold text-white uppercase">{route.title}</p>
                      <p className="text-[10px] text-ash">{route.destination}, {route.state} • {route.totalKm} km ({route.offroadPercentage}% brecha)</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setSelectedPilotProfile(null);
                        enterRodada(route.rodadaId);
                      }}
                      className="px-3 py-1.5 bg-earth text-white font-bold text-[10px] uppercase tracking-wider hover:bg-earth/80 transition flex items-center gap-1"
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
