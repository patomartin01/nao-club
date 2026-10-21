'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useApp } from '../../context/AppContext';
import { ActivityPost } from '../../types';
import { 
  Flame, 
  ThumbsUp, 
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
  TrendingUp
} from 'lucide-react';
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
    challenges,
    toggleJoinChallenge,
    rodadas,
    crews,
    setActiveNavTab,
    enterRodada,
    enterCrew
  } = useApp();

  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todas');

  const disciplines = ['Todas', 'Carretera / Curvas', 'Doble Propósito / Trail', 'Sport / Pista', 'Adventure / Maxi-Trail'];

  const filteredActivities = selectedDiscipline === 'Todas'
    ? activities
    : activities.filter(a => a.discipline === selectedDiscipline);

  const handleKudoClick = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleKudo(activityId);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 }
    });
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

          {/* Navigation Shortcuts */}
          <div className="bg-[#0D0B0A] border border-white/10 p-2 space-y-1 text-xs">
            <button
              onClick={() => setActiveNavTab('tu')}
              className="w-full text-left px-3 py-2 text-ash hover:text-white hover:bg-white/[0.04] transition flex items-center justify-between"
            >
              <span>Ver perfil de piloto</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveNavTab('mapas')}
              className="w-full text-left px-3 py-2 text-ash hover:text-white hover:bg-white/[0.04] transition flex items-center justify-between"
            >
              <span>Explorador de mapas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveNavTab('grupos')}
              className="w-full text-left px-3 py-2 text-ash hover:text-white hover:bg-white/[0.04] transition flex items-center justify-between"
            >
              <span>Moto clubes y retos</span>
              <ChevronRight className="w-3.5 h-3.5" />
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {disciplines.map(disc => (
              <button
                key={disc}
                onClick={() => setSelectedDiscipline(disc)}
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider whitespace-nowrap transition border ${
                  selectedDiscipline === disc
                    ? 'bg-earth text-white border-earth font-bold'
                    : 'bg-white/[0.02] text-ash border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {disc}
              </button>
            ))}
          </div>

          {/* Activity feed list */}
          <div className="space-y-6">
            {filteredActivities.map((act: ActivityPost) => (
              <article 
                key={act.id} 
                className="bg-[#0D0B0A] border border-white/10 overflow-hidden shadow-xl"
              >
                {/* Header: Pilot identity, time & device */}
                <div className="p-4 sm:p-5 flex items-start justify-between border-b border-white/[0.06]">
                  <div 
                    onClick={() => openPilotProfileById(act.pilotId)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 group-hover:border-earth transition shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={act.pilotAvatar} alt={act.pilotName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white group-hover:text-earth transition">
                          {act.pilotName}
                        </h4>
                        <span className="text-[10px] text-earth bg-earth/10 px-1.5 py-0.5 border border-earth/20 font-bold uppercase">
                          {act.discipline}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-ash mt-0.5">
                        <span>{act.dateText}</span>
                        <span>•</span>
                        <span className="text-chalk/70">{act.device}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-ash mt-0.5">
                        <MapPin className="w-3 h-3 text-earth/80" />
                        <span>{act.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-ash bg-white/[0.03] px-2 py-1 border border-white/10 uppercase block">
                      🏍️ {act.motoModel}
                    </span>
                  </div>
                </div>

                {/* Title & Surface Tag */}
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                    {act.title}
                  </h3>
                  
                  {/* Surface breakdown pill (Strava gravel/asphalt feature adapted to all bikes) */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-black/60 border border-white/10 px-2.5 py-1 text-[10px]">
                      <span className="text-ash uppercase">Superficie:</span>
                      <span className="text-white font-bold">{act.surfaceBreakdown.asphaltPercentage}% Asfalto</span>
                      {act.surfaceBreakdown.dirtPercentage > 0 && (
                        <>
                          <span className="text-ash">•</span>
                          <span className="text-earth font-bold">{act.surfaceBreakdown.dirtPercentage}% Terracería</span>
                        </>
                      )}
                      {act.surfaceBreakdown.curveDensity && (
                        <>
                          <span className="text-ash">•</span>
                          <span className="text-amber-400 font-bold">Curvas: {act.surfaceBreakdown.curveDensity}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3-Column Big Metrics (Strava Gold Standard) */}
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

                {/* Interactive Leaflet Route Map Preview */}
                <div className="h-60 sm:h-72 w-full bg-[#12100E] relative border-b border-white/[0.06]">
                  <MiniRouteMap coordinates={act.coordinates} />
                </div>

                {/* Social Proof: Kudos Avatars Counter */}
                <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-ash border-b border-white/[0.06] bg-black/20">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {act.kudosAvatars.slice(0, 3).map((av, idx) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img key={idx} src={av} alt="kudo" className="w-5 h-5 rounded-full border border-black object-cover" />
                      ))}
                    </div>
                    <span className="text-[11px]">
                      {act.kudosCount} {act.kudosCount === 1 ? 'otorgó respetos' : 'otorgaron respetos'}
                    </span>
                  </div>

                  <span className="text-[11px] text-ash">
                    {act.commentsCount} comentarios
                  </span>
                </div>

                {/* Action Buttons: Respetos (Kudos), Comentarios, Compartir */}
                <div className="px-3 py-2 flex items-center justify-around text-xs">
                  <button
                    onClick={(e) => handleKudoClick(act.id, e)}
                    className={`flex-1 py-2 flex items-center justify-center gap-2 transition active:scale-95 ${
                      act.hasKudoed ? 'text-earth font-bold' : 'text-ash hover:text-white'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${act.hasKudoed ? 'fill-earth text-earth' : ''}`} />
                    <span>Respetos</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentBox(activeCommentBox === act.id ? null : act.id)}
                    className="flex-1 py-2 flex items-center justify-center gap-2 text-ash hover:text-white transition active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comentar</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = window.location.href;
                      navigator.clipboard?.writeText(url);
                      confetti({ particleCount: 15, spread: 40 });
                    }}
                    className="flex-1 py-2 flex items-center justify-center gap-2 text-ash hover:text-white transition active:scale-95"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Inline Comment Box */}
                {activeCommentBox === act.id && (
                  <div className="p-4 bg-black/40 border-t border-white/[0.06] flex items-center gap-2">
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
                      className="px-3 py-2 bg-earth hover:bg-earth/90 text-white text-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (DESKTOP ONLY): RETOS & PRÓXIMAS RODADAS    */}
        {/* ========================================================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          
          {/* Retos Comunitarios */}
          <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Retos del Mes</h4>
              </div>
              <button
                onClick={() => setActiveNavTab('grupos')}
                className="text-[10px] text-earth uppercase hover:underline"
              >
                Ver todos &gt;
              </button>
            </div>

            <div className="space-y-3">
              {challenges.slice(0, 2).map(ch => {
                const pct = Math.min(100, Math.round((ch.currentKm / ch.targetKm) * 100));
                return (
                  <div key={ch.id} className="bg-black/40 border border-white/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[160px]">{ch.title}</span>
                      <span className="text-sm">{ch.badgeHex}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 overflow-hidden">
                      <div className="h-full bg-earth" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-ash">
                      <span>{pct}% completado</span>
                      <button 
                        onClick={() => toggleJoinChallenge(ch.id)}
                        className="text-earth hover:underline uppercase font-bold"
                      >
                        {ch.joined ? 'Inscrito ✓' : 'Unirme'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tus Moto Clubes</h4>
              </div>
            </div>

            <div className="space-y-2">
              {crews.slice(0, 2).map(c => (
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
    </div>
  );
};
