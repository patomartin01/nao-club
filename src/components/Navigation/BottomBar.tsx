'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Map, Plus, Wrench } from 'lucide-react';

interface BottomBarProps {
  onOpenProposeRoute: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateRodada?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ 
  onOpenProposeRoute,
  onOpenCreateRodada
}) => {
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
      aria-label="Navegación de aplicación móvil"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0A09]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-12px_36px_rgba(0,0,0,0.85)] select-none"
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

      {/* Main App Bottom Bar Container - 3 Primary Tabs + 1 Center Action */}
      <div className="max-w-md mx-auto px-6 py-2 sm:py-2.5 flex items-center justify-between">
        
        {/* 01. MIS GRUPOS & RODADAS */}
        <button
          onClick={() => setActiveNavTab('home')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isGroupTab ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${isGroupTab ? 'scale-110 text-earth' : ''}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white rounded-none">
              {crews.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isGroupTab ? 'text-earth font-bold' : ''}`}>
            Grupos
          </span>
        </button>

        {/* 02. CENTER FAB: CONVOCAR / PROPONER RUTA */}
        <div className="flex-shrink-0 px-3 -mt-4 sm:-mt-5">
          <button
            onClick={() => {
              if (onOpenCreateRodada) {
                onOpenCreateRodada();
              } else {
                onOpenProposeRoute();
              }
            }}
            title="Convocar rodada o proponer ruta"
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-earth hover:bg-earth-bright text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(200,125,85,0.4)] border-2 border-[#0B0A09] active:scale-90 transition-transform duration-150 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <span className="block text-center font-mono text-[7px] sm:text-[8px] uppercase tracking-wider text-earth font-bold mt-0.5">
            + Convocar
          </span>
        </div>

        {/* 03. EXPLORADOR DE RUTAS OFF-ROAD */}
        <button
          onClick={() => setActiveNavTab('rutas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeNavTab === 'rutas' ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Map className={`w-5 h-5 transition-transform ${activeNavTab === 'rutas' ? 'scale-110 text-earth' : ''}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white rounded-none">
              {routeProposals.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${activeNavTab === 'rutas' ? 'text-earth font-bold' : ''}`}>
            Rutas
          </span>
        </button>

        {/* 04. HANGAR & PILOTO */}
        <button
          onClick={() => setActiveNavTab('garaje')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeNavTab === 'garaje' ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Wrench className={`w-5 h-5 transition-transform ${activeNavTab === 'garaje' ? 'scale-110 text-earth' : ''}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white rounded-none">
              {userBikes.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${activeNavTab === 'garaje' ? 'text-earth font-bold' : ''}`}>
            Hangar
          </span>
        </button>

      </div>

      {/* iOS Home Indicator Spacer */}
      <div className="h-[env(safe-area-inset-bottom,4px)] w-full" />
    </aside>
  );
};
