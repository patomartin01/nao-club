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
          text: `Checa esta rodada de ${item.pilotName || 'Pato Martín'} en NAO: ${item.title}`,
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
      className="fixed inset-0 z-[99999] bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF6ED] border-2 border-[#1A1918] w-full max-w-lg shadow-[8px_8px_0px_#1A1918] rounded-[28px] relative text-[#1A1918] font-sans my-auto max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
      >
        {/* MODAL HEADER */}
        <div className="p-5 flex items-center justify-between border-b-2 border-[#1A1918] shrink-0 bg-[#F4EEDB] rounded-t-[26px]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] flex items-center justify-center text-[#1A1918] shadow-[2px_2px_0px_#1A1918] shrink-0">
              <Share2 className="w-5 h-5 text-[#E6332A]" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black block">
                ★ ENLACE Y COMUNIDAD ★
              </span>
              <h3 className="font-display font-black text-xl text-[#1A1918] uppercase tracking-wide">
                Compartir Rodada
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#1A1918] hover:bg-[#E6332A] hover:text-white bg-[#FAF6ED] border-2 border-[#1A1918] transition shadow-[2px_2px_0px_#1A1918]"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ITEM PREVIEW CARD */}
        <div className="p-4 bg-[#F4EEDB] border-b-2 border-[#1A1918] shrink-0">
          <div className="flex items-center gap-3.5">
            {item.coverImage ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#1A1918] shrink-0 relative group shadow-[2px_2px_0px_#1A1918] bg-[#FAF6ED]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.coverImage} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] flex items-center justify-center text-[#1A1918] shrink-0 shadow-[2px_2px_0px_#1A1918]">
                <Navigation className="w-7 h-7 text-[#F7B32B]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] uppercase font-mono font-black text-[#E6332A] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#1A1918] flex items-center gap-1 shadow-[1px_1px_0px_#1A1918]">
                  <Sparkles className="w-2.5 h-2.5 text-[#F7B32B]" />
                  {item.discipline || 'Ruta'}
                </span>
                {item.motoModel && (
                  <span className="text-[10px] text-[#1A1918]/80 truncate uppercase font-mono font-bold flex items-center gap-1">
                    <Bike className="w-3 h-3 text-[#E06423] shrink-0" />
                    {item.motoModel}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide truncate mt-1">
                {item.title}
              </h4>
              <div className="text-[11px] text-[#1A1918]/70 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-serif italic text-[#1A1918] font-medium">{item.pilotName || currentUser.name}</span>
                {item.distanceKm && (
                  <>
                    <span className="text-[#1A1918]/40">•</span>
                    <span className="text-[#1A1918] font-mono font-black bg-[#FAF6ED] px-1.5 py-0.2 rounded border border-[#1A1918] text-[10px] shadow-[1px_1px_0px_#1A1918]">
                      {item.distanceKm.toFixed(1)} km
                    </span>
                  </>
                )}
                {item.elevationGainM && (
                  <>
                    <span className="text-[#1A1918]/40">•</span>
                    <span className="text-[#E06423] font-mono font-bold text-[10px]">
                      +{item.elevationGainM}m alt
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION PILL TABS */}
        <div className="p-3 border-b-2 border-[#1A1918] bg-[#FAF6ED] shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4EEDB] rounded-xl border-2 border-[#1A1918] text-xs font-display uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('grupos')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'grupos'
                  ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918] font-black border border-[#1A1918]'
                  : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="truncate">Tribus ({availableCrews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('compartir')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'compartir'
                  ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918] font-black border border-[#1A1918]'
                  : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span className="truncate">Compartir</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[50vh] bg-[#FAF6ED]">
          {/* TAB 1: TRIBUS */}
          {activeTab === 'grupos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#1A1918]/70">
                <span className="flex items-center gap-1.5 uppercase font-mono font-black tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-[#E6332A] animate-pulse" />
                  Compartir en el muro de tu tribu
                </span>
                <span className="text-[10px] text-[#1A1918] font-mono font-black bg-[#F4EEDB] px-2 py-0.5 border border-[#1A1918] rounded">
                  {availableCrews.length} disponibles
                </span>
              </div>

              <div className="space-y-2.5">
                {availableCrews.map((crew) => {
                  const isShared = sharedGroups.includes(crew.id);
                  return (
                    <div
                      key={crew.id}
                      className={`p-3.5 rounded-xl border-2 border-[#1A1918] transition-all duration-200 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] ${
                        isShared 
                          ? 'bg-[#F4EEDB]' 
                          : 'bg-[#FAF6ED] hover:bg-[#F4EEDB]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={crew.coverImage} 
                            alt={crew.name}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918] bg-[#F4EEDB]" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FAF6ED] border border-[#1A1918] flex items-center justify-center shadow-xs">
                            <ShieldCheck className="w-2.5 h-2.5 text-[#E6332A]" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide truncate">
                            {crew.name.replace(/MotoMami/gi, 'NAO')}
                          </h5>
                          <p className="text-[11px] text-[#1A1918]/70 truncate mt-0.5 flex items-center gap-1.5 font-mono">
                            <span className="text-[#1A1918] not-italic font-black text-[10px] uppercase">{crew.members.length} pilotos</span>
                            <span>•</span>
                            <span className="truncate">
                              {crew.baseCity}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleShareToGroup(crew.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all duration-200 shrink-0 flex items-center gap-1.5 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                          isShared
                            ? 'bg-[#1D4477] text-white cursor-default'
                            : 'bg-[#E6332A] hover:bg-[#d02c24] text-white'
                        }`}
                      >
                        {isShared ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Enviado</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-white" />
                            <span>Enviar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {sharedGroups.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] text-xs flex items-center gap-2.5 animate-fadeIn shadow-[2px_2px_0px_#1A1918]">
                  <div className="w-6 h-6 rounded-full bg-[#1D4477] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-serif italic leading-snug font-medium">
                    ¡Rodada compartida con éxito! Los miembros de la tribu ya pueden ver el track y saludar en el muro.
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
                <label className="text-[10px] uppercase font-mono font-black text-[#1A1918]/70 tracking-wider flex items-center gap-1.5">
                  <Copy className="w-3 h-3 text-[#E6332A]" />
                  Copiar enlace directo
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl focus-within:border-[#E6332A] transition shadow-[2px_2px_0px_#1A1918]">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="bg-transparent text-xs text-[#1A1918] font-mono flex-1 outline-none truncate px-2 font-bold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display font-black text-xs uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 rounded-lg border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
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

              {/* SEPARADOR */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-[#1A1918]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono font-black tracking-wider">
                  <span className="bg-[#FAF6ED] px-3 text-[#1A1918]/60 border border-[#1A1918] rounded-full">o enviar vía</span>
                </div>
              </div>

              {/* APLICACIONES EXTERNAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WHATSAPP */}
                <button
                  onClick={handleShareWhatsApp}
                  className="p-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_#1A1918]"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                    WA
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-black">WhatsApp</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-serif italic truncate block">Chat directo o estado</span>
                  </div>
                </button>

                {/* TELEGRAM */}
                <button
                  onClick={handleShareTelegram}
                  className="p-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_#1A1918]"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                    TG
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-black">Telegram</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-serif italic truncate block">Canales y chats de ruta</span>
                  </div>
                </button>

                {/* X (TWITTER) */}
                <button
                  onClick={handleShareTwitter}
                  className="p-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_#1A1918]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1A1918] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                    𝕏
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-black">X (Twitter)</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-serif italic truncate block">Publicar con telemetría</span>
                  </div>
                </button>

                {/* FACEBOOK */}
                <button
                  onClick={handleShareFacebook}
                  className="p-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-3 rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_#1A1918]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#1D4477] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                    FB
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-black">Facebook</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-serif italic truncate block">Muro o comunidad motera</span>
                  </div>
                </button>
              </div>

              {/* BOTÓN NATIVO MÓVIL */}
              {typeof navigator !== 'undefined' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3.5 px-4 bg-[#F4EEDB] hover:bg-[#EDE6D3] border-2 border-[#1A1918] text-[#1A1918] font-display font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[2px_2px_0px_#1A1918]"
                >
                  <Smartphone className="w-4 h-4 text-[#E6332A]" />
                  <span>Compartir con aplicaciones de tu teléfono</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1A1918]" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#F4EEDB] border-t-2 border-[#1A1918] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FAF6ED] hover:bg-[#EDE6D3] text-[#1A1918] border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-widest transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shadow-[3px_3px_0px_#1A1918]"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
