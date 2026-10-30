'use client';

import React, { useState, useEffect } from 'react';
import { Motorcycle, BikeType } from '../../types';
import { X, Wrench, Check, Camera, Sparkles, Upload } from 'lucide-react';

interface EditMotorcycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: Motorcycle | null;
  onSave: (id: string, updates: Partial<Motorcycle>) => void;
}

const PRESET_MOTO_PHOTOS = [
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=800'
];

const BIKE_TYPES: BikeType[] = [
  'Doble Propósito',
  'Adventure / Maxi-Trail',
  'Enduro / Dual Sport',
  'Scrambler',
  'Naked / Roadster',
  'Custom / Cruiser',
  'Sport / Deportiva',
  'Sport Touring',
  'Trail Ligera'
];

export const EditMotorcycleModal: React.FC<EditMotorcycleModalProps> = ({
  isOpen,
  onClose,
  bike,
  onSave
}) => {
  const [brand, setBrand] = useState('BMW');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | string>(2023);
  const [displacementCc, setDisplacementCc] = useState<number | string>(1250);
  const [type, setType] = useState<BikeType>('Doble Propósito');
  const [nickname, setNickname] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tires, setTires] = useState('');
  const [modificationsInput, setModificationsInput] = useState('');
  const editBikeFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEditBikePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const raw = reader.result;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxW = 900;
            let w = img.width;
            let h = img.height;
            if (w > maxW) {
              h = Math.round((h * maxW) / w);
              w = maxW;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              setPhotoUrl(raw);
            }
          };
          img.onerror = () => setPhotoUrl(raw);
          img.src = raw;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync state whenever bike changes
  useEffect(() => {
    if (bike) {
      setBrand(bike.brand || 'BMW');
      setModel(bike.model || '');
      setYear(bike.year || 2023);
      setDisplacementCc(bike.displacementCc || 1250);
      setType(bike.type || 'Doble Propósito');
      setNickname(bike.nickname || '');
      setPhotoUrl(bike.photoUrl || '');
      setTires(bike.tires || 'Continental TKC80 (50/50)');
      setModificationsInput(
        bike.modifications && bike.modifications.length > 0
          ? bike.modifications.join(', ')
          : 'Original de fábrica'
      );
    }
  }, [bike]);

  if (!isOpen || !bike) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;

    const modsArray = modificationsInput
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    onSave(bike.id, {
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year) || 2023,
      displacementCc: Number(displacementCc) || 500,
      type,
      nickname: nickname.trim() || undefined,
      photoUrl: photoUrl.trim() || PRESET_MOTO_PHOTOS[0],
      tires: tires.trim() || 'Mixtas 70/30',
      modifications: modsArray.length > 0 ? modsArray : ['Original de fábrica']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1918]/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_#1A1918] my-8 animate-in fade-in-0 zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b-2 border-[#1A1918] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black">
                ★ TALLER // EXPEDITION WORKSHOP ★
              </span>
              <span className="text-[9px] font-mono bg-[#F4EEDB] px-2 py-0.5 border border-[#1A1918] rounded font-bold text-[#1A1918]">
                ID: {bike.id.slice(0, 10)}
              </span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-wide flex items-center gap-2">
              <Wrench className="w-6 h-6 text-[#E6332A]" />
              <span>Editar Máquina del Hangar</span>
            </h3>
            <p className="text-xs font-serif italic text-[#1A1918]/70">
              Ajusta las especificaciones técnicas, neumáticos, modificaciones o foto de tu moto.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 border-2 border-[#1A1918] rounded-xl bg-[#F4EEDB] hover:bg-[#E6332A] hover:text-white text-[#1A1918] transition shadow-[2px_2px_0px_#1A1918] cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Marca de la Moto
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej. BMW, KTM, Yamaha, Honda"
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] font-bold focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Modelo / Denominación
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ej. R 1250 GS Adventure"
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] font-bold focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
              />
            </div>
          </div>

          {/* Nickname & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Apodo o Nombre de Ruta (Opcional)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ej. Tromba Negra, Panzer, El Pato"
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Tipo / Disciplina
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as BikeType)}
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] font-bold focus:outline-none transition shadow-[2px_2px_0px_#1A1918] cursor-pointer"
              >
                {BIKE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Year & Displacement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Año de Fabricación
              </label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="2024"
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] font-mono font-bold focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                Cilindrada (CC)
              </label>
              <input
                type="number"
                min="50"
                max="2500"
                value={displacementCc}
                onChange={(e) => setDisplacementCc(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="Ej. 411"
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] font-mono font-bold focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
              />
            </div>
          </div>

          {/* Tires */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
              Neumáticos / Compuesto Montado
            </label>
            <input
              type="text"
              value={tires}
              onChange={(e) => setTires(e.target.value)}
              placeholder="Ej. Continental TKC80 (50/50), Motoz Tractionator RallZ"
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
            />
          </div>

          {/* Modifications */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
              Modificaciones y Equipamiento de Ruta (Separadas por comas)
            </label>
            <input
              type="text"
              value={modificationsInput}
              onChange={(e) => setModificationsInput(e.target.value)}
              placeholder="Ej. Skid plate aluminio, Defensas de motor, Escape Akrapovič, Faros auxiliares"
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none transition shadow-[2px_2px_0px_#1A1918]"
            />
          </div>

          {/* Photo Selector from Device Gallery */}
          <div className="space-y-3 border-t-2 border-[#1A1918] pt-4">
            <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#E6332A]" />
              <span>Fotografía de la Máquina (Galería de Fotos)</span>
            </label>

            <input
              ref={editBikeFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleEditBikePhotoUpload}
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF6ED] border-2 border-[#1A1918] p-3.5 rounded-2xl shadow-[2px_2px_0px_#1A1918]">
              <div 
                onClick={() => editBikeFileInputRef.current?.click()}
                className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden border-2 border-[#1A1918] bg-white cursor-pointer group shrink-0 flex items-center justify-center"
              >
                {photoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl} alt="Foto de la moto" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-[#1A1918]/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-mono font-bold uppercase p-1">
                      <Camera className="w-4 h-4 mb-1" />
                      Cambiar
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-[#1A1918]/60 group-hover:text-[#E6332A] transition">
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-mono uppercase font-bold">Subir foto</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-serif italic text-[#1A1918]/80 font-medium">
                  Sube una foto de tu propia moto desde la galería de tu dispositivo.
                </p>
                <button
                  type="button"
                  onClick={() => editBikeFileInputRef.current?.click()}
                  className="px-4 py-2 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#E6332A]" />
                  <span>{photoUrl ? 'Cambiar Foto de Galería' : 'Subir Foto de Galería'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#1A1918]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] transition shadow-[2px_2px_0px_#1A1918] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Ficha Técnica</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
