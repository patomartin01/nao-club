'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import { RouteMap } from '../Map/RouteMap';
import { ShareRouteModal } from '../Modals/ShareRouteModal';
import { SaveToListModal } from '../Modals/SaveToListModal';
import { 
  Search, 
  ThumbsUp, 
  Plus, 
  ArrowUpRight, 
  ExternalLink, 
  Download,
  Share2,
  Bookmark,
  CheckCircle,
  Award,
  Layers,
  MapPin,
  TrendingUp,
  FolderPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouteExplorerViewProps {
  onOpenProposeRoute: () => void;
}

type ExplorerTab = 'all' | 'completed' | 'saved';

export const RouteExplorerView: React.FC<RouteExplorerViewProps> = ({ onOpenProposeRoute }) => {
  const { 
    routeProposals, 
    selectedRoute, 
    setSelectedRoute, 
    voteRoute, 
    currentUser, 
    enterRodada,
    completedRouteIds,
    savedRouteIds,
    routeLists,
    toggleCompletedRoute,
    toggleSavedRoute,
    openPilotProfileById
  } = useApp();

  const [currentTab, setCurrentTab] = useState<ExplorerTab>('all');
  const [selectedListId, setSelectedListId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Modal states
  const [shareRoute, setShareRoute] = useState<RouteProposal | null>(null);
  const [saveRouteModal, setSaveRouteModal] = useState<RouteProposal | null>(null);

  // Tab Filtering
  const getTabFilteredRoutes = () => {
    if (currentTab === 'completed') {
      return routeProposals.filter(r => completedRouteIds.includes(r.id));
    }
    if (currentTab === 'saved') {
      if (selectedListId === 'all') {
        return routeProposals.filter(r => savedRouteIds.includes(r.id));
      }
      const list = routeLists.find(l => l.id === selectedListId);
      return routeProposals.filter(r => list?.routeIds.includes(r.id));
    }
    return routeProposals;
  };

  const tabRoutes = getTabFilteredRoutes();

  // Search & Difficulty filtering
  const filteredRoutes = tabRoutes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'all' || r.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const activeRoute = selectedRoute || filteredRoutes[0] || routeProposals[0];

  const handleVote = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    voteRoute(routeId);
    confetti({ particleCount: 30, spread: 60 });
  };

  const handleToggleCompleted = (e: React.MouseEvent, routeId: string) => {
    e.stopPropagation();
    const isCompleted = completedRouteIds.includes(routeId);
    toggleCompletedRoute(routeId);
    if (!isCompleted) {
      confetti({ particleCount: 60, spread: 80 });
    }
  };

  const handleOpenShare = (e: React.MouseEvent, route: RouteProposal) => {
    e.stopPropagation();
    setShareRoute(route);
  };

  const handleOpenSaveToList = (e: React.MouseEvent, route: RouteProposal) => {
    e.stopPropagation();
    setSaveRouteModal(route);
  };

  return (
    <div className="space-y-10 pb-32 text-chalk font-mono">
      
      {/* 01. STRAVA & WIKILOC STYLE HEADER & TELEMETRY */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 lg:col-span-8 p-6 sm:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold block mb-2">
              [ 02 // CARTOGRAFÍA COMUNITARIA · ESTILO STRAVA & WIKILOC ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-[0.95]">
              Archivo de Travesías & Brechas
            </h1>
            <p className="text-xs text-ash uppercase tracking-wider mt-4">
              REGISTRA TUS RUTAS CONQUISTADAS_CREA COLECCIONES PRIVADAS O COMPARTIDAS_TELEMETRÍA EN TIERRA Y PERFILES DE PILOTOS_
            </p>

            {/* Quick Stats Pill for the Logged-in Pilot */}
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-earth" />
                <span className="text-ash">Tu Odómetro Off-Road:</span>
                <strong className="text-white font-display text-sm">{currentUser.stats?.totalKm || 1850} km</strong>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-ash">Conquistadas:</span>
                <strong className="text-white font-display text-sm">{completedRouteIds.length} rutas</strong>
              </div>
              <span className="text-white/20">•</span>
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cyan-400" />
                <span className="text-ash">Guardadas en Listas:</span>
                <strong className="text-white font-display text-sm">{savedRouteIds.length} rutas</strong>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#0E0C0A] text-xs">
            <div>
              <span className="text-[10px] text-ash uppercase tracking-widest block font-bold">FILTRAR POR DIFICULTAD</span>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {['all', 'Fácil (Fluida)', 'Intermedia', 'Técnica'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-2 text-[10px] uppercase font-bold tracking-wider border transition ${
                      selectedDifficulty === diff
                        ? 'bg-white text-obsidian border-white'
                        : 'border-white/10 text-ash hover:text-white'
                    }`}
                  >
                    {diff === 'all' ? 'Todas' : diff.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={onOpenProposeRoute}
                className="w-full py-3.5 bg-earth hover:bg-earth/80 text-white text-xs uppercase font-bold tracking-widest transition flex items-center justify-center gap-2 shadow-xl"
              >
                <Plus className="w-4 h-4" />
                <span>+ Proponer / Subir Track</span>
              </button>
            </div>
          </div>
        </div>

        {/* 02. STRAVA / WIKILOC SUB-TABS */}
        <div className="bg-[#080706] border-b border-white/10 flex flex-wrap items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentTab('all')}
              className={`py-4 px-4 sm:px-6 text-xs uppercase font-bold tracking-wider border-b-2 transition ${
                currentTab === 'all'
                  ? 'border-earth text-white bg-white/[0.03]'
                  : 'border-transparent text-ash hover:text-white'
              }`}
            >
              🧭 Explorar Comunidad ({routeProposals.length})
            </button>

            <button
              onClick={() => setCurrentTab('completed')}
              className={`py-4 px-4 sm:px-6 text-xs uppercase font-bold tracking-wider border-b-2 transition flex items-center gap-2 ${
                currentTab === 'completed'
                  ? 'border-emerald-500 text-emerald-400 bg-white/[0.03]'
                  : 'border-transparent text-ash hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Conquistadas por Mí ({completedRouteIds.length})</span>
            </button>

            <button
              onClick={() => setCurrentTab('saved')}
              className={`py-4 px-4 sm:px-6 text-xs uppercase font-bold tracking-wider border-b-2 transition flex items-center gap-2 ${
                currentTab === 'saved'
                  ? 'border-cyan-400 text-cyan-300 bg-white/[0.03]'
                  : 'border-transparent text-ash hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Mis Listas ({routeLists.length})</span>
            </button>
          </div>

          {/* If on saved lists tab, show list selector pill */}
          {currentTab === 'saved' && (
            <div className="py-2 flex items-center gap-2">
              <span className="text-[10px] text-ash uppercase">Lista:</span>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="bg-black border border-white/20 text-white text-[11px] px-2.5 py-1 uppercase focus:outline-none focus:border-earth"
              >
                <option value="all">Todas las guardadas ({savedRouteIds.length})</option>
                {routeLists.map(list => (
                  <option key={list.id} value={list.id}>
                    {list.name} ({list.routeIds.length})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="p-4 sm:p-5 bg-[#0A0908] flex items-center gap-3 text-xs">
          <Search className="w-4 h-4 text-ash" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino, bosque, brecha o estado (ej. Amanalco, Mineral del Chico, Querétaro)..."
            className="w-full bg-transparent text-white placeholder-ash focus:outline-none"
          />
        </div>
      </section>

      {/* 03. INTERACTIVE ROUTE MAP (WITH SATÉLITE HD & GOOGLE MAPS) */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-earth animate-pulse" />
            <span className="text-white font-bold uppercase">
              MAPA // {activeRoute.title} ({activeRoute.totalKm} KM · {activeRoute.offroadPercentage}% OFF-ROAD)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => handleOpenShare(e, activeRoute)}
              className="text-ash hover:text-white font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5 text-earth" />
              <span>Compartir Ruta</span>
            </button>

            <button
              onClick={() => enterRodada(activeRoute.rodadaId)}
              className="text-earth hover:text-white font-bold uppercase tracking-wider flex items-center gap-1 transition"
            >
              <span>Ver en Sala de Club</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="h-[440px] sm:h-[500px] w-full relative">
          <RouteMap 
            route={activeRoute} 
            allRoutes={filteredRoutes}
            onSelectRoute={(r) => setSelectedRoute(r)}
          />
        </div>
      </section>

      {/* 04. WIKILOC & STRAVA STYLE ROUTE CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold">
              [ {currentTab === 'completed' ? 'TUS TRAVESÍAS CONQUISTADAS' : currentTab === 'saved' ? 'TUS RUTAS GUARDADAS' : 'CATÁLOGO DE TRAVESÍAS'} ]
            </span>
            <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
              {filteredRoutes.length} Trazados Encontrados
            </h2>
          </div>

          {currentTab === 'completed' && (
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">
                Total acumulado en estas rutas:
              </span>
              <span className="font-display font-extrabold text-xl text-white">
                {filteredRoutes.reduce((acc, r) => acc + r.totalKm, 0)} KM
              </span>
            </div>
          )}
        </div>

        {filteredRoutes.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/15 bg-white/[0.01]">
            <p className="text-ash text-sm">No se encontraron rutas con este criterio de filtro.</p>
            {currentTab === 'completed' && (
              <p className="text-xs text-earth mt-2">
                Explora el catálogo y pulsa "Marcar Realizada" en las rutas que hayas rodado para verlas aquí.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoutes.map((route) => {
              const isSelected = route.id === activeRoute.id;
              const hasVoted = route.votes.includes(currentUser.id);
              const isCompleted = completedRouteIds.includes(route.id);
              const isSaved = savedRouteIds.includes(route.id);

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`border cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-earth bg-white/[0.03]'
                      : 'border-white/10 bg-[#0B0A09] hover:border-white/30'
                  }`}
                >
                  {/* Photo & Overlay Badges */}
                  <div className="h-56 w-full relative overflow-hidden border-b border-white/10">
                    <img 
                      src={route.coverImage} 
                      alt={route.title} 
                      className="w-full h-full object-cover filter brightness-85"
                    />
                    
                    {/* Top Left: Destination */}
                    <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-2.5 py-1 text-[10px] text-white border border-white/20">
                      {route.destination.toUpperCase()}, {route.state.toUpperCase()}
                    </div>

                    {/* Top Right: Status / Completed Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="bg-emerald-500 text-black px-2.5 py-1 text-[10px] font-extrabold uppercase shadow-lg flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Conquistada</span>
                        </span>
                      )}
                      <span className="bg-earth text-white px-2.5 py-1 text-[10px] font-bold uppercase shadow-lg">
                        {route.votes.length} VOTOS
                      </span>
                    </div>

                    {/* Difficulty Pill */}
                    <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md px-2.5 py-1 text-[10px] text-chalk border border-white/15">
                      Dificultad: <strong className="text-white">{route.difficulty}</strong>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-xl text-white uppercase leading-tight">
                        {route.title}
                      </h3>
                      <p className="text-xs text-ash mt-1 line-clamp-2 font-light">
                        {route.description}
                      </p>
                    </div>

                    {/* Telemetry Metrics */}
                    <div className="grid grid-cols-4 gap-2 text-center p-3 bg-white/[0.02] border border-white/[0.06] text-xs">
                      <div>
                        <span className="text-[9px] text-ash uppercase block">Distancia</span>
                        <span className="text-white font-bold">{route.totalKm} km</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ash uppercase block">Tiempo</span>
                        <span className="text-white font-bold">{route.estimatedHours.split(' ')[0]}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ash uppercase block">Brecha</span>
                        <span className="text-earth font-bold">{route.offroadPercentage}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ash uppercase block">Altitud</span>
                        <span className="text-cyan-300 font-bold">{route.campsite.elevationMeters}m</span>
                      </div>
                    </div>

                    {/* Pilot Author (Clickable Strava Profile) */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPilotProfileById(route.proposedByUserId);
                        }}
                        className="flex items-center gap-2 hover:opacity-80 transition group text-left"
                        title="Ver perfil estilo Strava de este piloto"
                      >
                        <img 
                          src={route.proposedByAvatar} 
                          alt={route.proposedByName}
                          className="w-6 h-6 rounded-full border border-earth object-cover" 
                        />
                        <span className="text-[11px] text-ash">
                          Trazada por <strong className="text-white group-hover:text-earth transition underline decoration-dotted">{route.proposedByName}</strong>
                        </span>
                      </button>

                      <span className="text-[10px] text-ash">
                        {route.comments.length} bitácoras
                      </span>
                    </div>

                    {/* STRAVA & WIKILOC ACTION BUTTONS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.08]">
                      <div className="flex items-center gap-1.5">
                        {/* 1. Mark as Completed (Strava Style) */}
                        <button
                          onClick={(e) => handleToggleCompleted(e, route.id)}
                          className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition flex items-center gap-1.5 ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                              : 'border-white/20 text-ash hover:text-white hover:border-white'
                          }`}
                          title="Marcar como ruta completada en tu odómetro"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isCompleted ? '✓ Conquistada' : 'Realizada'}</span>
                        </button>

                        {/* 2. Save / Add to List (Wikiloc Style) */}
                        <button
                          onClick={(e) => handleOpenSaveToList(e, route)}
                          className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider border transition flex items-center gap-1.5 ${
                            isSaved
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                              : 'border-white/20 text-ash hover:text-white hover:border-white'
                          }`}
                          title="Guardar en tus listas o crear colección"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          <span>{isSaved ? 'Guardada' : 'Guardar'}</span>
                        </button>

                        {/* 3. Share Button */}
                        <button
                          onClick={(e) => handleOpenShare(e, route)}
                          className="p-1.5 text-ash hover:text-white border border-white/20 hover:border-white transition"
                          title="Compartir ruta por WhatsApp o enlace"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Vote Button */}
                        <button
                          onClick={(e) => handleVote(e, route.id)}
                          className={`px-3 py-1.5 uppercase font-bold text-[10px] tracking-wider border transition ${
                            hasVoted 
                              ? 'bg-earth text-white border-earth' 
                              : 'border-white/20 text-white hover:bg-white hover:text-black'
                          }`}
                        >
                          {hasVoted ? 'Votado ✓' : 'Votar'}
                        </button>

                        {/* Jump to Rodada */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoute(route);
                            enterRodada(route.rodadaId);
                          }}
                          className="px-3 py-1.5 uppercase font-bold text-[10px] tracking-wider bg-white/[0.04] hover:bg-earth text-white border border-white/15 transition flex items-center gap-1"
                        >
                          <span>En Rodada</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share Route Modal */}
      <ShareRouteModal
        route={shareRoute}
        isOpen={Boolean(shareRoute)}
        onClose={() => setShareRoute(null)}
      />

      {/* Save to List Modal */}
      <SaveToListModal
        route={saveRouteModal}
        isOpen={Boolean(saveRouteModal)}
        onClose={() => setSaveRouteModal(null)}
      />

    </div>
  );
};
