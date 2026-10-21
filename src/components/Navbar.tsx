'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Key } from 'lucide-react';

interface NavbarProps {
  onOpenCreateRodada: () => void;
  onOpenProposeRoute: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateCrew: () => void;
  onOpenRecordRoute?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProposeRoute,
  onOpenJoinCrew
}) => {
  const { setActiveNavTab, currentUser, currentRodada } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0A09] border-b border-white/[0.08] select-none">
      
      {/* 1. TOP TICK-MARK RULER (Superficial.design signature element) */}
      <div className="w-full h-2.5 border-b border-white/[0.06] bg-black/40 overflow-hidden flex items-center">
        <div className="w-full flex justify-between px-2 opacity-30 font-mono text-[8px] text-white/50 tracking-tighter">
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

      {/* 2. LEAN APP HEADER */}
      <div className="w-full flex items-center justify-between px-4 sm:px-8 py-3.5 min-h-[60px]">
        
        {/* Left: Brand Logotype */}
        <div 
          onClick={() => setActiveNavTab('home')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="flex items-baseline gap-2.5">
            <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-[0.22em] text-white group-hover:text-earth transition">
              NAO
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ash hidden sm:inline">
              // MOTO EXPEDITIONS
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls & Pilot Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 font-mono text-xs">
          
          <button
            onClick={onOpenJoinCrew}
            title="Unirse con clave de grupo"
            className="px-3 py-1.5 text-ash hover:text-white hover:bg-white/[0.04] border border-white/10 transition flex items-center gap-1.5 text-[10px] uppercase font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unirse #</span>
          </button>

          <button
            onClick={onOpenProposeRoute}
            className="px-3.5 py-1.5 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ruta</span>
          </button>

          {/* Pilot avatar thumbnail */}
          <div 
            onClick={() => setActiveNavTab('garaje')}
            title="Ver Hangar y Perfil de Piloto"
            className="flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer group"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-8 h-8 object-cover border border-white/20 group-hover:border-earth transition"
            />
            <div className="hidden xl:block text-left text-[10px]">
              <p className="font-bold text-white leading-none">{currentUser.name.split(' ')[0]}</p>
              <p className="text-ash text-[9px] leading-tight">BMW R 1250 GS</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. SUB-BAR: LIVE EXPEDITION TELEMETRY */}
      <div className="w-full bg-[#080706] border-t border-white/[0.04] px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between text-[10px] font-mono text-ash">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-earth animate-pulse" />
          <span className="text-white">
            TRAZADO ACTIVO: <strong className="text-chalk font-bold">{currentRodada?.title.toUpperCase() || 'CORRAL DE PIEDRA // AMANALCO'}</strong>
          </span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden md:inline">19°24&apos;02&quot;N 99°16&apos;54&quot;W</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span>SALIDA: <strong className="text-white">INTERLOMAS</strong></span>
          <span className="text-white/20">/</span>
          <span className="text-emerald-400 font-bold">DESTINO: VALLE DE BRAVO / CORRAL DE PIEDRA</span>
        </div>
      </div>

    </header>
  );
};
