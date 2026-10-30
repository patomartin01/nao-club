'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { 
  X, 
  MapPin, 
  Shield, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Compass, 
  Mountain, 
  Users, 
  ArrowRight,
  ClipboardPaste,
  HelpCircle,
  Key,
  Upload,
  Camera,
  Image as ImageIcon,
  Dices,
  RotateCcw
} from 'lucide-react';
import { Crew } from '../../types';

interface CreateCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.1-.475-.15-.675.15-.2.301-.775.978-.95 1.179-.175.2-.351.226-.651.076-.3-.15-1.268-.467-2.416-1.491-.893-.797-1.496-1.782-1.672-2.082-.175-.3-.019-.462.131-.611.136-.134.301-.351.451-.526.15-.175.2-.3.301-.501.1-.2.05-.375-.025-.526-.075-.15-.676-1.63-.926-2.232-.243-.587-.49-.507-.675-.516-.175-.01-.376-.01-.576-.01-.2 0-.526.075-.802.375-.275.3-1.052 1.028-1.052 2.508 0 1.479 1.077 2.908 1.228 3.109.15.2 2.12 3.237 5.136 4.54.717.311 1.277.496 1.714.635.72.229 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.826.49 3.538 1.344 5.013L2.05 21.95a.75.75 0 00.923.923l4.937-1.294A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zM3.5 12c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5a8.46 8.46 0 01-4.48-1.278.75.75 0 00-.512-.116l-3.376.885.885-3.376a.75.75 0 00-.116-.512A8.46 8.46 0 013.5 12z"/>
  </svg>
);

// Patrones geométricos vectoriales de aventura y branding NAO (#FAF6ED, #1A1918, #E6332A, #F7B32B)
export const BRANDING_PATTERNS: { id: string; name: string; svg: string }[] = [
  {
    id: 'topo-contour',
    name: 'Curvas Topográficas',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%231A1918"/><path d="M0 100 Q 200 40, 400 120 T 800 80 L 800 400 L 0 400 Z" fill="%2322201E"/><path d="M0 160 Q 250 80, 500 180 T 800 140 L 800 400 L 0 400 Z" fill="%232A2825"/><path d="M0 220 Q 200 160, 450 250 T 800 200 L 800 400 L 0 400 Z" fill="%23383531"/><path d="M0 290 Q 300 230, 550 310 T 800 280 L 800 400 L 0 400 Z" fill="%23E6332A" opacity="0.85"/><circle cx="680" cy="90" r="45" fill="%23F7B32B" opacity="0.9"/><path d="M50 360 L120 280 L190 360 Z" fill="%23FAF6ED" opacity="0.15"/><path d="M160 360 L240 250 L320 360 Z" fill="%23FAF6ED" opacity="0.12"/></svg>`
  },
  {
    id: 'desert-dunes',
    name: 'Dunas Terracota',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23FAF6ED"/><path d="M-50 260 C 150 180, 300 320, 500 240 C 650 180, 750 220, 850 190 L 850 450 L -50 450 Z" fill="%23F4EEDB"/><path d="M-50 290 C 180 230, 320 340, 520 280 C 680 240, 780 260, 850 240 L 850 450 L -50 450 Z" fill="%23F7B32B" opacity="0.35"/><path d="M-50 330 C 220 280, 380 370, 580 320 C 720 290, 800 310, 850 290 L 850 450 L -50 450 Z" fill="%23E6332A" opacity="0.88"/><circle cx="160" cy="110" r="50" fill="%23E6332A" opacity="0.2"/><path d="M0 40 L800 40 M0 80 L800 80 M0 120 L800 120" stroke="%231A1918" stroke-width="1" stroke-dasharray="8 12" opacity="0.12"/></svg>`
  },
  {
    id: 'sierra-peaks',
    name: 'Picos de la Sierra',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%231A1918"/><polygon points="80,400 240,160 400,400" fill="%232D2A26"/><polygon points="260,400 450,110 640,400" fill="%233A3631"/><polygon points="460,400 620,180 780,400" fill="%23E6332A" opacity="0.8"/><polygon points="240,160 270,210 210,210" fill="%23FAF6ED" opacity="0.85"/><polygon points="450,110 490,180 410,180" fill="%23F7B32B" opacity="0.95"/><circle cx="680" cy="80" r="30" fill="%23F7B32B"/><line x1="0" y1="380" x2="800" y2="380" stroke="%23FAF6ED" stroke-width="4" opacity="0.3"/></svg>`
  },
  {
    id: 'rally-geo',
    name: 'Geometría Rally NAO',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23FAF6ED"/><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="%231A1918" stroke-width="0.8" opacity="0.08"/></pattern><rect width="800" height="400" fill="url(%23grid)"/><polygon points="0,0 350,0 200,400 0,400" fill="%231A1918"/><polygon points="210,400 360,0 480,0 330,400" fill="%23E6332A"/><polygon points="340,400 490,0 540,0 390,400" fill="%23F7B32B"/><circle cx="650" cy="200" r="70" fill="none" stroke="%231A1918" stroke-width="4"/><circle cx="650" cy="200" r="55" fill="none" stroke="%23E6332A" stroke-width="2" stroke-dasharray="6 6"/></svg>`
  },
  {
    id: 'trail-tracks',
    name: 'Trazos de Huella',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%231A1918"/><path d="M-50 350 Q 200 200, 450 300 T 850 180" fill="none" stroke="%23F7B32B" stroke-width="24" stroke-linecap="round" opacity="0.85"/><path d="M-50 350 Q 200 200, 450 300 T 850 180" fill="none" stroke="%231A1918" stroke-width="6" stroke-dasharray="14 14"/><path d="M-50 250 Q 250 350, 550 150 T 850 280" fill="none" stroke="%23E6332A" stroke-width="16" opacity="0.8"/><circle cx="450" cy="300" r="16" fill="%23FAF6ED"/><circle cx="450" cy="300" r="8" fill="%231A1918"/></svg>`
  }
];

