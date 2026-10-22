'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RouteProposal, Waypoint, ActivityPost } from '../../types';
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
  Users,
  Flame,
  Radio,
  X
} from 'lucide-react';

import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

export interface RouteMapProps {
  route: RouteProposal | null;
  allRoutes?: RouteProposal[];
  onSelectRoute?: (route: RouteProposal) => void;
  isInteractiveMode?: boolean;
  onAddWaypoint?: (lat: number, lng: number) => void;
  userLocation?: { lat: number; lng: number; label?: string } | null;
  onCenterUserLocation?: () => void;
  nearbyActivities?: ActivityPost[];
  onSelectActivity?: (activity: ActivityPost) => void;
  selectedActivity?: ActivityPost | null;
  showActivityHeatmap?: boolean;
  showCommunityPilots?: boolean;
  onToggleCommunityPilots?: () => void;
  onToggleActivityHeatmap?: () => void;
  searchRadiusKm?: number;
  externalLayer?: 'satellite' | 'topo' | 'roads';
  showInternalControls?: boolean;
}

type MapLayerType = 'satellite' | 'topo' | 'roads';

export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  allRoutes = [],
  onSelectRoute,
  isInteractiveMode = false,
  onAddWaypoint,
  userLocation,
  onCenterUserLocation,
  nearbyActivities = [],
  onSelectActivity,
  selectedActivity,
  showActivityHeatmap = true,
  showCommunityPilots = true,
  onToggleCommunityPilots,
  onToggleActivityHeatmap,
  searchRadiusKm,
  externalLayer,
  showInternalControls = false
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
      // High-resolution Esri World Imagery
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri, Maxar'
      });
      // Transparent highway and places labels overlay
      const labelLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      tileLayerGroupRef.current.addLayer(satLayer);
      tileLayerGroupRef.current.addLayer(labelLayer);
    } else if (layerType === 'topo') {
      // OpenTopoMap
      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        subdomains: 'abc',
        attribution: 'OpenTopoMap'
      });
      tileLayerGroupRef.current.addLayer(topoLayer);
    } else {
      // Standard Road / Street & Trail network
      const roadLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: 'OpenStreetMap'
      });
      tileLayerGroupRef.current.addLayer(roadLayer);
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

      // Default center around user location or Central Mexico
      const defaultCenter: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : (route?.coordinates?.[0] || [19.38, -99.45]);

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

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 150);
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 500);

      if (isMounted) setMapLoaded(true);

      map.on('click', (e: any) => {
        if (isInteractiveMode && onAddWaypoint) {
          onAddWaypoint(e.latlng.lat, e.latlng.lng);
        }
      });
    };

    initMap();

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

  // Sync externalLayer prop
  useEffect(() => {
    if (externalLayer && mapInstanceRef.current && externalLayer !== currentLayer) {
      setCurrentLayer(externalLayer);
      updateTileLayer(mapInstanceRef.current, externalLayer);
    }
  }, [externalLayer, currentLayer]);

  const handleLayerChange = (layer: MapLayerType) => {
    setCurrentLayer(layer);
    if (mapInstanceRef.current) {
      updateTileLayer(mapInstanceRef.current, layer);
    }
  };

  const handleFlyToUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 11, { duration: 1.2 });
    }
    if (onCenterUserLocation) {
      onCenterUserLocation();
    }
  };

  // Render polylines, markers, user location beacon, and community rides
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const renderLayers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      const polyLayer = polylineLayerRef.current;
      const markLayer = markersLayerRef.current;

      polyLayer.clearLayers();
      markLayer.clearLayers();

      // 1. RENDER USER LOCATION RADAR BEACON & SEARCH RADIUS
      if (userLocation) {
        // Radius ring
        if (searchRadiusKm && searchRadiusKm < 900) {
          L.circle([userLocation.lat, userLocation.lng], {
            radius: searchRadiusKm * 1000,
            color: '#22d3ee',
            fillColor: '#06b6d4',
            weight: 1.5,
            opacity: 0.65,
            fillOpacity: 0.04,
            dashArray: '5, 8'
          }).addTo(polyLayer);
        }

        const userBeaconIcon = L.divIcon({
          className: 'custom-user-beacon',
          html: `
            <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
              <span class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></span>
              <span class="absolute w-6 h-6 rounded-full bg-cyan-400/50 animate-pulse"></span>
              <div class="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#22d3ee] flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-black"></div>
              </div>
              <div class="absolute -bottom-6 px-2 py-0.5 rounded bg-black/95 text-cyan-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-cyan-400/40 whitespace-nowrap shadow-xl backdrop-blur-sm pointer-events-none">
                ${userLocation.label || 'Tu Ubicación GPS'}
              </div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userBeaconIcon,
          zIndexOffset: 1000
        }).addTo(markLayer);

        userMarker.on('click', handleFlyToUserLocation);
      }

      // 2. RENDER COMMUNITY ACTIVITIES ("GENTE QUE HA SALIDO POR AQUÍ")
      if (showCommunityPilots && nearbyActivities.length > 0) {
        nearbyActivities.forEach(act => {
          if (!act.coordinates || act.coordinates.length === 0) return;

          // Draw faint glowing track for this community ride
          if (showActivityHeatmap) {
            const isSelectedAct = selectedActivity?.id === act.id;
            L.polyline(act.coordinates, {
              color: isSelectedAct ? '#F59E0B' : '#E07A5F',
              weight: isSelectedAct ? 4.5 : 2.5,
              opacity: isSelectedAct ? 0.95 : 0.55,
              lineCap: 'round',
              dashArray: isSelectedAct ? undefined : '4, 6'
            }).addTo(polyLayer);
          }

          // Pilot Avatar Pin on start coordinate
          const startPt = act.coordinates[0];
          const pilotIcon = L.divIcon({
            className: 'custom-pilot-marker',
            html: `
              <div class="relative group cursor-pointer flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-125 z-40">
                <div class="w-7 h-7 rounded-full overflow-hidden border-2 border-white/60 ring-2 ring-black shadow-2xl">
                  <img src="${act.pilotAvatar}" alt="${act.pilotName}" class="w-full h-full object-cover" />
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF5500] border border-black shadow">
                </div>
                <div class="hidden group-hover:flex absolute -top-8 px-2 py-0.5 rounded bg-black/95 text-white font-mono text-[9px] whitespace-nowrap border border-white/20 shadow-xl z-50 pointer-events-none">
                  ${act.pilotName} • ${act.motoModel}
                </div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const pilotMarker = L.marker(startPt, {
            icon: pilotIcon,
            zIndexOffset: 500
          }).addTo(markLayer);

          pilotMarker.on('click', () => {
            if (onSelectActivity) onSelectActivity(act);
            map.flyTo(startPt, 11, { duration: 1.0 });
          });
        });
      }

      // 3. RENDER ALTERNATE ROUTE PROPOSALS
      allRoutes.forEach(altRoute => {
        if ((!route || altRoute.id !== route.id) && altRoute.coordinates?.length > 1) {
          const altPolyline = L.polyline(altRoute.coordinates, {
            color: '#64748b',
            weight: 3,
            opacity: 0.5,
            dashArray: '4, 8'
          }).addTo(polyLayer);

          altPolyline.on('click', () => {
            if (onSelectRoute) onSelectRoute(altRoute);
          });
        }
      });

      // 4. RENDER ACTIVE ROUTE POLYLINE (Strava Vibrant High-Vis Orange)
      if (route && route.coordinates && route.coordinates.length > 0) {
        // Outer glowing halo (Strava signature neon orange)
        L.polyline(route.coordinates, {
          color: '#FC4C02',
          weight: 8,
          opacity: 0.45,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Core high-contrast line
        const mainPolyline = L.polyline(route.coordinates, {
          color: '#FF5500',
          weight: 4.5,
          opacity: 0.98,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(polyLayer);

        // Floating Surface Breakdown pill on route midpoint (Exact Strava style from screenshot)
        if (route.coordinates.length > 2) {
          const midIdx = Math.floor(route.coordinates.length / 2);
          const midCoord = route.coordinates[midIdx];
          const surfacePillIcon = L.divIcon({
            className: 'custom-surface-pill',
            html: `
              <div class="transform -translate-x-1/2 -translate-y-1/2 bg-[#121110]/95 backdrop-blur-md text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-2xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none select-none">
                <span class="w-2.5 h-1.5 rounded-full bg-[#FF5500] shadow-[0_0_8px_#ff5500]"></span>
                <span>Asfalto: ${route.asphaltPercentage}% · Brecha: ${route.offroadPercentage}%</span>
              </div>
            `,
            iconSize: [140, 24],
            iconAnchor: [70, 12]
          });
          L.marker(midCoord, { icon: surfacePillIcon, zIndexOffset: 800 }).addTo(markLayer);
        }

        // Summit / Destination Peak Pill
        if (route.destination && route.coordinates.length > 0) {
          const endCoord = route.coordinates[route.coordinates.length - 1];
          const peakPillIcon = L.divIcon({
            className: 'custom-peak-pill',
            html: `
              <div class="transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-md text-stone-200 font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border border-white/15 shadow-xl flex items-center gap-1 whitespace-nowrap pointer-events-none select-none">
                <span>${route.destination}</span>
              </div>
            `,
            iconSize: [120, 20],
            iconAnchor: [60, 10]
          });
          L.marker(endCoord, { icon: peakPillIcon, zIndexOffset: 750 }).addTo(markLayer);
        }

        const bounds = mainPolyline.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
        }
      }

      // 5. RENDER WAYPOINT ICONS
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

      if (route?.waypoints && route.waypoints.length > 0) {
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

      map.invalidateSize();
    };

    renderLayers();
  }, [
    route, 
    mapLoaded, 
    allRoutes, 
    userLocation, 
    nearbyActivities, 
    showCommunityPilots, 
    showActivityHeatmap, 
    selectedActivity,
    searchRadiusKm
  ]);

  const handleOpenGoogleMaps = () => {
    if (!route) return;
    const url = buildOrderedGoogleMapsUrl(route);
    window.open(url, '_blank');
  };

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[520px] rounded-2xl overflow-hidden border border-white/[0.15] bg-[#060709] shadow-2xl">
      {/* Map canvas container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px] sm:min-h-[520px] z-0" />

      {/* Top Left: Layer Switcher & Controls */}
      {showInternalControls && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-60px)]">
          {/* Layer style toggle */}
          <div className="bg-black/90 backdrop-blur-md border border-white/20 p-1 rounded-xl flex items-center gap-1 font-mono text-[9px] sm:text-[10px] shadow-xl">
            <button
              onClick={() => handleLayerChange('satellite')}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider transition touch-manipulation ${
                currentLayer === 'satellite'
                  ? 'bg-earth text-white'
                  : 'text-ash hover:text-white'
              }`}
            >
              Satélite HD
            </button>
            <button
              onClick={() => handleLayerChange('topo')}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider transition touch-manipulation ${
                currentLayer === 'topo'
                  ? 'bg-earth text-white'
                  : 'text-ash hover:text-white'
              }`}
            >
              Topo
            </button>
            <button
              onClick={() => handleLayerChange('roads')}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold tracking-wider transition touch-manipulation ${
                currentLayer === 'roads'
                  ? 'bg-earth text-white'
                  : 'text-ash hover:text-white'
              }`}
            >
              Calles
            </button>
          </div>

          {/* Quick GPS Center Button */}
          {userLocation && (
            <button
              onClick={handleFlyToUserLocation}
              className="bg-black/90 hover:bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 px-3 py-1.5 rounded-xl font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5 shadow-xl backdrop-blur-md"
              title="Centrar mapa en tu ubicación actual"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Mi Ubicación</span>
            </button>
          )}

          {/* Toggle Pilotos en la Zona */}
          {onToggleCommunityPilots && nearbyActivities.length > 0 && (
            <button
              onClick={onToggleCommunityPilots}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5 shadow-xl backdrop-blur-md border ${
                showCommunityPilots 
                  ? 'bg-earth/20 border-earth text-earth' 
                  : 'bg-black/80 border-white/20 text-ash hover:text-white'
              }`}
              title="Ver salidas de pilotos y rodadas comunitarias en la zona"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pilotos ({nearbyActivities.length})</span>
            </button>
          )}

          {/* Toggle Heatmap / Trazados */}
          {onToggleActivityHeatmap && (
            <button
              onClick={onToggleActivityHeatmap}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5 shadow-xl backdrop-blur-md border ${
                showActivityHeatmap 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-black/80 border-white/20 text-ash hover:text-white'
              }`}
              title="Alternar mapa de calor y trazados de actividad"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mapa de Actividad</span>
            </button>
          )}

          {/* Open in Google Maps */}
          {route && (
            <button
              onClick={handleOpenGoogleMaps}
              className="bg-black/90 hover:bg-earth text-white border border-white/20 px-3 py-1.5 rounded-xl font-mono text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition flex items-center gap-1.5 shadow-xl backdrop-blur-md touch-manipulation"
              title="Abrir trayecto con todas las paradas en orden en Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-earth group-hover:text-white" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-ash" />
            </button>
          )}
        </div>
      )}

      {/* Top Right: Active Route / Activity HUD */}
      {showInternalControls && route && !selectedActivity && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto z-10 bg-black/90 backdrop-blur-md border border-white/20 p-3.5 rounded-xl sm:max-w-xs text-white shadow-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-earth animate-pulse" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider line-clamp-1">
              {route.title}
            </h4>
          </div>
          <p className="text-[11px] font-mono text-white/60 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-earth" />
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
              <p className="text-[9px] uppercase tracking-wider text-ash">Dificultad</p>
              <p className="text-[10px] font-bold text-stone-300 truncate">{route.difficulty.split(' ')[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Pilot Activity HUD if clicked */}
      {selectedActivity && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto z-20 bg-black/95 backdrop-blur-md border border-earth p-4 rounded-xl sm:max-w-sm text-white shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedActivity.pilotAvatar} 
                alt={selectedActivity.pilotName} 
                className="w-9 h-9 rounded-full object-cover border border-earth shrink-0" 
              />
              <div className="min-w-0">
                <h5 className="font-bold text-xs text-white uppercase truncate">
                  {selectedActivity.pilotName}
                </h5>
                <p className="text-[10px] text-earth font-mono">
                  {selectedActivity.motoModel}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectActivity && onSelectActivity(null as any)}
              className="text-ash hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 text-xs">
            <p className="font-bold text-white mb-1 line-clamp-1">{selectedActivity.title}</p>
            <p className="text-[10px] text-ash flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-stone-400" />
              {selectedActivity.location} • {selectedActivity.dateText}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 text-center font-mono">
            <div>
              <p className="text-[9px] uppercase text-ash">Distancia</p>
              <p className="text-xs font-bold text-white">{selectedActivity.distanceKm.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-ash">Desnivel</p>
              <p className="text-xs font-bold text-cyan-300">+{selectedActivity.elevationGainM}m</p>
            </div>
            <div>
              <p className="text-[9px] uppercase text-ash">Promedio</p>
              <p className="text-xs font-bold text-white">{selectedActivity.avgSpeedKmh} km/h</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Waypoint Popup Card */}
      {activeWaypoint && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 bg-black/95 backdrop-blur-lg border border-earth p-4 rounded-xl shadow-2xl text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-earth/20 text-earth">
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
              className="text-ash hover:text-white p-1 hover:bg-white/10 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {activeWaypoint.notes && (
            <p className="text-xs text-white/80 mt-2 bg-white/[0.04] p-2 rounded border border-white/10 font-light">
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
      {showInternalControls && (
        <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-3 bg-black/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 text-[10px] font-mono text-white/80 z-10 shadow-lg">
          {userLocation && (
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> Tu Posición
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-sm" /> Salida
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-earth shadow-sm" /> Basecamp
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" /> Pilotos en la Zona
          </span>
        </div>
      )}

      {isInteractiveMode && (
        <div className="absolute top-4 right-14 z-10 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-pulse">
          <Compass className="w-4 h-4" />
          Haz clic en el mapa para marcar punto
        </div>
      )}
    </div>
  );
};
