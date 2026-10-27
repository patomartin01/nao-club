'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { NaoBrandmark } from './Brand/NaoBrandmark';

interface NavbarProps {
  onOpenCreateRodada?: () => void;
  onOpenProposeRoute?: () => void;
  onOpenJoinCrew?: () => void;
  onOpenCreateCrew?: () => void;
  onOpenRecordRoute?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { setActiveNavTab, currentUser, setAuthModalOpen, isSupabaseOnline } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF6ED]/95 backdrop-blur-md border-b-2 border-[#1A1918] select-none pt-[env(safe-area-inset-top,0px)] shadow-[0_2px_10px_rgba(26,25,24,0.06)]">
      <div className="w-full max-w-[1520px] mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 min-h-[60px] relative">
        
        {/* Left: Tactical Pilot Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNavTab('tu')}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F4EEDB] hover:bg-[#EDE6D3] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-left cursor-pointer"
            title="Ir a mi perfil de piloto"
          >
            <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-[#2E7D32] animate-pulse' : 'bg-[#F7B32B]'}`} />
            <span className="text-[10px] font-mono uppercase font-black text-[#1A1918] tracking-wider">
              {currentUser.handle}
            </span>
          </button>
        </div>

        {/* Center: NAO Wordmark (Absolute Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <NaoBrandmark 
            size="md"
            onClick={() => setActiveNavTab('inicio')} 
          />
        </div>

        {/* Right: Auth / Pilot Quick Access */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-xs font-display font-black uppercase text-[#1A1918] cursor-pointer"
            title="Iniciar sesión o registrar cuenta de piloto"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-5 h-5 rounded-full object-cover border border-[#1A1918]" 
            />
            <span className="hidden md:inline font-mono text-[11px] font-bold">
              CUENTA
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
