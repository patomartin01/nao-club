'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, KeyRound, Check, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ResetPasswordModal: React.FC = () => {
  const { isResetPasswordOpen, setIsResetPasswordOpen, updateUserPassword } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isResetPasswordOpen) return null;

  const handleClose = () => {
    setIsResetPasswordOpen(false);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserPassword(newPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {}
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#FAF6ED] border border-[#1A1918]/10 rounded-[28px] shadow-sm p-6 sm:p-7 space-y-5 animate-scaleUp text-[#1A1918] font-sans relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1A1918]/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#E6332A] bg-[#FAF6ED] px-2.5 py-1 border border-[#1A1918]/10 shadow-sm rounded-lg">
              SEGURIDAD
            </span>
            <span className="text-xs font-mono font-semibold text-[#1A1918]/60">
              NAO CLUB
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-[#FAF6ED] border border-[#1A1918]/10 text-[#1A1918] flex items-center justify-center hover:bg-[#E6332A] hover:text-white transition shrink-0 shadow-sm cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Title & Icon Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E6332A] text-white border border-[#1A1918]/10 shadow-sm mb-1">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-[#1A1918]">
            Nueva Contraseña
          </h2>
          <p className="text-xs font-sans text-[#1A1918]/70 max-w-xs mx-auto">
            Ingresa y confirma tu nueva contraseña de piloto para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3 bg-[#FFEBEE] border border-[#D32F2F] rounded-xl flex items-center gap-2 text-xs text-[#C62828] font-sans font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-[#E8F5E9] border border-[#2E7D32] rounded-2xl flex items-start gap-3 text-xs text-[#1B5E20] font-sans font-medium">
              <Check className="w-5 h-5 shrink-0 text-[#2E7D32] mt-0.5" />
              <div>
                <strong className="block font-semibold mb-0.5">¡Contraseña restablecida!</strong>
                <span>{successMessage}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 bg-[#E6332A] hover:bg-[#d02c24] active:shadow-none text-white border border-[#1A1918]/10 rounded-xl font-sans font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al Club</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-[#1A1918] block mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#FAF6ED] border border-[#1A1918]/10 focus:border-[#E6332A] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1918]/50 hover:text-[#1A1918] p-1"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-semibold text-[#1A1918] block mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full bg-[#FAF6ED] border border-[#1A1918]/10 focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#E6332A] hover:bg-[#d02c24] active:shadow-none text-white border border-[#1A1918]/10 rounded-xl font-sans font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Actualizando contraseña...</span>
              ) : (
                <>
                  <span>Actualizar Contraseña</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-[#1A1918]/10 pt-3 text-[10px] font-mono text-[#1A1918]/60 flex items-center justify-between">
          <span>NAO SEGURIDAD</span>
          <span className="font-semibold">ENCRIPTADO SSL</span>
        </div>
      </div>
    </div>
  );
};
