/**
 * Servicio unificado de geolocalización en primer y segundo plano.
 * Soporta ejecución nativa en iOS / Android vía Capacitor (grabación con pantalla apagada en el bolsillo)
 * y fallback automático para navegador web con WakeLock API.
 */

export interface TelemetryReading {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  speed?: number | null; // km/h
  accuracy?: number | null; // metros
  timestamp: number;
}

export type LocationCallback = (reading: TelemetryReading) => void;
export type ErrorCallback = (errorMessage: string) => void;

class UnifiedLocationService {
  private isNative: boolean = false;
  private backgroundWatcherId: string | null = null;
  private webWatcherId: number | null = null;
  private isTrackingActive: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const { Capacitor } = require('@capacitor/core');
        this.isNative = Capacitor.isNativePlatform();
      } catch {
        this.isNative = false;
      }
    }
  }

  public isNativeDevice(): boolean {
    return this.isNative;
  }

  public isRunning(): boolean {
    return this.isTrackingActive;
  }

  /**
   * Inicia el rastreo continuo de GPS optimizado para motos:
   * En App Nativa: graba continuamente en segundo plano aunque la pantalla esté bloqueada.
   * En Web: activa watchPosition con alta precisión.
   */
  public async startTracking(
    onLocation: LocationCallback,
    onError?: ErrorCallback
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    this.isTrackingActive = true;

    // 1. MODO NATIVO (Capacitor iOS / Android)
    if (this.isNative) {
      try {
        const { registerPlugin } = await import('@capacitor/core');
        const BackgroundGeolocation = registerPlugin<any>('BackgroundGeolocation');

        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundMessage: 'NAO Club está grabando tu ruta GPS activa.',
            backgroundTitle: 'Rodada en progreso',
            requestPermissions: true,
            stale: false,
            distanceFilter: 3 // Registra cada 3 metros recorridos
          },
          (location: any, error: any) => {
            if (error) {
              if (onError) onError(error.message || 'Error en GPS nativo');
              return;
            }
            if (location) {
              const speedKmh = location.speed !== null && location.speed !== undefined
                ? Math.round(location.speed * 3.6)
                : 0;

              onLocation({
                latitude: location.latitude,
                longitude: location.longitude,
                altitude: location.altitude,
                speed: speedKmh,
                accuracy: location.accuracy,
                timestamp: location.time || Date.now()
              });
            }
          }
        );

        this.backgroundWatcherId = watcherId;
        console.log('[GPS Nativo] Rastreo en segundo plano activo. ID:', watcherId);
        return true;
      } catch (err: any) {
        console.warn('[GPS Nativo] Falló plugin nativo, activando fallback web:', err);
      }
    }

    // 2. MODO WEB (Navegador Safari / Chrome)
    if (!navigator.geolocation) {
      if (onError) onError('Geolocalización no soportada en este dispositivo.');
      return false;
    }

    this.webWatcherId = navigator.geolocation.watchPosition(
      (pos) => {
        const rawSpeed = pos.coords.speed;
        const speedKmh = rawSpeed !== null && rawSpeed !== undefined && rawSpeed > 0
          ? Math.round(rawSpeed * 3.6)
          : 0;

        onLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          speed: speedKmh,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now()
        });
      },
      (err) => {
        if (onError) {
          if (err.code === 1) onError('Permiso de GPS denegado.');
          else if (err.code === 2) onError('Buscando señal satelital...');
          else onError('Error al leer señal de GPS.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    console.log('[GPS Web] watchPosition activo.');
    return true;
  }

  /**
   * Detiene el rastreo y libera los recursos del sistema
   */
  public async stopTracking(): Promise<void> {
    this.isTrackingActive = false;

    if (this.backgroundWatcherId) {
      try {
        const { registerPlugin } = await import('@capacitor/core');
        const BackgroundGeolocation = registerPlugin<any>('BackgroundGeolocation');
        await BackgroundGeolocation.removeWatcher({ id: this.backgroundWatcherId });
      } catch (e) {
        console.warn('Error deteniendo BackgroundGeolocation:', e);
      }
      this.backgroundWatcherId = null;
    }

    if (this.webWatcherId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.webWatcherId);
      this.webWatcherId = null;
    }

    console.log('[GPS] Rastreo detenido exitosamente.');
  }
}

export const unifiedLocationService = new UnifiedLocationService();
