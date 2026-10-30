'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NaoBrandmark } from './Brand/NaoBrandmark';
import { Bell, Check, X, UserPlus, Users, Search } from 'lucide-react';
import { SearchPilotsModal } from './Modals/SearchPilotsModal';

interface NavbarProps {
  onOpenCreateRodada?: () => void;
  onOpenProposeRoute?: () => void;
  onOpenJoinCrew?: () => void;
  onOpenCreateCrew?: () => void;
  onOpenRecordRoute?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    setActiveNavTab,
    currentUser,
    setAuthModalOpen,
    pendingFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    openPilotProfileById,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    enterCrew,
    setSelectedRoute,
    routeProposals
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const totalPendingBadge = pendingFollowRequests.length + unreadNotificationsCount;

  const handleRouteNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    setShowNotifications(false);
    if (notif.crewId) {
      enterCrew(notif.crewId);
    }
    if (notif.routeId) {
      const targetRoute = routeProposals.find(r => r.id === notif.routeId);
      if (targetRoute) {
        setSelectedRoute(targetRoute);
      }
    }
    setActiveNavTab('tribus');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF6ED]/95 backdrop-blur-md border-b-2 border-[#1A1918] select-none pt-[env(safe-area-inset-top,0px)] shadow-[0_2px_10px_rgba(26,25,24,0.06)]">
      <div className="w-full max-w-[1520px] mx-auto flex items-center justify-between px-3 sm:px-6 py-2.5 min-h-[60px] relative">
        
        {/* Left spacer to keep center logo perfectly balanced */}
        <div className="flex items-center gap-2 w-12" />

        {/* Center: NAO Wordmark (Absolute Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <NaoBrandmark 
            size="md"
            onClick={() => setActiveNavTab('inicio')} 
          />
        </div>

        {/* Right: Notifications & Auth Quick Access */}
        <div className="flex items-center gap-2">
          {/* Notifications Bell for Follower Requests, Routes & Activity */}
          {currentUser.id !== 'guest' && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl border-2 border-[#1A1918] transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  showNotifications ? 'bg-[#F7B32B]' : 'bg-[#FAF6ED] hover:bg-[#F4EEDB]'
                }`}
                title="Notificaciones y Solicitudes"
              >
                <Bell className="w-4 h-4 text-[#1A1918]" />
                {totalPendingBadge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#E6332A] text-white text-[10px] font-mono font-bold flex items-center justify-center rounded-full border border-[#1A1918] animate-pulse">
                    {totalPendingBadge}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl shadow-[6px_6px_0px_#1A1918] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#1A1918]">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#E6332A]" />
                      <span className="text-xs font-display font-black uppercase tracking-wider text-[#1A1918]">
                        Notificaciones
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {unreadNotificationsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllNotificationsAsRead()}
                          className="text-[9px] font-mono font-bold uppercase text-[#1A1918]/60 hover:text-[#E6332A] transition"
                        >
                          Leídas
                        </button>
                      )}
                      {totalPendingBadge > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-[#E6332A] text-white px-2 py-0.5 rounded-full border border-[#1A1918]">
                          {totalPendingBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {pendingFollowRequests.length === 0 && notifications.length === 0 ? (
                    <div className="py-6 text-center text-[#1A1918]/60 font-serif italic text-xs">
                      No tienes notificaciones ni solicitudes pendientes por ahora.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {/* Solicitudes de seguimiento */}
                      {pendingFollowRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918]"
                        >
                          <div
                            onClick={() => {
                              setShowNotifications(false);
                              openPilotProfileById(req.fromUserId);
                            }}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                            title="Ver perfil del piloto"
                          >
                            <img
                              src={req.fromUserAvatar}
                              alt={req.fromUserName}
                              className="w-8 h-8 rounded-full object-cover border border-[#1A1918] shrink-0 group-hover:scale-105 transition"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-display font-black text-[#1A1918] truncate group-hover:text-[#E6332A] transition">
                                {req.fromUserName}
                              </p>
                              <p className="text-[10px] font-mono text-[#1A1918]/70 truncate">
                                {req.fromUserHandle} te envió solicitud
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => acceptFollowRequest(req.id)}
                              className="px-2.5 py-1 bg-[#1A1918] hover:bg-[#E6332A] text-white text-[10px] font-display font-black uppercase rounded-lg border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] flex items-center gap-1 transition"
                              title="Aceptar seguidor"
                            >
                              <Check className="w-3 h-3 text-[#F7B32B]" />
                              <span>Aceptar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectFollowRequest(req.id)}
                              className="p-1 hover:bg-[#FAF6ED] text-[#1A1918]/70 hover:text-[#E6332A] rounded-lg transition"
                              title="Rechazar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Notificaciones de rutas publicadas en grupos */}
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 border-2 border-[#1A1918] rounded-xl flex items-start justify-between gap-2.5 shadow-[2px_2px_0px_#1A1918] transition ${
                            notif.read ? 'bg-[#FAF6ED] opacity-80' : 'bg-[#F4EEDB]'
                          }`}
                        >
                          <div
                            onClick={() => handleRouteNotificationClick(notif)}
                            className="flex items-start gap-2.5 min-w-0 cursor-pointer group flex-1"
                            title="Ver ruta en el grupo"
                          >
                            <div className="relative shrink-0 mt-0.5">
                              <img
                                src={notif.fromUserAvatar}
                                alt={notif.fromUserName}
                                className="w-8 h-8 rounded-full object-cover border border-[#1A1918]"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E6332A] text-white rounded-full flex items-center justify-center border border-[#1A1918] text-[8px]">
                                📍
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-display font-black text-[#1A1918] group-hover:text-[#E6332A] transition">
                                  {notif.title}
                                </span>
                                {notif.crewName && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#FAF6ED] border border-[#1A1918] rounded text-[#1A1918]/80">
                                    {notif.crewName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-sans text-[#1A1918]/90 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <span className="text-[9px] font-mono text-[#1A1918]/50 block mt-1">
                                Toca para ver en Tribus →
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notif.id);
                            }}
                            className="p-1 hover:bg-[#FAF6ED] text-[#1A1918]/40 hover:text-[#E6332A] rounded-lg transition shrink-0"
                            title="Eliminar notificación"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Search magnifying glass to discover and follow pilots (Instagram-style) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title="Buscar pilotos para seguir"
          >
            <Search className="w-4 h-4 text-[#1A1918]" />
          </button>
        </div>

      </div>

      {/* Modal para buscar perfiles y darles seguir */}
      <SearchPilotsModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};
