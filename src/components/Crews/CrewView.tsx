'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Plus, 
  Calendar, 
  Users, 
  Bike, 
  Compass, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface CrewViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
}

export const CrewView: React.FC<CrewViewProps> = ({ onOpenCreateCrew, onOpenJoinCrew }) => {
  const { 
    currentCrew, 
    users, 
    currentUser, 
    rodadas, 
    enterRodada, 
    setActiveNavTab,
    motorcycles 
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);

  if (!currentCrew) {
    return (
      <div className="text-center py-24 font-mono text-xs text-ash space-y-4">
        <p>NO SE ENCONTRÓ NINGÚN GRUPO SELECCIONADO.</p>
        <button 
          onClick={() => setActiveNavTab('home')} 
          className="px-6 py-3 bg-white text-obsidian uppercase font-bold text-xs"
        >
          Volver a Mis Grupos
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCrew.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const crewRodadas = rodadas.filter(r => r.crewId === currentCrew.id);

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 00. CONTEXTUAL BREADCRUMB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
        <button 
          onClick={() => setActiveNavTab('home')}
          className="flex items-center gap-2 text-ash hover:text-white uppercase font-bold transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver a Mis Grupos</span>
        </button>

        <span className="text-[10px] uppercase text-earth tracking-widest font-bold">
          SALA DE GRUPO // {currentCrew.name}
        </span>
      </div>

      {/* 01. CREW HERO BANNER */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="h-64 sm:h-80 w-full relative overflow-hidden border-b border-white/10 bg-black">
          <img 
            src={currentCrew.coverImage} 
            alt={currentCrew.name}
            className="w-full h-full object-cover filter brightness-75" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/85 border border-white/20 font-mono text-[10px] text-earth uppercase font-bold tracking-widest">
              BASE: {currentCrew.baseCity}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ COMUNIDAD OFF-ROAD // MOTO CLUB ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {currentCrew.name}
            </h1>
            <p className="font-mono text-xs text-ash leading-relaxed font-light">
              {currentCrew.description}
            </p>
          </div>

          {/* Shareable Invite Code Pill */}
          <div className="p-5 border border-white/10 bg-[#0E0C0A] font-mono text-xs space-y-2 shrink-0 md:min-w-[260px]">
            <span className="text-[10px] text-ash uppercase tracking-wider block">
              Clave Única de Invitación
            </span>
            <div className="flex items-center justify-between gap-3 bg-white/[0.03] p-3 border border-white/15">
              <code className="text-earth font-bold text-base tracking-widest">
                {currentCrew.inviteCode}
              </code>
              <button 
                onClick={handleCopy}
                title="Copiar clave para WhatsApp"
                className="px-2.5 py-1.5 border border-white/15 hover:border-earth text-ash hover:text-white transition flex items-center gap-1.5 text-[10px] uppercase font-bold"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-ash font-light">
              Comparte esta clave con tus amigos para que se unan al club.
            </p>
          </div>
        </div>

        {/* Member metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10 font-mono text-xs bg-[#0E0C0A]">
          <div className="p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Total Miembros</span>
            <p className="font-bold text-white text-base mt-0.5">{currentCrew.members.length} Pilotos</p>
          </div>
          <div className="p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Expediciones</span>
            <p className="font-bold text-white text-base mt-0.5">{crewRodadas.length} Convocadas</p>
          </div>
          <div className="p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Disciplina</span>
            <p className="font-bold text-earth text-base mt-0.5">Dual-Sport & Adventure</p>
          </div>
          <div className="p-5">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Fundador</span>
            <p className="font-bold text-white text-base mt-0.5">Patricio Martin</p>
          </div>
        </div>
      </section>

      {/* 02. EXPEDICIONES DE ESTE GRUPO */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ RODADAS DEL CLUB // EXPEDICIONES ]
            </span>
            <h2 className="font-display font-extrabold text-2xl text-white uppercase mt-1">
              Expediciones & Votaciones ({crewRodadas.length})
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {crewRodadas.map((rd) => (
            <div 
              key={rd.id}
              onClick={() => enterRodada(rd.id)}
              className="group border border-white/10 hover:border-earth bg-[#0B0A09] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="px-2 py-0.5 bg-earth/20 border border-earth text-earth font-bold uppercase tracking-widest">
                    {rd.status === 'votacion' ? '⚡ Votación Abierta de Rutas' : '✓ Confirmada'}
                  </span>
                  <span className="text-ash">·</span>
                  <span className="text-white bg-white/10 px-2 py-0.5">
                    {rd.category}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-2xl text-white uppercase group-hover:text-earth transition">
                  {rd.title}
                </h3>
                <p className="font-mono text-xs text-ash max-w-2xl font-light">
                  {rd.description}
                </p>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 font-mono text-xs border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-ash uppercase block">Fechas</span>
                  <p className="font-bold text-white">{rd.startDate} al {rd.endDate}</p>
                </div>
                <div className="text-left lg:text-right">
                  <span className="text-[10px] text-ash uppercase block">Pilotos</span>
                  <p className="font-bold text-earth">{rd.attendees.length} Confirmados</p>
                </div>

                <button className="px-6 py-3.5 bg-white group-hover:bg-earth text-obsidian group-hover:text-white uppercase font-bold tracking-widest text-xs transition shrink-0 flex items-center gap-2">
                  <span>Entrar a Votar & Ver Mapas</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {crewRodadas.length === 0 && (
            <div className="p-12 border border-white/10 text-center font-mono text-xs text-ash space-y-3">
              <p>No hay rodadas convocadas en este club por el momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* 03. PILOTOS & MÁQUINAS REGISTRADAS EN ESTE CLUB */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-4">
          <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
            [ FLOTILLA ACTIVA ]
          </span>
          <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
            Pilotos Miembros ({currentCrew.members.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentCrew.members.map((member) => {
            const user = users.find(u => u.id === member.userId);
            if (!user) return null;
            const userBike = motorcycles.find(m => m.userId === user.id);

            return (
              <div key={member.userId} className="border border-white/10 bg-[#0B0A09] p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-12 h-12 object-cover border border-white/20"
                    />
                    <div>
                      <p className="font-bold text-white uppercase">{user.name}</p>
                      <p className="text-[10px] text-earth uppercase">{member.role}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-ash font-light border-t border-white/[0.06] pt-2">
                    {user.bio}
                  </p>
                </div>

                {userBike && (
                  <div className="p-3 bg-white/[0.02] border border-white/10 space-y-1">
                    <span className="text-[9px] text-ash uppercase block">Máquina Oficial:</span>
                    <p className="font-bold text-white text-[11px] uppercase">
                      {userBike.brand} {userBike.model}
                    </p>
                    <p className="text-[10px] text-earth">{userBike.tires}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
