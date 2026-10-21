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
  Navigation
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
    setActiveNavTab 
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
    <div className="space-y-6 pb-28 max-w-2xl mx-auto font-mono">
      
      {/* 01. PROFILE HEADER (STRAVA TÚ EXACT REPLICA) */}
      <div className="bg-[#0D0B0A] border border-white/10 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-earth ring-4 ring-earth/20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-xs text-ash">
              {currentUser.handle} • {currentUser.location}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-white font-bold">{currentUser.stats?.completedCount || 33}</span>
              <span className="text-ash">actividades</span>
              <span className="text-ash">•</span>
              <span className="text-white font-bold">15</span>
              <span className="text-ash">seguidores</span>
              <span className="text-ash">•</span>
              <span className="text-white font-bold">11</span>
              <span className="text-ash">siguiendo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Editar Perfil / Compartir */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-earth" />
            <span>Editar perfil</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="flex-1 py-2 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-earth" />
            <span>Compartir perfil</span>
          </button>
        </div>
      </div>

      {/* 02. 4 SUB-TABS (PROGRESO, ACTIVIDADES, GALERÍA, MÁS) */}
      <div className="flex border-b border-white/10 bg-[#0D0B0A] text-xs">
        <button
          onClick={() => setActiveSubTab('progreso')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 uppercase tracking-wider font-bold transition ${
            activeSubTab === 'progreso'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="text-[10px]">Progreso</span>
        </button>

        <button
          onClick={() => setActiveSubTab('actividades')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 uppercase tracking-wider font-bold transition ${
            activeSubTab === 'actividades'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px]">Actividades</span>
        </button>

        <button
          onClick={() => setActiveSubTab('galeria')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 uppercase tracking-wider font-bold transition ${
            activeSubTab === 'galeria'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="text-[10px]">Galería</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mas')}
          className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 uppercase tracking-wider font-bold transition ${
            activeSubTab === 'mas'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Más</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 03. SUB-TAB: PROGRESO (TELEMETRY CHARTS STRAVA)          */}
      {/* ========================================================= */}
      {activeSubTab === 'progreso' && (
        <div className="space-y-6">
          {/* Discipline selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['Todos los deportes', 'Carretera', 'Doble Propósito', 'Enduro', 'Pista'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider whitespace-nowrap border ${
                  selectedDiscipline === d
                    ? 'bg-earth text-white border-earth font-bold'
                    : 'bg-white/[0.02] text-ash border-white/10 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* This Week Summary */}
          <div className="bg-[#0F0D0C] border border-white/10 p-5 space-y-3">
            <span className="text-[10px] text-earth uppercase tracking-widest font-bold">Esta Semana</span>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Distancia</span>
                <span className="text-xl font-bold text-white font-mono">42.8 <span className="text-xs text-ash font-normal">km</span></span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Desnivel</span>
                <span className="text-xl font-bold text-white font-mono">890 <span className="text-xs text-ash font-normal">m</span></span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-ash block">Tiempo</span>
                <span className="text-xl font-bold text-white font-mono">1h 45m</span>
              </div>
            </div>

            <p className="text-[10px] text-ash border-t border-white/[0.06] pt-2">
              🔥 1 rodada más que la semana pasada a estas alturas.
            </p>
          </div>

          {/* 12-Week Interactive Bar Chart */}
          <div className="bg-[#0F0D0C] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Últimas 12 Semanas</h4>
                <p className="text-[10px] text-ash">Kilómetros acumulados por semana</p>
              </div>
              <span className="text-[10px] text-earth font-bold font-mono">Prom: 48.2 km/sem</span>
            </div>

            <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b border-white/10">
              {WEEKLY_DATA.map((item, idx) => {
                const heightPct = item.km > 0 ? Math.max(12, Math.round((item.km / maxKmWeek) * 100)) : 4;
                const isCurrent = idx === WEEKLY_DATA.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-9 bg-black border border-white/20 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 font-mono">
                      {item.km} km ({item.elev}m)
                    </div>

                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-earth shadow-[0_0_12px_rgba(224,109,56,0.5)]' 
                          : item.km > 0 ? 'bg-white/30 group-hover:bg-white/60' : 'bg-white/5'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[9px] text-ash uppercase">
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
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Buscar por destino, moto o título..."
              className="w-full bg-[#0F0D0C] border border-white/10 pl-9 pr-4 py-2.5 text-xs text-white placeholder-ash focus:outline-none focus:border-earth"
            />
          </div>

          <div className="space-y-3">
            {filteredHistory.map(act => (
              <div 
                key={act.id}
                className="bg-[#0F0D0C] border border-white/10 p-4 space-y-3 hover:border-earth/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-ash">{act.dateText}</span>
                    <h4 className="text-sm font-bold text-white uppercase mt-0.5">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-earth">{act.location}</span>
                  </div>
                  <span className="text-[10px] text-ash bg-white/[0.04] px-2 py-1 border border-white/10 uppercase">
                    🏍️ {act.motoModel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-2.5 text-xs">
                  <div>
                    <span className="text-[8px] uppercase text-ash block">Distancia</span>
                    <span className="text-white font-bold">{act.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-ash block">Desnivel</span>
                    <span className="text-white font-bold">{act.elevationGainM} m</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-ash block">Tiempo</span>
                    <span className="text-white font-bold">{act.durationText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 05. SUB-TAB: GALERÍA (3X3 PHOTO GRID FROM TRAILS)        */}
      {/* ========================================================= */}
      {activeSubTab === 'galeria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Fotos de Expediciones ({GALLERY_PHOTOS.length})
            </h3>
            <span className="text-[10px] text-ash">Tomadas en ruta con GPS</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div 
                key={idx}
                className="aspect-square bg-white/[0.04] overflow-hidden relative group cursor-pointer border border-white/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-2 flex items-end">
                  <p className="text-[9px] text-white leading-tight font-sans line-clamp-2">
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
          <div className="bg-[#0F0D0C] border border-white/10 divide-y divide-white/[0.06]">
            
            {/* Estadísticas anuales */}
            <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-earth" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Estadísticas</h4>
                  <p className="text-[10px] text-ash">Este año: 2,450 km acumulados</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ash" />
            </div>

            {/* Segmentos cronometrados */}
            <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-earth" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Segmentos</h4>
                  <p className="text-[10px] text-ash">6 tramos favoritos registrados</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-ash" />
            </div>

            {/* Equipamiento / Hangar de Motos */}
            <div 
              onClick={() => setActiveNavTab('garaje')}
              className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-earth" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Equipamiento / Garaje</h4>
                  <p className="text-[10px] text-ash">{userBikes.length} máquinas en tu hangar</p>
                </div>
              </div>
              <span className="text-[10px] text-earth uppercase font-bold flex items-center gap-1">
                Administrar <ChevronRight className="w-4 h-4" />
              </span>
            </div>

          </div>

          {/* Retos promo */}
          <div className="bg-gradient-to-r from-earth/20 to-black/40 border border-earth/30 p-5 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase">Retos de la Comunidad</h4>
            <p className="text-xs text-ash">Únete a los retos mensuales para ganar hábitos y trofeos en tu vitrina.</p>
            <button
              onClick={() => setActiveNavTab('grupos')}
              className="px-4 py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95"
            >
              Encuentra nuevos retos
            </button>
          </div>

          {/* Vitrina de trofeos (Strava trophy cabinet) */}
          <div className="bg-[#0F0D0C] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Vitrina de trofeos (6)
                </h4>
              </div>
              <span className="text-[10px] text-earth cursor-pointer hover:underline">Ver todos &gt;</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {[
                { label: '30', desc: '30 rodadas' },
                { label: '20', desc: '20 rodadas' },
                { label: '10', desc: '10 rodadas' },
                { label: '5', desc: '5 rodadas' },
                { label: '1K', desc: '1,000 km' },
                { label: '⛰️', desc: 'Sierra King' }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 bg-white/[0.04] border border-earth/40 hover:border-earth flex items-center justify-center text-sm font-bold text-earth hover:scale-105 transition cursor-pointer shadow-lg">
                    {badge.label}
                  </div>
                  <span className="text-[8px] text-ash text-center uppercase tracking-tighter">
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
