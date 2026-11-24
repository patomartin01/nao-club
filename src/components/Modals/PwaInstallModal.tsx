'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Bell, 
  BellRing, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Send,
  HelpCircle
} from 'lucide-react';
import { 
  isPushNotificationSupported, 
  isStandaloneMode, 
  isIOSDevice, 
  getNotificationPermission, 
  subscribeUserToPush, 
  sendTestNotification 
} from '../../utils/pushNotifications';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStandalone(isStandaloneMode());
      setIsIOS(isIOSDevice());
      setPermission(getNotificationPermission());

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setStatusMessage({ text: '¡Instalando NAO en tu pantalla de inicio!', type: 'success' });
        setDeferredPrompt(null);
      }
    }
  };

  const handleActivatePush = async () => {
    setLoading(true);
    setStatusMessage(null);

    const result = await subscribeUserToPush(userId);
    setLoading(false);

    if (result.success) {
      setPermission('granted');
      setStatusMessage({ 
        text: '¡Notificaciones activadas con éxito! Ahora recibirás avisos de rodadas, tribu y nuevos seguidores.', 
        type: 'success' 
      });
      // Enviar de inmediato una notificación de bienvenida
      await sendTestNotification(
        '¡NAO Moto Club activo!',
        'Las notificaciones push están configuradas y listas en tu dispositivo.',
        '/'
      );
    } else {
      if (result.error === 'ios_not_standalone') {
        setStatusMessage({ 
          text: 'En iPhone, primero debes agregar NAO a tu pantalla de inicio (ver instrucciones abajo) y luego abrirla para activar notificaciones.', 
          type: 'error' 
        });
      } else {
        setStatusMessage({ 
          text: result.error || 'No fue posible activar las notificaciones.', 
          type: 'error' 
        });
      }
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setStatusMessage(null);
    const ok = await sendTestNotification(
      'Rodada de Prueba · NAO Club',
      'Tu teléfono está listo para recibir avisos de rodadas y compañeros de ruta.',
      '/'
    );
    setTestSending(false);
    if (ok) {
      setStatusMessage({ text: '¡Notificación de prueba enviada a tu dispositivo!', type: 'success' });
    } else {
      setStatusMessage({ text: 'No se pudo enviar la prueba. Asegúrate de haber aceptado los permisos.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#FAF6ED] rounded-3xl border-2 border-[#1A1918] shadow-[8px_8px_0px_0px_#1A1918] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[#F4EEDB] border-b border-[#1A1918]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6332A] flex items-center justify-center border border-[#1A1918]/10 shadow-sm">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E6332A] font-bold block">
                Experiencia App Móvil
              </span>
              <h2 className="text-lg font-display uppercase tracking-wide text-[#1A1918] font-bold leading-none">
                Instalar App & Notificaciones
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1918]/5 hover:bg-[#1A1918]/10 flex items-center justify-center text-[#1A1918] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto font-sans">
          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3.5 rounded-2xl border text-xs font-medium flex items-start gap-2.5 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : statusMessage.type === 'error'
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* 1. SECCIÓN: NOTIFICACIONES PUSH */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-4 shadow-[4px_4px_0px_0px_#1A1918]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-[#E6332A]" />
                <h3 className="font-display uppercase text-sm font-bold text-[#1A1918] tracking-wider">
                  Notificaciones en Celular
                </h3>
              </div>
              <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                permission === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {permission === 'granted' ? 'Activadas ✓' : 'Pendientes'}
              </span>
            </div>
            
            <p className="text-xs text-[#1A1918]/70 mb-3 leading-relaxed">
              Recibe avisos nativos en tu pantalla de bloqueo cuando alguien confirme a tus rodadas, te sigan o manden mensajes en tu tribu.
            </p>

            <div className="flex flex-wrap gap-2">
              {permission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleActivatePush}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#E6332A] hover:bg-[#c92a22] text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xl border border-[#1A1918]/20 shadow-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  <span>{loading ? 'Activando...' : 'Activar Notificaciones Push'}</span>
                </button>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Notificaciones listas en este teléfono</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={testSending}
                    className="py-2 px-3 bg-[#1A1918] hover:bg-black text-[#F7B32B] text-xs font-mono font-bold rounded-xl border border-[#1A1918] shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                    title="Enviar notificación de prueba"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testSending ? 'Enviando...' : 'Probar'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. SECCIÓN: AGREGAR A PANTALLA DE INICIO (PWA FULL SCREEN) */}
          <div className="bg-[#F4EEDB] border border-[#1A1918]/15 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display uppercase text-sm font-bold text-[#1A1918] tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F7B32B]" />
                Instalar como App en Inicio
              </h3>
              {isStandalone && (
                <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                  Modo App ✓
                </span>
              )}
            </div>

            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full mb-3 py-2.5 px-4 bg-[#1A1918] hover:bg-black text-[#FAF6ED] text-xs font-mono uppercase tracking-wider font-bold rounded-xl border border-[#1A1918] shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusSquare className="w-4 h-4 text-[#F7B32B]" />
                <span>Instalar NAO en la pantalla principal</span>
              </button>
            )}

            {isIOS ? (
              <div className="space-y-2 text-xs text-[#1A1918]/80 font-sans">
                <p className="font-semibold text-[#1A1918] text-[11px] uppercase tracking-wider font-mono">
                  Guía para iPhone (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 bg-[#FAF6ED] p-3 rounded-xl border border-[#1A1918]/10 text-xs">
                  <li>
                    Toca el botón <strong>Compartir</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#E6332A]" /> en la barra inferior de Safari.
                  </li>
                  <li>
                    Desliza hacia abajo y pulsa <strong>&ldquo;Agregar a pantalla de inicio&rdquo;</strong>.
                  </li>
                  <li>
                    Pulsa <strong>&ldquo;Agregar&rdquo;</strong> arriba a la derecha.
                  </li>
                  <li>
                    Abre el icono de <strong>NAO</strong> en tu pantalla de inicio y activa tus notificaciones.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#1A1918]/80 font-sans">
                <p className="font-semibold text-[#1A1918] text-[11px] uppercase tracking-wider font-mono">
                  Guía para Android (Chrome):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 bg-[#FAF6ED] p-3 rounded-xl border border-[#1A1918]/10 text-xs">
                  <li>
                    Toca el menú de <strong>tres puntos (⋮)</strong> en la esquina superior de Chrome.
                  </li>
                  <li>
                    Selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Agregar a pantalla principal&rdquo;</strong>.
                  </li>
                  <li>
                    Confirma y abre <strong>NAO</strong> como app nativa a pantalla completa.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4EEDB] border-t border-[#1A1918]/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-[#1A1918] hover:bg-black text-[#FAF6ED] text-xs font-mono uppercase font-bold rounded-xl transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
