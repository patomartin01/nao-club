'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart2, 
  FileText, 
  Grid, 
  Menu, 
  Share2, 
  Edit3, 
  Search, 
  Trophy, 
  ChevronRight, 
  Wrench, 
  MapPin, 
  Flame, 
  TrendingUp, 
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
  Navigation,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TuProfileViewProps {
  onOpenEditProfile?: () => void;
  onOpenGarage?: () => void;
}

type ProfileSubTab = 'progreso' | 'actividades' | 'galeria' | 'mas';

// Sample 12-week telemetry data for the chart
const WEEKLY_DATA = [
  { week: 'Sem 1', km: 24, elev: 450, rides: 1 },
  { week: 'Sem 2', km: 48, elev: 890, rides: 2 },
  { week: 'Sem 3', km: 0, elev: 0, rides: 0 },
  { week: 'Sem 4', km: 82, elev: 1620, rides: 2 },
  { week: 'Sem 5', km: 35, elev: 600, rides: 1 },
  { week: 'Sem 6', km: 110, elev: 2150, rides: 3 },
  { week: 'Sem 7', km: 14, elev: 280, rides: 1 },
  { week: 'Sem 8', km: 65, elev: 1200, rides: 2 },
  { week: 'Sem 9', km: 92, elev: 1850, rides: 2 },
  { week: 'Sem 10', km: 40, elev: 780, rides: 1 },
  { week: 'Sem 11', km: 74, elev: 1420, rides: 2 },
  { week: 'Sem 12 (Esta)', km: 42.8, elev: 890, rides: 1 }
];

