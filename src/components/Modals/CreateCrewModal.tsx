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
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setWhatsappGroupUrl(text.trim());
        }
      }
    } catch {
      // Browser permission denied or not supported
    }
  };

  const handleCopyCode = () => {
    if (!createdCrew) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(createdCrew.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleCopyNaoShareLink = () => {
    if (!createdCrew) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
    const link = `${origin}/?tab=tribus&tribu=${createdCrew.id}&code=${createdCrew.inviteCode}`;
    const textToCopy = `🏍️ Únete a nuestra tribu "${createdCrew.name}" en NAO\n🔑 Clave de acceso: ${createdCrew.inviteCode}\n🔗 Enlace oficial: ${link}`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedNaoLink(true);
      setTimeout(() => setCopiedNaoLink(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCrew = createCrew({
      name: name.trim(),
      tagline: tagline.trim() || 'Tribu de motos trail y doble propósito.',
      description: description.trim() || 'Comunidad para organizar rodadas de fin de semana y expediciones.',
      baseCity: baseCity.trim() || 'México',
      coverImage: coverImage.trim() || COVER_PRESETS[0].url,
      whatsappGroupUrl: whatsappGroupUrl.trim() || undefined
    });

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    setCreatedCrew(newCrew);
  };

  const handleFinishAndEnterCrew = () => {
    if (createdCrew) {
      enterCrew(createdCrew.id);
      setActiveNavTab('tribus');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="border border-white/20 bg-[#12100E] max-w-xl w-full p-4 sm:p-7 space-y-5 my-auto max-h-[94vh] overflow-y-auto font-mono text-chalk shadow-2xl relative">
        
        {/* Tick-mark top ruler accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-earth to-transparent opacity-80" />

        {/* ============================================================== */}
        {/* SUCCESS VIEW: POST-CREATION TWO-WAY BRIDGE                    */}
        {/* ============================================================== */}
        {createdCrew ? (
          <div className="space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="text-center space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Tribu Fundada con Éxito
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {createdCrew.name}
              </h3>
              <p className="text-xs text-ash max-w-md mx-auto">
                Comparte la clave o el enlace con tus pilotos para que entren a la tribu.
              </p>
            </div>

            {/* Crew Identity Card */}
            <div className="border border-white/10 bg-black/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-earth" />
                  <span className="text-xs font-bold text-white uppercase">{createdCrew.baseCity}</span>
                </div>
                <span className="text-[10px] font-mono text-ash">
                  1 Piloto (Admin)
                </span>
              </div>

              {/* Clave de Acceso */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-ash block">Clave del Club</span>
                  <span className="text-base font-display font-black text-earth tracking-widest">{createdCrew.inviteCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-md border border-white/15 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold uppercase flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-ash" />
                      <span>Copiar Clave</span>
                    </>
                  )}
                </button>
              </div>

              {/* Puente WhatsApp: Enlace para pegar en WhatsApp */}
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Enlace para WhatsApp</span>
                </div>
                <p className="text-[11px] text-ash leading-relaxed">
                  Pégalo en la <strong>descripción de tu grupo de WhatsApp</strong>:
                </p>
                <button
                  type="button"
                  onClick={handleCopyNaoShareLink}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow cursor-pointer"
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
                className="w-full py-3 bg-earth hover:bg-earth-bright text-white uppercase font-display font-black text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Entrar a la Tribu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* FORM VIEW: POLISHED OUTDOOR CREATION WIZARD                    */
          /* ============================================================== */
          <>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 gap-3">
              <div>
                <span className="font-mono text-[9px] text-earth uppercase tracking-widest font-bold block">
                  NUEVA TRIBU
                </span>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  Fundar Tribu
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="text-ash hover:text-white p-1.5 border border-white/10 hover:border-white/30 transition shrink-0 cursor-pointer"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* LIVE CARD PREVIEW (Diseño Táctico Inspiracional) */}
            <div className="border border-white/15 bg-black/60 rounded-xl overflow-hidden relative group">
              <div className="relative h-16 sm:h-20 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={coverImage} 
                  alt="Cover Preview" 
                  className="w-full h-full object-cover opacity-45 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/70 to-transparent" />
                
                {/* Badges en la portada */}
                <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between text-[10px]">
                  <span className="bg-black/70 border border-white/20 text-white px-1.5 py-0.5 font-bold uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3 text-earth" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </span>
                  {isWhatsappValid ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 font-bold flex items-center gap-1">
                      <WhatsAppIcon className="w-3 h-3 text-emerald-400" />
                      <span>WhatsApp Conectado</span>
                    </span>
                  ) : (
                    <span className="bg-black/60 border border-white/10 text-ash px-1.5 py-0.5">
                      Sin WhatsApp
                    </span>
                  )}
                </div>

                {/* Título en la tarjeta */}
                <div className="absolute bottom-1.5 left-2.5 right-2.5">
                  <h4 className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight truncate">
                    {name.trim() || 'Nombre de tu Tribu'}
                  </h4>
                  <p className="text-[10px] text-ash truncate">
                    {baseCity}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              
              {/* Campo 1: Nombre */}
              <div>
                <label className="text-ash uppercase text-[10px] font-bold block mb-1">
                  Nombre de la Tribu <span className="text-earth">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Nao Off-Road Squad / Sierra Brava MC"
                  className="w-full bg-white/[0.04] border border-white/15 px-3 py-2.5 text-white placeholder-ash/50 focus:outline-none focus:border-earth text-xs font-bold uppercase tracking-wider"
                />
                
                {/* Sugerencias de Nombre */}
                {!name && (
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[9px] text-ash/60">Sugerencias:</span>
                    {['Paso de Cortés Dual-Sport', 'Enduro Nevado Club', 'Brecha Brava MC'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setName(sug)}
                        className="text-[9px] text-ash hover:text-earth border border-white/10 hover:border-earth/30 px-1.5 py-0.5 transition cursor-pointer"
                      >
                        +{sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Campo 2: Estilo / Tagline */}
              <div>
                <label className="text-ash uppercase text-[10px] font-bold block mb-1">
                  Vibe
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ej. Terracería y campamentos"
                  className="w-full bg-white/[0.04] border border-white/15 px-3 py-2 text-white placeholder-ash/50 focus:outline-none focus:border-earth text-xs"
                />
                
                {/* Chips de Vibe */}
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {VIBE_PRESETS.map((vp) => (
                    <button
                      key={vp.label}
                      type="button"
                      onClick={() => setTagline(vp.tagline)}
                      className={`text-[10px] text-left px-2 py-1 border transition truncate cursor-pointer ${
                        tagline === vp.tagline 
                          ? 'border-earth text-earth bg-earth/10 font-bold' 
                          : 'border-white/10 text-ash hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {vp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo 3: Ciudad Base */}
              <div>
                <label className="text-ash uppercase text-[10px] font-bold block mb-1">
                  Ciudad Base
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-earth absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={baseCity}
                    onChange={(e) => setBaseCity(e.target.value)}
                    placeholder="Ej. Interlomas / Valle de Bravo"
                    className="w-full bg-white/[0.04] border border-white/15 pl-8 pr-3 py-2 text-white placeholder-ash/50 focus:outline-none focus:border-earth text-xs"
                  />
                </div>
                {/* Chips de ciudades */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {CITY_PRESETS.map((cp) => (
                    <button
                      key={cp}
                      type="button"
                      onClick={() => setBaseCity(cp)}
                      className={`text-[9px] px-2 py-0.5 border transition cursor-pointer ${
                        baseCity === cp
                          ? 'border-earth text-earth bg-earth/10 font-bold'
                          : 'border-white/10 text-ash hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo 4: Portada */}
              <div>
                <label className="text-ash uppercase text-[10px] font-bold block mb-1">
                  Portada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COVER_PRESETS.map((preset) => {
                    const isSelected = coverImage === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-1 cursor-pointer ${
                          isSelected 
                            ? 'border-earth bg-earth/10 ring-1 ring-earth' 
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="h-10 w-full rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={preset.url} 
                            alt={preset.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-earth' : 'text-white'}`}>
                          {preset.name}
                        </span>
                        <span className="text-[8px] text-ash truncate -mt-0.5">
                          {preset.tone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campo 5: El Puente WhatsApp */}
              <div className="p-3 bg-emerald-950/15 border border-emerald-500/25 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-emerald-400 uppercase text-[10px] font-bold flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp (Opcional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowWhatsappHelp(prev => !prev)}
                    className="text-ash hover:text-white flex items-center gap-1 text-[9px] transition cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3 text-emerald-400" />
                    <span>{showWhatsappHelp ? 'Ocultar' : '¿Cómo obtenerlo?'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={whatsappGroupUrl}
                    onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="flex-1 bg-black/60 border border-white/15 px-3 py-2 text-white placeholder-ash/40 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handlePasteWhatsapp}
                    title="Pegar enlace del portapapeles"
                    className="px-2.5 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-ash hover:text-white text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Pegar</span>
                  </button>
                </div>

                {/* Estado de validación */}
                {isWhatsappValid ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>WhatsApp verificado</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-ash/70 block">
                    Opcional. Puedes añadirlo después.
                  </span>
                )}

                {/* Guía interactiva paso a paso */}
                {showWhatsappHelp && (
                  <div className="mt-2 p-2.5 bg-black/50 border border-white/10 text-[10px] text-ash space-y-1.5 rounded">
                    <p className="font-bold text-white">¿Cómo sacar el enlace de tu grupo de WhatsApp?</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-chalk/80">
                      <li>Abre tu grupo en WhatsApp y toca el nombre arriba.</li>
                      <li>Desplázate hasta <strong>&quot;Enlace de invitación al grupo&quot;</strong>.</li>
                      <li>Toca <strong>&quot;Copiar enlace&quot;</strong> y pégalo aquí.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white transition cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-2/3 py-2.5 bg-earth hover:bg-earth-bright disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase font-display font-bold text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Crear Tribu</span>
                </button>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
