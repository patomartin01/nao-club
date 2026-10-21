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
  Layers
} from 'lucide-react';

export const BrandShowcaseView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sanctuary' | 'hud'>('sanctuary');
  const [digitalKeyUnlocked, setDigitalKeyUnlocked] = useState(false);

  return (
    <div className="space-y-10 pb-24 text-white">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#C87D55] uppercase tracking-widest font-bold">
            <span>[ 03 ]</span>
            <span>Refugio Arquitectónico</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight mt-1">
            Navana Cabins <span className="text-white/40">×</span> NAO
          </h1>
          <p className="text-sm text-white/60 font-light max-w-xl mt-1">
            El destino donde el cuerpo reposa y el silencio sustituye al motor. Sincronización de amenidades y llegada para pilotos.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('sanctuary')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition ${
              activeTab === 'sanctuary'
                ? 'bg-white text-black font-bold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Santuario & Cabañas
          </button>
          <button
            onClick={() => setActiveTab('hud')}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition ${
              activeTab === 'hud'
                ? 'bg-white text-black font-bold'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Modo Navío (Cockpit HUD)
          </button>
        </div>
      </div>

      {activeTab === 'sanctuary' ? (
        /* SANCTUARY ARCHITECTURAL VIEW */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Main Hero Card */}
          <div className="relative border border-white/[0.08] bg-[#0A0C0F] rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-80 sm:h-[420px] w-full relative">
              <img 
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1600" 
                alt="Navana Cabins Sanctuary" 
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0F] via-[#0A0C0F]/30 to-transparent" />
            </div>

            <div className="p-6 sm:p-10 -mt-28 relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs text-[#C87D55] uppercase tracking-widest font-bold block">
                    DESTINO FINAL // VALLE DE BRAVO / AMANALCO
                  </span>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white">
                    Refugio #03: El Encinar
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setDigitalKeyUnlocked(!digitalKeyUnlocked)}
                    className="px-5 py-2.5 bg-[#C87D55] hover:bg-[#b06a44] text-white font-mono text-xs uppercase tracking-wider font-bold transition flex items-center gap-2"
                  >
                    {digitalKeyUnlocked ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Key className="w-4 h-4" />}
                    {digitalKeyUnlocked ? 'Cerradura Desbloqueada' : 'Desbloquear Cabaña'}
                  </button>
                </div>
              </div>

              {/* Sanctuary Live Amenities Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/[0.08]">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50">
                    <span>SAUNA NÓRDICO</span>
                    <Thermometer className="w-4 h-4 text-[#C87D55]" />
                  </div>
                  <p className="font-display font-black text-xl text-white">78°C</p>
                  <p className="text-[11px] text-emerald-400 font-mono">Caliente & vapor de cedro activo</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50">
                    <span>POZO DE FUEGO</span>
                    <Flame className="w-4 h-4 text-[#C87D55]" />
                  </div>
                  <p className="font-display font-black text-xl text-white">Encino Seco</p>
                  <p className="text-[11px] text-white/60 font-mono">Leña apilada y lista en terraza</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50">
                    <span>HANGAR TECHADO</span>
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                  <p className="font-display font-black text-xl text-white">4 Motos</p>
                  <p className="text-[11px] text-white/60 font-mono">Bahía con anclaje de suelo</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50">
                    <span>TALLER DE RUTA</span>
                    <Layers className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="font-display font-black text-xl text-white">Herramienta</p>
                  <p className="text-[11px] text-white/60 font-mono">Compresor 12V + Dinamométrica</p>
                </div>
              </div>
            </div>
          </div>

          {/* Roster of Available Cabins for the Crew */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Distribución de Habitabilidad para la Flotilla
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0C0F] overflow-hidden space-y-3">
                <div className="h-44 w-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800" 
                    alt="Cabina El Mirador" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    CABINA 01 · 2 PILOTOS
                  </span>
                </div>
                <div className="p-4 pt-1 space-y-2">
                  <h4 className="font-bold text-sm text-white">El Mirador (Cama King + Tina Exterior)</h4>
                  <p className="text-xs text-white/60 font-light">Asignado a: <strong>Patricio Martin</strong></p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0C0F] overflow-hidden space-y-3">
                <div className="h-44 w-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=800" 
                    alt="Cabina El Bosque" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    CABINA 02 · 2 PILOTOS
                  </span>
                </div>
                <div className="p-4 pt-1 space-y-2">
                  <h4 className="font-bold text-sm text-white">El Encinar (2 Camas Queen)</h4>
                  <p className="text-xs text-white/60 font-light">Asignado a: <strong>Diego & Sofía</strong></p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0C0F] overflow-hidden space-y-3">
                <div className="h-44 w-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800" 
                    alt="Cabina La Roca" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                    CABINA 03 · 2 PILOTOS
                  </span>
                </div>
                <div className="p-4 pt-1 space-y-2">
                  <h4 className="font-bold text-sm text-white">La Cañada (Cama King + Vista a la Niebla)</h4>
                  <p className="text-xs text-white/60 font-light">Asignado a: <strong>Rigo</strong></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* COCKPIT / HUD TURN-BY-TURN TACTICAL SCREEN */
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="border border-white/20 bg-black rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-white/50">
              <span className="text-[#C87D55] font-bold">[ NAO // MODO CABINA TÁCTICO ]</span>
              <span className="text-emerald-400">SATÉLITES: 14 ACTIVOS (FIX 3D)</span>
            </div>

            {/* Central Giant Turn Indicator */}
            <div className="text-center py-8 space-y-3">
              <p className="font-mono text-xs tracking-widest uppercase text-white/40">
                PRÓXIMA MANIOBRA EN 1.8 KM
              </p>
              <div className="font-display font-black text-5xl sm:text-7xl text-white">
                ↱ GIRO DERECHA
              </div>
              <p className="font-mono text-sm text-[#C87D55] tracking-widest uppercase font-bold">
                Brecha de Pinocha hacia Río Negro / Navana
              </p>
            </div>

            {/* Minimalist Topographic Line */}
            <div className="h-40 rounded-2xl bg-white/[0.02] border border-white/10 relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
              <div className="relative z-10 text-center font-mono">
                <Navigation className="w-10 h-10 text-white mx-auto animate-pulse" />
                <p className="text-xs text-white/60 mt-2 font-mono tracking-widest uppercase">
                  TRAZO ACTIVO: 19°24&apos;02&quot;N 99°16&apos;54&quot;W
                </p>
              </div>
            </div>

            {/* Telemetry Numbers */}
            <div className="grid grid-cols-3 gap-4 font-mono text-center">
              <div className="p-4 bg-white/[0.04] border border-white/10 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Velocidad</p>
                <p className="text-3xl font-black text-white">58 <span className="text-xs text-white/40">KM/H</span></p>
              </div>
              <div className="p-4 bg-white/[0.04] border border-white/10 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Rumbo</p>
                <p className="text-3xl font-black text-white">142° <span className="text-xs text-white/40">SE</span></p>
              </div>
              <div className="p-4 bg-white/[0.04] border border-white/10 rounded-xl">
                <p className="text-[10px] text-white/40 uppercase">Distancia a Navana</p>
                <p className="text-3xl font-black text-[#C87D55]">38 <span className="text-xs text-white/40">KM</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
