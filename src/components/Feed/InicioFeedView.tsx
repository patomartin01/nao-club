'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { ActivityPost, ActivityGroupInfo, ActivityParticipant } from '../../types';
import { 
  Flame, 
  MessageSquare, 
  Share2, 
  Trophy, 
  MapPin, 
  Send,
  Calendar,
  Compass,
  Users,
  ChevronRight,
  Wrench,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Check,
  Plus,
  Maximize2,
  Bookmark,
  Mountain
} from 'lucide-react';

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 19L8 5h8l4 14" />
    <line x1="12" y1="8" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="16" />
  </svg>
);
import { BikerSaluteIcon } from '../Icons/BikerSaluteIcon';
import { ActivityDetailModal } from '../Modals/ActivityDetailModal';
import { GroupParticipantsModal } from '../Modals/GroupParticipantsModal';
import { SaveToListModal } from '../Modals/SaveToListModal';
import { ShareModal } from '../Modals/ShareModal';
import { triggerExhaustSmoke } from '../../utils/exhaustSmoke';
import confetti from 'canvas-confetti';

// Dynamic import for Leaflet mini-map
const MiniRouteMap = dynamic(
  () => import('../Map/MiniRouteMap'),
  { ssr: false, loading: () => <div className="h-48 w-full bg-[#12100E] animate-pulse flex items-center justify-center font-mono text-xs text-ash">Cargando GPS...</div> }
);

interface InicioFeedViewProps {
  onOpenRecordRoute: () => void;
  onOpenShareModal?: (routeTitle: string) => void;
}

