'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Mountain, 
  Flame, 
  ThumbsUp, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Send, 
  CheckSquare, 
  Square,
  Thermometer,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RodadaDetailViewProps {
  onOpenProposeRoute: () => void;
}

export const RodadaDetailView: React.FC<RodadaDetailViewProps> = ({ onOpenProposeRoute }) => {
  const {
    currentRodada,
    currentRodadaRoutes,
    selectedRoute,
    setSelectedRoute,
    voteRoute,
    addRouteComment,
    lockWinningRoute,
    unlockWinningRoute,
    togglePackingItem,
    currentUser,
    users,
    motorcycles
  } = useApp();

  const [commentText, setCommentText] = useState('');

  if (!currentRodada) {
    return (
      <div className="py-24 text-center font-mono text-xs text-white/40">
        NO HAY EXPEDICIONES ACTIVAS.
      </div>
    );
  }

  const activeRoute = selectedRoute || currentRodadaRoutes[0];
  const isWinningRouteLocked = Boolean(currentRodada.winningRouteId);
  const winningRoute = currentRodadaRoutes.find(r => r.id === currentRodada.winningRouteId);
  const userHasVoted = activeRoute?.votes.includes(currentUser.id);

  const handleVote = () => {
    if (!activeRoute) return;
    voteRoute(activeRoute.id);
    confetti({ particleCount: 30, spread: 60 });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoute) return;
    addRouteComment(activeRoute.id, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-12 pb-24 text-white">
      
      {/* 01. EXPEDITION EDITORIAL HERO */}
      <div className="relative border border-white/[0.08] bg-[#0A0C0F] rounded-3xl overflow-hidden shadow-2xl">
        <div className="h-64 sm:h-96 w-full relative">
          <img 
            src={activeRoute?.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600'} 
            alt={activeRoute?.title || 'Expedición'}
            className="w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0F] via-[#0A0C0F]/40 to-transparent" />
          
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-3">
            <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest uppercase text-white font-bold">
              EXPEDICIÓN 001 // OTOÑO 2026
            </span>
            <span className="px-3 py-1 bg-[#C87D55]/90 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-black font-bold">
              DESTINO: NAVANA CABINS
            </span>
          </div>

          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 hidden sm:block text-right">
            <p className="font-mono text-xs text-white/50">BASE DE SALIDA</p>
            <p className="font-mono text-xs font-bold text-white">INTERLOMAS, HUIXQUILUCAN</p>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="px-6 sm:px-10 pb-8 -mt-24 relative z-10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#C87D55] uppercase tracking-widest font-bold">
              <span>Ruta en Votación de Consenso</span>
              <span>·</span>
              <span>{activeRoute?.state}</span>
            </div>
            
            <h1 className="font-display font-black text-3xl sm:text-6xl text-white tracking-tight max-w-4xl">
              {activeRoute?.title}
            </h1>

            <p className="text-white/70 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
              {activeRoute?.description}
            </p>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08] font-mono text-xs">
            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-white/40 block text-[10px] uppercase">Distancia Total</span>
              <strong className="text-white text-base font-bold">{activeRoute?.totalKm} KM</strong>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-white/40 block text-[10px] uppercase">Terracería / Asfalto</span>
              <strong className="text-[#C87D55] text-base font-bold">{activeRoute?.offroadPercentage}% Brecha</strong>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-white/40 block text-[10px] uppercase">Altitud Refugio</span>
              <strong className="text-white text-base font-bold">{activeRoute?.campsite.elevationMeters} MSNM</strong>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <span className="text-white/40 block text-[10px] uppercase">Clima Nocturno</span>
              <strong className="text-white text-base font-bold">{activeRoute?.campsite.minTempNight}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 02. ROUTE CANDIDATES SELECTOR (SUPERFICIAL STYLE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#C87D55] font-bold">[ 02 ]</span>
            <h2 className="font-display font-bold text-lg text-white tracking-wide uppercase">
              Propuestas de Ruta de la Flotilla ({currentRodadaRoutes.length})
            </h2>
          </div>

          <button
            onClick={onOpenProposeRoute}
            className="text-xs font-mono text-white/60 hover:text-white uppercase tracking-wider flex items-center gap-1.5"
          >
            + Proponer Variante
          </button>
        </div>

        {/* Horizontal Route Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentRodadaRoutes.map((route, i) => {
            const isSelected = activeRoute?.id === route.id;
            const isWinner = currentRodada.winningRouteId === route.id;

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'border-[#C87D55] bg-white/[0.04]'
                    : 'border-white/[0.06] bg-[#0A0C0F] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                  <span>0{i + 1} // {route.destination}</span>
                  {isWinner && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px] border border-emerald-500/30">
                      OFICIAL
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-sm text-white line-clamp-1">
                  {route.title}
                </h3>

                <div className="flex items-center justify-between font-mono text-xs pt-2 border-t border-white/[0.06]">
                  <span className="text-white/60">{route.totalKm} km</span>
                  <span className="text-[#C87D55]">{route.offroadPercentage}% off-road</span>
                  <span className="text-white font-bold">{route.votes.length} votos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 03. INTERACTIVE MAP & CONSENSUS VOTING BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Tactical Map (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl relative">
            <RouteMap 
              route={activeRoute} 
              allRoutes={currentRodadaRoutes}
              onSelectRoute={(r) => setSelectedRoute(r)}
            />
          </div>

          {/* Daily Loop Breakdown */}
          <div className="border border-white/[0.08] bg-[#0A0C0F] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="font-mono text-xs tracking-widest uppercase text-white/50">
                Itinerario Día por Día // Campamento Base
              </span>
              <span className="font-mono text-xs text-[#C87D55]">
                MOTO DESCARGADA DÍA 2
              </span>
            </div>

            <div className="space-y-3">
              {activeRoute?.itinerary.map(item => (
                <div key={item.day} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <strong className="text-white">DÍA {item.day}: {item.title}</strong>
                    <span className="text-[#C87D55]">{item.offroadKm} km terracería ({item.distanceKm} km total)</span>
                  </div>
                  <p className="text-xs text-white/60 font-light">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Consensus Voting & Flotilla Roster (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Voting Action Box */}
          <div className="border border-white/[0.08] bg-[#0A0C0F] rounded-2xl p-6 space-y-5">
            <span className="font-mono text-[10px] tracking-widest text-[#C87D55] uppercase block">
              // VOTACIÓN DE FLOTILLA
            </span>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-display font-black text-3xl text-white">
                  {activeRoute?.votes.length}
                </span>
                <span className="font-mono text-xs text-white/50">
                  de {currentRodada.attendees.length} pilotos confirmados
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#C87D55] transition-all duration-500"
                  style={{ width: `${Math.min(100, ((activeRoute?.votes.length || 0) / Math.max(1, currentRodada.attendees.length)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleVote}
                className={`w-full py-3 font-mono font-bold text-xs uppercase tracking-wider transition ${
                  userHasVoted
                    ? 'bg-[#C87D55] text-white border border-[#C87D55]'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                {userHasVoted ? '✓ Votaste por esta ruta' : 'Votar por esta Travesía'}
              </button>

              {/* Lock winner button */}
              <button
                onClick={() => {
                  if (isWinningRouteLocked) {
                    unlockWinningRoute(currentRodada.id);
                  } else if (activeRoute) {
                    lockWinningRoute(currentRodada.id, activeRoute.id);
                  }
                }}
                className="w-full py-2.5 border border-white/20 text-white/70 hover:text-white font-mono text-[11px] uppercase tracking-wider transition"
              >
                {isWinningRouteLocked ? 'Desbloquear Elección' : 'Fijar como Ruta Oficial'}
              </button>
            </div>
          </div>

          {/* Flotilla Roster */}
          <div className="border border-white/[0.08] bg-[#0A0C0F] rounded-2xl p-6 space-y-4">
            <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase block">
              // PILOTOS CONFIRMADOS ({currentRodada.attendees.length})
            </span>

            <div className="space-y-3">
              {currentRodada.attendees.map(att => {
                const u = users.find(usr => usr.id === att.userId);
                const bike = motorcycles.find(m => m.id === att.motorcycleId);

                return (
                  <div key={att.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={u?.avatar || att.avatar} alt={att.userName} className="w-7 h-7 rounded-full object-cover border border-white/20" />
                      <div>
                        <p className="font-bold text-white leading-none">{att.userName}</p>
                        <p className="text-[10px] font-mono text-white/50 mt-0.5">{bike?.brand} {bike?.model || 'ADV'}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">Confirmado</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navana Sanctuary Prep Checklist */}
          <div className="border border-white/[0.08] bg-[#0A0C0F] rounded-2xl p-6 space-y-4">
            <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase block">
              // EQUIPO CRÍTICO & REFUGIO
            </span>

            <div className="space-y-2">
              {currentRodada.packingList.slice(0, 4).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => togglePackingItem(currentRodada.id, item.id)}
                  className="flex items-center gap-2.5 text-xs text-white/70 hover:text-white cursor-pointer select-none"
                >
                  {item.checked ? <CheckSquare className="w-4 h-4 text-[#C87D55]" /> : <Square className="w-4 h-4 text-white/30" />}
                  <span className={item.checked ? 'line-through opacity-50' : ''}>{item.item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 04. PILOTS LOG & COMMENTS DEBATE */}
      <div className="border border-white/[0.08] bg-[#0A0C0F] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <MessageSquare className="w-4 h-4 text-[#C87D55]" />
          <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
            Bitácora de Discusión de Ruta ({activeRoute?.comments.length || 0})
          </h3>
        </div>

        <div className="space-y-3">
          {activeRoute?.comments.map(c => (
            <div key={c.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                <span className="text-white font-bold">{c.userName}</span>
                <span>{c.createdAt}</span>
              </div>
              <p className="text-xs text-white/80 font-light">{c.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Aporta detalles sobre el estado del camino, gasolineras o clima..."
            className="flex-1 bg-white/[0.03] border border-white/15 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C87D55]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-black font-mono font-bold text-xs uppercase hover:bg-[#C87D55] hover:text-white transition"
          >
            Publicar
          </button>
        </form>
      </div>

    </div>
  );
};
