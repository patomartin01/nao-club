'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  Navigation, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  Utensils, 
  Landmark, 
  Camera, 
  Fuel, 
  Trees, 
  Flag,
  Share2,
  Check,
  Mountain,
  HelpCircle,
  XCircle
} from 'lucide-react';
import { Rodada, RouteProposal, User, Motorcycle, RsvpStatus } from '../../types';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';
import { RouteTacticalMapCard } from '../Routes/RouteTacticalMapCard';

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 19L8 5h8l4 14" />
    <line x1="12" y1="8" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="16" />
  </svg>
);

interface PlanCardModalProps {
  rodada: Rodada;
  winningRoute?: RouteProposal;
  currentUser: User;
  allUsers: User[];
  userBikes: Motorcycle[];
  onClose: () => void;
  onRsvp: (rodadaId: string, bikeId: string, status: RsvpStatus) => void;
  formatHumanDate: (start: string, end?: string, includeYear?: boolean) => string;
}

export const PlanCardModal: React.FC<PlanCardModalProps> = ({
  rodada,
  winningRoute,
  currentUser,
  allUsers,
  userBikes,
  onClose,
  onRsvp,
  formatHumanDate
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [attendeeTab, setAttendeeTab] = useState<'confirmados' | 'por_confirmar' | 'no_asistire'>('confirmados');

  const userAttendee = rodada.attendees.find(a => a.userId === currentUser.id);
  const currentStatus: RsvpStatus | null = userAttendee ? userAttendee.status : null;

  const mapPilot = (att: { userId: string; status: RsvpStatus }) => {
    const u = allUsers.find(user => user.id === att.userId);
    return {
      userId: att.userId,
      userName: u ? u.name : (att.userId === currentUser.id ? currentUser.name : 'Piloto'),
      userHandle: u ? u.handle : (att.userId === currentUser.id ? currentUser.handle : '@piloto'),
      userAvatar: u ? u.avatar : (att.userId === currentUser.id ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'),
      ridingLevel: u ? u.ridingLevel : 'Intermedio',
      status: att.status
    };
  };

  const confirmedAttendees = rodada.attendees
    .filter(a => a.status === 'confirmado')
    .map(mapPilot);

  const maybeAttendees = rodada.attendees
    .filter(a => a.status === 'por_confirmar' || a.status === 'interesado')
    .map(mapPilot);

  const declinedAttendees = rodada.attendees
    .filter(a => a.status === 'no_asistire')
    .map(mapPilot);

  const currentDisplayList = 
    attendeeTab === 'confirmados' 
      ? confirmedAttendees 
      : attendeeTab === 'por_confirmar' 
      ? maybeAttendees 
      : declinedAttendees;

  // Build clean Google Maps URL
  const mapsUrl = winningRoute 
    ? buildOrderedGoogleMapsUrl(winningRoute, rodada.originPoint)
    : `https://www.google.com/maps/dir/${encodeURIComponent(rodada.originPoint || 'Interlomas')}/${encodeURIComponent(rodada.title)}`;

  // Fallback proposal for tactical map if no winningRoute is available
  const displayProposal: RouteProposal = winningRoute || {
    id: 'placeholder-route',
    rodadaId: rodada.id,
    title: rodada.title,
    destination: rodada.title,
    state: 'México',
    proposedByUserId: currentUser.id,
    proposedByName: currentUser.name,
    proposedByAvatar: currentUser.avatar,
    description: rodada.description,
    coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
    totalKm: 140,
    estimatedHours: '4h 15m',
    offroadPercentage: 35,
    asphaltPercentage: 65,
    difficulty: 'Intermedio',
    campsite: {
      name: 'Campamento Base',
      elevationMeters: 2800,
      minTempNight: '7°C',
      security: 'Zona controlada',
      amenities: ['Fogata', 'Agua de manantial']
    },
    itinerary: [],
    waypoints: [
      { id: 'w1', name: rodada.originPoint || 'Punto de Salida', lat: 19.30, lng: -99.19, type: 'start' },
      { id: 'w2', name: rodada.title, lat: 19.10, lng: -99.30, type: 'camp' }
    ],
    coordinates: [[-99.19, 19.30], [-99.30, 19.10]],
    votes: [],
    comments: []
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-[#C84B31]" />;
      case 'culture':
        return <Landmark className="w-3.5 h-3.5 text-[#D49B35]" />;
      case 'scenic':
        return <Camera className="w-3.5 h-3.5 text-stone-700" />;
      case 'fuel':
        return <Fuel className="w-3.5 h-3.5 text-[#C84B31]" />;
      case 'dirt':
        return <Trees className="w-3.5 h-3.5 text-emerald-600" />;
      case 'camp':
        return <Compass className="w-3.5 h-3.5 text-[#C84B31]" />;
      case 'start':
        return <Navigation className="w-3.5 h-3.5 text-[#141312]" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#C84B31]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="relative border border-[#E5DFD5] bg-white max-w-2xl w-full max-h-[90dvh] flex flex-col font-sans text-[#141312] shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Top Header - Pinned */}
        <div className="shrink-0 px-6 py-4.5 border-b border-[#E5DFD5] flex items-start justify-between gap-3 bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-[0.2em]">
                ★ PLAN DE RODADA ★
              </span>
              {rodada.status === 'fijada' ? (
                <span className="text-[9px] font-display uppercase font-black px-2 py-0.5 bg-white border border-[#E5DFD5] text-emerald-700 rounded-md shadow-xs">
                  Ruta Confirmada
                </span>
              ) : (
                <span className="text-[9px] font-display uppercase font-black px-2 py-0.5 bg-white border border-[#E5DFD5] text-[#D49B35] rounded-md shadow-xs">
                  En Votación
                </span>
              )}
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#141312] uppercase tracking-wide">
              {winningRoute ? winningRoute.destination : rodada.title}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 font-serif italic">
              {rodada.subtitle || winningRoute?.title || rodada.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-[#141312] p-2 rounded-full border border-[#E5DFD5] hover:border-[#141312] transition shrink-0 bg-white shadow-xs"
            title="Cerrar detalle del plan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Mapa Táctico Vectorial GPS */}
          <div className="rounded-xl overflow-hidden border border-[#E5DFD5] shadow-xs">
            <RouteTacticalMapCard
              proposal={displayProposal}
              isWinner={true}
              className="h-48 sm:h-56 w-full"
            />
          </div>

          {/* Métricas Principales de la Rodada */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border border-[#E5DFD5] bg-[#FAF8F5] p-3.5 rounded-xl shadow-xs">
            <div className="p-2.5 border border-[#E5DFD5] bg-white rounded-lg shadow-xs">
              <span className="text-[9px] text-stone-500 uppercase font-display font-bold tracking-wider block">Fecha</span>
              <span className="text-xs font-display font-black text-[#141312] block mt-0.5">
                {formatHumanDate(rodada.startDate, rodada.endDate, true)}
              </span>
            </div>

            <div className="p-2.5 border border-[#E5DFD5] bg-white rounded-lg shadow-xs">
              <span className="text-[9px] text-stone-500 uppercase font-display font-bold tracking-wider block">Distancia Total</span>
              <span className="text-xs font-display font-black text-[#141312] block mt-0.5">
                {winningRoute ? `${winningRoute.totalKm} km` : 'Por definir'}
              </span>
            </div>

            <div className="p-2.5 border border-[#E5DFD5] bg-white rounded-lg shadow-xs">
              <span className="text-[9px] text-stone-500 uppercase font-display font-bold tracking-wider block">Terreno</span>
              {winningRoute ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#C84B31]" title="Montaña / Terracería">
                    <Mountain className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
                    <span>{winningRoute.offroadPercentage}%</span>
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-[#141312]" title="Carretera / Asfalto">
                    <RoadIcon className="w-3.5 h-3.5 text-[#141312] shrink-0" />
                    <span>{winningRoute.asphaltPercentage || (100 - winningRoute.offroadPercentage)}%</span>
                  </span>
                </div>
              ) : (
                <span className="text-xs font-display font-bold text-[#141312] block mt-0.5">Mix</span>
              )}
            </div>

            <div className="p-2.5 border border-[#E5DFD5] bg-white rounded-lg shadow-xs">
              <span className="text-[9px] text-stone-500 uppercase font-display font-bold tracking-wider block">Salida</span>
              <span className="text-xs font-display font-black text-[#141312] block mt-0.5 truncate" title={rodada.originPoint}>
                {winningRoute?.waypoints[0]?.name || rodada.originPoint}
              </span>
            </div>
          </div>

          {/* Trazado y Puntos del Plan */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Itinerario y Paradas del Recorrido
              </span>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#141312] hover:text-[#C84B31] uppercase font-display font-black tracking-wider flex items-center gap-1 transition"
                >
                  Abrir en Google Maps <ExternalLink className="w-3 h-3 text-[#F2B705]" />
                </a>
              )}
            </div>

            <div className="space-y-2.5 border border-[#E5DFD5] bg-[#FAF8F5] p-4 rounded-xl shadow-xs">
              {/* Punto de Inicio */}
              <div className="flex items-start gap-3 bg-white border border-[#E5DFD5] p-3 rounded-lg shadow-xs">
                <div className="p-1.5 border border-[#E5DFD5] bg-[#FAF8F5] rounded-md shrink-0 mt-0.5">
                  <Navigation className="w-3.5 h-3.5 text-[#141312]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-display font-black text-[#141312] uppercase tracking-wide">
                      Salida: {winningRoute?.waypoints[0]?.name || rodada.originPoint}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 font-bold">07:30 AM</span>
                  </div>
                  <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                    Punto de reunión oficial. Tanque lleno y presión de llantas revisada.
                  </p>
                </div>
              </div>

              {/* Paradas intermedias */}
              {winningRoute?.waypoints && winningRoute.waypoints.length > 2 ? (
                winningRoute.waypoints.slice(1, -1).map((wp, idx) => (
                  <div key={wp.id || idx} className="flex items-start gap-3 bg-white border border-[#E5DFD5] p-3 rounded-lg shadow-xs">
                    <div className="p-1.5 border border-[#E5DFD5] bg-[#FAF8F5] rounded-md shrink-0 mt-0.5">
                      {getWaypointIcon(wp.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-display font-bold text-[#141312] uppercase">
                          Parada {idx + 1}: {wp.name}
                        </span>
                        <span className="text-[9px] font-display uppercase font-bold px-1.5 py-0.5 bg-[#FAF8F5] text-stone-600 border border-[#E5DFD5] rounded">
                          {wp.type}
                        </span>
                      </div>
                      {(wp.notes || wp.description) && (
                        <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                          {wp.notes || wp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3 bg-white border border-[#E5DFD5] p-3 rounded-lg shadow-xs">
                  <div className="p-1.5 border border-[#E5DFD5] bg-[#FAF8F5] rounded-md shrink-0 mt-0.5">
                    <Utensils className="w-3.5 h-3.5 text-[#C84B31]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-display font-bold text-[#141312] uppercase">
                      Parada Intermedia: Desayuno & Mirador
                    </span>
                    <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                      Parada en el trayecto para reagrupar, tomar café caliente y fotos del paisaje.
                    </p>
                  </div>
                </div>
              )}

              {/* Punto de Llegada / Destino Final */}
              <div className="flex items-start gap-3 bg-white border border-[#E5DFD5] p-3 rounded-lg shadow-xs">
                <div className="p-1.5 border border-[#C84B31]/30 bg-[#C84B31]/10 rounded-md shrink-0 mt-0.5">
                  <Flag className="w-3.5 h-3.5 text-[#C84B31]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-display font-black text-[#141312] uppercase tracking-wide">
                    Destino: {winningRoute ? winningRoute.destination : rodada.title}
                  </span>
                  <p className="text-[11px] text-stone-500 font-serif italic mt-0.5">
                    {winningRoute?.campsite?.name 
                      ? `Campamento base en ${winningRoute.campsite.name} (${winningRoute.campsite.elevationMeters} msnm).`
                      : 'Meta final y punto de pernocta / descanso del grupo.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pilotos y Asistencia Clasificada */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Asistencia de la Tribu
              </span>

              {/* Segmented filter pills */}
              <div className="inline-flex rounded-xl border border-[#E5DFD5] bg-[#FAF8F5] p-1 text-[11px] font-display">
                <button
                  type="button"
                  onClick={() => setAttendeeTab('confirmados')}
                  className={`px-3 py-1 rounded-lg uppercase transition flex items-center gap-1.5 ${
                    attendeeTab === 'confirmados'
                      ? 'bg-[#141312] text-white font-black shadow-xs'
                      : 'text-stone-500 hover:text-[#141312] font-bold'
                  }`}
                >
                  <span>Asistiré</span>
                  <span className="text-[10px] opacity-80">({confirmedAttendees.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendeeTab('por_confirmar')}
                  className={`px-3 py-1 rounded-lg uppercase transition flex items-center gap-1.5 ${
                    attendeeTab === 'por_confirmar'
                      ? 'bg-[#141312] text-white font-black shadow-xs'
                      : 'text-stone-500 hover:text-[#141312] font-bold'
                  }`}
                >
                  <span>Por confirmar</span>
                  <span className="text-[10px] opacity-80">({maybeAttendees.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendeeTab('no_asistire')}
                  className={`px-3 py-1 rounded-lg uppercase transition flex items-center gap-1.5 ${
                    attendeeTab === 'no_asistire'
                      ? 'bg-[#141312] text-white font-black shadow-xs'
                      : 'text-stone-500 hover:text-[#141312] font-bold'
                  }`}
                >
                  <span>No asistiré</span>
                  <span className="text-[10px] opacity-80">({declinedAttendees.length})</span>
                </button>
              </div>
            </div>

            {currentDisplayList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentDisplayList.map(att => (
                  <div key={att.userId} className="p-3 border border-[#E5DFD5] bg-white rounded-xl flex items-center gap-3 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.userAvatar}
                      alt={att.userName}
                      className="w-9 h-9 rounded-full object-cover border border-[#D49B35] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-display font-black text-[#141312] truncate">{att.userName}</span>
                        <span className={`text-[9px] font-display px-2 py-0.5 rounded-full uppercase font-black shrink-0 ${
                          att.status === 'confirmado'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : att.status === 'no_asistire'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {att.status === 'confirmado' ? 'Asistirá' : att.status === 'no_asistire' ? 'No asiste' : 'Por confirmar'}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-serif italic block truncate">
                        {att.userHandle} • {att.ridingLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-[#DDD7CB] bg-[#FAF8F5] text-center text-xs text-stone-500 font-serif italic rounded-xl">
                {attendeeTab === 'confirmados' && 'Aún no hay pilotos confirmados.'}
                {attendeeTab === 'por_confirmar' && 'No hay pilotos por confirmar.'}
                {attendeeTab === 'no_asistire' && 'Ningún piloto ha declinado esta rodada.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions - Pinned */}
        <div className="shrink-0 px-6 py-4 border-t border-[#E5DFD5] bg-[#FAF8F5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 border border-[#E5DFD5] hover:border-[#141312] bg-white text-stone-600 hover:text-[#141312] text-xs uppercase font-display font-bold tracking-wider flex items-center gap-1.5 transition rounded-xl shadow-xs"
              title="Copiar enlace del plan"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-[#141312] bg-[#141312] text-white hover:bg-black text-xs uppercase font-display font-black tracking-wider flex items-center gap-1.5 transition rounded-xl shadow-xs"
              >
                <Compass className="w-3.5 h-3.5 text-[#F2B705]" />
                <span>Google Maps ↗</span>
              </a>
            )}
          </div>

          {/* 3 Opciones de Asistencia: Asistiré, Por confirmar, No asistiré */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-end">
            <span className="text-[10px] text-stone-500 font-display uppercase font-black tracking-wider hidden lg:inline">
              Tu Asistencia:
            </span>
            <div className="grid grid-cols-3 sm:flex items-center rounded-xl border border-[#E5DFD5] bg-white p-1 gap-1 w-full sm:w-auto shadow-xs">
              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'confirmado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'confirmado'
                    ? 'bg-[#141312] text-white shadow-xs'
                    : 'text-stone-500 hover:text-[#141312]'
                }`}
                title="Confirmar asistencia"
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'confirmado' ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>Asistiré</span>
              </button>

              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'por_confirmar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'por_confirmar' || currentStatus === 'interesado'
                    ? 'bg-[#141312] text-white shadow-xs'
                    : 'text-stone-500 hover:text-[#141312]'
                }`}
                title="Por confirmar asistencia"
              >
                <HelpCircle className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'por_confirmar' || currentStatus === 'interesado' ? 'text-amber-400' : 'text-stone-400'}`} />
                <span className="hidden sm:inline">Por confirmar</span>
                <span className="sm:hidden">Duda</span>
              </button>

              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'no_asistire')}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'no_asistire'
                    ? 'bg-[#141312] text-white shadow-xs'
                    : 'text-stone-500 hover:text-[#141312]'
                }`}
                title="No asistiré"
              >
                <XCircle className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'no_asistire' ? 'text-rose-400' : 'text-stone-400'}`} />
                <span className="hidden sm:inline">No asistiré</span>
                <span className="sm:hidden">No voy</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
