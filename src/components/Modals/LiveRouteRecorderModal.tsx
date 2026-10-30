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
  Radio,
  Share2,
  Copy,
  Crosshair,
  Loader2,
  User,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.1-.475-.15-.675.15-.2.301-.775.978-.95 1.179-.175.2-.351.226-.651.076-.3-.15-1.268-.467-2.416-1.491-.893-.797-1.496-1.782-1.672-2.082-.175-.3-.019-.462.131-.611.136-.134.301-.351.451-.526.15-.175.2-.3.301-.501.1-.2.05-.375-.025-.526-.075-.15-.676-1.63-.926-2.232-.243-.587-.49-.507-.675-.516-.175-.01-.376-.01-.576-.01-.2 0-.526.075-.802.375-.275.3-1.052 1.028-1.052 2.508 0 1.479 1.077 2.908 1.228 3.109.15.2 2.12 3.237 5.136 4.54.717.311 1.277.496 1.714.635.72.229 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351z"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.826.49 3.538 1.344 5.013L2.05 21.95a.75.75 0 00.923.923l4.937-1.294A9.954 9.954 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zM3.5 12c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5a8.46 8.46 0 01-4.48-1.278.75.75 0 00-.512-.116l-3.376.885.885-3.376a.75.75 0 00-.116-.512A8.46 8.46 0 013.5 12z"/>
  </svg>
);

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
    userBikes,
    proposeRoute, 
    setSelectedRoute,
    addRecordedActivity
  } = useApp();

  // Recording lifecycle
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [hasGpsFix, setHasGpsFix] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Live telemetry metrics
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [currentElevation, setCurrentElevation] = useState(0);
  const [maxElevation, setMaxElevation] = useState(0);

  // Recorded track & stops
  const [trackCoords, setTrackCoords] = useState<[number, number][]>([]);
  const [recordedWaypoints, setRecordedWaypoints] = useState<Waypoint[]>([]);
  const [stoppedSeconds, setStoppedSeconds] = useState(0);
  const [detectedStopsCount, setDetectedStopsCount] = useState(0);

  // Save form states
  const [routeTitle, setRouteTitle] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Fácil (Fluida)' | 'Intermedio' | 'Avanzado / Técnico'>('Intermedio');
  const [dirtPercentage, setDirtPercentage] = useState(65);
  const [isSoloRide, setIsSoloRide] = useState(false);
  const [targetCrewId, setTargetCrewId] = useState(() => {
    if (currentCrew?.id) return currentCrew.id;
    const myCrew = crews.find(c => c.creatorId === currentUser.id || c.members.some(m => m.userId === currentUser.id));
    return myCrew?.id || crews[0]?.id || '';
  });
  const [targetRodadaId, setTargetRodadaId] = useState(currentRodada?.id || rodadas[0]?.id || '');
  const [savedRouteUrl, setSavedRouteUrl] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const waypointsLayerRef = useRef<any>(null);
  const [currentLayer, setCurrentLayer] = useState<'satellite' | 'topo'>('satellite');

  // Key for persistent active recording in localStorage
  const ACTIVE_RECORDING_STORAGE_KEY = 'motomami_active_gps_recording_v1';

  // Exit confirmation modal state
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Restore active recording session from localStorage on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(ACTIVE_RECORDING_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.trackCoords) && parsed.trackCoords.length > 0) {
          setIsRecording(parsed.isRecording ?? true);
          setIsPaused(true); // Restore in paused state so rider can resume smoothly
          setElapsedSeconds(parsed.elapsedSeconds || 0);
          setDistanceKm(parsed.distanceKm || 0);
          setCurrentSpeed(0);
          setAvgSpeed(parsed.avgSpeed || 0);
          setCurrentElevation(parsed.currentElevation || 0);
          setMaxElevation(parsed.maxElevation || 0);
          setTrackCoords(parsed.trackCoords || []);
          setRecordedWaypoints(parsed.recordedWaypoints || []);
          setDetectedStopsCount(parsed.detectedStopsCount || 0);
          if (parsed.routeTitle) setRouteTitle(parsed.routeTitle);
          if (parsed.routeDescription) setRouteDescription(parsed.routeDescription);
          setHasGpsFix(true);
        }
      }
    } catch (e) {
      console.warn('Error restoring active recording:', e);
    }
  }, []);

  // Sync active recording to localStorage whenever state updates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isRecording || trackCoords.length > 0) {
      try {
        const payload = {
          isRecording,
          isPaused,
          elapsedSeconds,
          distanceKm,
          avgSpeed,
          currentElevation,
          maxElevation,
          trackCoords,
          recordedWaypoints,
          detectedStopsCount,
          routeTitle,
          routeDescription,
          updatedAt: Date.now()
        };
        localStorage.setItem(ACTIVE_RECORDING_STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        console.warn('Error saving active recording:', e);
      }
    }
  }, [
    isRecording,
    isPaused,
    elapsedSeconds,
    distanceKm,
    avgSpeed,
    currentElevation,
    maxElevation,
    trackCoords,
    recordedWaypoints,
    detectedStopsCount,
    routeTitle,
    routeDescription
  ]);

  // Clean active recording session storage
  const clearActiveRecordingStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_RECORDING_STORAGE_KEY);
      } catch (e) {}
    }
  };

  // Prevent accidental tab close or page reload while recording or with unsaved coordinates
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording || trackCoords.length > 0) {
        e.preventDefault();
        e.returnValue = 'Tienes una ruta en grabación activa. Si sales o recargas, se conservará en tu dispositivo pero es preferible pausarla o guardarla.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRecording, trackCoords.length]);

  const timerIntervalRef = useRef<any>(null);
  const gpsWatcherRef = useRef<number | null>(null);
  const previewWatcherRef = useRef<number | null>(null);

  // Quick helper to move rider marker & pan map to a new position
  const updateRiderLocation = (lat: number, lng: number, zoomLevel?: number) => {
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      if (zoomLevel) {
        mapInstanceRef.current.setView([lat, lng], zoomLevel);
      } else {
        mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
      }
    }
  };

  // Explicit user action or auto trigger to center on current location
  const handleCenterOnMyLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('La geolocalización no está disponible en este dispositivo.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    // Fast high accuracy attempt
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setHasGpsFix(true);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateRiderLocation(lat, lng, 16);
      },
      (err) => {
        console.warn('High accuracy failed, attempting standard accuracy:', err);
        // Fallback with standard accuracy and longer timeout (great for indoor / weak satellites)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsLocating(false);
            setHasGpsFix(true);
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            updateRiderLocation(lat, lng, 15);
          },
          (err2) => {
            setIsLocating(false);
            console.warn('Geolocation fallback failed:', err2);
            if (err2.code === 1) {
              setGpsError('Permiso de GPS denegado. Permite la ubicación en los ajustes del navegador.');
            } else if (err2.code === 2) {
              setGpsError('Buscando señal GPS... Sal al exterior para mejorar la recepción satelital.');
            } else if (err2.code === 3) {
              setGpsError('Tiempo de espera GPS agotado. Toca "Mi Ubicación" para reintentar.');
            } else {
              setGpsError('No se pudo obtener la ubicación actual.');
            }
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

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

      // Initial center: if we have trackCoords, use them, otherwise default to Mexico City area
      const initialCenter: [number, number] = trackCoords[0] || [19.4326, -99.1332];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: trackCoords.length > 0 ? 14 : 13,
        zoomControl: false,
        attributionControl: false
      });

      // Active live preview GPS watcher before recording starts
      if (typeof navigator !== 'undefined' && navigator.geolocation && trackCoords.length === 0) {
        setIsLocating(true);
        // Start continuous watch to acquire and track real position immediately
        try {
          previewWatcherRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (!isMounted) return;
              setIsLocating(false);
              setHasGpsFix(true);
              setGpsError(null);
              const currentPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
              if (riderMarkerRef.current) {
                riderMarkerRef.current.setLatLng(currentPos);
              }
              // Only auto-center on first acquisition or if not recording
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setView(currentPos, 15);
              }
            },
            (err) => {
              if (!isMounted) return;
              setIsLocating(false);
              console.log('GPS init preview info:', err.message);
              // If high accuracy times out, try one-shot normal accuracy
              navigator.geolocation.getCurrentPosition(
                (fallbackPos) => {
                  if (!isMounted) return;
                  setHasGpsFix(true);
                  setGpsError(null);
                  const fallbackCoords: [number, number] = [fallbackPos.coords.latitude, fallbackPos.coords.longitude];
                  if (riderMarkerRef.current) {
                    riderMarkerRef.current.setLatLng(fallbackCoords);
                  }
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView(fallbackCoords, 14);
                  }
                },
                (fallbackErr) => {
                  if (!isMounted) return;
                  if (fallbackErr.code === 1) {
                    setGpsError('Permiso de GPS denegado. Permite la ubicación en el navegador.');
                  }
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
              );
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
          );
        } catch (e) {
          console.warn('Error starting preview geolocation watcher:', e);
        }
      }

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
      const poly = L.polyline(trackCoords || [], {
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
      const wpGroup = L.layerGroup().addTo(map);
      waypointsLayerRef.current = wpGroup;

      // Re-draw any existing waypoints restored from storage
      if (recordedWaypoints && recordedWaypoints.length > 0) {
        recordedWaypoints.forEach((wp) => {
          const markerIcon = L.divIcon({
            className: 'wp-marker',
            html: `
              <div style="background: #0B0A09; border: 1.5px solid #E07A5F; color: white; padding: 3px 6px; border-radius: 2px; font-size: 10px; font-family: monospace; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 5px;">
                <span style="background: #E07A5F; color: black; font-weight: 800; font-size: 8px; padding: 1px 3px; border-radius: 2px;">${wp.type.toUpperCase()}</span>
                <span>${wp.name.split('(')[0]}</span>
              </div>
            `,
            iconSize: [120, 30],
            iconAnchor: [60, 15]
          });
          L.marker([wp.lat, wp.lng], { icon: markerIcon })
            .bindPopup(`<b>${wp.name}</b><br/>${wp.notes || ''}`)
            .addTo(wpGroup);
        });
      }

      // If we restored trackCoords, fit bounds nicely so the whole track is seen immediately
      if (trackCoords && trackCoords.length > 1) {
        try {
          map.fitBounds(poly.getBounds(), { padding: [30, 30] });
        } catch (e) {}
      }

      mapInstanceRef.current = map;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (previewWatcherRef.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(previewWatcherRef.current);
      }
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
        // If stopped for > 30s in real GPS, log a technical stop!
        if (updated >= 30 && updated < 33) {
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
      notes: `Parada detectada por telemetría GPS. Altitud: ${ele}m. Tiempo en ruta: ${formatTime(elapsedSeconds)}`
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

  // Start real GPS recording
  const handleStart = () => {
    setGpsError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('La geolocalización no está disponible en este dispositivo o navegador.');
      return;
    }

    setIsRecording(true);
    setIsPaused(false);

    // Clear preview watcher since recording watcher takes full control
    if (previewWatcherRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(previewWatcherRef.current);
      previewWatcherRef.current = null;
    }

    // Start Timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);

    // Watch real device position via GPS with high accuracy
    gpsWatcherRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setHasGpsFix(true);
        setGpsError(null);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const ele = Math.round(pos.coords.altitude || 0);
        const rawSpeed = pos.coords.speed;
        const spd = rawSpeed && rawSpeed > 0 ? Math.round(rawSpeed * 3.6) : 0; // m/s to km/h

        // If this is the first point, set the start waypoint
        setTrackCoords(prev => {
          if (prev.length === 0) {
            const startWp: Waypoint = {
              id: `start-${Date.now()}`,
              name: 'Punto de Salida',
              lat,
              lng,
              type: 'start',
              notes: `Inicio de grabación GPS: ${new Date().toLocaleTimeString()}`
            };
            setRecordedWaypoints([startWp]);
            addMarkerToMap(startWp, 'START');
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([lat, lng], 15);
            }
          }
          return prev;
        });

        appendPoint(lat, lng, ele, spd);
      },
      (err) => {
        console.warn('GPS error:', err);
        if (err.code === 1) {
          setGpsError('Permiso de GPS denegado. Permite la ubicación en los ajustes del navegador.');
        } else if (err.code === 2) {
          setGpsError('Buscando señal GPS... Sal al exterior para mejorar la precisión de los satélites.');
        } else if (err.code === 3) {
          setGpsError('Tiempo de espera GPS agotado. Reintentando conectar con satélites...');
        } else {
          setGpsError('Error al obtener coordenadas GPS.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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

    // Dynamic surface breakdown based on slider
    const offroadPct = dirtPercentage;
    const asphaltPct = 100 - dirtPercentage;

    // Build the final RouteProposal for History
    const newRoute: Omit<RouteProposal, 'id' | 'votes' | 'comments'> = {
      rodadaId: '', // Las rutas grabadas son bitácora histórica, no propuestas para votación de rodadas futuras
      crewId: !isSoloRide ? targetCrewId : undefined,
      isRecorded: true,
      title: routeTitle.trim(),
      destination: 'Presa Iturbide / Bosque Otomí',
      state: 'Estado de México',
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: routeDescription.trim(),
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200',
      totalKm: distanceKm,
      estimatedHours: `${formatTime(elapsedSeconds)} (Manejo activo)`,
      offroadPercentage: offroadPct,
      asphaltPercentage: asphaltPct,
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
          offroadKm: Number((distanceKm * (offroadPct / 100)).toFixed(1)),
          terrainType: `${offroadPct}% Terracería y brechas, ${asphaltPct}% Carretera asfaltada`
        }
      ],
      waypoints: recordedWaypoints,
      coordinates: trackCoords.length > 0 ? trackCoords : SIMULATED_COORDS.map(c => [c[0], c[1]]),
      dayOfDeadVibe: isSoloRide ? 'Ruta individual registrada en solitario.' : 'Ruta trazada en tiempo real para la tribu.',
      safetyTips: ['Llevar kit de parches y compresor', 'Monitorear presión de llantas en terreno rocoso']
    };

    // Save into state as Route Proposal if assigned to a group, or add to catalog
    proposeRoute(newRoute);

    // Selected destination crew (if not solo)
    const selectedCrew = !isSoloRide ? crews.find(c => c.id === targetCrewId) : null;

    // Also publish as live ride activity in the community dispatch feed
    addRecordedActivity({
      pilotId: currentUser.id,
      pilotName: currentUser.name,
      pilotHandle: currentUser.handle,
      pilotAvatar: currentUser.avatar,
      dateText: 'Hoy • Rodada en Vivo',
      device: 'GPS Smartphone (Satélite)',
      location: selectedCrew?.baseCity || 'Estado de México',
      title: routeTitle.trim(),
      motoModel: userBikes?.[0] ? `${userBikes[0].brand} ${userBikes[0].model}` : 'BMW R 1250 GS',
      discipline: offroadPct >= 50 ? 'Doble Propósito / Trail' : 'Carretera / Curvas',
      distanceKm: distanceKm,
      elevationGainM: maxElevation > 0 ? Math.max(0, maxElevation - 2520) : 0,
      durationText: formatTime(elapsedSeconds),
      avgSpeedKmh: avgSpeed || 42,
      coordinates: trackCoords.length > 0 ? trackCoords : SIMULATED_COORDS.map(c => [c[0], c[1]]),
      photos: uploadedPhotos,
      groupInfo: (!isSoloRide && selectedCrew) ? {
        crewId: selectedCrew.id,
        crewName: selectedCrew.name,
        participants: [
          {
            userId: currentUser.id,
            name: currentUser.name,
            handle: currentUser.handle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
            avatar: currentUser.avatar,
            role: 'Capitán de Ruta',
            motoModel: userBikes?.[0] ? `${userBikes[0].brand} ${userBikes[0].model}` : 'Trail'
          }
        ]
      } : undefined,
      surfaceBreakdown: {
        asphaltPercentage: asphaltPct,
        dirtPercentage: offroadPct,
        curveDensity: offroadPct >= 60 ? 'Alta' : 'Media'
      }
    });

    // Build Google Maps full multi-stop navigation url
    const fullRouteObject = {
      ...newRoute,
      id: `temp-${Date.now()}`,
      votes: [],
      comments: []
    } as RouteProposal;
    const gmapsUrl = buildOrderedGoogleMapsUrl(fullRouteObject);
    setSavedRouteUrl(gmapsUrl);

    // Clear active recording cache on successful save
    clearActiveRecordingStorage();
    confetti({ particleCount: 100, spread: 90 });
  };

  // Close modal safely or prompt if recording is in progress
  const handleRequestClose = () => {
    // If currently recording or has recorded points, don't silently close
    if (isRecording || trackCoords.length > 0) {
      handlePause();
      setShowExitConfirm(true);
    } else {
      setShowSaveDialog(false);
      onClose();
    }
  };

  // Explicitly discard recording and close
  const handleDiscardAndExit = () => {
    clearActiveRecordingStorage();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (previewWatcherRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(previewWatcherRef.current);
      previewWatcherRef.current = null;
    }
    if (gpsWatcherRef.current !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(gpsWatcherRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setTrackCoords([]);
    setRecordedWaypoints([]);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setDetectedStopsCount(0);
    setShowExitConfirm(false);
    setShowSaveDialog(false);
    onClose();
  };

  // Keep recording in background / paused and just minimize window
  const handleKeepRecordingAndExit = () => {
    setShowExitConfirm(false);
    setShowSaveDialog(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#121110] flex flex-col font-sans text-white overflow-hidden h-[100dvh] w-screen animate-fadeIn select-none">
      
      {/* 1. TOP COCKPIT BAR (Ultra-sleek, minimalist, premium tactile) */}
      <header className="shrink-0 bg-[#1A1918]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#2A2928] z-30">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isRecording && !isPaused ? 'bg-[#E6332A] animate-ping opacity-75' : hasGpsFix ? 'bg-[#25D366]' : isLocating ? 'bg-[#F7B32B] animate-pulse' : 'bg-white/30'
            }`} />
            <span className={`w-2 h-2 rounded-full absolute ${
              isRecording && !isPaused ? 'bg-[#E6332A]' : hasGpsFix ? 'bg-[#25D366]' : isLocating ? 'bg-[#F7B32B]' : 'bg-white/40'
            }`} />
          </div>
          <div>
            <span className="font-display font-black text-xs sm:text-sm text-[#FAF6ED] uppercase tracking-wider block leading-tight">
              {isRecording && !isPaused ? 'Telemetría en Vivo' : isPaused ? 'Ruta Pausada' : 'Grabador de Expedición'}
            </span>
            <span className="text-[9px] font-mono font-medium text-white/50 uppercase tracking-widest flex items-center gap-1">
              {hasGpsFix ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#25D366]"></span>
                  GPS Activo • Alta Precisión
                </>
              ) : isLocating ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#F7B32B] animate-ping"></span>
                  Conectando satélites...
                </>
              ) : (
                'Listo para rodar'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer switcher pill */}
          <div className="bg-[#242322] p-0.5 rounded-xl border border-white/10 flex items-center text-[10px]">
            <button
              type="button"
              onClick={() => handleLayerChange('satellite')}
              className={`px-2 py-1 uppercase font-display font-black tracking-wider rounded-lg transition text-[9px] cursor-pointer ${
                currentLayer === 'satellite' ? 'bg-[#E6332A] text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Satélite
            </button>
            <button
              type="button"
              onClick={() => handleLayerChange('topo')}
              className={`px-2 py-1 uppercase font-display font-black tracking-wider rounded-lg transition text-[9px] cursor-pointer ${
                currentLayer === 'topo' ? 'bg-[#E6332A] text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Topo
            </button>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="w-8 h-8 rounded-xl bg-[#242322] hover:bg-[#E6332A] border border-white/10 text-white flex items-center justify-center transition shrink-0 active:scale-95 cursor-pointer"
            title="Cerrar telemetría y volver"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* GPS Error / Warning banner if any */}
      {gpsError && (
        <div className="shrink-0 bg-[#E6332A] text-white px-4 py-2 text-xs font-mono font-bold flex items-center justify-between border-b border-black/30 z-30 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#F7B32B]" />
            <span className="text-[11px] leading-snug">{gpsError}</span>
          </div>
          <button 
            type="button"
            onClick={() => setGpsError(null)}
            className="text-[10px] uppercase underline ml-2 shrink-0 font-display font-black cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {/* 2. MAIN COCKPIT VIEWPORT (FULL MAP + INTEGRATED MOBILE COCKPIT HUD) */}
      <div className="flex-1 min-h-0 relative flex flex-col lg:flex-row overflow-hidden bg-[#121110]">
        
        {/* MAP CANVAS (Takes predominant space on mobile for immersive navigation) */}
        <div className="flex-1 relative w-full h-full bg-[#121110] overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Quick Locate Me floating action button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={handleCenterOnMyLocation}
              disabled={isLocating}
              className="bg-[#1A1918]/90 hover:bg-[#252422] text-[#FAF6ED] border border-white/20 p-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Centrar en mi ubicación actual"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E6332A]" />
              ) : (
                <Crosshair className={`w-4 h-4 ${hasGpsFix ? 'text-[#25D366]' : 'text-[#E6332A]'}`} />
              )}
            </button>
          </div>

          {/* Real-time Waypoint / POI Floating Quick-Buttons (Visible when actively recording) */}
          {isRecording && !isPaused && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-[#1A1918]/90 backdrop-blur-md border border-white/15 p-1 rounded-2xl shadow-xl">
              <button
                type="button"
                onClick={() => handleAddManualWaypoint('fuel', 'Gasolinera', 'GAS')}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] uppercase font-display font-black flex items-center gap-1 transition rounded-xl cursor-pointer active:scale-95"
              >
                <Fuel className="w-3 h-3 text-[#E6332A]" />
                <span>Gas</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddManualWaypoint('scenic', 'Mirador', 'VISTA')}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] uppercase font-display font-black flex items-center gap-1 transition rounded-xl cursor-pointer active:scale-95"
              >
                <Camera className="w-3 h-3 text-[#F7B32B]" />
                <span>Mirador</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddManualWaypoint('dirt', 'Técnico', 'TECNICO')}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] uppercase font-display font-black flex items-center gap-1 transition rounded-xl cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-3 h-3 text-[#E06423]" />
                <span>Técnico</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddManualWaypoint('camp', 'Descanso', 'DESCANSO')}
                className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[9px] uppercase font-display font-black flex items-center gap-1 transition rounded-xl cursor-pointer active:scale-95"
              >
                <Coffee className="w-3 h-3 text-[#25D366]" />
                <span>Pausa</span>
              </button>
            </div>
          )}
        </div>

        {/* TELEMETRY DASHBOARD (Refined Cockpit HUD: Modern, high contrast, clean typography) */}
        <div className="shrink-0 bg-[#1A1918]/95 backdrop-blur-xl border-t border-[#2A2928] lg:border-t-0 lg:border-l lg:w-96 flex flex-col z-20 shadow-2xl">
          
          <div className="p-3.5 sm:p-5 space-y-3">
            
            {/* Live 4-Matrix Telemetry Gauges */}
            <div className="grid grid-cols-4 gap-2">
              
              {/* Chrono */}
              <div className="p-2.5 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[9px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Clock className="w-2.5 h-2.5 text-[#E6332A] shrink-0" />
                  Tiempo
                </span>
                <p className="font-mono font-black text-xs sm:text-base text-white tracking-tight mt-1 truncate">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>

              {/* Odometer */}
              <div className="p-2.5 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[9px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Compass className="w-2.5 h-2.5 text-[#F7B32B] shrink-0" />
                  Odómetro
                </span>
                <p className="font-mono font-black text-xs sm:text-base text-white tracking-tight mt-1 truncate">
                  {distanceKm} <span className="text-[9px] font-bold text-white/40">km</span>
                </p>
              </div>

              {/* Speed */}
              <div className="p-2.5 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[9px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Gauge className="w-2.5 h-2.5 text-[#25D366] shrink-0" />
                  Velocidad
                </span>
                <p className="font-mono font-black text-xs sm:text-base text-white tracking-tight mt-1 truncate">
                  {currentSpeed} <span className="text-[9px] font-bold text-white/40">km/h</span>
                </p>
              </div>

              {/* Altitude */}
              <div className="p-2.5 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[9px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Mountain className="w-2.5 h-2.5 text-[#60A5FA] shrink-0" />
                  Altitud
                </span>
                <p className="font-mono font-black text-xs sm:text-base text-white tracking-tight mt-1 truncate">
                  {currentElevation} <span className="text-[9px] font-bold text-white/40">m</span>
                </p>
              </div>

            </div>

            {/* Stops Detected Feed (Compact single-line or small card when active) */}
            {recordedWaypoints.length > 0 && (
              <div className="bg-[#242322] border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-lg bg-[#E6332A] text-white text-[10px] flex items-center justify-center font-black font-mono shrink-0">
                    {recordedWaypoints.length}
                  </span>
                  <span className="font-display font-bold text-[11px] text-[#FAF6ED] truncate">
                    {recordedWaypoints[recordedWaypoints.length - 1].name}
                  </span>
                </div>
                {stoppedSeconds > 0 && (
                  <span className="text-[#E6332A] text-[10px] font-mono font-black animate-pulse shrink-0 ml-2">
                    Detenido: {stoppedSeconds}s
                  </span>
                )}
              </div>
            )}

            {/* MASTER ACTION BUTTONS */}
            <div className="pt-1 pb-safe">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3.5 bg-gradient-to-r from-[#E6332A] to-[#d02c24] hover:brightness-110 text-white uppercase font-display font-black text-sm tracking-widest flex items-center justify-center gap-2 transition rounded-2xl shadow-[0_4px_20px_rgba(230,51,42,0.4)] touch-manipulation active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-[#F7B32B]" />
                  <span>Iniciar Grabación GPS</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {isPaused ? (
                      <button
                        type="button"
                        onClick={handleResume}
                        className="py-3 bg-[#25D366] hover:bg-[#20b858] text-[#121110] uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-2xl shadow-lg touch-manipulation active:scale-[0.98] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current text-[#121110]" />
                        <span>Reanudar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePause}
                        className="py-3 bg-[#242322] hover:bg-[#2e2c2b] border border-white/15 text-white uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-2xl shadow-lg touch-manipulation active:scale-[0.98] cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenSaveDialog}
                      className="py-3 bg-gradient-to-r from-[#E6332A] to-[#d02c24] hover:brightness-110 text-white uppercase font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 transition rounded-2xl shadow-[0_4px_16px_rgba(230,51,42,0.3)] touch-manipulation active:scale-[0.98] cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Terminar & Guardar</span>
                    </button>
                  </div>

                  {isPaused && (
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      className="w-full text-center text-[10px] text-white/40 hover:text-[#E6332A] uppercase font-display font-bold tracking-widest pt-1 transition block cursor-pointer"
                    >
                      Opciones de salida / Descartar
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

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
                
                {/* 1. Modalidad de Rodada: ¿En Solitario o en Tribu? */}
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1.5">
                    Modalidad de la Rodada:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSoloRide(false)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-[#1A1918] font-display uppercase tracking-wider text-xs transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        !isSoloRide
                          ? 'bg-[#E6332A] text-white font-black'
                          : 'bg-[#F4EEDB] text-[#1A1918] hover:bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>En Tribu / Club</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSoloRide(true)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-[#1A1918] font-display uppercase tracking-wider text-xs transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        isSoloRide
                          ? 'bg-[#E6332A] text-white font-black'
                          : 'bg-[#F4EEDB] text-[#1A1918] hover:bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Rodé Solo</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tribu / Grupo Destino (solo visible si no es rodada en solitario) */}
                {!isSoloRide && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black block mb-1">
                      Tribu / Grupo Destino:
                    </label>
                    <select
                      value={targetCrewId}
                      onChange={(e) => setTargetCrewId(e.target.value)}
                      className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                    >
                      {/* Deduplicate crews by normalized key so duplicates never show */}
                      {Array.from(new Map(crews.map(c => [c.slug || c.name.toLowerCase().trim(), c])).values()).map(c => (
                        <option key={c.id} value={c.id} className="bg-[#FAF6ED] text-[#1A1918]">
                          {c.name} {c.baseCity ? `(${c.baseCity})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 3. Título de la Ruta */}
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

                {/* 4. Dificultad Técnica */}
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

                {/* 5. Barra Deslizadora de Terracería vs Carretera con Iconos Opuestos */}
                <div className="p-3 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl shadow-[2px_2px_0px_#1A1918] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black">
                      Superficie de la Ruta
                    </span>
                    <span className="text-[11px] font-mono font-black text-[#1A1918] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#1A1918]">
                      {dirtPercentage}% Off-road • {100 - dirtPercentage}% Asfalto
                    </span>
                  </div>

                  {/* Slider with opposite icons */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1 text-[#1A1918]/70" title="Carretera / Asfalto">
                      <Compass className="w-4 h-4 text-[#1A1918]" />
                      <span className="text-[9px] font-display uppercase font-bold hidden sm:inline">Asfalto</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={dirtPercentage}
                      onChange={(e) => setDirtPercentage(Number(e.target.value))}
                      className="flex-1 accent-[#E6332A] cursor-pointer h-2 bg-[#FAF6ED] rounded-lg border border-[#1A1918]"
                    />

                    <div className="flex items-center gap-1 text-[#E6332A]" title="Terracería / Montaña">
                      <Mountain className="w-4 h-4 text-[#E6332A]" />
                      <span className="text-[9px] font-display uppercase font-black text-[#E6332A] hidden sm:inline">Terracería</span>
                    </div>
                  </div>
                </div>

                {/* 6. Notas y Condiciones */}
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

                {/* 7. Fotos de la Rodada (Opcionales) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[#1A1918]/70 text-[10px] uppercase font-display font-black">
                      Fotos de la Rodada (Opcional):
                    </label>
                    <span className="text-[9px] font-mono text-[#1A1918]/60">
                      {uploadedPhotos.length === 0 ? 'Sin fotos (se mostrará solo el mapa GPS)' : `${uploadedPhotos.length} foto(s)`}
                    </span>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {uploadedPhotos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative w-16 h-16 rounded-xl border-2 border-[#1A1918] overflow-hidden shrink-0 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setUploadedPhotos(prev => prev.filter((_, i) => i !== pIdx))}
                            className="absolute top-0.5 right-0.5 bg-[#E6332A] text-white p-0.5 rounded-full border border-black shadow"
                            title="Quitar foto"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 py-2 px-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-dashed border-[#1A1918] rounded-xl font-display font-black text-xs uppercase cursor-pointer transition">
                    <Camera className="w-4 h-4 text-[#E6332A]" />
                    <span>{uploadedPhotos.length === 0 ? '+ Agregar fotos de la salida' : '+ Agregar más fotos'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setUploadedPhotos(prev => [...prev, reader.result as string]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                </div>

                {/* 7. Botones de acción */}
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
                    {isSoloRide ? 'Guardar Mi Ruta en Perfil' : 'Publicar Ruta en la Tribu'}
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

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={savedRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Navigation className="w-4 h-4 text-[#F7B32B]" />
                      Abrir en Google Maps ({recordedWaypoints.length} Paradas)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🏍️ ¡Acabo de registrar esta ruta con MotoMami!\n📍 ${routeTitle || 'Ruta off-road'}\n📏 Distancia: ${distanceKm} km\n⏱️ Tiempo: ${formatTime(elapsedSeconds)}\n🛑 ${recordedWaypoints.length} paradas registradas.\n🗺️ Abrir en Google Maps:\n${savedRouteUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white border-2 border-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition flex items-center justify-center gap-2 rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      Compartir en WhatsApp
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (savedRouteUrl) {
                          navigator.clipboard.writeText(savedRouteUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }
                      }}
                      className="flex-1 py-2.5 border-2 border-[#1A1918] bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918] uppercase font-display font-bold text-xs tracking-wider transition rounded-xl flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1A1918]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? '¡Enlace de Google Maps Copiado!' : 'Copiar Enlace'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSaveDialog(false);
                        onClose();
                      }}
                      className="px-6 py-2.5 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] uppercase font-display font-black text-xs tracking-wider transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. EXIT CONFIRMATION DIALOG (Protects against accidental loss) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] bg-[#1A1918]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] max-w-md w-full p-6 space-y-5 shadow-[8px_8px_0px_#1A1918] relative text-[#1A1918] rounded-[24px] animate-scaleUp">
            
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#E6332A]/10 border-2 border-[#E6332A] rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#E6332A]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-lg text-[#1A1918] uppercase tracking-wide">
                  ¿Qué deseas hacer con tu ruta?
                </h3>
                <p className="text-xs text-[#1A1918]/70 font-sans leading-relaxed">
                  Llevas <span className="font-bold text-[#1A1918]">{distanceKm} km</span> y <span className="font-bold text-[#1A1918]">{formatTime(elapsedSeconds)}</span> registrados. Tu avance está seguro en la memoria de tu dispositivo.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {/* Option 1: Keep in background and exit */}
              <button
                type="button"
                onClick={handleKeepRecordingAndExit}
                className="w-full py-3 px-4 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-between transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Mantener en Memoria y Minimizar</span>
                <span className="text-[10px] text-[#25D366] font-mono font-bold">✓ Seguro</span>
              </button>

              {/* Option 2: Go to Save Route */}
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleOpenSaveDialog();
                }}
                className="w-full py-3 px-4 bg-[#E6332A] hover:bg-[#d02c24] border-2 border-[#1A1918] text-white rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-between transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span>Finalizar y Guardar en la Tribu</span>
                <span className="text-[10px] text-[#F7B32B] font-mono font-bold">★ Guardar</span>
              </button>

              {/* Option 3: Continue recording */}
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleResume();
                }}
                className="w-full py-2.5 text-center text-[#1A1918]/80 hover:text-[#1A1918] text-xs font-display font-black uppercase tracking-wider transition"
              >
                Seguir Rodando / Reanudar
              </button>

              {/* Option 4: Discard completely */}
              <div className="pt-2 border-t border-[#1A1918]/20">
                <button
                  type="button"
                  onClick={handleDiscardAndExit}
                  className="w-full text-center text-[10px] text-[#E6332A] hover:underline font-mono font-bold uppercase tracking-wider"
                >
                  Borrar datos y descartar definitivamente
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
