'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { BikeType, RidingLevel } from '../../types';
import { 
  User, 
  Bike, 
  Camera, 
  Upload, 
  ArrowRight, 
  Check, 
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BIKE_TYPES: BikeType[] = [
  'Doble Propósito',
  'Adventure / Maxi-Trail',
  'Enduro / Dual Sport',
  'Scrambler',
  'Naked / Roadster',
  'Sport / Deportiva',
  'Custom / Cruiser',
  'Sport Touring',
  'Trail Ligera'
];

const RIDING_LEVELS: RidingLevel[] = [
  'Principiante',
  'Intermedio',
  'Avanzado',
  'Experto / Pro'
];

export const InitialOnboardingModal: React.FC = () => {
  const { 
    currentUser, 
    updateCurrentUserProfile, 
    addMotorcycle, 
    completeOnboarding,
    isOnboardingOpen,
    setActiveNavTab
  } = useApp();

  // Step 1: Profile info
  // Step 2: First motorcycle for the Hangar
  const [step, setStep] = useState<1 | 2>(1);

  // Pilot Profile State
  const [name, setName] = useState(currentUser.name || '');
  const [handle, setHandle] = useState(currentUser.handle?.replace(/^@/, '') || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || 'CDMX, México');
  const [ridingLevel, setRidingLevel] = useState<RidingLevel>(currentUser.ridingLevel || 'Intermedio');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatar || '');

  // Motorcycle State
  const [bikeBrand, setBikeBrand] = useState('BMW');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeNickname, setBikeNickname] = useState('');
  const [bikeYear, setBikeYear] = useState<number | string>(2023);
  const [bikeCc, setBikeCc] = useState<number | string>(1250);
  const [bikeType, setBikeType] = useState<BikeType>('Adventure / Maxi-Trail');
  const [bikeTires, setBikeTires] = useState('Continental TKC80 (50/50)');
  const [bikePhotoPreview, setBikePhotoPreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden File Inputs
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bikeFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOnboardingOpen) return null;

  // Handler for uploading pilot avatar from device gallery
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for uploading motorcycle photo from device gallery
  const handleBikeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBikePhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 -> Step 2
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedHandle = handle.trim().startsWith('@') 
      ? handle.trim().toLowerCase() 
      : `@${handle.trim().toLowerCase().replace(/\s+/g, '_')}`;

    try {
      await updateCurrentUserProfile({
        name: name.trim() || currentUser.name,
        handle: formattedHandle || currentUser.handle,
        bio: bio.trim() || 'Piloto en NAO.',
        location: location.trim() || 'México',
        ridingLevel,
        avatar: avatarPreview || currentUser.avatar
      });

      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 -> Finish & go to Hangar
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const defaultBikePhoto = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800';

    if (bikeModel.trim()) {
      addMotorcycle({
        userId: currentUser.id,
        brand: bikeBrand,
        model: bikeModel.trim(),
        year: Number(bikeYear) || 2023,
        displacementCc: Number(bikeCc) || 500,
        type: bikeType,
        nickname: bikeNickname.trim() || undefined,
        photoUrl: bikePhotoPreview || defaultBikePhoto,
        modifications: [],
        tires: bikeTires.trim() || 'Doble propósito'
      });
    }

    confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    completeOnboarding();
    setActiveNavTab('tu');
    setIsSubmitting(false);
  };

  // Skip adding motorcycle right now and just go to Hangar
  const handleSkipBike = () => {
    completeOnboarding();
    setActiveNavTab('tu');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-[#FAF6ED] border-3 border-[#1A1918] rounded-[32px] shadow-[10px_10px_0px_#1A1918] my-auto max-h-[94vh] overflow-y-auto text-[#1A1918] font-sans animate-scaleUp p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Step Indicator */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E6332A] animate-pulse" />
            <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#E6332A]">
              PASO {step} DE 2 • {step === 1 ? 'FICHA DE PILOTO' : 'TU MÁQUINA PRINCIPAL'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] font-black text-[#1A1918]">
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[#1A1918] ${step === 1 ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]' : 'bg-[#FAF6ED]'}`}>
              1
            </span>
            <span className="text-[#1A1918]/40">—</span>
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 border-[#1A1918] ${step === 2 ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]' : 'bg-[#FAF6ED]'}`}>
              2
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: PILOT PROFILE & APODO                             */}
        {/* ========================================================= */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-[#1A1918] uppercase tracking-tight">
                ¡Bienvenido a NAO! Configura tu credencial
              </h2>
              <p className="text-xs font-serif italic text-[#1A1918]/80">
                Elige tu apodo de piloto y sube tu foto desde tu galería para identificarte en el club y las rutas.
              </p>
            </div>

            {/* Avatar Upload from Gallery / Camera */}
            <div className="bg-[#F4EEDB] border-2 border-[#1A1918] p-4 sm:p-5 rounded-2xl shadow-[3px_3px_0px_#1A1918] flex items-center gap-4 sm:gap-5">
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              
              <div 
                onClick={() => avatarFileInputRef.current?.click()}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] bg-white cursor-pointer group shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={avatarPreview || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-[#1A1918]/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-mono font-bold uppercase p-1 text-center">
                  <Camera className="w-4 h-4 mb-1" />
                  Cambiar
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wide">
                    Foto de Perfil
                  </h4>
                  <p className="text-[11px] font-serif italic text-[#1A1918]/70">
                    Sube tu foto favorita con casco, rodando o de tu galería.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E6332A]" />
                  <span>Subir de mi galería</span>
                </button>
              </div>
            </div>

            {/* Form Fields: Name & Handle */}
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
                    placeholder="Ej. Roberto Sánchez"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Apodo / Handle de Piloto *
                </label>
                <div className="relative">
                  <span className="text-xs font-mono font-bold text-[#E6332A] absolute left-3 top-1/2 -translate-y-1/2">@</span>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="roberto_gs"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-8 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>
            </div>

            {/* City & Riding Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Ciudad Base / Ubicación
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. CDMX / Guadalajara / Mty"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Nivel de Manejo
                </label>
                <select
                  value={ridingLevel}
                  onChange={(e) => setRidingLevel(e.target.value as RidingLevel)}
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                >
                  {RIDING_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Bio Breve (Opcional)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ej. Rodando curvas los fines de semana y terracería ligera en las mañanas..."
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl p-3 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
              />
            </div>

            {/* Next Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>Continuar: Registrar mi Moto en el Hangar</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: REGISTER MOTORCYCLE IN HANGAR                     */}
        {/* ========================================================= */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-display font-black text-[#1A1918] uppercase tracking-tight">
                Añade tu máquina al Hangar
              </h2>
              <p className="text-xs font-serif italic text-[#1A1918]/80">
                Tu moto aparecerá en tus estadísticas, bitácora y perfil oficial del club. Sube su foto real.
              </p>
            </div>

            {/* Bike Photo Upload from Gallery / Camera (No preset photos) */}
            <div className="bg-[#F4EEDB] border-2 border-[#1A1918] p-4 sm:p-5 rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-3">
              <input
                ref={bikeFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBikeFileChange}
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div 
                  onClick={() => bikeFileInputRef.current?.click()}
                  className="relative w-full sm:w-40 h-28 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] bg-white cursor-pointer group shrink-0 flex items-center justify-center"
                >
                  {bikePhotoPreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={bikePhotoPreview} 
                        alt="Foto de la moto" 
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <div className="absolute inset-0 bg-[#1A1918]/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-mono font-bold uppercase p-1">
                        <Camera className="w-4 h-4 mb-1" />
                        Cambiar foto
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center text-[#1A1918]/60 group-hover:text-[#E6332A] transition">
                      <Bike className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-mono uppercase font-black">
                        Tocar para subir foto
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-display font-black text-[#1A1918] uppercase tracking-wide">
                      Foto de tu Moto (Galería / Cámara)
                    </h4>
                    <p className="text-[11px] font-serif italic text-[#1A1918]/70">
                      Sube una foto de tu propia moto directamente desde tu teléfono o computadora.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => bikeFileInputRef.current?.click()}
                    className="px-4 py-2 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#E6332A]" />
                    <span>{bikePhotoPreview ? 'Cambiar Foto de Galería' : 'Subir Foto de Galería'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Marca *
                </label>
                <select
                  value={bikeBrand}
                  onChange={(e) => setBikeBrand(e.target.value)}
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                >
                  {['BMW', 'KTM', 'Honda', 'Yamaha', 'Ducati', 'Triumph', 'Husqvarna', 'Royal Enfield', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'Moto Guzzi', 'Aprilia', 'CFMOTO', 'Otro'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Modelo de la Moto *
                </label>
                <input
                  type="text"
                  required
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  placeholder="Ej. R 1250 GS Adventure / Tenere 700"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            {/* Nickname, Year, CC */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Apodo (Opcional)
                </label>
                <input
                  type="text"
                  value={bikeNickname}
                  onChange={(e) => setBikeNickname(e.target.value)}
                  placeholder="Ej. La Furia"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Año
                </label>
                <input
                  type="number"
                  min="1970"
                  max="2027"
                  value={bikeYear}
                  onChange={(e) => setBikeYear(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2024"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Cilindrada (cc)
                </label>
                <input
                  type="number"
                  min="50"
                  max="2500"
                  value={bikeCc}
                  onChange={(e) => setBikeCc(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Ej. 411"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            {/* Type & Tires */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Tipo de Moto
                </label>
                <select
                  value={bikeType}
                  onChange={(e) => setBikeType(e.target.value as BikeType)}
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                >
                  {BIKE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Neumáticos Instalados
                </label>
                <input
                  type="text"
                  value={bikeTires}
                  onChange={(e) => setBikeTires(e.target.value)}
                  placeholder="Ej. Continental TKC80 (50/50)"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !bikeModel.trim()}
                className="w-full sm:flex-1 py-3.5 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Guardar Moto y Entrar al Hangar</span>
              </button>

              <button
                type="button"
                onClick={handleSkipBike}
                className="w-full sm:w-auto px-5 py-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[2px_2px_0px_#1A1918] cursor-pointer"
              >
                Hacerlo más tarde
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
