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
  Radio,
  MessageCircle
} from 'lucide-react';
import { useApp, isDeprecatedCrew } from '../../context/AppContext';
import { Crew } from '../../types';
import confetti from 'canvas-confetti';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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
  const { crews, currentUser, createNotification } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedGroups, setSharedGroups] = useState<string[]>([]);
  const [lastSharedCrew, setLastSharedCrew] = useState<Crew | null>(null);
  const [activeTab, setActiveTab] = useState<'grupos' | 'compartir'>('grupos');

  if (!isOpen || !item) return null;

  // Filter user's active tribus/crews (estrictamente solo las que pertenece)
  const validCrews = crews.filter(c => !isDeprecatedCrew(c));
  const userCrews = validCrews.filter(c => 
    c.creatorId === currentUser.id || (c.members && c.members.some(m => m.userId === currentUser.id))
  );
  const availableCrews = userCrews;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
  const shareUrl = item.url || `${currentOrigin}/?act=${item.id}`;

  const shareText = `🏍️ *${item.title.toUpperCase()}*
👤 *Piloto:* ${item.pilotName || currentUser.name}
🛵 *Moto:* ${item.motoModel || 'BMW 1250 GS'}
📍 *Distancia:* ${item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : 'Ruta completada'}
🧭 *Disciplina:* ${item.discipline || 'Doble Propósito'}

🗺️ *Ver telemetría, paradas y track GPS:*
${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    confetti({ particleCount: 20, spread: 45 });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareToGroup = (crew: Crew) => {
    const waText = `🏍️ *${item.title.toUpperCase()}*
👤 *Piloto:* ${item.pilotName || currentUser.name}
🛵 *Moto:* ${item.motoModel || 'BMW 1250 GS'}
📍 *Distancia:* ${item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : 'Ruta completada'}
🧭 *Tribu:* ${crew.name}

