'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

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
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCrew({
      name: name.trim(),
      tagline: tagline.trim() || 'Tribu de motos trail y doble propósito.',
      description: description.trim() || 'Comunidad para organizar rodadas de fin de semana y expediciones.',
      baseCity: baseCity.trim(),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
      whatsappGroupUrl: whatsappGroupUrl.trim() || undefined
    });

    confetti({ particleCount: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="border border-white/20 bg-[#0E0C0A] max-w-lg w-full p-5 sm:p-8 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ CREACIÓN DE TRIBU ]
            </span>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Crear Nueva Tribu
            </h3>
            <p className="text-[11px] text-ash mt-1">
              Como creador de la tribu, serás el Administrador del grupo para moderar y consagrar rodadas.
            </p>
          </div>
          <button onClick={onClose} className="text-ash hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Nombre de la Tribu</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Nao Off-Road Squad"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Ciudad / Base de Salida</label>
            <input
              type="text"
              value={baseCity}
              onChange={(e) => setBaseCity(e.target.value)}
              placeholder="Ej. Interlomas / Valle de Bravo"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Descripción de la Comunidad</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Filosofía de manejo, nivel de terracería y tipo de motos..."
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Enlace de invitación al grupo de WhatsApp (Opcional)</label>
            <input
              type="url"
              value={whatsappGroupUrl}
              onChange={(e) => setWhatsappGroupUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/Jg1AKUEqoXF7nXZuAPJ588"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth text-xs font-mono"
            />
            <span className="text-[10px] text-ash/70 mt-1 block">
              En WhatsApp: Abre tu grupo &gt; <strong>Info. del grupo</strong> &gt; <strong>Enlace de invitación al grupo</strong> y pégalo aquí para que tus pilotos se unan en 1 toque.
            </span>
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold tracking-widest transition"
            >
              Crear Tribu (Admin)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
