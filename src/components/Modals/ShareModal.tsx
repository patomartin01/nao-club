'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink,
  Navigation,
  Send,
  Bike,
  Sparkles,
  MapPin,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

export interface ShareableItem {
  id: string;
  title: string;
  subtitle?: string;
  pilotName?: string;
  distanceKm?: number;
  elevationGainM?: number;
  motoModel?: string;
  discipline?: string;
  coverImage?: string;
  type?: 'activity' | 'route' | 'rodada';
  url?: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShareableItem | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, item }) => {
  const { crews, currentUser } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedGroups, setSharedGroups] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'grupos' | 'compartir'>('grupos');

  if (!isOpen || !item) return null;

  // Filter user's active tribus/crews
  const userCrews = crews.filter(c => 
    c.creatorId === currentUser.id || c.members.some(m => m.userId === currentUser.id)
  );
  // Fallback to all crews if user hasn't joined any yet
  const availableCrews = userCrews.length > 0 ? userCrews : crews;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
  const shareUrl = item.url || `${currentOrigin}/?act=${item.id}`;

  const shareText = `🏍️ ${item.title.toUpperCase()}
👤 Piloto: ${item.pilotName || currentUser.name}
🛵 Moto: ${item.motoModel || 'BMW 1250 GS'}
📍 Distancia: ${item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : 'Ruta completada'}
🧭 Disciplina: ${item.discipline || 'Doble Propósito'}

Ver telemetría y track GPS aquí:
${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    confetti({ particleCount: 20, spread: 45 });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareToGroup = (crewId: string) => {
    if (sharedGroups.includes(crewId)) return;

    setSharedGroups(prev => [...prev, crewId]);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Checa esta rodada de ${item.pilotName || 'Pato Martín'} en MotoMami: ${item.title}`,
          url: shareUrl,
        });
      } catch (_) {
        // User cancelled or not supported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`🏍️ ${item.title}`)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const twText = `Checa esta rodada en moto: ${item.title} (${item.distanceKm ? `${item.distanceKm.toFixed(1)}km` : ''})`;
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F0E0D] border border-white/15 w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.85)] rounded-2xl relative text-chalk font-mono my-auto max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-white/10"
      >
        {/* TOP ACCENT LINE */}
        <div className="h-1 bg-gradient-to-r from-transparent via-earth to-transparent w-full shrink-0" />

        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0 bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-earth/15 border border-earth/30 flex items-center justify-center text-earth shadow-inner shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-wider">
                Compartir Rodada
              </h3>
              <p className="text-[11px] text-ash/80 mt-0.5">
                Envía a tu tribu o comparte el enlace directo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ash hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/10 hover:border-white/20 transition"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ITEM PREVIEW CARD */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-br from-white/[0.04] via-black/40 to-black/60 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            {item.coverImage ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0 relative group shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.coverImage} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-earth/10 border border-earth/30 flex items-center justify-center text-earth shrink-0 shadow-md">
                <Navigation className="w-7 h-7" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] uppercase font-bold text-earth bg-earth/15 px-2 py-0.5 rounded border border-earth/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.discipline || 'Ruta'}
                </span>
                {item.motoModel && (
                  <span className="text-[10px] text-ash/90 truncate uppercase flex items-center gap-1">
                    <Bike className="w-3 h-3 text-stone-400 shrink-0" />
                    {item.motoModel}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-1">
                {item.title}
              </h4>
              <div className="text-[11px] text-ash mt-1 flex items-center gap-2.5 flex-wrap">
                <span className="text-stone-300 font-medium">{item.pilotName || currentUser.name}</span>
                {item.distanceKm && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-white font-mono font-bold bg-white/[0.06] px-1.5 py-0.2 rounded text-[10px]">
                      {item.distanceKm.toFixed(1)} km
                    </span>
                  </>
                )}
                {item.elevationGainM && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-cyan-300 font-mono text-[10px]">
                      +{item.elevationGainM}m alt
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION PILL TABS (2 OPTIONS ONLY) */}
        <div className="p-3 border-b border-white/10 bg-[#121110] shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('grupos')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'grupos'
                  ? 'bg-earth text-white shadow-md shadow-earth/25 font-bold'
                  : 'text-ash hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">Tribus ({availableCrews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('compartir')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'compartir'
                  ? 'bg-earth text-white shadow-md shadow-earth/25 font-bold'
                  : 'text-ash hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="truncate">Compartir</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[50vh]">
          {/* TAB 1: TRIBUS */}
          {activeTab === 'grupos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-ash">
                <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <Radio className="w-3.5 h-3.5 text-earth animate-pulse" />
                  Compartir en el muro de tu tribu
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {availableCrews.length} disponibles
                </span>
              </div>

              <div className="space-y-2.5">
                {availableCrews.map((crew) => {
                  const isShared = sharedGroups.includes(crew.id);
                  return (
                    <div
                      key={crew.id}
                      className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                        isShared 
                          ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                          : 'border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent hover:from-earth/[0.08] hover:to-white/[0.02] hover:border-earth/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={crew.coverImage} 
                            alt={crew.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-sm" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
                            <ShieldCheck className="w-2.5 h-2.5 text-earth" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            {crew.name}
                          </h5>
                          <p className="text-[11px] text-ash truncate mt-0.5 flex items-center gap-1.5">
                            <span className="text-stone-300 font-semibold">{crew.members.length} pilotos</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate text-stone-400">
                              <MapPin className="w-3 h-3 text-stone-500 inline shrink-0" />
                              {crew.baseCity}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShareToGroup(crew.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 flex items-center gap-2 shadow-sm ${
                          isShared
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-default'
                            : 'bg-earth hover:bg-earth/90 text-white border border-earth/80 shadow-earth/20 active:scale-95'
                        }`}
                      >
                        {isShared ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Enviado</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Enviar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {sharedGroups.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="leading-snug">
                    ¡Rodada compartida con éxito! Los miembros de la tribu ya pueden ver el track y saludar en el muro de actividades.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPARTIR (CON ENLACE Y APLICACIONES) */}
          {activeTab === 'compartir' && (
            <div className="space-y-4">
              {/* ENLACE PÚBLICO DIRECTO */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-ash tracking-wider flex items-center gap-1.5">
                  <Copy className="w-3 h-3 text-earth" />
                  Copiar enlace directo
                </label>
                <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-black/70 border border-white/15 rounded-xl focus-within:border-earth/60 transition">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="bg-transparent text-xs text-stone-200 font-mono flex-1 outline-none truncate px-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 bg-earth hover:bg-earth/90 text-white font-bold text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 rounded-lg active:scale-95 shadow-sm shadow-earth/20"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SEPARADOR SUTIL */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-[#0F0E0D] px-2 text-ash">o enviar vía</span>
                </div>
              </div>

              {/* APLICACIONES EXTERNAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WHATSAPP */}
                <button
                  onClick={handleShareWhatsApp}
                  className="p-3.5 bg-gradient-to-r from-[#25D366]/15 to-transparent hover:from-[#25D366]/25 border border-[#25D366]/30 hover:border-[#25D366]/60 text-[#25D366] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:scale-[0.98] group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    WA
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-white font-bold group-hover:text-[#25D366] transition">WhatsApp</span>
                    <span className="text-[10px] text-ash font-normal truncate block">Chat directo o estado</span>
                  </div>
                </button>

                {/* TELEGRAM */}
                <button
                  onClick={handleShareTelegram}
                  className="p-3.5 bg-gradient-to-r from-[#229ED9]/15 to-transparent hover:from-[#229ED9]/25 border border-[#229ED9]/30 hover:border-[#229ED9]/60 text-[#229ED9] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:scale-[0.98] group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    TG
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-white font-bold group-hover:text-[#229ED9] transition">Telegram</span>
                    <span className="text-[10px] text-ash font-normal truncate block">Canales y chats de ruta</span>
                  </div>
                </button>

                {/* X (TWITTER) */}
                <button
                  onClick={handleShareTwitter}
                  className="p-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:scale-[0.98] group"
                >
                  <div className="w-9 h-9 rounded-xl bg-black text-white border border-white/30 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    𝕏
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-white font-bold group-hover:text-stone-300 transition">X (Twitter)</span>
                    <span className="text-[10px] text-ash font-normal truncate block">Publicar con telemetría</span>
                  </div>
                </button>

                {/* FACEBOOK */}
                <button
                  onClick={handleShareFacebook}
                  className="p-3.5 bg-gradient-to-r from-[#1877F2]/15 to-transparent hover:from-[#1877F2]/25 border border-[#1877F2]/30 hover:border-[#1877F2]/60 text-[#1877F2] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:scale-[0.98] group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    FB
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-white font-bold group-hover:text-[#1877F2] transition">Facebook</span>
                    <span className="text-[10px] text-ash font-normal truncate block">Muro o comunidad motera</span>
                  </div>
                </button>
              </div>

              {/* BOTÓN NATIVO MÓVIL */}
              {typeof navigator !== 'undefined' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 bg-gradient-to-r from-earth/15 via-white/[0.03] to-transparent hover:from-earth/25 border border-earth/30 hover:border-earth text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 rounded-xl active:scale-[0.98] shadow-sm"
                >
                  <Smartphone className="w-4 h-4 text-earth" />
                  <span>Compartir con aplicaciones de tu teléfono</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ash" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 sm:p-4 bg-[#12100F] border-t border-white/10 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/20 hover:border-white/40 text-white uppercase font-bold text-xs tracking-wider transition-all active:scale-95"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
