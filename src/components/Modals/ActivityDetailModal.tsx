'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ActivityPost } from '../../types';
import { 
  X, 
  MapPin, 
  Clock, 
  Gauge, 
  Mountain, 
  Share2, 
  MessageSquare, 
  Navigation,
  Download,
  Layers,
  Send,
  Users,
  Bike,
  Bookmark,
  Trash2
} from 'lucide-react';
import { BikerSaluteIcon } from '../Icons/BikerSaluteIcon';
import { SaveToListModal } from './SaveToListModal';
import { ShareModal } from './ShareModal';
import { triggerExhaustSmoke } from '../../utils/exhaustSmoke';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface ActivityDetailModalProps {
  activity: ActivityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenPilotProfile: (pilotId: string) => void;
  onToggleSaludo: (activityId: string) => void;
  onAddComment: (activityId: string, text: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  onOpenPilotProfile,
  onToggleSaludo,
  onAddComment
}) => {
  const { currentUser, deleteActivity, savedRouteIds, routeLists, isFollowingUser, crews, users, motorcycles } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !activity || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Cleanup existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const coords = activity.coordinates && activity.coordinates.length > 0 
          ? activity.coordinates 
          : [[19.4100, -99.1900], [19.0600, -99.3100]];

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        });

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(map);
        L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(map);

        // Polyline of recorded GPS track
        const polyline = L.polyline(coords as [number, number][], {
          color: '#C84B31',
          weight: 4,
          opacity: 0.95,
          smoothFactor: 1
        }).addTo(map);

        // Start point
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div style="background-color: #10B981; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(16,185,129,0.8);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker(coords[0] as [number, number], { icon: startIcon }).addTo(map);

        // End point
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div style="background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker(coords[coords.length - 1] as [number, number], { icon: endIcon }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error loading leaflet in activity modal', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, activity]);

  if (!isOpen || !activity) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(activity.id, commentText);
    setCommentText('');
    confetti({ particleCount: 15, spread: 40 });
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleSaludoClick = (e: React.MouseEvent) => {
    onToggleSaludo(activity.id);
    triggerExhaustSmoke(e, { motoModel: activity.motoModel, discipline: activity.discipline });
  };

  const linkedCrew = activity.groupInfo?.crewId ? crews.find(c => c.id === activity.groupInfo!.crewId) : null;
  const resolvedCrewName = linkedCrew?.name || activity.groupInfo?.crewName;
  const existingMap = new Map((activity.groupInfo?.participants || []).map(p => [p.userId, p]));
  const resolvedParticipants = activity.groupInfo ? (linkedCrew ? linkedCrew.members.map(m => {
    const existing = existingMap.get(m.userId);
    const u = users.find(user => user.id === m.userId);
    const b = motorcycles.find(moto => moto.userId === m.userId);
    return {
      userId: m.userId,
      name: u?.name || existing?.name || m.userId,
      handle: u?.handle || existing?.handle || `@${m.userId}`,
      avatar: u?.avatar || existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: m.role || existing?.role || 'Rider',
      motoModel: b ? `${b.brand} ${b.model}` : (existing?.motoModel || 'Doble Propósito')
    };
  }) : activity.groupInfo.participants) : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="border-2 border-[#1A1918] bg-[#FAF6ED] max-w-2xl w-full my-auto max-h-[94vh] overflow-y-auto shadow-[8px_8px_0px_#1A1918] relative text-[#1A1918] font-sans flex flex-col rounded-[28px] animate-scaleUp">
        
        {/* Social Context Header ("Rodó con...") */}
        {(() => {
          const isDirectlyFollowed = isFollowingUser(activity.pilotId) || activity.pilotId === currentUser.id;
          const followedFriend = resolvedParticipants.find(
            p => p.userId !== activity.pilotId && (isFollowingUser(p.userId) || p.userId === currentUser.id)
          );

          if (!isDirectlyFollowed && followedFriend) {
            return (
              <div 
                onClick={() => {
                  onClose();
                  if (followedFriend.userId !== currentUser.id) {
                    onOpenPilotProfile(followedFriend.userId);
                  }
                }}
                className="px-5 py-2.5 bg-[#F4EEDB] border-b-2 border-[#1A1918] flex items-center justify-between text-xs hover:bg-[#EDE6D3] transition cursor-pointer rounded-t-[26px]"
                title={`Ver perfil de ${followedFriend.name}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden border-2 border-[#1A1918] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={followedFriend.avatar} alt={followedFriend.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="truncate text-[11px]">
                    <span className="text-[#1A1918] font-display font-black uppercase hover:underline">
                      {followedFriend.userId === currentUser.id ? 'Tú rodaste' : `${followedFriend.name} rodó`}
                    </span>
                    <span className="text-[#1A1918]/70 font-serif italic ml-1.5 font-medium">
                      en esta salida grupal con {activity.pilotName}
                    </span>
                  </p>
                </div>
                {activity.groupInfo && (
                  <span className="text-[9px] text-[#E6332A] font-mono font-black uppercase bg-[#FAF6ED] px-2 py-0.5 border border-[#1A1918] rounded shrink-0 hidden sm:inline-block shadow-[1px_1px_0px_#1A1918]">
                    {resolvedCrewName}
                  </span>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* HEADER BAR */}
        <div className="sticky top-0 bg-[#FAF6ED]/95 backdrop-blur-md border-b-2 border-[#1A1918] p-4 sm:p-5 flex items-center justify-between z-20 rounded-t-[26px]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div 
              onClick={() => {
                onClose();
                onOpenPilotProfile(activity.pilotId);
              }}
              className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer transition shrink-0 bg-[#F4EEDB]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activity.pilotAvatar} alt={activity.pilotName} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  onClick={() => {
                    onClose();
                    onOpenPilotProfile(activity.pilotId);
                  }}
                  className="font-display font-black text-base text-[#1A1918] hover:text-[#E6332A] cursor-pointer uppercase transition tracking-wide truncate"
                >
                  {activity.pilotName}
                </span>
                <span className="text-[9px] text-[#1A1918] bg-[#F7B32B] px-2 py-0.5 border-2 border-[#1A1918] font-mono font-black uppercase rounded-lg shadow-[1px_1px_0px_#1A1918]">
                  {activity.motoModel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#1A1918]/60 mt-0.5 font-mono">
                <span>{activity.dateText}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px] text-[#1A1918]/70 font-serif italic truncate">
                  <MapPin className="w-3 h-3 text-[#E06423] shrink-0" />
                  {activity.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className={`p-2.5 rounded-xl border-2 border-[#1A1918] transition flex items-center justify-center shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                (savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id)))
                  ? 'bg-[#F7B32B] text-[#1A1918]'
                  : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918]'
              }`}
              title={(savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id))) ? 'Guardada en tus listas' : 'Guardar ruta en tus listas'}
            >
              <Bookmark className={`w-4 h-4 ${(savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id))) ? 'fill-[#1A1918] text-[#1A1918]' : ''}`} />
            </button>

            {/* Botón Borrar (Solo quien la publicó) */}
            {(activity.pilotId === currentUser.id || activity.pilotName?.toLowerCase().trim() === currentUser.name?.toLowerCase().trim() || activity.pilotHandle === currentUser.handle) && (
              <button
                onClick={() => {
                  if (window.confirm(`¿Seguro que deseas eliminar la publicación "${activity.title}"? Esta acción no se puede deshacer.`)) {
                    deleteActivity(activity.id);
                    onClose();
                  }
                }}
                className="p-2.5 rounded-xl border-2 border-[#1A1918] hover:bg-[#E6332A] hover:text-white text-[#1A1918]/70 transition flex items-center justify-center bg-[#FAF6ED] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                title="Eliminar tu publicación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border-2 border-[#1A1918] hover:bg-[#E6332A] hover:text-white text-[#1A1918] transition flex items-center justify-center bg-[#FAF6ED] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              title="Cerrar detalle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* TITLE & DISCIPLINE */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white uppercase font-display font-black tracking-widest bg-[#E6332A] px-3 py-1 border-2 border-[#1A1918] rounded-lg shadow-[2px_2px_0px_#1A1918]">
                ★ {activity.discipline} ★
              </span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-wide leading-tight">
              {activity.title}
            </h2>
          </div>

          {/* INTERACTIVE ROUTE MAP */}
          <div className="relative border-2 border-[#1A1918] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#1A1918]">
            <div ref={mapContainerRef} className="w-full h-64 sm:h-80 z-0 bg-[#F4EEDB]" />
            <div className="absolute bottom-3 left-3 bg-[#FAF6ED]/95 backdrop-blur px-3 py-1.5 text-[10px] text-[#1A1918] uppercase font-mono font-black border-2 border-[#1A1918] rounded-xl flex items-center gap-3 z-10 shadow-[2px_2px_0px_#1A1918]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1A1918] inline-block"></span> Inicio</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] border border-[#1A1918] inline-block"></span> Fin</span>
            </div>
          </div>

          {/* PHOTO GALLERY OF THE RIDE */}
          {activity.photos && activity.photos.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-black tracking-widest block">
                  Capturas en Ruta ({activity.photos.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activity.photos.map((photo, pIdx) => (
                  <div key={pIdx} className="h-40 sm:h-48 overflow-hidden rounded-2xl border-2 border-[#1A1918] group/img relative bg-[#F4EEDB] shadow-[3px_3px_0px_#1A1918]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photo} 
                      alt={`Foto ${pIdx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TELEMETRY GAUGES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-black tracking-wider block">Distancia</span>
              <span className="font-mono font-black text-[#1A1918] text-lg sm:text-xl block">{activity.distanceKm} km</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-black tracking-wider block">Desnivel +</span>
              <span className="font-mono font-black text-[#E06423] text-lg sm:text-xl block">+{activity.elevationGainM} m</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-black tracking-wider block">Tiempo Rodando</span>
              <span className="font-mono font-black text-[#1A1918] text-lg sm:text-xl block">{activity.durationText}</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-black tracking-wider block">Velocidad Prom.</span>
              <span className="font-mono font-black text-[#1A1918] text-lg sm:text-xl block">{activity.avgSpeedKmh} km/h</span>
            </div>
          </div>

          {/* SURFACE & CURVES BREAKDOWN */}
          {activity.surfaceBreakdown && (
            <div className="p-4 sm:p-5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-3 shadow-[3px_3px_0px_#1A1918]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1A1918] uppercase text-[11px] font-mono font-black flex items-center gap-1.5 tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-[#E6332A]" />
                  Desglose de Superficie
                </span>
                <span className="text-[#1A1918] font-mono font-black text-xs uppercase bg-[#FAF6ED] px-2 py-0.5 border-2 border-[#1A1918] rounded-lg shadow-[1px_1px_0px_#1A1918]">
                  Curvas: {activity.surfaceBreakdown.curveDensity}
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-full overflow-hidden flex shadow-[1px_1px_0px_#1A1918]">
                <div 
                  className="bg-[#1A1918] h-full" 
                  style={{ width: `${activity.surfaceBreakdown.asphaltPercentage}%` }} 
                  title={`Asfalto: ${activity.surfaceBreakdown.asphaltPercentage}%`}
                />
                <div 
                  className="bg-[#F7B32B] h-full" 
                  style={{ width: `${activity.surfaceBreakdown.dirtPercentage}%` }} 
                  title={`Terracería: ${activity.surfaceBreakdown.dirtPercentage}%`}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1A1918]">
                <span>Asfalto: <strong className="font-black text-[#1A1918]">{activity.surfaceBreakdown.asphaltPercentage}%</strong></span>
                <span>Terracería / Brecha: <strong className="font-black text-[#E06423]">{activity.surfaceBreakdown.dirtPercentage}%</strong></span>
              </div>
            </div>
          )}

          {/* GROUP & PARTICIPANTS */}
          {activity.groupInfo && (
            <div className="p-4 sm:p-5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-3.5 shadow-[3px_3px_0px_#1A1918]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E6332A]" />
                  <span className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wide">
                    Rodada en Grupo: {resolvedCrewName?.replace(/MotoMami/gi, 'NAO')}
                  </span>
                </div>
                <span className="text-[10px] text-[#1A1918] font-mono font-black bg-[#FAF6ED] px-2.5 py-1 border-2 border-[#1A1918] rounded-xl shadow-[1px_1px_0px_#1A1918]">
                  {resolvedParticipants.length} pilotos
                </span>
              </div>

              {activity.groupInfo.rodadaTitle && (
                <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">
                  Salida: <span className="text-[#1A1918] font-sans font-bold not-italic">{activity.groupInfo.rodadaTitle}</span>
                </p>
              )}

              {/* Roster of participants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {resolvedParticipants.map((p) => {
                  const isMe = p.userId === currentUser.id;

                  return (
                    <div 
                      key={p.userId}
                      onClick={() => {
                        if (!isMe) {
                          onClose();
                          onOpenPilotProfile(p.userId);
                        }
                      }}
                      className={`p-3 border-2 border-[#1A1918] rounded-xl transition flex items-center justify-between gap-2.5 shadow-[2px_2px_0px_#1A1918] ${
                        isMe
                          ? 'bg-[#FAF6ED] cursor-default'
                          : 'bg-[#FAF6ED] hover:bg-[#FAF6ED] hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-xl object-cover border-2 border-[#1A1918] shrink-0 bg-[#F4EEDB]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-display font-black text-[#1A1918] uppercase truncate">
                              {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[8px] uppercase font-mono font-black text-[#E6332A] bg-[#FAF6ED] px-1.5 py-0.5 border border-[#E6332A] rounded">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#1A1918]/70 block truncate flex items-center gap-1 font-mono font-bold mt-0.5">
                            {p.motoModel && <Bike className="w-3 h-3 text-[#E06423] shrink-0 inline not-italic" />}
                            {p.motoModel || p.handle}
                          </span>
                        </div>
                      </div>
                      {!isMe ? (
                        <span className="text-[9px] text-[#1A1918] group-hover:text-[#E6332A] uppercase font-mono font-black shrink-0 px-2 py-1 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-lg shadow-[1px_1px_0px_#1A1918]">
                          Ver ↗
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS: SALUDO BIKER, COMPARTIR */}
          <div className="pt-2 border-t-2 border-[#1A1918] flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaludoClick}
              className={`flex-1 py-3.5 px-4 uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                activity.hasKudoed 
                  ? 'bg-[#E6332A] text-white' 
                  : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918]'
              }`}
            >
              <BikerSaluteIcon className="w-5 h-5" active={activity.hasKudoed} />
              <span>{activity.hasKudoed ? 'Saludado' : 'Saludo'}</span>
              <span className="text-xs font-mono font-black">({activity.kudosCount})</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3.5 px-6 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Share2 className="w-4 h-4 text-[#1A1918]" />
              <span>{copiedLink ? 'Enlace Copiado' : 'Compartir'}</span>
            </button>
          </div>

          {/* SALUDOS SOCIAL ROSTER */}
          <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl flex items-center justify-between text-xs shadow-[2px_2px_0px_#1A1918]">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                {activity.kudosAvatars.slice(0, 4).map((av, idx) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={idx} src={av} alt="saludo" className="w-7 h-7 rounded-full border-2 border-[#1A1918] object-cover bg-[#FAF6ED]" />
                ))}
              </div>
              <span className="text-xs text-[#1A1918] font-mono font-bold">
                {activity.kudosCount} {activity.kudosCount === 1 ? 'saludo recibido' : 'saludos recibidos'}
              </span>
            </div>
            <span className="text-[10px] text-[#E6332A] uppercase font-mono font-black tracking-wider bg-[#FAF6ED] px-2 py-0.5 border border-[#1A1918] rounded shadow-[1px_1px_0px_#1A1918]">
              Comunidad Activa
            </span>
          </div>

          {/* COMMENTS THREAD */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#1A1918] uppercase font-mono font-black tracking-wider">
              <MessageSquare className="w-4 h-4 text-[#E6332A]" />
              <span>Comentarios ({activity.commentsCount})</span>
            </div>

            {/* COMMENTS LIST */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {activity.comments && activity.comments.length > 0 ? (
                activity.comments.map((comm) => (
                  <div key={comm.id} className="p-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl flex items-start gap-3 shadow-[2px_2px_0px_#1A1918]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={comm.userAvatar} 
                      alt={comm.userName} 
                      className="w-8 h-8 rounded-xl object-cover border-2 border-[#1A1918] shrink-0 bg-[#F4EEDB]" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-display font-black text-[#1A1918] uppercase">{comm.userName}</span>
                        <span className="text-[10px] text-[#1A1918]/60 font-mono font-bold">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-[#1A1918] mt-1 font-sans font-medium leading-relaxed">
                        {comm.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl text-center text-xs text-[#1A1918]/70 font-serif italic font-medium shadow-[2px_2px_0px_#1A1918]">
                  Sé el primer piloto en comentar esta rodada.
                </div>
              )}
            </div>

            <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Escribe un comentario a ${activity.pilotName}...`}
                className="flex-1 bg-[#FAF6ED] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-sans font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white uppercase font-display font-black text-xs tracking-wider transition flex items-center gap-1.5 shrink-0 border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Enviar</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* MODAL: GUARDAR EN LISTAS */}
      <SaveToListModal
        isOpen={isSaveModalOpen}
        route={activity}
        onClose={() => setIsSaveModalOpen(false)}
      />

      {/* MODAL: COMPARTIR RODADA */}
      <ShareModal
        isOpen={isShareModalOpen}
        item={activity ? {
          id: activity.id,
          title: activity.title,
          pilotName: activity.pilotName,
          distanceKm: activity.distanceKm,
          motoModel: activity.motoModel,
          discipline: activity.discipline,
          coverImage: activity.photos && activity.photos.length > 0 ? activity.photos[0] : undefined,
          type: 'activity'
        } : null}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
