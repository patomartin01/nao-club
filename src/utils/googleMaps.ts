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

  // 1. If waypoints exist, construct clean ordered points: start -> intermediate stops -> destination
  if (route.waypoints && route.waypoints.length > 0) {
    const points = route.waypoints.map(wp => `${fmt(wp.lat)},${fmt(wp.lng)}`);
    return `https://www.google.com/maps/dir/${points.join('/')}`;
  }

  // 2. If coordinates polyline exists, sample key sequential points (origin, 2-3 turns, destination)
  if (route.coordinates && route.coordinates.length > 1) {
    const coords = route.coordinates;
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

  // 3. Fallback: Origin and Destination names
  const origin = encodeURIComponent(customOrigin || 'Interlomas, Huixquilucan, Edomex');
  const dest = encodeURIComponent(`${route.destination}, ${route.state}`);
  return `https://www.google.com/maps/dir/${origin}/${dest}`;
};
