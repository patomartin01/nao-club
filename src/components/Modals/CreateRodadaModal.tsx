'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Plus, MapPin } from 'lucide-react';
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
  const [category, setCategory] = useState<'Puente / Expedición Multi-días' | 'Fin de Semana' | 'Rodada Rápida 1 Día'>('Fin de Semana');
  const [startDate, setStartDate] = useState('2026-11-14');
  const [endDate, setEndDate] = useState('2026-11-15');
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">Crear Nueva Rodada / Evento</h3>
              <p className="text-xs text-slate-400">Abre un espacio para que los miembros propongan y voten rutas.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Nombre de la Rodada</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Ruta del Café & Niebla en Sierra Norte"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Subtítulo / Objetivo</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej. 2 días acampando ligero y terracerías húmedas"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Fin de Semana">Fin de Semana (2 días)</option>
                <option value="Puente / Expedición Multi-días">Puente / Multi-días (3+ días)</option>
                <option value="Rodada Rápida 1 Día">Rodada Rápida (1 día)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Punto de Salida</label>
              <input
                type="text"
                value={originPoint}
                onChange={(e) => setOriginPoint(e.target.value)}
                placeholder="Ej. Interlomas, CDMX"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Fecha de Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Fecha de Retorno</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
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
              Publicar Rodada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
