'use client';

import React, { useState } from 'react';
import { RouteProposal } from '../../types';
import { X, Copy, Check, Download, Navigation, Share2, Mountain } from 'lucide-react';
import confetti from 'canvas-confetti';

import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3 h-3" }) => (
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

interface ShareRouteModalProps {
  route: RouteProposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareRouteModal: React.FC<ShareRouteModalProps> = ({
  route,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLinkOnly, setCopiedLinkOnly] = useState(false);

  if (!isOpen || !route) return null;

  const gmapsUrl = buildOrderedGoogleMapsUrl(route);
  const shortRouteUrl = typeof window !== 'undefined' ? `${window.location.origin}/?route=${route.id}` : `https://nao-club-three.vercel.app/?route=${route.id}`;
  
  const shareText = `NAO // RUTA OFF-ROAD\n${route.title.toUpperCase()}\nDestino: ${route.destination}, ${route.state}\nDistancia: ${route.totalKm} km (${route.offroadPercentage}% Terracería)\n\nGoogle Maps:\n${gmapsUrl}\n\nTrack GPS:\n${shortRouteUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    confetti({ particleCount: 25, spread: 50 });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyLinkOnly = () => {
    navigator.clipboard.writeText(gmapsUrl);
    setCopiedLinkOnly(true);
    confetti({ particleCount: 20, spread: 40 });
    setTimeout(() => setCopiedLinkOnly(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleDownloadGpx = () => {
    const gpxPoints = route.waypoints
      .map(wp => `      <trkpt lat="${wp.lat}" lon="${wp.lng}"><name>${wp.name}</name><desc>${wp.notes || ''}</desc></trkpt>`)
      .join('\n');

    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NAO Expeditions" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.title}</name>
    <desc>${route.description}</desc>
  </metadata>
  <trk>
    <name>${route.title}</name>
    <trkseg>
${gpxPoints}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${route.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.gpx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenGoogleMaps = () => {
    const url = buildOrderedGoogleMapsUrl(route);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-lg text-[#1A1918] p-6 sm:p-8 shadow-[8px_8px_0px_#1A1918] relative font-sans space-y-5 my-auto max-h-[94vh] overflow-y-auto rounded-[28px] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#E6332A]" />
            <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#E6332A]">
              ★ COMPARTIR RUTA GPS ★
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] hover:bg-[#E6332A] hover:text-white flex items-center justify-center transition shadow-[2px_2px_0px_#1A1918]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Snapshot */}
        <div className="p-4 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center gap-4 shadow-[2px_2px_0px_#1A1918]">
          <img 
            src={route.coverImage} 
            alt={route.title}
            className="w-16 h-16 object-cover border-2 border-[#1A1918] rounded-xl flex-shrink-0 shadow-[1px_1px_0px_#1A1918] bg-[#FAF6ED]"
          />
          <div className="overflow-hidden min-w-0">
            <h4 className="font-display font-black text-sm text-[#1A1918] uppercase tracking-wide truncate">
              {route.title}
            </h4>
            <p className="text-xs text-[#E6332A] font-mono font-black mt-0.5 truncate">
              {route.destination}, {route.state}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-[#1A1918]/70 mt-1 flex-wrap">
              <span className="font-mono font-black text-[#1A1918] bg-[#FAF6ED] px-1.5 py-0.2 border border-[#1A1918] rounded">{route.totalKm} km</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-[#E06423] font-bold" title="Montaña / Terracería">
                <Mountain className="w-2.5 h-2.5 text-[#E06423] shrink-0" />
                <span>{route.offroadPercentage}%</span>
              </span>
              <span className="flex items-center gap-0.5 text-[#1A1918] font-bold" title="Carretera / Asfalto">
                <RoadIcon className="w-2.5 h-2.5 text-[#1A1918] shrink-0" />
                <span>{route.asphaltPercentage || (100 - route.offroadPercentage)}%</span>
              </span>
              <span>•</span>
              <span className="uppercase font-mono font-black">{route.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="space-y-3">
          {/* WhatsApp 1-Click */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Compartir por WhatsApp</span>
          </button>

          {/* Clean Short Link Box */}
          <div className="flex items-center gap-2 p-2.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl text-xs shadow-[2px_2px_0px_#1A1918]">
            <span className="text-[#1A1918]/60 select-none pl-1 text-[10px] uppercase font-mono font-black">Enlace:</span>
            <span className="flex-1 text-[#1A1918] font-mono font-bold truncate text-xs">{shortRouteUrl}</span>
            <button
              onClick={handleCopyLinkOnly}
              className="px-3.5 py-1.5 bg-[#F4EEDB] hover:bg-[#EDE6D3] border-2 border-[#1A1918] text-[#1A1918] text-xs uppercase font-mono font-black tracking-wider transition rounded-lg shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {copiedLinkOnly ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          {/* Copy Full Summary */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 border-2 border-[#1A1918] font-display font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              copied 
                ? 'bg-[#1D4477] text-white' 
                : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918]'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#1A1918]" />}
            <span>{copied ? '¡Resumen Copiado!' : 'Copiar Resumen Completo'}</span>
          </button>

          {/* Download GPX & Open Google Maps */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadGpx}
              className="py-3 px-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] text-xs uppercase font-display font-black tracking-wider transition flex items-center justify-center gap-1.5 rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Download className="w-3.5 h-3.5 text-[#E6332A]" />
              <span>Bajar GPX</span>
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="py-3 px-3 bg-[#1A1918] hover:bg-black text-white text-xs uppercase font-display font-black tracking-wider transition flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Navigation className="w-3.5 h-3.5 text-[#F7B32B]" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#1A1918]/60 text-center font-serif italic">
          Compatible con Garmin, OsmAnd, Gaia GPS, CarPlay y Google Maps.
        </p>
      </div>
    </div>
  );
};
