'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Key, Compass, Navigation } from 'lucide-react';

interface NavbarProps {
  onOpenCreateRodada: () => void;
  onOpenProposeRoute: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateCrew: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProposeRoute,
  onOpenJoinCrew,
}) => {
  const { activeNavTab, setActiveNavTab, currentUser } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0A09] border-b border-white/[0.08] select-none">
      
      {/* 1. TOP TICK-MARK RULER (Superficial.design signature element) */}
      <div className="w-full h-3 border-b border-white/[0.06] bg-black/40 overflow-hidden flex items-center">
        <div className="w-full flex justify-between px-2 opacity-35 font-mono text-[8px] text-white/50 tracking-tighter">
          {Array.from({ length: 48 }).map((_, i) => (
            <span 
              key={i} 
              className={`inline-block ${
                i % 6 === 0 
                  ? 'h-2 w-[1px] bg-white' 
                  : i % 2 === 0 
                    ? 'h-1.5 w-[1px] bg-white/40' 
                    : 'h-1 w-[1px] bg-white/20'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. MAIN SWISS GRID HEADER */}
      <div className="w-full grid grid-cols-12 items-stretch min-h-[64px]">
        
        {/* Cell 1: Brand Logotype */}
        <div 
          onClick={() => setActiveNavTab('home')}
          className="col-span-12 sm:col-span-4 lg:col-span-3 border-b sm:border-b-0 sm:border-r border-white/[0.08] px-6 py-4 flex items-center justify-between cursor-pointer group hover:bg-white/[0.02] transition"
        >
          <div className="flex items-baseline gap-3">
            <span className="font-display font-extrabold text-2xl tracking-[0.25em] text-white group-hover:text-earth transition">
              NAO
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ash">
              // NAVANA EXPEDITIONS
            </span>
          </div>
        </div>

        {/* Cell 2: Editorial Navigation Numbers */}
        <nav className="col-span-12 sm:col-span-8 lg:col-span-6 border-b lg:border-b-0 lg:border-r border-white/[0.08] flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar px-2">
          <button
            onClick={() => setActiveNavTab('home')}
            className={`px-4 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeNavTab === 'home' || activeNavTab === 'crew'
                ? 'border-earth text-white font-bold bg-white/[0.02]'
                : 'border-transparent text-ash hover:text-white'
            }`}
          >
            <span className="text-earth font-bold">01.</span>
            <span>Mis Grupos</span>
          </button>

          <button
            onClick={() => setActiveNavTab('rodada')}
            className={`px-4 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeNavTab === 'rodada'
                ? 'border-earth text-white font-bold bg-white/[0.02]'
                : 'border-transparent text-ash hover:text-white'
            }`}
          >
            <span className="text-earth font-bold">02.</span>
            <span>Expedición</span>
          </button>

          <button
            onClick={() => setActiveNavTab('rutas')}
            className={`px-4 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeNavTab === 'rutas'
                ? 'border-earth text-white font-bold bg-white/[0.02]'
                : 'border-transparent text-ash hover:text-white'
            }`}
          >
            <span className="text-earth font-bold">03.</span>
            <span>Rutas</span>
          </button>

          <button
            onClick={() => setActiveNavTab('brand')}
            className={`px-4 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeNavTab === 'brand'
                ? 'border-earth text-white font-bold bg-white/[0.02]'
                : 'border-transparent text-ash hover:text-white'
            }`}
          >
            <span className="text-earth font-bold">04.</span>
            <span>Navana</span>
          </button>

          <button
            onClick={() => setActiveNavTab('garaje')}
            className={`px-4 py-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeNavTab === 'garaje'
                ? 'border-earth text-white font-bold bg-white/[0.02]'
                : 'border-transparent text-ash hover:text-white'
            }`}
          >
            <span className="text-earth font-bold">05.</span>
            <span>Hangar</span>
          </button>
        </nav>

        {/* Cell 3: Action Buttons & Pilot Spec */}
        <div className="col-span-12 lg:col-span-3 px-6 py-3 flex items-center justify-between lg:justify-end gap-3 bg-[#0E0C0A]">
          <button
            onClick={onOpenJoinCrew}
            title="Unirse a expedición con clave"
            className="p-2.5 text-ash hover:text-white hover:bg-white/[0.04] border border-white/10 transition"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenProposeRoute}
            className="px-4 py-2 bg-chalk hover:bg-earth text-obsidian hover:text-white font-mono text-[11px] font-bold uppercase tracking-widest border border-white/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Proponer Ruta</span>
          </button>

          {/* Pilot avatar thumbnail */}
          <div 
            onClick={() => setActiveNavTab('garaje')}
            className="flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-8 h-8 object-cover border border-white/20"
            />
          </div>
        </div>

      </div>

      {/* 3. SUB-BAR: LIVE EXPEDITION TELEMETRY */}
      <div className="w-full bg-[#080706] border-t border-white/[0.04] px-6 py-2 flex flex-wrap items-center justify-between text-[10px] font-mono text-ash">
        <div className="flex items-center gap-4">
          <span className="text-white">
            TRAZADO ACTIVO: <strong className="text-chalk font-bold">CORRAL DE PIEDRA // AMANALCO</strong>
          </span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:inline">COORD: 19°24&apos;02&quot;N 99°16&apos;54&quot;W</span>
          <span className="hidden lg:inline text-white/20">|</span>
          <span className="hidden lg:inline text-earth">REFUGIO: NAVANA CABINS (SAUNA 78°C)</span>
        </div>

        <div className="flex items-center gap-3">
          <span>SALIDA: <strong className="text-white">INTERLOMAS, EDOMEX</strong></span>
          <span className="text-white/20">/</span>
          <span className="text-emerald-400">FLOTILLA: 4 PILOTOS CONFIRMADOS</span>
        </div>
      </div>

    </header>
  );
};
