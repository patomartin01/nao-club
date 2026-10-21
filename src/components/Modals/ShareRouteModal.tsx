'use client';

import React, { useState } from 'react';
import { RouteProposal } from '../../types';
import { X, Copy, Check, Download, Navigation, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

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
  const shortRouteUrl = `https://nao.club/r/${route.id}`;
  
  const shareText = `🏍️ *NAO // MOTO EXPEDITIONS*\n*${route.title}*\n📍 ${route.destination}, ${route.state}\n📏 ${route.totalKm} km (${route.offroadPercentage}% Terracería)\n\n📍 Abrir en Google Maps:\n${gmapsUrl}\n\n🧭 Track GPX en NAO:\n${shortRouteUrl}`;

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
<gpx version="1.1" creator="NAO Moto Expeditions" xmlns="http://www.topografix.com/GPX/1/1">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0D0B0A] border border-white/15 w-full max-w-lg text-chalk p-6 sm:p-8 shadow-2xl relative font-mono space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-earth" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-ash">
              COMPARTIR RUTA // TELEMETRÍA GPX
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/15 text-ash hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Snapshot */}
        <div className="p-4 bg-white/[0.03] border border-white/10 flex items-center gap-4">
          <img 
            src={route.coverImage} 
            alt={route.title}
            className="w-16 h-16 object-cover border border-white/10 flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider truncate">
              {route.title}
            </h4>
            <p className="text-[11px] text-earth mt-0.5">
              {route.destination}, {route.state}
            </p>
            <p className="text-[10px] text-ash mt-1">
              {route.totalKm} km • {route.offroadPercentage}% Terracería • {route.difficulty}
            </p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="space-y-3">
          {/* WhatsApp 1-Click */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2.5 shadow-lg"
          >
            <span className="text-base font-sans">💬</span>
            <span>Compartir por WhatsApp</span>
          </button>

          {/* Clean Short Link Box */}
          <div className="flex items-center gap-2 p-2.5 bg-black/60 border border-white/10 font-mono text-[11px]">
            <span className="text-ash select-none pl-1 text-[10px] uppercase">Enlace:</span>
            <span className="flex-1 text-white font-bold truncate text-[11px]">{shortRouteUrl}</span>
            <button
              onClick={handleCopyLinkOnly}
              className="px-2.5 py-1 bg-white/[0.08] hover:bg-earth text-white text-[10px] uppercase font-bold tracking-wider transition"
            >
              {copiedLinkOnly ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          {/* Copy Full Summary */}
          <button
            onClick={handleCopy}
            className={`w-full py-2.5 border font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              copied 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                : 'bg-white/5 hover:bg-white/10 text-ash hover:text-white border-white/10'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-ash" />}
            <span>{copied ? '¡Resumen Copiado!' : 'Copiar Resumen Completo'}</span>
          </button>

          {/* Download GPX & Open Google Maps */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownloadGpx}
              className="py-3 px-3 bg-white/[0.04] hover:bg-white/10 border border-white/15 text-white text-[10px] uppercase font-bold tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-earth" />
              <span>Bajar GPX</span>
            </button>

            <button
              onClick={handleOpenGoogleMaps}
              className="py-3 px-3 bg-white/[0.04] hover:bg-white/10 border border-white/15 text-white text-[10px] uppercase font-bold tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>

        <p className="text-[10px] text-ash text-center font-mono">
          NAO // Compatible con Garmin, OsmAnd, Gaia GPS y Google Maps.
        </p>
      </div>
    </div>
  );
};
