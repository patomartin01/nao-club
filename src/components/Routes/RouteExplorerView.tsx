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
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 sm:px-6 pointer-events-auto">
        <div className="w-full max-w-lg bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[8px_8px_0px_#1A1918] text-[#1A1918] space-y-5 animate-scaleUp">
          
          {/* Top Brand Stamp & Coordinates */}
          <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3 text-[10px] font-mono font-black uppercase tracking-widest text-[#E6332A]">
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#E6332A] stroke-[2.5]" />
              <span>★ CARTOGRAFÍA // NAO CLUB ★</span>
            </div>
            <span className="text-[#1A1918]/50 hidden sm:inline font-mono">
              19°24&apos;N 99°17&apos;W
            </span>
          </div>

          {/* Headline Section */}
          <div className="text-center sm:text-left space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EEDB] border-2 border-[#1A1918] text-[10px] font-mono font-black uppercase tracking-wider mb-1 shadow-[2px_2px_0px_#1A1918]">
              <span className="w-2 h-2 rounded-full bg-[#E6332A] animate-ping" />
              <span>FASE 02 EN DESARROLLO</span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-[#1A1918] leading-none">
              Próximamente
            </h1>
            <p className="font-display font-black text-xs sm:text-sm text-[#E06423] uppercase tracking-wider">
              Explorador de Rutas & Navegación GPS
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#1A1918]/80 font-serif italic leading-relaxed">
            Estamos diseñando la experiencia cartográfica definitiva para motociclistas: mapas topográficos de curvas, capas de elevación 3D, rutas verificadas por tribus y exportación directa de tracks GPX para Garmin, OsmAnd y CarPlay.
          </p>

          {/* Features Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl shadow-[2px_2px_0px_#1A1918] flex flex-col justify-between">
              <Mountain className="w-5 h-5 text-[#E06423] stroke-[2.5] mb-2" />
              <div>
                <p className="font-display font-black text-[11px] uppercase tracking-wide text-[#1A1918]">
                  Topografía
                </p>
                <p className="text-[10px] text-[#1A1918]/70 font-serif italic mt-0.5">
                  Curvas de nivel y tipo de suelo
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl shadow-[2px_2px_0px_#1A1918] flex flex-col justify-between">
              <Users className="w-5 h-5 text-[#1D4477] stroke-[2.5] mb-2" />
              <div>
                <p className="font-display font-black text-[11px] uppercase tracking-wide text-[#1A1918]">
                  Curaduría
                </p>
                <p className="text-[10px] text-[#1A1918]/70 font-serif italic mt-0.5">
                  Rutas votadas por las tribus
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl shadow-[2px_2px_0px_#1A1918] flex flex-col justify-between">
              <FileCode2 className="w-5 h-5 text-[#E6332A] stroke-[2.5] mb-2" />
              <div>
                <p className="font-display font-black text-[11px] uppercase tracking-wide text-[#1A1918]">
                  Tracks GPX
                </p>
                <p className="text-[10px] text-[#1A1918]/70 font-serif italic mt-0.5">
                  Sincronización con GPS y tableros
                </p>
              </div>
            </div>
          </div>

          {/* Quick CTA to return to Tribus or Despacho */}
          <div className="pt-2 border-t-2 border-[#1A1918] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-[#1A1918]/60 font-bold text-center sm:text-left">
              Mientras tanto, explora rodadas y tribus:
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
