'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowersModal } from './FollowersModal';
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
  UserPlus,
  UserCheck,
  UserX,
  Check,
  Clock
} from 'lucide-react';

export const PilotProfileModal: React.FC = () => {
  const { 
    currentUser,
    selectedPilotProfile, 
    setSelectedPilotProfile, 
    closePilotProfile,
    motorcycles, 
    routeProposals, 
    setSelectedRoute, 
    enterRodada,
    isFollowingUser,
    toggleFollowUser,
    requestToFollowUser,
    isFollowRequested,
    getFollowersCountForUser,
    getFollowingCountForUser,
    activities
  } = useApp();

  if (!selectedPilotProfile || selectedPilotProfile.id === currentUser.id) return null;

  const pilotBikes = motorcycles.filter(m => m.userId === selectedPilotProfile.id);
  const pilotCreatedRoutes = routeProposals.filter(r => r.proposedByUserId === selectedPilotProfile.id);
  const pilotCompletedRoutes = routeProposals.filter(r => 
    selectedPilotProfile.completedRouteIds?.includes(r.id)
  );

  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  // Calcular estadísticas reales basadas en las actividades registradas de este piloto
  const pilotActivities = activities.filter(
    a => a.pilotId === selectedPilotProfile.id || a.pilotHandle === selectedPilotProfile.handle
  );
  const realKm = Math.round(pilotActivities.reduce((acc, a) => acc + (a.distanceKm || 0), 0) * 10) / 10;
  const realElev = pilotActivities.reduce((acc, a) => acc + (a.elevationGainM || 0), 0);
  const realCount = pilotActivities.length;

  const stats = selectedPilotProfile.stats || {
    totalKm: realKm,
    completedCount: realCount,
    elevationGain: realElev
  };

  const followersCount = getFollowersCountForUser(selectedPilotProfile.id);
  const followingCount = getFollowingCountForUser(selectedPilotProfile.id);

  const isStockBikePhoto = (url?: string | null): boolean => {
    if (!url || !url.trim()) return true;
    return (
      url.includes('photo-1558981403') ||
      url.includes('photo-1568772585407')
    );
  };

  const hasCustomBio = Boolean(
    selectedPilotProfile.bio &&
    selectedPilotProfile.bio.trim() !== '' &&
    !selectedPilotProfile.bio.toLowerCase().includes('registrado en nao') &&
    !selectedPilotProfile.bio.toLowerCase().includes('piloto en nao')
  );

  return (
    <>
      <div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto cursor-pointer"
        onClick={closePilotProfile}
      >
        <div 
          className="bg-[#FAF6ED] border border-[#1A1918]/10 w-full max-w-2xl my-auto max-h-[94vh] overflow-y-auto text-[#1A1918] shadow-sm relative font-sans rounded-[28px] animate-scaleUp cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header Banner */}
        <div className="bg-[#F4EEDB] border-b border-[#1A1918]/10 p-4 flex items-center justify-between rounded-t-[26px]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#E6332A] bg-[#FAF6ED] px-3 py-1 border border-[#1A1918]/10 shadow-sm rounded-lg">
              DOSSIER DE PILOTO
            </span>
            {isFollowingUser(selectedPilotProfile.id) && (
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded-lg flex items-center gap-1">
                <UserCheck className="w-3 h-3 stroke-[2.5]" />
                Siguiendo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
                const shareUrl = `${origin}?piloto=${encodeURIComponent(selectedPilotProfile.handle || selectedPilotProfile.id)}`;
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareUrl);
                }
                alert(`¡Enlace del perfil de ${selectedPilotProfile.name} copiado al portapapeles!`);
              }}
              className="w-8 h-8 rounded-xl bg-[#F7B32B] hover:bg-[#e5a422] border border-[#1A1918]/10 text-[#1A1918] flex items-center justify-center transition shrink-0 shadow-sm cursor-pointer"
              title="Compartir perfil de este piloto"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={closePilotProfile}
              className="w-8 h-8 rounded-xl bg-[#FAF6ED] border border-[#1A1918]/10 text-[#1A1918] flex items-center justify-center hover:bg-[#E6332A] hover:text-white transition shrink-0 shadow-sm cursor-pointer"
              title="Cerrar perfil"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img 
                  src={selectedPilotProfile.avatar} 
                  alt={selectedPilotProfile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-[#1A1918]/10 object-cover shadow-sm bg-[#F4EEDB]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#1A1918] leading-tight break-words">
                  {selectedPilotProfile.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs">
                  <span className="text-[#E6332A] font-mono font-semibold">{selectedPilotProfile.handle}</span>
                  <span className="text-[#1A1918]/30">•</span>
                  <span className="text-[#1A1918]/70 font-sans flex items-center gap-1 text-xs truncate font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#E06423] shrink-0" />
                    {selectedPilotProfile.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <span className="px-3 py-1.5 bg-[#F4EEDB] border border-[#1A1918]/10 text-[10px] text-[#1A1918] font-sans font-semibold uppercase tracking-wider whitespace-nowrap shadow-sm rounded-xl">
                Nivel: {selectedPilotProfile.ridingLevel}
              </span>

              {selectedPilotProfile.id !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => toggleFollowUser(selectedPilotProfile.id)}
                  className={`px-4 py-2 text-xs font-sans font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#1A1918]/10 shadow-sm active:shadow-none cursor-pointer group ${
                    isFollowingUser(selectedPilotProfile.id)
                      ? 'bg-[#FAF6ED] hover:bg-[#E6332A] text-[#1A1918] hover:text-white hover:border-[#1A1918]'
                      : 'bg-[#E6332A] hover:bg-[#d02c24] text-white'
                  }`}
                  title={
                    isFollowingUser(selectedPilotProfile.id)
                      ? 'Click para dejar de seguir a este piloto'
                      : 'Seguir a este piloto'
                  }
                >
                  {isFollowingUser(selectedPilotProfile.id) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1A1918] group-hover:hidden" />
                      <UserX className="w-3.5 h-3.5 text-white hidden group-hover:inline-block" />
                      <span className="group-hover:hidden">Siguiendo</span>
                      <span className="hidden group-hover:inline">Dejar de seguir</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-white" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Followers & Community Stats Counter */}
          <div className="flex items-center gap-2.5 sm:gap-3 py-3 border-y border-[#1A1918]/15 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => {
                setFollowersModalTab('followers');
                setFollowersModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 hover:bg-[#EDE6D3] border border-[#1A1918]/30 hover:border-[#1A1918] rounded-xl text-[11px] cursor-pointer transition group"
              title="Ver seguidores de este piloto"
            >
              <strong className="text-[#1A1918] group-hover:text-[#E6332A] font-sans font-semibold text-xs transition">
                {followersCount}
              </strong>
              <span className="text-[#1A1918]/70 group-hover:text-[#1A1918] font-medium transition">
                {followersCount === 1 ? 'seguidor' : 'seguidores'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFollowersModalTab('following');
                setFollowersModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 hover:bg-[#EDE6D3] border border-[#1A1918]/30 hover:border-[#1A1918] rounded-xl text-[11px] cursor-pointer transition group"
              title="Ver pilotos que sigue este piloto"
            >
              <strong className="text-[#1A1918] group-hover:text-[#E6332A] font-sans font-semibold text-xs transition">
                {followingCount}
              </strong>
              <span className="text-[#1A1918]/70 group-hover:text-[#1A1918] font-medium transition">
                siguiendo
              </span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F4EEDB] border border-[#1A1918]/30 rounded-xl text-[11px]">
              <Bike className="w-3.5 h-3.5 text-[#E6332A]" />
              <strong className="text-[#1A1918] font-sans font-semibold text-xs">{pilotBikes.length}</strong>
              <span className="text-[#1A1918]/70 font-medium">{pilotBikes.length === 1 ? 'moto' : 'motos'}</span>
            </div>
          </div>

          {/* Bio statement */}
          {hasCustomBio && (
            <div className="p-4 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl text-xs text-[#1A1918] leading-relaxed font-sans break-words shadow-sm font-medium">
              &ldquo;{selectedPilotProfile.bio}&rdquo;
            </div>
          )}

          {/* GPS METRICS HUD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A1918]/10 pb-2">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                Estadísticas de Temporada (Telemetría)
              </span>
              <span className="text-[10px] text-[#1A1918] font-mono font-semibold uppercase whitespace-nowrap bg-[#F7B32B] px-2 py-0.5 border border-[#1A1918]/10 rounded-md shadow-sm">
                Verificado GPS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#F4EEDB] border border-[#1A1918]/10 text-center rounded-2xl shadow-sm">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-sans font-semibold">Km en tierra</span>
                <p className="font-display font-semibold text-base sm:text-lg text-[#1A1918] mt-1 whitespace-nowrap">
                  {stats.totalKm.toLocaleString()}
                </p>
                <span className="text-[9px] text-[#1A1918]/60 block mt-0.5 font-sans font-medium">Kilómetros rodados</span>
              </div>

              <div className="p-3 bg-[#F4EEDB] border border-[#1A1918]/10 text-center rounded-2xl shadow-sm">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-sans font-semibold">Expediciones</span>
                <p className="font-display font-semibold text-base sm:text-lg text-[#1A1918] mt-1 whitespace-nowrap">
                  {stats.completedCount}
                </p>
                <span className="text-[9px] text-[#1D4477] block mt-0.5 font-sans font-bold">Rutas concluidas</span>
              </div>

              <div className="p-3 bg-[#F4EEDB] border border-[#1A1918]/10 text-center rounded-2xl shadow-sm">
                <span className="text-[9px] text-[#1A1918]/70 uppercase block font-sans font-semibold">Desnivel positivo</span>
                <p className="font-display font-semibold text-base sm:text-lg text-[#E06423] mt-1 whitespace-nowrap">
                  +{stats.elevationGain.toLocaleString()}m
                </p>
                <span className="text-[9px] text-[#1A1918]/60 block mt-0.5 font-sans font-medium">Metros de altitud</span>
              </div>
            </div>
          </div>

          {/* HANGAR / MOTORCYCLES */}
          {pilotBikes.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-semibold block border-b border-[#1A1918]/10 pb-2 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-[#1A1918] shrink-0" />
                Hangar &amp; Flotilla del Piloto ({pilotBikes.length})
              </span>
              <div className={`grid gap-3 ${pilotBikes.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {pilotBikes.map(bike => {
                  const hasPhoto = Boolean(bike.photoUrl && !isStockBikePhoto(bike.photoUrl));
                  return (
                    <div key={bike.id} className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl flex items-center gap-3.5 shadow-sm">
                      {hasPhoto ? (
                        <img 
                          src={bike.photoUrl} 
                          alt={bike.model} 
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-[#1A1918]/10 rounded-xl shrink-0 bg-[#FAF6ED]"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-[#1A1918]/10 bg-[#FAF6ED] flex flex-col items-center justify-center text-[#1A1918]/40 shrink-0">
                          <Bike className="w-6 h-6 stroke-[1.5]" />
                          <span className="text-[8px] font-mono font-bold tracking-wider mt-1 uppercase text-[#1A1918]/50">Sin foto</span>
                        </div>
                      )}
                      <div className="text-xs min-w-0 flex-1">
                        <p className="font-sans font-semibold text-[#1A1918] text-sm truncate">{bike.brand} {bike.model}</p>
                        <p className="text-[10px] text-[#E6332A] font-mono font-semibold mt-0.5 uppercase">{bike.type} • {bike.displacementCc}cc • {bike.year || 2024}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* RUTAS TRAZADAS POR EL PILOTO */}
          {pilotCreatedRoutes.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-widest font-mono font-semibold block border-b border-[#1A1918]/10 pb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                Rutas Trazadas por {selectedPilotProfile.name} ({pilotCreatedRoutes.length})
              </span>
              <div className="space-y-2">
                {pilotCreatedRoutes.map(route => (
                  <div 
                    key={route.id}
                    className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl flex items-center justify-between gap-3 text-xs transition shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-semibold text-[#1A1918] truncate">{route.title}</p>
                      <p className="text-[11px] text-[#1A1918]/70 font-sans truncate font-medium">{route.destination}, {route.state} • {route.totalKm} km ({route.offroadPercentage}% brecha)</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setSelectedPilotProfile(null);
                        enterRodada(route.rodadaId);
                      }}
                      className="px-3.5 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 font-sans font-semibold text-[10px] uppercase tracking-widest transition flex items-center gap-1 shrink-0 rounded-xl shadow-sm active:shadow-none"
                    >
                      <span>Ver ruta</span>
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
                className="w-full py-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/10 text-center font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl shadow-sm active:shadow-none"
              >
                <Phone className="w-4 h-4 text-[#1D4477]" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>

      {/* Followers & Following Modal for inspected pilot (rendered as sibling on top) */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        initialTab={followersModalTab}
        targetUser={selectedPilotProfile}
      />
    </>
  );
};
