'use client';

import React, { useState, useEffect } from 'react';
import { BellRing, X } from 'lucide-react';
import { 
  isPushNotificationSupported, 
  isStandaloneMode, 
  subscribeUserToPush, 
  sendTestNotification 
} from '../../utils/pushNotifications';

interface PushPromptOnceBannerProps {
  userId?: string;
}

export const PushPromptOnceBanner: React.FC<PushPromptOnceBannerProps> = ({ userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Verificar si ya se le preguntó alguna vez o ya está suscrito
    const alreadyPrompted = localStorage.getItem('nao_push_prompted_once') === 'true';
    const alreadySubscribed = localStorage.getItem('nao_push_subscribed') === 'true';

    if (alreadyPrompted || alreadySubscribed) {
      return;
    }

    // 2. Verificar si el navegador soporta notificaciones
    if (!isPushNotificationSupported()) {
      return;
    }

    // 3. Verificar si el permiso ya fue decidido previamente en el navegador
    if (Notification.permission !== 'default') {
      localStorage.setItem('nao_push_prompted_once', 'true');
      return;
    }

    // 4. Preguntar cuando la app esté instalada (modo standalone / pantalla de inicio)
    // o en navegación si es compatible
    const isStandalone = isStandaloneMode();

    // Si está instalada como app o en móvil, esperar 2.5 segundos para mostrar el diálogo de bienvenida
    const timer = setTimeout(() => {
      // Priorizar cuando está instalada (o en móvil)
      if (isStandalone || window.innerWidth < 768) {
        setIsVisible(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    // Guardar que ya se le preguntó para no volver a insistir nunca
    localStorage.setItem('nao_push_prompted_once', 'true');
    setIsVisible(false);
  };

  const handleAccept = async () => {
    setIsActivating(true);
    // Guardar inmediatamente la bandera para no volver a preguntar
    localStorage.setItem('nao_push_prompted_once', 'true');

    try {
      const res = await subscribeUserToPush(userId);
      if (res.success) {
        // Enviar notificación de bienvenida en vivo
        await sendTestNotification(
          '¡Bienvenido a NAO!',
          'Notificaciones activadas. Te avisaremos cuando haya rodadas o actividad en tu tribu.',
          '/'
        );
      }
    } catch (e) {
      console.warn('[NAO Push] Error al activar desde prompt único:', e);
    } finally {
      setIsActivating(false);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-4 shadow-[6px_6px_0px_0px_#1A1918] relative flex flex-col gap-3 font-sans">
        
        {/* Botón cerrar sutil */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1A1918]/5 hover:bg-[#1A1918]/10 flex items-center justify-center text-[#1A1918]/60 hover:text-[#1A1918] transition cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-[#E6332A] flex items-center justify-center shrink-0 border border-[#1A1918]/10 shadow-sm mt-0.5">
            <BellRing className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="font-display uppercase tracking-wide text-sm font-bold text-[#1A1918] leading-tight">
              ¿Activar notificaciones?
            </h4>
            <p className="text-[11px] text-[#1A1918]/70 mt-1 leading-snug">
              Te avisaremos cuando alguien confirme a tus rodadas, comience a seguirte o alerten en tu tribu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            disabled={isActivating}
            className="flex-1 py-2 px-3 bg-[#E6332A] hover:bg-[#c92a22] text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-xl border border-[#1A1918]/20 shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isActivating ? 'Activando...' : 'Activar notificaciones'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-2 px-3 bg-[#F4EEDB] hover:bg-[#eae3cb] text-[#1A1918] text-[11px] font-mono font-semibold uppercase tracking-wider rounded-xl border border-[#1A1918]/15 transition cursor-pointer"
          >
            Ahora no
          </button>
        </div>

      </div>
    </div>
  );
};
