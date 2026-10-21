'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Copy, Check, Plus, Key } from 'lucide-react';

interface CrewViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
}

export const CrewView: React.FC<CrewViewProps> = ({ onOpenCreateCrew, onOpenJoinCrew }) => {
  const { currentCrew, users, currentUser } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);

  if (!currentCrew) {
    return (
      <div className="text-center py-24 font-mono text-xs text-ash">
        <p>NO SE ENCONTRARON GRUPOS ASIGNADOS.</p>
        <button 
          onClick={onOpenJoinCrew} 
          className="mt-4 px-4 py-2 bg-white text-obsidian uppercase font-bold text-xs"
        >
          Unirse con Clave
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCrew.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 01. CREW BANNER */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="h-64 sm:h-80 w-full relative overflow-hidden border-b border-white/10">
          <img 
            src={currentCrew.coverImage} 
            alt={currentCrew.name}
            className="w-full h-full object-cover filter brightness-75" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-transparent to-transparent" />
        </div>

        <div className="p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold block">
              [ FLOTILLA ACTIVA // COMUNIDAD OFF-ROAD ]
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase tracking-tight">
              {currentCrew.name}
            </h1>
            <p className="font-mono text-xs text-ash max-w-xl">
              {currentCrew.description}
            </p>
          </div>

          {/* Invite Code Pill */}
          <div className="p-4 border border-white/10 bg-[#0E0C0A] font-mono text-xs space-y-2">
            <span className="text-[10px] text-ash uppercase block">Clave Única de Invitación</span>
            <div className="flex items-center gap-2">
              <code className="text-earth font-bold text-sm tracking-widest">{currentCrew.inviteCode}</code>
              <button 
                onClick={handleCopy}
                className="p-1.5 border border-white/10 hover:border-earth text-ash hover:text-white transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Member metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-t border-white/10 font-mono text-xs">
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Total Miembros</span>
            <p className="font-bold text-white text-base mt-1">{currentCrew.memberIds.length} Pilotos</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Zona Base</span>
            <p className="font-bold text-white text-base mt-1">Valle de Bravo / Interlomas</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Disciplina</span>
            <p className="font-bold text-earth text-base mt-1">Dual-Sport & Adventure</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Fundador</span>
            <p className="font-bold text-white text-base mt-1">Patricio Martin</p>
          </div>
        </div>
      </section>

      {/* 02. MEMBERS GRID */}
      <section className="space-y-4">
        <div className="border-b border-white/10 pb-4">
          <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
            [ MIEMBROS ACTIVOS ]
          </span>
          <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
            Pilotos Registrados
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.map((u) => (
            <div key={u.id} className="border border-white/10 bg-[#0B0A09] p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3">
                <img 
                  src={u.avatar} 
                  alt={u.name} 
                  className="w-12 h-12 object-cover border border-white/20"
                />
                <div>
                  <p className="font-bold text-white uppercase">{u.name}</p>
                  <p className="text-[10px] text-earth">{u.ridingLevel}</p>
                </div>
              </div>
              <p className="text-[11px] text-ash font-light pt-2 border-t border-white/[0.06]">
                {u.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
