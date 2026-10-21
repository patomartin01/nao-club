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

      // Render active route polyline with sleek copper & chalk lines
      if (route.coordinates && route.coordinates.length > 0) {
        // Outer glow / halo
        L.polyline(route.coordinates, {
          color: '#C87D55',
          weight: 6,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Core sharp line
        const mainPolyline = L.polyline(route.coordinates, {
          color: '#FFFFFF',
          weight: 3,
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
        let border = 'border-[#C87D55]';
        let fill = 'bg-[#C87D55]';
        if (type === 'start') { fill = 'bg-white text-black'; border = 'border-white'; }
        else if (type === 'camp') { fill = 'bg-[#C87D55] text-white'; border = 'border-[#C87D55]'; }
        else if (type === 'fuel') { fill = 'bg-amber-500 text-black'; border = 'border-amber-500'; }

        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="flex items-center gap-1.5 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
              <div class="w-3.5 h-3.5 rounded-full ${fill} border-2 ${border} shadow-lg flex items-center justify-center">
              </div>
              <span class="px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[9px] uppercase tracking-wider border border-white/20 whitespace-nowrap shadow-md">
                ${label}
              </span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
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
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/[0.08] bg-[#060709] shadow-2xl">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Top Left: Route Quick HUD */}
      {route && (
        <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-white/15 p-3.5 max-w-xs text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C87D55] animate-pulse" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider line-clamp-1">
              {route.title}
            </h4>
          </div>
          <p className="text-[11px] font-mono text-white/50 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#C87D55]" />
            {route.destination}, {route.state}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 text-center font-mono">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40">Distancia</p>
              <p className="text-xs font-bold text-white">{route.totalKm} km</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40">Off-Road</p>
              <p className="text-xs font-bold text-[#C87D55]">{route.offroadPercentage}%</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-white/40">Altitud</p>
              <p className="text-xs font-bold text-white">{route.campsite.elevationMeters}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Waypoint Popup Card */}
      {activeWaypoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-10 bg-black/95 backdrop-blur-lg border border-[#C87D55] p-4 shadow-2xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#C87D55]/20 text-[#C87D55]">
                {activeWaypoint.type === 'camp' && <Tent className="w-4 h-4" />}
                {activeWaypoint.type === 'fuel' && <Fuel className="w-4 h-4" />}
                {activeWaypoint.type === 'food' && <Utensils className="w-4 h-4" />}
                {activeWaypoint.type === 'scenic' && <Mountain className="w-4 h-4" />}
                {activeWaypoint.type === 'start' && <Navigation className="w-4 h-4" />}
              </span>
              <div>
                <h5 className="font-bold text-xs text-white uppercase tracking-wider">{activeWaypoint.name}</h5>
                <p className="text-[10px] font-mono text-[#C87D55] uppercase">{activeWaypoint.type}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveWaypoint(null)}
              className="text-white/40 hover:text-white text-xs px-1 hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          {activeWaypoint.notes && (
            <p className="text-xs text-white/70 mt-2 bg-white/[0.04] p-2 border border-white/10 font-light">
              {activeWaypoint.notes}
            </p>
          )}
          <div className="mt-2 text-[9px] text-white/40 font-mono flex items-center justify-between">
            <span>LAT: {activeWaypoint.lat.toFixed(4)}</span>
            <span>LNG: {activeWaypoint.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/10 text-[10px] font-mono text-white/60 z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white" /> Salida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#C87D55]" /> Navana / Base
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Gasolinera
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