const GALLERY_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600', caption: 'Paso de montaña en la sierra' },
  { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600', caption: 'KTM lista para brecha' },
  { url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=600', caption: 'Atardecer en Laguna de Zempoala' },
  { url: 'https://images.unsplash.com/photo-1502744688674-c619d38864a8?auto=format&fit=crop&q=80&w=600', caption: 'Basecamp bajo las estrellas' },
  { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=600', caption: 'Curvas de asfalto en cañón' },
  { url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&q=80&w=600', caption: 'Parada de hidratación' },
  { url: 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=600', caption: 'Trocha técnica con lodo' },
  { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600', caption: 'Escuadrón en cumbre' },
  { url: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&q=80&w=600', caption: 'Mecánica de ruta' }
];

export const TuProfileView: React.FC<TuProfileViewProps> = ({
  onOpenEditProfile,
  onOpenGarage
}) => {
  const { 
    currentUser, 
    activities, 
    userBikes, 
    completedRouteIds, 
    routeProposals, 
    setActiveNavTab,
    setAuthModalOpen
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('progreso');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('Todos');

  // Filter completed activities by user and search
  const userActivities = activities.filter(a => a.pilotId === currentUser.id || a.pilotName === currentUser.name);
  const displayActivities = userActivities.length > 0 ? userActivities : activities;

  const filteredHistory = displayActivities.filter(a => 
    a.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.location.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.motoModel.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    confetti({ particleCount: 20, spread: 50 });
  };

  const maxKmWeek = Math.max(...WEEKLY_DATA.map(d => d.km));

  return (
    <div className="space-y-8 pb-32 max-w-[1440px] w-full mx-auto font-sans text-[#141312]">
      
      {/* 01. PROFILE HEADER (Authentic Pilot Matchbook Dossier) */}
      <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] p-6 sm:p-10 space-y-6 shadow-[6px_6px_0px_#1A1918] relative overflow-hidden">
        {/* Subtle background typographic watermark */}
        <div className="absolute right-[-10px] top-[-15px] pointer-events-none select-none opacity-[0.04] text-[#1A1918] font-display font-black text-9xl tracking-tighter">
          PILOT
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[4px_4px_0px_#1A1918] bg-[#F4EEDB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#E6332A] text-white text-[8px] font-mono uppercase font-black rounded border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
              VERIFICADO
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black">
                ★ CREDENCIAL DE PILOTO TITULAR ★
              </span>
              <span className="text-[10px] font-mono text-[#1A1918] uppercase tracking-widest bg-[#FAF6ED] px-2.5 py-0.5 border-2 border-[#1A1918] rounded-md font-black shadow-[1px_1px_0px_#1A1918]">
                MATRÍCULA #0419-CDMX
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black text-[#1A1918] uppercase tracking-wide">
              {currentUser.name}
            </h1>
            <p className="text-xs font-serif italic text-[#1A1918]/70 font-medium">
              {currentUser.handle} • {currentUser.location}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <span className="font-display font-black text-[#1A1918]">{currentUser.stats?.completedCount || 33}</span>
              <span className="text-[#1A1918]/70 font-medium">salidas oficiales</span>
              <span className="text-[#1A1918]/30">•</span>
              <span className="font-display font-black text-[#1A1918]">15</span>
              <span className="text-[#1A1918]/70 font-medium">compañeros de ruta</span>
              <span className="text-[#1A1918]/30">•</span>
              <span className="font-display font-black text-[#1A1918]">11</span>
              <span className="text-[#1A1918]/70 font-medium">siguiendo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Editar Perfil / Compartir */}
        <div className="flex items-center gap-3 pt-2 relative z-10">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 py-3 px-4 bg-[#1A1918] hover:bg-black text-[#FAF6ED] text-xs font-display font-black uppercase tracking-widest flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#F7B32B]" />
            <span>Editar perfil</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="flex-1 py-3 px-4 bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] text-xs font-display font-black uppercase tracking-widest flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1A1918]" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="py-3 px-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] text-xs font-display font-black uppercase tracking-widest flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Gestionar sesión o cambiar piloto"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#E6332A]" />
            <span className="hidden sm:inline">Cuenta</span>
          </button>
        </div>
      </div>

      {/* 02. 4 SUB-TABS (PROGRESO, ACTIVIDADES, GALERÍA, MÁS) */}
      <div className="p-1.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl flex gap-1.5 shadow-[3px_3px_0px_#1A1918]">
        <button
          onClick={() => setActiveSubTab('progreso')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs ${
            activeSubTab === 'progreso'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Progreso</span>
        </button>

        <button
          onClick={() => setActiveSubTab('actividades')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs ${
            activeSubTab === 'actividades'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <FileText className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Actividades</span>
        </button>

        <button
          onClick={() => setActiveSubTab('galeria')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs ${
            activeSubTab === 'galeria'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <Grid className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Galería</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mas')}
          className={`flex-1 py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs ${
            activeSubTab === 'mas'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <Menu className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Más</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 03. SUB-TAB: PROGRESO (TELEMETRY CHARTS)                  */}
      {/* ========================================================= */}
      {activeSubTab === 'progreso' && (
        <div className="space-y-6">
          {/* Discipline selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['Todos los deportes', 'Carretera', 'Doble Propósito', 'Enduro', 'Pista'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-display whitespace-nowrap rounded-xl border-2 transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  selectedDiscipline === d
                    ? 'bg-[#1A1918] text-[#FAF6ED] border-[#1A1918] font-black'
                    : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F4EEDB] font-bold'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* This Week Summary */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-4 shadow-[5px_5px_0px_#1A1918]">
            <span className="text-[10px] text-[#E6332A] uppercase tracking-widest font-display font-black">
              ★ BITÁCORA DE ESTA SEMANA ★
            </span>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Distancia</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">42.8 <span className="text-xs text-[#1A1918]/70 font-sans font-bold">km</span></span>
              </div>
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Desnivel</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">890 <span className="text-xs text-[#1A1918]/70 font-sans font-bold">m</span></span>
              </div>
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Tiempo</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">1h 45m</span>
              </div>
            </div>

            <p className="text-xs text-[#1A1918]/70 border-t-2 border-[#1A1918] pt-3 font-serif italic font-medium">
              +1 rodada más que la semana pasada a estas alturas. Máquina en óptimo desempeño.
            </p>
          </div>

          {/* 12-Week Interactive Bar Chart */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-5 shadow-[5px_5px_0px_#1A1918]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">Últimas 12 Semanas</h4>
                <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">Kilómetros acumulados por semana</p>
              </div>
              <span className="text-xs text-[#1A1918] font-display font-black bg-[#F7B32B] px-2.5 py-1 rounded-md border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">Prom: 48.2 km/sem</span>
            </div>

            <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b-2 border-[#1A1918]">
              {WEEKLY_DATA.map((item, idx) => {
                const heightPct = item.km > 0 ? Math.max(12, Math.round((item.km / maxKmWeek) * 100)) : 4;
                const isCurrent = idx === WEEKLY_DATA.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-9 bg-[#1A1918] text-[#FAF6ED] text-[9px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 font-mono shadow-[2px_2px_0px_#1A1918] border border-[#FAF6ED]/20">
                      {item.km} km ({item.elev}m)
                    </div>

                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 border border-[#1A1918] ${
                        isCurrent 
                          ? 'bg-[#E6332A] shadow-xs' 
                          : item.km > 0 ? 'bg-[#1A1918] group-hover:bg-[#E06423]' : 'bg-[#F4EEDB]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-[#1A1918]/70 uppercase font-display font-black">
              <span>Hace 12 semanas</span>
              <span>Esta semana</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 04. SUB-TAB: ACTIVIDADES (SEARCHABLE HISTORICAL LOG)      */}
      {/* ========================================================= */}
      {activeSubTab === 'actividades' && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#1A1918]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Buscar por destino, moto o título..."
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] pl-10 pr-4 py-3 text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[3px_3px_0px_#1A1918] rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map(act => (
              <div 
                key={act.id}
                className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-5 space-y-4 shadow-[4px_4px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] transition duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-[#1A1918]/70 font-serif italic font-medium">{act.dateText}</span>
                    <h4 className="text-base font-display font-black text-[#1A1918] uppercase tracking-wide mt-0.5">
                      {act.title}
                    </h4>
                    <span className="text-xs text-[#E6332A] font-display font-black">{act.location}</span>
                  </div>
                  <span className="text-[10px] text-[#1A1918] font-display font-black bg-[#F4EEDB] px-2.5 py-1 border-2 border-[#1A1918] uppercase tracking-wider rounded-md shadow-[1px_1px_0px_#1A1918]">
                    {act.motoModel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 text-xs shadow-[2px_2px_0px_#1A1918]">
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Distancia</span>
                    <span className="text-[#1A1918] font-display font-black">{act.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Desnivel</span>
                    <span className="text-[#1A1918] font-display font-black">{act.elevationGainM} m</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Tiempo</span>
                    <span className="text-[#1A1918] font-display font-black">{act.durationText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 05. SUB-TAB: GALERÍA (PHOTO GRID FROM TRAILS)             */}
      {/* ========================================================= */}
      {activeSubTab === 'galeria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
            <h3 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">
              Fotos de Expediciones ({GALLERY_PHOTOS.length})
            </h3>
            <span className="text-xs text-[#1A1918]/70 font-serif italic font-medium">Tomadas en ruta con GPS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div 
                key={idx}
                className="aspect-square bg-[#F4EEDB] overflow-hidden relative group cursor-pointer border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] hover:shadow-[5px_5px_0px_#1A1918] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-[#1A1918]/80 opacity-0 group-hover:opacity-100 transition p-2.5 flex items-end">
                  <p className="text-[10px] text-white leading-tight font-serif italic line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 06. SUB-TAB: MÁS (CONFIG, GARAJE, ESTADÍSTICAS & TROFEOS) */}
      {/* ========================================================= */}
      {activeSubTab === 'mas' && (
        <div className="space-y-6">
          
          {/* Menu list with chevrons */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] divide-y-2 divide-[#1A1918] shadow-[5px_5px_0px_#1A1918] overflow-hidden">
            
            {/* Estadísticas anuales */}
            <div className="p-4 flex items-center justify-between hover:bg-[#F4EEDB] transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <FileText className="w-4 h-4 text-[#E6332A]" />
                <div>
                  <h4 className="text-xs font-display font-black text-[#1A1918] uppercase">Estadísticas Anuales</h4>
                  <p className="text-[10px] text-[#1A1918]/70 font-serif italic font-medium">Este año: 2,450 km acumulados</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1A1918]" />
            </div>

            {/* Segmentos cronometrados */}
            <div className="p-4 flex items-center justify-between hover:bg-[#F4EEDB] transition cursor-pointer">
              <div className="flex items-center gap-3.5">
                <MapPin className="w-4 h-4 text-[#E06423]" />
                <div>
                  <h4 className="text-xs font-display font-black text-[#1A1918] uppercase">Segmentos</h4>
                  <p className="text-[10px] text-[#1A1918]/70 font-serif italic font-medium">6 tramos favoritos registrados</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#1A1918]" />
            </div>

            {/* Equipamiento / Hangar de Motos */}
            <div 
              onClick={() => setActiveNavTab('garaje')}
              className="p-4 flex items-center justify-between hover:bg-[#F4EEDB] transition cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <Wrench className="w-4 h-4 text-[#1A1918]" />
                <div>
                  <h4 className="text-xs font-display font-black text-[#1A1918] uppercase">Equipamiento / Garaje</h4>
                  <p className="text-[10px] text-[#1A1918]/70 font-serif italic font-medium">{userBikes.length} máquinas en tu taller</p>
                </div>
              </div>
              <span className="text-[10px] text-[#E6332A] uppercase font-display font-black flex items-center gap-1">
                Administrar <ChevronRight className="w-4 h-4" />
              </span>
            </div>

          </div>

          {/* Vitrina de trofeos */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-4 shadow-[5px_5px_0px_#1A1918]">
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F7B32B]" />
                <h4 className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wider">
                  Vitrina de trofeos (6)
                </h4>
              </div>
              <span className="text-[10px] font-display font-black text-[#E6332A] uppercase cursor-pointer hover:underline">Ver todos &gt;</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
              {[
                { label: '30', desc: '30 rodadas' },
                { label: '20', desc: '20 rodadas' },
                { label: '10', desc: '10 rodadas' },
                { label: '5', desc: '5 rodadas' },
                { label: '1K', desc: '1,000 km' },
                { label: 'SR', desc: 'Sierra King' }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 bg-[#F4EEDB] border-2 border-[#1A1918] hover:bg-[#FAF6ED] rounded-xl flex items-center justify-center text-sm font-display font-black text-[#1A1918] hover:scale-105 transition cursor-pointer shadow-[2px_2px_0px_#1A1918]">
                    {badge.label}
                  </div>
                  <span className="text-[9px] text-[#1A1918]/80 text-center font-display uppercase tracking-tight font-black">
                    {badge.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
