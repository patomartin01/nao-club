'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Navigation, 
  MapPin, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Sparkles,
  Compass,
  Mountain,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Clock,
  Sun,
  Moon
} from 'lucide-react';
import { Rodada, RouteProposal, User, Waypoint, WaypointType } from '../../types';
import { buildDynamicRouteGoogleMapsUrl } from '../../utils/googleMaps';
import { PlaceAutocompleteInput, PlaceResult } from './PlaceAutocompleteInput';

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

export interface StepByStepRodadaModalProps {
  isOpen: boolean;
  mode: 'alternative' | 'convoke' | 'edit';
  activeRodada?: Rodada | null;
  currentUser: User;
  initialProposal?: RouteProposal | null;
  onClose: () => void;
  onSubmitAlternative?: (
    proposal: Omit<RouteProposal, 'id' | 'votes' | 'comments'>,
    dateConfig?: { mode: 'current' | 'custom' | 'tbd'; startDate?: string; endDate?: string }
  ) => void;
  onSubmitConvoke?: (data: {
    title: string;
    subtitle: string;
    description: string;
    category: Rodada['category'];
    startDate: string;
    endDate: string;
    originPoint: string;
    proposal?: Omit<RouteProposal, 'id' | 'votes' | 'comments'>;
  }) => void;
  onUpdateProposal?: (routeId: string, updates: Partial<RouteProposal>) => void;
  formatHumanDate: (start: string, end?: string, includeYear?: boolean) => string;
}

interface IntermediateStop {
  id: string;
  name: string;
  type: WaypointType;
  description: string;
  lat?: number;
  lng?: number;
}

