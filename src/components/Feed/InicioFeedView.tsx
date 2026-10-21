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
  Navigation,
  Send,
  Sparkles,
  Layers,
  ChevronRight
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
  const { activities, toggleKudo, addActivityComment, openPilotProfileById } = useApp();
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
    <div className="space-y-6 pb-28 max-w-2xl mx-auto font-mono">
      
      {/* 01. TU SERIE (STRAVA WEEKLY STREAK CARD) */}
      <div className="bg-[#0F0D0C] border border-white/10 p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-earth animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Tu serie</span>
          </div>
          <span className="text-[10px] text-earth uppercase cursor-pointer hover:underline">
            Ver calendario &gt;
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/40 border border-white/5 p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex flex-col items-center justify-center">
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

      {/* 02. DISCIPLINE FILTER CHIPS */}
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

      {/* 03. ACTIVITY FEED POSTS (STRAVA ARCHITECTURE) */}
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
                <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 group-hover:border-earth transition">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={act.pilotAvatar} alt={act.pilotName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
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
            <div className="h-56 sm:h-64 w-full bg-[#12100E] relative border-b border-white/[0.06]">
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
    </div>
  );
};
