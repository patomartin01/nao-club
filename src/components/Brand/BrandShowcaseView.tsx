'use client';

import React, { useState } from 'react';
import { 
  Compass, 
  Flame, 
  MapPin, 
  Navigation, 
  Layers, 
  Shield, 
  Maximize2, 
  Eye, 
  Sparkles,
  ArrowRight,
  Droplets,
  Thermometer,
  Moon,
  Sun,
  Activity
} from 'lucide-react';

export const BrandShowcaseView: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<'nao' | 'nomada'>('nao');
  const [activeScreen, setActiveScreen] = useState<'feed' | 'hud' | 'sanctuary'>('feed');

  return (
    <div className="space-y-12 pb-24 text-slate-100">
      
      {/* Top Banner / Switcher */}
      <div className="border border-white/10 bg-black/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] font-mono tracking-widest uppercase text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Estudio de Dirección de Arte & Brand Book
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Aventura Off-Road <span className="text-white/40">×</span> Navana Cabins
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl font-light leading-relaxed">
              La convergencia entre la geografía cruda sobre dos ruedas y la serenidad arquitectónica del santuario.
            </p>
          </div>

          {/* Territory Toggle Switch */}
          <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSelectedBrand('nao')}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                selectedBrand === 'nao'
                  ? 'bg-white text-black shadow-2xl scale-100'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              01. NAO (Brutalista / Superficial)
            </button>
            <button
              onClick={() => setSelectedBrand('nomada')}
              className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                selectedBrand === 'nomada'
                  ? 'bg-[#C28751] text-black shadow-2xl scale-100'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              02. NÓMADA (Táctil / Peregrino)
            </button>
          </div>
        </div>
      </div>

      {/* Brand Identity Deep-Dive */}
      {selectedBrand === 'nao' ? (
        /* TERRITORIO A: NAO */
        <div className="space-y-10 animate-in fade-in duration-500">
          
          {/* Logo & Monolith Header */}
          <div className="relative border border-white/15 bg-gradient-to-b from-[#0D0F12] to-[#050608] rounded-3xl p-8 sm:p-14 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-[11px] font-mono text-white/30 tracking-widest uppercase hidden sm:block">
              19°24&apos;02&quot;N 99°16&apos;54&quot;W // ELEV. 2,980 M
            </div>

            <div className="space-y-6 max-w-3xl">
              <span className="text-xs font-mono text-[#D97746] tracking-[0.3em] uppercase font-bold">
                [ EL NAVÍO TERRESTRE ]
              </span>
              
              <div className="font-display font-black text-6xl sm:text-8xl tracking-[0.25em] text-white">
                NAO
              </div>

              <p className="text-lg sm:text-xl text-white/80 font-light leading-relaxed border-l-2 border-[#D97746] pl-6 py-1">
                &ldquo;Hacemos tierra para vaciar la mente. Una Nao no conquista la montaña; la surca con reverencia. Dos ruedas como compás, el polvo como filtro y la soledad como arquitectura.&rdquo;
              </p>
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
              <div className="p-4 rounded-xl bg-[#08090A] border border-white/10 space-y-2">
                <div className="h-10 rounded-lg bg-[#08090A] border border-white/20" />
                <p className="text-xs font-mono font-bold text-white">Asphalt Pitch</p>
                <p className="text-[10px] font-mono text-white/50">#08090A · Fondo Base</p>
              </div>
              <div className="p-4 rounded-xl bg-[#14171A] border border-white/10 space-y-2">
                <div className="h-10 rounded-lg bg-[#14171A]" />
                <p className="text-xs font-mono font-bold text-white">Basalt Slab</p>
                <p className="text-[10px] font-mono text-white/50">#14171A · Contenedores</p>
              </div>
              <div className="p-4 rounded-xl bg-[#EAECEF] border border-white/10 space-y-2 text-black">
                <div className="h-10 rounded-lg bg-[#EAECEF]" />
                <p className="text-xs font-mono font-bold text-black">Mist Chalk</p>
                <p className="text-[10px] font-mono text-black/60">#EAECEF · Tipografía</p>
              </div>
              <div className="p-4 rounded-xl bg-[#D97746] border border-white/10 space-y-2 text-black">
                <div className="h-10 rounded-lg bg-[#D97746]" />
                <p className="text-xs font-mono font-bold text-black">Ember Glow</p>
                <p className="text-[10px] font-mono text-black/70">#D97746 · Fuego & Acento</p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* TERRITORIO B: NÓMADA */
        <div className="space-y-10 animate-in fade-in duration-500">
          
          <div className="relative border border-[#C28751]/30 bg-gradient-to-b from-[#141210] to-[#0A0908] rounded-3xl p-8 sm:p-14 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-[11px] font-mono text-[#C28751]/50 tracking-widest uppercase hidden sm:block">
              EL RITO DEL CAMINO // HABITABILIDAD DEL TRÁNSITO
            </div>

            <div className="space-y-6 max-w-3xl">
              <span className="text-xs font-mono text-[#C28751] tracking-[0.3em] uppercase font-bold">
                [ EL PEREGRINAJE TÁCTIL ]
              </span>
              
              <div className="font-serif italic font-normal text-6xl sm:text-8xl tracking-tight text-[#E8DFD8]">
                nómada.
              </div>

              <p className="text-lg sm:text-xl text-[#E8DFD8]/90 font-light leading-relaxed border-l-2 border-[#C28751] pl-6 py-1">
                &ldquo;No habitamos un código postal; habitamos el tránsito. Nómada es el pacto entre la vibración de la terracería y el silencio del refugio. La ruta es la purificación física; la cabaña es el descanso del espíritu.&rdquo;
              </p>
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
              <div className="p-4 rounded-xl bg-[#0D0D0C] border border-[#C28751]/20 space-y-2">
                <div className="h-10 rounded-lg bg-[#0D0D0C] border border-white/10" />
                <p className="text-xs font-mono font-bold text-[#E8DFD8]">Charred Cedar</p>
                <p className="text-[10px] font-mono text-[#E8DFD8]/50">#0D0D0C · Madera Shou Sugi</p>
              </div>
              <div className="p-4 rounded-xl bg-[#1D1C1A] border border-[#C28751]/20 space-y-2">
                <div className="h-10 rounded-lg bg-[#1D1C1A]" />
                <p className="text-xs font-mono font-bold text-[#E8DFD8]">Warm Pumice</p>
                <p className="text-[10px] font-mono text-[#E8DFD8]/50">#1D1C1A · Piedra Volcánica</p>
              </div>
              <div className="p-4 rounded-xl bg-[#E8DFD8] border border-white/10 space-y-2 text-black">
                <div className="h-10 rounded-lg bg-[#E8DFD8]" />
                <p className="text-xs font-mono font-bold text-black">Raw Linen</p>
                <p className="text-[10px] font-mono text-black/60">#E8DFD8 · Lino Hueso</p>
              </div>
              <div className="p-4 rounded-xl bg-[#C28751] border border-white/10 space-y-2 text-black">
                <div className="h-10 rounded-lg bg-[#C28751]" />
                <p className="text-xs font-mono font-bold text-black">Ochre Clay</p>
                <p className="text-[10px] font-mono text-black/70">#C28751 · Barro & Pinocha</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Interactive Core Screens Walkthrough */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display font-black text-2xl text-white">
              Las 3 Pantallas Maestras de la App (Prototipo UI en Vivo)
            </h2>
            <p className="text-xs text-white/50">
              Prueba la experiencia de cada pantalla con diseño de alta fidelidad.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveScreen('feed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                activeScreen === 'feed' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              01. Rutas Efímeras
            </button>
            <button
              onClick={() => setActiveScreen('hud')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                activeScreen === 'hud' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              02. Cockpit / HUD Off-Road
            </button>
            <button
              onClick={() => setActiveScreen('sanctuary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                activeScreen === 'sanctuary' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              03. Refugio Navana Cabins
            </button>
          </div>
        </div>

        {/* Live UI Mockup Container */}
        <div className="border border-white/15 rounded-3xl bg-[#07080A] p-4 sm:p-8 shadow-2xl relative overflow-hidden">
          
          {/* SCREEN 1: RUTAS EFÍMERAS (THE DISCOVERY FEED) */}
          {activeScreen === 'feed' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-mono text-xs text-white/40 tracking-widest uppercase">
                  // SELECCIÓN SEMANAL EFÍMERA
                </span>
                <span className="font-mono text-xs text-[#D97746]">
                  VENTANA ACTIVA: 48 HORAS
                </span>
              </div>

              {/* Editorial Route Card */}
              <div className="relative rounded-2xl overflow-hidden border border-white/15 group">
                <div className="h-[420px] w-full relative">
                  <img 
                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600" 
                    alt="Ruta de la Niebla"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded bg-black/70 backdrop-blur-md border border-white/20 font-mono text-xs font-bold text-white">
                      EXPEDICIÓN 004
                    </span>
                    <span className="px-3 py-1 rounded bg-[#D97746]/90 backdrop-blur-md font-mono text-xs font-bold text-black">
                      DESTINO: NAVANA CABINS
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
                      La Brecha del Cedro Negro
                    </h3>
                    
                    <p className="text-sm text-white/80 max-w-xl font-light">
                      Travesía de tierra compacta y pinocha entre Amanalco y Valle de Bravo. Conexión directa al claro de bosque donde te espera el sauna a 78°C.
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-white/70 border-t border-white/20">
                      <span><strong>142</strong> KM TOTAL</span>
                      <span><strong>48%</strong> TERRACERÍA</span>
                      <span><strong>2,980</strong> MSNM</span>
                      <span>CLIMA: <strong>4°C</strong> NOCTURNO</span>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button className="px-6 py-3 rounded-none bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#D97746] hover:text-white transition">
                        Iniciar Navegación →
                      </button>
                      <button className="px-5 py-3 rounded-none border border-white/30 text-white font-mono text-xs uppercase hover:border-white transition">
                        Ver Altimetría
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: COCKPIT / HUD OFF-ROAD */}
          {activeScreen === 'hud' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300 bg-black p-6 sm:p-8 rounded-2xl border border-white/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs text-white/50">
                <span>[ MODO CABINA TÁCTICO ]</span>
                <span className="text-emerald-400">GPS FIX: ÓPTIMO (12 SAT)</span>
              </div>

              {/* Big HUD Indicator */}
              <div className="text-center py-6 space-y-2">
                <p className="font-mono text-xs tracking-widest uppercase text-white/40">
                  PRÓXIMA MANIOBRA // EN 1.8 KM
                </p>
                <div className="font-display font-black text-4xl sm:text-6xl text-white">
                  ↱ GIRO DERECHA
                </div>
                <p className="font-mono text-sm text-[#D97746] tracking-wider uppercase font-bold">
                  Brecha de Pinocha hacia Río Negro
                </p>
              </div>

              {/* Minimal Topographic Line Visualizer */}
              <div className="h-32 rounded-xl bg-white/5 border border-white/10 p-4 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 text-center font-mono">
                  <Navigation className="w-8 h-8 text-white mx-auto animate-bounce" />
                  <p className="text-[11px] text-white/60 mt-1">VECTOR DE RUTA TOPOGRÁFICA</p>
                </div>
              </div>

              {/* Essential telemetry stats */}
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/40 uppercase">Velocidad</p>
                  <p className="text-2xl font-black text-white">58 <span className="text-xs text-white/50">KM/H</span></p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/40 uppercase">Rumbo</p>
                  <p className="text-2xl font-black text-white">142° <span className="text-xs text-white/50">SE</span></p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-[10px] text-white/40 uppercase">Restante</p>
                  <p className="text-2xl font-black text-[#D97746]">38 <span className="text-xs text-white/50">KM</span></p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: SANTUARIO NAVANA CABINS INTEGRATION */}
          {activeScreen === 'sanctuary' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#D97746]" />
                  <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                    DESTINO FINAL: NAVANA CABINS (REFUGIO #03)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LLEGADA ESTIMADA: 17:45 HRS
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl overflow-hidden border border-white/15 h-80 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200" 
                    alt="Navana Cabins Sauna & Architecture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-white/80">
                    Cabina 03 — Acabados en madera quemada Shou Sugi Ban & Concreto Aparente.
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display font-black text-2xl text-white">
                    El Santuario tras el Polvo
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed font-light">
                    Aquí es donde converge la aventura. La app se sincroniza con la cabaña para preparar el reposo físico antes de tu llegada.
                  </p>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-white">
                        <Thermometer className="w-4 h-4 text-[#D97746]" />
                        Sauna Nórdico de Cedro
                      </span>
                      <strong className="text-emerald-400">78°C // Listo</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-white">
                        <Flame className="w-4 h-4 text-[#D97746]" />
                        Pozo de Fuego Exterior
                      </span>
                      <strong className="text-white">Leña de encino seca</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-white">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        Garaje Techado para Motos
                      </span>
                      <strong className="text-white">Cajón 03 Asignado</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button className="w-full py-3 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#D97746] hover:text-white transition">
                      Desbloquear Cerradura Digital de Cabina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
