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
  ShieldCheck,
  LogOut,
  UserCheck,
  Users,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    signUp, 
    signIn, 
    signInWithGoogle,
    signOut,
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
  const [googleLoading, setGoogleLoading] = useState(false);
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
        <div className="flex items-center justify-end border-b-2 border-[#1A1918] pb-3">
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
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

        {/* ========================================================= */}
        {/* 1. CASO USUARIO YA LOGUEADO (KISS: LIMPIO, DIRECTO Y ÚTIL) */}
        {/* ========================================================= */}
        {currentUser.id !== 'guest' ? (
          <div className="space-y-4">
            {/* Tarjeta del Piloto Actual */}
            <div className="p-4 bg-white border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono font-black uppercase text-white bg-[#1A1918] px-2 py-0.5 rounded tracking-wider">
                    Sesión Activa
                  </span>
                  <h3 className="text-base font-display font-black uppercase text-[#1A1918] truncate mt-1">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs font-mono font-bold text-[#E6332A] truncate">
                    {currentUser.handle}
                  </p>
                </div>
              </div>

              {currentUser.email && (
                <div className="pt-2 border-t border-[#1A1918]/15 flex items-center justify-between text-xs text-stone-600 font-sans">
                  <span className="font-mono text-[10px] text-stone-400 uppercase">Correo:</span>
                  <span className="font-medium truncate max-w-[220px]">{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* Botón Principal: Cerrar Sesión */}
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setSuccessMessage('Has cerrado sesión correctamente.');
                setTimeout(() => {
                  setAuthModalOpen(false);
                }, 800);
              }}
              className="w-full py-3.5 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border-2 border-[#C62828] rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[3px_3px_0px_#C62828] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          /* ========================================================= */
          /* 2. CASO INVITADO: FORMULARIO DE INICIO DE SESIÓN / REGISTRO */
          /* ========================================================= */
          <div className="space-y-4">
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

        {/* FORM: REGISTRO O LOGIN */}
        {mode !== 'demo' ? (
          <div className="space-y-3.5">
            {/* GOOGLE SIGN IN BUTTON */}
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={async () => {
                setErrorMessage(null);
                setGoogleLoading(true);
                const res = await signInWithGoogle();
                if (!res.success) {
                  setErrorMessage(res.message);
                  setGoogleLoading(false);
                }
              }}
              className="w-full py-3 px-4 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            {/* SEPARATOR */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t-2 border-[#1A1918]/20 w-full" />
              <span className="bg-[#FAF6ED] px-3 text-[10px] font-mono uppercase font-black text-[#1A1918]/60 absolute">
                o con correo y contraseña
              </span>
            </div>

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
          </div>
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
