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
  Key
} from 'lucide-react';
import { Crew } from '../../types';

interface CreateCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 2c-5.502 0-9.971 4.468-9.971 9.97 0 1.761.459 3.479 1.331 4.992L2 22l5.166-1.354a9.923 9.923 0 0 0 4.865 1.258h.004c5.498 0 9.967-4.47 9.967-9.972 0-2.663-1.037-5.166-2.92-7.049A9.897 9.897 0 0 0 12.031 2zm5.792 14.18c-.244.686-1.22 1.258-1.722 1.328-.468.065-1.08.1-3.14-.754-2.637-1.092-4.328-3.784-4.46-3.959-.131-.174-1.06-1.41-1.06-2.689 0-1.278.67-1.908.91-2.164.24-.256.524-.32.698-.32.174 0 .349.002.502.01.163.008.382-.062.597.455.22.529.742 1.81.808 1.942.065.131.109.284.022.458-.087.174-.131.284-.262.436-.131.153-.275.342-.393.458-.131.131-.268.273-.116.535.153.262.68 1.118 1.458 1.81.998.889 1.84 1.164 2.102 1.295.262.131.415.109.568-.065.153-.175.655-.764.83-1.026.174-.262.349-.218.59-.131.24.087 1.528.72 1.79.851.262.131.436.196.502.305.066.109.066.633-.178 1.319z"/>
  </svg>
);

const COVER_PRESETS = [
  {
    id: 'sierra-basalto',
    name: 'Sierra Basalto',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    tone: 'Terracota & Roca',
  },
  {
    id: 'nevado-glaciar',
    name: 'Nevado Glaciar',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    tone: 'Glaciar & Nieve',
  },
  {
    id: 'bosque-coniferas',
    name: 'Bosque Coníferas',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200',
    tone: 'Selva & Musgo',
  },
  {
    id: 'canon-arcilla',
    name: 'Cañón Arcilla',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200',
    tone: 'Ocre & Desierto',
  }
];

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

export const CreateCrewModal: React.FC<CreateCrewModalProps> = ({ isOpen, onClose }) => {
  const { createCrew, enterCrew, setActiveNavTab, currentUser } = useApp();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('Comunidad de aventura, terracería y expediciones.');
  const [description, setDescription] = useState('');
  const [baseCity, setBaseCity] = useState('Interlomas / CDMX');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');
  const [showWhatsappHelp, setShowWhatsappHelp] = useState(false);

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

              {/* Campo 4: Portada */}
              <div>
                <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black block mb-1">
                  Fotografía de Portada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COVER_PRESETS.map((preset) => {
                    const isSelected = coverImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`p-1.5 rounded-xl border-2 text-left transition flex flex-col gap-1 cursor-pointer shadow-[2px_2px_0px_#1A1918] ${
                          isSelected 
                            ? 'border-[#1A1918] ring-2 ring-[#E6332A] bg-[#FAF6ED]' 
                            : 'border-[#1A1918] bg-[#F4EEDB] hover:bg-[#FAF6ED]'
                        }`}
                      >
                        <div className="h-10 w-full rounded-lg overflow-hidden border border-[#1A1918]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={preset.url} 
                            alt={preset.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className={`text-[10px] font-display font-black uppercase truncate ${isSelected ? 'text-[#E6332A]' : 'text-[#1A1918]'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[8px] text-[#1A1918]/60 font-serif italic truncate -mt-0.5 font-bold">
                          {preset.tone}
                        </span>
                      </button>
                    );
                  })}
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
