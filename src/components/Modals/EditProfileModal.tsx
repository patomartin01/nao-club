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
  HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || 'México');
  const [ridingLevel, setRidingLevel] = useState<RidingLevel>(currentUser.ridingLevel || 'Intermedio');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser.emergencyContact || '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setHandle(currentUser.handle);
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || 'México');
      setRidingLevel(currentUser.ridingLevel || 'Intermedio');
      setPhone(currentUser.phone || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setAvatar(currentUser.avatar);
      setSuccess(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formattedHandle = handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`;

    if (updateCurrentUserProfile) {
      await updateCurrentUserProfile({
        name: name.trim() || currentUser.name,
        handle: formattedHandle,
        bio: bio.trim(),
        location: location.trim(),
        ridingLevel,
        phone: phone.trim() || undefined,
        emergencyContact: emergencyContact.trim() || undefined,
        avatar: customAvatarInput.trim() || avatar
      });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] my-auto max-h-[92vh] overflow-y-auto text-[#1A1918] font-sans animate-scaleUp p-5 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
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
            className="p-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
            title="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Selector Section */}
          <div className="space-y-2.5 bg-[#F4EEDB] border-2 border-[#1A1918] p-4 rounded-2xl shadow-[3px_3px_0px_#1A1918]">
            <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
              Foto de Perfil del Piloto
            </label>
            
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={customAvatarInput.trim() || avatar} 
                  alt={name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] bg-[#FAF6ED]" 
                />
                <span className="absolute -bottom-1 -right-1 p-1 bg-[#E6332A] text-white rounded-lg border border-[#1A1918]">
                  <Camera className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-serif italic text-[#1A1918]/70">
                  Selecciona uno de los retratos de ruta o pega el enlace a tu foto:
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setAvatar(url); setCustomAvatarInput(''); }}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                        avatar === url && !customAvatarInput 
                          ? 'border-[#E6332A] scale-105 shadow-[2px_2px_0px_#E6332A]' 
                          : 'border-[#1A1918] hover:opacity-80'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <input
              type="url"
              value={customAvatarInput}
              onChange={(e) => setCustomAvatarInput(e.target.value)}
              placeholder="O pega una URL de imagen (https://...)"
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
            />
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
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@patricio_adv"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
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
