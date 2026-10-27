'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { 
  CheckSquare, 
  Square,
  ThumbsUp,
  Lock,
  Unlock,
  Navigation,
  ExternalLink,
  Download,
  Plus,
  ArrowLeft,
  Check,
  Bike,
  Mountain
} from 'lucide-react';
import confetti from 'canvas-confetti';

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
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

interface RodadaDetailViewProps {
  onOpenProposeRoute: () => void;
}

export const RodadaDetailView: React.FC<RodadaDetailViewProps> = ({ onOpenProposeRoute }) => {
  const {
    currentRodada,
    currentCrew,
    currentRodadaRoutes,
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
    users,
    motorcycles,
    currentUser,
    setActiveNavTab,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [newPackingText, setNewPackingText] = useState('');

  if (!currentRodada) {
    return (
      <div className="py-24 text-center font-mono text-xs text-ash space-y-4">
        <p>NO SE ENCONTRARON EXPEDICIONES ACTIVAS.</p>
        <button 
          onClick={() => setActiveNavTab('home')}
          className="px-6 py-3 bg-white text-obsidian uppercase font-bold text-xs"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const activeRoute = selectedRoute || currentRodadaRoutes[0];
  const isWinningRouteLocked = Boolean(currentRodada.winningRouteId);
  const userHasVoted = activeRoute?.votes.includes(currentUser.id);
  const userAttendee = currentRodada.attendees.find(a => a.userId === currentUser.id);
  const isUserConfirmed = userAttendee?.status === 'confirmado';
  const primaryBike = userBikes[0];

  const handleVote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeRoute) return;
    voteRoute(activeRoute.id);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.8 } });
  };

  const handleToggleRsvp = () => {
    const nextStatus = isUserConfirmed ? 'interesado' : 'confirmado';
    rsvpRodada(
      currentRodada.id, 
      primaryBike?.id || 'bike-bmw-1250', 
      nextStatus
    );
    if (!isUserConfirmed) {
      confetti({ particleCount: 60, spread: 80 });
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoute) return;
    addRouteComment(activeRoute.id, commentText);
    setCommentText('');
  };

  const handleAddPackingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingText.trim()) return;
    addPackingItem(currentRodada.id, newPackingText.trim(), 'Campamento');
    setNewPackingText('');
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

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeRoute.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleMaps = () => {
    if (!activeRoute) return;
    const origin = encodeURIComponent(currentRodada.originPoint || 'Interlomas, Huixquilucan, Edomex');
    const destination = encodeURIComponent(`${activeRoute.destination}, ${activeRoute.state}`);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-32 text-[#1A1918] font-sans">
      
      {/* 00. CONTEXTUAL BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveNavTab('crew')}
            className="flex items-center gap-2 text-[#1A1918] hover:text-[#E6332A] uppercase font-black transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a {currentCrew?.name || 'Grupo'}</span>
          </button>
          <span className="text-[#1A1918]/30 font-bold">/</span>
          <button 
            onClick={() => setActiveNavTab('home')}
            className="text-[#1A1918]/70 hover:text-[#1A1918] uppercase transition font-bold"
          >
            Mis Grupos
          </button>
        </div>

        <span className="border-2 border-[#1A1918] bg-[#FAF6ED] px-2.5 py-0.5 rounded-md text-[10px] uppercase text-[#E6332A] tracking-wider font-black shadow-[1px_1px_0px_#1A1918] hidden sm:inline">
          ESTADO: {currentRodada.status === 'votacion' ? 'VOTACIÓN DE RUTAS' : 'RUTA GANADORA FIJADA'}
        </span>
      </div>

      {/* 01. EXPEDITION EDITORIAL HERO & SPEC SHEET */}
      <section className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] shadow-[6px_6px_0px_#1A1918] overflow-hidden">
        
        {/* Top Identification Row */}
        <div className="grid grid-cols-12 border-b-2 border-[#1A1918]">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b-2 md:border-b-0 md:border-r-2 border-[#1A1918]">
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black block mb-2">
              [ {currentCrew?.name.toUpperCase() || 'TRIBU'} // {currentRodada.category.toUpperCase()} ]
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-[#1A1918] tracking-tight uppercase leading-[0.95]">
              {currentRodada.title}
            </h1>
            <p className="font-serif italic text-sm text-[#1A1918]/70 font-medium mt-3">
              {currentRodada.subtitle}
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#F4EEDB]">
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-[#1A1918]/80 border-b-2 border-[#1A1918] pb-2">
                <span className="font-bold">ESTADO:</span>
                <span className={`font-black uppercase ${isWinningRouteLocked ? 'text-[#E6332A]' : 'text-[#1D4477]'}`}>
                  {isWinningRouteLocked ? 'Ruta Fijada Oficial' : 'Consenso Abierto'}
                </span>
              </div>
              <div className="flex justify-between text-[#1A1918]/80 border-b-2 border-[#1A1918] pb-2">
                <span className="font-bold">VENTANA:</span>
                <span className="text-[#1A1918] font-bold">{currentRodada.startDate} al {currentRodada.endDate}</span>
              </div>
              <div className="flex justify-between text-[#1A1918]/80 border-b-2 border-[#1A1918] pb-2">
                <span className="font-bold">BASECAMP:</span>
                <span className="text-[#1A1918] font-bold">Corral de Piedra / Navana</span>
              </div>
              <div className="flex justify-between text-[#1A1918]/80">
                <span className="font-bold">FLOTILLA:</span>
                <span className="text-[#E6332A] font-black">
                  {currentRodada.attendees.filter(a => a.status === 'confirmado').length} PILOTOS CONFIRMADOS
                </span>
              </div>
            </div>

            {/* Voting & Lock Actions */}
            <div className="pt-6 space-y-2.5">
              <button
                onClick={handleVote}
                className={`w-full py-3.5 px-4 font-display text-xs uppercase font-black tracking-widest border-2 border-[#1A1918] rounded-xl transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 ${
                  userHasVoted
                    ? 'bg-[#E6332A] text-white'
                    : 'bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918]'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{userHasVoted ? 'Voto Registrado // Quitar Voto' : 'Votar por esta Variante'}</span>
              </button>

              {/* Consensus Lock for Captain */}
              {isWinningRouteLocked ? (
                <button
                  onClick={() => unlockWinningRoute(currentRodada.id)}
                  className="w-full py-2.5 px-3 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-mono text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Unlock className="w-3.5 h-3.5 text-[#E6332A]" />
                  <span>Reabrir Consenso de Rutas</span>
                </button>
              ) : (
                <button
                  onClick={() => lockWinningRoute(currentRodada.id, activeRoute.id)}
                  className="w-full py-2.5 px-3 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#1D4477] hover:text-white text-[#1D4477] font-mono text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Fijar como Ruta Ganadora</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Atmospheric Image */}
        <div className="relative h-72 sm:h-[400px] w-full overflow-hidden border-b-2 border-[#1A1918]">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1800" 
            alt="Corral de Piedra Amanalco" 
            className="w-full h-full object-cover filter contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1918]/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 font-mono text-xs font-black text-[#1A1918] bg-[#FAF6ED] px-3.5 py-1.5 border-2 border-[#1A1918] rounded-lg shadow-[3px_3px_0px_#1A1918]">
            COORDENADAS REFUGIO // 19°24&apos;02&quot;N 99°16&apos;54&quot;W
          </div>
        </div>

        {/* Telemetry Cells (Strict 4-Column Matchbook Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 font-sans text-xs divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#1A1918] bg-[#FAF6ED]">
          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-wider block font-bold font-serif italic">01. Distancia Total</span>
            <p className="font-display font-black text-3xl text-[#1A1918] mt-1">{activeRoute.totalKm} KM</p>
            <p className="text-[11px] text-[#1A1918]/70 mt-1 font-medium font-serif italic">2h 30m asfalto + brecha libre</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-wider block font-bold font-serif italic">02. Terreno</span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 font-display font-black text-2xl text-[#E06423]" title="Montaña / Terracería">
                <Mountain className="w-6 h-6 text-[#E06423] shrink-0" />
                <span>{activeRoute.offroadPercentage}%</span>
              </span>
              <span className="flex items-center gap-1.5 font-display font-black text-2xl text-[#1A1918]" title="Carretera / Asfalto">
                <RoadIcon className="w-6 h-6 text-[#1A1918] shrink-0" />
                <span>{activeRoute.asphaltPercentage || (100 - activeRoute.offroadPercentage)}%</span>
              </span>
            </div>
            <p className="text-[11px] text-[#1A1918]/70 mt-1 font-medium font-serif italic">Tierra compacta, pinocha y asfalto</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-wider block font-bold font-serif italic">03. Altitud Refugio</span>
            <p className="font-display font-black text-3xl text-[#1A1918] mt-1">{activeRoute.campsite.elevationMeters} M</p>
            <p className="text-[11px] text-[#1A1918]/70 mt-1 font-medium font-serif italic">Reserva natural Amanalco</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 uppercase tracking-wider block font-bold font-serif italic">04. Clima Nocturno</span>
            <p className="font-display font-black text-3xl text-[#1D4477] mt-1">{activeRoute.campsite.minTempNight}</p>
            <p className="text-[11px] text-[#1A1918]/70 mt-1 font-medium font-serif italic">Sleeping 0°C recomendado</p>
          </div>
        </div>

      </section>

      {/* 02. PROPOSALS SELECTOR & CONSENSUS VOTING TABLE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-[#1A1918] pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
              ★ [ 02 // EVALUACIÓN DE TRAZOS ] ★
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-tight">
              Variantes Propuestas por la Flotilla ({currentRodadaRoutes.length})
            </h2>
            <p className="text-xs text-[#1A1918]/70 font-serif italic mt-0.5">
              Haz clic en cada propuesta para actualizar el mapa, la altimetría y registrar tu voto por consenso.
            </p>
          </div>

          <button
            onClick={onOpenProposeRoute}
            className="px-4 py-2.5 border-2 border-[#1A1918] bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] font-display text-xs uppercase tracking-wider transition rounded-xl font-black shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#1A1918]" />
            + Proponer Trazado Alternativo
          </button>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentRodadaRoutes.map((route, idx) => {
            const isSelected = route.id === activeRoute.id;
            const hasVotedThis = route.votes.includes(currentUser.id);
            const isLeader = route.votes.length === Math.max(...currentRodadaRoutes.map(r => r.votes.length));

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between relative ${
                  isSelected 
                    ? 'border-[#1A1918] bg-[#FAF6ED] shadow-[5px_5px_0px_#1A1918] ring-2 ring-[#E6332A]' 
                    : 'border-[#1A1918] bg-[#F4EEDB] hover:bg-[#FAF6ED] shadow-[3px_3px_0px_#1A1918]'
                }`}
              >
                {/* Header indicator */}
                <div className="flex items-center justify-between font-mono text-[10px] text-[#1A1918]/70 mb-3 font-bold">
                  <span>OPCIÓN 0{idx + 1}</span>
                  {isLeader && (
                    <span className="px-2 py-0.5 bg-[#E6332A] text-white font-black uppercase tracking-wider rounded-md border border-[#1A1918]">
                      Líder ({route.votes.length} VOTOS)
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-display font-black text-lg text-[#1A1918] leading-tight uppercase">
                    {route.title}
                  </h3>
                  <p className="font-serif italic text-xs text-[#1A1918]/70 font-medium">
                    {route.destination}, {route.state}
                  </p>
                </div>

                {/* Micro metrics */}
                <div className="mt-5 pt-4 border-t-2 border-[#1A1918] grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-[#1A1918]/60 block uppercase font-bold">Distancia</span>
                    <span className="text-[#1A1918] font-black">{route.totalKm} km</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#1A1918]/60 block uppercase font-bold">Terreno</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-0.5 text-[#E06423] font-black" title="Montaña / Terracería">
                        <Mountain className="w-2.5 h-2.5 text-[#E06423] shrink-0" />
                        <span>{route.offroadPercentage}%</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-[#1A1918] font-black" title="Carretera / Asfalto">
                        <RoadIcon className="w-2.5 h-2.5 text-[#1A1918] shrink-0" />
                        <span>{route.asphaltPercentage || (100 - route.offroadPercentage)}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vote CTA inside card */}
                <div className="mt-4 pt-3 border-t-2 border-[#1A1918] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#1A1918]/70 font-bold">{route.votes.length} votos</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(route);
                      voteRoute(route.id);
                      confetti({ particleCount: 30, spread: 60 });
                    }}
                    className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider transition rounded-lg border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                      hasVotedThis 
                        ? 'bg-[#E6332A] text-white' 
                        : 'bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918]'
                    }`}
                  >
                    {hasVotedThis ? '✓ Votado' : 'Votar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 03. CARTOGRAFÍA TÁCTICA & WAYPOINTS (Leaflet Edge-to-Edge) */}
      <section className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] overflow-hidden shadow-[6px_6px_0px_#1A1918]">
        <div className="p-4 sm:p-6 border-b-2 border-[#1A1918] bg-[#F4EEDB] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#E6332A] border border-[#1A1918] animate-pulse" />
            <span className="text-[#1A1918] font-black uppercase tracking-wider">
              CARTOGRAFÍA ACTIVA // {activeRoute.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenGoogleMaps}
              className="px-3.5 py-2 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] uppercase text-[10px] font-black tracking-wider flex items-center gap-1.5 transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E6332A]" />
              <span>Abrir Google Maps</span>
            </button>
            <button
              onClick={handleDownloadGpx}
              className="px-3.5 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] uppercase text-[10px] font-black tracking-wider flex items-center gap-1.5 transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar GPX</span>
            </button>
          </div>
        </div>

        {/* Map View Container */}
        <div className="h-[460px] sm:h-[540px] w-full relative border-b-2 border-[#1A1918]">
          <RouteMap 
            route={activeRoute} 
            allRoutes={currentRodadaRoutes}
            onSelectRoute={(r) => setSelectedRoute(r)}
          />
        </div>

        {/* Waypoints strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 font-sans text-xs divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#1A1918] bg-[#FAF6ED]">
          {activeRoute.waypoints.map((wp, i) => (
            <div key={wp.id || i} className="p-4 space-y-1">
              <span className="text-[10px] text-[#E6332A] uppercase tracking-widest font-black block">
                PUNTO 0{i + 1} // {wp.type.toUpperCase()}
              </span>
              <p className="font-display font-black text-[#1A1918] uppercase text-sm">{wp.name}</p>
              <p className="text-[11px] text-[#1A1918]/70 font-serif italic">{wp.notes || 'Punto de reagrupación'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 04. BASECAMP CONCEPT VS NOMADIC FATIGUE */}
      <section className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] p-6 sm:p-10 space-y-6 shadow-[6px_6px_0px_#1A1918]">
        <div className="border-b-2 border-[#1A1918] pb-4">
          <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
            ★ [ 04 // ESTRATEGIA DE EXPEDICIÓN ] ★
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-tight mt-1">
            Por Qué Establecer Basecamp (Y No Mudar Tienda Cada Noche)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs">
          <div className="p-5 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-2">
            <span className="text-[#E6332A] font-display font-black text-sm block uppercase">01 // SEGURIDAD & AGILIDAD OFF-ROAD</span>
            <p className="text-[#1A1918]/80 leading-relaxed font-serif italic font-medium">
              Rodar en terracería con 25 kg de equipaje alto y bolsas inestables multiplica el riesgo de caída en curvas con grava. Al montar basecamp en Corral de Piedra, las motos salen completamente ligeras para curvear con libertad.
            </p>
          </div>

          <div className="p-5 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-2">
            <span className="text-[#E06423] font-display font-black text-sm block uppercase">02 // REFUGIO TÉRMICO & DESCANSO</span>
            <p className="text-[#1A1918]/80 leading-relaxed font-serif italic font-medium">
              En noviembre la temperatura cae a 3°C a 3,000 msnm. Empacar lonas mojadas con escarcha a las 7:00 AM destruye la moral del grupo. Con basecamp fijo, desayunamos con calma y cerramos la tarde alrededor de la fogata con buena comida.
            </p>
          </div>

          <div className="p-5 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-2">
            <span className="text-[#1D4477] font-display font-black text-sm block uppercase">03 // RUTAS CIRCULARES EN TRÉBOL</span>
            <p className="text-[#1A1918]/80 leading-relaxed font-serif italic font-medium">
              La base nos permite hacer bucles: Día 1 subida por brechas hacia Amanalco, Día 2 bucle hacia Valle de Bravo y faldas del Nevado, Día 3 retorno técnico sin cargar bultos pesados.
            </p>
          </div>
        </div>
      </section>

      {/* 05. CONFIRMED RIDERS ROSTER & LIVE PACKING CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dynamic Attendees List */}
        <section className="lg:col-span-7 border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_#1A1918]">
          <div className="border-b-2 border-[#1A1918] pb-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
                [ FLOTILLA ACTIVA ]
              </span>
              <h3 className="font-display font-black text-xl text-[#1A1918] uppercase">
                Pilotos Confirmados ({currentRodada.attendees.length})
              </h3>
            </div>

            {/* Interactive RSVP Action */}
            <button
              onClick={handleToggleRsvp}
              className={`px-4 py-2 font-display text-xs uppercase font-black tracking-wider transition border-2 border-[#1A1918] rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                isUserConfirmed
                  ? 'bg-[#1D4477] text-white hover:bg-[#E6332A]'
                  : 'bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918]'
              }`}
            >
              {isUserConfirmed ? '✓ Asistencia Confirmada' : '+ Confirmar Asistencia'}
            </button>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {currentRodada.attendees.map((attendee) => {
              const user = users.find(u => u.id === attendee.userId) || (attendee.userId === currentUser.id ? currentUser : null);
              const bike = motorcycles.find(m => m.id === attendee.motorcycleId) || (attendee.userId === currentUser.id ? primaryBike : null);
              const isLead = attendee.userId === currentUser.id;

              return (
                <div key={attendee.userId} className="p-4 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_#1A1918]">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                      alt={user?.name || 'Piloto'} 
                      className="w-11 h-11 object-cover rounded-xl border-2 border-[#1A1918]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-black text-[#1A1918] uppercase">{user?.name || 'Piloto'}</p>
                        {isLead && (
                          <span className="px-1.5 py-0.2 bg-[#E6332A] text-white text-[9px] uppercase font-black rounded border border-[#1A1918]">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-[#1A1918]/70 text-[11px] font-serif italic">
                        {bike ? `${bike.brand} ${bike.model}` : 'Doble Propósito'} · {bike?.tires || 'Llantas 50/50'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-black border-2 border-[#1A1918] rounded-lg shadow-[1px_1px_0px_#1A1918] ${
                    attendee.status === 'confirmado' 
                      ? 'bg-[#1D4477] text-white' 
                      : 'bg-[#FAF6ED] text-[#1A1918]/70'
                  }`}>
                    {attendee.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Interactive Packing Checklist with Real Add Item */}
        <section className="lg:col-span-5 border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-[6px_6px_0px_#1A1918]">
          <div>
            <div className="border-b-2 border-[#1A1918] pb-4">
              <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
                [ EQUIPO OBLIGATORIO // CLIMA 4°C ]
              </span>
              <h3 className="font-display font-black text-xl text-[#1A1918] uppercase">
                Checklist de Basecamp
              </h3>
            </div>

            <div className="space-y-2.5 font-sans text-xs pt-4">
              {(currentRodada.packingList || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePackingItem(currentRodada.id, item.id)}
                  className="flex items-center gap-3 p-3 border-2 border-[#1A1918] bg-[#F4EEDB] hover:bg-[#FAF6ED] rounded-xl cursor-pointer transition select-none shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {item.isDone ? (
                    <CheckSquare className="w-4 h-4 text-[#E6332A] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#1A1918]/50 shrink-0" />
                  )}
                  <span className={`font-bold ${item.isDone ? 'line-through text-[#1A1918]/50' : 'text-[#1A1918]'}`}>
                    {item.item}
                  </span>
                  {item.assignedToName && (
                    <span className="ml-auto text-[10px] text-[#E6332A] font-black uppercase">
                      [{item.assignedToName.split(' ')[0]}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Gear Input */}
          <form onSubmit={handleAddPackingItem} className="pt-4 border-t-2 border-[#1A1918] flex gap-2">
            <input 
              type="text"
              value={newPackingText}
              onChange={(e) => setNewPackingText(e.target.value)}
              placeholder="+ Añadir equipo (ej. Compresor)..."
              className="flex-1 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 font-sans text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none font-bold"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-xl font-display text-xs uppercase font-black tracking-wider transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              + Agregar
            </button>
          </form>
        </section>

      </div>

      {/* 06. LIVE EXPEDITION DISCUSSION LOG */}
      <section className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] p-6 sm:p-10 space-y-6 shadow-[6px_6px_0px_#1A1918]">
        <div className="border-b-2 border-[#1A1918] pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
              ★ [ 06 // BITÁCORA DE DISCUSIÓN ] ★
            </span>
            <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase">
              Comentarios del Trazo ({activeRoute.comments.length})
            </h3>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 font-sans text-xs">
          {activeRoute.comments.map((comment) => (
            <div key={comment.id} className="p-4 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl space-y-1 shadow-[2px_2px_0px_#1A1918]">
              <div className="flex items-center justify-between text-[11px] text-[#1A1918]/60 font-bold">
                <span className="text-[#1A1918] font-black uppercase">{comment.userName}</span>
                <span>
                  {isNaN(Date.parse(comment.createdAt))
                    ? comment.createdAt
                    : new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[#1A1918] font-serif italic pt-1 font-medium">{comment.text}</p>
            </div>
          ))}
        </div>

        {/* Real Comment Input Form */}
        <form onSubmit={handleSendComment} className="flex gap-2 pt-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Aporta detalles sobre el estado de la brecha, presiones o clima..."
            className="flex-1 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl px-4 py-3 font-sans text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none font-bold"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-xl font-display text-xs uppercase font-black tracking-widest transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Publicar
          </button>
        </form>
      </section>

    </div>
  );
};
