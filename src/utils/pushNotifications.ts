// Utilidades para Web Push Notifications y PWA en NAO Moto Club

const DEFAULT_VAPID_PUBLIC_KEY = 'BFxbi5q90Br-2juPyzQbWlSqmQC2G1a0Dt9WXgLPWmsQtf8ojnT35fWeRaGLT9jEjT0qoUveZYN353g-SuIZHvw';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error('[NAO Push] Error registrando Service Worker:', err);
    return null;
  }
}

export async function subscribeUserToPush(userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isPushNotificationSupported()) {
      return { 
        success: false, 
        error: isIOSDevice() && !isStandaloneMode() 
          ? 'ios_not_standalone' 
          : 'Tu navegador o dispositivo no soporta notificaciones Web Push.' 
      };
    }

    // 1. Pedir permiso al sistema operativo / navegador
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { 
        success: false, 
        error: permission === 'denied' 
          ? 'Permiso de notificaciones bloqueado en la configuración de tu teléfono.' 
          : 'No se otorgaron permisos de notificación.' 
      };
    }

    // 2. Obtener registro de SW
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, error: 'No se pudo inicializar el Service Worker en tu dispositivo.' };
    }

    // 3. Obtener clave pública VAPID
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
    const convertedKey = urlBase64ToUint8Array(vapidKey);

    // 4. Suscribir a PushManager
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as any
      });
    }

    // 5. Guardar suscripción en el backend
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        userId: userId || 'anonymous',
        device: navigator.userAgent
      })
    });

    if (!res.ok) {
      console.warn('[NAO Push] Advertencia al sincronizar suscripción con servidor.');
    }

    // Guardar estado local
    try {
      localStorage.setItem('nao_push_subscribed', 'true');
      localStorage.setItem('nao_push_sub_obj', JSON.stringify(subscription));
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('[NAO Push] Error al suscribir a notificaciones:', err);
    return { success: false, error: err.message || 'Error inesperado al activar notificaciones.' };
  }
}

export async function sendTestNotification(title: string, body: string, url: string = '/'): Promise<boolean> {
  try {
    // 1. Intentar enviar a través del endpoint de Web Push
    const subStr = typeof window !== 'undefined' ? localStorage.getItem('nao_push_sub_obj') : null;
    const subscription = subStr ? JSON.parse(subStr) : null;

    if (subscription) {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          payload: {
            title,
            body,
            url,
            icon: '/apple-icon',
            badge: '/favicon.svg'
          }
        })
      });

      if (res.ok) return true;
    }

    // 2. Fallback a Service Worker local si hay permiso
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body,
        icon: '/apple-icon',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        data: { url }
      } as any);
      return true;
    }

    return false;
  } catch (err) {
    console.error('[NAO Push] Error enviando notificación de prueba:', err);
    return false;
  }
}
