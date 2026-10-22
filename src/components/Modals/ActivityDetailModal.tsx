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
  Bookmark
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
  const { currentUser, savedRouteIds, routeLists, isFollowingUser, crews, users, motorcycles } = useApp();
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
          color: '#C87D55',
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

        // Finish point
        const finishIcon = L.divIcon({
          className: 'custom-finish-marker',
          html: `<div style="background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker(coords[coords.length - 1] as [number, number], { icon: finishIcon }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Leaflet detail map init error:', err);
      }
    };

    const timer = setTimeout(() => {
      initMap();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
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
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="border border-white/20 bg-[#0E0D0C] max-w-2xl w-full my-auto max-h-[94vh] overflow-y-auto shadow-2xl relative text-chalk font-mono flex flex-col">
        
        {/* Social Context Header - Estilo Strava ("Rodó con...") */}
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
                  if (followedFriend.userId === currentUser.id) {
                    // Open own profile or keep
                  } else {
                    onOpenPilotProfile(followedFriend.userId);
                  }
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-earth/20 via-white/[0.04] to-black/40 border-b border-white/10 flex items-center justify-between text-xs hover:bg-earth/25 transition cursor-pointer"
                title={`Ver perfil de ${followedFriend.name}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-earth shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={followedFriend.avatar} alt={followedFriend.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="truncate text-[11px]">
                    <span className="text-white font-bold hover:underline">
                      {followedFriend.userId === currentUser.id ? 'Tú rodaste' : `${followedFriend.name} rodó`}
                    </span>
                    <span className="text-ash ml-1.5">
                      en esta salida grupal con {activity.pilotName}
                    </span>
                  </p>
                </div>
                {activity.groupInfo && (
                  <span className="text-[9px] text-earth font-mono uppercase bg-earth/10 px-2 py-0.5 border border-earth/25 shrink-0 hidden sm:inline-block">
                    {resolvedCrewName}
                  </span>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* HEADER BAR */}
        <div className="sticky top-0 bg-[#0E0D0C]/95 backdrop-blur border-b border-white/10 p-4 sm:p-5 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => {
                onClose();
                onOpenPilotProfile(activity.pilotId);
              }}
              className="w-12 h-12 rounded-full overflow-hidden border border-white/20 hover:border-earth cursor-pointer transition shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activity.pilotAvatar} alt={activity.pilotName} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  onClick={() => {
                    onClose();
                    onOpenPilotProfile(activity.pilotId);
                  }}
                  className="font-display font-extrabold text-base text-white hover:text-earth cursor-pointer uppercase transition"
                >
                  {activity.pilotName}
                </span>
                <span className="text-[10px] text-earth bg-earth/10 px-2 py-0.5 border border-earth/20 font-bold uppercase">
                  {activity.motoModel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-ash mt-0.5">
                <span>{activity.dateText}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-earth" />
                  {activity.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className={`p-1.5 border transition flex items-center justify-center ${
                (savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id)))
                  ? 'border-earth bg-earth/20 text-earth shadow-[0_0_12px_rgba(200,125,85,0.3)]'
                  : 'border-white/15 hover:border-white text-ash hover:text-white bg-white/[0.02]'
              }`}
              title={(savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id))) ? 'Guardada en tus listas' : 'Guardar ruta en tus listas'}
            >
              <Bookmark className={`w-5 h-5 ${(savedRouteIds.includes(activity.id) || routeLists.some(l => l.routeIds.includes(activity.id))) ? 'fill-earth text-earth' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 border border-white/15 hover:border-white text-ash hover:text-white transition flex items-center justify-center bg-white/[0.02]"
              title="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* TITLE & DISCIPLINE */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-earth uppercase font-bold tracking-widest bg-earth/10 px-2 py-0.5 border border-earth/20">
                {activity.discipline}
              </span>
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
              {activity.title}
            </h2>
          </div>

          {/* INTERACTIVE ROUTE MAP */}
          <div className="relative border border-white/15 bg-[#060709] overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-64 sm:h-80 z-0" />
            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur px-2.5 py-1 text-[9px] text-ash uppercase font-mono border border-white/10 flex items-center gap-2 z-10">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Inicio</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Fin</span>
            </div>
          </div>

          {/* PHOTO GALLERY OF THE RIDE */}
          {activity.photos && activity.photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-earth uppercase font-bold tracking-widest font-mono block">
                  [ FOTOGRAFÍAS DE LA RODADA ({activity.photos.length}) ]
                </span>
                <span className="text-[10px] text-ash font-mono">
                  Capturas en ruta
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activity.photos.map((photo, pIdx) => (
                  <div key={pIdx} className="h-40 sm:h-48 overflow-hidden border border-white/10 group/img relative bg-black">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
            <div className="p-3 bg-white/[0.02] border border-white/10 space-y-0.5">
              <span className="text-[9px] text-ash uppercase tracking-wider block">Distancia</span>
              <span className="font-bold text-white text-base sm:text-lg">{activity.distanceKm} km</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/10 space-y-0.5">
              <span className="text-[9px] text-ash uppercase tracking-wider block">Desnivel +</span>
              <span className="font-bold text-earth text-base sm:text-lg">+{activity.elevationGainM} m</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/10 space-y-0.5">
              <span className="text-[9px] text-ash uppercase tracking-wider block">Tiempo Rodando</span>
              <span className="font-bold text-white text-base sm:text-lg">{activity.durationText}</span>
            </div>
            <div className="p-3 bg-white/[0.02] border border-white/10 space-y-0.5">
              <span className="text-[9px] text-ash uppercase tracking-wider block">Velocidad Prom.</span>
              <span className="font-bold text-white text-base sm:text-lg">{activity.avgSpeedKmh} km/h</span>
            </div>
          </div>

          {/* SURFACE & CURVES BREAKDOWN */}
          {activity.surfaceBreakdown && (
            <div className="p-4 bg-white/[0.02] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ash uppercase text-[10px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-earth" />
                  Desglose de Superficie
                </span>
                <span className="text-chalk font-bold">
                  Curvas: {activity.surfaceBreakdown.curveDensity}
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 overflow-hidden flex">
                <div 
                  className="bg-white/60 h-full" 
                  style={{ width: `${activity.surfaceBreakdown.asphaltPercentage}%` }} 
                  title={`Asfalto: ${activity.surfaceBreakdown.asphaltPercentage}%`}
                />
                <div 
                  className="bg-earth h-full" 
                  style={{ width: `${activity.surfaceBreakdown.dirtPercentage}%` }} 
                  title={`Terracería: ${activity.surfaceBreakdown.dirtPercentage}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-ash">
                <span>Asfalto: {activity.surfaceBreakdown.asphaltPercentage}%</span>
                <span>Terracería / Brecha: {activity.surfaceBreakdown.dirtPercentage}%</span>
              </div>
            </div>
          )}

          {/* GROUP & PARTICIPANTS (IF RECORDED WITH A GROUP) */}
          {activity.groupInfo && (
            <div className="p-4 bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-earth" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Rodada en Grupo: {resolvedCrewName}
                  </span>
                </div>
                <span className="text-[10px] text-earth font-mono font-bold bg-earth/10 px-2 py-0.5 border border-earth/20">
                  {resolvedParticipants.length} pilotos
                </span>
              </div>

              {activity.groupInfo.rodadaTitle && (
                <p className="text-[11px] text-ash">
                  Salida: <span className="text-chalk font-medium">{activity.groupInfo.rodadaTitle}</span>
                </p>
              )}

              {/* Roster of participants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
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
                      className={`p-2.5 border transition flex items-center justify-between gap-2.5 ${
                        isMe
                          ? 'bg-earth/[0.04] border-earth/25 cursor-default'
                          : 'bg-black/40 hover:bg-white/[0.05] border-white/10 hover:border-earth/40 cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className={`w-9 h-9 rounded-full object-cover border shrink-0 ${
                            isMe ? 'border-earth' : 'border-white/20 group-hover:border-earth transition'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-white group-hover:text-earth transition'}`}>
                              {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[8px] uppercase font-bold text-earth bg-earth/20 px-1 py-0.2 border border-earth/40">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-ash block truncate flex items-center gap-1">
                            {p.motoModel && <Bike className="w-3 h-3 text-earth shrink-0 inline" />}
                            {p.motoModel || p.handle}
                          </span>
                        </div>
                      </div>
                      {!isMe ? (
                        <span className="text-[9px] text-ash group-hover:text-white uppercase font-mono shrink-0">
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
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaludoClick}
              className={`flex-1 py-3 px-4 uppercase font-bold text-xs tracking-wider transition flex items-center justify-center gap-2.5 touch-manipulation active:scale-95 border ${
                activity.hasKudoed 
                  ? 'bg-earth text-white border-earth shadow-[0_0_15px_rgba(200,125,85,0.4)]' 
                  : 'bg-white/[0.04] text-white border-white/20 hover:border-earth hover:text-earth'
              }`}
            >
              <BikerSaluteIcon className="w-5 h-5" active={activity.hasKudoed} />
              <span>{activity.hasKudoed ? 'Saludado' : 'Saludo'}</span>
              <span className="text-[11px] opacity-80">({activity.kudosCount})</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-5 border border-white/20 hover:border-white text-ash hover:text-white uppercase font-bold text-xs tracking-wider transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Enlace Copiado' : 'Compartir'}</span>
            </button>
          </div>

          {/* SALUDOS SOCIAL ROSTER */}
          <div className="p-3 bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {activity.kudosAvatars.slice(0, 4).map((av, idx) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={idx} src={av} alt="saludo" className="w-6 h-6 rounded-full border border-black object-cover" />
                ))}
              </div>
              <span className="text-[11px] text-ash">
                {activity.kudosCount} {activity.kudosCount === 1 ? 'saludo biker recibido' : 'saludos bikers recibidos'}
              </span>
            </div>
            <span className="text-[10px] text-earth uppercase font-bold">
              Comunidad Activa
            </span>
          </div>

          {/* COMMENTS THREAD */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-white uppercase font-bold tracking-wider">
              <MessageSquare className="w-4 h-4 text-earth" />
              <span>Comentarios ({activity.commentsCount})</span>
            </div>

            {/* COMMENTS LIST */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {activity.comments && activity.comments.length > 0 ? (
                activity.comments.map((comm) => (
                  <div key={comm.id} className="p-3 bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={comm.userAvatar} 
                      alt={comm.userName} 
                      className="w-8 h-8 rounded-full object-cover border border-white/15 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white uppercase">{comm.userName}</span>
                        <span className="text-[10px] text-ash font-mono">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-chalk/90 mt-1 font-sans leading-relaxed">
                        {comm.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white/[0.02] border border-white/10 text-center text-xs text-ash">
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
                className="flex-1 bg-white/[0.04] border border-white/15 px-3 py-2.5 text-white text-xs focus:outline-none focus:border-earth font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-earth hover:bg-earth-bright text-white uppercase font-bold text-xs tracking-wider transition flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
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
