'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { Search, ThumbsUp, Plus, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RouteExplorerViewProps {
  onOpenProposeRoute: () => void;
}

export const RouteExplorerView: React.FC<RouteExplorerViewProps> = ({ onOpenProposeRoute }) => {
  const { routeProposals, selectedRoute, setSelectedRoute, voteRoute, currentUser, setActiveNavTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredRoutes = routeProposals.filter(r => {
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

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 01. HEADER */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block mb-2">
              [ 02 // CARTOGRAFÍA & VOTACIÓN DE FLOTILLA ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-[0.95]">
              Archivo de Travesías & Brechas
            </h1>
            <p className="font-mono text-xs text-ash uppercase tracking-wider mt-4">
              TELEMETRÍA COMPARADA_PORCENTAJE DE BRECHA_ALTIMETRÍA Y ESTADO DE VOTACIÓN POR CONECTIVIDAD DE GRUPO_
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#0E0C0A] font-mono text-xs">
            <div>
              <span className="text-[10px] text-ash uppercase tracking-widest block">FILTRAR POR DIFICULTAD</span>
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
                className="w-full py-3 bg-earth hover:bg-earth-bright text-white font-mono text-xs uppercase font-bold tracking-widest transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Proponer Variante</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Input (Full Bleed) */}
        <div className="p-4 sm:p-6 bg-[#080706] flex items-center gap-3 font-mono text-xs border-b border-white/10">
          <Search className="w-4 h-4 text-ash" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino, bosque o estado (ej. Amanalco, Mineral del Chico, Tlaxcala)..."
            className="w-full bg-transparent text-white placeholder-ash focus:outline-none"
          />
        </div>
      </section>

      {/* 02. SPLIT LAYOUT: MAP ON TOP + ROUTES MATRIX BELOW */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-earth animate-pulse" />
            <span className="text-white font-bold uppercase">
              VISTA ACTIVA // {activeRoute.title} ({activeRoute.totalKm} KM · {activeRoute.offroadPercentage}% OFF-ROAD)
            </span>
          </div>

          <button
            onClick={() => setActiveNavTab('rodada')}
            className="text-earth hover:text-white font-bold uppercase tracking-wider flex items-center gap-1"
          >
            <span>Ver Expedición 01</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-[420px] sm:h-[480px] w-full relative">
          <RouteMap 
            route={activeRoute} 
            allRoutes={filteredRoutes}
            onSelectRoute={(r) => setSelectedRoute(r)}
          />
        </div>
      </section>

      {/* 03. FULL ROUTES CARDS GRID */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-4">
          <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
            [ CATÁLOGO DE RUTAS REGISTRADAS ]
          </span>
          <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
            {filteredRoutes.length} Trazados Disponibles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => {
            const isSelected = route.id === activeRoute.id;
            const hasVoted = route.votes.includes(currentUser.id);

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
                {/* Photo & Overlay */}
                <div className="h-52 w-full relative overflow-hidden border-b border-white/10">
                  <img 
                    src={route.coverImage} 
                    alt={route.title} 
                    className="w-full h-full object-cover filter brightness-80"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] text-white border border-white/20">
                    {route.destination.toUpperCase()}, {route.state.toUpperCase()}
                  </div>
                  <div className="absolute top-4 right-4 bg-earth text-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase">
                    {route.votes.length} VOTOS
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white uppercase">
                      {route.title}
                    </h3>
                    <p className="text-xs text-ash mt-1 line-clamp-2 font-light">
                      {route.description}
                    </p>
                  </div>

                  {/* Telemetry cells */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-ash uppercase block">Distancia</span>
                      <span className="text-white font-bold">{route.totalKm} km</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ash uppercase block">Brecha</span>
                      <span className="text-earth font-bold">{route.offroadPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-ash uppercase block">Altitud Base</span>
                      <span className="text-white font-bold">{route.campsite.elevationMeters} m</span>
                    </div>
                  </div>

                  {/* Footer & Voting */}
                  <div className="flex items-center justify-between font-mono text-xs pt-1">
                    <span className="text-[11px] text-ash">
                      Propuesto por <strong className="text-white">{route.proposedByName}</strong>
                    </span>

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
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
