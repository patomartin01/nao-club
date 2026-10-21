'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Key } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="border border-white/20 bg-[#0E0C0A] max-w-md w-full p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ ACCESO A FLOTILLA ]
            </span>
            <h3 className="font-display font-bold text-xl text-white uppercase">
              Unirse con Clave
            </h3>
          </div>
          <button onClick={onClose} className="font-mono text-ash hover:text-white">✕</button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Clave de Invitación</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. BRAVA-44"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-3 font-mono text-base tracking-widest text-white uppercase focus:outline-none focus:border-earth text-center"
            />
            <p className="text-[10px] text-ash mt-1 text-center">Claves demo: MAMI-2026 o BRAVA-44</p>
          </div>

          {error && (
            <div className="p-3 border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
              {success}
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold tracking-widest transition"
            >
              Validar Acceso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
