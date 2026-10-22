'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Bike, 
  Plus, 
  Key, 
  ChevronRight, 
  Compass, 
  Shield, 
  ShieldCheck, 
  Flame, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateRodada: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCreateCrew,
  onOpenJoinCrew,
  onOpenCreateRodada
}) => {
  const { 
    currentUser, 
    crews, 
    rodadas, 
    userBikes, 
    enterCrew, 
    enterRodada,
    setActiveNavTab 
  } = useApp();

  const primaryBike = userBikes[0];

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 01. PILOT ACCOUNT SPEC SHEET (TU CUENTA) */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Avatar & Identification */}
          <div className="md:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover border-2 border-white/20 filter brightness-95"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-earth text-white font-mono text-[9px] uppercase font-bold tracking-widest">
                PILOTO
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                  [ CUENTA DE PILOTO // SESIÓN ACTIVA ]
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white uppercase tracking-tight">
                {currentUser.name}
              </h1>
              <p className="font-mono text-xs text-ash flex items-center gap-2">
                <span>{currentUser.handle}</span>
                <span>·</span>
                <span className="text-white/80">{currentUser.email}</span>
                <span>·</span>
                <span className="text-earth">{currentUser.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="md:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 font-mono text-xs">
            <button
              onClick={onOpenCreateCrew}
              className="px-4 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo Grupo
            </button>
            <button
              onClick={onOpenJoinCrew}
              className="px-4 py-3 border border-white/20 hover:border-white text-chalk hover:text-white uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition bg-white/[0.02]"
            >
              <Key className="w-4 h-4 text-earth" />
              Unirse con Clave
            </button>
          </div>

        </div>

        {/* Telemetry Strip of User */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10 font-mono text-xs bg-[#0E0C0A]">
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Grupos Inscritos</span>
            <p className="font-bold text-white text-base mt-0.5">{crews.length} Tribus</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Máquina Asignada</span>
            <p className="font-bold text-earth text-base mt-0.5 truncate">
              {primaryBike ? `${primaryBike.brand} ${primaryBike.model}` : 'Sin registrar'}
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Nivel de Manejo</span>
            <p className="font-bold text-white text-base mt-0.5">{currentUser.ridingLevel}</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Zona Predilecta</span>
            <p className="font-bold text-white text-base mt-0.5">Sierra & Bosque (Edomex)</p>
          </div>
        </div>
      </section>

      {/* 02. SECTION: TUS GRUPOS & TRIBUS DE MOTO (THE HUB) */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ 01 // SELECCIONA UN GRUPO PARA ENTRAR ]
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
              Tus Grupos & Tribus ({crews.length})
            </h2>
            <p className="font-mono text-xs text-ash mt-1">
              Haz clic en cualquiera de tus grupos para entrar a su sala, ver sus miembros y gestionar sus rodadas.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onOpenJoinCrew}
              className="px-3 py-1.5 border border-white/15 text-[11px] font-mono text-ash hover:text-white uppercase font-bold"
            >
              + Ingresar Clave
            </button>
          </div>
        </div>

        {/* Group Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crews.map((crew) => {
            const isMember = crew.members.some(m => m.userId === currentUser.id);
            const crewRodadas = rodadas.filter(r => r.crewId === crew.id);
            const activeRodada = crewRodadas.find(r => r.status === 'votacion') || crewRodadas[0];

            if (!isMember) {
              return (
                <div 
                  key={crew.id}
                  className="border border-white/5 bg-[#080706] p-6 sm:p-8 flex flex-col justify-between opacity-80 cursor-default select-none"
                  title="Tribu Privada • Acceso exclusivo para miembros"
                >
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] text-ash/60 uppercase tracking-widest block font-bold">
                      [ TRIBU PRIVADA ]
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-chalk uppercase">
                      {crew.name}
                    </h3>
                    <p className="font-mono text-xs text-ash/60 font-light">
                      Tribu cerrada. Los detalles de rodadas y miembros son visibles únicamente para pilotos autorizados.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-white/[0.05] flex items-center justify-between text-ash/50 font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-ash/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-ash/40" />
                      Solo miembros
                    </span>
                    <span className="text-[10px] uppercase bg-white/[0.02] border border-white/10 px-2 py-0.5 font-mono">
                      Sin Acceso
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={crew.id}
                onClick={() => enterCrew(crew.id)}
                className="group border border-white/10 hover:border-earth bg-[#0B0A09] transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Crew Cover Banner */}
                <div className="h-44 sm:h-52 w-full relative overflow-hidden border-b border-white/10 bg-black">
                  <img 
                    src={crew.coverImage} 
                    alt={crew.name} 
                    className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />
                  
                  {/* Top floating pill */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 font-mono text-[9px] uppercase tracking-widest text-earth font-bold">
                      CLAVE: {crew.inviteCode}
                    </span>
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 font-mono text-[9px] uppercase tracking-widest text-white">
                      {crew.members.length} PILOTOS
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="font-mono text-[9px] text-ash uppercase tracking-wider block">
                      BASE: {crew.baseCity}
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-white uppercase group-hover:text-earth transition">
                      {crew.name}
                    </h3>
                    <p className="font-mono text-xs text-ash line-clamp-2 font-light">
                      {crew.description}
                    </p>
                  </div>

                  {/* Active Expedition status inside this crew */}
                  <div className="pt-4 border-t border-white/[0.08] space-y-3">
                    {activeRodada ? (
                      <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between font-mono text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-earth uppercase tracking-wider block">
                            {activeRodada.status === 'votacion' ? 'Votación Abierta' : 'Expedición Confirmada'}
                          </span>
                          <p className="text-white font-bold line-clamp-1">{activeRodada.title}</p>
                        </div>
                        <span className="text-[10px] text-ash shrink-0 ml-2">
                          {activeRodada.startDate.slice(5)}
                        </span>
                      </div>
                    ) : (
                      <p className="font-mono text-[11px] text-ash">Sin rodadas programadas actualmente.</p>
                    )}

                    {/* Enter Button */}
                    <div className="flex items-center justify-between pt-1 text-white font-mono text-xs uppercase font-bold tracking-wider group-hover:text-earth">
                      <span>Entrar al Grupo</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Create New Group Card */}
          <div 
            onClick={onOpenCreateCrew}
            className="border-2 border-dashed border-white/15 hover:border-earth/60 bg-white/[0.01] hover:bg-white/[0.03] p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[320px]"
          >
            <div className="w-14 h-14 border border-white/20 group-hover:border-earth flex items-center justify-center text-ash group-hover:text-earth mb-4 transition">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              Crear Nueva Tribu
            </h4>
            <p className="font-mono text-xs text-ash max-w-xs mt-2 font-light">
              Funda una nueva tribu para tus amigos, genera una clave única y organiza expediciones de fin de semana.
            </p>
            <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-earth font-bold">
              [ + REGISTRAR TRIBU ]
            </span>
          </div>

        </div>
      </section>

      {/* 03. SECTION: FEED DE TODAS LAS EXPEDICIONES ACTIVAS */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ 02 // EXPEDICIONES DE TUS TRIBUS ]
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white uppercase tracking-tight mt-1">
              Convocatorias & Próximas Rodadas
            </h2>
          </div>
          <button
            onClick={onOpenCreateRodada}
            className="px-3 py-1.5 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-xs uppercase font-bold tracking-wider transition"
          >
            + Nueva Convocatoria
          </button>
        </div>

        <div className="space-y-4">
          {rodadas.map((rd) => {
            const crew = crews.find(c => c.id === rd.crewId);
            return (
              <div 
                key={rd.id}
                onClick={() => enterRodada(rd.id)}
                className="group border border-white/10 hover:border-earth bg-[#0B0A09] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
                    <span className="text-earth font-bold uppercase tracking-widest">
                      [{crew?.name || 'TRIBU'}]
                    </span>
                    <span className="text-ash">·</span>
                    <span className="text-white bg-white/10 px-2 py-0.5">
                      {rd.category}
                    </span>
                    <span className="text-ash">·</span>
                    <span className="text-emerald-400">
                      {rd.status === 'votacion' ? 'FASE: VOTACIÓN DE RUTAS' : 'CONFIRMADA'}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl text-white uppercase group-hover:text-earth transition">
                    {rd.title}
                  </h3>
                  <p className="font-mono text-xs text-ash max-w-2xl font-light">
                    {rd.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 font-mono text-xs border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-ash uppercase block">Fechas</span>
                    <p className="font-bold text-white">{rd.startDate} al {rd.endDate}</p>
                  </div>
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-ash uppercase block">Flotilla</span>
                    <p className="font-bold text-earth">{rd.attendees.length} Pilotos</p>
                  </div>

                  <button className="px-5 py-3 border border-white/20 group-hover:border-earth group-hover:bg-earth group-hover:text-white uppercase font-bold tracking-widest text-[11px] transition shrink-0">
                    Entrar a Votar →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
