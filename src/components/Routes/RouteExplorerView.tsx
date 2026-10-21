'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import { RouteMap } from '../Map/RouteMap';
import { Compass, Search, MapPin, Gauge, ThumbsUp, Plus, Filter, Mountain, Tent } from 'lucide-react';
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

  const handleVote = (routeId: string) => {
    voteRoute(routeId);
    confetti({ particleCount: 40 });
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#C87D55] uppercase tracking-widest font-bold">
            <span>[ 02 ]</span>
            <span>Cartografía & Votos</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight mt-1">
            Travesías & Brechas Off-Road
          </h1>
          <p className="text-xs text-white/50 font-light">
            Altimetría, porcentaje de terracería y telemetría de ruta hacia los refugios.
          </p>
        </div>

        <button
          onClick={onOpenProposeRoute}
          className="px-4 py-2.5 bg-white hover:bg-[#C87D55] text-black hover:text-white text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition"
        >
          + Proponer Variante
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por destino, bosque, estado (ej. Toluca, Malinche, Bucareli)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Todas las Dificultades</option>
            <option value="Fácil (Fluida)">Fácil (Fluida)</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado / Técnico">Avanzado / Técnico</option>
          </select>
        </div>
      </div>

      {/* Interactive Map & Route List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Map Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="h-[480px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <RouteMap 
              route={activeRoute} 
              allRoutes={routeProposals}
              onSelectRoute={(r) => setSelectedRoute(r)}
            />
          </div>

          {activeRoute && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Resumen de Campamento
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {activeRoute.campsite.elevationMeters} msnm
                </span>
              </div>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Tent className="w-4 h-4 text-amber-400" />
                {activeRoute.campsite.name}
              </h4>
              <p className="text-xs text-slate-300">
                {activeRoute.campsite.security} • Noche: <strong className="text-slate-100">{activeRoute.campsite.minTempNight}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Right: Route Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredRoutes.map((route, index) => {
            const isSelected = activeRoute?.id === route.id;
            const userVoted = route.votes.includes(currentUser.id);

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className={`p-4 rounded-2xl border transition cursor-pointer space-y-3 group ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm text-white group-hover:text-amber-400 transition">
                        {route.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {route.destination}, {route.state}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(route.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                      userVoted 
                        ? 'bg-emerald-500 text-slate-950' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {route.votes.length}
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {route.description}
                </p>

                {/* Specs pill row */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-slate-800/80">
                  <span className="text-amber-400 font-bold">🛣️ {route.totalKm} km</span>
                  <span className="text-emerald-400 font-bold">🌲 {route.offroadPercentage}% Brecha</span>
                  <span className="text-slate-400">{route.difficulty}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    Por {route.proposedByName}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(route);
                      setActiveNavTab('rodada');
                    }}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Ver en Plan de Rodada →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
