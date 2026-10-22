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
  Mountain
} from 'lucide-react';
import { Rodada, RouteProposal, User, Motorcycle } from '../../types';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

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
  onRsvp: (rodadaId: string, bikeId: string, status: 'confirmado' | 'interesado') => void;
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

  const isConfirmed = rodada.attendees.some(
    a => a.userId === currentUser.id && a.status === 'confirmado'
  );

  const confirmedAttendees = rodada.attendees
    .filter(a => a.status === 'confirmado')
    .map(att => {
      const u = allUsers.find(user => user.id === att.userId);
      return {
        userId: att.userId,
        userName: u ? u.name : 'Piloto',
        userHandle: u ? u.handle : '@piloto',
        userAvatar: u ? u.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        ridingLevel: u ? u.ridingLevel : 'Intermedio'
      };
    });

  const mapsUrl = winningRoute ? buildOrderedGoogleMapsUrl(winningRoute, rodada.originPoint) : null;

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

        {/* Portada si existe */}
        {winningRoute?.coverImage && (
          <div className="relative h-44 sm:h-52 w-full overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={winningRoute.coverImage}
              alt={winningRoute.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-earth" />
                <span>{winningRoute.destination}, {winningRoute.state}</span>
              </div>
              <span className="text-[11px] font-mono text-ash bg-black/60 px-2 py-0.5 border border-white/10">
                {winningRoute.difficulty}
              </span>
            </div>
          </div>
        )}

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

        {/* Pilotos Confirmados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Pilotos Confirmados ({confirmedAttendees.length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {confirmedAttendees.map(att => (
              <div key={att.userId} className="p-2.5 border border-white/10 bg-black/40 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.userAvatar}
                  alt={att.userName}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{att.userName}</span>
                    <span className="text-[9px] text-emerald-400 font-mono">Confirmado</span>
                  </div>
                  <span className="text-[10px] text-ash block truncate">
                    {att.userHandle} • {att.ridingLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Footer Actions - Pinned */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-white/10 bg-[#13100D] flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onRsvp(rodada.id, userBikes[0]?.id || 'moto-1', isConfirmed ? 'interesado' : 'confirmado')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition w-full sm:w-auto justify-center ${
                isConfirmed
                  ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/25'
                  : 'bg-earth hover:bg-earth-bright text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isConfirmed ? 'Asistencia Confirmada' : 'Confirmar mi Asistencia'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
