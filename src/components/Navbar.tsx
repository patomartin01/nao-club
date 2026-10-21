'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Flame, 
  Compass, 
  Users, 
  Plus, 
  Key, 
  MapPin, 
  Menu, 
  X,
  Calendar,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateRodada: () => void;
  onOpenProposeRoute: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateCrew: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateRodada,
  onOpenProposeRoute,
  onOpenJoinCrew,
  onOpenCreateCrew
}) => {
  const { 
    currentUser, 
    userBikes, 
    currentCrew, 
    activeNavTab, 
    setActiveNavTab 
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveNavTab('rodada')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-glow font-black text-lg">
              <Flame className="w-6 h-6 fill-slate-950" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl tracking-tight text-white">
                  MOTO<span className="text-amber-400">MAMI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  ADV CLUB
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Plataforma de Rodadas & Terracería
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveNavTab('rodada')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeNavTab === 'rodada'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Rodadas & Planes
            </button>

            <button
              onClick={() => setActiveNavTab('rutas')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeNavTab === 'rutas'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explorar Rutas & Votos
            </button>

            <button
              onClick={() => setActiveNavTab('crew')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeNavTab === 'crew'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              Crew / Squad
            </button>

            <button
              onClick={() => setActiveNavTab('brand')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeNavTab === 'brand'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Brand Book: NAO vs NÓMADA
            </button>

            <button
              onClick={() => setActiveNavTab('garaje')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeNavTab === 'garaje'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="font-mono text-sm">🏍️</span>
              Garaje ({userBikes.length})
            </button>
          </nav>

          {/* Right Action Buttons & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Action: Proponer Ruta */}
            <button
              onClick={onOpenProposeRoute}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-glow transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              Proponer Ruta
            </button>

            {/* Crew Join code badge */}
            {currentCrew && (
              <button
                onClick={onOpenJoinCrew}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-amber-500/60 transition group"
                title="Compartir o unirse con código"
              >
                <Key className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
                <span>{currentCrew.inviteCode}</span>
              </button>
            )}

            {/* User Avatar badge */}
            <div 
              onClick={() => setActiveNavTab('garaje')}
              className="flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/50 group-hover:ring-amber-400 transition"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 font-mono leading-none mt-1">
                  {currentUser.location.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenProposeRoute}
              className="p-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => { setActiveNavTab('rodada'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs font-bold rounded-lg flex items-center gap-2 ${
                activeNavTab === 'rodada' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" /> Rodadas
            </button>
            <button
              onClick={() => { setActiveNavTab('rutas'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs font-bold rounded-lg flex items-center gap-2 ${
                activeNavTab === 'rutas' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-200'
              }`}
            >
              <Compass className="w-4 h-4" /> Rutas & Votos
            </button>
            <button
              onClick={() => { setActiveNavTab('crew'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs font-bold rounded-lg flex items-center gap-2 ${
                activeNavTab === 'crew' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" /> Crew ({currentCrew?.name.split(' ')[0]})
            </button>
            <button
              onClick={() => { setActiveNavTab('garaje'); setMobileMenuOpen(false); }}
              className={`p-2.5 text-xs font-bold rounded-lg flex items-center gap-2 ${
                activeNavTab === 'garaje' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-200'
              }`}
            >
              <span>🏍️</span> Mi Garaje ({userBikes.length})
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => { onOpenCreateRodada(); setMobileMenuOpen(false); }}
              className="flex-1 py-2 text-xs font-bold bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Nueva Rodada
            </button>
            <button
              onClick={() => { onOpenJoinCrew(); setMobileMenuOpen(false); }}
              className="py-2 px-3 text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-amber-400 rounded-lg flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" /> Clave Crew
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
