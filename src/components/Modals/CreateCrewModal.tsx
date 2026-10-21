'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCrewModal: React.FC<CreateCrewModalProps> = ({ isOpen, onClose }) => {
  const { createCrew } = useApp();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [baseCity, setBaseCity] = useState('Interlomas / CDMX');
  const [coverImage, setCoverImage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCrew({
      name: name.trim(),
      tagline: tagline.trim() || 'Club de motos trail y doble propósito.',
      description: description.trim() || 'Comunidad para organizar rodadas de fin de semana y expediciones.',
      baseCity: baseCity.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200'
    });

    confetti({ particleCount: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">Crear Nuevo Moto Club</h3>
              <p className="text-xs text-slate-400">Se generará una clave única para invitar a tus amigos.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Nombre del Club / Squad</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Trail Hunters Poniente"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Lema / Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej. Brechas, curvas y campamentos sin prisas."
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Ciudad Base</label>
            <input
              type="text"
              value={baseCity}
              onChange={(e) => setBaseCity(e.target.value)}
              placeholder="Ej. Interlomas, Naucalpan, Toluca"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Descripción</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué tipo de motos o nivel de pilotos frecuentan?"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 shadow-glow"
            >
              Crear Club & Generar Clave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
