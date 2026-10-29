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
        
        {/* Left spacer to keep center logo perfectly balanced */}
        <div className="flex items-center gap-2 w-12" />

        {/* Center: NAO Wordmark (Absolute Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <NaoBrandmark 
            size="md"
            onClick={() => setActiveNavTab('inicio')} 
          />
        </div>

        {/* Right: Auth / Pilot Quick Access */}
        <div className="flex items-center gap-2">
          {currentUser.id === 'guest' ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E6332A] hover:bg-[#c92820] text-white border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-xs font-display font-black uppercase cursor-pointer"
              title="Iniciar sesión o registrar cuenta de piloto"
            >
              <span>Entrar / Registro</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition text-xs font-display font-black uppercase text-[#1A1918] cursor-pointer"
              title="Gestionar cuenta de piloto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-5 h-5 rounded-full object-cover border border-[#1A1918]" 
              />
              <span className="hidden md:inline font-mono text-[11px] font-bold">
                {currentUser.handle}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
