'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FounderWelcomeModal: React.FC = () => {
  const { founderUserNumber, dismissFounderWelcome } = useApp();

  if (founderUserNumber === null) {
    return null;
  }

  const handleClose = () => {
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch {}
    dismissFounderWelcome();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1A1918]/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#FAF6ED] border-3 border-[#1A1918] rounded-[28px] sm:rounded-[32px] shadow-[8px_8px_0px_#1A1918] sm:shadow-[10px_10px_0px_#1A1918] p-6 sm:p-8 space-y-5 text-[#1A1918] relative animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Risograph noise & background badge */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#E6332A]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest text-[#E6332A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MEMBRESÍA FUNDADORA • TOP 50</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] flex items-center justify-center transition active:scale-95 shadow-[2px_2px_0px_#1A1918] cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Number Badge Hero */}
        <div className="flex flex-col items-center text-center pt-2 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F7B32B] border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918]">
            <Trophy className="w-4 h-4 text-[#1A1918]" />
            <span className="font-mono text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A1918]">
              PILOTO FUNDADOR #{founderUserNumber}
            </span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-wide leading-tight pt-1">
            ¡Bienvenid@ a NAO!
          </h2>

          <p className="font-mono text-xs sm:text-sm font-black text-[#E6332A] uppercase tracking-wider">
            Eres el número {founderUserNumber} en registrarte
          </p>
        </div>

        {/* Message Card */}
        <div className="p-4 sm:p-5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-3">
          <p className="text-xs sm:text-sm text-[#1A1918] font-sans font-semibold leading-relaxed">
            Gracias por creer en este proyecto. Creamos juntos la plataforma de bikers más grande del mundo.
          </p>

          <p className="text-xs sm:text-sm text-[#1A1918] font-serif italic font-medium leading-relaxed border-l-3 border-[#E6332A] pl-3 py-0.5">
            &ldquo;Solos llegamos más rápido, pero juntos llegamos más lejos.&rdquo;
          </p>

          <div className="pt-2 border-t border-[#1A1918]/20 flex items-center justify-between text-[#1A1918]/70">
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase text-[#1A1918]/60">
              Patricio Martin Vidal <span className="text-[#E6332A] font-black">CEO NAO</span>
            </span>
            <Heart className="w-3.5 h-3.5 text-[#E6332A] fill-[#E6332A]" />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3.5 px-5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-2xl font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-[4px_4px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>VAMOS A RODAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
