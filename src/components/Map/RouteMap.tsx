'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RouteProposal, Waypoint } from '../../types';
import { 
  MapPin, 
  Compass, 
  Navigation, 
  Tent, 
  Fuel, 
  Utensils, 
  Mountain,
  Layers,
  ExternalLink,
  Maximize2
} from 'lucide-react';

interface RouteMapProps {
  route: RouteProposal | null;
  allRoutes?: RouteProposal[];
  onSelectRoute?: (route: RouteProposal) => void;
  isInteractiveMode?: boolean;
  onAddWaypoint?: (lat: number, lng: number) => void;
}

type MapLayerType = 'satellite' | 'topo' | 'dark';

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  allRoutes = [],
  onSelectRoute,
  isInteractiveMode = false,
  onAddWaypoint
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerGroupRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('satellite');

  // Switch Tile Layer helper
  const updateTileLayer = async (map: any, layerType: MapLayerType) => {
    const L = (await import('leaflet')).default;
    if (!tileLayerGroupRef.current) {
      tileLayerGroupRef.current = L.layerGroup().addTo(map);
    }
    tileLayerGroupRef.current.clearLayers();

    if (layerType === 'satellite') {
      // High-resolution Esri World Imagery (satellite photography of mountains and dirt trails)
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      });
      // Transparent highway and places labels overlay
      const labelLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      tileLayerGroupRef.current.addLayer(satLayer);
      tileLayerGroupRef.current.addLayer(labelLayer);
    } else if (layerType === 'topo') {
      // OpenStreetMap Outdoors / Topographical terrain with contour lines
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        subdomains: 'abc',
        attribution: 'OpenTopoMap'
      });
      tileLayerGroupRef.current.addLayer(topoLayer);
    } else {
      // Tactical Dark Matter (Carto)
      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: 'CartoDB Dark Matter'
      });
      tileLayerGroupRef.current.addLayer(darkLayer);
    }
  };

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

      // Default center around Central Mexico / Edomex / Querétaro
      const defaultCenter: [number, number] = route?.coordinates?.[0] || [19.38, -99.45];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 9,
        zoomControl: false,
        attributionControl: false
      });

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;
      polylineLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Load initial satellite tile layer
      await updateTileLayer(map, currentLayer);

      // Force size invalidation to avoid blank/gray map issues
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 150);
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 500);

      if (isMounted) setMapLoaded(true);

      // Map click handler for custom waypoints
      map.on('click', (e: any) => {
        if (isInteractiveMode && onAddWaypoint) {
          onAddWaypoint(e.latlng.lat, e.latlng.lng);
        }
      });
    };

    initMap();

    // Resize observer to ensure map stays sized correctly
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer Type Change
  const handleLayerChange = (layer: MapLayerType) => {
    setCurrentLayer(layer);
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, layer);
    }
  };

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
            color: '#6B7280',
            weight: 3,
            opacity: 0.5,
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
          weight: 7,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Core sharp line
        const mainPolyline = L.polyline(route.coordinates, {
          color: '#FFFFFF',
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Fit map bounds to show complete route nicely
        const bounds = mainPolyline.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        }
      }

      // Helper for custom SVG icons
      const createCustomIcon = (type: Waypoint['type'], label: string) => {
        let border = 'border-[#C87D55]';
        let fill = 'bg-[#C87D55] text-white';
        if (type === 'start') { fill = 'bg-white text-black'; border = 'border-white'; }
        else if (type === 'camp') { fill = 'bg-[#C87D55] text-white'; border = 'border-[#C87D55]'; }
        else if (type === 'fuel') { fill = 'bg-amber-500 text-black'; border = 'border-amber-400'; }

        return L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="flex items-center gap-1.5 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
              <div class="w-4 h-4 rounded-full ${fill} border-2 ${border} shadow-xl flex items-center justify-center animate-pulse">
              </div>
              <span class="px-2 py-0.5 rounded bg-black/90 text-white font-mono text-[9px] uppercase tracking-wider border border-white/20 whitespace-nowrap shadow-lg backdrop-blur-sm">
                ${label}
              </span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
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

      // Final resize call
      map.invalidateSize();
    };

    renderLayers();
  }, [route, mapLoaded, allRoutes]);

  const handleOpenGoogleMaps = () => {
    if (!route) return;
    const origin = encodeURIComponent('Interlomas, Huixquilucan, Edomex');
    const destination = encodeURIComponent(`${route.destination}, ${route.state}`);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-white/[0.12] bg-[#060709] shadow-2xl">
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-0" />

      {/* Layer Switcher & Google Maps Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-black/90 backdrop-blur-md border border-white/20 p-1 flex items-center gap-1 font-mono text-[10px] shadow-xl">
          <button
            onClick={() => handleLayerChange('satellite')}
            className={`px-2.5 py-1 uppercase font-bold tracking-wider transition ${
              currentLayer === 'satellite'
                ? 'bg-earth text-white'
                : 'text-ash hover:text-white'
            }`}
          >
            🛰️ Satélite HD
          </button>
          <button
            onClick={() => handleLayerChange('topo')}
            className={`px-2.5 py-1 uppercase font-bold tracking-wider transition ${
              currentLayer === 'topo'
                ? 'bg-earth text-white'
                : 'text-ash hover:text-white'
            }`}
          >
            ⛰️ Topo / Relieve
          </button>
          <button
            onClick={() => handleLayerChange('dark')}
            className={`px-2.5 py-1 uppercase font-bold tracking-wider transition ${
              currentLayer === 'dark'
                ? 'bg-earth text-white'
                : 'text-ash hover:text-white'
            }`}
          >
            🌑 Táctico
          </button>
        </div>

        {route && (
          <button
            onClick={handleOpenGoogleMaps}
            className="bg-black/90 hover:bg-earth text-white border border-white/20 px-3 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5 shadow-xl backdrop-blur-md"
            title="Abrir trayecto en Google Maps oficial"
          >
            <Navigation className="w-3.5 h-3.5 text-earth group-hover:text-white" />
            <span>Ver en Google Maps</span>
            <ExternalLink className="w-3 h-3 text-ash" />
          </button>
        )}
      </div>

      {/* Top Right: Active Route Quick HUD */}
      {route && (
        <div className="absolute bottom-4 right-4 sm:top-4 sm:bottom-auto z-10 bg-black/90 backdrop-blur-md border border-white/20 p-3.5 max-w-xs text-white shadow-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-earth animate-pulse" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider line-clamp-1">
              {route.title}
            </h4>
          </div>
          <p className="text-[11px] font-mono text-white/60 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-earth" />
            {route.destination}, {route.state}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 text-center font-mono">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-ash">Distancia</p>
              <p className="text-xs font-bold text-white">{route.totalKm} km</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-ash">Off-Road</p>
              <p className="text-xs font-bold text-earth">{route.offroadPercentage}%</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-ash">Altitud</p>
              <p className="text-xs font-bold text-white">{route.campsite.elevationMeters}m</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Waypoint Popup Card */}
      {activeWaypoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 bg-black/95 backdrop-blur-lg border border-earth p-4 shadow-2xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-earth/20 text-earth">
                {activeWaypoint.type === 'camp' && <Tent className="w-4 h-4" />}
                {activeWaypoint.type === 'fuel' && <Fuel className="w-4 h-4" />}
                {activeWaypoint.type === 'food' && <Utensils className="w-4 h-4" />}
                {activeWaypoint.type === 'scenic' && <Mountain className="w-4 h-4" />}
                {activeWaypoint.type === 'start' && <Navigation className="w-4 h-4" />}
              </span>
              <div>
                <h5 className="font-bold text-xs text-white uppercase tracking-wider">{activeWaypoint.name}</h5>
                <p className="text-[10px] font-mono text-earth uppercase">{activeWaypoint.type}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveWaypoint(null)}
              className="text-ash hover:text-white text-xs px-1 hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          {activeWaypoint.notes && (
            <p className="text-xs text-white/80 mt-2 bg-white/[0.04] p-2 border border-white/10 font-light">
              {activeWaypoint.notes}
            </p>
          )}
          <div className="mt-2 text-[9px] text-ash font-mono flex items-center justify-between">
            <span>LAT: {activeWaypoint.lat.toFixed(4)}</span>
            <span>LNG: {activeWaypoint.lng.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 bg-black/90 backdrop-blur-md px-3 py-1.5 border border-white/15 text-[10px] font-mono text-white/70 z-10 shadow-lg">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white shadow-sm" /> Salida
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-earth shadow-sm" /> Basecamp / Refugio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" /> Gasolina
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
