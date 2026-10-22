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
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 00. CONTEXTUAL BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveNavTab('crew')}
            className="flex items-center gap-2 text-ash hover:text-white uppercase font-bold transition group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver a {currentCrew?.name || 'Grupo'}</span>
          </button>
          <span className="text-white/20">/</span>
          <button 
            onClick={() => setActiveNavTab('home')}
            className="text-ash hover:text-white uppercase transition"
          >
            Mis Grupos
          </button>
        </div>

        <span className="text-[10px] uppercase text-earth tracking-widest font-bold hidden sm:inline">
          ESTADO: {currentRodada.status === 'votacion' ? 'VOTACIÓN DE RUTAS' : 'RUTA GANADORA FIJADA'}
        </span>
      </div>

      {/* 01. EXPEDITION EDITORIAL HERO & SPEC SHEET */}
      <section className="border border-white/10 bg-[#0B0A09]">
        
        {/* Top Identification Row */}
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block mb-2">
              [ {currentCrew?.name.toUpperCase() || 'TRIBU'} // {currentRodada.category.toUpperCase()} ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[0.95]">
              {currentRodada.title}
            </h1>
            <p className="font-mono text-xs text-ash uppercase tracking-wider mt-4">
              {currentRodada.subtitle}
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#0E0C0A]">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>ESTADO:</span>
                <span className={`font-bold uppercase ${isWinningRouteLocked ? 'text-earth' : 'text-emerald-400'}`}>
                  {isWinningRouteLocked ? 'Ruta Fijada Oficial' : 'Consenso Abierto'}
                </span>
              </div>
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>VENTANA:</span>
                <span className="text-white">{currentRodada.startDate} al {currentRodada.endDate}</span>
              </div>
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>BASECAMP:</span>
                <span className="text-white">Corral de Piedra / Navana</span>
              </div>
              <div className="flex justify-between text-ash">
                <span>FLOTILLA:</span>
                <span className="text-earth font-bold">
                  {currentRodada.attendees.filter(a => a.status === 'confirmado').length} PILOTOS CONFIRMADOS
                </span>
              </div>
            </div>

            {/* Voting & Lock Actions */}
            <div className="pt-6 space-y-2">
              <button
                onClick={handleVote}
                className={`w-full py-3.5 px-4 font-mono text-xs uppercase font-bold tracking-widest border transition flex items-center justify-center gap-2 ${
                  userHasVoted
                    ? 'bg-earth text-white border-earth'
                    : 'bg-white text-obsidian border-white hover:bg-earth hover:text-white hover:border-earth'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{userHasVoted ? 'Voto Registrado // Quitar Voto' : 'Votar por esta Variante'}</span>
              </button>

              {/* Consensus Lock for Captain */}
              {isWinningRouteLocked ? (
                <button
                  onClick={() => unlockWinningRoute(currentRodada.id)}
                  className="w-full py-2.5 px-3 border border-white/20 hover:border-white text-ash hover:text-white font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <Unlock className="w-3.5 h-3.5 text-earth" />
                  <span>Reabrir Consenso de Rutas</span>
                </button>
              ) : (
                <button
                  onClick={() => lockWinningRoute(currentRodada.id, activeRoute.id)}
                  className="w-full py-2.5 px-3 border border-earth/40 hover:border-earth text-earth hover:bg-earth/10 font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Fijar como Ruta Ganadora</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Atmospheric Image */}
        <div className="relative h-72 sm:h-[400px] w-full overflow-hidden border-b border-white/10">
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1800" 
            alt="Corral de Piedra Amanalco" 
            className="w-full h-full object-cover filter brightness-75 contrast-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 font-mono text-xs text-white/80 bg-black/70 backdrop-blur-md px-3.5 py-1.5 border border-white/20">
            COORDENADAS REFUGIO // 19°24&apos;02&quot;N 99°16&apos;54&quot;W
          </div>
        </div>

        {/* Telemetry Cells (Strict 4-Column Swiss Grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 font-mono text-xs divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">01. Distancia Total</span>
            <p className="font-display font-extrabold text-3xl text-white mt-1">{activeRoute.totalKm} KM</p>
            <p className="text-[11px] text-ash mt-1">2h 30m asfalto + brecha libre</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">02. Terreno</span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center gap-1.5 font-display font-extrabold text-2xl text-earth" title="Montaña / Terracería">
                <Mountain className="w-6 h-6 text-earth shrink-0" />
                <span>{activeRoute.offroadPercentage}%</span>
              </span>
              <span className="flex items-center gap-1.5 font-display font-extrabold text-2xl text-white" title="Carretera / Asfalto">
                <RoadIcon className="w-6 h-6 text-white shrink-0" />
                <span>{activeRoute.asphaltPercentage || (100 - activeRoute.offroadPercentage)}%</span>
              </span>
            </div>
            <p className="text-[11px] text-ash mt-1">Tierra compacta, pinocha y asfalto</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">03. Altitud Refugio</span>
            <p className="font-display font-extrabold text-3xl text-white mt-1">{activeRoute.campsite.elevationMeters} M</p>
            <p className="text-[11px] text-ash mt-1">Reserva natural Amanalco</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">04. Clima Nocturno</span>
            <p className="font-display font-extrabold text-3xl text-cyan-300 mt-1">{activeRoute.campsite.minTempNight}</p>
            <p className="text-[11px] text-ash mt-1">Sleeping 0°C recomendado</p>
          </div>
        </div>

      </section>

      {/* 02. PROPOSALS SELECTOR & CONSENSUS VOTING TABLE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ 02 // EVALUACIÓN DE TRAZOS ]
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Variantes Propuestas por la Flotilla ({currentRodadaRoutes.length})
            </h2>
            <p className="text-xs text-ash font-light mt-0.5">
              Haz clic en cada propuesta para actualizar el mapa, la altimetría y registrar tu voto por consenso.
            </p>
          </div>

          <button
            onClick={onOpenProposeRoute}
            className="px-4 py-2 border border-white/20 hover:border-earth bg-white/[0.02] text-white font-mono text-xs uppercase tracking-wider transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-earth" />
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
                className={`p-5 border cursor-pointer transition flex flex-col justify-between relative ${
                  isSelected 
                    ? 'border-earth bg-white/[0.04]' 
                    : 'border-white/10 bg-[#0B0A09] hover:border-white/30'
                }`}
              >
                {/* Header indicator */}
                <div className="flex items-center justify-between font-mono text-[10px] text-ash mb-3">
                  <span>OPCIÓN 0{idx + 1}</span>
                  {isLeader && (
                    <span className="px-1.5 py-0.5 bg-earth text-white font-bold uppercase tracking-wider">
                      Líder ({route.votes.length} VOTOS)
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-lg text-white leading-tight">
                    {route.title}
                  </h3>
                  <p className="font-mono text-xs text-ash">
                    {route.destination}, {route.state}
                  </p>
                </div>

                {/* Micro metrics */}
                <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-ash block uppercase">Distancia</span>
                    <span className="text-white font-bold">{route.totalKm} km</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-ash block uppercase">Terreno</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex items-center gap-0.5 text-earth font-bold" title="Montaña / Terracería">
                        <Mountain className="w-2.5 h-2.5 text-earth shrink-0" />
                        <span>{route.offroadPercentage}%</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-white font-bold" title="Carretera / Asfalto">
                        <RoadIcon className="w-2.5 h-2.5 text-white shrink-0" />
                        <span>{route.asphaltPercentage || (100 - route.offroadPercentage)}%</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vote CTA inside card */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                  <span className="text-ash">{route.votes.length} votos</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(route);
                      voteRoute(route.id);
                      confetti({ particleCount: 30, spread: 60 });
                    }}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                      hasVotedThis 
                        ? 'bg-earth text-white' 
                        : 'border border-white/20 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {hasVotedThis ? 'Votado' : 'Votar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 03. CARTOGRAFÍA TÁCTICA & WAYPOINTS (Leaflet Edge-to-Edge) */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-earth animate-pulse" />
            <span className="text-white font-bold uppercase tracking-wider">
              CARTOGRAFÍA ACTIVA // {activeRoute.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenGoogleMaps}
              className="px-3 py-1.5 border border-white/20 hover:border-earth bg-white/[0.03] text-white uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-earth" />
              <span>Abrir Google Maps</span>
            </button>
            <button
              onClick={handleDownloadGpx}
              className="px-3 py-1.5 bg-white hover:bg-earth text-obsidian hover:text-white uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar GPX</span>
            </button>
          </div>
        </div>

        {/* Map View Container */}
        <div className="h-[460px] sm:h-[540px] w-full relative">
          <RouteMap 
            route={activeRoute} 
            allRoutes={currentRodadaRoutes}
            onSelectRoute={(r) => setSelectedRoute(r)}
          />
        </div>

        {/* Waypoints strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs divide-y sm:divide-y-0 sm:divide-x divide-white/10 border-t border-white/10">
          {activeRoute.waypoints.map((wp, i) => (
            <div key={wp.id || i} className="p-4 space-y-1">
              <span className="text-[10px] text-earth uppercase tracking-widest font-bold">
                PUNTO 0{i + 1} // {wp.type.toUpperCase()}
              </span>
              <p className="font-bold text-white">{wp.name}</p>
              <p className="text-[11px] text-ash font-light">{wp.notes || 'Punto de reagrupación'}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 04. BASECAMP CONCEPT VS NOMADIC FATIGUE */}
      <section className="border border-white/10 bg-[#0B0A09] p-6 sm:p-10 space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
            [ 04 // ESTRATEGIA DE EXPEDICIÓN ]
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
            Por Qué Establecer Basecamp (Y No Mudar Tienda Cada Noche)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-5 border border-white/10 bg-white/[0.02] space-y-2">
            <span className="text-earth font-bold text-sm block">01 // SEGURIDAD & AGILIDAD OFF-ROAD</span>
            <p className="text-ash leading-relaxed">
              Rodar en terracería con 25 kg de equipaje alto y bolsas inestables multiplica el riesgo de caída en curvas con grava. Al montar basecamp en Corral de Piedra, las motos salen completamente ligeras para curvear con libertad.
            </p>
          </div>

          <div className="p-5 border border-white/10 bg-white/[0.02] space-y-2">
            <span className="text-earth font-bold text-sm block">02 // REFUGIO TÉRMICO & DESCANSO</span>
            <p className="text-ash leading-relaxed">
              En noviembre la temperatura cae a 3°C a 3,000 msnm. Empacar lonas mojadas con escarcha a las 7:00 AM destruye la moral del grupo. Con basecamp fijo, desayunamos con calma y cerramos la tarde alrededor de la fogata con buena comida.
            </p>
          </div>

          <div className="p-5 border border-white/10 bg-white/[0.02] space-y-2">
            <span className="text-earth font-bold text-sm block">03 // RUTAS CIRCULARES EN TRÉBOL</span>
            <p className="text-ash leading-relaxed">
              La base nos permite hacer bucles: Día 1 subida por brechas hacia Amanalco, Día 2 bucle hacia Valle de Bravo y faldas del Nevado, Día 3 retorno técnico sin cargar bultos pesados.
            </p>
          </div>
        </div>
      </section>

      {/* 05. CONFIRMED RIDERS ROSTER & LIVE PACKING CHECKLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dynamic Attendees List */}
        <section className="lg:col-span-7 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ FLOTILLA ACTIVA ]
              </span>
              <h3 className="font-display font-bold text-xl text-white uppercase">
                Pilotos Confirmados ({currentRodada.attendees.length})
              </h3>
            </div>

            {/* Interactive RSVP Action */}
            <button
              onClick={handleToggleRsvp}
              className={`px-4 py-2 font-mono text-xs uppercase font-bold tracking-wider transition border ${
                isUserConfirmed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500'
                  : 'bg-earth text-white border-earth hover:bg-earth-bright'
              }`}
            >
              {isUserConfirmed ? 'Asistencia Confirmada' : '+ Confirmar Asistencia'}
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {currentRodada.attendees.map((attendee) => {
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
                      <p className="text-ash text-[11px]">
                        {bike ? `${bike.brand} ${bike.model}` : 'Doble Propósito'} · {bike?.tires || 'Llantas 50/50'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-[10px] uppercase font-bold border ${
                    attendee.status === 'confirmado' 
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' 
                      : 'bg-white/[0.05] text-ash border-white/10'
                  }`}>
                    {attendee.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Interactive Packing Checklist with Real Add Item */}
        <section className="lg:col-span-5 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ EQUIPO OBLIGATORIO // CLIMA 4°C ]
              </span>
              <h3 className="font-display font-bold text-xl text-white uppercase">
                Checklist de Basecamp
              </h3>
            </div>

            <div className="space-y-2.5 font-mono text-xs pt-4">
              {(currentRodada.packingList || []).map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePackingItem(currentRodada.id, item.id)}
                  className="flex items-center gap-3 p-3 border border-white/[0.06] hover:border-white/20 cursor-pointer transition select-none bg-white/[0.01]"
                >
                  {item.isDone ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-ash shrink-0" />
                  )}
                  <span className={item.isDone ? 'line-through text-ash' : 'text-chalk'}>
                    {item.item}
                  </span>
                  {item.assignedToName && (
                    <span className="ml-auto text-[10px] text-earth font-bold">
                      [{item.assignedToName.split(' ')[0]}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Gear Input */}
          <form onSubmit={handleAddPackingItem} className="pt-4 border-t border-white/10 flex gap-2">
            <input 
              type="text"
              value={newPackingText}
              onChange={(e) => setNewPackingText(e.target.value)}
              placeholder="+ Añadir equipo (ej. Compresor, botiquín)..."
              className="flex-1 bg-white/[0.03] border border-white/15 px-3 py-2.5 font-mono text-xs text-white placeholder-ash focus:outline-none focus:border-earth"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-xs uppercase font-bold tracking-wider transition"
            >
              + Agregar
            </button>
          </form>
        </section>

      </div>

      {/* 06. LIVE EXPEDITION DISCUSSION LOG */}
      <section className="border border-white/10 bg-[#0B0A09] p-6 sm:p-10 space-y-6">
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ 06 // BITÁCORA DE DISCUSIÓN ]
            </span>
            <h3 className="font-display font-bold text-2xl text-white uppercase">
              Comentarios del Trazo ({activeRoute.comments.length})
            </h3>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 font-mono text-xs">
          {activeRoute.comments.map((comment) => (
            <div key={comment.id} className="p-4 border border-white/10 bg-white/[0.02] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-ash">
                <span className="text-white font-bold">{comment.userName}</span>
                <span>
                  {isNaN(Date.parse(comment.createdAt))
                    ? comment.createdAt
                    : new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-chalk font-light pt-1">{comment.text}</p>
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
            className="flex-1 bg-white/[0.03] border border-white/15 px-4 py-3 font-mono text-xs text-white placeholder-ash focus:outline-none focus:border-earth"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-xs uppercase font-bold tracking-widest transition"
          >
            Publicar
          </button>
        </form>
      </section>

    </div>
  );
};
