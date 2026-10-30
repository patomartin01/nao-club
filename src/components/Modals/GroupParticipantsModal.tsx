'use client';

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityGroupInfo } from '../../types';
import { X, Users, ChevronRight, Shield, Compass, Bike, UserPlus, UserX, Check } from 'lucide-react';

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
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="border border-[#E5DFD5] bg-white max-w-lg w-full shadow-2xl relative text-[#141312] font-sans flex flex-col max-h-[90vh] rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* HEADER */}
        <div className="bg-[#FAF8F5] border-b border-[#E5DFD5] p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white border border-[#DDD7CB] flex items-center justify-center text-[#C84B31] shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#C84B31] uppercase font-display font-black tracking-widest bg-white px-2 py-0.5 border border-[#E5DFD5] rounded-md shadow-xs">
                  {isMyClub ? 'Mi Tribu' : 'Tribu de Motos'}
                </span>
                {!isMyClub && (
                  <span className="text-[9px] text-stone-500 uppercase font-display font-bold bg-[#FAF8F5] px-1.5 py-0.5 border border-[#E5DFD5] rounded">
                    Privado
                  </span>
                )}
                <span className="text-[10px] text-stone-500 font-serif italic">
                  {groupInfo.participants.length} pilotos
                </span>
              </div>
              <h3 className="font-display font-black text-xl text-[#141312] uppercase tracking-wide mt-1">
                {displayCrewName}
              </h3>
              {groupInfo.rodadaTitle && (
                <p className="text-xs text-stone-500 font-serif italic truncate mt-0.5">
                  Salida: {groupInfo.rodadaTitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[#E5DFD5] hover:border-[#141312] text-stone-400 hover:text-[#141312] rounded-full transition shadow-xs bg-white"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PARTICIPANTS ROSTER */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 bg-white">
          <span className="text-[10px] text-stone-500 uppercase font-display font-bold tracking-wider block mb-1">
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
                  className={`p-3.5 border rounded-xl transition flex items-center justify-between gap-3 shadow-xs ${
                    isCurrentUser
                      ? 'bg-[#FAF8F5] border-[#141312] cursor-default'
                      : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] hover:border-stone-400 cursor-pointer group'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-full overflow-hidden border shrink-0 ${
                      isCurrentUser ? 'border-[#C84B31] ring-2 ring-[#C84B31]/30' : 'border-[#DDD7CB] group-hover:border-[#141312] transition'
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-display font-black text-[#141312] uppercase truncate">
                          {p.name}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[9px] uppercase font-display font-black text-[#C84B31] bg-white border border-[#DDD7CB] px-1.5 py-0.5 rounded">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 font-serif italic mt-0.5">
                        <span>{p.handle}</span>
                        {p.motoModel && (
                          <>
                            <span>•</span>
                            <span className="text-[#141312] font-semibold truncate flex items-center gap-1 font-sans">
                              <Bike className="w-3 h-3 text-[#C84B31] inline shrink-0" />
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
                          className={`text-[10px] font-display font-black uppercase tracking-wider px-3 py-1 rounded-full transition-all duration-150 flex items-center gap-1 shadow-xs cursor-pointer group/btn ${
                            isFollowingUser(p.userId)
                              ? 'bg-[#FAF8F5] hover:bg-[#E6332A] text-stone-600 hover:text-white border border-[#DDD7CB] hover:border-[#E6332A]'
                              : 'bg-[#141312] hover:bg-black text-white'
                          }`}
                          title={isFollowingUser(p.userId) ? 'Click para dejar de seguir' : 'Seguir a este piloto'}
                        >
                          {isFollowingUser(p.userId) ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600 group-hover/btn:hidden" />
                              <UserX className="w-3 h-3 text-white hidden group-hover/btn:inline-block" />
                              <span className="hidden xs:inline group-hover/btn:hidden">Siguiendo</span>
                              <span className="hidden xs:group-hover/btn:inline">Dejar de seguir</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 text-[#F2B705]" />
                              <span className="hidden xs:inline">Seguir</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-[#141312] transition">
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#141312] group-hover:translate-x-0.5 transition" />
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
          <div className="p-4 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between gap-3 shrink-0">
            {isMyClub && onEnterCrew ? (
              <>
                <span className="text-[11px] text-stone-500 font-serif italic">
                  Eres miembro activo de esta tribu
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onEnterCrew(groupInfo.crewId!);
                  }}
                  className="px-4 py-2 bg-[#141312] hover:bg-black text-white uppercase font-display font-black text-xs tracking-wider transition flex items-center gap-1.5 rounded-xl shadow-md"
                >
                  <span>Ver Mi Tribu</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F2B705]" />
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between text-stone-500 text-[11px]">
                <span className="flex items-center gap-1.5 font-serif italic">
                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                  Tribu Privada • Solo miembros autorizados
                </span>
                <span className="text-[10px] text-stone-400 uppercase font-display font-bold">
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