export const StepByStepRodadaModal: React.FC<StepByStepRodadaModalProps> = ({
  isOpen,
  mode,
  activeRodada,
  currentUser,
  initialProposal,
  onClose,
  onSubmitAlternative,
  onSubmitConvoke,
  onUpdateProposal,
  formatHumanDate
}) => {
  // Step 1 to 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(mode === 'edit' ? 2 : 1);

  // Direction for transition effect
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Step 1: Fecha (Inicio y Fin directos)
  const [dateSelection, setDateSelection] = useState<'current' | 'custom' | 'tbd'>(
    mode === 'alternative' && activeRodada ? 'current' : 'custom'
  );
  const [customStartDate, setCustomStartDate] = useState(
    activeRodada ? activeRodada.startDate : new Date().toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    activeRodada ? (activeRodada.endDate || activeRodada.startDate) : new Date().toISOString().split('T')[0]
  );

  const handleStartDateChange = (val: string) => {
    setCustomStartDate(val);
    if (!customEndDate || customEndDate < val) {
      setCustomEndDate(val);
    }
  };

  // Step 2: Ruta y Paradas (Google Maps Places)
  const [origin, setOrigin] = useState(
    initialProposal?.waypoints?.find(w => w.type === 'start')?.name || activeRodada?.originPoint || 'Interlomas'
  );
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({
    lat: initialProposal?.waypoints?.find(w => w.type === 'start')?.lat || 19.3985,
    lng: initialProposal?.waypoints?.find(w => w.type === 'start')?.lng || -99.2783
  });
  const [destination, setDestination] = useState(
    initialProposal?.destination || activeRodada?.title || ''
  );
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }>({
    lat: initialProposal?.waypoints?.find(w => w.type === 'end' || w.type === 'camp')?.lat || 20.2154,
    lng: initialProposal?.waypoints?.find(w => w.type === 'end' || w.type === 'camp')?.lng || -98.7310
  });
  const [stops, setStops] = useState<IntermediateStop[]>(() => {
    if (initialProposal?.waypoints) {
      return initialProposal.waypoints
        .filter(w => w.type !== 'start' && w.type !== 'end' && w.type !== 'camp')
        .map((w, i) => ({
          id: w.id || `stop-${i}-${Date.now()}`,
          name: w.name,
          type: w.type || 'stop',
          description: w.notes || w.description || '',
          lat: w.lat,
          lng: w.lng
        }));
    }
    return [];
  });
  const [draggedStopIndex, setDraggedStopIndex] = useState<number | null>(null);

  // Step 3: Ritmo, Dificultad & Hora
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [timeHour, setTimeHour] = useState('07');
  const [timeMinute, setTimeMinute] = useState('30');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [difficulty, setDifficulty] = useState<RouteProposal['difficulty']>(
    initialProposal?.difficulty || 'Intermedio'
  );
  const [offroadPercentage, setOffroadPercentage] = useState(
    initialProposal?.offroadPercentage ?? 30
  );

  // Sincronizar hora seleccionada al cambiar componentes
  const updateCustomTime = (newH: string, newM: string, newP: 'AM' | 'PM') => {
    setTimeHour(newH);
    setTimeMinute(newM);
    setTimePeriod(newP);
    setDepartureTime(`${newH}:${newM} ${newP}`);
  };

  const applyPresetTime = (timeStr: string) => {
    setDepartureTime(timeStr);
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      setTimeHour(match[1].padStart(2, '0'));
      setTimeMinute(match[2]);
      setTimePeriod((match[3]?.toUpperCase() || 'AM') as 'AM' | 'PM');
    }
  };

  // Step 4: Nombre y Resumen
  const [title, setTitle] = useState(initialProposal?.title || '');
  const [summary, setSummary] = useState(initialProposal?.description || '');

  // Cargar datos si initialProposal cambia
  useEffect(() => {
    if (initialProposal) {
      setTitle(initialProposal.title || '');
      setSummary(initialProposal.description || '');
      setDestination(initialProposal.destination || '');
      setOffroadPercentage(initialProposal.offroadPercentage ?? 30);
      setDifficulty(initialProposal.difficulty || 'Intermedio');
      
      const startWp = initialProposal.waypoints?.find(w => w.type === 'start');
      if (startWp) {
        setOrigin(startWp.name);
        if (startWp.lat && startWp.lng) setOriginCoords({ lat: startWp.lat, lng: startWp.lng });
        if (startWp.notes && startWp.notes.includes('Salida ')) {
          applyPresetTime(startWp.notes.replace('Salida ', '').trim());
        }
      }

      const destWp = initialProposal.waypoints?.find(w => w.type === 'end' || w.type === 'camp');
      if (destWp && destWp.lat && destWp.lng) {
        setDestinationCoords({ lat: destWp.lat, lng: destWp.lng });
      }

      if (initialProposal.waypoints) {
        const intermediate = initialProposal.waypoints
          .filter(w => w.type !== 'start' && w.type !== 'end' && w.type !== 'camp')
          .map((w, i) => ({
            id: w.id || `stop-${i}-${Date.now()}`,
            name: w.name,
            type: w.type || 'stop',
            description: w.notes || w.description || '',
            lat: w.lat,
            lng: w.lng
          }));
        setStops(intermediate);
      }
    }
  }, [initialProposal]);

  // Auto-generate title if empty and not in edit mode
  useEffect(() => {
    if (mode !== 'edit' && (!title || title.startsWith('Ruta'))) {
      if (destination) {
        const stopsSnippet = stops.length > 0 ? `${stops[0].name} & ` : '';
        setTitle(`Ruta ${stopsSnippet}${destination}`);
      }
    }
  }, [destination, stops, mode]);

  if (!isOpen) return null;

  // Build sequential Google Maps link
  const previewMapsUrl = buildDynamicRouteGoogleMapsUrl(
    origin,
    stops.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })),
    destination,
    originCoords,
    destinationCoords
  );

  const handleNext = () => {
    if (step < 4) {
      setDirection('forward');
      setStep((step + 1) as any);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection('backward');
      setStep((step - 1) as any);
    }
  };

  // Paradas intermedias
  const handleAddStop = () => {
    const newStop: IntermediateStop = {
      id: `stop-${Date.now()}`,
      name: '',
      type: 'food',
      description: ''
    };
    setStops(prev => [...prev, newStop]);
  };

  const handleUpdateStop = (id: string, updates: Partial<IntermediateStop>) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveStopUp = (index: number) => {
    setStops(prev => {
      if (index === 0) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveStopDown = (index: number) => {
    setStops(prev => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedStopIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedStopIndex === null || draggedStopIndex === targetIndex) return;
    setStops(prev => {
      const copy = [...prev];
      const [movedItem] = copy.splice(draggedStopIndex, 1);
      copy.splice(targetIndex, 0, movedItem);
      return copy;
    });
    setDraggedStopIndex(null);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct Waypoints with real or computed coordinates
    const allWaypoints: Waypoint[] = [
      {
        id: `wp-origin-${Date.now()}`,
        name: origin,
        lat: originCoords.lat,
        lng: originCoords.lng,
        type: 'start',
        notes: `Salida ${departureTime}`
      },
      ...stops.filter(s => s.name.trim()).map((s, idx) => ({
        id: `wp-stop-${idx}-${Date.now()}`,
        name: s.name.trim(),
        lat: s.lat || (19.8000 + idx * 0.1),
        lng: s.lng || (-99.0000 - idx * 0.1),
        type: s.type,
        notes: s.description.trim() || undefined,
        description: s.description.trim() || undefined
      })),
      {
        id: `wp-dest-${Date.now()}`,
        name: destination || 'Destino',
        lat: destinationCoords.lat,
        lng: destinationCoords.lng,
        type: 'camp',
        notes: 'Llegada'
      }
    ];

    const proposalObj: Omit<RouteProposal, 'id' | 'votes' | 'comments'> = {
      rodadaId: activeRodada?.id || `rodada-${Date.now()}`,
      title: title.trim() || `Ruta a ${destination}`,
      destination: destination.trim() || 'Destino',
      state: 'México',
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: summary.trim() || `Salida puntual a las ${departureTime} desde ${origin}. Nivel ${difficulty}.`,
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
      totalKm: 130 + stops.length * 20,
      estimatedHours: '4h 30m',
      offroadPercentage,
      asphaltPercentage: Math.max(0, 100 - offroadPercentage),
      difficulty,
      campsite: {
        name: destination || 'Punto Final',
        elevationMeters: 2600,
        minTempNight: '8°C',
        security: 'Comunitario / Seguro',
        amenities: ['Comida local', 'Gasolina cercana']
      },
      itinerary: [
        {
          day: 1,
          title: `Travesía hacia ${destination}`,
          description: summary || 'Rodada en grupo con paradas programadas.',
          distanceKm: 130 + stops.length * 20,
          offroadKm: Math.round(((130 + stops.length * 20) * offroadPercentage) / 100),
          terrainType: `${100 - offroadPercentage}% asfalto / ${offroadPercentage}% terracería`
        }
      ],
      waypoints: allWaypoints,
      coordinates: [
        [originCoords.lat, originCoords.lng],
        ...stops.filter(s => s.lat && s.lng).map(s => [s.lat!, s.lng!] as [number, number]),
        [destinationCoords.lat, destinationCoords.lng]
      ],
      downvotes: [],
      dayOfDeadVibe: 'Camaradería de tribu',
      safetyTips: ['Tanque lleno', 'Revisar presiones']
    };

    if (mode === 'edit' && initialProposal) {
      onUpdateProposal?.(initialProposal.id, {
        title: title.trim() || initialProposal.title,
        destination: destination.trim() || initialProposal.destination,
        description: summary.trim() || initialProposal.description,
        difficulty,
        offroadPercentage,
        asphaltPercentage: Math.max(0, 100 - offroadPercentage),
        totalKm: 130 + stops.length * 20,
        waypoints: allWaypoints,
        coordinates: [
          [originCoords.lat, originCoords.lng],
          ...stops.filter(s => s.lat && s.lng).map(s => [s.lat!, s.lng!] as [number, number]),
          [destinationCoords.lat, destinationCoords.lng]
        ],
        itinerary: [
          {
            day: 1,
            title: `Travesía hacia ${destination}`,
            description: summary || 'Rodada en grupo con paradas programadas.',
            distanceKm: 130 + stops.length * 20,
            offroadKm: Math.round(((130 + stops.length * 20) * offroadPercentage) / 100),
            terrainType: `${100 - offroadPercentage}% asfalto / ${offroadPercentage}% terracería`
          }
        ]
      });
    } else if (mode === 'alternative') {
      const dateConfig = {
        mode: dateSelection,
        startDate: dateSelection === 'custom' ? customStartDate : undefined,
        endDate: dateSelection === 'custom' ? customEndDate : undefined
      };
      onSubmitAlternative?.(proposalObj, dateConfig);
    } else {
      onSubmitConvoke?.({
        title: destination || title,
        subtitle: `Travesía desde ${origin} con ${stops.length} parada(s)`,
        description: summary || `Rodada oficial convocada por ${currentUser.name}. Salida ${departureTime}.`,
        category: (dateSelection === 'custom' && customStartDate !== customEndDate) ? 'Puente / Expedición Multi-días' : 'Fin de Semana',
        startDate: dateSelection === 'custom' ? customStartDate : (activeRodada?.startDate || new Date().toISOString().split('T')[0]),
        endDate: dateSelection === 'custom' ? customEndDate : (activeRodada?.endDate || activeRodada?.startDate || new Date().toISOString().split('T')[0]),
        originPoint: origin,
        proposal: proposalObj
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-fadeIn">
      <div className="relative border border-[#1A1918]/10 bg-[#FAF6ED] max-w-lg w-full max-h-[90dvh] flex flex-col font-sans text-[#1A1918] shadow-sm rounded-[28px] overflow-hidden animate-scaleUp">
        
        {/* Top Header: Step Indicator & Close - Pinned */}
        <div className="shrink-0 px-6 pt-5 pb-3.5 border-b border-[#1A1918]/10 bg-[#F4EEDB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-semibold text-[#E6332A] tracking-widest">
                {mode === 'edit' ? 'EDITAR RUTA' : mode === 'alternative' ? 'ALTERNATIVA' : 'CONVOCAR RODADA'}
              </span>
              <span className="text-[#1A1918]/30 text-[10px]">•</span>
              <span className="text-[10px] text-[#1A1918]/70 font-mono font-bold uppercase tracking-wider">
                {mode === 'edit' ? `Paso ${step} de 4` : `Paso ${step} de 4`}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-[#1A1918] hover:bg-[#E6332A] hover:text-white p-1.5 rounded-xl border border-[#1A1918]/10 bg-[#FAF6ED] transition shadow-sm"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Minimal Progress Dashes */}
          <div className="grid grid-cols-4 gap-2 mt-3.5">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full border border-[#1A1918]/10 transition-all duration-300 ${
                  s <= step ? 'bg-[#E6332A]' : 'bg-[#FAF6ED]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-32 sm:pb-36 space-y-4">
          
          {/* PASO 1: ¿CUÁNDO RODAMOS? */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-semibold text-2xl text-[#1A1918]  ">
                  ¿Cuándo rodamos?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-sans font-medium">
                  Elige la fecha para salir a la ruta.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Opción A: Convocatoria activa */}
                {mode === 'alternative' && activeRodada && (
                  <button
                    type="button"
                    onClick={() => setDateSelection('current')}
                    className={`w-full p-4 text-left border rounded-2xl transition flex items-center justify-between shadow-sm ${
                      dateSelection === 'current'
                        ? 'border-[#1A1918]/10 bg-[#F7B32B] text-[#1A1918]'
                        : 'border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-sans font-semibold block  ">
                        Para la fecha activa
                      </span>
                      <span className="text-[11px] font-sans text-[#1A1918]/70 font-medium">
                        {formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}
                      </span>
                    </div>
                    {dateSelection === 'current' && <span className="text-[#1A1918] text-xs font-semibold font-mono">✓</span>}
                  </button>
                )}

                {/* Opción B: Elegir fechas (Inicio y Fin) */}
                <div
                  onClick={() => setDateSelection('custom')}
                  className={`w-full p-4 border rounded-2xl transition cursor-pointer shadow-sm ${
                    dateSelection === 'custom'
                      ? 'border-[#1A1918]/10 bg-[#FAF6ED] ring-2 ring-[#E6332A]'
                      : 'border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-sans font-semibold block text-[#1A1918] ">
                      {mode === 'alternative' ? 'Proponer otra fecha' : 'Elegir fecha de la rodada'}
                    </span>
                    {dateSelection === 'custom' && <span className="text-[#E6332A] text-xs font-semibold font-mono">✓</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="text-[10px] text-[#1A1918]/70 uppercase font-sans font-semibold block mb-1">
                        Inicio
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        onClick={(e) => {
                          try {
                            (e.currentTarget as any).showPicker?.();
                          } catch {}
                        }}
                        className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 hover:border-[#E6332A] focus:border-[#E6332A] px-3 py-2 text-xs text-[#1A1918] focus:outline-none cursor-pointer rounded-xl font-bold shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#1A1918]/70 uppercase font-sans font-semibold block mb-1">
                        Fin
                      </label>
                      <input
                        type="date"
                        min={customStartDate}
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        onClick={(e) => {
                          try {
                            (e.currentTarget as any).showPicker?.();
                          } catch {}
                        }}
                        className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 hover:border-[#E6332A] focus:border-[#E6332A] px-3 py-2 text-xs text-[#1A1918] focus:outline-none cursor-pointer rounded-xl font-bold shadow-sm"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1A1918]/70 font-sans mt-2.5 font-medium">
                    {customStartDate === customEndDate ? (
                      <span>Rodada de 1 solo día ({formatHumanDate(customStartDate, undefined, true)}).</span>
                    ) : (
                      <span>Expedición ({formatHumanDate(customStartDate, customEndDate, true)}).</span>
                    )}
                  </p>
                </div>

                {/* Opción C: Por definir */}
                <button
                  type="button"
                  onClick={() => setDateSelection('tbd')}
                  className={`w-full p-4 text-left border rounded-2xl transition flex items-center justify-between shadow-sm ${
                    dateSelection === 'tbd'
                      ? 'border-[#1A1918]/10 bg-[#F7B32B] text-[#1A1918]'
                      : 'border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-sans font-semibold block  ">
                      Fecha por definir
                    </span>
                    <span className="text-[11px] font-sans text-[#1A1918]/70 font-medium">
                      Decidir la fecha después en el chat con la tribu.
                    </span>
                  </div>
                  {dateSelection === 'tbd' && <span className="text-[#1A1918] text-xs font-semibold font-mono">✓</span>}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: ¿A DÓNDE Y QUÉ PARADAS? */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-semibold text-2xl text-[#1A1918]  ">
                  ¿Hacia dónde rodamos?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-sans font-medium">
                  Punto de salida, paradas intermedias en el camino y destino final.
                </p>
              </div>

              {/* 1. Salida / Origen */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A1918] inline-block" />
                  <span className="text-[10px] font-sans uppercase font-semibold text-[#E6332A] tracking-wider">
                    1. ¿De dónde salimos? (Punto de Salida)
                  </span>
                </div>
                <PlaceAutocompleteInput
                  value={origin}
                  onChange={setOrigin}
                  onSelectPlace={(p) => {
                    setOrigin(p.name);
                    setOriginCoords({ lat: p.lat, lng: p.lng });
                  }}
                  placeholder="Escribe para buscar en Maps (ej. Interlomas, Caseta Tlalpan)..."
                />
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[
                    { label: 'Interlomas', full: 'Interlomas, Huixquilucan, Méx.', lat: 19.3985, lng: -99.2783 },
                    { label: 'Caseta Tlalpan', full: 'Caseta Tlalpan (México - Cuernavaca), CDMX', lat: 19.2632, lng: -99.1627 },
                    { label: 'Perisur', full: 'Perisur, Coyoacán, CDMX', lat: 19.3044, lng: -99.1895 },
                    { label: 'Santa Fe', full: 'Santa Fe (Samara Shops), CDMX', lat: 19.3601, lng: -99.2608 }
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setOrigin(chip.full);
                        setOriginCoords({ lat: chip.lat, lng: chip.lng });
                      }}
                      className="text-[10px] px-2.5 py-1 border border-[#1A1918]/10 bg-[#FAF6ED] hover:bg-[#F7B32B] text-[#1A1918] font-sans font-semibold uppercase rounded-lg transition shadow-sm"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PARADAS INTERMEDIAS */}
              <div className="space-y-2.5 pt-3 border-t border-b border-[#1A1918]/10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F7B32B] border border-[#1A1918]/10 inline-block" />
                    <span className="text-[10px] font-sans uppercase font-semibold text-[#1A1918] tracking-wider">
                      Paradas en el camino ({stops.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-1 bg-[#1A1918] hover:bg-[#E6332A] text-white text-[11px] font-sans font-semibold flex items-center gap-1.5 rounded-xl transition shadow-sm active:shadow-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir parada</span>
                  </button>
                </div>

                {stops.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="w-full py-3 px-3 border border-dashed border-[#1A1918]/40 hover:border-[#1A1918] hover:bg-[#FAF6ED] text-[#1A1918]/70 hover:text-[#1A1918] transition flex items-center justify-center gap-2 text-xs font-sans rounded-2xl bg-[#F4EEDB] font-medium"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>Añadir parada intermedia (desayuno, gasolina, mirador...)</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    {stops.map((stop, i) => (
                      <div 
                        key={stop.id} 
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(i)}
                        className={`p-3.5 border rounded-2xl bg-[#FAF6ED] space-y-2.5 transition shadow-sm ${
                          draggedStopIndex === i 
                            ? 'border-[#1A1918]/10 bg-[#F7B32B] opacity-70' 
                            : 'border-[#1A1918]/10'
                        }`}
                      >
                        {/* Header de la parada */}
                        <div className="flex items-center justify-between gap-2 border-b border-[#1A1918]/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-grab active:cursor-grabbing text-[#1A1918] p-0.5" 
                              title="Arrastra para reordenar parada"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-sans font-semibold text-[#1A1918] ">
                              Parada {i + 1} de {stops.length}
                            </span>
                            
                            {stops.length > 1 && (
                              <div className="flex items-center gap-1 ml-1.5">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() => handleMoveStopUp(i)}
                                  title="Mover parada antes"
                                  className="px-2 py-0.5 border border-[#1A1918]/10 hover:bg-[#F7B32B] bg-[#FAF6ED] text-[10px] text-[#1A1918] disabled:opacity-20 flex items-center gap-0.5 transition rounded-md font-bold"
                                >
                                  <ArrowUp className="w-3 h-3 text-[#1A1918]" />
                                  <span className="text-[9px] font-semibold uppercase hidden sm:inline">Subir</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={i === stops.length - 1}
                                  onClick={() => handleMoveStopDown(i)}
                                  title="Mover parada después"
                                  className="px-2 py-0.5 border border-[#1A1918]/10 hover:bg-[#F7B32B] bg-[#FAF6ED] text-[10px] text-[#1A1918] disabled:opacity-20 flex items-center gap-0.5 transition rounded-md font-bold"
                                >
                                  <ArrowDown className="w-3 h-3 text-[#1A1918]" />
                                  <span className="text-[9px] font-semibold uppercase hidden sm:inline">Bajar</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            className="text-[#E6332A] hover:text-black p-1 hover:bg-[#F4EEDB] transition rounded-lg"
                            title="Eliminar parada"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Buscador de Maps para la parada */}
                        <div>
                          <PlaceAutocompleteInput
                            value={stop.name}
                            onChange={(val) => handleUpdateStop(stop.id, { name: val })}
                            onSelectPlace={(p) => {
                              handleUpdateStop(stop.id, { name: p.name, lat: p.lat, lng: p.lng });
                            }}
                            placeholder="Buscar punto o lugar en Maps (ej. Hacienda Sta. María)..."
                          />
                        </div>

                        {/* Nota o plan */}
                        <div>
                          <span className="text-[9px] uppercase font-sans font-semibold text-[#1A1918]/70 block mb-1">
                            Nota o plan de la parada (opcional)
                          </span>
                          <input
                            type="text"
                            placeholder="Ej. Desayuno de cecina, ver la hacienda, cargar gasolina..."
                            value={stop.description}
                            onChange={(e) => handleUpdateStop(stop.id, { description: e.target.value })}
                            className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] placeholder-[#1A1918]/50 rounded-xl shadow-sm font-medium"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="w-full py-2 border border-dashed border-[#1A1918]/40 hover:border-[#1A1918] text-[10px] text-[#1A1918] hover:bg-[#FAF6ED] font-sans font-semibold uppercase tracking-wider transition flex items-center justify-center gap-1 rounded-xl bg-[#F4EEDB]"
                    >
                      <Plus className="w-3 h-3 text-[#E6332A]" />
                      <span>Añadir otra parada en el camino</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Destino Final */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] inline-block" />
                  <span className="text-[10px] font-sans uppercase font-semibold text-[#E6332A] tracking-wider">
                    2. ¿A dónde llegamos? (Destino Final)
                  </span>
                </div>
                <PlaceAutocompleteInput
                  value={destination}
                  onChange={setDestination}
                  dropUp={true}
                  onSelectPlace={(p) => {
                    setDestination(p.name);
                    setDestinationCoords({ lat: p.lat, lng: p.lng });
                  }}
                  placeholder="Escribe para buscar en Maps (ej. Mineral del Chico, Valle de Bravo)..."
                />
              </div>

              {/* Link minimalista a Google Maps */}
              {destination.trim() && (
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-[#1A1918]/10">
                  <span className="text-[#1A1918]/70 font-sans font-medium">Ruta conectada:</span>
                  <a
                    href={previewMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E6332A] hover:text-[#1A1918] font-sans font-semibold flex items-center gap-1.5 transition "
                  >
                    <span>Probar en Google Maps ↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: ¿QUÉ RITMO Y A QUÉ HORA? */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-semibold text-2xl text-[#1A1918]  ">
                  ¿Qué ritmo y hora?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-sans font-medium">
                  Dificultad técnica, horario y terreno.
                </p>
              </div>

              {/* Selector de Dificultad */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-sans font-semibold text-[#1A1918]/70 tracking-wider block">
                  Dificultad del trazado
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Fácil (Fluida)', label: 'Fácil', sub: 'Asfalto y brecha lisa' },
                    { id: 'Intermedio', label: 'Intermedio', sub: 'Curvas y grava' },
                    { id: 'Avanzado / Técnico', label: 'Avanzado', sub: 'Piedra y zanjas' },
                    { id: 'Desconocido / Por explorar', label: 'Desconocido', sub: 'Aventura a explorar' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDifficulty(lvl.id as any)}
                      className={`p-3 text-left border rounded-2xl transition shadow-sm ${
                        difficulty === lvl.id
                          ? 'border-[#1A1918]/10 bg-[#F7B32B] text-[#1A1918]'
                          : 'border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                      }`}
                    >
                      <span className="text-xs font-sans font-semibold block  ">{lvl.label}</span>
                      <span className="text-[10px] text-[#1A1918]/70 block mt-0.5 font-sans font-medium">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora de Salida Dinámica, Libre e Interactiva */}
              <div className="border border-[#1A1918]/10 bg-[#FAF6ED] p-3.5 sm:p-4 rounded-2xl space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-sans font-semibold text-[#1A1918]/80 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>Hora de salida</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-sans text-[#1A1918]/60">Elegida:</span>
                    <span className="text-sm font-mono font-semibold text-[#E6332A] bg-white px-2.5 py-0.5 rounded-lg border border-[#1A1918]/10 shadow-sm">
                      {departureTime}
                    </span>
                  </div>
                </div>

                {/* Selector interactivo estilo reloj: Hora, Minutos y AM/PM */}
                <div className="bg-[#F4EEDB] border border-[#1A1918]/10 p-3 rounded-xl shadow-sm">
                  <div className="text-[9px] uppercase font-mono font-bold text-[#1A1918]/60 tracking-wider mb-2">
                    Ajuste fino (Cualquier horario del día)
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {/* Hora selector */}
                    <div className="flex flex-col items-center">
                      <label className="text-[9px] font-mono text-[#1A1918]/60 uppercase mb-0.5">Hora</label>
                      <select
                        value={timeHour}
                        onChange={(e) => updateCustomTime(e.target.value, timeMinute, timePeriod)}
                        className="bg-white border border-[#1A1918]/10 rounded-xl px-2.5 py-1.5 text-base sm:text-lg font-mono font-semibold text-[#1A1918] shadow-sm focus:outline-none focus:border-[#E6332A] cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xl font-mono font-semibold text-[#1A1918] mt-3">:</span>

                    {/* Minutos selector (cada 5 min o libre) */}
                    <div className="flex flex-col items-center">
                      <label className="text-[9px] font-mono text-[#1A1918]/60 uppercase mb-0.5">Minutos</label>
                      <select
                        value={timeMinute}
                        onChange={(e) => updateCustomTime(timeHour, e.target.value, timePeriod)}
                        className="bg-white border border-[#1A1918]/10 rounded-xl px-2.5 py-1.5 text-base sm:text-lg font-mono font-semibold text-[#1A1918] shadow-sm focus:outline-none focus:border-[#E6332A] cursor-pointer"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* AM / PM Toggle */}
                    <div className="flex flex-col items-center ml-1">
                      <label className="text-[9px] font-mono text-[#1A1918]/60 uppercase mb-0.5">Periodo</label>
                      <div className="flex border border-[#1A1918]/10 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => updateCustomTime(timeHour, timeMinute, 'AM')}
                          className={`px-3 py-1.5 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1 ${
                            timePeriod === 'AM'
                              ? 'bg-[#E6332A] text-white'
                              : 'bg-white text-[#1A1918] hover:bg-[#F4EEDB]'
                          }`}
                        >
                          <Sun className="w-3 h-3" />
                          <span>AM</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCustomTime(timeHour, timeMinute, 'PM')}
                          className={`px-3 py-1.5 text-xs font-mono font-semibold transition cursor-pointer flex items-center gap-1 border-l border-[#1A1918]/10 ${
                            timePeriod === 'PM'
                              ? 'bg-[#1A1918] text-[#F7B32B]'
                              : 'bg-white text-[#1A1918] hover:bg-[#F4EEDB]'
                          }`}
                        >
                          <Moon className="w-3 h-3" />
                          <span>PM</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accesos rápidos y frecuentes */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono font-bold text-[#1A1918]/60 tracking-wider">
                      Horarios frecuentes recomendados
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { t: '06:00 AM', label: '06:00 AM' },
                      { t: '06:30 AM', label: '06:30 AM' },
                      { t: '07:00 AM', label: '07:00 AM' },
                      { t: '07:30 AM', label: '07:30 AM' },
                      { t: '08:00 AM', label: '08:00 AM' },
                      { t: '08:30 AM', label: '08:30 AM' },
                      { t: '09:00 AM', label: '09:00 AM' },
                      { t: '09:30 AM', label: '09:30 AM' },
                      { t: '10:00 AM', label: '10:00 AM' },
                      { t: '11:00 AM', label: '11:00 AM' },
                      { t: '04:00 PM', label: '04:00 PM' },
                      { t: '06:00 PM', label: '06:00 PM' }
                    ].map(({ t, label }) => {
                      const isSelected = departureTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => applyPresetTime(t)}
                          className={`py-1 px-1.5 text-[10px] font-mono rounded-lg border transition text-center shadow-sm cursor-pointer ${
                            isSelected
                              ? 'border-[#1A1918]/10 bg-[#E6332A] text-white font-semibold scale-102'
                              : 'border-[#1A1918]/10 bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB] font-bold'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Slider de Superficie: Asfalto a la izquierda, Terracería a la derecha */}
              <div className="border border-[#1A1918]/10 bg-[#FAF6ED] p-4 rounded-2xl space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-sans font-semibold text-[#1A1918]/70 tracking-wider">Superficie de la ruta</span>
                  <span className="text-xs font-mono font-semibold text-[#1A1918] bg-[#F4EEDB] px-2.5 py-0.5 rounded-lg border border-[#1A1918]/10 shadow-xs">
                    <span className="text-[#1A1918] font-bold">{100 - offroadPercentage}% Asfalto</span>
                    <span className="text-[#1A1918]/40 mx-1.5">•</span>
                    <span className="text-[#E06423] font-bold">{offroadPercentage}% Terracería</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-[#1A1918]" title="Carretera / Asfalto">
                    <RoadIcon className="w-4 h-4 text-[#1A1918] shrink-0" />
                    <span className="text-[10px] font-sans uppercase font-bold text-[#1A1918]">Asfalto</span>
                  </div>

                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={offroadPercentage}
                      onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                      className="w-full accent-[#E06423] cursor-pointer h-2 bg-[#F4EEDB] rounded-lg border border-[#1A1918]/10"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-[#E06423]" title="Terracería / Montaña">
                    <Mountain className="w-4 h-4 text-[#E06423] shrink-0" />
                    <span className="text-[10px] font-sans uppercase font-bold text-[#E06423]">Terracería</span>
                  </div>
                </div>

                {/* Accesos rápidos de superficie */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {[
                    { label: '100% Asfalto', val: 0 },
                    { label: '70% / 30%', val: 30 },
                    { label: '50% / 50%', val: 50 },
                    { label: '100% Brecha', val: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setOffroadPercentage(preset.val)}
                      className={`py-1 px-1 text-[9px] font-mono rounded-lg border transition text-center shadow-xs cursor-pointer ${
                        offroadPercentage === preset.val
                          ? 'bg-[#1A1918] text-[#FAF6ED] border-[#1A1918] font-bold'
                          : 'bg-[#F4EEDB] text-[#1A1918]/70 hover:text-[#1A1918] hover:bg-[#FAF6ED] border-[#1A1918]/10 font-semibold'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-[9px] font-mono text-[#1A1918]/50 px-1 pt-0.5">
                  <span>← 100% Asfalto</span>
                  <span>100% Brecha / Off-road →</span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: NOMBRE Y RESUMEN DEL PLAN */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-semibold text-2xl text-[#1A1918]  ">
                  ¿Cómo se llama el plan?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-sans font-medium">
                  Ponle título y añade un breve resumen.
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-sans font-semibold text-[#1A1918]/70 tracking-wider block mb-1">
                  Título de la Rodada / Ruta
                </span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Ruta Mineral del Chico vía Hacienda"
                  className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-sans font-semibold text-[#1A1918]/70 tracking-wider block mb-1">
                  Resumen del Plan (1-2 líneas)
                </span>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ej. Salida 7:30 AM puntual, parada a desayunar en la hacienda y regreso por la tarde."
                  className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] resize-none rounded-xl shadow-sm font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES INFERIORES: ATRÁS / SIGUIENTE / PUBLICAR - PINNED */}
        <div className="shrink-0 px-6 py-4 border-t border-[#1A1918]/10 bg-[#F4EEDB] flex items-center justify-between gap-3 z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-[#1A1918]/10 hover:bg-[#F7B32B] bg-[#FAF6ED] text-[#1A1918] text-xs font-sans font-semibold flex items-center gap-1 transition rounded-xl shadow-sm active:shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#1A1918]/70 hover:text-[#1A1918] text-xs font-sans font-semibold transition"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 2 && !destination.trim()}
              className="px-6 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-40 text-white border border-[#1A1918]/10 text-xs font-sans font-semibold flex items-center gap-2 transition ml-auto shadow-sm rounded-xl active:shadow-none"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 text-xs font-sans font-semibold flex items-center gap-2 transition ml-auto shadow-sm rounded-xl active:shadow-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F7B32B]" />
              <span>{mode === 'edit' ? 'Guardar Cambios' : mode === 'alternative' ? 'Publicar Alternativa' : 'Convocar Rodada'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
