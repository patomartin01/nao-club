'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RidingLevel } from '../../types';
import { 
  X, 
  User, 
  AtSign, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  AlertCircle, 
  Camera, 
  Check, 
  Sparkles,
  HeartPulse,
  Bike,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crop
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Procesa y cuadra cualquier imagen (incluso panorámica o vertical) al centro con orientación correcta y tamaño óptimo
const processAvatarSquare = (
  imgSrc: string,
  zoom: number = 1,
  offsetX: number = 0,
  offsetY: number = 0,
  targetSize = 600
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imgSrc);
        return;
      }

      ctx.fillStyle = '#FAF6ED';
      ctx.fillRect(0, 0, targetSize, targetSize);

      // Calcular proporción cover inicial
      const scale = Math.max(targetSize / img.width, targetSize / img.height) * zoom;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      // Centrado con offset del usuario
      const x = (targetSize - drawWidth) / 2 + offsetX;
      const y = (targetSize - drawHeight) / 2 + offsetY;

      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => resolve(imgSrc);
    img.src = imgSrc;
  });
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
];

const RIDING_LEVELS: RidingLevel[] = [
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto / Pro'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile, checkHandleAvailability } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [handleError, setHandleError] = useState<string | null>(null);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || 'México');
  const [ridingLevel, setRidingLevel] = useState<RidingLevel>(currentUser.ridingLevel || 'Intermedio');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser.emergencyContact || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  
  // Modal de ajuste de encuadre (Crop / Zoom)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawPhotoSrc, setRawPhotoSrc] = useState<string>('');
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setHandle(currentUser.handle);
      setHandleError(null);
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || 'México');
      setRidingLevel(currentUser.ridingLevel || 'Intermedio');
      setPhone(currentUser.phone || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setAvatar(currentUser.avatar);
      setSuccess(false);
      setCropModalOpen(false);
      setRawPhotoSrc('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const raw = reader.result;
        setRawPhotoSrc(raw);
        setCropZoom(1);
        setCropOffsetX(0);
        setCropOffsetY(0);

        // Pre-procesar a 600x600 cuadrado automáticamente sin distorsión
        try {
          const processed = await processAvatarSquare(raw, 1, 0, 0, 600);
          setAvatar(processed);
          setCropModalOpen(true); // Abrir ajuste interactivo opcional por si quiere centrar la cara
        } catch {
          setAvatar(raw);
        } finally {
          setIsProcessingPhoto(false);
        }
      }
    };
    reader.readAsDataURL(file);
    // Limpiar input para permitir seleccionar la misma foto si se desea
    e.target.value = '';
  };

  const handleApplyCrop = async () => {
    if (!rawPhotoSrc) {
      setCropModalOpen(false);
      return;
    }
    setIsProcessingPhoto(true);
    try {
      const cropped = await processAvatarSquare(rawPhotoSrc, cropZoom, cropOffsetX, cropOffsetY, 600);
      setAvatar(cropped);
      setCropModalOpen(false);
    } catch {
      setCropModalOpen(false);
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandleError(null);
    setSaving(true);

    const cleanHandle = handle.trim().toLowerCase().replace(/^@/, '');
    if (!cleanHandle) {
      setHandleError('El usuario o apodo de piloto no puede estar vacío.');
      setSaving(false);
      return;
    }

    const formattedHandle = `@${cleanHandle.replace(/\s+/g, '_')}`;

    if (checkHandleAvailability) {
      const check = await checkHandleAvailability(formattedHandle, currentUser.id);
      if (!check.available) {
        setHandleError(check.message || 'Este apodo ya está en uso por otro piloto.');
        setSaving(false);
        return;
      }
    }

    if (updateCurrentUserProfile) {
      const res = await updateCurrentUserProfile({
        name: name.trim() || currentUser.name,
        handle: formattedHandle,
        bio: bio.trim(),
        location: location.trim(),
        ridingLevel,
        phone: phone.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        avatar: customAvatarInput.trim() || avatar
      });

      if (!res.success) {
        setHandleError(res.message || 'No se pudo guardar los cambios.');
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setSuccess(true);
    try {
      confetti({ particleCount: 30, spread: 60 });
    } catch {}

    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] my-auto max-h-[88vh] sm:max-h-[90vh] overflow-y-auto overscroll-contain text-[#1A1918] font-sans animate-scaleUp p-5 sm:p-8 space-y-6 pb-24 sm:pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4 sticky top-0 bg-[#FAF6ED] z-10 pt-1 -mt-1">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#E6332A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E6332A]" />
              EXPEDICIÓN // CREDENCIAL OFICIAL
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#1A1918] uppercase tracking-wide">
              Editar Perfil de Piloto
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Interactivo de Ajuste / Encuadre de Foto */}
        {cropModalOpen && rawPhotoSrc && (
          <div className="bg-[#FAF6ED] border-2 border-[#E6332A] rounded-2xl p-4 shadow-[4px_4px_0px_#1A1918] space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1A1918]/20 pb-2">
              <div className="flex items-center gap-1.5">
                <Crop className="w-4 h-4 text-[#E6332A]" />
                <span className="text-xs font-display font-black uppercase text-[#1A1918]">
                  Ajustar Encuadre Cuadrado
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#1A1918]/60">
                Centra tu foto para que no salga con zoom
              </span>
            </div>

            {/* Vista previa en cuadrado exacto */}
            <div className="flex justify-center py-2">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-2 border-[#1A1918] overflow-hidden relative shadow-[3px_3px_0px_#1A1918] bg-black/5 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rawPhotoSrc}
                  alt="Encuadre"
                  style={{
                    transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.05s ease-out',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div className="absolute inset-0 border border-white/40 pointer-events-none rounded-2xl" />
              </div>
            </div>

            {/* Controles de Zoom y Ajuste */}
            <div className="space-y-2 bg-[#F4EEDB] p-3 rounded-xl border border-[#1A1918]/30">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1A1918]">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-[#E6332A]" /> Zoom / Escala
                </span>
                <span>{Math.round(cropZoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-3.5 h-3.5 text-[#1A1918]/70" />
                <input
                  type="range"
                  min="0.8"
                  max="2.5"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#E6332A] cursor-pointer"
                />
                <ZoomIn className="w-3.5 h-3.5 text-[#1A1918]" />
              </div>

              {/* Botón de reset */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCropZoom(1);
                    setCropOffsetX(0);
                    setCropOffsetY(0);
                  }}
                  className="text-[10px] font-mono text-[#1A1918]/70 hover:text-[#1A1918] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reestablecer centrado
                </button>
              </div>
            </div>

            {/* Botones de acción del encuadre */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="flex-1 py-2 px-3 bg-white text-[#1A1918] border border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider hover:bg-[#FAF6ED] transition cursor-pointer"
              >
                Mantener Auto-Crop
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                disabled={isProcessingPhoto}
                className="flex-1 py-2 px-3 bg-[#E6332A] text-white border border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider hover:bg-[#d02c24] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Listo, Aplicar Foto</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Selector Section from Device Gallery */}
          <div className="space-y-3 bg-[#F4EEDB] border-2 border-[#1A1918] p-4 rounded-2xl shadow-[3px_3px_0px_#1A1918]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Foto de Perfil del Piloto (Galería de Fotos)
              </label>
              {isProcessingPhoto && (
                <span className="text-[10px] font-mono font-bold text-[#E6332A] animate-pulse">
                  Procesando foto...
                </span>
              )}
            </div>
            
            <input
              type="file"
              id="edit-profile-avatar-file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelected}
            />

            <div className="flex items-center gap-4">
              <label 
                htmlFor="edit-profile-avatar-file"
                className="relative shrink-0 cursor-pointer group block"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] bg-[#FAF6ED] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={avatar} 
                    alt={name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1.5 bg-[#E6332A] text-white rounded-lg border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                  <Camera className="w-3.5 h-3.5" />
                </span>
              </label>

              <div className="flex-1 space-y-2">
                <label
                  htmlFor="edit-profile-avatar-file"
                  className="px-3.5 py-2.5 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E6332A]" />
                  <span>Subir foto de mi galería</span>
                </label>
                <p className="text-[10px] font-serif italic text-[#1A1918]/70">
                  Formato cuadrado automático (1:1), optimizado sin desbordes ni zoom forzado.
                </p>
              </div>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Patricio Martin"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Handle / Usuario *
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    if (handleError) setHandleError(null);
                  }}
                  placeholder="@patricio_adv"
                  className={`w-full bg-[#FAF6ED] border-2 ${handleError ? 'border-[#E6332A] bg-[#FFF5F5]' : 'border-[#1A1918]'} focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]`}
                />
              </div>
              {handleError ? (
                <p className="mt-1.5 text-[11px] font-mono text-[#E6332A] font-bold flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{handleError}</span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] font-mono text-[#1A1918]/60">
                  Identificador único sin duplicados en el club (@usuario).
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
              Biografía de Piloto
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ej. Apasionado por las brechas de montaña, el doble propósito y rodadas nocturnas..."
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl p-3 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
            />
          </div>

          {/* Location & Riding Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Ciudad / Base
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Ciudad de México"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Nivel de Manejo
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={ridingLevel}
                  onChange={(e) => setRidingLevel(e.target.value as RidingLevel)}
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                >
                  {RIDING_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Safety & Emergency Contact Section */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-4 space-y-3 shadow-[3px_3px_0px_#1A1918]">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#E6332A]" />
              <span className="text-[10px] font-mono uppercase font-black text-[#E6332A] tracking-wider">
                SEGURIDAD EN RUTA // CONTACTO DE EMERGENCIA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-[#1A1918] block mb-1">
                  Tu Teléfono
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-[#1A1918] block mb-1">
                  Contacto SOS (Nombre y Tel)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Ej. Sofía (Hermana): 55 9876 5432"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>
          </div>

          {/* Hangar Callout */}
          <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] flex items-center justify-center text-[#E6332A] shrink-0">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-display font-black uppercase text-[#1A1918]">¿Deseas editar tus motocicletas?</p>
                <p className="text-[10px] font-serif italic text-[#1A1918]/70">Ve a la pestaña &quot;Hangar&quot; de tu perfil o usa el botón &quot;Editar Hangar&quot;.</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-2 py-3 px-6 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Cambios Guardados!</span>
                </>
              ) : saving ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar Credencial</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
