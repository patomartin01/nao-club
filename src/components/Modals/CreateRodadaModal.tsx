'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface CreateRodadaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRodadaModal: React.FC<CreateRodadaModalProps> = ({ isOpen, onClose }) => {
  const { createRodada, setActiveNavTab } = useApp();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Puente / Expedición Multi-días' | 'Fin de Semana' | 'Rodada Rápida 1 Día'>('Puente / Expedición Multi-días');
  const [startDate, setStartDate] = useState('2026-10-31');
  const [endDate, setEndDate] = useState('2026-11-02');
  const [originPoint, setOriginPoint] = useState('Interlomas, Huixquilucan, Edomex');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createRodada({
      title: title.trim(),
      subtitle: subtitle.trim() || 'Rodada propuesta por el grupo.',
      description: description.trim() || 'Plan de aventura en moto.',
      category,
      startDate,
      endDate,
      originPoint: originPoint.trim()
    });

    confetti({ particleCount: 70 });
    setActiveNavTab('rodada');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="border border-white/20 bg-[#0E0C0A] max-w-lg w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ NUEVA EXPEDICIÓN ]
            </span>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Crear Evento de Rodada
            </h3>
          </div>
          <button onClick={onClose} className="font-mono text-ash hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Título de la Expedición</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Travesía Nevado & Valle de Bravo"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Subtítulo / Manifiesto</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej. Campamento base y brechas técnicas de altura."
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Fecha de Salida</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>
            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Fecha de Regreso</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Punto de Partida</label>
            <input
              type="text"
              value={originPoint}
              onChange={(e) => setOriginPoint(e.target.value)}
              placeholder="Ej. Gasolinera Interlomas"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
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
              Iniciar Convocatoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