🗺️ *Ver telemetría, paradas y track GPS en NAO:*
${shareUrl}`;

    // Copiar al portapapeles
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(waText).catch(() => {});
    }

    // Si la tribu tiene su grupo de WhatsApp vinculado, dirigir DIRECTAMENTE al grupo de WhatsApp
    let targetUrl = '';
    const rawGroupUrl = crew.whatsappGroupUrl?.trim();
    if (rawGroupUrl) {
      targetUrl = rawGroupUrl.startsWith('http') ? rawGroupUrl : `https://${rawGroupUrl}`;
    } else {
      // Fallback a selector general de WhatsApp si la tribu no tiene enlace cargado
      targetUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`;
    }

    if (typeof window !== 'undefined' && targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }

    setLastSharedCrew(crew);

    // Notificación para la tribu en la plataforma
    if (createNotification) {
      createNotification({
        type: 'route_published',
        title: `Rodada compartida en ${crew.name}`,
        message: `${currentUser.name} compartió la rodada "${item.title}" con la tribu.`,
        crewId: crew.id,
        crewName: crew.name,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar,
        routeId: item.id,
        actionUrl: `/?act=${item.id}`
      });
    }

    if (!sharedGroups.includes(crew.id)) {
      setSharedGroups(prev => [...prev, crew.id]);
    }
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
        className="bg-[#FAF6ED] border border-[#1A1918]/10 w-full max-w-lg shadow-sm rounded-[28px] relative text-[#1A1918] font-sans my-auto max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
      >
        {/* MODAL HEADER */}
        <div className="p-5 flex items-center justify-between border-b border-[#1A1918]/10 shrink-0 bg-[#F4EEDB] rounded-t-[26px]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#1A1918]/10 flex items-center justify-center text-[#1A1918] shadow-sm shrink-0">
              <Share2 className="w-5 h-5 text-[#E6332A]" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-semibold block">
                ENLACE Y COMUNIDAD
              </span>
              <h3 className="font-display font-semibold text-xl text-[#1A1918]  ">
                Compartir rodada
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#1A1918] hover:bg-[#E6332A] hover:text-white bg-[#FAF6ED] border border-[#1A1918]/10 transition shadow-sm"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ITEM PREVIEW CARD */}
        <div className="p-4 bg-[#F4EEDB] border-b border-[#1A1918]/10 shrink-0">
          <div className="flex items-center gap-3.5">
            {item.coverImage ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#1A1918]/10 shrink-0 relative group shadow-sm bg-[#FAF6ED]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.coverImage} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#FAF6ED] border border-[#1A1918]/10 flex items-center justify-center text-[#1A1918] shrink-0 shadow-sm">
                <Navigation className="w-7 h-7 text-[#F7B32B]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] uppercase font-mono font-semibold text-[#E6332A] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#1A1918]/10 flex items-center gap-1 shadow-sm">
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
              <h4 className="text-sm font-sans font-semibold text-[#1A1918] truncate mt-1">
                {item.title}
              </h4>
              <div className="text-[11px] text-[#1A1918]/70 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="font-sans text-[#1A1918] font-medium">{item.pilotName || currentUser.name}</span>
                {item.distanceKm && (
                  <>
                    <span className="text-[#1A1918]/40">•</span>
                    <span className="text-[#1A1918] font-mono font-semibold bg-[#FAF6ED] px-1.5 py-0.2 rounded border border-[#1A1918]/10 text-[10px] shadow-sm">
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
        <div className="p-3 border-b border-[#1A1918]/10 bg-[#FAF6ED] shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4EEDB] rounded-xl border border-[#1A1918]/10 text-xs font-sans  ">
            <button
              onClick={() => setActiveTab('grupos')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                activeTab === 'grupos'
                  ? 'bg-[#E6332A] text-white shadow-sm font-semibold border border-[#1A1918]/10'
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
                  ? 'bg-[#E6332A] text-white shadow-sm font-semibold border border-[#1A1918]/10'
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
                <span className="flex items-center gap-2 font-mono font-bold text-[#1A1918]">
                  <span className="w-2 h-2 rounded-full bg-[#E6332A] animate-pulse"></span>
                  Enviar a grupo de WhatsApp de tu tribu
                </span>
                <span className="text-[10px] text-[#1A1918] font-mono font-semibold bg-[#F4EEDB] px-2 py-0.5 border border-[#1A1918]/15 rounded">
                  {availableCrews.length} disponibles
                </span>
              </div>

              <div className="space-y-2.5">
                {availableCrews.map((crew) => {
                  const isShared = sharedGroups.includes(crew.id);
                  return (
                    <div
                      key={crew.id}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                        isShared 
                          ? 'bg-[#F4EEDB] border-[#1A1918]/25' 
                          : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] border-[#1A1918]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={crew.coverImage} 
                            alt={crew.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#1A1918]/15 shadow-sm bg-[#F4EEDB]" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1A1918] text-[#FAF6ED] border border-[#FAF6ED] flex items-center justify-center shadow-xs">
                            <ShieldCheck className="w-2.5 h-2.5 text-[#FAF6ED]" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h5 className="text-sm font-sans font-bold text-[#1A1918] truncate">
                            {crew.name}
                          </h5>
                          <p className="text-[11px] text-[#1A1918]/70 truncate mt-0.5 flex items-center gap-1.5 font-mono">
                            <span className="text-[#1A1918] font-bold text-[10px] uppercase">{crew.members.length} pilotos</span>
                            <span>•</span>
                            <span className="truncate">
                              {crew.baseCity}
                            </span>
                          </p>
                          {crew.whatsappGroupUrl ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#1A1918] bg-[#F4EEDB] px-2 py-0.5 rounded-md border border-[#1A1918]/15">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E6332A]"></span>
                                WhatsApp Vinculado
                              </span>
                              <a
                                href={crew.whatsappGroupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-mono font-bold text-[#1A1918] hover:text-[#E6332A] underline flex items-center gap-0.5"
                                title="Abrir grupo en WhatsApp"
                              >
                                <span>Ver grupo</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#1A1918]/60 bg-[#F4EEDB] px-1.5 py-0.5 rounded border border-[#1A1918]/10 mt-1">
                              <MessageCircle className="w-2.5 h-2.5 text-[#1A1918]/60" />
                              WhatsApp disponible
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleShareToGroup(crew)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-sans font-bold transition-all duration-200 shrink-0 flex items-center justify-center gap-2 border shadow-sm active:shadow-none self-end sm:self-auto cursor-pointer ${
                          isShared
                            ? 'bg-[#1A1918]/80 text-[#FAF6ED] border-[#1A1918] cursor-default'
                            : 'bg-[#1A1918] hover:bg-[#E6332A] text-[#FAF6ED] border-[#1A1918]'
                        }`}
                        title={crew.whatsappGroupUrl ? `Abrir chat del grupo ${crew.name} con telemetría copiada` : 'Compartir con la tribu en WhatsApp'}
                      >
                        {isShared ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FAF6ED]" />
                            <span>Enviado</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-[#FAF6ED]" />
                            <span>{crew.whatsappGroupUrl ? 'Enviar al Grupo' : 'Enviar a Tribu'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {lastSharedCrew && (
                <div className="p-4 rounded-2xl bg-[#F4EEDB] border border-[#1A1918]/20 text-[#1A1918] text-xs space-y-2 animate-fadeIn shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-[#1A1918] text-[#FAF6ED] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-4 h-4 text-[#FAF6ED]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-bold text-[#1A1918] text-xs">
                        {lastSharedCrew.whatsappGroupUrl 
                          ? `¡Abriendo el chat del grupo ${lastSharedCrew.name} en WhatsApp!` 
                          : `¡Abriendo WhatsApp para compartir con ${lastSharedCrew.name}!`}
                      </p>
                      <p className="text-[11px] text-[#1A1918]/80 font-sans mt-0.5 leading-relaxed">
                        📋 <strong>La telemetría y el enlace GPS ya están en tu portapapeles.</strong> Solo presiona <strong>Pegar</strong> en la conversación del grupo para compartir la rodada con los pilotos.
                      </p>
                    </div>
                  </div>
                  {lastSharedCrew.whatsappGroupUrl && (
                    <div className="pt-2 border-t border-[#1A1918]/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[#1A1918]/60">¿El navegador bloqueó la ventana emergente?</span>
                      <a
                        href={lastSharedCrew.whatsappGroupUrl.startsWith('http') ? lastSharedCrew.whatsappGroupUrl : `https://${lastSharedCrew.whatsappGroupUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono font-bold text-[#E6332A] hover:underline flex items-center gap-1"
                      >
                        <span>Abrir grupo en WhatsApp ↗</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPARTIR (CON ENLACE Y APLICACIONES) */}
          {activeTab === 'compartir' && (
            <div className="space-y-4">
              {/* ENLACE PÚBLICO DIRECTO */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono font-semibold text-[#1A1918]/70 tracking-wider flex items-center gap-1.5">
                  <Copy className="w-3 h-3 text-[#E6332A]" />
                  Copiar enlace directo
                </label>
                <div className="flex items-center gap-2 p-2 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl focus-within:border-[#E6332A] transition shadow-sm">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="bg-transparent text-xs text-[#1A1918] font-mono flex-1 outline-none truncate px-2 font-bold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white font-sans font-semibold text-xs transition-all shrink-0 flex items-center gap-1.5 rounded-lg border border-[#1A1918]/10 shadow-sm active:shadow-none"
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
                  <div className="w-full border-t border-[#1A1918]/10" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono font-semibold tracking-wider">
                  <span className="bg-[#FAF6ED] px-3 text-[#1A1918]/60 border border-[#1A1918]/10 rounded-full">o enviar vía</span>
                </div>
              </div>

              {/* APLICACIONES EXTERNAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* WHATSAPP */}
                <button
                  onClick={handleShareWhatsApp}
                  className="p-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/15 font-sans font-bold text-xs transition-all duration-200 flex items-center gap-3.5 rounded-2xl active:shadow-none shadow-sm cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1A1918] group-hover:bg-[#E6332A] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918]/15 shadow-sm transition-colors">
                    <WhatsAppIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-bold text-xs">WhatsApp</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-sans truncate block">Chat directo o estado</span>
                  </div>
                </button>

                {/* TELEGRAM */}
                <button
                  onClick={handleShareTelegram}
                  className="p-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/15 font-sans font-bold text-xs transition-all duration-200 flex items-center gap-3.5 rounded-2xl active:shadow-none shadow-sm cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1A1918] group-hover:bg-[#E6332A] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918]/15 shadow-sm transition-colors">
                    <TelegramIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-bold text-xs">Telegram</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-sans truncate block">Canales y chats de ruta</span>
                  </div>
                </button>

                {/* X (TWITTER) */}
                <button
                  onClick={handleShareTwitter}
                  className="p-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/15 font-sans font-bold text-xs transition-all duration-200 flex items-center gap-3.5 rounded-2xl active:shadow-none shadow-sm cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1A1918] group-hover:bg-[#E6332A] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918]/15 shadow-sm transition-colors">
                    <span className="font-mono text-sm font-bold">𝕏</span>
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-bold text-xs">X (Twitter)</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-sans truncate block">Publicar con telemetría</span>
                  </div>
                </button>

                {/* FACEBOOK */}
                <button
                  onClick={handleShareFacebook}
                  className="p-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/15 font-sans font-bold text-xs transition-all duration-200 flex items-center gap-3.5 rounded-2xl active:shadow-none shadow-sm cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1A1918] group-hover:bg-[#E6332A] text-[#FAF6ED] flex items-center justify-center font-bold text-sm shrink-0 border border-[#1A1918]/15 shadow-sm transition-colors">
                    <FacebookIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="block text-[#1A1918] font-bold text-xs">Facebook</span>
                    <span className="text-[10px] text-[#1A1918]/60 font-sans truncate block">Muro o comunidad motera</span>
                  </div>
                </button>
              </div>

              {/* BOTÓN NATIVO MÓVIL */}
              {typeof navigator !== 'undefined' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3.5 px-4 bg-[#F4EEDB] hover:bg-[#EDE6D3] border border-[#1A1918]/10 text-[#1A1918] font-sans font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 rounded-xl active:shadow-none shadow-sm"
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
        <div className="p-4 bg-[#F4EEDB] border-t border-[#1A1918]/10 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#FAF6ED] hover:bg-[#EDE6D3] text-[#1A1918] border border-[#1A1918]/10 font-sans font-semibold text-xs transition-all active:shadow-none shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
