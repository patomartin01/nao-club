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
  Mountain,
  Search,
  X,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid
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
  onOpenCreateRodada?: () => void;
  onOpenProposeRoute?: () => void;
  onOpenShareModal?: (routeTitle: string) => void;
}

export const InicioFeedView: React.FC<InicioFeedViewProps> = ({ 
  onOpenRecordRoute,
  onOpenCreateRodada,
  onOpenProposeRoute
}) => {
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

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortOrder, setSortOrder] = useState<'recent' | 'distance' | 'kudos'>('recent');

  const disciplineFilters = [
    { id: 'Todas', label: 'Todas' },
    { id: 'Carretera / Curvas', label: 'Carretera' },
    { id: 'Doble Propósito / Trail', label: 'Trail' },
    { id: 'Sport / Pista', label: 'Sport' },
    { id: 'Adventure / Maxi-Trail', label: 'Adventure' },
  ];

  const filteredActivities = activities
    .filter(act => {
      // 1. Discipline filter
      if (selectedDiscipline !== 'Todas' && act.discipline !== selectedDiscipline) {
        return false;
      }

      // 2. Real-time Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(q);
        const matchesPilot = act.pilotName.toLowerCase().includes(q);
        const matchesLocation = act.location.toLowerCase().includes(q);
        const matchesMoto = act.motoModel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPilot && !matchesLocation && !matchesMoto) {
          return false;
        }
      }

      // 3. Social relevance filter (Strava Model):
      const isOwnActivity = act.pilotId === currentUser.id;
      const isFollowedPilot = isFollowingUser(act.pilotId);
      const hasFollowedFriend = Boolean(
        act.groupInfo?.participants.some(
          p => p.userId === currentUser.id || isFollowingUser(p.userId)
        )
      );

      return isOwnActivity || isFollowedPilot || hasFollowedFriend;
    })
    .sort((a, b) => {
      if (sortOrder === 'distance') return b.distanceKm - a.distanceKm;
      if (sortOrder === 'kudos') return b.kudosCount - a.kudosCount;
      return 0; // Natural order
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
    <div className="max-w-[1440px] w-full mx-auto pb-24 font-sans space-y-4 sm:space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN (DESKTOP ONLY): PILOT SIDEBAR & STATS         */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          
          {/* Pilot Identity Card (Matchbook Dossier) */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-5 shadow-[4px_4px_0px_#1A1918] relative overflow-hidden">
            {/* Top vintage seal */}
            <div className="flex items-center justify-between text-[10px] font-display uppercase tracking-widest text-[#1A1918] border-b-2 border-[#1A1918] pb-3">
              <span className="text-[#E6332A] font-black">★ PILOT DOSSIER</span>
              <span className="font-mono text-[9px] font-bold bg-[#F4EEDB] px-1.5 py-0.5 border border-[#1A1918] rounded">NO. 0042</span>
            </div>

            <div className="flex items-center gap-4">
              <div 
                onClick={() => setActiveNavTab('tu')}
                className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] cursor-pointer group shrink-0"
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
                  className="text-base font-display font-black text-[#1A1918] uppercase tracking-wide truncate cursor-pointer hover:text-[#E6332A] transition"
                >
                  {currentUser.name}
                </h3>
                <p className="text-xs font-serif italic text-[#1A1918]/70 truncate">{currentUser.handle}</p>
                <p className="text-[11px] text-[#1A1918]/80 flex items-center gap-1 mt-0.5 font-sans font-semibold">
                  <MapPin className="w-3 h-3 text-[#E6332A]" />
                  <span>{currentUser.location}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics in High Contrast Matchbook Style */}
            <div className="grid grid-cols-3 gap-2 border-2 border-[#1A1918] py-3 text-center bg-[#F4EEDB] rounded-xl shadow-[2px_2px_0px_#1A1918]">
              <div>
                <span className="text-[9px] font-display uppercase tracking-widest text-[#1A1918]/70 block font-black">Rodadas</span>
                <span className="text-xl font-display font-black text-[#1A1918]">{currentUser.stats?.completedCount || 33}</span>
              </div>
              <div className="border-x-2 border-[#1A1918]">
                <span className="text-[9px] font-display uppercase tracking-widest text-[#1A1918]/70 block font-black">Km</span>
                <span className="text-xl font-display font-black text-[#1A1918]">{currentUser.stats?.totalKm || 2450}</span>
              </div>
              <div>
                <span className="text-[9px] font-display uppercase tracking-widest text-[#1A1918]/70 block font-black">Pilotos</span>
                <span className="text-xl font-display font-black text-[#1A1918]">15</span>
              </div>
            </div>

            {/* Active Machine Plaque */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2 text-[#1A1918]">
                <Wrench className="w-3.5 h-3.5 text-[#E6332A]" />
                <span className="text-xs font-display font-black uppercase tracking-wider text-[#1A1918]">BMW R 1250 GS</span>
              </div>
              <button 
                onClick={() => setActiveNavTab('garaje')}
                className="text-[10px] font-display tracking-widest text-[#E6332A] uppercase hover:underline transition font-black"
              >
                Hangar &gt;
              </button>
            </div>
          </div>

          {/* Desktop "Tu serie" streak widget */}
          <div className="bg-[#1A1918] text-[#FAF6ED] p-6 space-y-4 rounded-[24px] border-2 border-[#1A1918] shadow-[4px_4px_0px_#E6332A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F7B32B] animate-pulse" />
                <span className="text-xs font-display font-black uppercase tracking-widest text-[#FAF6ED]">Racha de Salidas</span>
              </div>
              <span className="text-[10px] font-display font-black text-[#F7B32B] uppercase tracking-wider bg-[#FAF6ED]/10 px-2 py-0.5 rounded border border-[#F7B32B]/30">0 Semanas</span>
            </div>
            <p className="text-xs font-serif italic text-[#FAF6ED]/70 leading-relaxed font-medium">
              &quot;In the endless pursuit of open throttle every weekend.&quot;
            </p>
            <button
              onClick={onOpenRecordRoute}
              className="btn-mustard w-full py-3 rounded-xl text-xs text-center"
            >
              Registrar Rodada
            </button>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* CENTER COLUMN: FEED OF ACTIVITIES (MOBILE & DESKTOP)      */}
        {/* ========================================================= */}
        <section className="col-span-12 lg:col-span-6 space-y-4 sm:space-y-6">
          
          {/* Mobile "Tu serie" streak banner (Hidden on desktop) */}
          <div className="lg:hidden bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[22px] sm:rounded-[24px] p-3.5 sm:p-5 shadow-[3px_3px_0px_#1A1918] sm:shadow-[4px_4px_0px_#1A1918]">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6332A] animate-pulse" />
                <span className="text-[11px] sm:text-xs font-display font-black text-[#1A1918] uppercase tracking-widest">Racha de Salidas</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-display font-black text-[#E6332A] uppercase tracking-wider bg-[#E6332A]/10 px-2 py-0.5 rounded border border-[#E6332A]/30">
                0 Semanas
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 sm:p-4 shadow-[2px_2px_0px_#1A1918]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_#1A1918]">
                  <span className="text-base font-display font-black text-[#1A1918]">0</span>
                  <span className="text-[8px] text-[#1A1918]/70 uppercase font-display font-black">Sem</span>
                </div>
                <div>
                  <p className="text-xs text-[#1A1918] font-display font-black uppercase tracking-wider">Comienza tu bitácora</p>
                  <p className="text-[11px] font-serif italic text-[#1A1918]/70 font-medium">Rueda cada fin de semana con tu tribu.</p>
                </div>
              </div>

              <button
                onClick={onOpenRecordRoute}
                className="btn-carbon w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs"
              >
                Registrar
              </button>
            </div>
          </div>



          {/* Discipline filter chips (Risograph Matchbook Style) */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            {disciplineFilters.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedDiscipline(f.id)}
                className={`px-4 py-2 text-xs font-display uppercase tracking-widest transition rounded-xl border-2 shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  selectedDiscipline === f.id
                    ? 'bg-[#E6332A] text-white border-[#1A1918] font-black'
                    : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F7B32B] font-bold'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Main Feed Content: Telemetry Table View vs Cards View */}
          {viewMode === 'table' ? (
            <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] overflow-hidden shadow-[5px_5px_0px_#1A1918]">
              <div className="px-5 py-3.5 bg-[#1A1918] text-[#FAF6ED] flex items-center justify-between border-b-2 border-[#1A1918]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">CONSOLA DE TELEMETRÍA ({filteredActivities.length})</span>
                </div>
                <span className="text-[10px] font-mono text-[#F7B32B] uppercase font-bold">[ SISTEMA EN LÍNEA ]</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4EEDB] text-[#1A1918] font-mono uppercase text-[10px] tracking-wider border-b-2 border-[#1A1918]">
                      <th className="py-3 px-4 font-bold">Piloto &amp; Montura</th>
                      <th className="py-3 px-4 font-bold">Expedición / Destino</th>
                      <th className="py-3 px-4 font-bold">Modalidad</th>
                      <th className="py-3 px-4 font-bold">Distancia</th>
                      <th className="py-3 px-4 font-bold">Desnivel</th>
                      <th className="py-3 px-4 font-bold text-center">Saludos</th>
                      <th className="py-3 px-4 font-bold text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#1A1918]">
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#1A1918]/60 font-serif italic font-medium">
                          No se encontraron expediciones con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((act) => {
                        const resolvedGroup = getResolvedGroupInfo(act.groupInfo);
                        return (
                          <tr 
                            key={act.id} 
                            onClick={() => {
                              setSelectedDetailActivity(act);
                              setIsDetailModalOpen(true);
                            }}
                            className="hover:bg-[#F4EEDB] transition cursor-pointer font-sans"
                          >
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={act.pilotAvatar} alt={act.pilotName} className="w-8 h-8 rounded-xl border-2 border-[#1A1918] object-cover shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-display font-black text-[#1A1918] uppercase tracking-wide truncate">{act.pilotName}</p>
                                  <p className="text-[10px] font-mono text-[#E6332A] font-bold truncate">{resolvedGroup?.crewName || act.motoModel}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-display font-black text-[#1A1918] uppercase tracking-wide">{act.title}</p>
                              <p className="text-[11px] font-serif italic text-[#1A1918]/70 flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-[#E6332A]" />
                                <span>{act.location}</span>
                              </p>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-[#FAF6ED] border border-[#1A1918] rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap">
                                {act.discipline.split('/')[0]}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-mono font-black text-[#1A1918] text-sm">{act.distanceKm} KM</p>
                              <p className="text-[10px] text-[#1A1918]/70 font-mono font-semibold">DUR: {act.durationText}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-mono font-bold text-[#E06423]">+{act.elevationGainM || 850}m</p>
                              <p className="text-[10px] text-[#1A1918]/60 font-serif italic font-medium">Desnivel</p>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={(e) => handleKudoClick(act, e)}
                                className={`px-2.5 py-1 rounded-lg border-2 border-[#1A1918] text-xs font-mono font-bold shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 ${
                                  act.hasKudoed ? 'bg-[#F7B32B] text-[#1A1918]' : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                                }`}
                              >
                                ✊ {act.kudosCount}
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDetailActivity(act);
                                  setIsDetailModalOpen(true);
                                }}
                                className="px-3 py-1.5 bg-[#1A1918] hover:bg-[#E6332A] text-white font-display font-black text-[10px] uppercase rounded-xl transition border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918]"
                              >
                                Detalle →
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards Feed */
            <div className="space-y-4 sm:space-y-6">
              {filteredActivities.length === 0 ? (
                <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[22px] sm:rounded-[24px] p-5 sm:p-10 text-center space-y-3.5 sm:space-y-4 shadow-[3px_3px_0px_#1A1918] sm:shadow-[4px_4px_0px_#1A1918]">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] mx-auto flex items-center justify-center shadow-[2px_2px_0px_#1A1918]">
                    <Compass className="w-6 h-6 sm:w-8 sm:h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg sm:text-2xl uppercase text-[#1A1918]">
                      El Despacho está listo para nuevas rutas
                    </h3>
                    <p className="text-xs sm:text-sm font-serif italic text-[#1A1918]/70 mt-1 max-w-md mx-auto">
                      Aún no hay publicaciones en el feed. Sé el primer piloto en grabar una rodada o proponer una expedición para la comunidad.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onOpenRecordRoute && onOpenRecordRoute()}
                      className="py-3 px-5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Grabar Primera Rodada</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProposeRoute && onOpenProposeRoute()}
                      className="py-3 px-5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                      <span>Proponer Ruta</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredActivities.map((act: ActivityPost) => {
                  const resolvedGroup = getResolvedGroupInfo(act.groupInfo);
                  return (
                  <article 
                    key={act.id} 
                    onClick={() => {
                      setSelectedDetailActivity(act);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] overflow-hidden shadow-[5px_5px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] transition-all duration-300 cursor-pointer group"
                  >
                {/* Social Context Header - Risograph Fellowship Dispatch */}
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
                        className="px-5 py-2.5 bg-[#F4EEDB] border-b-2 border-[#1A1918] flex items-center justify-between text-xs hover:bg-[#FAF6ED] transition cursor-pointer"
                        title={`Ver perfil de ${followedFriend.name}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-lg overflow-hidden border border-[#1A1918] shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={followedFriend.avatar} alt={followedFriend.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="truncate text-xs font-serif italic text-[#1A1918]">
                            <span className="font-bold not-italic underline decoration-2">
                              {followedFriend.userId === currentUser.id ? 'Tú rodaste' : `${followedFriend.name} rodó`}
                            </span>
                            <span className="ml-1.5 font-medium">
                              en esta expedición con {act.pilotName}
                            </span>
                          </p>
                        </div>
                        {resolvedGroup && (
                          <span className="text-[10px] text-[#1A1918] font-display uppercase tracking-widest bg-[#FAF6ED] px-2.5 py-0.5 border border-[#1A1918] font-black shrink-0 hidden sm:inline-block shadow-[1px_1px_0px_#1A1918]">
                            {resolvedGroup.crewName}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Header: Pilot identity, time & machine */}
                <div className="p-4 sm:p-5 flex items-start justify-between border-b-2 border-[#1A1918] bg-[#FAF6ED]">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (act.pilotId === currentUser.id) {
                        setActiveNavTab('tu');
                      } else {
                        openPilotProfileById(act.pilotId);
                      }
                    }}
                    className="flex items-center gap-3.5 cursor-pointer group/pilot"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] group-hover/pilot:ring-2 group-hover/pilot:ring-[#E6332A] transition shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={act.pilotAvatar} alt={act.pilotName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-display font-black text-[#1A1918] group-hover/pilot:text-[#E6332A] transition uppercase tracking-wide">
                          {act.pilotName}
                        </h4>
                        <span className="text-[10px] font-display uppercase tracking-widest text-[#1A1918] bg-[#F4EEDB] px-2.5 py-0.5 border border-[#1A1918] font-black rounded shadow-[1px_1px_0px_#1A1918]">
                          {act.discipline}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-serif italic text-[#1A1918]/70 mt-0.5">
                        <span>{act.dateText}</span>
                        <span>•</span>
                        <span className="text-[#1A1918] font-sans not-italic text-xs font-bold uppercase tracking-wider">{act.motoModel}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-sans text-[#1A1918]/70 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#E6332A]" />
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
                        className={`text-[10px] font-display font-black uppercase tracking-widest px-3.5 py-2 transition flex items-center gap-1.5 border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                          isFollowingUser(act.pilotId)
                            ? 'bg-[#F4EEDB] text-[#1A1918]'
                            : 'btn-carbon text-white'
                        }`}
                        title={isFollowingUser(act.pilotId) ? 'Siguiendo a este piloto' : 'Seguir a este piloto'}
                      >
                        {isFollowingUser(act.pilotId) ? (
                          <>
                            <Check className="w-3 h-3 text-[#1A1918] stroke-[3]" />
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

                    {/* Botón Guardar Ruta */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSaveRouteModalItem(act);
                      }}
                      className={`p-2 transition border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        (savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id)))
                          ? 'bg-[#E6332A] text-white'
                          : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F7B32B]'
                      }`}
                      title={(savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id))) ? 'Ruta guardada en tus listas' : 'Guardar ruta en tus listas'}
                    >
                      <Bookmark className={`w-4 h-4 ${(savedRouteIds.includes(act.id) || routeLists.some(l => l.routeIds.includes(act.id))) ? 'fill-white text-white' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title & Surface Tag */}
                <div className="px-3.5 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 bg-[#FAF6ED]">
                  <h3 className="text-lg sm:text-2xl font-display font-black text-[#1A1918] uppercase tracking-wide group-hover:text-[#E6332A] transition">
                    {act.title}
                  </h3>
                  
                  {/* Clean row of tags: Surface & Group */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {/* Surface breakdown pill */}
                    <div className="inline-flex items-center gap-2 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl px-3 py-1.5 text-xs text-[#1A1918] font-sans shadow-[2px_2px_0px_#1A1918]">
                      <span className="text-[#1A1918]/60 uppercase text-[9px] tracking-wider font-display font-black">Superficie:</span>
                      <span className="flex items-center gap-1 text-[#1A1918] font-bold" title="Carretera / Asfalto">
                        <RoadIcon className="w-3.5 h-3.5 text-[#1A1918] shrink-0" />
                        <span>{act.surfaceBreakdown.asphaltPercentage}%</span>
                      </span>
                      {act.surfaceBreakdown.dirtPercentage > 0 && (
                        <>
                          <span className="text-[#1A1918]/30">•</span>
                          <span className="flex items-center gap-1 text-[#E6332A] font-bold" title="Montaña / Terracería">
                            <Mountain className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                            <span>{act.surfaceBreakdown.dirtPercentage}%</span>
                          </span>
                        </>
                      )}
                      {act.surfaceBreakdown.curveDensity && (
                        <>
                          <span className="text-[#1A1918]/30">•</span>
                          <span className="text-[#E06423] font-bold">Curvas: {act.surfaceBreakdown.curveDensity}</span>
                        </>
                      )}
                    </div>

                    {/* Group Ride Pill - Risograph Matchbook Badge */}
                    {resolvedGroup && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroupInfo(resolvedGroup);
                          setIsGroupModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1A1918] hover:bg-[#E6332A] transition text-xs text-white border-2 border-[#1A1918] shadow-[2px_2px_0px_#F7B32B] rounded-xl group/grouppill active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                        title="Ver pilotos participantes"
                      >
                        <div className="flex -space-x-1.5 overflow-hidden items-center shrink-0">
                          {resolvedGroup.participants.slice(0, 3).map((p) => (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img 
                              key={p.userId} 
                              src={p.avatar} 
                              alt={p.name} 
                              className="w-4 h-4 rounded-full border border-white object-cover" 
                            />
                          ))}
                        </div>
                        <span className="font-display font-black uppercase tracking-wider text-white">
                          {resolvedGroup.crewName}
                        </span>
                        <span className="text-white/40">•</span>
                        <span className="text-[#F7B32B] font-mono text-[10px] font-bold">
                          {resolvedGroup.participants.length} pilotos
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover/grouppill:translate-x-0.5 transition shrink-0" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3-Column Big Metrics with Risograph Woodblock Typography */}
                <div className="px-3.5 sm:px-5 py-3 sm:py-4 grid grid-cols-3 gap-1.5 sm:gap-2 border-y-2 border-[#1A1918] bg-[#F4EEDB]">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-display uppercase tracking-widest text-[#1A1918]/60 block font-black">Distancia</span>
                    <span className="text-xl sm:text-3xl font-display font-black text-[#1A1918]">
                      {act.distanceKm.toFixed(2)} <span className="text-[10px] sm:text-xs font-normal text-[#1A1918]/60 font-mono">km</span>
                    </span>
                  </div>

                  <div className="border-x-2 border-[#1A1918] px-1.5 sm:px-4">
                    <span className="text-[9px] sm:text-[10px] font-display uppercase tracking-widest text-[#1A1918]/60 block font-black">Desnivel</span>
                    <span className="text-xl sm:text-3xl font-display font-black text-[#1A1918]">
                      {act.elevationGainM} <span className="text-[10px] sm:text-xs font-normal text-[#1A1918]/60 font-mono">m</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-display uppercase tracking-widest text-[#1A1918]/60 block font-black">Duración</span>
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <span className="text-xl sm:text-3xl font-display font-black text-[#E6332A]">
                        {act.durationText}
                      </span>
                      {act.trophiesCount && act.trophiesCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-[#E06423] font-black font-display">
                          <Trophy className="w-3.5 h-3.5 text-[#E06423]" />
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
                        src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200" 
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
                      className="absolute bottom-3 left-3 w-28 h-28 sm:w-36 sm:h-36 aspect-square rounded-2xl border-2 border-[#1A1918] bg-[#FAF6ED] shadow-[3px_3px_0px_#1A1918] overflow-hidden z-20 group/map transition-all duration-300 hover:scale-105"
                    >
                      <MiniRouteMap coordinates={act.coordinates} />

                      {/* Radar / HUD Badge */}
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#FAF6ED] border border-[#1A1918] text-[8px] font-display font-black text-[#1A1918] uppercase tracking-widest flex items-center gap-1 z-10 pointer-events-none rounded shadow-[1px_1px_0px_#1A1918]">
                        <Compass className="w-2.5 h-2.5 text-[#E6332A] animate-pulse" />
                        <span>GPS RUTA</span>
                      </div>

                      {/* Distance pill */}
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-[#1A1918] text-[9px] font-mono font-bold text-white z-10 pointer-events-none rounded">
                        {act.distanceKm} km
                      </div>
                    </div>
                  )}

                  {/* View Details Hint on Top Right */}
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-[#FAF6ED] border-2 border-[#1A1918] text-[10px] font-display font-black text-[#1A1918] uppercase tracking-wider flex items-center gap-1.5 opacity-0 group-hover/gallery:opacity-100 transition z-20 rounded-xl shadow-[2px_2px_0px_#1A1918]">
                    <Maximize2 className="w-3 h-3 text-[#E6332A]" />
                    <span>Ver detalle</span>
                  </div>
                </div>

                {/* Social Proof: Kudos Avatars Counter */}
                <div className="px-5 py-3 flex items-center justify-between text-xs text-[#1A1918] border-b-2 border-[#1A1918] bg-[#FAF6ED]">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {act.kudosAvatars.slice(0, 3).map((av, idx) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={idx} src={av} alt="saludo" className="w-5 h-5 rounded-full border border-[#1A1918] object-cover shadow-sm" />
                      ))}
                    </div>
                    <span className="text-xs font-sans font-bold">
                      {act.kudosCount} {act.kudosCount === 1 ? 'saludo biker' : 'saludos bikers'}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveCommentBox(activeCommentBox === act.id ? null : act.id);
                    }}
                    className="text-xs font-sans text-[#1A1918]/70 hover:text-[#1A1918] font-bold transition flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>{act.commentsCount} {act.commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
                  </button>
                </div>

                {/* Action Buttons: Saludo Biker, Compartir */}
                <div className="px-4 py-2.5 flex items-center justify-around text-xs border-b-2 border-[#1A1918] bg-[#FAF6ED] gap-2">
                  <button
                    onClick={(e) => handleKudoClick(act, e)}
                    className={`flex-1 py-2.5 flex items-center justify-center gap-2 font-display uppercase tracking-wider text-xs font-black transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                      act.hasKudoed ? 'bg-[#F7B32B] text-[#1A1918]' : 'bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918]'
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
                    className="flex-1 py-2.5 flex items-center justify-center gap-2 text-[#1A1918] bg-[#F4EEDB] hover:bg-[#FAF6ED] font-display uppercase tracking-wider text-xs font-black transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    title="Compartir rodada en tus tribus, redes o enlace"
                  >
                    <Share2 className="w-4 h-4 text-[#E6332A]" />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Inline Comments Thread & Form */}
                {activeCommentBox === act.id && (
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="p-5 bg-[#F4EEDB] border-t-2 border-[#1A1918] space-y-3 cursor-default"
                  >
                    {/* Render comments list if any */}
                    {act.comments && act.comments.length > 0 && (
                      <div className="space-y-2 mb-3">
                        <span className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black tracking-wider block">
                          Comentarios ({act.comments.length})
                        </span>
                        {act.comments.map((comm) => (
                          <div key={comm.id} className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_#1A1918]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={comm.userAvatar} 
                              alt={comm.userName} 
                              className="w-8 h-8 rounded-lg object-cover border border-[#1A1918] shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wider">{comm.userName}</span>
                                <span className="text-[10px] text-[#1A1918]/60 font-mono font-bold">{comm.createdAt}</span>
                              </div>
                              <p className="text-xs text-[#1A1918] mt-0.5 font-sans leading-relaxed font-medium">
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
                        className="flex-1 bg-[#FAF6ED] border-2 border-[#1A1918] px-4 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:ring-1 focus:ring-[#1A1918] font-sans font-medium rounded-xl shadow-[2px_2px_0px_#1A1918]"
                      />
                      <button
                        onClick={() => handleSendComment(act.id)}
                        className="btn-carbon px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[#F7B32B]" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </div>
                )}
                </article>
                );
              })
            )}
          </div>
        )}

        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (DESKTOP ONLY): ROADBOOKS & CHAPTERS         */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          
          {/* Próximas Expediciones (Risograph Roadbooks) */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-4 shadow-[4px_4px_0px_#1A1918]">
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E6332A]" />
                <h4 className="text-xs font-display font-black text-[#1A1918] uppercase tracking-widest">Calendario de Salidas</h4>
              </div>
              <button
                onClick={() => setActiveNavTab('tribus')}
                className="text-[10px] font-display font-black text-[#E6332A] uppercase tracking-wider hover:underline transition"
              >
                Ver &gt;
              </button>
            </div>

            <div className="space-y-3">
              {rodadas.slice(0, 2).map(r => (
                <div 
                  key={r.id} 
                  onClick={() => enterRodada(r.id)}
                  className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3.5 space-y-1.5 hover:bg-[#FAF6ED] transition cursor-pointer group shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <span className="text-[10px] font-display uppercase tracking-widest text-[#E06423] font-black">{r.category}</span>
                  <h5 className="text-xs font-display font-black text-[#1A1918] group-hover:text-[#E6332A] transition uppercase tracking-wide">{r.title}</h5>
                  <div className="flex items-center justify-between text-[11px] font-sans text-[#1A1918]/70 pt-1.5 border-t border-[#1A1918]/20 font-medium">
                    <span>{r.startDate}</span>
                    <span className="text-[#1A1918] font-bold font-mono">{r.attendees.length} pilotos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motorcycle Chapters / Clubs */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-3 shadow-[4px_4px_0px_#1A1918]">
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#E6332A]" />
                <h4 className="text-xs font-display font-black text-[#1A1918] uppercase tracking-widest">Tus Tribus</h4>
              </div>
            </div>

            <div className="space-y-2.5">
              {crews
                .filter(c => c.members.some(m => m.userId === currentUser.id))
                .slice(0, 2)
                .map(c => (
                <div 
                  key={c.id}
                  onClick={() => enterCrew(c.id)}
                  className="flex items-center justify-between p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl hover:bg-[#FAF6ED] transition cursor-pointer group shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wider group-hover:text-[#E6332A] transition truncate">{c.name}</p>
                    <p className="text-[11px] font-serif italic text-[#1A1918]/70 font-medium">{c.members.length} miembros • {c.baseCity}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#1A1918]/50 group-hover:text-[#1A1918] group-hover:translate-x-0.5 transition shrink-0" />
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
