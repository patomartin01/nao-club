'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  Users, 
  Bike, 
  Compass, 
  ThumbsUp,
  Lock,
  Unlock,
  Navigation,
  ExternalLink,
  Download,
  CheckSquare,
  Square,
  MapPin,
  MessageSquare,
  Send,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

interface CrewViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateRodada: () => void;
  onOpenProposeRoute: () => void;
  onOpenRecordRoute?: () => void;
}

export const CrewView: React.FC<CrewViewProps> = ({ 
  onOpenCreateCrew, 
  onOpenJoinCrew,
  onOpenCreateRodada,
  onOpenProposeRoute,
  onOpenRecordRoute
}) => {
  const { 
    currentCrew, 
    users, 
    currentUser, 
    rodadas, 
    currentRodada,
    setCurrentRodada,
    routeProposals,
    selectedRoute,
    setSelectedRoute,
    voteRoute,
    addRouteComment,
    lockWinningRoute,
    unlockWinningRoute,
    togglePackingItem,
    addPackingItem,
    rsvpRodada,
    userBikes,
    motorcycles,
    openPilotProfileById,
    setActiveNavTab 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rodada' | 'pilotos' | 'historial'>('rodada');
  const [copiedCode, setCopiedCode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [newPackingText, setNewPackingText] = useState('');

  if (!currentCrew) {
    return (
      <div className="text-center py-24 font-mono text-xs text-ash space-y-4">
        <p>NO SE ENCONTRÓ NINGÚN GRUPO SELECCIONADO.</p>
        <button 
          onClick={() => setActiveNavTab('home')} 
          className="px-6 py-3 bg-white text-obsidian uppercase font-bold text-xs"
        >
          Volver a Mis Grupos
        </button>
      </div>
    );
  }

  const crewRodadas = rodadas.filter(r => r.crewId === currentCrew.id);
  const activeRodada = currentRodada?.crewId === currentCrew.id 
    ? currentRodada 
    : crewRodadas[0] || null;

  const crewRoutes = activeRodada 
    ? routeProposals.filter(r => r.rodadaId === activeRodada.id)
    : [];

  const activeRoute = selectedRoute && crewRoutes.some(r => r.id === selectedRoute.id)
    ? selectedRoute
    : crewRoutes[0] || null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCrew.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleVote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeRoute) return;
    voteRoute(activeRoute.id);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
  };

  const userAttendee = activeRodada?.attendees.find(a => a.userId === currentUser.id);
  const isUserConfirmed = userAttendee?.status === 'confirmado';
  const primaryBike = userBikes[0];

  const handleToggleRsvp = () => {
    if (!activeRodada) return;
    const nextStatus = isUserConfirmed ? 'interesado' : 'confirmado';
    rsvpRodada(
      activeRodada.id, 
      primaryBike?.id || 'bike-bmw-1250', 
      nextStatus
    );
    if (!isUserConfirmed) {
      confetti({ particleCount: 60, spread: 80 });
    }
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingText.trim() || !activeRodada) return;
    addPackingItem(activeRodada.id, newPackingText.trim(), 'Campamento');
    setNewPackingText('');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoute) return;
    addRouteComment(activeRoute.id, commentText);
    setCommentText('');
  };

  const handleDownloadGpx = () => {
    if (!activeRoute) return;
    const gpxPoints = activeRoute.waypoints
      .map(wp => `      <trkpt lat="${wp.lat}" lon="${wp.lng}"><name>${wp.name}</name><desc>${wp.notes || ''}</desc></trkpt>`)
      .join('\n');

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NAO Moto Expeditions" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${activeRoute.title}</name>
    <desc>${activeRoute.description}</desc>
  </metadata>
  <trk>
    <name>${activeRoute.title}</name>
    <trkseg>
${gpxPoints}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeRoute.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.gpx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleMaps = () => {
    if (!activeRoute) return;
    const url = buildOrderedGoogleMapsUrl(activeRoute, activeRodada?.originPoint);
    window.open(url, '_blank');
  };

  const isWinningRouteLocked = Boolean(activeRodada?.winningRouteId);
  const userHasVoted = activeRoute?.votes.includes(currentUser.id);

  return (
    <div className="space-y-8 pb-32 text-chalk">
      
      {/* 00. CONTEXTUAL BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
        <button 
          onClick={() => setActiveNavTab('home')}
          className="flex items-center gap-2 text-ash hover:text-white uppercase font-bold transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Mis Grupos</span>
        </button>

        <span className="text-[10px] uppercase text-earth tracking-widest font-bold">
          SALA DE CLUB // {currentCrew.name}
        </span>
      </div>

      {/* 01. CREW HERO BANNER */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="h-48 sm:h-64 w-full relative overflow-hidden border-b border-white/10 bg-black">
          <img 
            src={currentCrew.coverImage} 
            alt={currentCrew.name}
            className="w-full h-full object-cover filter brightness-75" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/85 border border-white/20 font-mono text-[10px] text-earth uppercase font-bold tracking-widest">
              BASE: {currentCrew.baseCity}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ COMUNIDAD OFF-ROAD // MOTO CLUB ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
              {currentCrew.name}
            </h1>
            <p className="font-mono text-xs text-ash leading-relaxed font-light">
              {currentCrew.description}
            </p>
          </div>

          {/* Shareable Invite Code Pill */}
          <div className="p-4 border border-white/10 bg-[#0E0C0A] font-mono text-xs space-y-2 shrink-0 md:min-w-[260px]">
            <span className="text-[10px] text-ash uppercase tracking-wider block">
              Clave Única de Invitación
            </span>
            <div className="flex items-center justify-between gap-2 bg-white/[0.03] p-2.5 border border-white/15">
              <code className="text-earth font-bold text-base tracking-widest">
                {currentCrew.inviteCode}
              </code>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleCopy}
                  title="Copiar clave"
                  className="px-2 py-1 border border-white/15 hover:border-earth text-ash hover:text-white transition flex items-center gap-1 text-[10px] uppercase font-bold"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Listo</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `¡Hola! Únete a nuestro moto club "${currentCrew.name}" en NAO para organizar las rodadas off-road. Usa la clave única: ${currentCrew.inviteCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold transition flex items-center gap-1"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Member metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10 font-mono text-xs bg-[#0E0C0A]">
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Total Miembros</span>
            <p className="font-bold text-white text-base mt-0.5">{currentCrew.members.length} Pilotos</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Expediciones</span>
            <p className="font-bold text-white text-base mt-0.5">{crewRodadas.length} Convocadas</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Disciplina</span>
            <p className="font-bold text-earth text-base mt-0.5">Dual-Sport & Trail</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Fundador</span>
            <p className="font-bold text-white text-base mt-0.5">Patricio Martin</p>
          </div>
        </div>
      </section>

      {/* 02. SEGMENTED TABS INSIDE THE CLUB (The Core Architecture Unifier) */}
      <div className="flex items-center gap-2 border-b border-white/15 pb-2 font-mono text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('rodada')}
          className={`px-4 py-2 uppercase font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'rodada'
              ? 'bg-earth text-white border border-earth'
              : 'border border-white/10 text-ash hover:text-white bg-white/[0.02]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>⚡ Rodada & Votación Activa</span>
        </button>

        <button
          onClick={() => setActiveTab('pilotos')}
          className={`px-4 py-2 uppercase font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'pilotos'
              ? 'bg-earth text-white border border-earth'
              : 'border border-white/10 text-ash hover:text-white bg-white/[0.02]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Pilotos del Club ({currentCrew.members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historial')}
          className={`px-4 py-2 uppercase font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'historial'
              ? 'bg-earth text-white border border-earth'
              : 'border border-white/10 text-ash hover:text-white bg-white/[0.02]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📂 Todas las Rodadas ({crewRodadas.length})</span>
        </button>
      </div>

      {/* TAB 1: LIVE ACTIVE RODADA WORKSPACE */}
      {activeTab === 'rodada' && (
        <div className="space-y-8">
          {activeRodada ? (
            <>
              {/* Active Rodada Title Banner */}
              <div className="border border-white/10 bg-[#0B0A09] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                    <span className="px-2 py-0.5 bg-earth/20 border border-earth text-earth font-bold uppercase tracking-widest">
                      {activeRodada.status === 'votacion' ? '⚡ FASE: VOTACIÓN DE RUTAS EN CONSENSO' : '✓ RUTA GANADORA FIJADA'}
                    </span>
                    <span className="text-ash">·</span>
                    <span className="text-white bg-white/10 px-2 py-0.5 font-bold">
                      {activeRodada.category}
                    </span>
                  </div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase">
                    {activeRodada.title}
                  </h2>
                  <p className="font-mono text-xs text-ash font-light">
                    {activeRodada.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-ash uppercase block">Fechas</span>
                    <p className="font-bold text-white">{activeRodada.startDate} al {activeRodada.endDate}</p>
                  </div>
                  <button
                    onClick={handleToggleRsvp}
                    className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition border ${
                      isUserConfirmed
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500'
                        : 'bg-earth text-white border-earth hover:bg-earth-bright'
                    }`}
                  >
                    {isUserConfirmed ? '✓ Asistencia Confirmada' : '+ Confirmar Asistencia'}
                  </button>
                </div>
              </div>

              {/* 01. ROUTE OPTIONS SELECTOR (The Heart of Consensus) */}
              <section className="space-y-4">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                      [ VARIANTES DE RUTA PROPUESTAS POR EL GRUPO ]
                    </span>
                    <h3 className="font-display font-bold text-xl text-white uppercase mt-0.5">
                      Vota la Opción que Prefieras ({crewRoutes.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {onOpenRecordRoute && (
                      <button
                        onClick={onOpenRecordRoute}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 font-mono text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5"
                        title="Grabar una ruta mientras conduces con GPS y guardarla en este club"
                      >
                        <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                        <span>🔴 Grabar en Vivo</span>
                      </button>
                    )}
                    <button
                      onClick={onOpenProposeRoute}
                      className="px-3 py-1.5 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider transition"
                    >
                      + Proponer Otra Ruta
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {crewRoutes.map((route, idx) => {
                    const isSelected = activeRoute?.id === route.id;
                    const isWinning = activeRodada.winningRouteId === route.id;
                    const hasVoted = route.votes.includes(currentUser.id);

                    return (
                      <div
                        key={route.id}
                        onClick={() => setSelectedRoute(route)}
                        className={`p-5 border cursor-pointer transition flex flex-col justify-between ${
                          isSelected
                            ? 'border-earth bg-white/[0.04] shadow-[0_0_20px_rgba(200,125,85,0.15)]'
                            : 'border-white/10 bg-[#0B0A09] hover:border-white/30'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-earth font-bold">
                              OPCIÓN 0{idx + 1}
                            </span>
                            <span className="px-2 py-0.5 bg-white/10 text-white font-bold">
                              {route.votes.length} {route.votes.length === 1 ? 'VOTO' : 'VOTOS'}
                            </span>
                          </div>

                          <h4 className="font-display font-bold text-base text-white uppercase group-hover:text-earth transition line-clamp-1">
                            {route.title}
                          </h4>

                          <p className="font-mono text-[11px] text-ash line-clamp-2 font-light">
                            {route.description}
                          </p>

                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-[10px]">
                            <div>
                              <span className="text-ash block">Km Total</span>
                              <span className="text-white font-bold">{route.totalKm} km</span>
                            </div>
                            <div>
                              <span className="text-ash block">Terracería</span>
                              <span className="text-earth font-bold">{route.offroadPercentage}%</span>
                            </div>
                            <div>
                              <span className="text-ash block">Dificultad</span>
                              <span className="text-white font-bold">{route.difficulty.split(' ')[0]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoute(route);
                              voteRoute(route.id);
                              confetti({ particleCount: 30, spread: 60 });
                            }}
                            className={`px-3 py-1 font-mono text-[10px] uppercase font-bold tracking-wider transition ${
                              hasVoted
                                ? 'bg-emerald-500 text-obsidian'
                                : 'bg-white/[0.05] hover:bg-earth text-white border border-white/20'
                            }`}
                          >
                            {hasVoted ? '✓ Tu Voto' : 'Votar'}
                          </button>

                          {isWinning && (
                            <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">
                              [ GANADORA ]
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 02. ACTIVE ROUTE WORKSPACE (Map + Tools + Consensus) */}
              {activeRoute && (
                <section className="border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
                  
                  {/* Active Route Header & Actions */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                        [ REVISANDO VARIANTE ACTIVA ]
                      </span>
                      <h3 className="font-display font-extrabold text-2xl text-white uppercase mt-0.5">
                        {activeRoute.title}
                      </h3>
                      <p className="font-mono text-xs text-ash mt-1">
                        Destino: <strong className="text-white">{activeRoute.destination}, {activeRoute.state}</strong> · {activeRoute.estimatedHours}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <button
                        onClick={handleVote}
                        className={`px-4 py-2 uppercase font-bold transition flex items-center gap-2 border ${
                          userHasVoted
                            ? 'bg-emerald-500 text-obsidian border-emerald-400 font-extrabold'
                            : 'bg-white hover:bg-earth text-obsidian hover:text-white border-white'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{userHasVoted ? '✓ Has Votado Esta Opción' : 'Votar por Esta Opción'}</span>
                        <span className="ml-1 px-1.5 py-0.2 bg-black/20 text-inherit font-mono text-[10px]">
                          {activeRoute.votes.length}
                        </span>
                      </button>

                      {/* Captain Consensus Lock */}
                      {isWinningRouteLocked ? (
                        <button
                          onClick={() => unlockWinningRoute(activeRodada.id)}
                          className="px-3 py-2 bg-emerald-500/10 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 uppercase font-bold text-[10px] flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Ruta Fijada (Reabrir)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => lockWinningRoute(activeRodada.id, activeRoute.id)}
                          className="px-3 py-2 border border-white/20 hover:border-earth text-ash hover:text-white uppercase font-bold text-[10px] flex items-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Fijar como Ganadora</span>
                        </button>
                      )}

                      <button
                        onClick={handleOpenGoogleMaps}
                        className="px-3 py-2 border border-white/20 hover:border-earth text-ash hover:text-white uppercase font-bold text-[10px] flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Google Maps</span>
                      </button>

                      <button
                        onClick={handleDownloadGpx}
                        className="px-3 py-2 border border-white/20 hover:border-earth text-ash hover:text-white uppercase font-bold text-[10px] flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">GPX</span>
                      </button>
                    </div>
                  </div>

                  {/* The Interactive Leaflet Map */}
                  <div className="h-[420px] w-full border border-white/10 relative">
                    <RouteMap 
                      route={activeRoute} 
                      allRoutes={crewRoutes}
                      onSelectRoute={(r) => setSelectedRoute(r)}
                    />
                  </div>

                  {/* Route Telemetry Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/10 bg-white/[0.01] font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-ash uppercase block">Distancia Total</span>
                      <p className="text-lg font-bold text-white">{activeRoute.totalKm} km</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ash uppercase block">Porcentaje Off-Road</span>
                      <p className="text-lg font-bold text-earth">{activeRoute.offroadPercentage}% Terracería</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ash uppercase block">Altitud Campamento</span>
                      <p className="text-lg font-bold text-white">{activeRoute.campsite.elevationMeters} msnm</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-ash uppercase block">Temperatura Nocturna</span>
                      <p className="text-lg font-bold text-cyan-400">{activeRoute.campsite.minTempNight}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* 03. ATTENDEES ROSTER & PACKING CHECKLIST */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Confirmed Riders */}
                <section className="lg:col-span-7 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
                  <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                        [ FLOTILLA CONFIRMADA ]
                      </span>
                      <h3 className="font-display font-bold text-xl text-white uppercase">
                        Pilotos en Esta Rodada ({activeRodada.attendees.length})
                      </h3>
                    </div>

                    <button
                      onClick={handleToggleRsvp}
                      className={`px-3 py-1.5 font-mono text-xs uppercase font-bold tracking-wider transition border ${
                        isUserConfirmed
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                          : 'bg-white text-obsidian border-white hover:bg-earth hover:text-white'
                      }`}
                    >
                      {isUserConfirmed ? '✓ Confirmado' : '+ Ir a la Rodada'}
                    </button>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {activeRodada.attendees.map((attendee) => {
                      const user = users.find(u => u.id === attendee.userId) || (attendee.userId === currentUser.id ? currentUser : null);
                      const bike = motorcycles.find(m => m.id === attendee.motorcycleId) || (attendee.userId === currentUser.id ? primaryBike : null);
                      const isLead = attendee.userId === currentUser.id;

                      return (
                        <div key={attendee.userId} className="p-4 border border-white/10 bg-white/[0.01] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                              alt={user?.name || 'Piloto'} 
                              className="w-10 h-10 object-cover border border-white/20"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white uppercase">{user?.name || 'Piloto'}</p>
                                {isLead && (
                                  <span className="px-1.5 py-0.2 bg-earth/20 border border-earth text-earth text-[9px] uppercase font-bold">
                                    Tú
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-ash">
                                {bike ? `${bike.brand} ${bike.model}` : 'Moto no asignada'}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold">
                            ✓ Confirmado
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Packing Checklist */}
                <section className="lg:col-span-5 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                      [ LOGÍSTICA DE CAMPAMENTO ]
                    </span>
                    <h3 className="font-display font-bold text-xl text-white uppercase">
                      Checklist de Equipo ({activeRodada.packingList.filter(i => i.isDone).length}/{activeRodada.packingList.length})
                    </h3>
                  </div>

                  <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto pr-1">
                    {activeRodada.packingList.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => togglePackingItem(activeRodada.id, item.id)}
                        className={`p-3 border cursor-pointer transition flex items-start gap-3 ${
                          item.isDone 
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04] text-white/50' 
                            : 'border-white/10 bg-white/[0.01] hover:border-white/20 text-white'
                        }`}
                      >
                        <button className="mt-0.5 text-earth">
                          {item.isDone ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-ash" />}
                        </button>
                        <div className="flex-1">
                          <p className={`text-xs ${item.isDone ? 'line-through text-ash' : 'text-white'}`}>
                            {item.item}
                          </p>
                          <span className="text-[9px] text-ash uppercase font-light">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Inline Add Gear Form */}
                  <form onSubmit={handleAddPackingItem} className="flex gap-2 font-mono text-xs pt-2 border-t border-white/10">
                    <input 
                      type="text" 
                      value={newPackingText}
                      onChange={(e) => setNewPackingText(e.target.value)}
                      placeholder="+ Añadir equipo a llevar..."
                      className="flex-1 bg-white/[0.03] border border-white/15 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-white hover:bg-earth text-obsidian hover:text-white uppercase font-bold text-xs transition"
                    >
                      Añadir
                    </button>
                  </form>
                </section>

              </div>
            </>
          ) : (
            <div className="p-16 border border-white/10 bg-[#0B0A09] text-center font-mono text-xs text-ash space-y-4">
              <Compass className="w-10 h-10 text-earth mx-auto" />
              <h3 className="font-display font-bold text-xl text-white uppercase">
                No Hay Rodada Convocada en Este Club
              </h3>
              <p className="max-w-md mx-auto font-light">
                Sé el capitán y convoca la primera expedición de fin de semana con fechas y destinos para que el grupo empiece a votar rutas.
              </p>
              <button
                onClick={onOpenCreateRodada}
                className="px-6 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold text-xs transition"
              >
                + Convocar Primera Rodada
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLUB PILOTS & FLEET */}
      {activeTab === 'pilotos' && (
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ FLOTILLA ACTIVA ]
            </span>
            <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
              Pilotos Miembros ({currentCrew.members.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentCrew.members.map((member) => {
              const user = users.find(u => u.id === member.userId);
              if (!user) return null;
              const userBike = motorcycles.find(m => m.userId === user.id);

              return (
                <div 
                  key={member.userId} 
                  onClick={() => openPilotProfileById(user.id)}
                  className="border border-white/10 hover:border-earth bg-[#0B0A09] p-5 space-y-4 font-mono text-xs flex flex-col justify-between cursor-pointer transition group shadow-lg"
                  title="Ver perfil y telemetría de este piloto"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-12 h-12 object-cover border border-white/20 group-hover:border-earth transition"
                      />
                      <div>
                        <p className="font-bold text-white uppercase group-hover:text-earth transition">{user.name}</p>
                        <p className="text-[10px] text-earth uppercase">{member.role}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-ash font-light border-t border-white/[0.06] pt-2 line-clamp-2">
                      {user.bio}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {userBike && (
                      <div className="p-2.5 bg-white/[0.02] border border-white/10 space-y-0.5">
                        <span className="text-[8px] text-ash uppercase block">Máquina:</span>
                        <p className="font-bold text-white text-[10px] uppercase truncate">
                          {userBike.brand} {userBike.model}
                        </p>
                        <p className="text-[9px] text-earth truncate">{userBike.tires}</p>
                      </div>
                    )}
                    <span className="text-[9px] text-ash group-hover:text-earth uppercase tracking-wider block text-right font-bold transition">
                      Ver Perfil Strava ↗
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 3: ALL EXPEDITIONS HISTORY */}
      {activeTab === 'historial' && (
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
                [ HISTORIAL Y CONVOCATORIAS DEL CLUB ]
              </span>
              <h2 className="font-display font-extrabold text-2xl text-white uppercase mt-1">
                Todas las Rodadas ({crewRodadas.length})
              </h2>
            </div>

            <button
              onClick={onOpenCreateRodada}
              className="px-4 py-2 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-xs uppercase font-bold tracking-wider transition flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Convocar Nueva Rodada
            </button>
          </div>

          <div className="space-y-4">
            {crewRodadas.map((rd) => (
              <div 
                key={rd.id}
                onClick={() => {
                  setCurrentRodada(rd);
                  setActiveTab('rodada');
                }}
                className="group border border-white/10 hover:border-earth bg-[#0B0A09] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="px-2 py-0.5 bg-earth/20 border border-earth text-earth font-bold uppercase tracking-widest">
                      {rd.status === 'votacion' ? '⚡ Votación Abierta de Rutas' : '✓ Confirmada'}
                    </span>
                    <span className="text-ash">·</span>
                    <span className="text-white bg-white/10 px-2 py-0.5">
                      {rd.category}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl text-white uppercase group-hover:text-earth transition">
                    {rd.title}
                  </h3>
                  <p className="font-mono text-xs text-ash max-w-2xl font-light">
                    {rd.description}
                  </p>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 font-mono text-xs border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-ash uppercase block">Fechas</span>
                    <p className="font-bold text-white">{rd.startDate} al {rd.endDate}</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-ash uppercase block">Pilotos</span>
                    <p className="font-bold text-earth">{rd.attendees.length} Confirmados</p>
                  </div>

                  <button className="px-6 py-3.5 bg-white group-hover:bg-earth text-obsidian group-hover:text-white uppercase font-bold tracking-widest text-xs transition shrink-0">
                    Ver Rodada en el Club →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
