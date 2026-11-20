/**
 * Utilidades matemáticas y geoespaciales para grabación de rutas en moto (Doble Propósito / Off-road)
 * Evita saltos por rebote de satélite y líneas rectas
 */

// Radio de la tierra en km
const EARTH_RADIUS_KM = 6371;

/**
 * Distancia Haversine en kilómetros entre dos coordenadas
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export interface GPSPoint {
  lat: number;
  lng: number;
  ele?: number;
  speed?: number; // km/h
  accuracy?: number; // metros
  timestamp?: number;
}

/**
 * Filtro inteligente para GPS en moto (Off-road, doble propósito, cañones y curvas):
 * 1. Admite precisión realista en montaña (hasta 70m, y hasta 90m si llevamos >8s sin punto)
 * 2. Evita líneas rectas por falta de puntos en zonas de bosque o cañadas
 * 3. Descarta saltos imposibles de teletransportación (> 180 km/h a distancias altas)
 * 4. Descarta micro-vibraciones estáticas si el movimiento es menor a 2.5 metros
 */
export const shouldAcceptGPSPoint = (
  newPoint: GPSPoint,
  lastPoint: GPSPoint | null
): { accept: boolean; reason?: string; distanceKm?: number } => {
  if (!lastPoint) {
    // Aceptar el primer punto si tiene precisión razonable (< 100m)
    if (newPoint.accuracy && newPoint.accuracy > 100) {
      return { accept: false, reason: 'initial_accuracy_too_low' };
    }
    return { accept: true, distanceKm: 0 };
  }

  const timeDiffMs = (newPoint.timestamp && lastPoint.timestamp) 
    ? (newPoint.timestamp - lastPoint.timestamp) 
    : 1000;

  // 1. Filtrar lecturas extremadamente imprecisas, pero tolerar árboles y cañadas
  // Si llevamos más de 8 segundos sin registrar punto, somos más tolerantes para no crear líneas rectas
  const maxAllowedAccuracy = timeDiffMs > 8000 ? 90 : 70;
  if (newPoint.accuracy && newPoint.accuracy > maxAllowedAccuracy) {
    return { accept: false, reason: 'accuracy_too_low' };
  }

  const distKm = calculateHaversineDistance(
    lastPoint.lat,
    lastPoint.lng,
    newPoint.lat,
    newPoint.lng
  );

  const distMeters = distKm * 1000;

  // 2. Si el movimiento es imperceptible (< 2.5 metros en moto detenida), evitar jitter
  if (distMeters < 2.5) {
    return { accept: false, reason: 'noise_jitter' };
  }

  // 3. Velocidad máxima realista en moto (evitar saltos de antena satelital)
  if (timeDiffMs > 0) {
    const elapsedHours = timeDiffMs / 3600000;
    const calculatedSpeed = distKm / elapsedHours;
    // Solo rechazar si la velocidad calculada supera 180 km/h Y la distancia saltada es superior a 200m
    if (calculatedSpeed > 180 && distMeters > 200) {
      return { accept: false, reason: 'speed_anomaly' };
    }
  }

  return { accept: true, distanceKm: distKm };
};

/**
 * WakeLock API: Evita que el navegador del teléfono apague la pantalla o duerma el sensor GPS
 */
export class DeviceWakeLockManager {
  private sentinel: any = null;

  async requestLock(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    // Ya hay uno activo: no pedir otro (el navegador lo marca released al ir a segundo plano)
    if (this.sentinel && !this.sentinel.released) return true;
    if ('wakeLock' in navigator) {
      try {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        console.log('[WakeLock] Pantalla y GPS protegidos contra suspensión.');
        return true;
      } catch (err) {
        console.warn('[WakeLock] No se pudo activar WakeLock:', err);
      }
    }
    return false;
  }

  releaseLock(): void {
    if (this.sentinel) {
      try {
        this.sentinel.release();
        this.sentinel = null;
        console.log('[WakeLock] WakeLock liberado.');
      } catch (err) {}
    }
  }
}

/**
 * Exportador GPX Estándar (Compatible con Garmin, Wikiloc, Gaia GPS)
 */
export const generateGPXString = (
  trackName: string,
  coordinates: [number, number][],
  waypoints: { name: string; lat: number; lng: number; notes?: string }[] = []
): string => {
  const timeISO = new Date().toISOString();
  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NAO Motor Club - https://nao-club-three.vercel.app" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(trackName)}</name>
    <time>${timeISO}</time>
  </metadata>
`;

  // Waypoints
  waypoints.forEach(wp => {
    gpx += `  <wpt lat="${wp.lat}" lon="${wp.lng}">
    <name>${escapeXml(wp.name)}</name>
    <desc>${escapeXml(wp.notes || '')}</desc>
  </wpt>\n`;
  });

  // Track
  gpx += `  <trk>
    <name>${escapeXml(trackName)}</name>
    <trkseg>\n`;

  coordinates.forEach(([lat, lng]) => {
    gpx += `      <trkpt lat="${lat}" lon="${lng}"></trkpt>\n`;
  });

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  return gpx;
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};
