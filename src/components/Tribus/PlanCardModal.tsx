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

  const mapsUrl = winningRoute ? buildOrderedGoogleMapsUrl(winningRoute, rodada.originPoint) : null;

  const displayProposal: RouteProposal = winningRoute || {
    id: `plan-${rodada.id}`,
    rodadaId: rodada.id,
    title: rodada.title,
    destination: rodada.title,
    state: 'México',
    proposedByUserId: rodada.attendees[0]?.userId || currentUser.id,
    proposedByName: 'Comité de Ruta',
    proposedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    description: rodada.description || rodada.subtitle || '',
    coverImage: '',
    totalKm: 120,
    estimatedHours: '3.5h',
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
        return <Utensils className="w-3.5 h-3.5 text-earth" />;
      case 'culture':
        return <Landmark className="w-3.5 h-3.5 text-amber-400" />;
      case 'scenic':
        return <Camera className="w-3.5 h-3.5 text-sky-400" />;
      case 'fuel':
        return <Fuel className="w-3.5 h-3.5 text-rose-400" />;
      case 'dirt':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'camp':
        return <Compass className="w-3.5 h-3.5 text-earth" />;
      case 'start':
        return <Navigation className="w-3.5 h-3.5 text-white" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-earth" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="relative border border-white/20 bg-[#0E0C0A] max-w-2xl w-full max-h-[90dvh] flex flex-col font-mono text-chalk shadow-2xl overflow-hidden">
        
        {/* Top Header - Pinned */}
        <div className="shrink-0 px-5 sm:px-6 py-4 border-b border-white/10 flex items-start justify-between gap-3 bg-[#13100D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest">
                [ PLAN DE RODADA ]
              </span>
              {rodada.status === 'fijada' ? (
                <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Ruta Confirmada
                </span>
              ) : (
                <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  En Votación
                </span>
              )}
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase">
              {winningRoute ? winningRoute.destination : rodada.title}
            </h2>
            <p className="text-xs text-ash mt-0.5">
              {rodada.subtitle || winningRoute?.title || rodada.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-ash hover:text-white p-1.5 border border-white/10 hover:border-white/30 transition shrink-0"
            title="Cerrar detalle del plan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">

        {/* Mapa Táctico Vectorial GPS y Curvas de Nivel (Cero fotos stock) */}
        <RouteTacticalMapCard
          proposal={displayProposal}
          isWinner={true}
          className="h-48 sm:h-56 w-full border border-white/10"
        />

        {/* Métricas Principales de la Rodada */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border border-white/10 bg-black/40 p-3">
          <div className="p-2 border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] text-ash uppercase tracking-wider block">Fecha</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {formatHumanDate(rodada.startDate, rodada.endDate, true)}
            </span>
          </div>

          <div className="p-2 border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] text-ash uppercase tracking-wider block">Distancia Total</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {winningRoute ? `${winningRoute.totalKm} km` : 'Por definir'}
            </span>
          </div>

          <div className="p-2 border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] text-ash uppercase tracking-wider block">Terreno</span>
            {winningRoute ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs font-bold text-earth" title="Montaña / Terracería">
                  <Mountain className="w-3.5 h-3.5 text-earth shrink-0" />
                  <span>{winningRoute.offroadPercentage}%</span>
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-white" title="Carretera / Asfalto">
                  <RoadIcon className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{winningRoute.asphaltPercentage || (100 - winningRoute.offroadPercentage)}%</span>
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-white block mt-0.5">Mix</span>
            )}
          </div>

          <div className="p-2 border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] text-ash uppercase tracking-wider block">Salida</span>
            <span className="text-xs font-bold text-white block mt-0.5 truncate" title={rodada.originPoint}>
              {winningRoute?.waypoints[0]?.name || rodada.originPoint}
            </span>
          </div>
        </div>

        {/* Trazado y Puntos del Plan (Waypoints / Paradas Intermedias) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Itinerario y Paradas del Recorrido
            </span>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-earth hover:text-earth-bright uppercase font-bold tracking-wider flex items-center gap-1 transition"
              >
                Abrir en Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="space-y-2 border border-white/10 bg-black/30 p-3.5">
            {/* Punto de Inicio */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 border border-white/20 bg-white/[0.05] shrink-0 mt-0.5">
                <Navigation className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white uppercase">
                    Salida: {winningRoute?.waypoints[0]?.name || rodada.originPoint}
                  </span>
                  <span className="text-[10px] font-mono text-ash">07:30 AM</span>
                </div>
                <p className="text-[11px] text-ash mt-0.5">
                  Punto de reunión oficial. Tanque lleno y presión de llantas revisada.
                </p>
              </div>
            </div>

            {/* Paradas intermedias */}
            {winningRoute?.waypoints && winningRoute.waypoints.length > 2 ? (
              winningRoute.waypoints.slice(1, -1).map((wp, idx) => (
                <div key={wp.id || idx} className="flex items-start gap-3 pt-2 border-t border-white/5">
                  <div className="p-1.5 border border-white/15 bg-white/[0.03] shrink-0 mt-0.5">
                    {getWaypointIcon(wp.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-chalk uppercase">
                        Parada {idx + 1}: {wp.name}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-white/[0.04] text-ash border border-white/10">
                        {wp.type}
                      </span>
                    </div>
                    {(wp.notes || wp.description) && (
                      <p className="text-[11px] text-ash mt-0.5">
                        {wp.notes || wp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-3 pt-2 border-t border-white/5">
                <div className="p-1.5 border border-white/15 bg-white/[0.03] shrink-0 mt-0.5">
                  <Utensils className="w-3.5 h-3.5 text-earth" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-chalk uppercase">
                    Parada Intermedia: Desayuno & Mirador
                  </span>
                  <p className="text-[11px] text-ash mt-0.5">
                    Parada en el trayecto para reagrupar, tomar café caliente y fotos del paisaje.
                  </p>
                </div>
              </div>
            )}

            {/* Punto de Llegada / Destino Final */}
            <div className="flex items-start gap-3 pt-2 border-t border-white/5">
              <div className="p-1.5 border border-earth/40 bg-earth/10 shrink-0 mt-0.5">
                <Flag className="w-3.5 h-3.5 text-earth" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white uppercase">
                  Destino: {winningRoute ? winningRoute.destination : rodada.title}
                </span>
                <p className="text-[11px] text-ash mt-0.5">
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
            <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Asistencia de la Tribu
            </span>

            {/* Segmented filter pills */}
            <div className="inline-flex rounded-lg border border-white/10 bg-black/60 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setAttendeeTab('confirmados')}
                className={`px-2 py-0.5 rounded font-bold uppercase transition flex items-center gap-1 ${
                  attendeeTab === 'confirmados'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
              >
                <span>Asistiré</span>
                <span className="text-[10px] opacity-80">({confirmedAttendees.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendeeTab('por_confirmar')}
                className={`px-2 py-0.5 rounded font-bold uppercase transition flex items-center gap-1 ${
                  attendeeTab === 'por_confirmar'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
              >
                <span>Por confirmar</span>
                <span className="text-[10px] opacity-80">({maybeAttendees.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAttendeeTab('no_asistire')}
                className={`px-2 py-0.5 rounded font-bold uppercase transition flex items-center gap-1 ${
                  attendeeTab === 'no_asistire'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
              >
                <span>No asistiré</span>
                <span className="text-[10px] opacity-80">({declinedAttendees.length})</span>
              </button>
            </div>
          </div>

          {currentDisplayList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentDisplayList.map(att => (
                <div key={att.userId} className="p-2.5 border border-white/10 bg-black/40 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.userAvatar}
                    alt={att.userName}
                    className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white truncate">{att.userName}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold shrink-0 ${
                        att.status === 'confirmado'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : att.status === 'no_asistire'
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      }`}>
                        {att.status === 'confirmado' ? 'Asistirá' : att.status === 'no_asistire' ? 'No asiste' : 'Por confirmar'}
                      </span>
                    </div>
                    <span className="text-[10px] text-ash block truncate">
                      {att.userHandle} • {att.ridingLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-dashed border-white/10 bg-black/20 text-center text-xs text-ash font-mono">
              {attendeeTab === 'confirmados' && 'Aún no hay pilotos confirmados.'}
              {attendeeTab === 'por_confirmar' && 'No hay pilotos por confirmar.'}
              {attendeeTab === 'no_asistire' && 'Ningún piloto ha declinado esta rodada.'}
            </div>
          )}
        </div>
        </div>

        {/* Footer Actions - Pinned */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-white/10 bg-[#13100D] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 border border-white/15 hover:border-white/30 text-ash hover:text-white text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition"
              title="Copiar enlace del plan"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
            </button>

            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-earth/40 hover:bg-earth/10 text-earth text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Google Maps ↗</span>
              </a>
            )}
          </div>

          {/* 3 Opciones de Asistencia: Asistiré, Por confirmar, No asistiré */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 justify-end">
            <span className="text-[10px] text-ash font-mono uppercase font-bold hidden lg:inline">
              Tu Asistencia:
            </span>
            <div className="grid grid-cols-3 sm:flex items-center rounded-lg border border-white/15 bg-black/60 p-1 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'confirmado')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'confirmado'
                    ? 'bg-emerald-500/25 border border-emerald-500/60 text-emerald-300 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
                title="Confirmar asistencia"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Asistiré</span>
              </button>

              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'por_confirmar')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'por_confirmar' || currentStatus === 'interesado'
                    ? 'bg-amber-500/25 border border-amber-500/60 text-amber-300 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
                title="Por confirmar asistencia"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Por confirmar</span>
                <span className="sm:hidden">Duda</span>
              </button>

              <button
                type="button"
                onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', 'no_asistire')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                  currentStatus === 'no_asistire'
                    ? 'bg-rose-500/25 border border-rose-500/60 text-rose-300 shadow-sm'
                    : 'text-ash hover:text-white border border-transparent'
                }`}
                title="No asistiré"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
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
