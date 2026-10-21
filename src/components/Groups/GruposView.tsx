'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Plus, 
  Key, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GruposViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateRodada: () => void;
}

type SubTab = 'eventos' | 'clubes' | 'retos';

export const GruposView: React.FC<GruposViewProps> = ({
  onOpenCreateCrew,
  onOpenJoinCrew,
  onOpenCreateRodada
}) => {
  const { 
    crews, 
    rodadas, 
    challenges, 
    toggleJoinChallenge, 
    enterCrew, 
    enterRodada,
    currentUser 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('eventos');

  const handleChallengeToggle = (challengeId: string) => {
    toggleJoinChallenge(challengeId);
    confetti({
      particleCount: 20,
      spread: 45
    });
  };

  return (
    <div className="space-y-6 pb-28 max-w-[1440px] w-full mx-auto font-mono">
      
      {/* 01. SUB-TABS (STRAVA GRUPOS ARCHITECTURE) */}
      <div className="flex border-b border-white/10 bg-[#0D0B0A] p-1">
        <button
          onClick={() => setActiveSubTab('eventos')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition ${
            activeSubTab === 'eventos'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          Eventos ({rodadas.length})
        </button>

        <button
          onClick={() => setActiveSubTab('clubes')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition ${
            activeSubTab === 'clubes'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          Clubes ({crews.length})
        </button>

        <button
          onClick={() => setActiveSubTab('retos')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition ${
            activeSubTab === 'retos'
              ? 'text-earth border-b-2 border-earth bg-earth/5'
              : 'text-ash hover:text-white'
          }`}
        >
          Retos ({challenges.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* 02. SUB-TAB: EVENTOS (RODADAS PROGRAMADAS EN MOTO)       */}
      {/* ========================================================= */}
      {activeSubTab === 'eventos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Próximas Rodadas
              </h2>
              <p className="text-xs text-ash">Salidas comunitarias, rallies y expediciones organizadas</p>
            </div>
            <button
              onClick={onOpenCreateRodada}
              className="px-3 py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear rodada</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rodadas.map(rodada => (
              <div 
                key={rodada.id}
                onClick={() => enterRodada(rodada.id)}
                className="bg-[#0F0D0C] border border-white/10 hover:border-earth/50 transition cursor-pointer p-5 space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-earth uppercase tracking-widest font-bold">
                      {rodada.category}
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-earth transition mt-0.5">
                      {rodada.title}
                    </h3>
                    <p className="text-xs text-ash mt-1">{rodada.subtitle}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-white/[0.04] border border-white/10 text-chalk uppercase">
                    {rodada.status === 'votacion' ? '🗳️ Votando Ruta' : '🔥 Fijada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-black/40 border border-white/5 p-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Fecha</span>
                    <span className="text-white font-bold">{rodada.startDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Punto de Salida</span>
                    <span className="text-white font-bold">{rodada.originPoint}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] uppercase tracking-wider text-ash block">Pilotos</span>
                    <span className="text-earth font-bold">{rodada.attendees.length} confirmados</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex -space-x-2 overflow-hidden">
                    {rodada.attendees.slice(0, 4).map((att, idx) => (
                      <div key={idx} className="w-7 h-7 rounded-full bg-earth/20 border-2 border-black flex items-center justify-center text-[10px] text-white font-bold">
                        P{idx + 1}
                      </div>
                    ))}
                  </div>

                  <span className="text-xs text-earth group-hover:translate-x-1 transition flex items-center gap-1 font-bold uppercase">
                    Ver sala de rodada <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 03. SUB-TAB: CLUBES (CREAR O EXPLORAR CLUBES DE MOTO)     */}
      {/* ========================================================= */}
      {activeSubTab === 'clubes' && (
        <div className="space-y-6">
          {/* Strava Create Club Promo Card */}
          <div className="bg-gradient-to-br from-[#1A1410] to-[#0D0B0A] border border-earth/30 p-5 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-earth/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-earth" />
              <span className="text-[10px] text-earth uppercase font-bold tracking-widest">Comunidad Oficial</span>
            </div>

            <h3 className="text-lg font-bold text-white uppercase tracking-tight">
              Crea tu propio moto club
            </h3>

            <p className="text-xs text-ash max-w-md leading-relaxed">
              Organiza rodadas privadas con tus amigos, vota rutas en consenso, comparte GPX seguros y administra el garaje de máquinas de tu escuadrón.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={onOpenCreateCrew}
                className="px-4 py-2 bg-earth hover:bg-earth/90 text-white text-xs font-bold uppercase tracking-wider transition active:scale-95"
              >
                Comenzar Club
              </button>

              <button
                onClick={onOpenJoinCrew}
                className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 text-white text-xs uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95"
              >
                <Key className="w-3.5 h-3.5 text-earth" />
                <span>Unirme con código</span>
              </button>
            </div>
          </div>

          {/* List of Clubs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ash uppercase tracking-wider">
              Tus Clubes Activos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crews.map(crew => (
                <div 
                  key={crew.id}
                  onClick={() => enterCrew(crew.id)}
                  className="bg-[#0F0D0C] border border-white/10 hover:border-earth/50 transition cursor-pointer p-4 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black border border-white/15 flex items-center justify-center font-bold text-earth text-sm">
                      {crew.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white uppercase group-hover:text-earth transition">
                        {crew.name}
                      </h5>
                      <p className="text-[11px] text-ash">{crew.tagline}</p>
                      <div className="flex items-center gap-2 text-[10px] text-ash mt-1">
                        <span>📍 {crew.baseCity}</span>
                        <span>•</span>
                        <span className="text-chalk">{crew.members.length} pilotos</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-ash bg-white/[0.04] px-2 py-1 border border-white/10 uppercase block font-mono">
                      Código: {crew.inviteCode}
                    </span>
                    <span className="text-xs text-earth group-hover:translate-x-1 transition inline-flex items-center gap-0.5 mt-2 font-bold uppercase">
                      Entrar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 04. SUB-TAB: RETOS (STRAVA CHALLENGES PARA MOTOS)        */}
      {/* ========================================================= */}
      {activeSubTab === 'retos' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight">
              Retos Mensuales
            </h2>
            <p className="text-xs text-ash">
              Encuentra motivación, acumula kilómetros en asfalto o tierra y gana insignias para tu vitrina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map(ch => {
              const progressPct = Math.min(100, Math.round((ch.currentKm / ch.targetKm) * 100));

              return (
                <div 
                  key={ch.id}
                  className="bg-[#0F0D0C] border border-white/10 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-earth/10 border border-earth/30 flex items-center justify-center text-earth font-bold text-base shrink-0">
                        {ch.badgeHex}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-ash mt-0.5 leading-relaxed">
                          {ch.subtitle}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-ash mt-1.5">
                          <span>Finaliza: {ch.endDate}</span>
                          <span>•</span>
                          <span className="text-chalk">{ch.participantsCount} participantes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 bg-black/40 border border-white/5 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ash uppercase text-[10px]">Tu progreso:</span>
                      <span className="text-white font-bold font-mono">
                        {ch.currentKm} / {ch.targetKm} {ch.targetKm > 10 ? 'km' : 'puertos'} ({progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-earth transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-ash uppercase">
                      Insignia digital para tu perfil al completar
                    </span>
                    <button
                      onClick={() => handleChallengeToggle(ch.id)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                        ch.joined
                          ? 'bg-white/[0.05] border border-white/20 text-chalk'
                          : 'bg-earth hover:bg-earth/90 text-white'
                      }`}
                    >
                      {ch.joined ? 'Inscrito ✓' : 'Unirme al reto'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
