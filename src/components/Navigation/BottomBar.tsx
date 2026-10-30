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
    crewMessages,
    routeProposals
  } = useApp();

  const isInicio = activeNavTab === 'inicio' || activeNavTab === 'home';
  const isMapas = activeNavTab === 'mapas' || activeNavTab === 'rutas';
  const isRegistrar = activeNavTab === 'registrar';
  const isTribus = activeNavTab === 'tribus' || activeNavTab === 'grupos' || activeNavTab === 'crew' || activeNavTab === 'rodada';
  const isTu = activeNavTab === 'tu' || activeNavTab === 'garaje';

  // Calculate real unread items for Tribus (new group chat messages or route plan comments)
  // Default is strictly 0 (no badge) unless there are new notifications since last visit
  const [tribusLastSeen, setTribusLastSeen] = React.useState<number>(() => {
    if (typeof window === 'undefined') return Date.now();
    try {
      const stored = localStorage.getItem('nao_tribus_last_seen');
      return stored ? parseInt(stored, 10) : Date.now();
    } catch {
      return Date.now();
    }
  });

  const unreadTribusCount = React.useMemo(() => {
    let count = 0;
    // Count real unread chat messages from other pilots
    if (crewMessages && crewMessages.length > 0) {
      count += crewMessages.filter(m => {
        if (m.userId === currentUser.id) return false;
        const msgTime = new Date(m.createdAt).getTime();
        return !isNaN(msgTime) && msgTime > tribusLastSeen;
      }).length;
    }
    // Count real unread comments on routes/plans from other pilots
    if (routeProposals && routeProposals.length > 0) {
      routeProposals.forEach(p => {
        // Also count newly published route proposals by others since tribusLastSeen
        if (p.proposedByUserId && p.proposedByUserId !== currentUser.id) {
          const propIdTime = p.id.startsWith('route-') ? parseInt(p.id.replace('route-', ''), 10) : 0;
          if (propIdTime && propIdTime > tribusLastSeen) {
            count++;
          }
        }

        if (p.comments && p.comments.length > 0) {
          p.comments.forEach(c => {
            if (c.userId !== currentUser.id) {
              const commTime = (c as any).timestamp || (c.createdAt?.includes('T') ? new Date(c.createdAt).getTime() : 0);
              if (commTime && commTime > tribusLastSeen) {
                count++;
              }
            }
          });
        }
      });
    }
    return count;
  }, [crewMessages, routeProposals, currentUser.id, tribusLastSeen]);

  const handleTribusClick = () => {
    setActiveNavTab('tribus');
    const now = Date.now();
    setTribusLastSeen(now);
    try {
      localStorage.setItem('nao_tribus_last_seen', now.toString());
    } catch {}
  };

  const handleRecordClick = () => {
    setActiveNavTab('registrar');
    if (onOpenRecordRoute) onOpenRecordRoute();
  };

  return (
    <aside 
      aria-label="Navegación de aplicación"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF6ED]/95 backdrop-blur-xl border-t-2 border-[#1A1918] shadow-[0_-4px_20px_rgba(26,25,24,0.06)] select-none"
    >
      {/* 5-column dock with clean, slim Risograph styling */}
      <div className="max-w-md mx-auto px-3 py-1 flex items-center justify-between">
        
        {/* 01. INICIO (DESPACHO) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('inicio')}
          className={`flex-1 min-h-[42px] flex flex-col items-center justify-center py-0.5 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isInicio ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className="relative">
            <Home className={`w-4 h-4 transition-transform ${isInicio ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
          </div>
          <span className={`font-display uppercase tracking-wider text-[9px] mt-0.5 ${isInicio ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Despacho
          </span>
        </button>

        {/* 02. MAPAS (RUTAS) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('mapas')}
          className={`flex-1 min-h-[42px] flex flex-col items-center justify-center py-0.5 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isMapas ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <Compass className={`w-4 h-4 transition-transform ${isMapas ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
          <span className={`font-display uppercase tracking-wider text-[9px] mt-0.5 ${isMapas ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Rutas
          </span>
        </button>

        {/* 03. REGISTRAR (SEAL / STAMP BUTTON) */}
        <button
          type="button"
          onClick={handleRecordClick}
          className="flex-1 min-h-[42px] flex flex-col items-center justify-center py-0.5 transition-all active:scale-95 group touch-manipulation cursor-pointer -mt-3"
          title="Registrar rodada en vivo"
        >
          <div className={`w-10 h-10 rounded-xl border-2 border-[#1A1918] flex items-center justify-center transition-all shadow-[2px_2px_0px_#1A1918] group-active:translate-x-[1px] group-active:translate-y-[1px] group-active:shadow-none ${
            isRegistrar 
              ? 'bg-[#E6332A] text-white' 
              : 'bg-[#F7B32B] hover:bg-[#E6332A] text-[#1A1918]'
          }`}>
            <Circle className="w-4 h-4 fill-current" />
          </div>
          <span className="font-display uppercase tracking-wider text-[8px] mt-0.5 text-[#1A1918] font-black">
            Grabar
          </span>
        </button>

        {/* 04. TRIBUS (CLUBS) */}
        <button
          type="button"
          onClick={handleTribusClick}
          className={`flex-1 min-h-[42px] flex flex-col items-center justify-center py-0.5 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isTribus ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className="relative">
            <Users className={`w-4 h-4 transition-transform ${isTribus ? 'scale-110 stroke-[2.5]' : 'group-hover:text-[#1A1918]'}`} />
            {unreadTribusCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[7px] font-mono px-1 bg-[#F7B32B] text-[#1A1918] font-black border border-[#1A1918] rounded-full animate-pulse">
                {unreadTribusCount}
              </span>
            )}
          </div>
          <span className={`font-display uppercase tracking-wider text-[9px] mt-0.5 ${isTribus ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Tribus
          </span>
        </button>

        {/* 05. TÚ (PILOTO) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('tu')}
          className={`flex-1 min-h-[42px] flex flex-col items-center justify-center py-0.5 transition-all active:scale-95 group touch-manipulation cursor-pointer ${
            isTu ? 'text-[#E6332A]' : 'text-[#1A1918]/60 hover:text-[#1A1918]'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg overflow-hidden border-2 border-[#1A1918] transition-all shadow-[1px_1px_0px_#1A1918] ${
            isTu ? 'ring-2 ring-[#E6332A] scale-105' : 'group-hover:border-[#E6332A]'
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <span className={`font-display uppercase tracking-wider text-[9px] mt-0.5 ${isTu ? 'text-[#E6332A] font-black' : 'font-bold'}`}>
            Piloto
          </span>
        </button>

      </div>

      {/* iOS Home Indicator Spacer */}
      <div className="h-[env(safe-area-inset-bottom,2px)] w-full" />
    </aside>
  );
};
