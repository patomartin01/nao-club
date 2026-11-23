'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Waypoint, WaypointType, RouteProposal } from '../../types';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';
import { 
  saveActiveRecordingToDB, 
  getActiveRecordingFromDB, 
  clearActiveRecordingFromDB 
} from '../../lib/offlineStorage';
import { 
  shouldAcceptGPSPoint, 
  DeviceWakeLockManager, 
  generateGPXString 
} from '../../utils/gpsTelemetry';
import { unifiedLocationService } from '../../utils/backgroundLocationService';
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
    completeRodada,
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
  const [markRodadaAsCompleted, setMarkRodadaAsCompleted] = useState(true);
  const [savedRouteUrl, setSavedRouteUrl] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const riderMarkerRef = useRef<any>(null);
  const waypointsLayerRef = useRef<any>(null);

  // Key for persistent active recording in localStorage (solo respaldo si IndexedDB falla).
  // Va por usuario: si en el mismo teléfono entra otro piloto, no hereda la ruta del anterior.
  const LEGACY_RECORDING_STORAGE_KEY = 'motomami_active_gps_recording_v1';
  const recorderUserId = currentUser?.id && currentUser.id !== 'guest' ? currentUser.id : null;
  const ACTIVE_RECORDING_STORAGE_KEY = recorderUserId
    ? `${LEGACY_RECORDING_STORAGE_KEY}:${recorderUserId}`
    : LEGACY_RECORDING_STORAGE_KEY;

  // WakeLock Manager para evitar que el teléfono duerma el sensor GPS
  const wakeLockRef = useRef<DeviceWakeLockManager>(new DeviceWakeLockManager());
  const lastAcceptedPointRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null);

  // Refs de la sesión de grabación. Los callbacks del GPS y del timer viven mucho tiempo,
  // así que leen de aquí en vez del estado (que en esos closures se queda congelado).
  const trackRef = useRef<[number, number][]>([]);
  const waypointsRef = useRef<Waypoint[]>([]);
  const distanceRef = useRef(0); // km sin redondear, para no perder tramos cortos
  const elapsedBaseRef = useRef(0); // segundos acumulados antes del tramo actual
  const segmentStartRef = useRef<number | null>(null); // Date.now() cuando arrancó el tramo actual
  const stopsCountRef = useRef(0);
  const lastMovementAtRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number; ele: number } | null>(null);
  const stopLoggedRef = useRef(false);
  const resumeGapRef = useRef(false); // el primer punto tras reanudar no suma distancia
  const finalizedRef = useRef(false); // ruta ya guardada: no volver a persistirla
  const fitOnRestoreRef = useRef(false);

  useEffect(() => { trackRef.current = trackCoords; }, [trackCoords]);
  useEffect(() => { waypointsRef.current = recordedWaypoints; }, [recordedWaypoints]);

  // Tiempo real transcurrido (no depende de que setInterval siga vivo con la pantalla apagada)
  const getElapsedSeconds = () =>
    elapsedBaseRef.current +
    (segmentStartRef.current ? Math.floor((Date.now() - segmentStartRef.current) / 1000) : 0);

  // Exit confirmation modal state
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Restore active recording session from IndexedDB (fallback to localStorage) for the signed-in pilot
  useEffect(() => {
    if (typeof window === 'undefined' || !recorderUserId) return;
    let cancelled = false;
    const restoreSession = async () => {
      try {
        // 1. Intentar primero desde IndexedDB (blindado para offline / miles de puntos)
        const idbData = await getActiveRecordingFromDB(recorderUserId);
        let session: any = idbData;

        // 2. Fallback a localStorage del mismo usuario
        if (!session) {
          const saved = localStorage.getItem(ACTIVE_RECORDING_STORAGE_KEY);
          if (saved) session = JSON.parse(saved);
        }

        // 3. Grabación de la versión anterior (una sola clave sin dueño). Se entrega una sola vez
        //    y se borra, para que no la recupere también el siguiente piloto que entre.
        let usedLegacy = false;
        if (!session) {
          const legacy = localStorage.getItem(LEGACY_RECORDING_STORAGE_KEY);
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (!parsed.ownerId || parsed.ownerId === recorderUserId) {
              session = parsed;
              usedLegacy = true;
            }
          }
        }

        if (session?.ownerId && session.ownerId !== recorderUserId) session = null;
        if (cancelled) return;
        // Borrar la clave vieja solo cuando de verdad se aplicó (si este intento se canceló,
        // el siguiente todavía debe encontrarla). Desde aquí se guarda con la clave del usuario.
        if (usedLegacy) localStorage.removeItem(LEGACY_RECORDING_STORAGE_KEY);

        if (session && Array.isArray(session.trackCoords) && session.trackCoords.length > 0) {
          // Sincronizar refs antes que el estado para que reanudar arranque con los datos correctos
          distanceRef.current = session.distanceKm || 0;
          elapsedBaseRef.current = session.elapsedSeconds || 0;
          segmentStartRef.current = null;
          stopsCountRef.current = session.detectedStopsCount || 0;
          trackRef.current = session.trackCoords;
          waypointsRef.current = session.recordedWaypoints || [];
          fitOnRestoreRef.current = true;

          setIsRecording(session.isRecording ?? true);
          setIsPaused(true); // Restore in paused state so rider can resume smoothly
          setElapsedSeconds(session.elapsedSeconds || 0);
          setDistanceKm(session.distanceKm || 0);
          setCurrentSpeed(0);
          setAvgSpeed(session.avgSpeed || 0);
          setCurrentElevation(session.currentElevation || 0);
          setMaxElevation(session.maxElevation || 0);
          setTrackCoords(session.trackCoords || []);
          setRecordedWaypoints(session.recordedWaypoints || []);
          setDetectedStopsCount(session.detectedStopsCount || 0);
          if (session.routeTitle) setRouteTitle(session.routeTitle);
          if (session.routeDescription) setRouteDescription(session.routeDescription);
          setHasGpsFix(true);

          const last = session.trackCoords[session.trackCoords.length - 1];
          lastAcceptedPointRef.current = { lat: last[0], lng: last[1], timestamp: Date.now() };

          // Ya hay traza: apagar el watcher de vista previa para que no re-centre el mapa a cada rato
          if (previewWatcherRef.current !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(previewWatcherRef.current);
            previewWatcherRef.current = null;
          }
        }
      } catch (e) {
        console.warn('Error restoring active recording:', e);
      }
    };
    restoreSession();
    return () => { cancelled = true; };
  }, [recorderUserId]);

  // Persistir la grabación activa. El tiempo solo dispara guardado cada 15 s para no
  // reescribir toda la traza cada segundo; los puntos, waypoints y pausas sí guardan al instante.
  const elapsedPersistBucket = Math.floor(elapsedSeconds / 15);
  useEffect(() => {
    if (typeof window === 'undefined' || !recorderUserId) return;
    if (finalizedRef.current) return;
    if (isRecording || trackCoords.length > 0) {
      const payload = {
        isRecording,
        isPaused,
        elapsedSeconds: getElapsedSeconds(),
        distanceKm,
        avgSpeed,
        currentElevation,
        maxElevation,
        trackCoords,
        recordedWaypoints,
        detectedStopsCount,
        routeTitle,
        routeDescription,
        ownerId: recorderUserId,
        updatedAt: Date.now()
      };

      // IndexedDB es el almacenamiento principal. localStorage solo si IndexedDB no está disponible
      // (tiene límite de ~5 MB y es síncrono, con miles de puntos se vuelve lento).
      saveActiveRecordingToDB(recorderUserId, payload).then(ok => {
        if (ok) return;
        try {
          localStorage.setItem(ACTIVE_RECORDING_STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
          console.warn('Error saving active recording to localStorage:', e);
        }
      });
    }
  }, [
    isRecording,
    isPaused,
    elapsedPersistBucket,
    distanceKm,
    avgSpeed,
    currentElevation,
    maxElevation,
    trackCoords,
    recordedWaypoints,
    detectedStopsCount,
    routeTitle,
    routeDescription,
    recorderUserId
  ]);

  // Clean active recording session storage (IndexedDB + localStorage)
  const clearActiveRecordingStorage = () => {
    if (recorderUserId) clearActiveRecordingFromDB(recorderUserId);
    lastAcceptedPointRef.current = null;
    wakeLockRef.current.releaseLock();
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
      // Si el modal se cerró (o React re-montó el efecto) mientras cargaba Leaflet, no crear
      // un mapa ni un watcher de vista previa huérfanos
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Leer la traza desde el ref: el closure de este efecto puede tener el estado viejo
      // (p. ej. si la sesión se restauró de IndexedDB después de abrir el modal)
      const existingTrack = trackRef.current;

      // Initial center: último punto grabado, si no, zona de CDMX
      const initialCenter: [number, number] = existingTrack[existingTrack.length - 1] || [19.4326, -99.1332];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: existingTrack.length > 0 ? 14 : 13,
        zoomControl: false,
        attributionControl: false
      });

      // Active live preview GPS watcher before recording starts
      if (typeof navigator !== 'undefined' && navigator.geolocation && existingTrack.length === 0) {
        setIsLocating(true);
        let hasCentered = false;
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
              // Centrar solo en la primera lectura para no pelear con el zoom/arrastre del usuario
              if (mapInstanceRef.current && !hasCentered) {
                hasCentered = true;
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

      // Leaflet zoom controls managed through custom HUD buttons for sleek styling

      // Tile Layer (Satellite HD default - fotografía aérea limpia sin textos estorbosos)
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });
      satLayer.addTo(map);

      // Polyline for recorded track
      const poly = L.polyline(existingTrack, {
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

      mapInstanceRef.current = map;

      // Re-draw any existing waypoints (sesión restaurada o modal reabierto)
      redrawWaypoints(waypointsRef.current);

      // If we restored trackCoords, fit bounds nicely so the whole track is seen immediately
      if (existingTrack.length > 1) {
        fitOnRestoreRef.current = false;
        try {
          map.fitBounds(poly.getBounds(), { padding: [30, 30] });
        } catch (e) {}
      }

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 200);
    };

    initLeaflet();

    return () => {
      isMounted = false;
      stopPreviewWatcher();
      // Si se cierra el modal grabando (p. ej. cambiando de pestaña en la barra inferior),
      // dejarlo en pausa de forma explícita para que "Reanudar" vuelva a prender el GPS
      if (gpsWatcherRef.current !== null) {
        stopGpsWatcher();
        stopTimer();
        wakeLockRef.current.releaseLock();
        setIsPaused(true);
        setCurrentSpeed(0);
      } else if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  // Etiqueta visible de cada waypoint en el mapa
  const getWaypointTag = (wp: Waypoint) => {
    if (wp.id.startsWith('stop-')) return 'STOP';
    const tags: Record<string, string> = {
      start: 'START',
      end: 'END',
      fuel: 'GAS',
      scenic: 'VISTA',
      dirt: 'TECNICO',
      camp: 'DESCANSO'
    };
    return tags[wp.type] || wp.type.toUpperCase();
  };

  // Redibuja todos los waypoints. Al derivarse del estado, sirven igual para grabación nueva,
  // sesión restaurada o mapa re-creado al reabrir el modal.
  const redrawWaypoints = async (wps: Waypoint[]) => {
    if (!mapInstanceRef.current || !waypointsLayerRef.current) return;
    const L = (await import('leaflet')).default;
    const layer = waypointsLayerRef.current;
    layer.clearLayers();

    const typeConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      fuel: { bg: '#E6332A', text: '#FFFFFF', dot: '#FF8A84', label: 'GAS' },
      scenic: { bg: '#F7B32B', text: '#121110', dot: '#FFE17D', label: 'MIRADOR' },
      dirt: { bg: '#FF7A00', text: '#FFFFFF', dot: '#FFB266', label: 'TÉCNICO' },
      camp: { bg: '#25D366', text: '#121110', dot: '#85FFB2', label: 'PAUSA' },
      stop: { bg: '#E6332A', text: '#FFFFFF', dot: '#FF8A84', label: 'PARADA' },
      curvometer: { bg: '#8B5CF6', text: '#FFFFFF', dot: '#C4B5FD', label: 'CURVA' },
      start: { bg: '#25D366', text: '#121110', dot: '#85FFB2', label: 'SALIDA' },
    };

    wps.forEach((wp) => {
      const isStart = wp.name.toLowerCase().includes('salida') || wp.name.toLowerCase().includes('inicio');
      const cfg = isStart 
        ? typeConfig.start 
        : (typeConfig[wp.type] || { bg: '#F7B32B', text: '#121110', dot: '#FFE17D', label: getWaypointTag(wp) });
      const cleanTitle = wp.name.split('(')[0].trim();

      const markerIcon = L.divIcon({
        className: 'wp-tactical-pin',
        html: `
          <div style="position: relative; display: inline-flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.65));">
            <div style="background: rgba(18, 17, 16, 0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 9999px; padding: 4px 10px 4px 5px; display: inline-flex; align-items: center; gap: 7px; box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12); white-space: nowrap;">
              <span style="background: ${cfg.bg}; color: ${cfg.text}; font-weight: 800; font-size: 8.5px; font-family: ui-monospace, SFMono-Regular, monospace; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.04em; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.25);">
                <span style="width: 4px; height: 4px; border-radius: 50%; background: ${cfg.dot}; box-shadow: 0 0 4px ${cfg.dot};"></span>
                ${cfg.label}
              </span>
              <span style="color: #FFFFFF; font-size: 11px; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-weight: 700; letter-spacing: -0.01em;">${cleanTitle}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(18, 17, 16, 0.92); margin-top: -1px;"></div>
            <div style="width: 7px; height: 7px; border-radius: 50%; background: ${cfg.bg}; border: 1.5px solid #FFFFFF; box-shadow: 0 0 10px ${cfg.bg}; margin-top: 1px;"></div>
          </div>
        `,
        iconSize: [160, 42],
        iconAnchor: [80, 40]
      });
      L.marker([wp.lat, wp.lng], { icon: markerIcon })
        .bindPopup(`<b>${wp.name}</b><br/>${wp.notes || ''}`)
        .addTo(layer);
    });
  };

  // Mantener la línea del mapa y los marcadores sincronizados con el estado
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setLatLngs(trackCoords);
    if (fitOnRestoreRef.current && mapInstanceRef.current && trackCoords.length > 1) {
      fitOnRestoreRef.current = false;
      try {
        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
      } catch (e) {}
    }
  }, [trackCoords]);

  useEffect(() => {
    redrawWaypoints(recordedWaypoints);
  }, [recordedWaypoints]);

  // Log an automatic stop detected by GPS inactivity
  const logAutomaticStop = (lat: number, lng: number, ele: number) => {
    stopsCountRef.current += 1;
    const stopNum = stopsCountRef.current;
    const newStop: Waypoint = {
      id: `stop-${Date.now()}`,
      name: `Parada #${stopNum} (Pausa de Manejo)`,
      lat,
      lng,
      type: 'camp',
      notes: `Parada detectada por telemetría GPS. Altitud: ${ele}m. Tiempo en ruta: ${formatTime(getElapsedSeconds())}`
    };

    setDetectedStopsCount(stopNum);
    setRecordedWaypoints(wps => [...wps, newStop]);
  };

  // Manual Waypoint / Stop Logger
  const handleAddManualWaypoint = (type: WaypointType, label: string, _tag: string) => {
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
    confetti({ particleCount: 20, spread: 45 });
  };

  // Procesa cada lectura del GPS mientras se graba
  const handleGpsPosition = (pos: GeolocationPosition) => {
    setHasGpsFix(true);
    setGpsError(null);
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy || 10;
    const hasAltitude = pos.coords.altitude !== null && pos.coords.altitude !== undefined;
    const ele = hasAltitude ? Math.round(pos.coords.altitude as number) : null;
    const rawSpeed = pos.coords.speed;
    const hasSpeed = rawSpeed !== null && rawSpeed !== undefined && !Number.isNaN(rawSpeed);
    const spd = hasSpeed && (rawSpeed as number) > 0 ? Math.round((rawSpeed as number) * 3.6) : 0; // m/s to km/h
    const timestamp = pos.timestamp || Date.now();

    setCurrentSpeed(spd);
    lastPositionRef.current = { lat, lng, ele: ele ?? lastPositionRef.current?.ele ?? 0 };

    // Filtro anti-rebotes y anti-líneas rectas
    const prevPoint = lastAcceptedPointRef.current;
    const check = shouldAcceptGPSPoint(
      { lat, lng, ele: ele ?? undefined, speed: spd, accuracy, timestamp },
      prevPoint
    );

    if (!check.accept) {
      // Si el punto es ruido de satélite o rebote, actualizar marcador visual sin romper la traza
      updateRiderLocation(lat, lng);
      return;
    }

    // Movimiento real: reinicia el contador de parada. Si el teléfono no reporta velocidad,
    // basta con que el punto haya pasado el filtro (se movió más de 2.5 m).
    if (!hasSpeed || spd >= 3) {
      lastMovementAtRef.current = Date.now();
      stopLoggedRef.current = false;
    }

    lastAcceptedPointRef.current = { lat, lng, timestamp };

    // Primer punto de la grabación: waypoint de salida
    if (!prevPoint && !waypointsRef.current.some(w => w.type === 'start')) {
      const startWp: Waypoint = {
        id: `start-${Date.now()}`,
        name: 'Punto de Salida',
        lat,
        lng,
        type: 'start',
        notes: `Inicio de grabación GPS: ${new Date().toLocaleTimeString()}`
      };
      setRecordedWaypoints(prev => [startWp, ...prev.filter(w => w.type !== 'start')]);
    }

    // Distancia acumulada sin redondear (redondear en cada paso perdía los tramos de pocos metros)
    const addedKm = prevPoint && !resumeGapRef.current ? (check.distanceKm || 0) : 0;
    resumeGapRef.current = false;
    distanceRef.current += addedKm;
    setDistanceKm(Number(distanceRef.current.toFixed(2)));

    const elapsed = getElapsedSeconds();
    if (elapsed > 0) {
      setAvgSpeed(Math.round(distanceRef.current / (elapsed / 3600)));
    }

    if (ele !== null) {
      setCurrentElevation(ele);
      setMaxElevation(prevMax => Math.max(prevMax, ele));
    }

    setTrackCoords(prev => [...prev, [lat, lng] as [number, number]]);

    if (!prevPoint && mapInstanceRef.current) {
      updateRiderLocation(lat, lng, 15);
    } else {
      updateRiderLocation(lat, lng);
    }
  };

  const handleGpsError = (err: GeolocationPositionError) => {
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
  };

  const startGpsWatcher = async () => {
    if (gpsWatcherRef.current !== null) return;
    gpsWatcherRef.current = 1;

    try {
      await unifiedLocationService.startTracking(
        (reading) => {
          handleGpsPosition({
            coords: {
              latitude: reading.latitude,
              longitude: reading.longitude,
              altitude: reading.altitude ?? null,
              speed: reading.speed !== null && reading.speed !== undefined ? reading.speed / 3.6 : null,
              accuracy: reading.accuracy ?? 10,
              altitudeAccuracy: null,
              heading: null
            },
            timestamp: reading.timestamp
          } as GeolocationPosition);
        },
        (errorMsg) => {
          setGpsError(errorMsg);
        }
      );
    } catch (err: any) {
      console.warn('Error starting unified location service:', err);
    }
  };

  const stopGpsWatcher = async () => {
    if (gpsWatcherRef.current !== null) {
      try {
        await unifiedLocationService.stopTracking();
      } catch (err) {
        console.warn('Error stopping unified location service:', err);
      }
    }
    gpsWatcherRef.current = null;
  };

  const startTimer = () => {
    segmentStartRef.current = Date.now();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(getElapsedSeconds());

      // Detección de paradas por tiempo sin movimiento. Funciona aunque el filtro descarte
      // las lecturas de ruido o aunque el teléfono deje de mandar posiciones estando quieto.
      if (lastMovementAtRef.current) {
        const still = Math.floor((Date.now() - lastMovementAtRef.current) / 1000);
        setStoppedSeconds(still >= 3 ? still : 0);
        // Solo cuenta como parada si ya se rodó algo (evita la "parada" de antes de arrancar)
        if (still >= 30 && !stopLoggedRef.current && lastPositionRef.current && distanceRef.current > 0.05) {
          stopLoggedRef.current = true;
          const p = lastPositionRef.current;
          logAutomaticStop(p.lat, p.lng, p.ele);
        }
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (segmentStartRef.current) {
      elapsedBaseRef.current += Math.floor((Date.now() - segmentStartRef.current) / 1000);
      segmentStartRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setElapsedSeconds(elapsedBaseRef.current);
  };

  const stopPreviewWatcher = () => {
    if (previewWatcherRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(previewWatcherRef.current);
    }
    previewWatcherRef.current = null;
  };

  // Start real GPS recording
  const handleStart = () => {
    setGpsError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('La geolocalización no está disponible en este dispositivo o navegador.');
      return;
    }

    finalizedRef.current = false;
    lastAcceptedPointRef.current = null;
    resumeGapRef.current = false;
    lastMovementAtRef.current = Date.now();
    stopLoggedRef.current = false;

    setIsRecording(true);
    setIsPaused(false);

    // Activar WakeLock para que el móvil no suspenda el sensor GPS al rodar
    wakeLockRef.current.requestLock();

    // Clear preview watcher since recording watcher takes full control
    stopPreviewWatcher();

    startTimer();
    startGpsWatcher();
  };

  // Pause: detiene timer y GPS (antes el GPS seguía sumando puntos y km en pausa)
  const handlePause = () => {
    setIsPaused(true);
    stopTimer();
    stopGpsWatcher();
    wakeLockRef.current.releaseLock();
    setCurrentSpeed(0);
    setStoppedSeconds(0);
  };

  // Resume: vuelve a encender el GPS (antes solo reanudaba el reloj, y tras recargar
  // o minimizar el modal ya no se grababa ningún punto)
  const handleResume = () => {
    setGpsError(null);
    setIsPaused(false);
    resumeGapRef.current = true;
    lastMovementAtRef.current = Date.now();
    stopLoggedRef.current = false;
    stopPreviewWatcher();
    wakeLockRef.current.requestLock();
    startTimer();
    startGpsWatcher();
  };

  // El navegador suelta el WakeLock cuando la pestaña pasa a segundo plano: re-pedirlo al volver
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isRecording && !isPaused) {
        wakeLockRef.current.requestLock();
        setElapsedSeconds(getElapsedSeconds());
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isRecording, isPaused]);

  // Deja el grabador limpio para una ruta nueva
  const resetRecordingState = () => {
    stopGpsWatcher();
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    elapsedBaseRef.current = 0;
    segmentStartRef.current = null;
    distanceRef.current = 0;
    stopsCountRef.current = 0;
    lastAcceptedPointRef.current = null;
    lastMovementAtRef.current = null;
    lastPositionRef.current = null;
    stopLoggedRef.current = false;
    resumeGapRef.current = false;
    finalizedRef.current = false;
    trackRef.current = [];
    waypointsRef.current = [];
    wakeLockRef.current.releaseLock();

    setIsRecording(false);
    setIsPaused(false);
    setTrackCoords([]);
    setRecordedWaypoints([]);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setAvgSpeed(0);
    setCurrentSpeed(0);
    setCurrentElevation(0);
    setMaxElevation(0);
    setDetectedStopsCount(0);
    setStoppedSeconds(0);
    setRouteTitle('');
    setRouteDescription('');
    setSavedRouteUrl(null);
    setUploadedPhotos([]);
    setShowExitConfirm(false);
    setShowSaveDialog(false);
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
    // Si ya había un "fin" (abrió el diálogo, reanudó y volvió a terminar) se reemplaza
    setRecordedWaypoints(prev => [...prev.filter(w => w.type !== 'end'), endWp]);

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

    // Check if there is an active rodada to complete
    const targetRodada = !isSoloRide ? rodadas.find(r => r.crewId === targetCrewId && r.status !== 'completada') : null;
    if (targetRodada && markRodadaAsCompleted) {
      completeRodada(targetRodada.id);
    }

    // Build the final RouteProposal for History
    const newRoute: Omit<RouteProposal, 'id' | 'votes' | 'comments'> = {
      rodadaId: (targetRodada && markRodadaAsCompleted) ? targetRodada.id : '',
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

    // Clear active recording cache on successful save. finalizedRef evita que el efecto
    // de persistencia la vuelva a escribir mientras se ve la pantalla de éxito.
    finalizedRef.current = true;
    stopGpsWatcher();
    stopTimer();
    clearActiveRecordingStorage();
    confetti({ particleCount: 100, spread: 90 });
  };

  // Close modal safely or prompt if recording is in progress
  const handleRequestClose = () => {
    // Ruta ya guardada: no preguntar qué hacer con ella, solo limpiar y cerrar
    if (finalizedRef.current) {
      resetRecordingState();
      onClose();
      return;
    }
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
    stopPreviewWatcher();
    resetRecordingState();
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
            <span className="font-sans font-semibold text-xs sm:text-sm text-[#FAF6ED] block leading-tight">
              {isRecording && !isPaused ? 'Telemetría en Vivo' : isPaused ? 'Ruta Pausada' : 'Grabador de Expedición'}
            </span>
            <span className="text-[9px] font-mono font-medium text-white/50 uppercase tracking-widest flex items-center gap-1">
              {hasGpsFix ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#25D366]"></span>
                  {unifiedLocationService.isNativeDevice() ? 'GPS Nativo (2º Plano Activo)' : 'GPS Web (Mantén Pantalla Activa)'}
                </>
              ) : isLocating ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#F7B32B] animate-ping"></span>
                  Conectando satélites...
                </>
              ) : (
                unifiedLocationService.isNativeDevice() ? '🛰️ Modo Nativo Listo' : '🌐 Modo Web Listo'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de mapa Satélite HD de alta resolución */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#242322] border border-white/10 text-[9px] font-mono uppercase tracking-wider text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
            Satélite HD
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
            className="text-[10px] uppercase underline ml-2 shrink-0 font-sans font-semibold cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {/* 2. MAIN COCKPIT VIEWPORT (IMMERSIVE FULLSCREEN MAP + FLOATING HUD) */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-[#121110]">
        
        {/* FULLSCREEN MAP CANVAS */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

        {/* Top-Right Tactical Controls (Locate Me + Sleek Zoom) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleCenterOnMyLocation}
            disabled={isLocating}
            className="w-11 h-11 bg-[#1A1918]/90 hover:bg-[#252422] text-[#FAF6ED] border border-white/20 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-center transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Centrar en mi ubicación actual"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#E6332A]" />
            ) : (
              <Crosshair className={`w-5 h-5 ${hasGpsFix ? 'text-[#25D366]' : 'text-[#E6332A]'}`} />
            )}
          </button>

          <div className="flex flex-col bg-[#1A1918]/90 border border-white/20 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-11 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition border-b border-white/10 active:scale-90 font-mono font-bold text-lg select-none cursor-pointer"
              title="Acercar mapa"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-11 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-90 font-mono font-bold text-lg select-none cursor-pointer"
              title="Alejar mapa"
            >
              −
            </button>
          </div>
        </div>

        {/* Real-time Waypoint / POI Floating Quick-Buttons (Top Left, visible when actively recording) */}
        {isRecording && !isPaused && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#121110]/85 backdrop-blur-xl border border-white/15 p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-[calc(100vw-120px)] overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleAddManualWaypoint('fuel', 'Gasolinera', 'GAS')}
              className="px-3 py-1.5 bg-[#E6332A]/20 hover:bg-[#E6332A]/35 text-white border border-[#E6332A]/40 hover:border-[#E6332A]/80 shadow-[0_2px_8px_rgba(230,51,42,0.2)] text-[11px] font-sans font-bold flex items-center gap-1.5 transition-all duration-150 rounded-full cursor-pointer active:scale-95 shrink-0"
              title="Añadir punto de recarga de gasolina"
            >
              <Fuel className="w-3.5 h-3.5 text-[#FF5C54]" />
              <span>Gas</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddManualWaypoint('scenic', 'Mirador', 'VISTA')}
              className="px-3 py-1.5 bg-[#F7B32B]/20 hover:bg-[#F7B32B]/35 text-white border border-[#F7B32B]/40 hover:border-[#F7B32B]/80 shadow-[0_2px_8px_rgba(247,179,43,0.2)] text-[11px] font-sans font-bold flex items-center gap-1.5 transition-all duration-150 rounded-full cursor-pointer active:scale-95 shrink-0"
              title="Añadir punto panorámico o mirador"
            >
              <Camera className="w-3.5 h-3.5 text-[#F7B32B]" />
              <span>Mirador</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddManualWaypoint('dirt', 'Técnico', 'TECNICO')}
              className="px-3 py-1.5 bg-[#FF7A00]/20 hover:bg-[#FF7A00]/35 text-white border border-[#FF7A00]/40 hover:border-[#FF7A00]/80 shadow-[0_2px_8px_rgba(255,122,0,0.2)] text-[11px] font-sans font-bold flex items-center gap-1.5 transition-all duration-150 rounded-full cursor-pointer active:scale-95 shrink-0"
              title="Añadir tramo técnico o curva difícil"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#FFA64D]" />
              <span>Técnico</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddManualWaypoint('camp', 'Descanso', 'DESCANSO')}
              className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/35 text-white border border-[#25D366]/40 hover:border-[#25D366]/80 shadow-[0_2px_8px_rgba(37,211,102,0.2)] text-[11px] font-sans font-bold flex items-center gap-1.5 transition-all duration-150 rounded-full cursor-pointer active:scale-95 shrink-0"
              title="Añadir pausa o parada de hidratación"
            >
              <Coffee className="w-3.5 h-3.5 text-[#52FFA2]" />
              <span>Pausa</span>
            </button>
          </div>
        )}

        {/* FLOATING COCKPIT HUD (Docked at bottom on mobile, centered tactical HUD on desktop) */}
        <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-20 pointer-events-auto">
          <div className="bg-[#181716]/92 backdrop-blur-2xl border border-white/15 rounded-3xl p-3.5 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-3">
            
            {/* Live 4-Matrix Telemetry Gauges */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              
              {/* Chrono */}
              <div className="p-2 sm:p-3 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E6332A] shrink-0" />
                  Tiempo
                </span>
                <p className="font-mono font-bold text-xs sm:text-xl text-white tracking-tight mt-1 truncate">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>

              {/* Odometer */}
              <div className="p-2 sm:p-3 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F7B32B] shrink-0" />
                  Odómetro
                </span>
                <p className="font-mono font-bold text-xs sm:text-xl text-white tracking-tight mt-1 truncate">
                  {distanceKm} <span className="text-[9px] sm:text-xs font-bold text-white/40">km</span>
                </p>
              </div>

              {/* Speed */}
              <div className="p-2 sm:p-3 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#25D366] shrink-0" />
                  Velocidad
                </span>
                <p className="font-mono font-bold text-xs sm:text-xl text-white tracking-tight mt-1 truncate">
                  {currentSpeed} <span className="text-[9px] sm:text-xs font-bold text-white/40">km/h</span>
                </p>
              </div>

              {/* Altitude */}
              <div className="p-2 sm:p-3 bg-[#242322] border border-white/10 rounded-2xl flex flex-col justify-between">
                <span className="text-[8px] sm:text-[10px] text-white/50 uppercase font-mono font-bold tracking-wider flex items-center gap-1 truncate">
                  <Mountain className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#60A5FA] shrink-0" />
                  Altitud
                </span>
                <p className="font-mono font-bold text-xs sm:text-xl text-white tracking-tight mt-1 truncate">
                  {currentElevation > 0 ? currentElevation : (isRecording ? '---' : '0')}{' '}
                  <span className="text-[9px] sm:text-xs font-bold text-white/40">m</span>
                </p>
              </div>

            </div>

            {/* Stops Detected Feed (Tactical Card) */}
            {recordedWaypoints.length > 0 && (
              <div className="bg-[#242322]/90 border border-white/10 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between text-xs animate-fadeIn shadow-inner">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-lg bg-[#E6332A] text-white text-[10px] flex items-center justify-center font-bold font-mono shadow-sm shrink-0">
                    {recordedWaypoints.length}
                  </span>
                  <div className="truncate">
                    <span className="text-[9px] uppercase font-mono text-white/40 block leading-tight">Último punto fijado</span>
                    <span className="font-sans font-bold text-xs text-[#FAF6ED] truncate block">
                      {recordedWaypoints[recordedWaypoints.length - 1].name}
                    </span>
                  </div>
                </div>
                {stoppedSeconds > 0 && (
                  <span className="bg-[#E6332A]/20 text-[#FF6B6B] border border-[#E6332A]/30 text-[10px] font-mono font-bold px-2 py-1 rounded-full animate-pulse shrink-0 ml-2">
                    Detenido: {stoppedSeconds}s
                  </span>
                )}
              </div>
            )}

            {/* MASTER ACTION BUTTONS */}
            <div className="pt-0.5">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#E6332A] to-[#d02c24] hover:brightness-110 text-white font-sans font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition rounded-2xl shadow-[0_4px_24px_rgba(230,51,42,0.4)] touch-manipulation active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-[#F7B32B]" />
                  <span>Iniciar grabación GPS</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {isPaused ? (
                      <button
                        type="button"
                        onClick={handleResume}
                        className="py-3 sm:py-3.5 bg-[#25D366] hover:bg-[#20b858] text-[#121110] font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition rounded-2xl shadow-lg touch-manipulation active:scale-[0.98] cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current text-[#121110]" />
                        <span>Reanudar</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePause}
                        className="py-3 sm:py-3.5 bg-[#242322] hover:bg-[#2e2c2b] border border-white/15 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition rounded-2xl shadow-lg touch-manipulation active:scale-[0.98] cursor-pointer"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pausar</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOpenSaveDialog}
                      className="py-3 sm:py-3.5 bg-gradient-to-r from-[#E6332A] to-[#d02c24] hover:brightness-110 text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition rounded-2xl shadow-[0_4px_16px_rgba(230,51,42,0.3)] touch-manipulation active:scale-[0.98] cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Terminar & Guardar</span>
                    </button>
                  </div>

                  {isPaused && (
                    <button
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      className="w-full text-center text-[10px] sm:text-xs text-white/50 hover:text-[#E6332A] uppercase font-sans font-bold tracking-widest pt-1 transition block cursor-pointer"
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
          <div className="border border-[#1A1918]/10 bg-[#FAF6ED] max-w-xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto shadow-sm relative text-[#1A1918] rounded-[28px] animate-scaleUp">
            
            <div className="flex items-start justify-between border-b border-[#1A1918]/10 pb-4">
              <div>
                <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-semibold">
                  RECORRIDO CONCLUIDO
                </span>
                <h3 className="font-display font-semibold text-2xl text-[#1A1918] mt-1">
                  Guardar ruta en la tribu
                </h3>
              </div>
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="w-8 h-8 border border-[#1A1918]/10 bg-[#F4EEDB] hover:bg-[#E6332A] hover:text-white text-[#1A1918] rounded-xl transition shadow-sm flex items-center justify-center"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry Summary */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 text-center rounded-2xl shadow-sm">
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-sans font-semibold block">Distancia</span>
                <span className="font-display font-semibold text-[#1A1918] text-base">{distanceKm} km</span>
              </div>
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-sans font-semibold block">Tiempo</span>
                <span className="font-display font-semibold text-[#1A1918] text-base">{formatTime(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#1A1918]/70 uppercase font-sans font-semibold block">Paradas</span>
                <span className="font-display font-semibold text-[#E6332A] text-base">{recordedWaypoints.length} puntos</span>
              </div>
            </div>

            {!savedRouteUrl ? (
              <div className="space-y-4 text-xs">
                
                {/* 1. Modalidad de Rodada: ¿En Solitario o en Tribu? */}
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold block mb-1.5">
                    Modalidad de la Rodada:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSoloRide(false)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1A1918]/10 font-sans text-xs transition shadow-sm active:shadow-none ${
                        !isSoloRide
                          ? 'bg-[#E6332A] text-white font-semibold'
                          : 'bg-[#F4EEDB] text-[#1A1918] hover:bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>En Tribu / Club</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSoloRide(true)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#1A1918]/10 font-sans text-xs transition shadow-sm active:shadow-none ${
                        isSoloRide
                          ? 'bg-[#E6332A] text-white font-semibold'
                          : 'bg-[#F4EEDB] text-[#1A1918] hover:bg-[#FAF6ED] font-bold'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Rodé solo</span>
                    </button>
                  </div>
                </div>

                {/* 2. Tribu / Grupo Destino (solo visible si no es rodada en solitario) */}
                {!isSoloRide && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-150 space-y-2">
                    <div>
                      <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold block mb-1">
                        Tribu / Grupo Destino:
                      </label>
                      <select
                        value={targetCrewId}
                        onChange={(e) => setTargetCrewId(e.target.value)}
                        className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
                      >
                        {/* Deduplicate crews by normalized key so duplicates never show */}
                        {Array.from(new Map(crews.map(c => [c.slug || c.name.toLowerCase().trim(), c])).values()).map(c => (
                          <option key={c.id} value={c.id} className="bg-[#FAF6ED] text-[#1A1918]">
                            {c.name} {c.baseCity ? `(${c.baseCity})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Checkbox para auto-completar rodada activa de la tribu */}
                    {(() => {
                      const activeCrewRodada = rodadas.find(r => r.crewId === targetCrewId && r.status !== 'completada');
                      if (!activeCrewRodada) return null;
                      return (
                        <label className="flex items-start gap-2.5 p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl shadow-sm cursor-pointer hover:bg-[#F4EEDB] transition">
                          <input
                            type="checkbox"
                            checked={markRodadaAsCompleted}
                            onChange={(e) => setMarkRodadaAsCompleted(e.target.checked)}
                            className="mt-0.5 accent-[#E6332A] w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="text-xs">
                            <span className="font-sans font-semibold text-[#1A1918] block">
                              ✓ Archivar rodada "{activeCrewRodada.title}" al Historial
                            </span>
                            <span className="text-[11px] font-mono text-[#1A1918]/70 block mt-0.5">
                              Mueve automáticamente la convocatoria y sus rutas al Historial de la Tribu como rodada concluida.
                            </span>
                          </div>
                        </label>
                      );
                    })()}
                  </div>
                )}

                {/* 3. Título de la Ruta */}
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold block mb-1">
                    Título de la Ruta:
                  </label>
                  <input
                    type="text"
                    value={routeTitle}
                    onChange={(e) => setRouteTitle(e.target.value)}
                    placeholder="Ej. Brecha Cañón de las Manzanas"
                    className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] font-sans font-semibold rounded-xl shadow-sm"
                  />
                </div>

                {/* 4. Dificultad Técnica */}
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold block mb-1">
                    Dificultad Técnica:
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
                  >
                    <option value="Fácil (Fluida)">Fácil (Fluida)</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado / Técnico">Avanzado / Técnico</option>
                  </select>
                </div>

                {/* 5. Barra Deslizadora de Terracería vs Carretera con Iconos Opuestos */}
                <div className="p-3 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold">
                      Superficie de la ruta
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#1A1918] bg-[#FAF6ED] px-2 py-0.5 rounded border border-[#1A1918]/10">
                      {dirtPercentage}% Off-road • {100 - dirtPercentage}% Asfalto
                    </span>
                  </div>

                  {/* Slider with opposite icons */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1 text-[#1A1918]/70" title="Carretera / Asfalto">
                      <Compass className="w-4 h-4 text-[#1A1918]" />
                      <span className="text-[9px] font-sans uppercase font-bold hidden sm:inline">Asfalto</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={dirtPercentage}
                      onChange={(e) => setDirtPercentage(Number(e.target.value))}
                      className="flex-1 accent-[#E6332A] cursor-pointer h-2 bg-[#FAF6ED] rounded-lg border border-[#1A1918]/10"
                    />

                    <div className="flex items-center gap-1 text-[#E6332A]" title="Terracería / Montaña">
                      <Mountain className="w-4 h-4 text-[#E6332A]" />
                      <span className="text-[9px] font-sans uppercase font-semibold text-[#E6332A] hidden sm:inline">Terracería</span>
                    </div>
                  </div>
                </div>

                {/* 6. Notas y Condiciones */}
                <div>
                  <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold block mb-1">
                    Notas y Condiciones del Camino:
                  </label>
                  <textarea
                    rows={2}
                    value={routeDescription}
                    onChange={(e) => setRouteDescription(e.target.value)}
                    className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] text-xs focus:outline-none focus:border-[#E6332A] resize-none rounded-xl shadow-sm font-medium"
                  />
                </div>

                {/* 7. Fotos de la Rodada (Opcionales) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[#1A1918]/70 text-[10px] uppercase font-sans font-semibold">
                      Fotos de la Rodada (Opcional):
                    </label>
                    <span className="text-[9px] font-mono text-[#1A1918]/60">
                      {uploadedPhotos.length === 0 ? 'Sin fotos (se mostrará solo el mapa GPS)' : `${uploadedPhotos.length} foto(s)`}
                    </span>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {uploadedPhotos.map((photo, pIdx) => (
                        <div key={pIdx} className="relative w-16 h-16 rounded-xl border border-[#1A1918]/10 overflow-hidden shrink-0 group">
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

                  <label className="flex items-center justify-center gap-2 py-2 px-3 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-dashed border-[#1A1918]/10 rounded-xl font-sans font-semibold text-xs cursor-pointer transition">
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
                    className="sm:w-1/3 py-3 border border-[#1A1918]/10 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-sans font-semibold text-xs transition rounded-xl shadow-sm touch-manipulation active:shadow-none"
                  >
                    Volver al mapa
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToGroup}
                    className="sm:flex-1 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl shadow-sm touch-manipulation active:shadow-none"
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
                  <h4 className="font-display font-semibold text-xl text-[#1A1918] ">
                    ¡Ruta guardada exitosamente!
                  </h4>
                  <p className="text-xs text-[#1A1918]/70 font-sans font-medium">
                    La ruta ya está integrada en el grupo y todos los pilotos pueden verla, votarla y descargar su GPX.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={savedRouteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl shadow-sm active:shadow-none"
                    >
                      <Navigation className="w-4 h-4 text-[#F7B32B]" />
                      Abrir en Google Maps ({recordedWaypoints.length} Paradas)
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🏍️ ¡Acabo de registrar esta ruta con MotoMami!\n📍 ${routeTitle || 'Ruta off-road'}\n📏 Distancia: ${distanceKm} km\n⏱️ Tiempo: ${formatTime(elapsedSeconds)}\n🛑 ${recordedWaypoints.length} paradas registradas.\n🗺️ Abrir en Google Maps:\n${savedRouteUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white border border-[#1A1918]/10 font-sans font-semibold text-xs transition flex items-center justify-center gap-2 rounded-xl shadow-sm active:shadow-none"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white" />
                      Compartir en WhatsApp
                    </a>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const gpxContent = generateGPXString(
                          routeTitle || 'Ruta NAO Offroad',
                          trackCoords.length > 0 ? trackCoords : SIMULATED_COORDS.map(c => [c[0], c[1]]),
                          recordedWaypoints
                        );
                        const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${(routeTitle || 'ruta-nao').toLowerCase().replace(/[^a-z0-9]/g, '-')}.gpx`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-2.5 px-3 border border-[#1A1918]/10 bg-[#F7B32B] hover:bg-[#e0a020] text-[#1A1918] font-sans font-semibold text-xs transition rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:shadow-none"
                      title="Descargar archivo GPX compatible con Garmin, Gaia GPS y Wikiloc"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Descargar GPX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (savedRouteUrl) {
                          navigator.clipboard.writeText(savedRouteUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }
                      }}
                      className="flex-1 py-2.5 border border-[#1A1918]/10 bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918] font-sans font-bold text-xs transition rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Ruta ya guardada: dejar el grabador limpio para la siguiente
                        resetRecordingState();
                        onClose();
                      }}
                      className="px-6 py-2.5 border border-[#1A1918]/10 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-sans font-semibold text-xs transition rounded-xl shadow-sm active:shadow-none"
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
          <div className="border border-[#1A1918]/10 bg-[#FAF6ED] max-w-md w-full p-6 space-y-5 shadow-sm relative text-[#1A1918] rounded-[24px] animate-scaleUp">
            
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#E6332A]/10 border border-[#E6332A] rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-[#E6332A]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-lg text-[#1A1918]  ">
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
                className="w-full py-3 px-4 bg-[#FAF6ED] hover:bg-[#F4EEDB] border border-[#1A1918]/10 text-[#1A1918] rounded-xl font-sans font-semibold text-xs flex items-center justify-between transition shadow-sm active:shadow-none"
              >
                <span>Mantener en memoria y minimizar</span>
                <span className="text-[10px] text-[#25D366] font-mono font-bold">✓ Seguro</span>
              </button>

              {/* Option 2: Go to Save Route */}
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleOpenSaveDialog();
                }}
                className="w-full py-3 px-4 bg-[#E6332A] hover:bg-[#d02c24] border border-[#1A1918]/10 text-white rounded-xl font-sans font-semibold text-xs flex items-center justify-between transition shadow-sm active:shadow-none"
              >
                <span>Finalizar y Guardar en la Tribu</span>
                <span className="text-[10px] text-[#F7B32B] font-mono font-bold">Guardar</span>
              </button>

              {/* Option 3: Continue recording */}
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleResume();
                }}
                className="w-full py-2.5 text-center text-[#1A1918]/80 hover:text-[#1A1918] text-xs font-sans font-semibold transition"
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
