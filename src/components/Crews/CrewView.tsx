'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Key, Copy, Check, Shield, MapPin, Bike, Calendar, Plus, Trophy } from 'lucide-react';

interface CrewViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
}

export const CrewView: React.FC<CrewViewProps> = ({ onOpenCreateCrew, onOpenJoinCrew }) => {
  const { currentCrew, crews, setCurrentCrew, users, motorcycles, rodadas, currentUser, setActiveNavTab } = useApp();
  const [copiedCode, setCopiedCode] = useState(false);

  if (!currentCrew) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>No perteneces a ningún crew todavía.</p>
        <button onClick={onOpenJoinCrew} className="mt-4 px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs">
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
    <div className="space-y-6 pb-20">
      
      {/* Crew Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="h-48 sm:h-64 w-full relative">
          <img 
            src={currentCrew.coverImage} 
            alt={currentCrew.name}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 pb-8 -mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-glow border-2 border-slate-950">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Moto Club Oficial
                </span>
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {currentCrew.name}
                </h1>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm max-w-xl">
              {currentCrew.tagline}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Base: <strong className="text-slate-200">{currentCrew.baseCity}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-slate-200">{currentCrew.members.length}</strong> Miembros
              </span>
            </div>
          </div>

          {/* Invite Code Box */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-xl text-center space-y-2 shrink-0">
            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
              Clave Única de Invitación
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono font-black text-xl text-amber-400 tracking-wider">
                {currentCrew.inviteCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition"
                title="Copiar clave"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Pásale este código a tus amigos para que se unan al grupo.
            </p>
          </div>
        </div>
      </div>

      {/* Switcher & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {crews.map(c => (
            <button
              key={c.id}
              onClick={() => setCurrentCrew(c)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                currentCrew.id === c.id 
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpenJoinCrew}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-200 rounded-xl hover:text-white"
          >
            + Unirse con Clave
          </button>
          <button
            onClick={onOpenCreateCrew}
            className="px-3.5 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300"
          >
            + Crear Nuevo Squad
          </button>
        </div>
      </div>

      {/* Members Roster & Bikes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Members Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Roster de Pilotos ({currentCrew.members.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentCrew.members.map(member => {
              const u = users.find(usr => usr.id === member.userId) || currentUser;
              const bike = motorcycles.find(m => m.userId === member.userId);

              return (
                <div key={member.userId} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/30" />
                      <div>
                        <h4 className="font-bold text-xs text-white">{u.name}</h4>
                        <p className="text-[11px] text-amber-400 font-mono">{u.handle}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {member.role}
                    </span>
                  </div>

                  {bike ? (
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                      <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-200 truncate">{bike.brand} {bike.model} ({bike.year})</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{bike.tires}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Sin moto registrada</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Squad Rodadas History / Plans (1 col) */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Rodadas del Crew
          </h3>

          <div className="space-y-3">
            {rodadas.filter(r => r.crewId === currentCrew.id).map(r => (
              <div 
                key={r.id} 
                onClick={() => setActiveNavTab('rodada')}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                    {r.category.split('/')[0]}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {r.status === 'votacion' ? 'Votación' : 'Oficial'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {r.subtitle}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>📅 {r.startDate}</span>
                  <span className="text-amber-400 font-bold">Ver Plan →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
