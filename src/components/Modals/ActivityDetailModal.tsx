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
  Map as MapIcon,
  Compass,
  Send,
  Users,
  Bike,
  Bookmark,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { BikerSaluteIcon } from '../Icons/BikerSaluteIcon';
import { SaveToListModal } from './SaveToListModal';
import { ShareModal } from './ShareModal';
import { triggerExhaustSmoke } from '../../utils/exhaustSmoke';
import { useApp } from '../../context/AppContext';
import { buildActivityGoogleMapsUrl } from '../../utils/googleMaps';
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
  const { currentUser, deleteActivity, savedRouteIds, routeLists, isFollowingUser, crews, users, motorcycles, routeProposals } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [mapLayer, setMapLayer] = useState<'hybrid' | 'roadmap'>('hybrid');
  const [commentText, setCommentText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Link waypoints from activity or matching route proposal
  const linkedRoute = activity ? routeProposals.find(r => r.id === activity.routeProposalId || r.title === activity.title) : null;
  const effectiveWaypoints = (activity?.waypoints && activity.waypoints.length > 0)
    ? activity.waypoints
    : (linkedRoute?.waypoints || []);

  const googleMapsNavUrl = activity ? buildActivityGoogleMapsUrl({
    ...activity,
    waypoints: effectiveWaypoints
  }) : 'https://maps.google.com';

  // Toggle map tiles dynamically when mapLayer switches
  useEffect(() => {
    if (tileLayerRef.current) {
      const tileUrl = mapLayer === 'hybrid'
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [mapLayer]);

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
          tileLayerRef.current = null;
        }

        const coords = activity.coordinates && activity.coordinates.length > 0 
          ? activity.coordinates 
          : [[19.4100, -99.1900], [19.0600, -99.3100]];

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        });

        // High-definition Google Maps Satellite Hybrid or Road Network Layer
        const tileUrl = mapLayer === 'hybrid'
          ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
          : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

        const tileLayer = L.tileLayer(tileUrl, {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Polyline of recorded GPS track
        const polyline = L.polyline(coords as [number, number][], {
          color: '#E6332A',
          weight: 4.5,
          opacity: 0.95,
          smoothFactor: 1
        }).addTo(map);

        // Render recorded Waypoints & Stops if present
        if (effectiveWaypoints && effectiveWaypoints.length > 0) {
          effectiveWaypoints.forEach((wp, idx) => {
            if (!wp.lat || !wp.lng) return;
            const isFirst = idx === 0;
            const isLast = idx === effectiveWaypoints.length - 1;

            let bg = '#F7B32B';
            let emoji = '📍';
            if (wp.type === 'start' || isFirst) {
              bg = '#10B981';
              emoji = '🟢';
            } else if (wp.type === 'end' || isLast) {
              bg = '#EF4444';
              emoji = '🏁';
            } else if (wp.type === 'fuel') {
              bg = '#E06423';
              emoji = '⛽';
            } else if (wp.type === 'scenic') {
              bg = '#3B82F6';
              emoji = '📸';
            } else if (wp.type === 'food') {
              bg = '#10B981';
              emoji = '☕';
            } else if (wp.type === 'camp') {
              bg = '#8B5CF6';
              emoji = '⛺';
            } else if (wp.type === 'dirt') {
              bg = '#D97706';
              emoji = '🏔️';
            } else {
              bg = '#DC2626';
              emoji = '⚠️';
            }

            const wpIcon = L.divIcon({
              className: 'custom-wp-marker',
              html: `
                <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; cursor: pointer;">
                  <div style="background-color: ${bg}; color: #FFFFFF; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid #FAF6ED; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 13px;">
                    ${emoji}
                  </div>
                  <div style="position: absolute; top: -5px; right: -5px; background-color: #1A1918; color: #FAF6ED; width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #FAF6ED; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; font-family: monospace;">
                    ${idx + 1}
                  </div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            });

            const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon }).addTo(map);

            const singleGmapsUrl = `https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`;
            const popupHtml = `
              <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 180px; color: #1A1918;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
                  <span style="font-size: 9px; font-family: monospace; font-weight: 800; text-transform: uppercase; background: #FAF6ED; border: 1px solid rgba(26,25,24,0.15); padding: 2px 6px; border-radius: 4px; color: #E6332A;">
                    Parada #${idx + 1}
                  </span>
                  <span style="font-size: 9px; font-family: monospace; font-weight: 700; text-transform: uppercase; color: #666;">
                    ${wp.type}
                  </span>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #1A1918; margin-bottom: 4px; line-height: 1.2;">
                  ${wp.name}
                </div>
                ${wp.notes ? `<div style="font-size: 11px; color: #444; background: #F4EEDB; border-radius: 6px; padding: 4px 6px; margin-bottom: 6px; line-height: 1.3;">${wp.notes}</div>` : ''}
                <div style="font-size: 9px; font-family: monospace; color: #888; margin-bottom: 6px;">
                  GPS: ${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}
                </div>
                <a href="${singleGmapsUrl}" target="_blank" rel="noopener noreferrer" style="display: block; text-align: center; background: #1A1918; color: #FAF6ED; padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-decoration: none;">
                  Ver punto en Google Maps ↗
                </a>
              </div>
            `;
            marker.bindPopup(popupHtml, { maxWidth: 260 });
          });
        } else {
          // Fallback start & end point dots
          const startIcon = L.divIcon({
            className: 'custom-start-marker',
            html: `<div style="background-color: #10B981; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(16,185,129,0.9);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          L.marker(coords[0] as [number, number], { icon: startIcon }).addTo(map);

          const endIcon = L.divIcon({
            className: 'custom-end-marker',
            html: `<div style="background-color: #EF4444; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px rgba(239,68,68,0.9);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
          });
          L.marker(coords[coords.length - 1] as [number, number], { icon: endIcon }).addTo(map);
        }

        map.fitBounds(polyline.getBounds(), { padding: [35, 35] });
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
        tileLayerRef.current = null;
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
  }) : (activity.groupInfo.participants || [])) : [];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="border border-[#1A1918]/10 bg-[#FAF6ED] max-w-2xl w-full my-auto max-h-[94vh] overflow-y-auto shadow-sm relative text-[#1A1918] font-sans flex flex-col rounded-[28px] animate-scaleUp">
        
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
                className="px-5 py-2.5 bg-[#F4EEDB] border-b border-[#1A1918]/10 flex items-center justify-between text-xs hover:bg-[#EDE6D3] transition cursor-pointer rounded-t-[26px]"
                title={`Ver perfil de ${followedFriend.name}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-[#1A1918]/10 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={followedFriend.avatar} alt={followedFriend.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="truncate text-[11px]">
                    <span className="text-[#1A1918] font-sans font-semibold hover:underline">
                      {followedFriend.userId === currentUser.id ? 'Tú rodaste' : `${followedFriend.name} rodó`}
                    </span>
                    <span className="text-[#1A1918]/70 font-sans ml-1.5 font-medium">
                      en esta salida grupal con {activity.pilotName}
                    </span>
                  </p>
                </div>
                {activity.groupInfo && (
                  <span className="text-[9px] text-[#E6332A] font-mono font-semibold uppercase bg-[#FAF6ED] px-2 py-0.5 border border-[#1A1918]/10 rounded shrink-0 hidden sm:inline-block shadow-sm">
                    {resolvedCrewName}
                  </span>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* HEADER BAR */}
        <div className="sticky top-0 bg-[#FAF6ED]/95 backdrop-blur-md border-b border-[#1A1918]/10 p-4 sm:p-5 flex items-center justify-between z-20 rounded-t-[26px]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div 
              onClick={() => {
                onClose();
                onOpenPilotProfile(activity.pilotId);
              }}
              className="w-12 h-12 rounded-2xl overflow-hidden border border-[#1A1918]/10 shadow-sm cursor-pointer transition shrink-0 bg-[#F4EEDB]"
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
                  className="font-display font-semibold text-base text-[#1A1918] hover:text-[#E6332A] cursor-pointer transition truncate"
                >
                  {activity.pilotName}
                </span>
                <span className="text-[9px] text-[#1A1918] bg-[#F7B32B] px-2 py-0.5 border border-[#1A1918]/10 font-mono font-semibold uppercase rounded-lg shadow-sm">
                  {activity.motoModel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#1A1918]/60 mt-0.5 font-mono">
                <span>{activity.dateText}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[10px] text-[#1A1918]/70 font-sans truncate">
                  <MapPin className="w-3 h-3 text-[#E06423] shrink-0" />
                  {activity.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              className={`p-2.5 rounded-xl border border-[#1A1918]/10 transition flex items-center justify-center shadow-sm active:shadow-none ${
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
                className="p-2.5 rounded-xl border border-[#1A1918]/10 hover:bg-[#E6332A] hover:text-white text-[#1A1918]/70 transition flex items-center justify-center bg-[#FAF6ED] shadow-sm active:shadow-none"
                title="Eliminar tu publicación"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#1A1918]/10 hover:bg-[#E6332A] hover:text-white text-[#1A1918] transition flex items-center justify-center bg-[#FAF6ED] shadow-sm active:shadow-none"
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
              <span className="text-[10px] text-white uppercase font-sans font-semibold tracking-widest bg-[#E6332A] px-3 py-1 border border-[#1A1918]/10 rounded-lg shadow-sm">
                {activity.discipline}
              </span>
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-[#1A1918] leading-tight">
              {activity.title}
            </h2>
          </div>

          {/* INTERACTIVE ROUTE MAP WITH GOOGLE MAPS TILES & LAYER CONTROLS */}
          <div className="space-y-2.5">
            <div className="relative border border-[#1A1918]/10 rounded-2xl overflow-hidden shadow-sm">
              <div ref={mapContainerRef} className="w-full h-72 sm:h-96 z-0 bg-[#F4EEDB]" />
              
              {/* Google Maps Layer Switcher */}
              <div className="absolute top-3 right-3 flex items-center bg-[#FAF6ED]/95 backdrop-blur border border-[#1A1918]/10 rounded-xl overflow-hidden shadow-sm z-10 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setMapLayer('hybrid')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1.5 ${
                    mapLayer === 'hybrid' ? 'bg-[#1A1918] text-white shadow-sm' : 'text-[#1A1918]/70 hover:text-[#1A1918]'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Satélite</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapLayer('roadmap')}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1.5 ${
                    mapLayer === 'roadmap' ? 'bg-[#1A1918] text-white shadow-sm' : 'text-[#1A1918]/70 hover:text-[#1A1918]'
                  }`}
                >
                  <MapIcon className="w-3 h-3" />
                  <span>Calles</span>
                </button>
              </div>

              {/* Status Header Overlay */}
              <div className="absolute top-3 left-3 bg-[#FAF6ED]/95 backdrop-blur px-2.5 py-1 border border-[#1A1918]/10 rounded-xl text-[9px] font-mono font-bold text-[#1A1918] flex items-center gap-1.5 shadow-sm z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>GOOGLE MAPS {mapLayer.toUpperCase()}</span>
                {effectiveWaypoints.length > 0 && (
                  <span className="text-[#E6332A] font-extrabold">• {effectiveWaypoints.length} PARADAS</span>
                )}
              </div>

              {/* Bottom Legend */}
              <div className="absolute bottom-3 left-3 bg-[#FAF6ED]/95 backdrop-blur px-3 py-1.5 text-[10px] text-[#1A1918] uppercase font-mono font-semibold border border-[#1A1918]/10 rounded-xl flex items-center gap-3 z-10 shadow-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#1A1918]/10 inline-block"></span> Inicio</span>
                {effectiveWaypoints.length > 0 && (
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F7B32B] border border-[#1A1918]/10 inline-block"></span> Paradas ({effectiveWaypoints.length})</span>
                )}
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] border border-[#1A1918]/10 inline-block"></span> Fin</span>
              </div>
            </div>

            {/* Google Maps External Navigation Launch Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 sm:p-4 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1A1918] flex items-center justify-center shrink-0 border border-[#1A1918]/10 text-white shadow-sm">
                  <Compass className="w-4 h-4 text-[#FAF6ED]" />
                </div>
                <div className="min-w-0">
                  <span className="font-sans font-semibold text-xs text-[#1A1918] block truncate">
                    Navegación Google Maps
                  </span>
                  <span className="text-[10px] font-mono text-[#1A1918]/70 block truncate">
                    {effectiveWaypoints.length > 0 
                      ? `${effectiveWaypoints.length} paradas secuenciales reconocidas por GPS` 
                      : `Ruta de ${activity.distanceKm} km lista para navegación por turnos`}
                  </span>
                </div>
              </div>
              <a
                href={googleMapsNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white text-xs font-sans font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm active:shadow-none shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-white" />
                <span>Abrir en Google Maps {effectiveWaypoints.length > 0 ? `(${effectiveWaypoints.length} paradas)` : ''} ↗</span>
              </a>
            </div>
          </div>

          {/* CHRONOLOGICAL STOPS LOG (BITÁCORA DE PARADAS REGISTRADAS) */}
          {effectiveWaypoints && effectiveWaypoints.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E6332A]" />
                  <span className="text-xs font-sans font-semibold text-[#1A1918]">
                    Paradas Registradas en el Recorrido ({effectiveWaypoints.length})
                  </span>
                </div>
                <a
                  href={googleMapsNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono font-bold text-[#E6332A] hover:underline flex items-center gap-1"
                >
                  Navegar todas en Maps ↗
                </a>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {effectiveWaypoints.map((wp, idx) => {
                  let badgeColor = 'bg-[#F7B32B] text-[#1A1918]';
                  let emoji = '📍';
                  if (wp.type === 'start' || idx === 0) { badgeColor = 'bg-emerald-500 text-white'; emoji = '🟢'; }
                  else if (wp.type === 'end' || idx === effectiveWaypoints.length - 1) { badgeColor = 'bg-[#EF4444] text-white'; emoji = '🏁'; }
                  else if (wp.type === 'fuel') { badgeColor = 'bg-[#E06423] text-white'; emoji = '⛽'; }
                  else if (wp.type === 'scenic') { badgeColor = 'bg-blue-500 text-white'; emoji = '📸'; }
                  else if (wp.type === 'food') { badgeColor = 'bg-emerald-600 text-white'; emoji = '☕'; }
                  else if (wp.type === 'camp') { badgeColor = 'bg-purple-600 text-white'; emoji = '⛺'; }
                  else if (wp.type === 'dirt') { badgeColor = 'bg-amber-600 text-white'; emoji = '🏔️'; }
                  else { badgeColor = 'bg-red-600 text-white'; emoji = '⚠️'; }

                  return (
                    <div key={wp.id || idx} className="p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-[#1A1918]/25 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl ${badgeColor} flex items-center justify-center text-sm shrink-0 shadow-sm border border-[#1A1918]/10`}>
                          {emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-sans font-semibold text-xs text-[#1A1918] truncate">
                              {wp.name}
                            </span>
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded text-[#1A1918]/80 shrink-0">
                              #{idx + 1} • {wp.type}
                            </span>
                          </div>
                          {wp.notes && (
                            <p className="text-[11px] text-[#1A1918]/70 font-sans mt-0.5 truncate">
                              {wp.notes}
                            </p>
                          )}
                          {wp.lat && wp.lng && (
                            <span className="text-[9px] font-mono text-[#1A1918]/50 block">
                              GPS: {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${wp.lat},${wp.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/10 rounded-lg text-[10px] font-mono font-bold text-[#1A1918] hover:text-[#E6332A] shrink-0 transition flex items-center gap-1 shadow-sm"
                        title="Abrir este punto específico en Google Maps"
                      >
                        <span>Ver punto</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PHOTO GALLERY OF THE RIDE */}
          {activity.photos && activity.photos.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-semibold tracking-widest block">
                  Capturas en Ruta ({activity.photos.length})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {activity.photos.map((photo, pIdx) => (
                  <div key={pIdx} className="h-40 sm:h-48 overflow-hidden rounded-2xl border border-[#1A1918]/10 group/img relative bg-[#F4EEDB] shadow-sm">
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
            <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-semibold tracking-wider block">Distancia</span>
              <span className="font-mono font-semibold text-[#1A1918] text-lg sm:text-xl block">{activity.distanceKm} km</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-semibold tracking-wider block">Desnivel +</span>
              <span className="font-mono font-semibold text-[#E06423] text-lg sm:text-xl block">+{activity.elevationGainM} m</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-semibold tracking-wider block">Tiempo rodando</span>
              <span className="font-mono font-semibold text-[#1A1918] text-lg sm:text-xl block">{activity.durationText}</span>
            </div>
            <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-1 shadow-sm">
              <span className="text-[10px] text-[#1A1918]/70 uppercase font-mono font-semibold tracking-wider block">Velocidad Prom.</span>
              <span className="font-mono font-semibold text-[#1A1918] text-lg sm:text-xl block">{activity.avgSpeedKmh} km/h</span>
            </div>
          </div>

          {/* SURFACE & CURVES BREAKDOWN */}
          {activity.surfaceBreakdown && (
            <div className="p-4 sm:p-5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1A1918] uppercase text-[11px] font-mono font-semibold flex items-center gap-1.5 tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-[#E6332A]" />
                  Desglose de superficie
                </span>
                <span className="text-[#1A1918] font-mono font-semibold text-xs bg-[#FAF6ED] px-2 py-0.5 border border-[#1A1918]/10 rounded-lg shadow-sm">
                  Curvas: {activity.surfaceBreakdown.curveDensity}
                </span>
              </div>
              <div className="w-full h-3.5 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-full overflow-hidden flex shadow-sm">
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
                <span>Asfalto: <strong className="font-semibold text-[#1A1918]">{activity.surfaceBreakdown.asphaltPercentage}%</strong></span>
                <span>Terracería / Brecha: <strong className="font-semibold text-[#E06423]">{activity.surfaceBreakdown.dirtPercentage}%</strong></span>
              </div>
            </div>
          )}

          {/* GROUP & PARTICIPANTS */}
          {activity.groupInfo && (
            <div className="p-4 sm:p-5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#E6332A]" />
                  <span className="text-xs font-sans font-semibold text-[#1A1918]  ">
                    Rodada en Grupo: {resolvedCrewName?.replace(/MotoMami/gi, 'NAO')}
                  </span>
                </div>
                <span className="text-[10px] text-[#1A1918] font-mono font-semibold bg-[#FAF6ED] px-2.5 py-1 border border-[#1A1918]/10 rounded-xl shadow-sm">
                  {resolvedParticipants.length} pilotos
                </span>
              </div>

              {activity.groupInfo.rodadaTitle && (
                <p className="text-xs text-[#1A1918]/70 font-sans font-medium">
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
                      className={`p-3 border border-[#1A1918]/10 rounded-xl transition flex items-center justify-between gap-2.5 shadow-sm ${
                        isMe
                          ? 'bg-[#FAF6ED] cursor-default'
                          : 'bg-[#FAF6ED] hover:bg-[#FAF6ED] cursor-pointer group'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.avatar} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-[#1A1918]/10 shrink-0 bg-[#F4EEDB]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-sans font-semibold text-[#1A1918] truncate">
                              {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[8px] uppercase font-mono font-semibold text-[#E6332A] bg-[#FAF6ED] px-1.5 py-0.5 border border-[#E6332A] rounded">
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
                        <span className="text-[9px] text-[#1A1918] group-hover:text-[#E6332A] uppercase font-mono font-semibold shrink-0 px-2 py-1 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-lg shadow-sm">
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
          <div className="pt-2 border-t border-[#1A1918]/10 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSaludoClick}
              className={`flex-1 py-3.5 px-4 font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl border border-[#1A1918]/10 shadow-sm active:shadow-none ${
                activity.hasKudoed 
                  ? 'bg-[#E6332A] text-white' 
                  : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918]'
              }`}
            >
              <BikerSaluteIcon className="w-5 h-5" active={activity.hasKudoed} />
              <span>{activity.hasKudoed ? 'Saludado' : 'Saludo'}</span>
              <span className="text-xs font-mono font-semibold">({activity.kudosCount})</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3.5 px-6 border border-[#1A1918]/10 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl shadow-sm active:shadow-none"
            >
              <Share2 className="w-4 h-4 text-[#1A1918]" />
              <span>{copiedLink ? 'Enlace Copiado' : 'Compartir'}</span>
            </button>
          </div>

          {/* SALUDOS SOCIAL ROSTER */}
          <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-xl flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2 overflow-hidden">
                {activity.kudosAvatars.slice(0, 4).map((av, idx) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={idx} src={av} alt="saludo" className="w-7 h-7 rounded-full border border-[#1A1918]/10 object-cover bg-[#FAF6ED]" />
                ))}
              </div>
              <span className="text-xs text-[#1A1918] font-mono font-bold">
                {activity.kudosCount === 0 ? 'Sé el primero en saludar ✌️' : `${activity.kudosCount} ${activity.kudosCount === 1 ? 'saludo recibido' : 'saludos recibidos'}`}
              </span>
            </div>
            <span className="text-[10px] text-[#E6332A] uppercase font-mono font-semibold tracking-wider bg-[#FAF6ED] px-2 py-0.5 border border-[#1A1918]/10 rounded shadow-sm">
              Comunidad activa
            </span>
          </div>

          {/* COMMENTS THREAD */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#1A1918] font-mono font-semibold ">
              <MessageSquare className="w-4 h-4 text-[#E6332A]" />
              <span>Comentarios ({activity.commentsCount})</span>
            </div>

            {/* COMMENTS LIST */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {activity.comments && activity.comments.length > 0 ? (
                activity.comments.map((comm) => (
                  <div key={comm.id} className="p-3.5 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl flex items-start gap-3 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={comm.userAvatar} 
                      alt={comm.userName} 
                      className="w-8 h-8 rounded-xl object-cover border border-[#1A1918]/10 shrink-0 bg-[#F4EEDB]" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-sans font-semibold text-[#1A1918] ">{comm.userName}</span>
                        <span className="text-[10px] text-[#1A1918]/60 font-mono font-bold">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-[#1A1918] mt-1 font-sans font-medium leading-relaxed">
                        {comm.text}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-xl text-center text-xs text-[#1A1918]/70 font-sans font-medium shadow-sm">
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
                className="flex-1 bg-[#FAF6ED] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-sans font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white font-sans font-semibold text-xs transition flex items-center gap-1.5 shrink-0 border border-[#1A1918]/10 rounded-xl shadow-sm active:shadow-none"
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
