'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal, ActivityPost } from '../../types';
import { RouteMap } from '../Map/RouteMap';
import { ShareRouteModal } from '../Modals/ShareRouteModal';
import { SaveToListModal } from '../Modals/SaveToListModal';
import { 
  Search, 
  Bookmark, 
  MapPin, 
  Navigation, 
  Layers, 
  Crosshair, 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Flame, 
  ExternalLink,
  Share2,
  TrendingUp,
  Compass,
  Bike,
  Sparkles,
  Mountain,
  Fuel,
  Tent,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 19L8 5h8l4 14" />
    <line x1="12" y1="8" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="16" />
  </svg>
);

interface RouteExplorerViewProps {
  onOpenProposeRoute: () => void;
  onOpenRecordRoute?: () => void;
}

// Moto modalities categorized cleanly like Strava "Filtrar por deporte"
interface MotoModality {
  id: string;
  name: string;
  category: string;
  description: string;
}

const MOTO_MODALITIES: MotoModality[] = [
  // Doble Propósito & Aventura
  { id: 'dual-sport', name: 'Doble Propósito / Trail', category: 'Aventura & Dual-Sport', description: 'Himalayan, Scram 411, Tenere, XR' },
  { id: 'maxi-trail', name: 'Maxi-Trail & Adventure', category: 'Aventura & Dual-Sport', description: 'BMW GS, Africa Twin, KTM Adventure' },
  { id: 'scrambler', name: 'Scrambler & Mixta Noble', category: 'Aventura & Dual-Sport', description: 'Ducati Scrambler, Street Scrambler' },
  
  // Carretera & Curvas
  { id: 'sport', name: 'Deportivas & Curvas', category: 'Carretera & Curvas', description: 'Supersport, Pista, Asfalto técnico' },
  { id: 'naked', name: 'Naked & Screamer', category: 'Carretera & Curvas', description: 'MT-09, Duke, Monster, Z900' },
  { id: 'touring', name: 'Turismo & Sport-Touring', category: 'Carretera & Curvas', description: 'Grandes viajes, Autopista escénica' },
  { id: 'cruiser', name: 'Crucero & Custom', category: 'Carretera & Curvas', description: 'Harley-Davidson, Indian, Rebel' },

  // Off-Road Puro
  { id: 'enduro', name: 'Enduro & Brechas', category: 'Off-Road Puro', description: 'KTM EXC, WR, CRF, terracería pura' },
  { id: 'rally', name: 'Rally Raid & Desierto', category: 'Off-Road Puro', description: 'Navegación abierta, arena, dunas' },

  // Ciudad & Scooter
  { id: 'scooter', name: 'Scooter & Automáticas', category: 'Ciudad & Scooter', description: 'Vespa, NMax, PCX, tramos urbanos' },
  { id: 'classic', name: 'Clásica & Café Racer', category: 'Ciudad & Scooter', description: 'Rodadas con estilo, ruta de café' },
];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const RouteExplorerView: React.FC<RouteExplorerViewProps> = ({
  onOpenProposeRoute,
  onOpenRecordRoute
}) => {
  const {
    routeProposals,
    selectedRoute,
    setSelectedRoute,
    savedRouteIds,
    toggleSavedRoute,
    activities,
    enterRodada
  } = useApp();

  // Pilot Location (Defaults to Central Mexico / Interlomas)
  const [pilotLocation, setPilotLocation] = useState<{ lat: number; lng: number; label: string }>({
    lat: 19.4005,
    lng: -99.2816,
    label: 'Tu Ubicación'
  });

  // UI state inspired by Strava
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [showModalityModal, setShowModalityModal] = useState<boolean>(false);
  const [modalitySearch, setModalitySearch] = useState('');

  // Quick horizontal filter pills
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);
  const [filterDistance, setFilterDistance] = useState<'all' | 'short' | 'medium' | 'long'>('all'); // short <50km, medium 50-150km, long >150km
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all'); // all, Fácil, Intermedia, Técnica
  const [filterSurface, setFilterSurface] = useState<'all' | 'asfalto' | 'brecha' | 'mixta'>('all');
  const [filterElevation, setFilterElevation] = useState<'all' | 'flat' | 'high'>('all');

  // Map state
  const [currentMapLayer, setCurrentMapLayer] = useState<'satellite' | 'topo' | 'roads'>('satellite');
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Modals
  const [shareRoute, setShareRoute] = useState<RouteProposal | null>(null);
  const [saveRouteModal, setSaveRouteModal] = useState<RouteProposal | null>(null);

  // Handle GPS detect
  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPilotLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Mi GPS en Tiempo Real'
          });
          confetti({ particleCount: 25, spread: 45 });
        },
        () => {
          // Keep current
        }
      );
    }
  };

  // Toggle through map layers (Satellite -> Topo -> Roads)
  const handleCycleLayers = () => {
    if (currentMapLayer === 'satellite') setCurrentMapLayer('topo');
    else if (currentMapLayer === 'topo') setCurrentMapLayer('roads');
    else setCurrentMapLayer('satellite');
  };

  // Compute routes with distance from pilot
  const routesWithDistance = useMemo(() => {
    return routeProposals.map(r => {
      const startCoord = r.coordinates?.[0] || [19.4005, -99.2816];
      const dist = calculateDistanceKm(pilotLocation.lat, pilotLocation.lng, startCoord[0], startCoord[1]);
      return {
        ...r,
        distanceFromPilotKm: Math.round(dist)
      };
    });
  }, [routeProposals, pilotLocation]);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    let result = routesWithDistance;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    }

    // Saved only filter
    if (filterSavedOnly) {
      result = result.filter(r => savedRouteIds.includes(r.id));
    }

    // Modality filter
    if (selectedModality !== 'all') {
      if (selectedModality === 'dual-sport' || selectedModality === 'maxi-trail') {
        result = result.filter(r => r.offroadPercentage >= 25);
      } else if (selectedModality === 'enduro') {
        result = result.filter(r => r.offroadPercentage >= 50);
      } else if (selectedModality === 'sport' || selectedModality === 'naked') {
        result = result.filter(r => r.asphaltPercentage >= 70);
      } else if (selectedModality === 'touring' || selectedModality === 'cruiser') {
        result = result.filter(r => r.totalKm >= 100 && r.asphaltPercentage >= 60);
      }
    }

    // Distance filter
    if (filterDistance === 'short') result = result.filter(r => r.totalKm <= 50);
    else if (filterDistance === 'medium') result = result.filter(r => r.totalKm > 50 && r.totalKm <= 150);
    else if (filterDistance === 'long') result = result.filter(r => r.totalKm > 150);

    // Difficulty filter
    if (filterDifficulty !== 'all') {
      result = result.filter(r => r.difficulty.toLowerCase().includes(filterDifficulty.toLowerCase()));
    }

    // Surface filter
    if (filterSurface === 'asfalto') result = result.filter(r => r.asphaltPercentage >= 70);
    else if (filterSurface === 'brecha') result = result.filter(r => r.offroadPercentage >= 60);
    else if (filterSurface === 'mixta') result = result.filter(r => r.offroadPercentage >= 25 && r.asphaltPercentage >= 25);

    // Elevation filter
    if (filterElevation === 'flat') result = result.filter(r => (r.campsite?.elevationMeters || 500) < 600);
    else if (filterElevation === 'high') result = result.filter(r => (r.campsite?.elevationMeters || 500) >= 600);

    return result;
  }, [
    routesWithDistance, 
    searchTerm, 
    filterSavedOnly, 
    selectedModality, 
    filterDistance, 
    filterDifficulty, 
    filterSurface, 
    filterElevation, 
    savedRouteIds
  ]);

  // Keep an active route selected (default to closest or first)
  const activeRoute = useMemo(() => {
    if (selectedRoute) {
      const match = filteredRoutes.find(r => r.id === selectedRoute.id);
      if (match) return match;
    }
    return filteredRoutes[0] || null;
  }, [selectedRoute, filteredRoutes]);

  // Carousel ref and fluid swipe logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Mouse drag support for desktop
  const isDragging = useRef<boolean>(false);
  const startX = useRef<number>(0);
  const scrollLeftStart = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

  // Synchronize carousel position when route is selected externally (e.g. clicked on map)
  useEffect(() => {
    if (!activeRoute || !carouselRef.current || isProgrammaticScroll.current) return;
    const idx = filteredRoutes.findIndex(r => r.id === activeRoute.id);
    if (idx >= 0 && carouselRef.current.children[idx]) {
      const cardEl = carouselRef.current.children[idx] as HTMLElement;
      isProgrammaticScroll.current = true;
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  }, [activeRoute?.id, filteredRoutes]);

  // Handle user manual scroll / swipe on carousel to select active route in real-time
  const handleCarouselScroll = () => {
    if (isProgrammaticScroll.current || !carouselRef.current) return;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = setTimeout(() => {
      if (!carouselRef.current) return;
      const container = carouselRef.current;
      const centerPos = container.scrollLeft + container.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      Array.from(container.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const elCenter = el.offsetLeft + el.clientWidth / 2;
        const dist = Math.abs(centerPos - elCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      if (filteredRoutes[closestIdx] && filteredRoutes[closestIdx].id !== activeRoute?.id) {
        setSelectedRoute(filteredRoutes[closestIdx]);
      }
    }, 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftStart.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current);
    if (Math.abs(walk) > 6) {
      hasMoved.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  // Modality display text
  const currentModalityObj = useMemo(() => {
    return MOTO_MODALITIES.find(m => m.id === selectedModality);
  }, [selectedModality]);

  // Filtered modalities inside the modal
  const filteredModalities = useMemo(() => {
    if (!modalitySearch.trim()) return MOTO_MODALITIES;
    const q = modalitySearch.toLowerCase();
    return MOTO_MODALITIES.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.category.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  }, [modalitySearch]);

  // Grouped modalities
  const groupedModalities = useMemo(() => {
    const groups: Record<string, MotoModality[]> = {};
    filteredModalities.forEach(m => {
      if (!groups[m.category]) groups[m.category] = [];
      groups[m.category].push(m);
    });
    return groups;
  }, [filteredModalities]);

  return (
    <div className="relative w-full h-[calc(100dvh-60px)] min-h-[550px] overflow-hidden bg-[#0A0908] select-none font-sans">
      
      {/* FULL VIEWPORT MAP (No heavy banners or tables!) */}
      <div className="absolute inset-0 z-0">
        <RouteMap
          route={activeRoute}
          allRoutes={filteredRoutes}
          onSelectRoute={(r) => setSelectedRoute(r)}
          userLocation={pilotLocation}
          onCenterUserLocation={handleDetectGPS}
          showActivityHeatmap={true}
          showCommunityPilots={true}
          externalLayer={currentMapLayer}
          showInternalControls={false}
        />
      </div>

      {/* 1. TOP FLOATING SEARCH & MODALITY BAR (Exact Strava style) */}
      <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 max-w-xl mx-auto z-20 space-y-2 pointer-events-auto">
        
        {/* Main Search Pill */}
        <div className="bg-[#181716]/95 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 sm:p-2 shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex items-center gap-2">
          
          {/* Modality Selector Button (Left Pill with clean Compass icon) */}
          <button
            onClick={() => setShowModalityModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 active:scale-95 text-white transition touch-manipulation border border-white/10 shrink-0"
            title="Filtrar por modalidad"
          >
            <Compass className="w-4 h-4 text-white/90" />
            <span className="text-xs font-medium text-white/90 hidden sm:inline">
              {currentModalityObj ? currentModalityObj.name.split('/')[0] : 'Modalidad'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ash" />
          </button>

          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 px-1 text-white min-w-0">
            <Search className="w-3.5 h-3.5 text-ash shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rutas de moto cerca de ti..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-none truncate font-light"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-ash hover:text-white p-0.5 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* "Guardado" Toggle Pill */}
          <button
            onClick={() => setFilterSavedOnly(!filterSavedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-wider transition shrink-0 touch-manipulation border ${
              filterSavedOnly
                ? 'bg-[#FF5500] text-white border-[#FF5500] shadow-[0_0_12px_rgba(255,85,0,0.4)]'
                : 'bg-black/60 text-white/80 border-white/10 hover:bg-white/10'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filterSavedOnly ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Guardado</span>
            {savedRouteIds.length > 0 && (
              <span className="text-[10px] opacity-75">({savedRouteIds.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. RIGHT VERTICAL FAB STACK */}
      <div className="absolute top-28 sm:top-24 right-3 sm:right-6 z-20 flex flex-col gap-2.5 pointer-events-auto">
        {/* Layer Switcher (Capas: Satélite / Topo / Calles) */}
        <button
          onClick={handleCycleLayers}
          className="relative w-11 h-11 rounded-full bg-[#181716]/90 hover:bg-[#252422] active:scale-95 text-white border border-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl transition touch-manipulation group"
          title={`Cambiar capa de mapa (Actual: ${currentMapLayer})`}
        >
          <Layers className="w-5 h-5 text-white/90 group-hover:text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5500] text-[9px] font-mono font-bold text-white flex items-center justify-center">
            {currentMapLayer === 'satellite' ? '1' : currentMapLayer === 'topo' ? '2' : '3'}
          </span>
        </button>

        {/* Center GPS My Location */}
        <button
          onClick={handleDetectGPS}
          className="w-11 h-11 rounded-full bg-[#181716]/90 hover:bg-[#252422] active:scale-95 text-white border border-white/15 backdrop-blur-md flex items-center justify-center shadow-2xl transition touch-manipulation group"
          title="Centrar en mi ubicación GPS"
        >
          <Crosshair className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* 3. BOTTOM FLOATING ROUTE PREVIEW CAROUSEL (Strava style smooth swipe window, NO arrows) */}
      {filteredRoutes.length > 0 && (
        <div className="absolute bottom-20 left-0 right-0 z-20 pointer-events-auto">
          {/* Horizontal scroll snap track with peek on right edge */}
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-4 sm:px-8 py-2 cursor-grab active:cursor-grabbing select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {filteredRoutes.map((r, idx) => {
              const isActive = activeRoute?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    if (hasMoved.current) return;
                    if (!isActive) {
                      setSelectedRoute(r);
                    } else {
                      setShowDetailModal(true);
                    }
                  }}
                  className={`w-[86vw] sm:w-[420px] max-w-[430px] shrink-0 snap-center transition-all duration-300 transform ${
                    isActive 
                      ? 'scale-[1.01] border-white/30 shadow-[0_20px_45px_rgba(0,0,0,0.95)]' 
                      : 'opacity-75 hover:opacity-100 scale-[0.98] border-white/10'
                  } bg-[#181716]/95 hover:bg-[#201F1D] backdrop-blur-xl border rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 cursor-pointer`}
                >
                  {/* Left: Route Image Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/60 pointer-events-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.coverImage || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80'}
                      alt={r.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Right: Route Details */}
                  <div className="flex-1 min-w-0 pr-1">
                    
                    {/* Title & Bookmark */}
                    <div className="flex items-start justify-between gap-1">
                      <h4 className={`font-sans font-bold text-xs sm:text-sm line-clamp-1 transition ${
                        isActive ? 'text-white' : 'text-stone-300'
                      }`}>
                        {r.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavedRoute(r.id);
                        }}
                        className="p-1 text-ash hover:text-white rounded-lg -mr-1"
                        title="Guardar ruta"
                      >
                        <Bookmark className={`w-4 h-4 ${savedRouteIds.includes(r.id) ? 'fill-[#FF5500] text-[#FF5500]' : 'text-ash'}`} />
                      </button>
                    </div>

                    {/* Stats line with Difficulty badge (Exact Strava style: [Fácil] 4.8 km · 6.4 m · 0 h 29 min) */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-white/80">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        r.difficulty.toLowerCase().includes('fácil') 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : r.difficulty.toLowerCase().includes('inter')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.difficulty.split(' ')[0]}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-white">{r.totalKm} km</span>
                      <span>•</span>
                      <span className="text-cyan-300">+{r.campsite?.elevationMeters || 680} m</span>
                      <span>•</span>
                      <span className="text-ash">~{Math.round(r.totalKm / 35)} h</span>
                    </div>

                    {/* Proximity line (Desde tu ubicación) */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-sans text-stone-300">
                      <Crosshair className="w-3 h-3 text-[#FF5500] shrink-0" />
                      <span className="truncate">
                        Desde tu ubicación {r.distanceFromPilotKm ? `(A ${r.distanceFromPilotKm} km de ti)` : ''}
                      </span>
                    </div>

                    {/* Accent footer tag (Recomendada / Conteo) */}
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5500]">
                        Recomendada
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {idx + 1} de {filteredRoutes.length}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MODALITY BOTTOM SHEET ("Filtrar por modalidad" - Exact Strava screenshot 1) */}
      {showModalityModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setShowModalityModal(false)} />

          {/* Drawer Container */}
          <div className="bg-[#141312] border-t border-white/15 rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl max-w-xl w-full mx-auto animate-slideUp">
            
            {/* Top Drag Handle */}
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-base font-bold text-white font-sans">
                Filtrar por modalidad
              </h3>
              <button
                onClick={() => setShowModalityModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-ash hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input inside modal */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 bg-[#201F1E] border border-white/10 rounded-xl px-3 py-2 text-white">
                <Search className="w-4 h-4 text-ash" />
                <input
                  type="text"
                  value={modalitySearch}
                  onChange={(e) => setModalitySearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-500 focus:outline-none"
                />
                {modalitySearch && (
                  <button onClick={() => setModalitySearch('')} className="text-ash hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modalities List */}
            <div className="overflow-y-auto px-5 py-2 space-y-6 flex-1 divide-y divide-white/5">
              
              {/* Option "Todas las modalidades" */}
              <button
                onClick={() => {
                  setSelectedModality('all');
                  setShowModalityModal(false);
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.04] text-left group transition"
              >
                <div>
                  <p className={`text-sm font-medium ${selectedModality === 'all' ? 'text-[#FF5500] font-bold' : 'text-white'}`}>
                    Todas las modalidades
                  </p>
                  <p className="text-xs text-ash">Explorar cualquier estilo de ruta y moto</p>
                </div>
                {selectedModality === 'all' && (
                  <Check className="w-5 h-5 text-[#FF5500]" />
                )}
              </button>

              {/* Grouped Modalities */}
              {Object.entries(groupedModalities).map(([category, items]) => (
                <div key={category} className="pt-4">
                  <p className="text-xs font-bold font-sans text-stone-400 mb-2 uppercase tracking-wider px-3">
                    {category}
                  </p>
                  <div className="space-y-1">
                    {items.map(m => {
                      const isSelected = selectedModality === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModality(m.id);
                            setShowModalityModal(false);
                          }}
                          className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/[0.04] transition group text-left"
                        >
                          <div className="min-w-0 pr-2">
                            <p className={`text-sm font-medium ${isSelected ? 'text-[#FF5500] font-bold' : 'text-white'}`}>
                              {m.name}
                            </p>
                            <p className="text-xs text-ash truncate">{m.description}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-5 h-5 text-[#FF5500] shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>

          </div>
        </div>
      )}

      {/* 5. ROUTE DETAIL MODAL (Opens when clicking the bottom card) */}
      {showDetailModal && activeRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#141312] border border-white/20 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Modal Header Image */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={activeRoute.coverImage || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80'} 
                alt={activeRoute.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141312] via-black/40 to-transparent" />
              
              <button 
                onClick={() => setShowDetailModal(false)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#FF5500] text-white">
                  {activeRoute.difficulty}
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-white mt-1">
                  {activeRoute.title}
                </h3>
                <p className="text-xs text-stone-300 font-mono flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                  {activeRoute.destination}, {activeRoute.state}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 flex-1">
              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-2 bg-black/50 border border-white/10 rounded-xl p-3 text-center font-mono">
                <div>
                  <p className="text-[10px] text-ash uppercase">Distancia</p>
                  <p className="text-sm font-bold text-white">{activeRoute.totalKm} km</p>
                </div>
                <div>
                  <p className="text-[10px] text-ash uppercase">Terreno</p>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-earth" title="Montaña / Terracería">
                      <Mountain className="w-3 h-3 text-earth shrink-0" />
                      <span>{activeRoute.offroadPercentage}%</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-white" title="Carretera / Asfalto">
                      <RoadIcon className="w-3 h-3 text-white shrink-0" />
                      <span>{activeRoute.asphaltPercentage || (100 - activeRoute.offroadPercentage)}%</span>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-ash uppercase">Desnivel</p>
                  <p className="text-sm font-bold text-cyan-300">+{activeRoute.campsite?.elevationMeters || 680}m</p>
                </div>
                <div>
                  <p className="text-[10px] text-ash uppercase">Tiempo Est.</p>
                  <p className="text-sm font-bold text-white">~{Math.round(activeRoute.totalKm / 35)} h</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-mono uppercase text-ash tracking-wider mb-1">Descripción de Ruta</p>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  {activeRoute.description}
                </p>
              </div>

              {/* Waypoints if present */}
              {activeRoute.waypoints && activeRoute.waypoints.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase text-ash tracking-wider mb-2">Paradas & Waypoints en Orden</p>
                  <div className="space-y-1.5">
                    {activeRoute.waypoints.map((wp, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate">{wp.name}</p>
                          {wp.notes && <p className="text-[11px] text-ash truncate">{wp.notes}</p>}
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 uppercase">{wp.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    const url = buildOrderedGoogleMapsUrl(activeRoute);
                    window.open(url, '_blank');
                  }}
                  className="flex-1 bg-[#FF5500] hover:bg-[#e04a00] text-white font-mono text-xs uppercase font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xl"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-75" />
                </button>

                <button
                  onClick={() => {
                    setSaveRouteModal(activeRoute);
                  }}
                  className="bg-black/60 hover:bg-white/10 text-white border border-white/20 font-mono text-xs uppercase font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Bookmark className="w-4 h-4 text-[#FF5500]" />
                  <span>Guardar</span>
                </button>

                <button
                  onClick={() => {
                    setShareRoute(activeRoute);
                  }}
                  className="bg-black/60 hover:bg-white/10 text-white border border-white/20 font-mono text-xs uppercase font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Share2 className="w-4 h-4 text-ash" />
                  <span>Compartir</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Share & Save modals */}
      {shareRoute && (
        <ShareRouteModal isOpen={!!shareRoute} route={shareRoute} onClose={() => setShareRoute(null)} />
      )}
      {saveRouteModal && (
        <SaveToListModal isOpen={!!saveRouteModal} route={saveRouteModal} onClose={() => setSaveRouteModal(null)} />
      )}

    </div>
  );
};
