'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Waypoint, WaypointType, RouteProposal } from '../../types';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';
import { 
  X, 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Navigation, 
  Compass, 
  Gauge, 
  Mountain, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  Fuel,
  Camera,
  AlertTriangle,
  Coffee,
  Tent,
  Sparkles,
  Radio
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveRouteRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset trail for simulation mode (Interlomas -> Presa Iturbide -> Bosque Otomí)
const SIMULATED_COORDS: [number, number, number][] = [
  // [lat, lng, elevation]
  [19.4005, -99.2816, 2520], // Salida Interlomas
  [19.4080, -99.3010, 2580],
  [19.4210, -99.3250, 2690],
  [19.4350, -99.3520, 2810],
  [19.4480, -99.3800, 2940], // Curvas carretera
  [19.4520, -99.3950, 3010], // Parada: Caseta / Gas
  [19.4520, -99.3950, 3010], // Detenido (Parada detectada)
  [19.4630, -99.4120, 3120], // Entrada a brecha de terracería
  [19.4750, -99.4300, 3240], // Brecha sierra
  [19.4890, -99.4550, 3360], // Mirador panorámico
  [19.4890, -99.4550, 3360], // Detenido
  [19.5020, -99.4800, 3280], // Descenso hacia presa
  [19.5150, -99.5050, 3150], // Paso con lodo y piedras
  [19.5260, -99.5280, 2980], // Presa Iturbide
  [19.5380, -99.5510, 2890]  // Basecamp final
];

export const LiveRouteRecorderModal: React.FC<LiveRouteRecorderModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    currentCrew, 
    crews, 
    currentRodada, 
    rodadas, 
    currentUser, 
    proposeRoute, 
    setSelectedRoute 
  } = useApp();

  // Recording lifecycle
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Live telemetry metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [currentElevation, setCurrentElevation] = useState(2520);
  const [maxElevation, setMaxElevation] = useState(2520);

  // Recorded track & stops
  const [trackCoords, setTrackCoords] = useState<[number, number][]>([]);
  const [recordedWaypoints, setRecordedWaypoints] = useState<Waypoint[]>([]);
  const [stoppedSeconds, setStoppedSeconds] = useState(0);
  const [detectedStopsCount, setDetectedStopsCount] = useState(0);

  // Save form states
  const [routeTitle, setRouteTitle] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil (Fluida)' | 'Intermedio' | 'Avanzado / Técnico'>('Intermedio');
  const [targetCrewId, setTargetCrewId] = useState(currentCrew?.id || crews[0]?.id || '');
  const [targetRodadaId, setTargetRodadaId] = useState(currentRodada?.id || rodadas[0]?.id || '');
  const [savedRouteUrl, setSavedRouteUrl] = useState<string | null>(null);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const waypointsLayerRef = useRef<any>(null);
  const [currentLayer, setCurrentLayer] = useState<'satellite' | 'topo'>('satellite');

  // Simulation index
  const simStepRef = useRef(0);
  const timerIntervalRef = useRef<any>(null);
  const gpsWatcherRef = useRef<number | null>(null);

  // Calculate distance between two lat/lng coords (Haversine in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const initLeaflet = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialCenter: [number, number] = trackCoords[0] || [19.4005, -99.2816];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Tile Layer (Satellite HD default)
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      const labelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      satLayer.addTo(map);
      labelsLayer.addTo(map);

      // Polyline for recorded track
      const poly = L.polyline([], {
        color: '#E07A5F',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round'
      }).addTo(map);
      polylineRef.current = poly;

      // Rider marker icon
      const riderIcon = L.divIcon({
        className: 'rider-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(224,122,95,0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 50%; background: #E07A5F; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.8); z-index: 10;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const riderMarker = L.marker(initialCenter, { icon: riderIcon }).addTo(map);
      riderMarkerRef.current = riderMarker;

      // Layer group for waypoints
      waypointsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (gpsWatcherRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(gpsWatcherRef.current);
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen]);

  // Handle Layer change
  const handleLayerChange = async (layer: 'satellite' | 'topo') => {
    setCurrentLayer(layer);
    if (!mapInstanceRef.current) return;
    const L = (await import('leaflet')).default;
    
    // Clear existing tiles
    mapInstanceRef.current.eachLayer((l: any) => {
      if (l instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(l);
      }
    });

    if (layer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(mapInstanceRef.current);
      L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(mapInstanceRef.current);
    } else {
      L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: 'OpenTopoMap' }).addTo(mapInstanceRef.current);
    }
  };

  // Add a recorded point to track
  const appendPoint = async (lat: number, lng: number, ele: number = 2600, speed: number = 0) => {
    setTrackCoords(prev => {
      const next = [...prev, [lat, lng] as [number, number]];
      
      // Update distance
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const addedKm = calculateDistance(last[0], last[1], lat, lng);
        setDistanceKm(d => Number((d + addedKm).toFixed(2)));
      }

      // Update Map Polyline & Rider position
      if (mapInstanceRef.current) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(next);
        }
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([lat, lng]);
        }
        mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
      }

      return next;
    });

    setCurrentSpeed(speed);
    setCurrentElevation(ele);
    setMaxElevation(prevMax => Math.max(prevMax, ele));

    // Auto-detect stops: if speed < 3 km/h
    if (speed < 3) {
      setStoppedSeconds(prev => {
        const updated = prev + 2;
        // If stopped for > 8 seconds in simulation or 30s in real GPS, log a stop!
        const threshold = isSimulating ? 8 : 30;
        if (updated >= threshold && updated < threshold + 3) {
          logAutomaticStop(lat, lng, ele);
        }
        return updated;
      });
    } else {
      setStoppedSeconds(0);
    }
  };

  // Log an automatic stop detected by GPS inactivity
  const logAutomaticStop = async (lat: number, lng: number, ele: number) => {
    const stopNum = detectedStopsCount + 1;
    const newStop: Waypoint = {
      id: `stop-${Date.now()}`,
      name: `Parada #${stopNum} (Pausa de Manejo)`,
      lat,
      lng,
      type: 'camp',
      notes: `Parada detectada por telemetría. Altitud: ${ele}m. Tiempo en ruta: ${formatTime(elapsedSeconds)}`
    };

    setDetectedStopsCount(c => c + 1);
    setRecordedWaypoints(wps => [...wps, newStop]);
    addMarkerToMap(newStop, 'STOP');
  };

  // Manual Waypoint / Stop Logger
  const handleAddManualWaypoint = (type: WaypointType, label: string, tag: string) => {
    const currentLoc = trackCoords[trackCoords.length - 1] || [19.4005, -99.2816];
    const newWp: Waypoint = {
      id: `wp-${Date.now()}`,
      name: `${label} (Km ${distanceKm})`,
      lat: currentLoc[0],
      lng: currentLoc[1],
      type,
      notes: `Registrado manualmente por ${currentUser.name} a ${currentElevation}m de altitud.`
    };

    setRecordedWaypoints(prev => [...prev, newWp]);
    addMarkerToMap(newWp, tag);
    confetti({ particleCount: 20, spread: 45 });
  };

  // Add marker symbol to Leaflet map
  const addMarkerToMap = async (wp: Waypoint, tag: string) => {
    if (!mapInstanceRef.current || !waypointsLayerRef.current) return;
    const L = (await import('leaflet')).default;

    const markerIcon = L.divIcon({
      className: 'wp-marker',
      html: `
        <div style="background: #0B0A09; border: 1.5px solid #E07A5F; color: white; padding: 3px 6px; border-radius: 2px; font-size: 10px; font-family: monospace; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 5px;">
          <span style="background: #E07A5F; color: black; font-weight: 800; font-size: 8px; padding: 1px 3px; border-radius: 2px;">${tag}</span>
          <span>${wp.name.split('(')[0]}</span>
        </div>
      `,
      iconSize: [120, 30],
      iconAnchor: [60, 15]
    });

    L.marker([wp.lat, wp.lng], { icon: markerIcon })
      .bindPopup(`<b>${wp.name}</b><br/>${wp.notes || ''}`)
      .addTo(waypointsLayerRef.current);
  };

  // Start recording
  const handleStart = () => {
    setIsRecording(true);
    setIsPaused(false);

    // Initial Start Waypoint
    if (trackCoords.length === 0) {
      const startCoord = SIMULATED_COORDS[0];
      const startWp: Waypoint = {
        id: `start-${Date.now()}`,
        name: 'Punto de Salida',
        lat: startCoord[0],
        lng: startCoord[1],
        type: 'start',
        notes: `Inicio de grabación GPS: ${new Date().toLocaleTimeString()}`
      };
      setRecordedWaypoints([startWp]);
      appendPoint(startCoord[0], startCoord[1], startCoord[2], 0);
      addMarkerToMap(startWp, 'START');
    }

    // Start Timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    // If real GPS is requested and not simulating
    if (!isSimulating && typeof navigator !== 'undefined' && navigator.geolocation) {
      gpsWatcherRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const ele = Math.round(pos.coords.altitude || 2500);
          const spd = Math.round((pos.coords.speed || 0) * 3.6); // m/s to km/h
          appendPoint(lat, lng, ele, spd);
        },
        (err) => {
          console.warn('GPS not available, switching to assisted tracking', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
  };

  // Pause
  const handlePause = () => {
    setIsPaused(true);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Resume
  const handleResume = () => {
    setIsPaused(false);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  };

  // Simulation tick (demo drive across mountain curves)
  useEffect(() => {
    if (!isRecording || isPaused || !isSimulating) return;

    const interval = setInterval(() => {
      if (simStepRef.current < SIMULATED_COORDS.length - 1) {
        simStepRef.current += 1;
        const pt = SIMULATED_COORDS[simStepRef.current];
        // Calculate simulated speed (e.g. 0 if stopped, otherwise 35-65 km/h)
        const prevPt = SIMULATED_COORDS[simStepRef.current - 1];
        const isSame = prevPt[0] === pt[0] && prevPt[1] === pt[1];
        const spd = isSame ? 0 : Math.floor(Math.random() * 25) + 40;
        appendPoint(pt[0], pt[1], pt[2], spd);
      } else {
        // Finished simulation
        setIsPaused(true);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording, isPaused, isSimulating]);

  // Finalize & Open Save Dialog
  const handleOpenSaveDialog = () => {
    handlePause();
    // Add End Waypoint if not already
    const lastLoc = trackCoords[trackCoords.length - 1] || [19.5380, -99.5510];
    const endWp: Waypoint = {
      id: `end-${Date.now()}`,
      name: 'Destino Final / Término de Ruta',
      lat: lastLoc[0],
      lng: lastLoc[1],
      type: 'end',
      notes: `Finalización de recorrido. Distancia: ${distanceKm} km.`
    };
    setRecordedWaypoints(prev => [...prev, endWp]);
    addMarkerToMap(endWp, 'END');

    setRouteTitle(`Expedición Grabada ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} (${distanceKm} km)`);
    setRouteDescription(`Ruta off-road registrada en vivo por ${currentUser.name}. Registró ${detectedStopsCount} paradas técnicas, altitud máxima de ${maxElevation}m y ${distanceKm} km de recorrido total.`);
    setShowSaveDialog(true);
  };

  // Save into Group
  const handleSaveToGroup = () => {
    if (!routeTitle.trim()) return;

    // Build the final RouteProposal
    const newRoute: Omit<RouteProposal, 'id' | 'votes' | 'comments'> = {
      rodadaId: targetRodadaId || currentRodada?.id || 'rodada-diademuertos-2026',
      title: routeTitle.trim(),
      destination: 'Presa Iturbide / Bosque Otomí',
      state: 'Estado de México',
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: routeDescription.trim(),
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200',
      totalKm: distanceKm || 48,
      estimatedHours: `${formatTime(elapsedSeconds)} (Manejo activo)`,
      offroadPercentage: 65,
      asphaltPercentage: 35,
      difficulty,
      campsite: {
        name: 'Basecamp Iturbide Offroad',
        elevationMeters: maxElevation,
        minTempNight: '4°C a 8°C',
        security: 'Comunidad ejidal y acceso con brecha controlada',
        amenities: ['Fogatas', 'Agua de río', 'Espacio para 15 tiendas', 'Señal satelital']
      },
      itinerary: [
        {
          day: 1,
          title: 'Tramo Grabado en Vivo',
          description: `Recorrido real con ${recordedWaypoints.length} waypoints y paradas registradas.`,
          distanceKm,
          offroadKm: Number((distanceKm * 0.65).toFixed(1)),
          terrainType: 'Brechas de tierra, piedra suelta y senderos de pino'
        }
      ],
      waypoints: recordedWaypoints,
      coordinates: trackCoords.length > 0 ? trackCoords : SIMULATED_COORDS.map(c => [c[0], c[1]]),
      dayOfDeadVibe: 'Ruta trazada en tiempo real por la tribu.',
      safetyTips: ['Llevar kit de parches y compresor', 'Monitorear presión de llantas en terreno rocoso']
    };

    // Save into state
    proposeRoute(newRoute);

    // Build Google Maps full multi-stop navigation url
    const fullRouteObject = {
      ...newRoute,
      id: `temp-${Date.now()}`,
      votes: [],
      comments: []
    } as RouteProposal;
    const gmapsUrl = buildOrderedGoogleMapsUrl(fullRouteObject);
    setSavedRouteUrl(gmapsUrl);

    confetti({ particleCount: 100, spread: 90 });
  };

  // Close modal safely
  const handleCloseModal = () => {
    handlePause();
    setShowSaveDialog(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#1A1918]/70 backdrop-blur-sm flex flex-col font-sans text-[#1A1918] overflow-hidden h-screen w-screen animate-fadeIn">
      
      {/* 1. TOP COCKPIT BAR */}
      <header className="shrink-0 border-b-2 border-[#1A1918] bg-[#F4EEDB] px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full border border-[#1A1918] ${isRecording && !isPaused ? 'bg-[#E6332A] animate-pulse' : 'bg-[#1A1918]/30'}`} />
            <span className="font-display font-black text-base sm:text-lg text-[#1A1918] uppercase tracking-wide">
              {isRecording && !isPaused ? 'Telemetría GPS en Vivo' : isPaused ? 'Grabación en Pausa' : 'Instrumento GPS de Expedición'}
            </span>
          </div>
          <span className="text-[10px] text-[#E6332A] uppercase font-mono font-black tracking-widest hidden md:inline">
            ★ MOTO TELEMETRY ★
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Simulation toggle for desk testing */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3 py-1.5 text-[10px] uppercase font-display font-black tracking-wider border-2 border-[#1A1918] rounded-xl transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              isSimulating 
                ? 'bg-[#E6332A] text-white' 
                : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F7B32B]'
            }`}
            title="Simula un trayecto real con curvas y altitud"
          >
            {isSimulating ? 'Demo Activo' : 'Simular Track'}
          </button>

          <button
            onClick={handleCloseModal}
            className="px-3.5 py-1.5 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#E6332A] hover:text-white text-[#1A1918] transition flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Cerrar telemetría y volver"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN COCKPIT VIEWPORT (MAP + LIVE HUD OVERLAY) */}
      <div className="flex-1 min-h-0 relative flex flex-col lg:flex-row overflow-hidden">
        
        {/* MAP CANVAS */}
        <div className="flex-1 min-h-0 relative h-full w-full bg-[#FAF6ED] overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

          {/* Map Layer Switcher (Top Left) */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="bg-[#FAF6ED]/95 backdrop-blur-md border-2 border-[#1A1918] p-1 rounded-2xl shadow-[4px_4px_0px_#1A1918] flex items-center gap-1 text-[10px]">
              <button
                onClick={() => handleLayerChange('satellite')}
                className={`px-3 py-1 uppercase font-display font-black tracking-wider rounded-xl border transition ${
                  currentLayer === 'satellite' ? 'bg-[#1A1918] text-white border-[#1A1918]' : 'text-[#1A1918] border-transparent hover:bg-[#F4EEDB]'
                }`}
              >
                Satélite
              </button>
              <button
                onClick={() => handleLayerChange('topo')}
                className={`px-3 py-1 uppercase font-display font-black tracking-wider rounded-xl border transition ${
                  currentLayer === 'topo' ? 'bg-[#1A1918] text-white border-[#1A1918]' : 'text-[#1A1918] border-transparent hover:bg-[#F4EEDB]'
                }`}
              >
                Topográfico
              </button>
            </div>
          </div>

          {/* Real-time Waypoint / POI Floating Quick-Buttons (Bottom Over Map) */}
          {isRecording && !isPaused && (
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-10 flex flex-wrap items-center gap-2 bg-[#FAF6ED]/95 backdrop-blur-md border-2 border-[#1A1918] p-2 rounded-2xl shadow-[4px_4px_0px_#1A1918]">
              <span className="text-[10px] text-[#E6332A] uppercase font-mono font-black pr-2 border-r-2 border-[#1A1918]">
                Punto:
              </span>
              <button
                onClick={() => handleAddManualWaypoint('fuel', 'Gasolinera', 'GAS')}
                className="px-2.5 py-1 bg-[#F4EEDB] hover:bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] text-[10px] uppercase font-display font-black flex items-center gap-1.5 transition rounded-xl shadow-[1px_1px_0px_#1A1918]"
              >
                <Fuel className="w-3 h-3 text-[#E6332A]" />
                <span>Gas</span>
              </button>
              <button
                onClick={() => handleAddManualWaypoint('scenic', 'Mirador', 'VISTA')}
                className="px-2.5 py-1 bg-[#F4EEDB] hover:bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] text-[10px] uppercase font-display font-black flex items-center gap-1.5 transition rounded-xl shadow-[1px_1px_0px_#1A1918]"
              >
                <Camera className="w-3 h-3 text-[#1A1918]" />
                <span>Mirador</span>
              </button>
              <button
                onClick={() => handleAddManualWaypoint('dirt', 'Paso Técnico', 'TECNICO')}
                className="px-2.5 py-1 bg-[#F4EEDB] hover:bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] text-[10px] uppercase font-display font-black flex items-center gap-1.5 transition rounded-xl shadow-[1px_1px_0px_#1A1918]"
              >
                <AlertTriangle className="w-3 h-3 text-[#E06423]" />
                <span>Paso Técnico</span>
              </button>
              <button
                onClick={() => handleAddManualWaypoint('camp', 'Descanso', 'DESCANSO')}
                className="px-2.5 py-1 bg-[#F4EEDB] hover:bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] text-[10px] uppercase font-display font-black flex items-center gap-1.5 transition rounded-xl shadow-[1px_1px_0px_#1A1918]"
              >
                <Coffee className="w-3 h-3 text-[#E6332A]" />
                <span>Descanso</span>
              </button>
            </div>
          )}
        </div>

        {/* TELEMETRY HUD SIDEBAR */}
        <aside className="w-full lg:w-96 shrink-0 border-t-2 lg:border-t-0 lg:border-l-2 border-[#1A1918] bg-[#F4EEDB] flex flex-col h-full overflow-hidden text-[#1A1918]">
          
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5">
            
            {/* Live Big Gauges */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Chrono */}
              <div className="p-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E6332A]" />
                  Tiempo Rodando
                </span>
                <p className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] tracking-tight">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>

              {/* Odometer */}
              <div className="p-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black tracking-wider flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#E6332A]" />
                  Odómetro Vivo
                </span>
                <p className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] tracking-tight">
                  {distanceKm} <span className="text-sm font-bold text-[#1A1918]/60">km</span>
                </p>
              </div>

              {/* Speed */}
              <div className="p-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black tracking-wider flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-[#E6332A]" />
                  Velocidad
                </span>
                <p className="font-display font-black text-2xl text-[#1A1918] tracking-tight">
                  {currentSpeed} <span className="text-sm font-bold text-[#1A1918]/60">km/h</span>
                </p>
              </div>

              {/* Altitude */}
              <div className="p-3.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl space-y-1 shadow-[3px_3px_0px_#1A1918]">
                <span className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black tracking-wider flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-[#E6332A]" />
                  Altitud GPS
                </span>
                <p className="font-display font-black text-2xl text-[#1A1918] tracking-tight">
                  {currentElevation} <span className="text-sm font-bold text-[#1A1918]/60">m</span>
                </p>
              </div>

            </div>

            {/* Stops Detected Feed */}
            <div className="space-y-2 border-t-2 border-[#1A1918] pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1A1918] uppercase font-display font-black text-[10px] tracking-wider">
                  Paradas & Puntos Clave ({recordedWaypoints.length})
                </span>
                {stoppedSeconds > 0 && (
                  <span className="text-[#E6332A] text-[10px] font-mono font-black animate-pulse">
                    Detenido: {stoppedSeconds}s
                  </span>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
                {recordedWaypoints.length === 0 ? (
                  <p className="text-[#1A1918]/60 text-[11px] font-serif italic py-2 font-medium">
                    Inicia la grabación para comenzar a registrar el recorrido y las paradas automáticamente...
                  </p>
                ) : (
                  recordedWaypoints.map((wp, idx) => (
                    <div key={wp.id} className="p-2.5 border-2 border-[#1A1918] bg-[#FAF6ED] rounded-xl flex items-center justify-between shadow-[2px_2px_0px_#1A1918]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-lg bg-[#1A1918] text-[#FAF6ED] text-[9px] flex items-center justify-center font-black font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[#1A1918] font-display font-black truncate">{wp.name}</span>
                      </div>
                      <span className="text-[9px] text-[#1A1918]/70 shrink-0 uppercase font-mono font-black">
                        {wp.type}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* MASTER ACTION CONTROLS (Sticky on mobile for rider convenience) */}
          <div className="sticky bottom-0 bg-[#F4EEDB] p-4 border-t-2 border-[#1A1918] z-10">
            {!isRecording ? (
              <button
                onClick={handleStart}
                className="w-full py-3.5 bg-[#E6332A] hover:bg-[#d02c24] text-white uppercase font-display font-black text-sm tracking-wider flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Play className="w-5 h-5 fill-current text-[#F7B32B]" />
                Iniciar Grabación GPS
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    className="py-3 bg-[#1D4477] hover:bg-[#15345b] text-white uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Play className="w-4 h-4 fill-current text-[#F7B32B]" />
                    Reanudar
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="py-3 bg-[#FAF6ED] border-2 border-[#1A1918] hover:bg-[#F4EEDB] text-[#1A1918] uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-xl shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Pause className="w-4 h-4" />
                    Pausar
                  </button>
                )}

                <button
                  onClick={handleOpenSaveDialog}
                  className="py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Finalizar & Guardar
                </button>
              </div>
            )}
            
            {isRecording && isPaused && (
              <button
                onClick={handleCloseModal}
                className="w-full text-center text-[10px] text-[#1A1918]/60 hover:text-[#E6332A] uppercase font-display font-black tracking-widest pt-2.5 pb-0.5 transition block"
              >
                Descartar Recorrido y Salir
              </button>
            )}
          </div>

        </aside>

      </div>

      {/* 3. SAVE TO GROUP & GOOGLE MAPS MODAL */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[9999] bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] max-w-xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto shadow-[8px_8px_0px_#1A1918] relative text-[#1A1918] rounded-[28px] animate-scaleUp">
            
            <div className="flex items-start justify-between border-b-2 border-[#1A1918] pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black">
                  ★ RECORRIDO CONCLUIDO ★
                </span>
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase mt-1">
                  Guardar Ruta en la Tribu
                </h3>
              </div>
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="w-8 h-8 border-2 border-[#1A1918] bg-[#F4EEDB] hover:bg-[#E6332A] hover:text-white text-[#1A1918] rounded-xl transition shadow-[2px_2px_0px_#1A1918] flex items-center justify-center"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Summary */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] text-center rounded-2xl shadow-[3px_3px_0px_#1A1918]">
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-display font-black block">Distancia</span>
                <span className="font-display font-black text-[#1A1918] text-base">{distanceKm} km</span>
              </div>
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-display font-black block">Tiempo</span>
                <span className="font-display font-black text-[#1A1918] text-base">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-display font-black block">Paradas</span>
                <span className="font-display font-black text-[#E6332A] text-base">{recordedWaypoints.length} puntos</span>
              </div>
            </div>

            {!savedRouteUrl ? (
              <div className="space-y-4 text-xs">
                
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                    Tribu / Grupo Destino:
                  </label>
                  <select
                    value={targetCrewId}
                    onChange={(e) => setTargetCrewId(e.target.value)}
                    className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                  >
                    {crews.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#FAF6ED] text-[#1A1918]">
                        {c.name} ({c.baseCity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                    Título de la Ruta:
                  </label>
                  <input
                    type="text"
                    value={routeTitle}
                    onChange={(e) => setRouteTitle(e.target.value)}
                    placeholder="Ej. Brecha Cañón de las Manzanas"
                    className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] font-display font-black rounded-xl shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                      Dificultad Técnica:
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                    >
                      <option value="Fácil (Fluida)">Fácil (Fluida)</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado / Técnico">Avanzado / Técnico</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                      % Terracería Estimada:
                    </label>
                    <input
                      type="text"
                      defaultValue="65% brechas y piedras"
                      className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                    Notas y Condiciones del Camino:
                  </label>
                  <textarea
                    rows={2}
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] resize-none rounded-xl shadow-[2px_2px_0px_#1A1918] font-medium"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveDialog(false)}
                    className="sm:w-1/3 py-3 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition rounded-xl shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Volver al Mapa
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToGroup}
                    className="sm:flex-1 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] touch-manipulation active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <CheckCircle className="w-4 h-4 text-[#F7B32B]" />
                    Publicar Ruta en la Tribu
                  </button>
                </div>

              </div>
            ) : (
              <div className="space-y-5 text-center py-4">
                <CheckCircle className="w-12 h-12 text-[#E6332A] mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xl text-[#1A1918] uppercase">
                    ¡Ruta Guardada Exitosamente!
                  </h4>
                  <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">
                    La ruta ya está integrada en el grupo y todos los pilotos pueden verla, votarla y descargar su GPX.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href={savedRouteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Navigation className="w-4 h-4 text-[#F7B32B]" />
                    Abrir en Google Maps (Todas las Paradas)
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      onClose();
                    }}
                    className="px-6 py-3 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
