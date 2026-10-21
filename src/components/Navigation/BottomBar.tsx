'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Compass, Circle, Users } from 'lucide-react';

interface BottomBarProps {
  onOpenRecordRoute?: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ onOpenRecordRoute }) => {
  const { 
    activeNavTab, 
    setActiveNavTab, 
    currentUser,
    activities,
    crews
  } = useApp();

  const isInicio = activeNavTab === 'inicio' || activeNavTab === 'home';
  const isMapas = activeNavTab === 'mapas' || activeNavTab === 'rutas';
  const isRegistrar = activeNavTab === 'registrar';
  const isGrupos = activeNavTab === 'grupos' || activeNavTab === 'crew' || activeNavTab === 'rodada';
  const isTu = activeNavTab === 'tu' || activeNavTab === 'garaje';

  const handleRecordClick = () => {
    setActiveNavTab('registrar');
    if (onOpenRecordRoute) onOpenRecordRoute();
  };

  return (
    <aside 
      aria-label="Navegación de aplicación"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0A09]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-12px_36px_rgba(0,0,0,0.85)] select-none pb-[env(safe-area-inset-bottom,6px)]"
    >
      {/* Top subtle micro-ruler */}
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

      {/* 5-column Strava-style mobile dock */}
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-between">
        
        {/* 01. INICIO (FEED SOCIAL) */}
        <button
          onClick={() => setActiveNavTab('inicio')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isInicio ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isInicio ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
            {activities.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-earth/20 border border-earth/40 text-earth rounded-full">
                {activities.length}
              </span>
            )}
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isInicio ? 'text-earth font-bold' : ''}`}>
            Inicio
          </span>
        </button>

        {/* 02. MAPAS (EXPLORADOR) */}
        <button
          onClick={() => setActiveNavTab('mapas')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isMapas ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${isMapas ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isMapas ? 'text-earth font-bold' : ''}`}>
            Mapas
          </span>
        </button>

        {/* 03. REGISTRAR (CABINA GPS) */}
        <button
          onClick={handleRecordClick}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isRegistrar ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            isRegistrar ? 'border-earth bg-earth/20 scale-105' : 'border-ash/70 group-hover:border-white'
          }`}>
            <Circle className={`w-3.5 h-3.5 fill-current ${isRegistrar ? 'text-earth' : 'text-ash group-hover:text-white'}`} />
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-0.5 ${isRegistrar ? 'text-earth font-bold' : ''}`}>
            Registrar
          </span>
        </button>

        {/* 04. GRUPOS (CLUBES, EVENTOS, RETOS) */}
        <button
          onClick={() => setActiveNavTab('grupos')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isGrupos ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${isGrupos ? 'scale-105 text-earth' : 'group-hover:text-white'}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-white/10 border border-white/20 text-white rounded-full">
              {crews.length}
            </span>
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isGrupos ? 'text-earth font-bold' : ''}`}>
            Grupos
          </span>
        </button>

        {/* 05. TÚ (PERFIL DE PILOTO) */}
        <button
          onClick={() => setActiveNavTab('tu')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation ${
            isTu ? 'text-white' : 'text-ash hover:text-white'
          }`}
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
            isTu ? 'border-earth ring-2 ring-earth/30' : 'border-white/30 group-hover:border-white'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 ${isTu ? 'text-earth font-bold' : ''}`}>
            Tú
          </span>
        </button>

      </div>

      {/* iOS Home Indicator Spacer */}
      <div className="h-[env(safe-area-inset-bottom,2px)] w-full" />
    </aside>
  );
};
