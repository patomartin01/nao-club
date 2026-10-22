'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityGroupInfo } from '../../types';
import { X, Users, ChevronRight, Shield, Compass, Bike, UserPlus, Check } from 'lucide-react';

interface GroupParticipantsModalProps {
  groupInfo: ActivityGroupInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPilotProfile: (userId: string) => void;
  onEnterCrew?: (crewId: string) => void;
}

export const GroupParticipantsModal: React.FC<GroupParticipantsModalProps> = ({
  groupInfo,
  isOpen,
  onClose,
  onOpenPilotProfile,
  onEnterCrew
}) => {
  const { currentUser, crews, isFollowingUser, toggleFollowUser } = useApp();

  if (!isOpen || !groupInfo) return null;

  const linkedCrew = groupInfo.crewId ? crews.find(c => c.id === groupInfo.crewId) : null;
  const isMyClub = !!linkedCrew ? linkedCrew.members.some(m => m.userId === currentUser.id) : (!!groupInfo.crewId && crews.some(c => c.id === groupInfo.crewId && c.members.some(m => m.userId === currentUser.id)));
  const displayCrewName = linkedCrew?.name || groupInfo.crewName;

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="border border-white/20 bg-[#0E0D0C] max-w-lg w-full shadow-2xl relative text-chalk font-mono flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* HEADER */}
        <div className="bg-[#0E0D0C] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-earth/10 border border-earth/30 flex items-center justify-center text-earth shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-earth uppercase font-bold tracking-widest bg-earth/10 px-2 py-0.5 border border-earth/20">
                  {isMyClub ? 'Mi Tribu' : 'Tribu de Motos'}
                </span>
                {!isMyClub && (
                  <span className="text-[9px] text-ash/70 uppercase font-bold bg-white/[0.03] px-1.5 py-0.5 border border-white/10">
                    Privado
                  </span>
                )}
                <span className="text-[10px] text-ash">
                  {groupInfo.participants.length} pilotos
                </span>
              </div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight mt-0.5">
                {displayCrewName}
              </h3>
              {groupInfo.rodadaTitle && (
                <p className="text-xs text-ash truncate mt-0.5">
                  Salida: {groupInfo.rodadaTitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-white/15 hover:border-white text-ash hover:text-white transition"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PARTICIPANTS ROSTER */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <span className="text-[10px] text-ash uppercase font-bold tracking-wider block mb-1">
            Pilotos que rodaron juntos:
          </span>

          <div className="space-y-2.5">
            {groupInfo.participants.map((p) => {
              const isCurrentUser = p.userId === currentUser.id;

              return (
                <div 
                  key={p.userId}
                  onClick={() => {
                    if (!isCurrentUser) {
                      onClose();
                      onOpenPilotProfile(p.userId);
                    }
                  }}
                  className={`p-3 border transition flex items-center justify-between gap-3 ${
                    isCurrentUser
                      ? 'bg-earth/[0.04] border-earth/25 cursor-default'
                      : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-earth/40 cursor-pointer group'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-full overflow-hidden border shrink-0 ${
                      isCurrentUser ? 'border-earth ring-2 ring-earth/30' : 'border-white/20 group-hover:border-earth transition'
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold truncate ${
                          isCurrentUser ? 'text-white' : 'text-white group-hover:text-earth transition'
                        }`}>
                          {p.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] uppercase font-bold text-earth bg-earth/20 border border-earth/40 px-1.5 py-0.5">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-ash mt-0.5">
                        <span>{p.handle}</span>
                        {p.motoModel && (
                          <>
                            <span>•</span>
                            <span className="text-chalk font-semibold truncate flex items-center gap-1">
                              <Bike className="w-3 h-3 text-earth inline shrink-0" />
                              {p.motoModel}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {!isCurrentUser ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowUser(p.userId);
                          }}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                            isFollowingUser(p.userId)
                              ? 'bg-white/10 hover:bg-white/20 text-chalk border border-white/15'
                              : 'bg-earth/20 hover:bg-earth text-earth hover:text-white border border-earth/40 hover:border-earth'
                          }`}
                          title={isFollowingUser(p.userId) ? 'Siguiendo' : 'Seguir'}
                        >
                          {isFollowingUser(p.userId) ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="hidden xs:inline">Siguiendo</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              <span className="hidden xs:inline">Seguir</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-ash group-hover:text-white transition">
                          <span className="hidden sm:inline text-[10px] uppercase font-mono">Perfil</span>
                          <ChevronRight className="w-4 h-4 text-ash group-hover:text-earth group-hover:translate-x-0.5 transition" />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTION */}
        {groupInfo.crewId && (
          <div className="p-4 bg-black/50 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
            {isMyClub && onEnterCrew ? (
              <>
                <span className="text-[11px] text-ash">
                  Eres miembro activo de esta tribu
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onEnterCrew(groupInfo.crewId!);
                  }}
                  className="px-3.5 py-2 bg-white/[0.05] hover:bg-earth text-white border border-white/20 hover:border-earth uppercase font-bold text-xs tracking-wider transition flex items-center gap-1.5"
                >
                  <span>Ver Mi Tribu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between text-ash text-[11px]">
                <span className="flex items-center gap-1.5 text-ash/80">
                  <Shield className="w-3.5 h-3.5 text-ash/60" />
                  Tribu Privada • Solo miembros autorizados
                </span>
                <span className="text-[10px] text-ash/50 uppercase font-mono">
                  Sin acceso
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
