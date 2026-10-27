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
  const isTribus = activeNavTab === 'tribus' || activeNavTab === 'grupos' || activeNavTab === 'crew' || activeNavTab === 'rodada';
  const isTu = activeNavTab === 'tu' || activeNavTab === 'garaje';

  const handleRecordClick = () => {
    setActiveNavTab('registrar');
    if (onOpenRecordRoute) onOpenRecordRoute();
  };

  return (
    <aside 
      aria-label="Navegación de aplicación"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF6ED]/95 backdrop-blur-xl border-t-2 border-[#1A1918] shadow-[0_-4px_25px_rgba(26,25,24,0.08)] select-none pb-[env(safe-area-inset-bottom,6px)]"
    >
      {/* 5-column dock with Risograph / Matchbook styling */}
      <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* 01. INICIO (DESPACHO) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('inicio')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isInicio ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${isInicio ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
            {activities.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-[#1A1918] text-white rounded-full font-bold">
                {activities.length}
              </span>
            )}
          </div>
          <span className={`font-display uppercase tracking-widest text-[10px] mt-1 ${isInicio ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Despacho
          </span>
        </button>

        {/* 02. MAPAS (RUTAS) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('mapas')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isMapas ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <Compass className={`w-5 h-5 transition-transform ${isMapas ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
          <span className={`font-display uppercase tracking-widest text-[10px] mt-1 ${isMapas ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Rutas
          </span>
        </button>

        {/* 03. REGISTRAR (SEAL / STAMP BUTTON) */}
        <button
          type="button"
          onClick={handleRecordClick}
          className="flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation cursor-pointer -mt-4"
          title="Registrar rodada en vivo"
        >
          <div className={`w-12 h-12 rounded-2xl border-2 border-[#1A1918] flex items-center justify-center transition-all shadow-[3px_3px_0px_#1A1918] group-active:translate-x-[2px] group-active:translate-y-[2px] group-active:shadow-none ${
            isRegistrar 
              ? 'bg-[#E6332A] text-white' 
              : 'bg-[#F7B32B] hover:bg-[#E6332A] text-[#1A1918]'
          }`}>
            <Circle className="w-5 h-5 fill-current" />
          </div>
          <span className="font-display uppercase tracking-widest text-[9px] mt-1 text-[#1A1918] font-black">
            Grabar
          </span>
        </button>

        {/* 04. TRIBUS (CLUBS) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('tribus')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isTribus ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${isTribus ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
            <span className="absolute -top-1 -right-2 text-[8px] font-mono px-1 bg-[#F7B32B] text-[#1A1918] font-black border border-[#1A1918] rounded-full">
              {crews.length}
            </span>
          </div>
          <span className={`font-display uppercase tracking-widest text-[10px] mt-1 ${isTribus ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Tribus
          </span>
        </button>

        {/* 05. TÚ (PILOTO) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('tu')}
          className={`flex-1 min-h-[50px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isTu ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className={`w-7 h-7 rounded-xl overflow-hidden border-2 border-[#1A1918] transition-all shadow-[1px_1px_0px_#1A1918] ${
            isTu ? 'ring-2 ring-[#E6332A] scale-105' : 'group-hover:border-[#E6332A]'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <span className={`font-display uppercase tracking-widest text-[10px] mt-1 ${isTu ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Piloto
          </span>
        </button>

      </div>

      {/* iOS Home Indicator Spacer */}
      <div className="h-[env(safe-area-inset-bottom,2px)] w-full" />
    </aside>
  );
};
