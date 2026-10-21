import { RouteProposal } from '../types';

/**
 * Builds an official Google Maps directions URL with ALL waypoints in exact sequential order.
 * Format: https://www.google.com/maps/dir/?api=1&origin=...&destination=...&waypoints=wp1|wp2...&travelmode=driving
 */
export const buildOrderedGoogleMapsUrl = (
  route: RouteProposal,
  customOrigin?: string
): string => {
  if (!route) return 'https://www.google.com/maps';

  // 1. If structured waypoints exist, use them in exact sequence
  if (route.waypoints && route.waypoints.length > 0) {
    const wps = [...route.waypoints];
    const startWp = wps[0];
    const endWp = wps[wps.length - 1];

    const origin = `${startWp.lat},${startWp.lng}`;
    const destination = `${endWp.lat},${endWp.lng}`;

    const intermediate = wps.slice(1, wps.length - 1);
    const waypointsParam = intermediate.map(wp => `${wp.lat},${wp.lng}`).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    
    if (waypointsParam) {
      url += `&waypoints=${encodeURIComponent(waypointsParam)}`;
    }
    return url;
  }

  // 2. If coordinates polyline exists, sample key turn points
  if (route.coordinates && route.coordinates.length > 1) {
    const coords = route.coordinates;
    const start = coords[0];
    const end = coords[coords.length - 1];

    const intermediates: string[] = [];
    if (coords.length > 3) {
      const step = Math.max(1, Math.floor(coords.length / 4));
      for (let i = step; i < coords.length - 1; i += step) {
        intermediates.push(`${coords[i][0]},${coords[i][1]}`);
      }
    }

    let url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${start[0]},${start[1]}`)}&destination=${encodeURIComponent(`${end[0]},${end[1]}`)}&travelmode=driving`;
    if (intermediates.length > 0) {
      url += `&waypoints=${encodeURIComponent(intermediates.join('|'))}`;
    }
    return url;
  }

  // 3. Fallback to origin text + destination
  const origin = encodeURIComponent(customOrigin || 'Interlomas, Huixquilucan, Edomex');
  const destination = encodeURIComponent(`${route.destination}, ${route.state}`);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
};
