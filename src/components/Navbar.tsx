'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Flame, MapPin, Shield, Layers, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenProposeRoute: () => void;
  onOpenJoinCrew: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProposeRoute, onOpenJoinCrew }) => {
  const { activeNavTab, setActiveNavTab, currentUser, userBikes } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#060709]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Mark */}
          <div 
            onClick={() => setActiveNavTab('rodada')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-[0.25em] text-white group-hover:text-[#C87D55] transition-colors">
                NAO
              </span>
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase pl-1 border-l border-white/20">
                Navana Expeditions
              </span>
            </div>
          </div>

          {/* Minimalist Editorial Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveNavTab('rodada')}
              className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-200 border-b-2 ${
                activeNavTab === 'rodada'
                  ? 'border-[#C87D55] text-white font-bold'
                  : 'border-transparent text-white/50 hover:text-white/90 hover:border-white/20'
              }`}
            >
              01 // Expediciones
            </button>

            <button
              onClick={() => setActiveNavTab('rutas')}
              className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-200 border-b-2 ${
                activeNavTab === 'rutas'
                  ? 'border-[#C87D55] text-white font-bold'
                  : 'border-transparent text-white/50 hover:text-white/90 hover:border-white/20'
              }`}
            >
              02 // Cartografía & Votos
            </button>

            <button
              onClick={() => setActiveNavTab('brand')}
              className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-200 border-b-2 ${
                activeNavTab === 'brand'
                  ? 'border-[#C87D55] text-white font-bold'
                  : 'border-transparent text-white/50 hover:text-white/90 hover:border-white/20'
              }`}
            >
              03 // Santuario Navana
            </button>

            <button
              onClick={() => setActiveNavTab('garaje')}
              className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-200 border-b-2 ${
                activeNavTab === 'garaje'
                  ? 'border-[#C87D55] text-white font-bold'
                  : 'border-transparent text-white/50 hover:text-white/90 hover:border-white/20'
              }`}
            >
              04 // Hangar ({userBikes.length})
            </button>
          </nav>

          {/* Right Action / Telemetry */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] font-mono text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              19°24&apos;N · 2,980 M · SAUNA ACTIVO
            </div>

            <button
              onClick={onOpenProposeRoute}
              className="px-3.5 py-2 border border-white/20 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#C87D55] hover:text-white hover:border-[#C87D55] transition-all duration-200"
            >
              + Proponer Ruta
            </button>

            <div 
              onClick={() => setActiveNavTab('garaje')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-[#C87D55] transition"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile sub-bar */}
      <div className="flex md:hidden items-center justify-around py-2 border-t border-white/[0.06] text-[11px] font-mono uppercase text-white/60">
        <button 
          onClick={() => setActiveNavTab('rodada')}
          className={activeNavTab === 'rodada' ? 'text-white font-bold' : ''}
        >
          Expediciones
        </button>
        <button 
          onClick={() => setActiveNavTab('rutas')}
          className={activeNavTab === 'rutas' ? 'text-white font-bold' : ''}
        >
          Cartografía
        </button>
        <button 
          onClick={() => setActiveNavTab('brand')}
          className={activeNavTab === 'brand' ? 'text-white font-bold' : ''}
        >
          Santuario
        </button>
        <button 
          onClick={() => setActiveNavTab('garaje')}
          className={activeNavTab === 'garaje' ? 'text-white font-bold' : ''}
        >
          Hangar
        </button>
      </div>
    </header>
  );
};
