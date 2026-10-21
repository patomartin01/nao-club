'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { 
  CheckSquare, 
  Square,
  ThumbsUp,
  MessageSquare,
  Send,
  Lock,
  Unlock,
  Shield,
  Layers,
  Thermometer,
  Flame,
  Compass,
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
    currentUser,
    setActiveNavTab,
  } = useApp();

  const [commentText, setCommentText] = useState('');

  if (!currentRodada) {
    return (
      <div className="py-24 text-center font-mono text-xs text-ash">
        NO SE ENCONTRARON EXPEDICIONES ACTIVAS.
      </div>
    );
  }

  const activeRoute = selectedRoute || currentRodadaRoutes[0];
  const isWinningRouteLocked = Boolean(currentRodada.winningRouteId);
  const userHasVoted = activeRoute?.votes.includes(currentUser.id);

  const handleVote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeRoute) return;
    voteRoute(activeRoute.id);
    confetti({ particleCount: 35, spread: 70, origin: { y: 0.8 } });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeRoute) return;
    addRouteComment(activeRoute.id, commentText);
    setCommentText('');
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
          ESTADO: {currentRodada.status === 'votacion' ? '⚡ VOTACIÓN DE RUTAS' : '✓ CONFIRMADA'}
        </span>
      </div>

      {/* 01. EXPEDITION EDITORIAL HERO & SPEC SHEET */}
      <section className="border border-white/10 bg-[#0B0A09]">
        
        {/* Top Identification Row */}
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block mb-2">
              [ {currentCrew?.name.toUpperCase() || 'MOTO CLUB'} // {currentRodada.category.toUpperCase()} ]
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
                <span className="text-emerald-400 font-bold uppercase">Consenso Abierto</span>
              </div>
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>VENTANA:</span>
                <span className="text-white">31 OCT — 02 NOV</span>
              </div>
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>BASECAMP:</span>
                <span className="text-white">NAVANA CABINS</span>
              </div>
              <div className="flex justify-between text-ash">
                <span>FLOTILLA:</span>
                <span className="text-earth font-bold">4 PILOTOS CONFIRMADOS</span>
              </div>
            </div>

            <div className="pt-6">
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
            </div>
          </div>
        </div>

        {/* Hero Atmospheric Image with Cut Lines */}
        <div className="relative h-72 sm:h-[420px] w-full overflow-hidden border-b border-white/10">
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
            <p className="text-[11px] text-ash mt-1">2h 30m asfalto + 4h brecha</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">02. Terreno Off-Road</span>
            <p className="font-display font-extrabold text-3xl text-earth mt-1">{activeRoute.offroadPercentage}%</p>
            <p className="text-[11px] text-ash mt-1">Tierra compacta, pinocha y grava</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">03. Altitud Refugio</span>
            <p className="font-display font-extrabold text-3xl text-white mt-1">{activeRoute.campsite.elevationMeters} M</p>
            <p className="text-[11px] text-ash mt-1">Reserva natural Amanalco</p>
          </div>

          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">04. Clima Nocturno</span>
            <p className="font-display font-extrabold text-3xl text-cyan-300 mt-1">{activeRoute.campsite.nightTemperature}</p>
            <p className="text-[11px] text-ash mt-1">Sleeping 0°C + Sauna en base</p>
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
              Variantes Propuestas por la Flotilla
            </h2>
            <p className="text-xs text-ash font-light mt-0.5">
              Haz clic en cada propuesta para actualizar el mapa, la altimetría y registrar tu voto por consenso.
            </p>
          </div>

          <button
            onClick={onOpenProposeRoute}
            className="px-4 py-2 border border-white/20 hover:border-earth bg-white/[0.02] text-white font-mono text-xs uppercase tracking-wider transition"
          >
            + Proponer Nueva Opción
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
                    <span className="text-[9px] text-ash block uppercase">Off-Road</span>
                    <span className="text-earth font-bold">{route.offroadPercentage}%</span>
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
                    }}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider transition ${
                      hasVotedThis 
                        ? 'bg-earth text-white' 
                        : 'border border-white/20 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    {hasVotedThis ? 'Votado ✓' : 'Votar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 03. CARTOGRAFÍA TÁCTICA & WAYPOINTS (Leaflet Edge-to-Edge) */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-earth animate-pulse" />
            <span className="text-white font-bold uppercase tracking-wider">
              CARTOGRAFÍA ACTIVA // {activeRoute.title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-ash">
            <span>DIFICULTAD: <strong className="text-white">{activeRoute.difficulty}</strong></span>
            <span>/</span>
            <span>SALIDA: INTERLOMAS (0 KM)</span>
            <span>/</span>
            <span>LLEGADA: NAVANA (120 KM)</span>
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
              Rodar en terracería con 25 kg de equipaje alto y bolsas inestables multiplica el riesgo de caída en curvas con grava. Al montar base en Corral de Piedra / Navana, las motos salen completamente ligeras para curvear con libertad.
            </p>
          </div>

          <div className="p-5 border border-white/10 bg-white/[0.02] space-y-2">
            <span className="text-earth font-bold text-sm block">02 // RECUPERACIÓN & WELLNESS</span>
            <p className="text-ash leading-relaxed">
              Tras 5 horas de terracería y polvo a 4°C, desempacar una tienda congelada a medianoche drena la energía del grupo. Navana Cabins ofrece sauna nórdico encendido a 78°C, regaderas de agua caliente y pozo de fuego con leña seca lista.
            </p>
          </div>

          <div className="p-5 border border-white/10 bg-white/[0.02] space-y-2">
            <span className="text-earth font-bold text-sm block">03 // TALLER CENTRALIZADO</span>
            <p className="text-ash leading-relaxed">
              Si una moto pincha o necesita calibración de presiones (bajar 4 PSI para pinocha húmeda), la herramienta pesada (compresor 12V, dinamométrica, mechas tubeless) permanece segura y resguardada en el campamento base.
            </p>
          </div>
        </div>
      </section>

      {/* 05. FLOTILLA & GEAR CHECKLIST DUAL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Confirmed Flotilla */}
        <section className="lg:col-span-7 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ FLOTILLA REGISTRADA ]
              </span>
              <h3 className="font-display font-bold text-xl text-white uppercase">
                4 Pilotos & Máquinas
              </h3>
            </div>
            <span className="font-mono text-xs text-ash">4 CONFIRMADOS</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={currentUser.avatar} 
                  alt="Patricio" 
                  className="w-10 h-10 object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white uppercase">Patricio Martin (Líder)</p>
                  <p className="text-ash text-[11px]">BMW R 1250 GS Adventure · Metzeler Karoo 4</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/[0.05] border border-white/10 text-earth text-[10px] uppercase font-bold">
                Confirmado
              </span>
            </div>

            <div className="p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                  alt="Diego" 
                  className="w-10 h-10 object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white uppercase">Diego &quot;Capi&quot; R.</p>
                  <p className="text-ash text-[11px]">KTM 890 Adventure R · Continental TKC80</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/[0.05] border border-white/10 text-earth text-[10px] uppercase font-bold">
                Confirmado
              </span>
            </div>

            <div className="p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                  alt="Sofía" 
                  className="w-10 h-10 object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white uppercase">Sofía Montiel</p>
                  <p className="text-ash text-[11px]">Husqvarna Norden 901 · Pirelli Scorpion Rally STR</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/[0.05] border border-white/10 text-earth text-[10px] uppercase font-bold">
                Confirmado
              </span>
            </div>

            <div className="p-4 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" 
                  alt="Rigo" 
                  className="w-10 h-10 object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white uppercase">Rigo Méndez</p>
                  <p className="text-ash text-[11px]">Yamaha Ténéré 700 · Motoz Tractionator RallZ</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/[0.05] border border-white/10 text-earth text-[10px] uppercase font-bold">
                Confirmado
              </span>
            </div>
          </div>
        </section>

        {/* Right: Interactive Packing Checklist */}
        <section className="lg:col-span-5 border border-white/10 bg-[#0B0A09] p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ EQUIPO OBLIGATORIO // CLIMA 4°C ]
            </span>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Checklist de Basecamp
            </h3>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {(currentRodada.packingList || []).map((item) => (
              <div
                key={item.id}
                onClick={() => togglePackingItem(currentRodada.id, item.id)}
                className="flex items-center gap-3 p-3 border border-white/[0.06] hover:border-white/20 cursor-pointer transition select-none"
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
