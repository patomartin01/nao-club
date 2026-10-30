import { RouteProposal } from '../types';

/**
 * Builds an ultra-clean, short Google Maps multi-stop URL.
 * Uses the native slash format: https://www.google.com/maps/dir/<lat1>,<lng1>/<lat2>,<lng2>/...
 * This format is compact, human-readable, free of ugly %2C / %7C encoding,
 * and opens sequentially in Google Maps mobile apps and desktop.
 */
export const buildOrderedGoogleMapsUrl = (
  route: RouteProposal,
  customOrigin?: string
): string => {
  if (!route) return 'https://maps.google.com';

  const fmt = (n: number) => Number(n.toFixed(5));

  const isDummyCoord = (lat: number, lng: number) => {
    // Check if coordinates were fallback dummy values (around 19.8000 / -99.0000)
    return Math.abs(lat - 19.8000) < 0.25 && Math.abs(lng - -99.0000) < 0.25;
  };

  // 1. If waypoints exist, construct clean ordered points: start -> intermediate stops -> destination
  if (route.waypoints && route.waypoints.length > 0) {
    const points = route.waypoints.map(wp => {
      // If coordinates are valid and not dummy, use lat,lng; otherwise use clean name
      if (wp.lat && wp.lng && !isDummyCoord(wp.lat, wp.lng)) {
        return `${fmt(wp.lat)},${fmt(wp.lng)}`;
      }
      return encodeURIComponent(cleanGmapsPoint(wp.name));
    }).filter(Boolean);

    if (points.length > 0) {
      return `https://www.google.com/maps/dir/${points.join('/')}`;
    }
  }

  // 2. If coordinates polyline exists and is not dummy, sample key sequential points
  if (route.coordinates && route.coordinates.length > 1) {
    const coords = route.coordinates;
    const isPolylineDummy = coords.length === 3 && Math.abs(coords[1][0] - 19.8000) < 0.01;
    
    if (!isPolylineDummy) {
      const sampled: string[] = [];
      
      // Origin
      sampled.push(`${fmt(coords[0][0])},${fmt(coords[0][1])}`);

      // Pick 2-3 key turn points along the route
      if (coords.length >= 4) {
        const step = Math.floor(coords.length / 3);
        for (let i = step; i < coords.length - 1; i += step) {
          sampled.push(`${fmt(coords[i][0])},${fmt(coords[i][1])}`);
        }
      }

      // Destination
      const last = coords[coords.length - 1];
      sampled.push(`${fmt(last[0])},${fmt(last[1])}`);

      return `https://www.google.com/maps/dir/${sampled.join('/')}`;
    }
  }

  // 3. Fallback: Origin and Destination names
  const origin = encodeURIComponent(cleanGmapsPoint(customOrigin || 'Interlomas, Huixquilucan, Edomex'));
  const dest = encodeURIComponent(cleanGmapsPoint(`${route.destination}, ${route.state || 'México'}`));
  return `https://www.google.com/maps/dir/${origin}/${dest}`;
};

const cleanGmapsPoint = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/,?\s*sugerencia\s+de\s+google\s*maps.*$/i, '')
    .replace(/,?\s*sugerencia\s+de.*$/i, '')
    .replace(/,?\s*punto\s+exacto\s+en\s+google\s*maps.*$/i, '')
    .replace(/,?\s*b[uú]squeda\s+exacta.*$/i, '')
    .trim();
};

/**
 * Builds a dynamic multi-stop Google Maps URL from user input locations/stops.
 * Format: https://www.google.com/maps/dir/Origin/Stop1/Stop2/Destination
 */
export const buildDynamicRouteGoogleMapsUrl = (
  origin: string,
  waypoints: { name: string; lat?: number; lng?: number }[],
  destination: string,
  originCoords?: { lat?: number; lng?: number },
  destinationCoords?: { lat?: number; lng?: number }
): string => {
  const fmt = (n: number) => Number(n.toFixed(5));
  const isDummy = (lat?: number, lng?: number) => {
    if (!lat || !lng) return true;
    return Math.abs(lat - 19.8000) < 0.25 && Math.abs(lng - -99.0000) < 0.25;
  };

  const parts: string[] = [];

  // 1. Origin
  if (originCoords && !isDummy(originCoords.lat, originCoords.lng)) {
    parts.push(`${fmt(originCoords.lat!)},${fmt(originCoords.lng!)}`);
  } else {
    const cleanOrigin = cleanGmapsPoint(origin);
    if (cleanOrigin) parts.push(encodeURIComponent(cleanOrigin));
  }

  // 2. Intermediate Waypoints
  if (waypoints && waypoints.length > 0) {
    waypoints.forEach(wp => {
      if (!isDummy(wp.lat, wp.lng)) {
        parts.push(`${fmt(wp.lat!)},${fmt(wp.lng!)}`);
      } else {
        const cleanWp = cleanGmapsPoint(wp.name);
        if (cleanWp) parts.push(encodeURIComponent(cleanWp));
      }
    });
  }

  // 3. Destination
  if (destinationCoords && !isDummy(destinationCoords.lat, destinationCoords.lng)) {
    parts.push(`${fmt(destinationCoords.lat!)},${fmt(destinationCoords.lng!)}`);
  } else {
    const cleanDest = cleanGmapsPoint(destination);
    if (cleanDest) parts.push(encodeURIComponent(cleanDest));
  }

  if (parts.length === 0) return 'https://maps.google.com';
  return `https://www.google.com/maps/dir/${parts.join('/')}`;
};

