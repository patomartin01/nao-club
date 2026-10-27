'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Key, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="border-2 border-[#1A1918] bg-[#FAF6ED] max-w-md w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto rounded-[28px] shadow-[8px_8px_0px_#1A1918] text-[#1A1918] font-sans animate-scaleUp">
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black block">
              ★ CLAVE DE ACCESO ★
            </span>
            <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
              Unirse con Código
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] hover:bg-[#E6332A] hover:text-white flex items-center justify-center transition shadow-[2px_2px_0px_#1A1918]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 text-xs">
          <div>
            <label className="text-[#1A1918]/70 uppercase text-[10px] font-display font-black block mb-1.5">
              Clave de Invitación
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. BRAVA-44"
              className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-4 py-3.5 font-display font-black text-xl tracking-[0.2em] text-[#1A1918] uppercase focus:outline-none focus:border-[#E6332A] text-center rounded-xl shadow-[3px_3px_0px_#1A1918]"
            />
            <p className="text-[11px] text-[#1A1918]/60 mt-2 text-center font-serif italic font-bold">
              Claves demo: <span className="font-mono text-[#E6332A] font-black not-italic">[ NAO-2026 ]</span> o <span className="font-mono text-[#E6332A] font-black not-italic">[ BRAVA-44 ]</span>
            </p>
          </div>

          {error && (
            <div className="p-3.5 border-2 border-[#1A1918] bg-[#E6332A] text-white text-xs font-serif italic rounded-xl font-bold shadow-[2px_2px_0px_#1A1918]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 border-2 border-[#1A1918] bg-[#1D4477] text-white text-xs font-display font-black uppercase rounded-xl shadow-[2px_2px_0px_#1A1918]">
              {success}
            </div>
          )}

          <div className="pt-3 border-t-2 border-[#1A1918] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border-2 border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB] uppercase font-display font-black text-xs tracking-wider rounded-xl transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-widest rounded-xl transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Unirse a Tribu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
