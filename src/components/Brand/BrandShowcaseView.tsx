'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  MapPin, 
  Navigation, 
  Shield, 
  Thermometer, 
  Droplets, 
  Key, 
  Wifi, 
  Coffee,
  CheckCircle2,
  Lock,
  Compass
} from 'lucide-react';

export const BrandShowcaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sanctuary' | 'hud'>('sanctuary');
  const [digitalKeyUnlocked, setDigitalKeyUnlocked] = useState(false);

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 01. SECTION HEADER */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block mb-2">
              [ 03 // REFUGIO ARQUITECTÓNICO & MANIFIESTO ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight leading-[0.95]">
              Navana Cabins <span className="text-ash font-light">×</span> NAO
            </h1>
            <p className="font-mono text-xs text-ash uppercase tracking-wider mt-4">
              AMANALCO / VALLE DE BRAVO_3 CABAÑAS EN EL BOSQUE_SAUNA NÓRDICO A 78°C_POZO DE FUEGO Y HANGAR TECHADO_
            </p>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#0E0C0A] font-mono text-xs">
            <div className="space-y-2">
              <span className="text-[10px] text-ash uppercase tracking-widest block">MODO DE VISUALIZACIÓN</span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('sanctuary')}
                  className={`py-2 px-3 uppercase text-[10px] font-bold tracking-wider border transition ${
                    activeTab === 'sanctuary'
                      ? 'bg-white text-obsidian border-white'
                      : 'border-white/10 text-ash hover:text-white'
                  }`}
                >
                  Santuario
                </button>
                <button
                  onClick={() => setActiveTab('hud')}
                  className={`py-2 px-3 uppercase text-[10px] font-bold tracking-wider border transition ${
                    activeTab === 'hud'
                      ? 'bg-earth text-white border-earth'
                      : 'border-white/10 text-ash hover:text-white'
                  }`}
                >
                  Modo Navío (HUD)
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-ash text-[11px]">
              <span>CHECK-IN FLOTILLA:</span>
              <span className="text-white font-bold">17:00 HRS · VIERNES</span>
            </div>
          </div>
        </div>

        {/* Big Architectural Photography Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="h-64 sm:h-80 relative overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1000" 
              alt="Cabaña Navana" 
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 font-mono text-[11px] text-white">
              CABAÑA EL MIRADOR // A-FRAME MADERA QUEMADA
            </div>
          </div>

          <div className="h-64 sm:h-80 relative overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000" 
              alt="Sauna de cedro" 
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 font-mono text-[11px] text-white">
              SAUNA DE CEDRO // INFUSIÓN DE EUCALIPTO (78°C)
            </div>
          </div>

          <div className="h-64 sm:h-80 relative overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1525811902-f2342640856e?auto=format&fit=crop&q=80&w=1000" 
              alt="Pozo de fuego" 
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 font-mono text-[11px] text-white">
              POZO DE FUEGO // LEÑA SECA DE ENCINO & CAFÉ
            </div>
          </div>
        </div>
      </section>

      {/* 02. TAB CONTENT */}
      {activeTab === 'sanctuary' ? (
        <div className="space-y-12">
          
          {/* Live Telemetry Amenities Matrix */}
          <section className="border border-white/10 bg-[#0B0A09]">
            <div className="p-6 border-b border-white/10">
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ ESTADO DE AMENIDADES EN TIEMPO REAL ]
              </span>
              <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tight mt-1">
                Sincronización del Refugio para la Llegada
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 font-mono text-xs">
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-ash text-[10px] uppercase">
                  <span>Sauna Nórdico</span>
                  <span className="text-emerald-400 font-bold">Encendido</span>
                </div>
                <p className="font-display font-bold text-3xl text-white">78°C</p>
                <p className="text-[11px] text-ash">Madera de cedro canadiense e infusión de hierbas silvestres.</p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-ash text-[10px] uppercase">
                  <span>Pozo de Fuego</span>
                  <span className="text-emerald-400 font-bold">Preparado</span>
                </div>
                <p className="font-display font-bold text-3xl text-earth">Listo</p>
                <p className="text-[11px] text-ash">2 atados de leña seca de encino y tea natural para encendido rápido.</p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-ash text-[10px] uppercase">
                  <span>Hangar de Motos</span>
                  <span className="text-white font-bold">Bahía 4</span>
                </div>
                <p className="font-display font-bold text-3xl text-white">Techado</p>
                <p className="text-[11px] text-ash">Suelo firme de piedra volcánica, 4 cargadores de batería y compresor.</p>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between text-ash text-[10px] uppercase">
                  <span>Cerradura Digital</span>
                  <span className="text-ash font-bold">Keyless</span>
                </div>
                <p className="font-display font-bold text-xl text-white pt-1">
                  {digitalKeyUnlocked ? '#8901' : '••••••••'}
                </p>
                <button
                  onClick={() => setDigitalKeyUnlocked(!digitalKeyUnlocked)}
                  className="mt-2 text-[10px] text-earth uppercase font-bold underline"
                >
                  {digitalKeyUnlocked ? 'Ocultar Clave' : 'Revelar Clave de Cabina'}
                </button>
              </div>
            </div>
          </section>

          {/* Cabin Roster */}
          <section className="border border-white/10 bg-[#0B0A09] p-6 sm:p-10 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ DISTRIBUCIÓN DE REFUGIOS // CAPACIDAD 6 PILOTOS ]
              </span>
              <h3 className="font-display font-bold text-2xl text-white uppercase">
                Asignación de Cabañas Navana
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-5 border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-center text-ash text-[10px]">
                  <span>CABAÑA 01</span>
                  <span className="text-emerald-400 font-bold uppercase">Asignada</span>
                </div>
                <h4 className="font-bold text-base text-white">El Mirador</h4>
                <p className="text-ash text-[11px]">
                  Patricio Martin & Diego R. (Cama King dividida + regadera exterior templada con vista a los oyameles).
                </p>
              </div>

              <div className="p-5 border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-center text-ash text-[10px]">
                  <span>CABAÑA 02</span>
                  <span className="text-emerald-400 font-bold uppercase">Asignada</span>
                </div>
                <h4 className="font-bold text-base text-white">El Encinar</h4>
                <p className="text-ash text-[11px]">
                  Sofía Montiel (Cama Queen + tina nórdica y terraza privada orientada al amanecer).
                </p>
              </div>

              <div className="p-5 border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex justify-between items-center text-ash text-[10px]">
                  <span>CABAÑA 03</span>
                  <span className="text-emerald-400 font-bold uppercase">Asignada</span>
                </div>
                <h4 className="font-bold text-base text-white">La Cañada</h4>
                <p className="text-ash text-[11px]">
                  Rigo Méndez (Cama Queen + mirador de estrellas y acceso directo al sendero del río).
                </p>
              </div>
            </div>
          </section>

        </div>
      ) : (
        /* MODO NAVÍO: COCKPIT HUD PARA MANILLAR */
        <section className="border-2 border-earth bg-black p-8 sm:p-12 space-y-8 font-mono select-none">
          <div className="flex items-center justify-between border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-earth animate-ping" />
              <span className="font-bold text-white text-sm uppercase tracking-widest">
                MODO NAVÍO // COCKPIT TÁCTICO DE MANILLAR
              </span>
            </div>
            <span className="text-ash text-xs">SOL DIRECTO ACTIVADO</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-center">
            <div className="space-y-1">
              <span className="text-ash text-xs uppercase">Rumbo Magnético</span>
              <p className="font-display font-black text-6xl text-white">248° W</p>
              <p className="text-earth text-xs">Hacia Amanalco de Becerra</p>
            </div>

            <div className="space-y-1 border-y md:border-y-0 md:border-x border-white/20 py-6 md:py-0">
              <span className="text-ash text-xs uppercase">Distancia al Refugio</span>
              <p className="font-display font-black text-7xl text-white">32.4</p>
              <p className="text-ash text-xs uppercase">Kilómetros restantes</p>
            </div>

            <div className="space-y-1">
              <span className="text-ash text-xs uppercase">Altitud GPS</span>
              <p className="font-display font-black text-6xl text-white">2,640 M</p>
              <p className="text-emerald-400 text-xs">Ascenso: +340 M a base</p>
            </div>
          </div>

          <div className="border border-white/20 p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-ash gap-2">
            <span>SIGUIENTE WAYPOINT: <strong className="text-white">GASOLINERA AMANALCO (ÚLTIMO CARBURANTE)</strong></span>
            <span className="text-earth font-bold">18 KM ADELANTE</span>
          </div>
        </section>
      )}

    </div>
  );
};
