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
      <div className="border border-[#1A1918]/10 bg-[#FAF6ED] max-w-md w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto rounded-[28px] shadow-sm text-[#1A1918] font-sans animate-scaleUp">
        <div className="flex items-center justify-between border-b border-[#1A1918]/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-semibold block">
              CLAVE DE ACCESO
            </span>
            <h3 className="font-display font-semibold text-2xl text-[#1A1918]  ">
              Unirse con código
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-[#F4EEDB] border border-[#1A1918]/10 text-[#1A1918] hover:bg-[#E6332A] hover:text-white flex items-center justify-center transition shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-4 text-xs">
          <div>
            <label className="text-[#1A1918]/70 uppercase text-[10px] font-sans font-semibold block mb-1.5">
              Clave de invitación
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ej. BRAVA-44"
              className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-4 py-3.5 font-display font-semibold text-xl text-[#1A1918] focus:outline-none focus:border-[#E6332A] text-center rounded-xl shadow-sm"
            />
            <p className="text-[11px] text-[#1A1918]/60 mt-2 text-center font-sans font-bold">
              Claves demo: <span className="font-mono text-[#E6332A] font-semibold not-italic">[ NAO-2026 ]</span> o <span className="font-mono text-[#E6332A] font-semibold not-italic">[ BRAVA-44 ]</span>
            </p>
          </div>

          {error && (
            <div className="p-3.5 border border-[#1A1918]/10 bg-[#E6332A] text-white text-xs font-sans rounded-xl font-bold shadow-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 border border-[#1A1918]/10 bg-[#1D4477] text-white text-xs font-sans font-semibold rounded-xl shadow-sm">
              {success}
            </div>
          )}

          <div className="pt-3 border-t border-[#1A1918]/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB] font-sans font-semibold text-xs rounded-xl transition shadow-sm active:shadow-none"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 font-sans font-semibold text-xs rounded-xl transition shadow-sm active:shadow-none"
            >
              Unirse a tribu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