export const InicioFeedView: React.FC<InicioFeedViewProps> = ({ onOpenRecordRoute }) => {
  const { 
    activities, 
    toggleKudo, 
    addActivityComment, 
    openPilotProfileById,
    currentUser,
    users,
    motorcycles,
    rodadas,
    crews,
    setActiveNavTab,
    enterRodada,
    enterCrew,
    isFollowingUser,
    toggleFollowUser,
    savedRouteIds,
    routeLists
  } = useApp();

  // Helper to dynamically resolve groupInfo against live crews and users state
  const getResolvedGroupInfo = (groupInfo?: ActivityGroupInfo): ActivityGroupInfo | undefined => {
    if (!groupInfo) return undefined;
    const linkedCrew = groupInfo.crewId ? crews.find(c => c.id === groupInfo.crewId) : null;
    if (!linkedCrew) return groupInfo;

    const crewName = linkedCrew.name || groupInfo.crewName;
    const existingMap = new Map((groupInfo.participants || []).map(p => [p.userId, p]));

    const crewParticipants: ActivityParticipant[] = linkedCrew.members.map(m => {
      const existing = existingMap.get(m.userId);
      const u = users.find(user => user.id === m.userId);
      const b = motorcycles.find(moto => moto.userId === m.userId);
      return {
        userId: m.userId,
        name: u?.name || existing?.name || m.userId,
        handle: u?.handle || existing?.handle || `@${m.userId}`,
        avatar: u?.avatar || existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: m.role || existing?.role || 'Rider',
        motoModel: b ? `${b.brand} ${b.model}` : (existing?.motoModel || 'Doble Propósito')
      };
    });

    // Also keep any extra riders that were recorded on this specific activity
    groupInfo.participants.forEach(p => {
      if (!crewParticipants.some(cp => cp.userId === p.userId)) {
        crewParticipants.push(p);
      }
    });

    return {
      ...groupInfo,
      crewName,
      participants: crewParticipants
    };
  };

  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');
  const [selectedDetailActivity, setSelectedDetailActivity] = useState<ActivityPost | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<ActivityGroupInfo | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState<boolean>(false);
  const [saveRouteModalItem, setSaveRouteModalItem] = useState<ActivityPost | null>(null);
  const [shareModalItem, setShareModalItem] = useState<ActivityPost | null>(null);

  const disciplineFilters = [
    { id: 'Todas', label: 'Todas' },
    { id: 'Carretera / Curvas', label: 'Carretera' },
    { id: 'Doble Propósito / Trail', label: 'Trail' },
    { id: 'Sport / Pista', label: 'Sport' },
    { id: 'Adventure / Maxi-Trail', label: 'Adventure' },
  ];

  const filteredActivities = activities.filter(act => {
    // 1. Discipline filter
    if (selectedDiscipline !== 'Todas' && act.discipline !== selectedDiscipline) {
      return false;
    }

    // 2. Social relevance filter (Strava Model):
    // Show if:
    // a) It is your own activity
    // b) You follow the pilot directly
    // c) A followed friend (or you) participated in this group ride
    const isOwnActivity = act.pilotId === currentUser.id;
    const isFollowedPilot = isFollowingUser(act.pilotId);
    const hasFollowedFriend = Boolean(
      act.groupInfo?.participants.some(
        p => p.userId === currentUser.id || isFollowingUser(p.userId)
      )
    );

    return isOwnActivity || isFollowedPilot || hasFollowedFriend;
  });

  const handleKudoClick = (activity: ActivityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleKudo(activity.id);
    triggerExhaustSmoke(e, { motoModel: activity.motoModel, discipline: activity.discipline });
  };

  const handleSendComment = (activityId: string) => {
    if (!commentInput.trim()) return;
    addActivityComment(activityId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="max-w-[1440px] w-full mx-auto pb-28 font-mono">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (DESKTOP ONLY): PILOT SIDEBAR & STATS         */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          
          {/* Pilot Identity Card */}
          <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveNavTab('tu')}
                className="w-14 h-14 rounded-full overflow-hidden border-2 border-earth ring-2 ring-earth/20 cursor-pointer group shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition" 
                />
              </div>
              <div className="min-w-0">
                <h3 
                  onClick={() => setActiveNavTab('tu')}
                  className="text-sm font-bold text-white uppercase truncate cursor-pointer hover:text-earth transition"
                >
                  {currentUser.name}
                </h3>
                <p className="text-[11px] text-ash truncate">{currentUser.handle}</p>
                <p className="text-[10px] text-earth/90 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{currentUser.location}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 border-y border-white/[0.08] py-3 text-center bg-black/30">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Rodadas</span>
                <span className="text-sm font-bold text-white">{currentUser.stats?.completedCount || 33}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Kilómetros</span>
                <span className="text-sm font-bold text-white">{currentUser.stats?.totalKm || 2450}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Seguidores</span>
                <span className="text-sm font-bold text-white">15</span>
              </div>
            </div>

            {/* Active Machine */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2 text-ash">
                <Wrench className="w-3.5 h-3.5 text-earth" />
                <span className="text-[11px] text-chalk font-medium">BMW R 1250 GS</span>
              </div>
              <button 
                onClick={() => setActiveNavTab('garaje')}
                className="text-[10px] text-earth uppercase hover:underline"
              >
                Hangar &gt;
              </button>
            </div>
          </div>

          {/* Desktop "Tu serie" streak widget */}
          <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-earth animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tu serie</span>
              </div>
              <span className="text-[10px] text-earth uppercase">0 Sem</span>
            </div>
            <p className="text-xs text-ash leading-relaxed">
              Mantén el hábito saliendo a rodar cada fin de semana.
            </p>
            <button
              onClick={onOpenRecordRoute}
              className="w-full py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 text-center"
            >
              Registrar actividad
            </button>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: FEED OF ACTIVITIES (MOBILE & DESKTOP)      */}
        {/* ========================================================= */}
        <section className="col-span-12 lg:col-span-6 space-y-6">
          
          {/* Mobile "Tu serie" streak banner (Hidden on desktop) */}
          <div className="lg:hidden bg-[#0F0D0C] border border-white/10 p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-earth animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tu serie</span>
              </div>
              <span className="text-[10px] text-earth uppercase cursor-pointer hover:underline">
                0 Semanas
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 border border-white/5 p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">0</span>
                  <span className="text-[7px] text-ash uppercase">Sem</span>
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Empieza tu serie registrando una rodada.</p>
                  <p className="text-[10px] text-ash">Mantén el hábito saliendo cada fin de semana.</p>
                </div>
              </div>

              <button
                onClick={onOpenRecordRoute}
                className="w-full sm:w-auto px-4 py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 text-center"
              >
                Registrar ahora
              </button>
            </div>
          </div>

          {/* Discipline filter chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 py-1">
            {disciplineFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedDiscipline(f.id)}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider transition border ${
                  selectedDiscipline === f.id
                    ? 'bg-earth text-white border-earth font-bold'
                    : 'bg-white/[0.02] text-ash border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity feed list */}
          <div className="space-y-6">
            {filteredActivities.map((act: ActivityPost) => {
              const resolvedGroup = getResolvedGroupInfo(act.groupInfo);
              return (
              <article 
                key={act.id} 
                onClick={() => {
                  setSelectedDetailActivity(act);
                  setIsDetailModalOpen(true);
                }}
                className="bg-[#0D0B0A] border border-white/10 overflow-hidden shadow-xl hover:border-white/25 transition-all cursor-pointer group"
              >
                {/* Social Context Header - Estilo Strava ("Rodó con...") */}
                {(() => {
                  const isDirectlyFollowed = isFollowingUser(act.pilotId) || act.pilotId === currentUser.id;
                  const followedFriend = resolvedGroup?.participants.find(
                    p => p.userId !== act.pilotId && (isFollowingUser(p.userId) || p.userId === currentUser.id)
                  );

                  if (!isDirectlyFollowed && followedFriend) {
                    return (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (followedFriend.userId === currentUser.id) {
                            setActiveNavTab('tu');
                          } else {
                            openPilotProfileById(followedFriend.userId);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-earth/20 via-white/[0.04] to-black/40 border-b border-white/10 flex items-center justify-between text-xs hover:bg-earth/25 transition cursor-pointer"
                        title={`Ver perfil de ${followedFriend.name}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-5 h-5 rounded-full overflow-hidden border border-earth shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={followedFriend.avatar} alt={followedFriend.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="truncate text-[11px]">
                            <span className="text-white font-bold hover:underline">
                              {followedFriend.userId === currentUser.id ? 'Tú rodaste' : `${followedFriend.name} rodó`}
                            </span>
                            <span className="text-ash ml-1.5">
                              en esta salida grupal con {act.pilotName}
                            </span>
                          </p>
                        </div>
                        {resolvedGroup && (
                          <span className="text-[9px] text-earth font-mono uppercase bg-earth/10 px-2 py-0.5 border border-earth/25 shrink-0 hidden sm:inline-block">
                            {resolvedGroup.crewName}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Header: Pilot identity, time & device */}
                <div className="p-4 sm:p-5 flex items-start justify-between border-b border-white/[0.06]">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (act.pilotId === currentUser.id) {
                        setActiveNavTab('tu');
                      } else {
                        openPilotProfileById(act.pilotId);
                      }
                    }}
                    className="flex items-center gap-3 cursor-pointer group/pilot"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 group-hover/pilot:border-earth transition shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={act.pilotAvatar} alt={act.pilotName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover/pilot:text-earth transition">
                          {act.pilotName}
                        </h4>
                        <span className="text-[10px] text-earth bg-earth/10 px-1.5 py-0.5 border border-earth/20 font-bold uppercase">
                          {act.discipline}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-ash mt-0.5">
                        <span>{act.dateText}</span>
                        <span>•</span>
                        <span className="text-earth font-bold uppercase">{act.motoModel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-ash mt-0.5">
                        <MapPin className="w-3 h-3 text-earth/80" />
                        <span>{act.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {act.pilotId !== currentUser.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFollowUser(act.pilotId);
                        }}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                          isFollowingUser(act.pilotId)
                            ? 'bg-white/10 hover:bg-white/15 text-chalk border border-white/15'
                            : 'bg-earth/20 hover:bg-earth text-earth hover:text-white border border-earth/40 hover:border-earth'
                        }`}
                        title={isFollowingUser(act.pilotId) ? 'Siguiendo a este piloto' : 'Seguir a este piloto'}
                      >
                        {isFollowingUser(act.pilotId) ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Siguiendo</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span>Seguir</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Botón Guardar Ruta (Arriba a la derecha, solo icono) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaveRouteModalItem(act);
                      }}
                      className={`p-2 rounded-full transition active:scale-90 border ${
                        (savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id)))
                          ? 'bg-earth/20 border-earth text-earth'
                          : 'bg-white/[0.04] border-white/15 text-ash hover:text-white hover:border-white/30'
                      }`}
                      title={(savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id))) ? 'Ruta guardada en tus listas' : 'Guardar ruta en tus listas'}
                    >
                      <Bookmark className={`w-4 h-4 ${(savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id))) ? 'fill-earth text-earth' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title & Surface Tag */}
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight group-hover:text-earth transition">
                    {act.title}
                  </h3>
                  
                  {/* Clean row of tags: Surface & Group */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {/* Surface breakdown pill */}
                    <div className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1 text-[11px] rounded-full text-chalk">
                      <span className="text-ash uppercase text-[9px] tracking-wider font-semibold">Superficie:</span>
                      <span className="flex items-center gap-1 text-white font-bold" title="Carretera / Asfalto">
                        <RoadIcon className="w-3 h-3 text-white shrink-0" />
                        <span>{act.surfaceBreakdown.asphaltPercentage}%</span>
                      </span>
                      {act.surfaceBreakdown.dirtPercentage > 0 && (
                        <>
                          <span className="text-ash/40">•</span>
                          <span className="flex items-center gap-1 text-earth font-bold" title="Montaña / Terracería">
                            <Mountain className="w-3 h-3 text-earth shrink-0" />
                            <span>{act.surfaceBreakdown.dirtPercentage}%</span>
                          </span>
                        </>
                      )}
                      {act.surfaceBreakdown.curveDensity && (
                        <>
                          <span className="text-ash/40">•</span>
                          <span className="text-amber-400 font-bold">Curvas: {act.surfaceBreakdown.curveDensity}</span>
                        </>
                      )}
                    </div>

                    {/* Group Ride Pill - Clean, rounded, elegant */}
                    {resolvedGroup && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroupInfo(resolvedGroup);
                          setIsGroupModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-earth/40 transition text-[11px] text-chalk group/grouppill"
                        title="Ver pilotos participantes"
                      >
                        <div className="flex -space-x-1.5 overflow-hidden items-center shrink-0">
                          {resolvedGroup.participants.slice(0, 3).map((p) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                              key={p.userId} 
                              src={p.avatar} 
                              alt={p.name} 
                              className="w-4 h-4 rounded-full border border-black object-cover" 
                            />
                          ))}
                        </div>
                        <span className="text-white font-bold group-hover/grouppill:text-earth transition">
                          {resolvedGroup.crewName}
                        </span>
                        <span className="text-ash/40">•</span>
                        <span className="text-ash font-mono text-[10px] group-hover/grouppill:text-white transition">
                          {resolvedGroup.participants.length} pilotos
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-ash group-hover/grouppill:text-earth group-hover/grouppill:translate-x-0.5 transition shrink-0" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3-Column Big Metrics */}
                <div className="px-4 sm:px-5 py-3 grid grid-cols-3 gap-2 border-y border-white/[0.06] bg-black/30">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Distancia</span>
                    <span className="text-lg sm:text-xl font-bold text-white font-mono">
                      {act.distanceKm.toFixed(2)} <span className="text-xs font-normal text-ash">km</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Desnivel / Vel</span>
                    <span className="text-lg sm:text-xl font-bold text-white font-mono">
                      {act.elevationGainM} <span className="text-xs font-normal text-ash">m</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Duración</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg sm:text-xl font-bold text-white font-mono">
                        {act.durationText}
                      </span>
                      {act.trophiesCount && act.trophiesCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-400 font-bold">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          {act.trophiesCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Media Section: Photo Gallery with Floating Square Mini Route Map */}
                <div 
                  onClick={() => {
                    setSelectedDetailActivity(act);
                    setIsDetailModalOpen(true);
                  }}
                  className="relative h-64 sm:h-80 w-full bg-[#0E0C0A] border-b border-white/[0.06] overflow-hidden group/gallery cursor-pointer select-none"
                >
                  {/* Photo Gallery Grid */}
                  {act.photos && act.photos.length > 0 ? (
                    <div className="w-full h-full">
                      {act.photos.length === 1 && (
                        <div className="w-full h-full overflow-hidden bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={act.photos[0]} 
                            alt={act.title} 
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200';
                            }}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                          />
                        </div>
                      )}

                      {act.photos.length === 2 && (
                        <div className="grid grid-cols-2 gap-1 w-full h-full bg-black">
                          <div className="w-full h-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={act.photos[0]} 
                              alt={`${act.title} 1`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200';
                              }}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                            />
                          </div>
                          <div className="w-full h-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={act.photos[1]} 
                              alt={`${act.title} 2`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200';
                              }}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                            />
                          </div>
                        </div>
                      )}

                      {act.photos.length >= 3 && (
                        <div className="grid grid-cols-3 gap-1 w-full h-full bg-black">
                          <div className="w-full h-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={act.photos[0]} 
                              alt={`${act.title} 1`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200';
                              }}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                            />
                          </div>
                          <div className="w-full h-full overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={act.photos[1]} 
                              alt={`${act.title} 2`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200';
                              }}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                            />
                          </div>
                          <div className="w-full h-full overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={act.photos[2]} 
                              alt={`${act.title} 3`} 
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200';
                              }}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105" 
                            />
                            {act.photos.length > 3 && (
                              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition group-hover/gallery:bg-black/50">
                                <div className="w-10 h-10 rounded-full bg-black/70 border-2 border-white/80 flex items-center justify-center mb-1 group-hover/gallery:scale-110 transition shadow-lg">
                                  <Plus className="w-6 h-6 text-white stroke-[2.5]" />
                                </div>
                                <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-white drop-shadow">
                                  +{act.photos.length - 3} {act.photos.length - 3 === 1 ? 'FOTO' : 'FOTOS'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Fallback when no photos uploaded: show scenic trail backdrop */
                    <div className="w-full h-full relative overflow-hidden bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200" 
                        alt={act.title} 
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  )}

                  {/* Gradient shadow for contrast */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Floating Square Mini Route Map Layer (Layer on top of photos) */}
                  {act.coordinates && act.coordinates.length > 0 && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDetailActivity(act);
                        setIsDetailModalOpen(true);
                      }}
                      title="Ver mapa completo e interactivo de la ruta"
                      className="absolute bottom-3 left-3 w-28 h-28 sm:w-36 sm:h-36 aspect-square rounded-md border-2 border-white/40 hover:border-earth bg-[#0A0A0A]/95 shadow-[0_10px_30px_rgba(0,0,0,0.9)] overflow-hidden z-20 group/map transition-all duration-300 hover:scale-105"
                    >
                      <MiniRouteMap coordinates={act.coordinates} />

                      {/* Radar / HUD Badge */}
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/85 backdrop-blur-sm border border-white/20 text-[8px] font-mono font-bold text-earth uppercase tracking-widest flex items-center gap-1 z-10 pointer-events-none">
                        <Compass className="w-2.5 h-2.5 text-earth animate-pulse" />
                        <span>GPS RUTA</span>
                      </div>

                      {/* Distance pill */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 backdrop-blur-sm border border-white/15 text-[8px] font-mono text-white/90 z-10 pointer-events-none">
                        {act.distanceKm} km
                      </div>
                    </div>
                  )}

                  {/* View Details Hint on Top Right */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm border border-white/20 text-[9px] font-mono text-ash hover:text-white uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover/gallery:opacity-100 transition z-20">
                    <Maximize2 className="w-3 h-3 text-earth" />
                    <span>Ver detalle</span>
                  </div>
                </div>

                {/* Social Proof: Kudos Avatars Counter */}
                <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-ash border-b border-white/[0.06] bg-black/20">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {act.kudosAvatars.slice(0, 3).map((av, idx) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={idx} src={av} alt="saludo" className="w-5 h-5 rounded-full border border-black object-cover" />
                      ))}
                    </div>
                    <span className="text-[11px]">
                      {act.kudosCount} {act.kudosCount === 1 ? 'saludo biker' : 'saludos bikers'}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentBox(activeCommentBox === act.id ? null : act.id);
                    }}
                    className="text-[11px] text-ash hover:text-earth transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{act.commentsCount} {act.commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
                  </button>
                </div>

                {/* Action Buttons: Saludo Biker, Compartir */}
                <div className="px-3 py-2 flex items-center justify-around text-xs border-b border-white/[0.04]">
                  <button
                    onClick={(e) => handleKudoClick(act, e)}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 transition active:scale-95 ${
                      act.hasKudoed ? 'text-earth font-bold' : 'text-ash hover:text-white'
                    }`}
                  >
                    <BikerSaluteIcon className="w-4 h-4" active={act.hasKudoed} />
                    <span>{act.hasKudoed ? 'Saludado' : 'Saludo'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareModalItem(act);
                    }}
                    className="flex-1 py-2 flex items-center justify-center gap-2 text-ash hover:text-white transition active:scale-95"
                    title="Compartir rodada en tus tribus, redes o enlace"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Inline Comments Thread & Form */}
                {activeCommentBox === act.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-4 bg-black/60 border-t border-white/[0.08] space-y-3 cursor-default"
                  >
                    {/* Render comments list if any */}
                    {act.comments && act.comments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <span className="text-[10px] text-ash uppercase font-bold tracking-wider block">
                          Comentarios ({act.comments.length})
                        </span>
                        {act.comments.map((comm) => (
                          <div key={comm.id} className="p-2.5 bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={comm.userAvatar} 
                              alt={comm.userName} 
                              className="w-7 h-7 rounded-full object-cover border border-white/15 shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white uppercase">{comm.userName}</span>
                                <span className="text-[9px] text-ash font-mono">{comm.createdAt}</span>
                              </div>
                              <p className="text-xs text-chalk/90 mt-0.5 font-sans leading-relaxed">
                                {comm.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(act.id); }}
                        placeholder="Escribe un comentario a la rodada..."
                        className="flex-1 bg-white/[0.04] border border-white/15 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth font-mono"
                      />
                      <button
                        onClick={() => handleSendComment(act.id)}
                        className="px-3.5 py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase transition flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </div>
                )}
                </article>
                );
              })}
          </div>

        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (DESKTOP ONLY): PRÓXIMAS RODADAS             */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          
          {/* Próximas Rodadas */}
          <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-earth" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Próximas Salidas</h4>
              </div>
              <button
                onClick={() => setActiveNavTab('grupos')}
                className="text-[10px] text-earth uppercase hover:underline"
              >
                Ver &gt;
              </button>
            </div>

            <div className="space-y-3">
              {rodadas.slice(0, 2).map(r => (
                <div 
                  key={r.id} 
                  onClick={() => enterRodada(r.id)}
                  className="bg-black/40 border border-white/5 p-3 space-y-1 hover:border-earth/40 transition cursor-pointer group"
                >
                  <span className="text-[9px] text-earth font-bold uppercase">{r.category}</span>
                  <h5 className="text-xs font-bold text-white group-hover:text-earth transition">{r.title}</h5>
                  <div className="flex items-center justify-between text-[10px] text-ash pt-1">
                    <span>{r.startDate}</span>
                    <span className="text-chalk">{r.attendees.length} pilotos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moto Clubes Activos */}
          <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-earth" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tus Tribus</h4>
              </div>
            </div>

            <div className="space-y-2">
              {crews
                .filter(c => c.members.some(m => m.userId === currentUser.id))
                .slice(0, 2)
                .map(c => (
                <div 
                  key={c.id}
                  onClick={() => enterCrew(c.id)}
                  className="flex items-center justify-between p-2 hover:bg-white/[0.03] transition cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white uppercase truncate">{c.name}</p>
                    <p className="text-[10px] text-ash">{c.members.length} miembros • {c.baseCity}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-ash shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* MODAL: DETALLE COMPLETO DE RODADA Y TELEMETRÍA */}
      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        activity={activities.find(a => a.id === selectedDetailActivity?.id) || selectedDetailActivity}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailActivity(null);
        }}
        onOpenPilotProfile={openPilotProfileById}
        onToggleSaludo={(id) => toggleKudo(id)}
        onAddComment={(id, text) => addActivityComment(id, text)}
      />

      {/* MODAL: PARTICIPANTES DE RODADA EN GRUPO */}
      <GroupParticipantsModal
        isOpen={isGroupModalOpen}
        groupInfo={selectedGroupInfo}
        onClose={() => {
          setIsGroupModalOpen(false);
          setSelectedGroupInfo(null);
        }}
        onOpenPilotProfile={openPilotProfileById}
        onEnterCrew={(cId) => enterCrew(cId)}
      />

      {/* MODAL: GUARDAR RUTA EN LISTAS */}
      <SaveToListModal
        isOpen={Boolean(saveRouteModalItem)}
        route={saveRouteModalItem}
        onClose={() => setSaveRouteModalItem(null)}
      />

      {/* MODAL: COMPARTIR RODADA */}
      <ShareModal
        isOpen={Boolean(shareModalItem)}
        item={shareModalItem ? {
          id: shareModalItem.id,
          title: shareModalItem.title,
          pilotName: shareModalItem.pilotName,
          distanceKm: shareModalItem.distanceKm,
          motoModel: shareModalItem.motoModel,
          discipline: shareModalItem.discipline,
          coverImage: shareModalItem.photos && shareModalItem.photos.length > 0 ? shareModalItem.photos[0] : undefined,
          type: 'activity'
        } : null}
        onClose={() => setShareModalItem(null)}
      />

    </div>
  );
};
