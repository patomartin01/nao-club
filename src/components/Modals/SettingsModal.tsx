'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Settings, 
  Smartphone, 
  Bell, 
  BellRing, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Send,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  MessageSquarePlus,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { 
  isPushNotificationSupported, 
  isStandaloneMode, 
  isIOSDevice, 
  getNotificationPermission, 
  subscribeUserToPush, 
  sendTestNotification 
} from '../../utils/pushNotifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditProfile?: () => void;
  onOpenFeedback?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenEditProfile,
  onOpenFeedback
}) => {
  const { currentUser, currentUserFounderNumber, signOut } = useApp();

  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
    } else {
      setShowPwaGuide(!showPwaGuide);
    }
  };

  const handleActivatePush = async () => {
    setLoading(true);
    setStatusMessage(null);

    const result = await subscribeUserToPush(currentUser?.id);
    setLoading(false);
    
    setPermission(getNotificationPermission());

    if (result.success) {
      setStatusMessage({ 
        text: '¡Notificaciones push activadas exitosamente en este dispositivo!', 
        type: 'success' 
      });
    } else {
      setStatusMessage({ 
        text: result.error || 'No se pudieron activar las notificaciones.', 
        type: 'error' 
      });
    }
  };

  const handleSendTestPush = async () => {
    setTestSending(true);
    setStatusMessage(null);

    const success = await sendTestNotification(
      'NAO Club Alerta',
      '¡Tus notificaciones están funcionando al 100%! Te avisaremos de nuevas rodadas y mensajes de tu tribu.'
    );
    setTestSending(false);

    if (success) {
      setStatusMessage({ 
        text: '¡Notificación de prueba enviada! Revisa el banner de tu celular.', 
        type: 'success' 
      });
    } else {
      setStatusMessage({ 
        text: 'Error al enviar la prueba. Asegúrate de tener los permisos otorgados en el navegador o sistema.', 
        type: 'error' 
      });
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas cerrar sesión?')) {
      setLoggingOut(true);
      try {
        await signOut();
        onClose();
      } catch (err) {
        console.error('Error logging out:', err);
      } finally {
        setLoggingOut(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF6ED] text-[#1A1918] rounded-3xl border border-[#1A1918]/15 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1A1918]/10 flex items-center justify-between shrink-0 bg-[#FAF6ED]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1A1918]/5 border border-[#1A1918]/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#E6332A]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1A1918] leading-tight">
                Configuración
              </h3>
              <p className="text-[11px] font-sans text-[#1A1918]/60">
                Preferencias de app, alertas y cuenta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1918]/5 hover:bg-[#1A1918]/10 text-[#1A1918] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Toast inside Modal */}
        {statusMessage && (
          <div className={`mx-5 mt-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusMessage.type === 'error'
              ? 'bg-[#E6332A]/10 border-[#E6332A]/30 text-[#E6332A]'
              : 'bg-[#F4EEDB] border-[#1A1918]/20 text-[#1A1918]'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#E6332A] shrink-0 mt-0.5" />
            )}
            <span className="font-sans leading-relaxed">{statusMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm font-sans">
          
          {/* SECCIÓN 1: APP MÓVIL & NOTIFICACIONES */}
          <div className="bg-[#FAF6ED] rounded-2xl border border-[#1A1918]/10 p-4 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#E6332A]" />
                <span className="font-display font-semibold text-xs tracking-wider uppercase text-[#1A1918]">
                  Notificaciones & App Móvil
                </span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                permission === 'granted' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-[#F7B32B]/20 text-[#1A1918] border border-[#F7B32B]/40'
              }`}>
                {permission === 'granted' ? 'Activadas' : permission === 'denied' ? 'Bloqueadas' : 'Pendiente'}
              </span>
            </div>

            <p className="text-xs text-[#1A1918]/70 leading-relaxed">
              Recibe avisos instantáneos cuando tu tribu organize rodadas, alertas de ruta o publicaciones directas.
            </p>

            {/* Notification actions */}
            <div className="space-y-2 pt-1">
              {permission !== 'granted' ? (
                <button
                  onClick={handleActivatePush}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#E6332A] hover:bg-[#c92820] disabled:opacity-50 text-white rounded-xl font-sans font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <BellRing className="w-4 h-4" />
                  {loading ? 'Activando...' : 'Activar Notificaciones Push'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Notificaciones activas en este equipo</span>
                  </div>
                  <button
                    onClick={handleSendTestPush}
                    disabled={testSending}
                    className="py-2 px-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/20 rounded-xl text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Enviar notificación de prueba al teléfono"
                  >
                    <Send className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>{testSending ? '...' : 'Probar'}</span>
                  </button>
                </div>
              )}

              {/* Install on Home Screen */}
              <div className="pt-2 border-t border-[#1A1918]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#1A1918]/70" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1918]">
                      {isStandalone ? 'App instalada como PWA' : 'Instalar en tu Pantalla de Inicio'}
                    </p>
                    <p className="text-[11px] text-[#1A1918]/60">
                      {isStandalone ? 'Experiencia nativa a pantalla completa' : 'Ábrela como app nativa sin barra de navegador'}
                    </p>
                  </div>
                </div>

                {!isStandalone && (
                  <button
                    onClick={handleInstallClick}
                    className="py-1.5 px-3 bg-[#1A1918] hover:bg-[#333] text-[#FAF6ED] rounded-xl text-xs font-sans font-semibold transition cursor-pointer shrink-0"
                  >
                    {deferredPrompt ? 'Instalar' : (showPwaGuide ? 'Ocultar' : 'Ver Guía')}
                  </button>
                )}
              </div>

              {/* PWA step-by-step instructions if opened */}
              {showPwaGuide && !isStandalone && (
                <div className="mt-2 p-3 bg-[#F4EEDB] rounded-xl border border-[#1A1918]/10 text-xs space-y-2 animate-in fade-in duration-150">
                  <p className="font-semibold text-[#1A1918]">
                    {isIOS ? 'Cómo instalar en iPhone (Safari):' : 'Cómo instalar en Android (Chrome):'}
                  </p>
                  {isIOS ? (
                    <ol className="list-decimal pl-4 space-y-1 text-[#1A1918]/80 text-[11px]">
                      <li>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha ↑ abajo)</li>
                      <li>Baja y pulsa <strong>&quot;Agregar a inicio&quot;</strong> (o &quot;Add to Home Screen&quot;)</li>
                      <li>Toca <strong>&quot;Agregar&quot;</strong> arriba a la derecha</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal pl-4 space-y-1 text-[#1A1918]/80 text-[11px]">
                      <li>Toca los tres puntos (⋮) arriba a la derecha en Chrome</li>
                      <li>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o &quot;Agregar a la pantalla principal&quot;</li>
                      <li>Confirma la instalación para tener el acceso directo en tu celular</li>
                    </ol>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: PERFIL DE PILOTO */}
          <div className="bg-[#FAF6ED] rounded-2xl border border-[#1A1918]/10 p-4 space-y-3 shadow-sm">
            <span className="font-display font-semibold text-xs tracking-wider uppercase text-[#1A1918] block">
              Perfil & Datos de Piloto
            </span>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4EEDB]/60 border border-[#1A1918]/10">
              <div className="flex items-center gap-2.5">
                {currentUser?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-xl object-cover border border-[#1A1918]/10" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-[#1A1918]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#1A1918]" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-[#1A1918]">{currentUser?.name}</p>
                  <p className="text-[11px] font-mono text-[#E6332A]">{currentUser?.handle}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="py-1.5 px-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/20 rounded-xl text-xs font-sans font-semibold transition flex items-center gap-1 cursor-pointer"
              >
                <span>Editar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: SUGERENCIAS / FEEDBACK */}
          {currentUserFounderNumber !== null && currentUserFounderNumber <= 50 && (
            <div className="bg-[#FAF6ED] rounded-2xl border border-[#1A1918]/10 p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-[#E6332A]" />
                  <span className="font-display font-semibold text-xs tracking-wider uppercase text-[#1A1918]">
                    Feedback de Fundador
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold bg-[#F7B32B] text-[#1A1918] px-1.5 py-0.5 rounded">
                  PILOTO #{currentUserFounderNumber}
                </span>
              </div>
              <p className="text-xs text-[#1A1918]/70">
                Tienes línea directa con el equipo fundador para reportar fallos o sugerir nuevas funciones.
              </p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenFeedback) onOpenFeedback();
                }}
                className="w-full py-2 px-3 bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918] rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/20 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#E6332A]" />
                <span>Enviar Sugerencia o Comentario</span>
              </button>
            </div>
          )}

          {/* SECCIÓN 4: CUENTA & SESIÓN */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-[#E6332A] border border-[#E6332A]/20 rounded-2xl font-sans font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#E6332A]" />
              <span>{loggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
            </button>
          </div>

          {/* Version Footer */}
          <div className="text-center pt-2 pb-1 text-[11px] font-mono text-[#1A1918]/40">
            NAO Club Engine • v1.4.0 (PWA & Push Ready)
          </div>

        </div>
      </div>
    </div>
  );
};
