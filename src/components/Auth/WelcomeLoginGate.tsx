'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  AlertCircle, 
  Check, 
  Compass, 
  Flame, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WelcomeLoginGate: React.FC = () => {
  const { signUp, signIn, signInWithGoogle } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim() || !handle.trim()) {
          setErrorMessage('Por favor ingresa tu nombre y alias de piloto.');
          setLoading(false);
          return;
        }
        const formattedHandle = handle.startsWith('@') ? handle : `@${handle}`;
        const res = await signUp(email, password, name, formattedHandle);
        if (res.success) {
          setSuccessMessage(res.message);
          try {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          } catch {}
        } else {
          setErrorMessage(res.message);
        }
      } else {
        const res = await signIn(email, password);
        if (res.success) {
          setSuccessMessage(res.message);
          try {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          } catch {}
        } else {
          setErrorMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado al conectar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4EEDB] flex flex-col justify-between overflow-y-auto antialiased selection:bg-[#E6332A] selection:text-white">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex items-center justify-center font-display font-black text-[22vw] text-[#1A1918] leading-none tracking-tighter">
        NAO
      </div>

      {/* Top Header Badge */}
      <header className="w-full max-w-5xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] animate-pulse" />
          <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#1A1918]/70">
            PLATAFORMA PRIVADA PARA PILOTOS
          </span>
        </div>
        <div className="px-2.5 py-1 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-lg font-mono text-[10px] font-bold text-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
          v2.0 OFICIAL
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto px-4 py-6 relative z-10">
        <div className="bg-[#FAF6ED] border-3 border-[#1A1918] rounded-[28px] p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_#1A1918] relative">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E6332A] text-white border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] mb-1">
              <Compass className="w-8 h-8 stroke-[2.5]" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-display font-black uppercase text-[#1A1918] tracking-tight">
              NAO CLUB
            </h1>
            
            <p className="text-xs font-serif italic text-[#1A1918]/80 max-w-xs mx-auto">
              Comunidad y bitácora técnica de motociclismo. Inicia sesión para acceder a rutas, tribus y hangares.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-[#F4EEDB] p-1 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-display font-black uppercase rounded-lg transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                  : 'text-[#1A1918]/60 hover:text-[#1A1918]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-display font-black uppercase rounded-lg transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                  : 'text-[#1A1918]/60 hover:text-[#1A1918]'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Feedback Messages */}
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

          {/* Social Sign-in Button */}
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
            className="w-full py-3.5 px-4 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
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

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t-2 border-[#1A1918]/20 w-full" />
            <span className="bg-[#FAF6ED] px-3 text-[10px] font-mono uppercase font-black text-[#1A1918]/60 absolute">
              o con tu correo
            </span>
          </div>

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#1A1918]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Roberto Sánchez"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Alias de Piloto (Handle)
                  </label>
                  <div className="relative">
                    <span className="text-xs font-mono font-bold text-[#E6332A] absolute left-3 top-1/2 -translate-y-1/2">@</span>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="roberto_gs"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl pl-8 pr-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
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
                  placeholder="piloto@correo.com"
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
              className="w-full mt-2 py-3.5 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Validando credencial...</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Crear Cuenta de Piloto' : 'Entrar al Club'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#1A1918]/60">
          NAO MOTORCYCLE CLUB • PRIVACIDAD Y SEGURIDAD GARANTIZADA
        </p>
      </footer>
    </div>
  );
};
