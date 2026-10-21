'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import { RouteMap } from '../Map/RouteMap';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Gauge, 
  Thermometer, 
  ShieldCheck, 
  Tent, 
  Calendar, 
  Share2, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Bike,
  Sparkles,
  Send,
  Lock,
  Unlock,
  Check,
  Flame,
  Camera
} from 'lucide-react';

interface RodadaDetailViewProps {
  onOpenProposeRoute: () => void;
}

export const RodadaDetailView: React.FC<RodadaDetailViewProps> = ({ onOpenProposeRoute }) => {
  const { 
    currentUser, 
    userBikes,
    currentRodada, 
    currentRodadaRoutes, 
    selectedRoute, 
    setSelectedRoute, 
    voteRoute, 
    addRouteComment,
    lockWinningRoute,
    unlockWinningRoute,
    rsvpRodada,
    togglePackingItem,
    assignPackingItem,
    addPackingItem,
    addGalleryPhoto,
    setActiveNavTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'rutas' | 'asistencia' | 'checklist' | 'galeria'>('rutas');
  const [commentText, setCommentText] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [checklistCategory, setChecklistCategory] = useState<'Herramientas' | 'Campamento' | 'Comida / Asador' | 'Seguridad & Salud'>('Herramientas');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  if (!currentRodada) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>No hay ninguna rodada seleccionada.</p>
      </div>
    );
  }

  const activeRoute = selectedRoute || currentRodadaRoutes[0];
  const winningRoute = currentRodadaRoutes.find(r => r.id === currentRodada.winningRouteId);

  // Handle voting with celebratory confetti
  const handleVote = (routeId: string) => {
    voteRoute(routeId);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F59E0B', '#10B981', '#3B82F6']
    });
  };

  const handleLockRoute = (routeId: string) => {
    lockWinningRoute(currentRodada.id, routeId);
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#F59E0B', '#FBBF24', '#FFFFFF']
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoute) return;
    addRouteComment(activeRoute.id, commentText);
    setCommentText('');
  };

  const handleAddChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    addPackingItem(currentRodada.id, newChecklistItem, checklistCategory);
    setNewChecklistItem('');
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    addGalleryPhoto(currentRodada.id, newPhotoUrl, newPhotoCaption);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setShowPhotoModal(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const isUserAttending = currentRodada.attendees.some(a => a.userId === currentUser.id && a.status === 'confirmado');

  return (
    <div className="space-y-6 pb-20">
      
      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {currentRodada.category}
              </span>

              {currentRodada.status === 'votacion' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5 animate-pulse shadow-glow">
                  <span className="w-2 h-2 rounded-full bg-slate-950" />
                  Votación de Rutas Abierta
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 shadow-glow-green">
                  <Trophy className="w-3.5 h-3.5" />
                  Ruta Fijada Oficialmente
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight">
              {currentRodada.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentRodada.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <MapPin className="w-4 h-4 text-amber-400" />
                Salida: <span className="text-amber-400 font-semibold">{currentRodada.originPoint}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Calendar className="w-4 h-4 text-amber-400" />
                31 Oct – 02 Nov 2026 (Puente Día de Muertos)
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <Bike className="w-4 h-4 text-emerald-400" />
                {currentRodada.attendees.filter(a => a.status === 'confirmado').length} Pilotos confirmados
              </span>
            </div>
          </div>

          {/* Quick Actions & RSVP */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              onClick={() => {
                if (isUserAttending) {
                  rsvpRodada(currentRodada.id, userBikes[0]?.id || '', 'interesado');
                } else {
                  rsvpRodada(currentRodada.id, userBikes[0]?.id || '', 'confirmado');
                  confetti({ particleCount: 40 });
                }
              }}
              className={`px-5 py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl active:scale-95 ${
                isUserAttending
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 shadow-glow'
              }`}
            >
              <Bike className="w-4 h-4" />
              {isUserAttending ? '✓ Voy en mi moto (Confirmado)' : 'Confirmar Mi Asistencia'}
            </button>

            <button
              onClick={handleShare}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-500/50 flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              {copiedShareLink ? '¡Link copiado al portapapeles!' : 'Compartir con la Banda'}
            </button>
          </div>
        </div>

        {/* If route is locked, show banner */}
        {winningRoute && (
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4 bg-amber-500/10 -mx-6 -mb-6 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">Ruta Ganadora Elegida</p>
                <h4 className="font-display font-bold text-white text-base">{winningRoute.title}</h4>
              </div>
            </div>
            <button
              onClick={() => unlockWinningRoute(currentRodada.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" /> Reabrir Votación
            </button>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('rutas')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'rutas'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <span>🗺️</span>
          Rutas Propuestas & Votación ({currentRodadaRoutes.length})
        </button>

        <button
          onClick={() => setActiveSubTab('asistencia')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'asistencia'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bike className="w-4 h-4" />
          Pilotos & Motos ({currentRodada.attendees.length})
        </button>

        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'checklist'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Equipo & Logística ({currentRodada.packingList.filter(p => p.isDone).length}/{currentRodada.packingList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('galeria')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'galeria'
              ? 'bg-amber-500 text-slate-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          Fotos & Bitácora ({currentRodada.gallery.length})
        </button>
      </div>

      {/* TAB 1: RUTAS & VOTACIÓN */}
      {activeSubTab === 'rutas' && (
        <div className="space-y-6">
          
          {/* Top route switcher chips */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {currentRodadaRoutes.map((route, index) => {
                const isSelected = activeRoute?.id === route.id;
                const isWinner = currentRodada.winningRouteId === route.id;
                const userVoted = route.votes.includes(currentUser.id);

                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`relative px-4 py-2.5 rounded-xl text-left border transition flex items-center gap-3 shrink-0 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 text-white shadow-glow'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate max-w-[160px] sm:max-w-[200px]">
                          {route.destination}
                        </span>
                        {isWinner && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {route.votes.length} {route.votes.length === 1 ? 'voto' : 'votos'} • {route.totalKm} km
                      </p>
                    </div>
                    {userVoted && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" title="Tú votaste por esta opción" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onOpenProposeRoute}
              className="px-3.5 py-2 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition flex items-center gap-1.5 shrink-0 shadow-md"
            >
              <Plus className="w-4 h-4" /> Proponer Otra Ruta
            </button>
          </div>

          {/* Active Route Deep Dive Grid */}
          {activeRoute && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Map & Live Polyline (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                  <RouteMap 
                    route={activeRoute} 
                    allRoutes={currentRodadaRoutes}
                    onSelectRoute={(r) => setSelectedRoute(r)}
                  />
                </div>

                {/* Waypoint list / stops on this route */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Puntos Clave & Paradas Marcadas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeRoute.waypoints.map(wp => (
                      <div key={wp.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
                        <span className="text-base leading-none mt-0.5">
                          {wp.type === 'start' && '🏁'}
                          {wp.type === 'camp' && '⛺'}
                          {wp.type === 'scenic' && '🏔️'}
                          {wp.type === 'fuel' && '⛽'}
                          {wp.type === 'food' && '🌮'}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{wp.name}</p>
                          {wp.notes && <p className="text-[11px] text-slate-400 mt-0.5">{wp.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Día de Muertos Vibe & Safety */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" /> Vibe Día de Muertos
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeRoute.dayOfDeadVibe}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Recomendaciones Off-Road
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {activeRoute.safetyTips.map((tip, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-emerald-400">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column: Details, Voting & Itinerary (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Voting & Decision Box */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                        Propuesta por {activeRoute.proposedByName}
                      </span>
                      <h3 className="font-display font-black text-xl text-white mt-0.5">
                        {activeRoute.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {activeRoute.destination}, {activeRoute.state}
                      </p>
                    </div>

                    {/* Proposer avatar */}
                    <img 
                      src={activeRoute.proposedByAvatar} 
                      alt={activeRoute.proposedByName}
                      className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover" 
                    />
                  </div>

                  {/* Voting action */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleVote(activeRoute.id)}
                      className={`flex-1 py-3 px-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95 ${
                        activeRoute.votes.includes(currentUser.id)
                          ? 'bg-emerald-500 text-slate-950 shadow-glow-green'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-glow'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {activeRoute.votes.includes(currentUser.id) ? 'Votaste por esta (Quitar)' : 'Votar por esta Ruta'}
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950/30 font-mono text-xs">
                        {activeRoute.votes.length}
                      </span>
                    </button>

                    {currentRodada.status === 'votacion' && (
                      <button
                        onClick={() => handleLockRoute(activeRoute.id)}
                        className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                        title="Fijar como la ruta definitiva del grupo"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        Fijar
                      </button>
                    )}
                  </div>

                  {/* Voters avatars list */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>Pilotos que apoyan esta ruta:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {Math.round((activeRoute.votes.length / Math.max(currentRodada.attendees.length, 1)) * 100)}% de apoyo
                    </span>
                  </div>
                </div>

                {/* Key Technical Specs */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ficha Técnica & Terreno
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Distancia Total</p>
                      <p className="text-lg font-black text-amber-400 font-mono">{activeRoute.totalKm} km</p>
                      <p className="text-[10px] text-slate-500">{activeRoute.estimatedHours}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Dificultad</p>
                      <p className="text-sm font-black text-emerald-400 mt-1">{activeRoute.difficulty}</p>
                      <p className="text-[10px] text-slate-500">Motos 650cc a 1250cc</p>
                    </div>
                  </div>

                  {/* Surface breakdown progress bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        🌲 Off-Road / Brecha: {activeRoute.offroadPercentage}%
                      </span>
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        🛣️ Asfalto: {activeRoute.asphaltPercentage}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${activeRoute.offroadPercentage}%` }} 
                        className="bg-emerald-500 h-full" 
                      />
                      <div 
                        style={{ width: `${activeRoute.asphaltPercentage}%` }} 
                        className="bg-slate-600 h-full" 
                      />
                    </div>
                  </div>

                  {/* Campsite specifications */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-200 font-bold">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <Tent className="w-4 h-4" /> {activeRoute.campsite.name}
                      </span>
                      <span className="font-mono text-cyan-400">{activeRoute.campsite.elevationMeters} msnm</span>
                    </div>
                    <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      Clima noche: <strong className="text-slate-200">{activeRoute.campsite.minTempNight}</strong>
                    </p>
                    <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Seguridad: <span className="text-slate-200">{activeRoute.campsite.security}</span>
                    </p>
                  </div>
                </div>

                {/* Day-by-Day Itinerary Accordion */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Itinerario Día por Día
                  </h4>

                  <div className="space-y-2.5">
                    {activeRoute.itinerary.map(day => (
                      <div key={day.day} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold">
                            DÍA {day.day}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {day.distanceKm} km ({day.offroadKm} km tierra)
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-200">{day.title}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">{day.description}</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-1">
                          Suelo: {day.terrainType}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discussion & Comments */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Debate sobre esta propuesta ({activeRoute.comments.length})
                  </h4>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {activeRoute.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-2">
                        Sé el primero en comentar qué te parece esta opción.
                      </p>
                    ) : (
                      activeRoute.comments.map(c => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={c.userAvatar} alt={c.userName} className="w-5 h-5 rounded-full object-cover" />
                              <span className="font-bold text-slate-200">{c.userName}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-300 pl-7">{c.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Comentar sobre la ruta..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="p-2 rounded-xl bg-amber-400 text-slate-950 disabled:opacity-40 font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PILOTOS & MOTOS */}
      {activeSubTab === 'asistencia' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Pilotos Registrados ({currentRodada.attendees.length})
              </h3>
              <p className="text-xs text-slate-400">
                Motos doble propósito confirmadas para el puente.
              </p>
            </div>

            <button
              onClick={() => rsvpRodada(currentRodada.id, userBikes[0]?.id || '', isUserAttending ? 'interesado' : 'confirmado')}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold shadow-glow"
            >
              {isUserAttending ? 'Cambiar Estado' : '+ Confirmar Asistencia'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentRodada.attendees.map(att => {
              const riderUser = useApp().users.find(u => u.id === att.userId) || currentUser;
              const riderBike = useApp().motorcycles.find(m => m.id === att.motorcycleId) || useApp().motorcycles.find(m => m.userId === att.userId);

              return (
                <div key={att.userId} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition">
                  <div className="flex items-center gap-3">
                    <img 
                      src={riderUser.avatar} 
                      alt={riderUser.name} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40" 
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{riderUser.name}</h4>
                      <p className="text-xs text-amber-400 font-mono">{riderUser.handle}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                        {att.status === 'confirmado' ? 'Confirmado' : 'Interesado'}
                      </span>
                    </div>
                  </div>

                  {riderBike ? (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Moto Asignada</p>
                      <p className="text-xs font-bold text-slate-100">{riderBike.brand} {riderBike.model}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{riderBike.displacementCc}cc • {riderBike.tires}</p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-xs text-slate-500 italic">
                      Moto por asignar
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Checklist de Equipo Obligatorio</p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <span className={att.gearCheck.sleepingBag0C ? 'text-emerald-400' : 'text-slate-500'}>
                        {att.gearCheck.sleepingBag0C ? '✓' : '✗'} Sleeping 0°C
                      </span>
                      <span className={att.gearCheck.tireRepairKit ? 'text-emerald-400' : 'text-slate-500'}>
                        {att.gearCheck.tireRepairKit ? '✓' : '✗'} Kit Mechas
                      </span>
                      <span className={att.gearCheck.portableCompressor ? 'text-emerald-400' : 'text-slate-500'}>
                        {att.gearCheck.portableCompressor ? '✓' : '✗'} Compresor
                      </span>
                      <span className={att.gearCheck.firstAidKit ? 'text-emerald-400' : 'text-slate-500'}>
                        {att.gearCheck.firstAidKit ? '✓' : '✗'} Botiquín
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CHECKLIST & LOGÍSTICA */}
      {activeSubTab === 'checklist' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Logística Compartida & Herramienta
              </h3>
              <p className="text-xs text-slate-400">
                Evita duplicar peso inútil: cada moto lleva lo que le corresponde.
              </p>
            </div>

            <form onSubmit={handleAddChecklistSubmit} className="flex gap-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Ej. Leña seca, pinzas de presión..."
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <select
                value={checklistCategory}
                onChange={(e) => setChecklistCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="Herramientas">Herramientas</option>
                <option value="Campamento">Campamento</option>
                <option value="Comida / Asador">Comida</option>
                <option value="Seguridad & Salud">Seguridad</option>
              </select>
              <button
                type="submit"
                disabled={!newChecklistItem.trim()}
                className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40"
              >
                + Agregar
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['Herramientas', 'Campamento', 'Comida / Asador', 'Seguridad & Salud'] as const).map(cat => {
              const items = currentRodada.packingList.filter(p => p.category === cat);

              return (
                <div key={cat} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 font-mono">
                      {cat} ({items.filter(i => i.isDone).length}/{items.length})
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {items.map(item => (
                      <div 
                        key={item.id}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                          item.isDone
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div 
                          onClick={() => togglePackingItem(currentRodada.id, item.id)}
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            item.isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                          }`}>
                            {item.isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs ${item.isDone ? 'line-through text-slate-500' : ''}`}>
                            {item.item}
                          </span>
                        </div>

                        {item.assignedToName ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 shrink-0">
                            👤 {item.assignedToName}
                          </span>
                        ) : (
                          <button
                            onClick={() => assignPackingItem(currentRodada.id, item.id, currentUser.id, currentUser.name)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 hover:bg-amber-500/30 transition shrink-0"
                          >
                            Yo lo llevo
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: GALERÍA & FOTOS */}
      {activeSubTab === 'galeria' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Galería de la Expedición ({currentRodada.gallery.length} fotos)
              </h3>
              <p className="text-xs text-slate-400">
                Momentos, atardeceres y brechas compartidas por el crew.
              </p>
            </div>

            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <Camera className="w-4 h-4" /> Subir Foto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentRodada.gallery.map(photo => (
              <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl aspect-video">
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end">
                  <p className="text-xs font-bold text-white">{photo.caption}</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-0.5">
                    Subida por {photo.uploadedByName} • {photo.uploadedAt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for adding photo */}
          {showPhotoModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <h4 className="font-display font-bold text-base text-white">Subir Foto a la Bitácora</h4>
                <form onSubmit={handleAddPhotoSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">URL de la Imagen</label>
                    <input
                      type="url"
                      required
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Pie de foto</label>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Ej. Parada en el mirador de la presa"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold"
                    >
                      Guardar Foto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
