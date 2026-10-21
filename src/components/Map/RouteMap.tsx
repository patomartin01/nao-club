'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RouteProposal, Waypoint } from '../../types';
import { MapPin, Compass, Navigation, Tent, Fuel, Utensils, Mountain } from 'lucide-react';

interface RouteMapProps {
  route: RouteProposal | null;
  allRoutes?: RouteProposal[];
  onSelectRoute?: (route: RouteProposal) => void;
  isInteractiveMode?: boolean;
  onAddWaypoint?: (lat: number, lng: number) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  allRoutes = [],
  onSelectRoute,
  isInteractiveMode = false,
  onAddWaypoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Load leaflet dynamically on client
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      // Ensure leaflet styles
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center around Central Mexico (Toluca / CDMX / Hidalgo)
      const defaultCenter: [number, number] = route?.coordinates?.[0] || [19.38, -99.45];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      // Add high quality Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      polylineLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      if (isMounted) setMapLoaded(true);

      // Map click handler for custom waypoints
      map.on('click', (e: any) => {
        if (isInteractiveMode && onAddWaypoint) {
          onAddWaypoint(e.latlng.lat, e.latlng.lng);
        }
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map polyline and markers when route changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !route) return;

    const renderLayers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      const polyLayer = polylineLayerRef.current;
      const markLayer = markersLayerRef.current;

      polyLayer.clearLayers();
      markLayer.clearLayers();

      // Render alternate routes in faint gray
      allRoutes.forEach(altRoute => {
        if (altRoute.id !== route.id && altRoute.coordinates?.length > 1) {
          const altPolyline = L.polyline(altRoute.coordinates, {
            color: '#4B5563',
            weight: 3,
            opacity: 0.45,
            dashArray: '4, 8'
          }).addTo(polyLayer);

          altPolyline.on('click', () => {
            if (onSelectRoute) onSelectRoute(altRoute);
          });
        }
      });

      // Render active route polyline with glowing border
      if (route.coordinates && route.coordinates.length > 0) {
        // Outer glow
        L.polyline(route.coordinates, {
          color: '#F59E0B',
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Core line
        const mainPolyline = L.polyline(route.coordinates, {
          color: '#FBBF24',
          weight: 4,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Fit map bounds to show complete route nicely
        const bounds = mainPolyline.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
        }
      }

      // Helper for custom SVG icons
      const createCustomIcon = (type: Waypoint['type'], label: string) => {
        let bg = 'bg-amber-500';
        let iconSvg = '🏁';
        if (type === 'start') { bg = 'bg-emerald-500'; iconSvg = '🏁'; }
        else if (type === 'camp') { bg = 'bg-amber-500'; iconSvg = '⛺'; }
        else if (type === 'scenic') { bg = 'bg-cyan-500'; iconSvg = '🏔️'; }
        else if (type === 'fuel') { bg = 'bg-orange-500'; iconSvg = '⛽'; }
        else if (type === 'food') { bg = 'bg-rose-500'; iconSvg = '🌮'; }

        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-9 h-9 rounded-full ${bg} border-2 border-slate-900 shadow-xl flex items-center justify-center text-sm transform transition hover:scale-125">
                ${iconSvg}
              </div>
              <div class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-700 text-white text-[10px] font-bold py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200">
                ${label}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
      };

      // Add markers for waypoints
      if (route.waypoints && route.waypoints.length > 0) {
        route.waypoints.forEach(wp => {
          const marker = L.marker([wp.lat, wp.lng], {
            icon: createCustomIcon(wp.type, wp.name)
          }).addTo(markLayer);

          marker.on('click', () => {
            setActiveWaypoint(wp);
            map.flyTo([wp.lat, wp.lng], 12, { duration: 1.2 });
          });
        });
      }
    };

    renderLayers();
  }, [route, mapLoaded, allRoutes]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Top Left: Route Quick HUD */}
      {route && (
        <div className="absolute top-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-3.5 shadow-2xl max-w-xs text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h4 className="font-display font-bold text-sm text-slate-100 line-clamp-1">
              {route.title}
            </h4>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {route.destination}, {route.state}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Distancia</p>
              <p className="text-xs font-bold text-amber-400 font-mono">{route.totalKm} km</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Off-Road</p>
              <p className="text-xs font-bold text-emerald-400 font-mono">{route.offroadPercentage}%</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Altitud</p>
              <p className="text-xs font-bold text-cyan-400 font-mono">{route.campsite.elevationMeters}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Waypoint Popup Card */}
      {activeWaypoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10 bg-slate-900/95 backdrop-blur-lg border border-amber-500/40 rounded-xl p-4 shadow-2xl text-white animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                {activeWaypoint.type === 'camp' && <Tent className="w-4 h-4" />}
                {activeWaypoint.type === 'fuel' && <Fuel className="w-4 h-4" />}
                {activeWaypoint.type === 'food' && <Utensils className="w-4 h-4" />}
                {activeWaypoint.type === 'scenic' && <Mountain className="w-4 h-4" />}
                {activeWaypoint.type === 'start' && <Navigation className="w-4 h-4" />}
              </span>
              <div>
                <h5 className="font-bold text-sm text-slate-100">{activeWaypoint.name}</h5>
                <p className="text-[11px] text-amber-400 capitalize">{activeWaypoint.type}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveWaypoint(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
          {activeWaypoint.notes && (
            <p className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
              {activeWaypoint.notes}
            </p>
          )}
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Lat: {activeWaypoint.lat.toFixed(4)}</span>
            <span>Lng: {activeWaypoint.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Salida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Basecamp
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Mirador
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Gasolinera
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-amber-400" /> Ruta Seleccionada
        </span>
      </div>

      {isInteractiveMode && (
        <div className="absolute top-4 right-14 z-10 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
          <Compass className="w-4 h-4" />
          Haz clic en el mapa para marcar punto
        </div>
      )}
    </div>
  );
};
