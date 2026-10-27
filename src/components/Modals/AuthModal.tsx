'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  AtSign, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertCircle,
  Database,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    signUp, 
    signIn, 
    currentUser,
    switchCurrentUser,
    users
  } = useApp();

  const [mode, setMode] = useState<'signup' | 'login' | 'demo'>('signup');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setErrorMessage('Por favor completa todos los campos.');
          setLoading(false);
          return;
        }

        const formattedHandle = handle.trim() 
          ? (handle.startsWith('@') ? handle : `@${handle}`)
          : `@${email.split('@')[0]}`;

        const res = await signUp(email, password, name, formattedHandle);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
          try {
            confetti({ particleCount: 35, spread: 60 });
          } catch {}
          setTimeout(() => {
            setAuthModalOpen(false);
          }, 1200);
        }
      } else if (mode === 'login') {
        if (!email.trim() || !password.trim()) {
          setErrorMessage('Ingresa correo y contraseña.');
          setLoading(false);
          return;
        }

        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
          try {
            confetti({ particleCount: 25, spread: 45 });
          } catch {}
          setTimeout(() => {
            setAuthModalOpen(false);
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] p-5 sm:p-7 space-y-5 animate-scaleUp text-[#1A1918] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6332A]" />
            <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#E6332A]">
              NAO // CLUB DE EXPEDICIÓN
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Status Cloud Banner */}
        <div className={`p-2.5 rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] flex items-center justify-between gap-2 text-[11px] font-mono ${
          isConfigured 
            ? 'bg-[#E8F5E9] text-[#1B5E20]' 
            : 'bg-[#FFF9C4] text-[#827717]'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-4 h-4 shrink-0" />
            <span className="font-bold truncate">
              {isConfigured ? 'Supabase Conectado (Nube)' : 'Modo Local / Demo Activo'}
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 bg-white/80 border border-[#1A1918] rounded-md font-black shrink-0">
            {isConfigured ? 'PRODUCCIÓN' : 'STANDBY'}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#F4EEDB] p-1 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]">
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-display font-black uppercase rounded-lg transition ${
              mode === 'signup'
                ? 'bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                : 'text-[#1A1918]/60 hover:text-[#1A1918]'
            }`}
          >
            Registro
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 text-xs font-display font-black uppercase rounded-lg transition ${
              mode === 'login'
                ? 'bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                : 'text-[#1A1918]/60 hover:text-[#1A1918]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('demo'); setErrorMessage(null); }}
            className={`py-2 px-3 text-xs font-display font-black uppercase rounded-lg transition ${
              mode === 'demo'
                ? 'bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                : 'text-[#1A1918]/60 hover:text-[#1A1918]'
            }`}
            title="Cambiar entre perfiles demo de prueba"
          >
            Pilotos Demo
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3 bg-[#FFEBEE] border-2 border-[#D32F2F] rounded-xl flex items-center gap-2 text-xs text-[#C62828] font-sans font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-[#E8F5E9] border-2 border-[#2E7D32] rounded-xl flex items-center gap-2 text-xs text-[#1B5E20] font-sans font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM: REGISTRO O LOGIN */}
        {mode !== 'demo' ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Patricio Martin"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Handle / Usuario
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@patricio_adv"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="piloto@ejemplo.com"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Procesando...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Crear Cuenta de Piloto' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* MODO DEMO: SELECTOR RÁPIDO DE PILOTOS DE PRUEBA */
          <div className="space-y-3">
            <p className="text-xs text-[#1A1918]/70 font-sans">
              Selecciona cualquier piloto para probar conexiones, seguir perfiles, cambiar de tribu y ver cómo se refleja en vivo:
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {users.map(u => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      if (switchCurrentUser) switchCurrentUser(u.id);
                      setAuthModalOpen(false);
                      try {
                        confetti({ particleCount: 20, spread: 45 });
                      } catch {}
                    }}
                    className={`w-full p-2.5 rounded-xl border-2 border-[#1A1918] flex items-center justify-between gap-3 text-left transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                      isSelected 
                        ? 'bg-[#F7B32B]' 
                        : 'bg-[#FAF6ED] hover:bg-[#F4EEDB]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-[#1A1918]" 
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-display font-black uppercase text-[#1A1918] truncate">{u.name}</p>
                        <p className="text-[10px] font-mono text-[#1A1918]/70">{u.handle}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-mono font-black uppercase bg-[#1A1918] text-white px-2 py-0.5 rounded-md">
                        Activo
                      </span>
                    ) : (
                      <span className="text-[10px] font-display font-black uppercase text-[#1A1918]/70">
                        Cambiar →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="border-t-2 border-[#1A1918] pt-3 text-[10px] font-mono text-[#1A1918]/60 flex items-center justify-between">
          <span>NAO v2.6 // PROD READY</span>
          <span className="font-bold">PILOTOS PRIVADOS & SEGUROS</span>
        </div>
      </div>
    </div>
  );
};
