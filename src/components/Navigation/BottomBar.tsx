'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Compass, Wrench } from 'lucide-react';

interface BottomBarProps {
  onOpenProposeRoute?: () => void;
  onOpenJoinCrew?: () => void;
  onOpenCreateRodada?: () => void;
  onOpenRecordRoute?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = () => {
  const { 
    activeNavTab, 
    setActiveNavTab, 
    crews, 
    routeProposals, 
    userBikes 
  } = useApp();

  const isGroupTab = activeNavTab === 'home' || activeNavTab === 'crew' || activeNavTab === 'rodada';

  return (
    <aside 
      aria-label="Navegación de aplicación"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0A09]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-12px_36px_rgba(0,0,0,0.85)] select-none pb-[env(safe-area-inset-bottom,6px)]"
    >
      {/* Top subtle micro-ruler (Superficial.design signature) */}
      <div className="w-full h-1 bg-black/60 overflow-hidden flex items-center border-b border-white/[0.04]">
        <div className="w-full flex justify-between px-2 opacity-25">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className={`inline-block ${
                i % 4 === 0 ? 'h-1 w-[1px] bg-white' : 'h-0.5 w-[1px] bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Balanced 3-column minimalist cockpit dock */}
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        
        {/* 01. GRUPOS & RODADAS */}
        <button
          onClick={() => setActiveNavTab('home')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isGroupTab ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${isGroupTab ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white">
              {crews.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1.5 ${isGroupTab ? 'text-earth font-bold' : ''}`}>
            Grupos
          </span>
        </button>

        {/* 02. EXPLORADOR DE RUTAS OFF-ROAD */}
        <button
          onClick={() => setActiveNavTab('rutas')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            activeNavTab === 'rutas' ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 transition-transform ${activeNavTab === 'rutas' ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white">
              {routeProposals.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1.5 ${activeNavTab === 'rutas' ? 'text-earth font-bold' : ''}`}>
            Rutas
          </span>
        </button>

        {/* 03. HANGAR & GARAJE */}
        <button
          onClick={() => setActiveNavTab('garaje')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            activeNavTab === 'garaje' ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Wrench className={`w-5 h-5 transition-transform ${activeNavTab === 'garaje' ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white">
              {userBikes.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1.5 ${activeNavTab === 'garaje' ? 'text-earth font-bold' : ''}`}>
            Hangar
          </span>
        </button>

      </div>

      {/* iOS Home Indicator Spacer */}
      <div className="h-[env(safe-area-inset-bottom,2px)] w-full" />
    </aside>
  );
};
