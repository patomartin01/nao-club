'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, FollowRequest } from '../../types';
import { 
  X, 
  Users, 
  UserCheck, 
  UserPlus, 
  UserX,
  Check, 
  Clock, 
  MapPin, 
  Bike, 
  Search,
  Bell
} from 'lucide-react';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following' | 'requests';
  targetUser?: User | null; // Si se pasa otro usuario (por ej. desde PilotProfileModal), inspeccionamos los suyos
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'followers',
  targetUser = null
}) => {
  const {
    currentUser,
    users,
    motorcycles,
    followingUserIds,
    followersUserIds,
    toggleFollowUser,
    isFollowingUser,
    requestToFollowUser,
    isFollowRequested,
    pendingFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    openPilotProfileById,
    allFollows
  } = useApp();

  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'requests'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Sincronizar tab si cambia initialTab al abrir
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isCurrentUsersOwnProfile = !targetUser || targetUser.id === currentUser.id;
  const inspectedUser = targetUser || currentUser;

  // Seguidores del usuario inspeccionado
  const inspectedFollowersIds = isCurrentUsersOwnProfile
    ? followersUserIds
    : [
        ...allFollows.filter(f => f.following_id === inspectedUser.id).map(f => f.follower_id),
        // Si el usuario logueado lo sigue localmente
        ...(followingUserIds.includes(inspectedUser.id) ? [currentUser.id] : [])
      ];

  // Siguiendo del usuario inspeccionado
  const inspectedFollowingIds = isCurrentUsersOwnProfile
    ? followingUserIds
    : allFollows.filter(f => f.follower_id === inspectedUser.id).map(f => f.following_id);

  // Resolver usuarios reales y existentes en la base de datos
  const validFollowersUsers = Array.from(new Set(inspectedFollowersIds))
    .map(id => users.find(u => u.id === id) || (id === currentUser.id ? currentUser : null))
    .filter((u): u is User => u !== null && u !== undefined);

  const validFollowingUsers = Array.from(new Set(inspectedFollowingIds))
    .map(id => users.find(u => u.id === id) || (id === currentUser.id ? currentUser : null))
    .filter((u): u is User => u !== null && u !== undefined);

  // Resolver lista de pilotos en función de la pestaña activa
  let displayUsers: User[] = [];
  if (activeTab === 'followers') {
    displayUsers = validFollowersUsers;
  } else if (activeTab === 'following') {
    displayUsers = validFollowingUsers;
  }

  // Filtrado por buscador
  const filteredUsers = displayUsers.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q))
    );
  });

  const filteredRequests = pendingFollowRequests.filter(req => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.fromUserName.toLowerCase().includes(q) ||
      req.fromUserHandle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-lg rounded-[28px] overflow-hidden text-[#1A1918] shadow-[8px_8px_0px_#1A1918] flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#F4EEDB] border-b-2 border-[#1A1918] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#E6332A] bg-[#FAF6ED] px-2.5 py-1 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-lg shrink-0">
              COMUNIDAD
            </span>
            <h2 className="font-display font-black text-sm sm:text-base uppercase tracking-wide truncate">
              {isCurrentUsersOwnProfile ? 'Tus Conexiones' : `Conexiones de ${inspectedUser.name}`}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] flex items-center justify-center hover:bg-[#E6332A] hover:text-white transition shrink-0 shadow-[2px_2px_0px_#1A1918]"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="grid grid-cols-3 border-b-2 border-[#1A1918] bg-[#EDE6D3] text-xs font-display font-black uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition border-r-2 border-[#1A1918] ${
              activeTab === 'followers'
                ? 'bg-[#FAF6ED] text-[#E6332A] border-b-2 border-b-transparent shadow-[inset_0_-2px_0_#E6332A]'
                : 'text-[#1A1918]/70 hover:bg-[#FAF6ED]/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">Seguidores</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#1A1918]/10">
              {validFollowersUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 transition ${
              isCurrentUsersOwnProfile ? 'border-r-2 border-[#1A1918]' : ''
            } ${
              activeTab === 'following'
                ? 'bg-[#FAF6ED] text-[#E6332A] border-b-2 border-b-transparent shadow-[inset_0_-2px_0_#E6332A]'
                : 'text-[#1A1918]/70 hover:bg-[#FAF6ED]/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="truncate">Siguiendo</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#1A1918]/10">
              {validFollowingUsers.length}
            </span>
          </button>

          {isCurrentUsersOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 transition relative ${
                activeTab === 'requests'
                  ? 'bg-[#FAF6ED] text-[#E6332A] border-b-2 border-b-transparent shadow-[inset_0_-2px_0_#E6332A]'
                  : 'text-[#1A1918]/70 hover:bg-[#FAF6ED]/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="truncate">Solicitudes</span>
              {pendingFollowRequests.length > 0 && (
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-[#E6332A] text-white font-bold animate-pulse">
                  {pendingFollowRequests.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="p-3 border-b-2 border-[#1A1918] bg-[#FAF6ED]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1918]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, @handle o ubicación..."
              className="w-full pl-9 pr-3 py-2 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl text-xs font-sans text-[#1A1918] placeholder:text-[#1A1918]/40 focus:outline-none focus:border-[#E6332A] transition"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {/* TAB: REQUESTS */}
          {activeTab === 'requests' && (
            <>
              {filteredRequests.length === 0 ? (
                <div className="py-12 text-center text-[#1A1918]/60 font-serif italic text-xs">
                  {searchQuery ? 'No hay solicitudes que coincidan con la búsqueda.' : 'No tienes solicitudes de seguimiento pendientes.'}
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918]"
                  >
                    <div 
                      onClick={() => {
                        onClose();
                        openPilotProfileById(req.fromUserId);
                      }}
                      className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                      title="Ver perfil de este piloto"
                    >
                      <img
                        src={req.fromUserAvatar}
                        alt={req.fromUserName}
                        className="w-10 h-10 rounded-xl object-cover border-2 border-[#1A1918] shrink-0 group-hover:scale-105 transition bg-[#FAF6ED]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-display font-black text-[#1A1918] truncate group-hover:text-[#E6332A] transition">
                          {req.fromUserName}
                        </p>
                        <p className="text-[11px] font-mono text-[#E6332A] font-bold truncate">
                          {req.fromUserHandle}
                        </p>
                        <p className="text-[10px] text-[#1A1918]/60 font-serif italic">
                          Quiere seguir tu actividad y rodadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => acceptFollowRequest(req.id)}
                        className="px-3 py-1.5 bg-[#1A1918] hover:bg-[#E6332A] text-white text-[10px] font-display font-black uppercase rounded-xl border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] flex items-center gap-1 transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        title="Aceptar como seguidor"
                      >
                        <Check className="w-3 h-3 text-[#F7B32B]" />
                        <span>Aceptar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectFollowRequest(req.id)}
                        className="p-1.5 hover:bg-[#FAF6ED] text-[#1A1918]/60 hover:text-[#E6332A] rounded-xl transition border border-transparent hover:border-[#1A1918] cursor-pointer"
                        title="Rechazar solicitud"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* TAB: FOLLOWERS & FOLLOWING */}
          {activeTab !== 'requests' && (
            <>
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-[#1A1918]/60 font-serif italic text-xs">
                  {searchQuery 
                    ? 'No se encontraron pilotos con ese criterio.' 
                    : activeTab === 'followers'
                    ? 'Aún no tienes seguidores. Comparte tu enlace de perfil con otros pilotos para conectar.'
                    : 'Aún no sigues a ningún piloto. Explora la comunidad y tribus para seguir a otros moteros.'}
                </div>
              ) : (
                filteredUsers.map((pilot) => {
                  const pilotBikes = motorcycles.filter(m => m.userId === pilot.id);
                  const isFollowing = isFollowingUser(pilot.id);
                  const isRequested = isFollowRequested(pilot.id);
                  const isSelf = pilot.id === currentUser.id;

                  return (
                    <div
                      key={pilot.id}
                      className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] hover:border-[#E6332A] transition"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          openPilotProfileById(pilot.id);
                        }}
                        className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                        title="Ver credencial de piloto"
                      >
                        <img
                          src={pilot.avatar}
                          alt={pilot.name}
                          className="w-11 h-11 rounded-xl object-cover border-2 border-[#1A1918] shrink-0 group-hover:scale-105 transition bg-[#FAF6ED]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-display font-black text-[#1A1918] truncate group-hover:text-[#E6332A] transition">
                            {pilot.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#1A1918]/70 flex-wrap">
                            <span className="font-mono text-[#E6332A] font-bold">{pilot.handle}</span>
                            {pilot.location && (
                              <>
                                <span>•</span>
                                <span className="font-serif italic truncate flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-[#E06423]" />
                                  {pilot.location}
                                </span>
                              </>
                            )}
                          </div>
                          {pilotBikes.length > 0 && (
                            <p className="text-[9px] font-mono font-bold text-[#1A1918]/60 mt-0.5 flex items-center gap-1 truncate">
                              <Bike className="w-2.5 h-2.5 text-[#1A1918]" />
                              {pilotBikes[0].brand} {pilotBikes[0].model}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      {!isSelf && (
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isFollowing) {
                                toggleFollowUser(pilot.id);
                              } else {
                                requestToFollowUser(pilot.id);
                              }
                            }}
                            className={`px-3 py-1.5 text-[10px] font-display font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1 rounded-xl border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer group ${
                              isFollowing
                                ? 'bg-[#FAF6ED] hover:bg-[#E6332A] text-[#1A1918] hover:text-white'
                                : isRequested
                                ? 'bg-[#F7B32B] text-[#1A1918]'
                                : 'bg-[#E6332A] hover:bg-[#c92820] text-white'
                            }`}
                            title={
                              isFollowing
                                ? 'Click para dejar de seguir a este piloto'
                                : isRequested
                                ? 'Cancelar solicitud de seguimiento'
                                : 'Seguir a este piloto'
                            }
                          >
                            {isFollowing ? (
                              <>
                                <Check className="w-3 h-3 text-[#1A1918] group-hover:hidden" />
                                <UserX className="w-3 h-3 text-white hidden group-hover:inline-block" />
                                <span className="group-hover:hidden">Siguiendo</span>
                                <span className="hidden group-hover:inline">Dejar de seguir</span>
                              </>
                            ) : isRequested ? (
                              <>
                                <Clock className="w-3 h-3 text-[#1A1918]" />
                                <span>Solicitado</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Seguir</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
