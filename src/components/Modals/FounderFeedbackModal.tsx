'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MessageSquarePlus, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FounderFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FounderFeedbackModal: React.FC<FounderFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { currentUserFounderNumber, sendFounderFeedback } = useApp();

  const [category, setCategory] = useState<'sugerencia' | 'problema' | 'comentario' | 'idea'>('sugerencia');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Por favor redacta tu sugerencia o comentario.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await sendFounderFeedback(category, message);
      if (res.success) {
        setSuccess(true);
        try {
          confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
        } catch {}
        setTimeout(() => {
          setSuccess(false);
          setMessage('');
          onClose();
        }, 1800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al enviar feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-[#1A1918]/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#FAF6ED] border-3 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] p-5 sm:p-6 space-y-4 text-[#1A1918] relative animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F7B32B] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#E6332A] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                CANAL EXCLUSIVO • TOP 50
              </span>
              <span className="text-xs font-mono font-black uppercase text-[#1A1918]">
                Piloto Fundador #{currentUserFounderNumber ?? 'Top 50'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] flex items-center justify-center transition active:scale-95 shadow-[2px_2px_0px_#1A1918] cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3 animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#E8F5E9] border-2 border-[#1A1918] flex items-center justify-center text-[#2E7D32] shadow-[3px_3px_0px_#1A1918]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-display font-black text-xl uppercase text-[#1A1918]">
              ¡Mensaje Recibido!
            </h3>
            <p className="text-xs font-serif italic text-[#1A1918]/80 max-w-xs mx-auto">
              Gracias por ayudarnos a construir NAO. Tu sugerencia le llegó directamente al CEO en su panel de administración.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-wide text-[#1A1918] flex items-center gap-1.5">
                <MessageSquarePlus className="w-4 h-4 text-[#E6332A]" />
                Buzón de Fundadores
              </h2>
              <p className="text-[11px] font-serif italic text-[#1A1918]/70 mt-0.5">
                Como uno de los primeros 50 pilotos, tu voz define el futuro de la plataforma. Escribe cualquier idea, fallo o mejora que notes.
              </p>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1A1918]/80">
                Tipo de Mensaje
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {[
                  { id: 'sugerencia', label: 'Sugerencia' },
                  { id: 'idea', label: 'Nueva Idea' },
                  { id: 'problema', label: 'Fallo / Bug' },
                  { id: 'comentario', label: 'Comentario' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer text-center ${
                      category === item.id
                        ? 'bg-[#1A1918] text-[#FAF6ED] shadow-[2px_2px_0px_#1A1918]'
                        : 'bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-black uppercase tracking-wider text-[#1A1918]/80">
                Tu Mensaje
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="¿Qué te gustaría ver, cambiar o añadir en la app? Cuéntanos..."
                rows={4}
                maxLength={600}
                required
                className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-3 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none focus:ring-2 focus:ring-[#E6332A] resize-none shadow-[2px_2px_0px_#1A1918]"
              />
              <div className="flex justify-between items-center text-[9px] font-mono text-[#1A1918]/50">
                <span>Directo a Patricio Martin Vidal (CEO)</span>
                <span>{message.length} / 600</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-[#FFEBEE] border-2 border-[#E6332A] text-[#C62828] text-[11px] font-mono flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-3 px-4 bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-50 text-white border-2 border-[#1A1918] rounded-2xl font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Sugerencia al CEO'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
