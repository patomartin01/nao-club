'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { RouteMap } from '../Map/RouteMap';
import { 
  Compass, 
  Mountain, 
  Navigation, 
  MapPin, 
  Layers, 
  ArrowRight,
  Radio,
  FileCode2,
  Users
} from 'lucide-react';

interface RouteExplorerViewProps {
  onOpenProposeRoute?: () => void;
  onOpenRecordRoute?: () => void;
}

export const RouteExplorerView: React.FC<RouteExplorerViewProps> = () => {
  const { routeProposals, selectedRoute, setActiveNavTab } = useApp();

  // Pick a route to render as visual backdrop
  const backdropRoute = selectedRoute || routeProposals[0] || null;

  return (
    <div className="relative w-full h-[calc(100dvh-60px)] min-h-[560px] overflow-hidden bg-[#FAF6ED] select-none font-sans">
      
      {/* 1. MAPA DE FONDO (NO FUNCIONAL / DECORATIVO) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-85">
        <RouteMap
          route={backdropRoute}
          allRoutes={routeProposals}
          externalLayer="satellite"
          showInternalControls={false}
          showActivityHeatmap={true}
          showCommunityPilots={true}
        />
        {/* Filtro papel cálido risograph y viñeta atmosférica */}
        <div className="absolute inset-0 bg-[#FAF6ED]/50 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6ED] via-[#FAF6ED]/40 to-[#FAF6ED]/70" />
      </div>

      {/* 2. CONTENEDOR HERO: INFORMACIÓN DE "PRÓXIMAMENTE" CON DISEÑO RISOGRAPH / BAUHAUS */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pointer-events-auto">
        <div className="w-full max-w-md bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 shadow-[5px_5px_0px_#1A1918] text-[#1A1918] space-y-3.5 sm:space-y-4 animate-scaleUp">
          
          {/* Top Brand Stamp */}
          <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-2 text-[10px] font-mono font-black uppercase tracking-widest text-[#E6332A]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E6332A] stroke-[2.5]" />
              <span>★ CARTOGRAFÍA // NAO CLUB ★</span>
            </div>
            <span className="text-[#1A1918]/60 font-mono text-[9px] bg-[#F4EEDB] px-1.5 py-0.5 rounded border border-[#1A1918]/40">FASE 2</span>
          </div>

          {/* Headline Section */}
          <div className="text-center sm:text-left space-y-1">
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#1A1918] leading-none">
              Próximamente
            </h1>
            <p className="font-display font-black text-xs text-[#E06423] uppercase tracking-wider">
              Explorador de Rutas &amp; Navegación GPS
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-[#1A1918]/80 font-serif italic leading-relaxed">
            Mapas topográficos de curvas, capas de elevación 3D, rutas curadas por la comunidad y exportación a GPX para tableros y navegadores.
          </p>

          {/* Features Horizontal Ribbon (clean, not 3 huge stacked boxes) */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 bg-[#F4EEDB] border border-[#1A1918] rounded-xl">
              <Mountain className="w-4 h-4 text-[#E06423] stroke-[2.5] mx-auto mb-1" />
              <p className="font-display font-black text-[10px] uppercase text-[#1A1918]">Topografía</p>
            </div>
            <div className="p-2.5 bg-[#F4EEDB] border border-[#1A1918] rounded-xl">
              <Users className="w-4 h-4 text-[#1D4477] stroke-[2.5] mx-auto mb-1" />
              <p className="font-display font-black text-[10px] uppercase text-[#1A1918]">Curaduría</p>
            </div>
            <div className="p-2.5 bg-[#F4EEDB] border border-[#1A1918] rounded-xl">
              <FileCode2 className="w-4 h-4 text-[#E6332A] stroke-[2.5] mx-auto mb-1" />
              <p className="font-display font-black text-[10px] uppercase text-[#1A1918]">GPX Sync</p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="pt-2 border-t-2 border-[#1A1918] flex items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-[#1A1918]/60 font-bold">
              Explora rodadas activas:
            </span>
            <button
              onClick={() => setActiveNavTab('tribus')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2"
            >
              <span>Ver Tribus</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