export const getRandomBrandingPattern = (): string => {
  const index = Math.floor(Math.random() * BRANDING_PATTERNS.length);
  return BRANDING_PATTERNS[index].svg;
};

const CITY_PRESETS = [
  'Interlomas / CDMX',
  'Valle de Bravo',
  'Monterrey',
  'Guadalajara',
  'Puebla / Cholula',
  'Querétaro'
];

const VIBE_PRESETS = [
  { label: '🏔️ Dual-Sport / Trail', tagline: 'Rodadas trail, terracería ligera y campamento de montaña.' },
  { label: '🌲 Enduro / Brechas', tagline: 'Single-track, brechas técnicas y pasos de río.' },
  { label: '🏕️ Moto Camping', tagline: 'Expediciones con tienda de campaña, fogata y alforjas.' },
  { label: '🏍️ Scrambler & Aventura', tagline: 'Paseos escénicos, carreteras secundarias y buena comida.' },
];

const compressCoverImage = (dataUrl: string, maxWidth = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const CreateCrewModal: React.FC<CreateCrewModalProps> = ({ isOpen, onClose }) => {
  const { createCrew, enterCrew, setActiveNavTab, currentUser } = useApp();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('Comunidad de aventura, terracería y expediciones.');
  const [description, setDescription] = useState('');
  const [baseCity, setBaseCity] = useState('Interlomas / CDMX');
  const [coverImage, setCoverImage] = useState(() => getRandomBrandingPattern());
  const [hasCustomCover, setHasCustomCover] = useState(false);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');
  const [showWhatsappHelp, setShowWhatsappHelp] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Success state after creation
  const [createdCrew, setCreatedCrew] = useState<Crew | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedNaoLink, setCopiedNaoLink] = useState(false);

  if (!isOpen) return null;

  const isWhatsappValid = Boolean(
    whatsappGroupUrl.trim().includes('chat.whatsapp.com')
  );

  const handlePasteWhatsapp = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setWhatsappGroupUrl(text.trim());
      }
    } catch (e) {
      console.warn('Clipboard read error', e);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          if (typeof reader.result === 'string') {
            const compressed = await compressCoverImage(reader.result, 1200, 0.85);
            setCoverImage(compressed);
            setHasCustomCover(true);
          }
        } catch (err) {
          console.error('Error compressing image', err);
          if (typeof reader.result === 'string') {
            setCoverImage(reader.result);
            setHasCustomCover(true);
          }
        } finally {
          setIsUploadingCover(false);
        }
      };
      reader.onerror = () => setIsUploadingCover(false);
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file', err);
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCrew = createCrew({
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim() || tagline.trim(),
      baseCity: baseCity.trim(),
      coverImage: coverImage,
      whatsappGroupUrl: whatsappGroupUrl.trim() || undefined,
    });

    setCreatedCrew(newCrew);
    confetti({ particleCount: 75, spread: 70 });
  };

  const handleCopyCode = () => {
    if (!createdCrew) return;
    navigator.clipboard?.writeText(createdCrew.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyNaoShareLink = () => {
    if (!createdCrew) return;
    const shareText = `🏍️ Únete a nuestra Tribu en NAO: "${createdCrew.name}"\n\n📍 Base: ${createdCrew.baseCity}\n🔑 Clave de entrada: ${createdCrew.inviteCode}\n\nIngresa aquí: ${window.location.origin}`;
    navigator.clipboard?.writeText(shareText);
    setCopiedNaoLink(true);
    setTimeout(() => setCopiedNaoLink(false), 2000);
  };

  const handleFinishAndEnterCrew = () => {
    if (createdCrew) {
      enterCrew(createdCrew.id);
      setActiveNavTab('tribus');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="border-2 border-[#1A1918] bg-[#FAF6ED] max-w-xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[94vh] overflow-y-auto font-sans text-[#1A1918] shadow-[8px_8px_0px_#1A1918] relative rounded-[28px] animate-scaleUp">
        
        {/* ============================================================== */}
        {/* SUCCESS VIEW: POST-CREATION TWO-WAY BRIDGE                    */}
        {/* ============================================================== */}
        {createdCrew ? (
          <div className="space-y-6 py-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-display font-black uppercase tracking-widest bg-[#F7B32B] border-2 border-[#1A1918] text-[#1A1918] shadow-[2px_2px_0px_#1A1918]">
                <Sparkles className="w-3.5 h-3.5 text-[#1A1918]" />
                Club Fundado con Éxito
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-wide">
                {createdCrew.name}
              </h3>
              <p className="text-xs text-[#1A1918]/70 font-serif italic max-w-md mx-auto font-medium">
                Comparte la clave o el enlace con tus pilotos para que entren a la tribu.
              </p>
            </div>

            {/* Crew Identity Card */}
            <div className="border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl p-4 space-y-3.5 shadow-[4px_4px_0px_#1A1918]">
              <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E6332A]" />
                  <span className="text-xs font-display font-black text-[#1A1918] uppercase">{createdCrew.baseCity}</span>
                </div>
                <span className="text-[10px] font-display font-black text-[#1A1918]/70 uppercase">
                  1 Piloto (Admin)
                </span>
              </div>

              {/* Clave de Acceso */}
              <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-3 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918]">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/60 block font-display font-black">Clave del Club</span>
                  <span className="text-xl font-display font-black text-[#1A1918] tracking-widest">{createdCrew.inviteCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl border-2 border-[#1A1918] bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] text-xs font-display font-black uppercase flex items-center gap-1.5 transition cursor-pointer shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1A1918]" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#1A1918]" />
                      <span>Copiar Clave</span>
                    </>
                  )}
                </button>
              </div>

              {/* Puente WhatsApp */}
              <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-3.5 space-y-2 shadow-[2px_2px_0px_#1A1918]">
                <div className="flex items-center gap-2 text-[#1A1918] text-xs font-display font-black uppercase">
                  <WhatsAppIcon className="w-4 h-4 text-[#1D4477]" />
                  <span>Enlace para WhatsApp</span>
                </div>
                <p className="text-[11px] text-[#1A1918]/80 leading-relaxed font-serif italic">
                  Pégalo en la <strong>descripción de tu grupo de WhatsApp</strong>:
                </p>
                <button
                  type="button"
                  onClick={handleCopyNaoShareLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#1D4477] hover:bg-[#15345b] text-white border-2 border-[#1A1918] font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[3px_3px_0px_#1A1918] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  {copiedNaoLink ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Enlace para WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFinishAndEnterCrew}
                className="w-full py-3.5 bg-[#E6332A] hover:bg-[#d02c24] text-white uppercase font-display font-black text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border-2 border-[#1A1918] shadow-[4px_4px_0px_#1A1918] rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Entrar a la Tribu</span>
                <ArrowRight className="w-4 h-4 text-[#F7B32B]" />
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* FORM VIEW: POLISHED MATCHBOOK CREATION WIZARD                  */
          /* ============================================================== */
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3 gap-3">
              <div>
                <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black block">
                  ★ NUEVA COMUNIDAD ★
                </span>
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  Fundar Club
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-xl bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] hover:bg-[#E6332A] hover:text-white flex items-center justify-center transition shadow-[2px_2px_0px_#1A1918]"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIVE CARD PREVIEW */}
            <div className="border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl overflow-hidden relative group shadow-[4px_4px_0px_#1A1918]">
              <div className="relative h-20 sm:h-24 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={coverImage} 
                  alt="Cover Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1918]/80 via-[#1A1918]/30 to-transparent" />
                
                {/* Badges en la portada */}
                <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                  <span className="bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] px-2 py-0.5 font-display font-black uppercase flex items-center gap-1 rounded-lg shadow-[1px_1px_0px_#1A1918]">
                    <Shield className="w-3 h-3 text-[#E6332A]" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </span>
                  {isWhatsappValid ? (
                    <span className="bg-[#1D4477] text-white border-2 border-[#1A1918] px-2 py-0.5 font-display font-black text-[9px] uppercase flex items-center gap-1 rounded-lg shadow-[1px_1px_0px_#1A1918]">
                      <WhatsAppIcon className="w-3 h-3 text-white" />
                      <span>WhatsApp Conectado</span>
                    </span>
                  ) : (
                    <span className="bg-[#1A1918]/80 text-[#FAF6ED] border border-[#1A1918] px-2 py-0.5 text-[9px] font-display font-black uppercase rounded-lg">
                      Sin WhatsApp
                    </span>
                  )}
                </div>

                {/* Título en la tarjeta */}
                <div className="absolute bottom-2 left-3 right-3 text-white">
                  <h4 className="font-display font-black text-base text-white uppercase tracking-wide truncate drop-shadow-sm">
                    {name.trim() || 'Nombre de tu Tribu'}
                  </h4>
                  <p className="text-[10px] text-stone-200 font-serif italic truncate font-bold">
                    {baseCity}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              
              {/* Campo 1: Nombre */}
              <div>
                <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black block mb-1">
                  Nombre de la Tribu <span className="text-[#E6332A]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sierra Brava MC / Nao Dual-Sport"
                  className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] text-xs font-display font-black uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#1A1918]"
                />
                
                {/* Sugerencias de Nombre */}
                {!name && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-[#1A1918]/60 font-serif italic font-bold">Sugerencias:</span>
                    {['Paso de Cortés Dual-Sport', 'Enduro Nevado Club', 'Brecha Brava MC'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setName(sug)}
                        className="text-[10px] text-[#1A1918] hover:bg-[#F7B32B] border-2 border-[#1A1918] bg-[#FAF6ED] px-2 py-0.5 rounded-lg font-display font-black transition cursor-pointer shadow-[1px_1px_0px_#1A1918]"
                      >
                        +{sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campo 2: Estilo / Tagline */}
              <div>
                <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black block mb-1">
                  Estilo &amp; Propósito
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ej. Terracería y campamentos"
                  className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] text-xs rounded-xl shadow-[2px_2px_0px_#1A1918] font-medium"
                />
                
                {/* Chips de Vibe */}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {VIBE_PRESETS.map((vp) => (
                    <button
                      key={vp.label}
                      type="button"
                      onClick={() => setTagline(vp.tagline)}
                      className={`text-[10px] text-left px-2.5 py-1.5 border-2 rounded-xl transition truncate cursor-pointer shadow-[1px_1px_0px_#1A1918] ${
                        tagline === vp.tagline 
                          ? 'border-[#1A1918] text-[#1A1918] bg-[#F7B32B] font-display font-black' 
                          : 'border-[#1A1918] text-[#1A1918] hover:bg-[#F4EEDB] bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      {vp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo 3: Ciudad Base */}
              <div>
                <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black block mb-1">
                  Ciudad Base
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#E6332A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={baseCity}
                    onChange={(e) => setBaseCity(e.target.value)}
                    placeholder="Ej. Interlomas / Valle de Bravo"
                    className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] pl-8 pr-3 py-2 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] text-xs rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                  />
                </div>
                {/* Chips de ciudades */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {CITY_PRESETS.map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setBaseCity(cp)}
                      className={`text-[10px] px-2.5 py-0.5 border-2 rounded-lg transition cursor-pointer font-display shadow-[1px_1px_0px_#1A1918] ${
                        baseCity === cp
                          ? 'border-[#1A1918] text-[#1A1918] bg-[#F7B32B] font-black'
                          : 'border-[#1A1918] text-[#1A1918] hover:bg-[#F4EEDB] bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo 4: Fotografía de Portada (Galería o Patrón Aleatorio con Branding) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>Fotografía de Portada</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {hasCustomCover && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHasCustomCover(false);
                          setCoverImage(getRandomBrandingPattern());
                        }}
                        className="text-[9px] font-mono text-[#E6332A] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Usar patrón</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasCustomCover(false);
                        setCoverImage(getRandomBrandingPattern());
                      }}
                      className="text-[9px] font-mono text-[#1A1918]/70 hover:text-[#1A1918] bg-[#F4EEDB] border border-[#1A1918] px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer font-bold"
                      title="Cambiar patrón aleatorio"
                    >
                      <Dices className="w-3 h-3 text-[#E6332A]" />
                      <span>Aleatorio</span>
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer border-2 border-[#1A1918] rounded-2xl overflow-hidden bg-[#FAF6ED] shadow-[3px_3px_0px_#1A1918] hover:border-[#E6332A] transition p-3 flex flex-col sm:flex-row items-center gap-3.5"
                >
                  <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden border-2 border-[#1A1918] relative shrink-0 bg-[#F4EEDB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={coverImage} 
                      alt="Vista previa de portada" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-display font-black text-[#1A1918] group-hover:text-[#E6332A] transition uppercase tracking-wide">
                      <Upload className="w-3.5 h-3.5 text-[#E6332A]" />
                      <span>{isUploadingCover ? 'Optimizando foto...' : 'Subir foto de tu galería'}</span>
                    </div>
                    <p className="text-[10px] text-[#1A1918]/70 font-serif italic mt-0.5 leading-snug">
                      {hasCustomCover 
                        ? '✓ Foto personalizada cargada desde tu dispositivo.' 
                        : 'Si no subes foto, se asigna automáticamente este patrón con los colores y la vibra del club.'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1918] text-[#FAF6ED] rounded-lg text-[9px] font-display font-black uppercase tracking-wider group-hover:bg-[#E6332A] transition">
                      <span>{hasCustomCover ? 'Cambiar foto de galería' : 'Elegir de la galería (opcional)'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campo 5: El Puente WhatsApp */}
              <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl space-y-2 shadow-[2px_2px_0px_#1A1918]">
                <div className="flex items-center justify-between">
                  <label className="text-[#1D4477] uppercase text-[10px] font-display font-black flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#1D4477]" />
                    <span>WhatsApp (Opcional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowWhatsappHelp(prev => !prev)}
                    className="text-[#1A1918]/70 hover:text-[#1A1918] flex items-center gap-1 text-[10px] font-display font-black transition cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#1D4477]" />
                    <span>{showWhatsappHelp ? 'Ocultar' : '¿Cómo obtenerlo?'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={whatsappGroupUrl}
                    onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="flex-1 bg-[#FAF6ED] border-2 border-[#1A1918] px-3 py-2 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] text-xs rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                  />
                  <button
                    type="button"
                    onClick={handlePasteWhatsapp}
                    title="Pegar enlace del portapapeles"
                    className="px-3 py-2 bg-[#FAF6ED] hover:bg-[#F7B32B] border-2 border-[#1A1918] text-[#1A1918] text-[10px] font-display font-black uppercase transition flex items-center gap-1 cursor-pointer shrink-0 rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5 text-[#1A1918]" />
                    <span>Pegar</span>
                  </button>
                </div>

                {/* Estado de validación */}
                {isWhatsappValid ? (
                  <div className="flex items-center gap-1.5 text-[#1D4477] text-[10px] font-display font-black">
                    <Check className="w-3.5 h-3.5 text-[#1D4477]" />
                    <span>WhatsApp verificado</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#1A1918]/60 font-serif italic block font-medium">
                    Opcional. Puedes añadirlo después.
                  </span>
                )}

                {/* Guía interactiva paso a paso */}
                {showWhatsappHelp && (
                  <div className="mt-2 p-3 bg-[#FAF6ED] border-2 border-[#1A1918] text-[10px] text-[#1A1918] space-y-1.5 rounded-xl shadow-[2px_2px_0px_#1A1918]">
                    <p className="font-display font-black text-[#1A1918] uppercase">¿Cómo sacar el enlace de tu grupo de WhatsApp?</p>
                    <ol className="list-decimal list-inside space-y-1 font-serif italic text-[#1A1918]/80 font-medium">
                      <li>Abre tu grupo en WhatsApp y toca el nombre arriba.</li>
                      <li>Desplázate hasta <strong>&quot;Enlace de invitación al grupo&quot;</strong>.</li>
                      <li>Toca <strong>&quot;Copiar enlace&quot;</strong> y pégalo aquí.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t-2 border-[#1A1918] flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 border-2 border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] uppercase font-display font-black tracking-wider hover:bg-[#F4EEDB] transition cursor-pointer text-xs rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-2/3 py-3 bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-50 disabled:cursor-not-allowed text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#1A1918] rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F7B32B]" />
                  <span>Crear Club</span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
