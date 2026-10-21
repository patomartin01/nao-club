'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Key, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JoinCrewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinCrewModal: React.FC<JoinCrewModalProps> = ({ isOpen, onClose }) => {
  const { joinCrewByCode } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const res = joinCrewByCode(code);
    if (res.success) {
      setSuccess(res.message);
      setError('');
      confetti({ particleCount: 50 });
      setTimeout(() => {
        setSuccess('');
        setCode('');
        onClose();
      }, 1500);
    } else {
      setError(res.message);
      setSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">Unirse a un Moto Club</h3>
              <p className="text-xs text-slate-400">Ingresa la clave única que te compartió el grupo.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Código de Invitación</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. MAMI-2026"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold tracking-widest text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
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
              Unirme al Crew
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
