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
  ArrowUp,
  ArrowDown,
  GripVertical
} from 'lucide-react';
import { Rodada, RouteProposal, User, Waypoint, WaypointType } from '../../types';
import { buildDynamicRouteGoogleMapsUrl } from '../../utils/googleMaps';
import { PlaceAutocompleteInput, PlaceResult } from './PlaceAutocompleteInput';

export interface StepByStepRodadaModalProps {
  isOpen: boolean;
  mode: 'alternative' | 'convoke';
  activeRodada?: Rodada | null;
  currentUser: User;
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
  onClose,
  onSubmitAlternative,
  onSubmitConvoke,
  formatHumanDate
}) => {
  // Step 1 to 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

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
  const [origin, setOrigin] = useState(activeRodada?.originPoint || 'Interlomas');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 19.3985, lng: -99.2783 });
  const [destination, setDestination] = useState(activeRodada?.title || '');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number }>({ lat: 20.2154, lng: -98.7310 });
  const [stops, setStops] = useState<IntermediateStop[]>([]);
  const [draggedStopIndex, setDraggedStopIndex] = useState<number | null>(null);

  // Step 3: Ritmo, Dificultad & Hora
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [difficulty, setDifficulty] = useState<RouteProposal['difficulty']>('Intermedio');
  const [offroadPercentage, setOffroadPercentage] = useState(30);

  // Step 4: Nombre y Resumen
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');

  // Reset or preset values when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (mode === 'alternative' && activeRodada) {
        setDateSelection('current');
        setDestination(activeRodada.title);
      } else {
        setDateSelection('custom');
        const todayStr = new Date().toISOString().split('T')[0];
        setCustomStartDate(todayStr);
        setCustomEndDate(todayStr);
        setDestination('');
      }
    }
  }, [isOpen, mode, activeRodada]);

  // Auto-generate title suggestion
  useEffect(() => {
    if (!title || title.startsWith('Ruta')) {
      const destClean = destination.trim() || 'Destino';
      const stopPart = stops.length > 0 && stops[0].name.trim() 
        ? `vía ${stops[0].name.trim()}` 
        : '';
      setTitle(`Ruta ${destClean} ${stopPart}`.trim());
    }
  }, [destination, stops]);

  if (!isOpen) return null;

  // Google Maps preview URL
  const gmapsStops = stops.map(s => ({ name: s.name }));
  const previewMapsUrl = buildDynamicRouteGoogleMapsUrl(origin, gmapsStops, destination);

  const handleNext = () => {
    setDirection('forward');
    setStep(prev => Math.min(prev + 1, 4) as any);
  };

  const handleBack = () => {
    setDirection('backward');
    setStep(prev => Math.max(prev - 1, 1) as any);
  };

  const handleAddStop = () => {
    setStops(prev => [
      ...prev,
      {
        id: `stop-${Date.now()}-${prev.length}`,
        name: '',
        type: 'food',
        description: '',
        lat: 19.8000 + prev.length * 0.1,
        lng: -99.0000 - prev.length * 0.1
      }
    ]);
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<IntermediateStop>) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Reordering helpers (Buttons and Drag & Drop)
  const handleMoveStopUp = (index: number) => {
    if (index <= 0) return;
    setStops(prev => {
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
          terrainType: `${offroadPercentage}% terracería / ${100 - offroadPercentage}% asfalto`
        }
      ],
      waypoints: allWaypoints,
      coordinates: [
        [19.4000, -99.2500],
        [19.8000, -98.9000],
        [20.2000, -98.7300]
      ],
      downvotes: [],
      dayOfDeadVibe: 'Camaradería y exploración con la tribu',
      safetyTips: ['Tanque lleno', 'Herramienta básica', 'Presión de llantas revisada']
    };

    if (mode === 'alternative' && onSubmitAlternative) {
      onSubmitAlternative(proposalObj, {
        mode: dateSelection,
        startDate: dateSelection === 'custom' ? customStartDate : undefined,
        endDate: dateSelection === 'custom' ? customEndDate : undefined
      });
    } else if (mode === 'convoke' && onSubmitConvoke) {
      const isSingleDay = customStartDate === customEndDate;
      onSubmitConvoke({
        title: destination.trim() || title.trim() || 'Nueva Rodada',
        subtitle: title.trim() || 'Convocatoria abierta para la tribu',
        description: summary.trim() || `Salida desde ${origin} a las ${departureTime}.`,
        category: isSingleDay ? 'Rodada Rápida 1 Día' : 'Fin de Semana',
        startDate: dateSelection === 'tbd' ? '2026-12-01' : customStartDate,
        endDate: dateSelection === 'tbd' ? '2026-12-01' : customEndDate,
        originPoint: origin,
        proposal: proposalObj
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="relative border border-white/20 bg-[#110F0D] max-w-lg w-full max-h-[90dvh] flex flex-col font-mono text-chalk shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header: Minimal Step Indicator & Close - Pinned */}
        <div className="shrink-0 px-5 sm:px-6 pt-5 pb-3 border-b border-white/10 bg-[#141210]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-earth tracking-widest">
                {mode === 'alternative' ? 'ALTERNATIVA' : 'CONVOCAR RODADA'}
              </span>
              <span className="text-ash text-[10px]">•</span>
              <span className="text-[10px] text-ash font-bold">
                Paso {step} de 4
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-ash hover:text-white p-1 transition"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Minimal Progress Dashes */}
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`h-1 transition-all duration-300 ${
                  s <= step ? 'bg-earth' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-4 pb-32 sm:pb-40 space-y-4">
          
          {/* =============================================================== */}
          {/* PASO 1: ¿CUÁNDO RODAMOS?                                        */}
          {/* =============================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  ¿Cuándo rodamos?
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Elige la fecha para salir a la ruta.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* Opción A: Convocatoria activa (solo si existe y es alternativa) */}
                {mode === 'alternative' && activeRodada && (
                  <button
                    type="button"
                    onClick={() => setDateSelection('current')}
                    className={`w-full p-3 text-left border transition flex items-center justify-between ${
                      dateSelection === 'current'
                        ? 'border-earth bg-earth/10 text-white'
                        : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block uppercase text-chalk">
                        Para la fecha activa
                      </span>
                      <span className="text-[11px] text-ash">
                        {formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}
                      </span>
                    </div>
                    {dateSelection === 'current' && <span className="text-earth text-xs font-bold">✓</span>}
                  </button>
                )}

                {/* Opción B: Elegir fechas (Inicio y Fin) */}
                <div
                  onClick={() => setDateSelection('custom')}
                  className={`w-full p-3.5 border transition cursor-pointer ${
                    dateSelection === 'custom'
                      ? 'border-earth bg-earth/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold block uppercase text-chalk">
                      {mode === 'alternative' ? 'Proponer otra fecha' : 'Elegir fecha de la rodada'}
                    </span>
                    {dateSelection === 'custom' && <span className="text-earth text-xs font-bold">✓</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="text-[10px] text-ash uppercase font-mono block mb-1">
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
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-black/80 border border-white/25 hover:border-white/40 focus:border-earth px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-ash uppercase font-mono block mb-1">
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
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-black/80 border border-white/25 hover:border-white/40 focus:border-earth px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-ash font-mono mt-2.5">
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
                  className={`w-full p-3 text-left border transition flex items-center justify-between ${
                    dateSelection === 'tbd'
                      ? 'border-earth bg-earth/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block uppercase text-chalk">
                      Fecha por definir
                    </span>
                    <span className="text-[11px] text-ash">
                      Decidir la fecha después en el chat con la tribu.
                    </span>
                  </div>
                  {dateSelection === 'tbd' && <span className="text-earth text-xs font-bold">✓</span>}
                </button>
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* PASO 2: ¿A DÓNDE Y QUÉ PARADAS? (MAPS)                          */}
          {/* =============================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  ¿Hacia dónde rodamos?
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  1° Punto de salida, paradas intermedias en el camino y destino final.
                </p>
              </div>

              {/* 1. Salida / Origen */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-earth inline-block" />
                  <span className="text-[10px] font-mono uppercase font-bold text-ash tracking-wider">
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
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
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
                      className="text-[10px] px-2 py-0.5 border border-white/10 hover:border-earth text-ash hover:text-white transition"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PARADAS INTERMEDIAS EN EL CAMINO (IN BETWEEN: Entre Salida y Destino) */}
              <div className="space-y-2 pt-2 border-t border-b border-white/10 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400/80 inline-block" />
                    <span className="text-[10px] font-mono uppercase font-bold text-ash tracking-wider">
                      Paradas en el camino ({stops.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-earth border border-earth/40 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Parada</span>
                  </button>
                </div>

                {stops.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="w-full py-2.5 px-3 border border-dashed border-white/20 hover:border-earth/60 hover:bg-earth/5 text-ash hover:text-white transition flex items-center justify-center gap-2 text-xs font-mono"
                  >
                    <Plus className="w-3.5 h-3.5 text-earth" />
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
                        className={`p-3 border bg-[#14110F] space-y-2.5 transition ${
                          draggedStopIndex === i 
                            ? 'border-earth bg-earth/10 opacity-70' 
                            : 'border-white/15 hover:border-white/25'
                        }`}
                      >
                        {/* Header de la parada: drag handle, orden y botón borrar */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-grab active:cursor-grabbing text-ash hover:text-white p-0.5" 
                              title="Arrastra para reordenar parada"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-mono font-bold text-white uppercase">
                              Parada {i + 1} de {stops.length}
                            </span>
                            
                            {/* Si son varias paradas, botones para reordenar */}
                            {stops.length > 1 && (
                              <div className="flex items-center gap-1 ml-1.5">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() => handleMoveStopUp(i)}
                                  title="Mover parada antes"
                                  className="px-1.5 py-0.5 border border-white/15 hover:border-earth bg-white/[0.04] text-[10px] text-chalk hover:text-white disabled:opacity-20 flex items-center gap-0.5 transition"
                                >
                                  <ArrowUp className="w-3 h-3 text-earth" />
                                  <span className="text-[9px] font-bold uppercase hidden sm:inline">Subir</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={i === stops.length - 1}
                                  onClick={() => handleMoveStopDown(i)}
                                  title="Mover parada después"
                                  className="px-1.5 py-0.5 border border-white/15 hover:border-earth bg-white/[0.04] text-[10px] text-chalk hover:text-white disabled:opacity-20 flex items-center gap-0.5 transition"
                                >
                                  <ArrowDown className="w-3 h-3 text-earth" />
                                  <span className="text-[9px] font-bold uppercase hidden sm:inline">Bajar</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveStop(stop.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 transition"
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

                        {/* Nota o plan de la parada */}
                        <div>
                          <span className="text-[9px] uppercase font-mono text-ash block mb-1">
                            Nota o plan de la parada (opcional)
                          </span>
                          <input
                            type="text"
                            placeholder="Ej. Desayuno de cecina, ver la hacienda, cargar gasolina..."
                            value={stop.description}
                            onChange={(e) => handleUpdateStop(stop.id, { description: e.target.value })}
                            className="w-full bg-black/80 border border-white/20 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-earth placeholder-ash/50"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="w-full py-1.5 border border-dashed border-white/15 hover:border-earth/40 text-[10px] text-ash hover:text-chalk transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-earth" />
                      <span>+ Añadir otra parada en el camino</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Destino Final (DESPUÉS de las paradas intermedias) */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-[10px] font-mono uppercase font-bold text-ash tracking-wider">
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
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-white/10 font-mono">
                  <span className="text-ash">Ruta conectada:</span>
                  <a
                    href={previewMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-earth hover:text-earth-bright font-bold uppercase flex items-center gap-1.5 transition"
                  >
                    <span>Probar en Google Maps ↗</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* PASO 3: ¿QUÉ RITMO Y A QUÉ HORA?                                */}
          {/* =============================================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  ¿Qué ritmo y hora?
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Dificultad técnica, horario y terreno.
                </p>
              </div>

              {/* Selector de Dificultad (4 botones minimalistas) */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase text-ash block">Dificultad del Trazado</span>
                <div className="grid grid-cols-2 gap-2">
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
                      className={`p-2.5 text-left border transition ${
                        difficulty === lvl.id
                          ? 'border-earth bg-earth/15 text-white'
                          : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block uppercase text-chalk">{lvl.label}</span>
                      <span className="text-[10px] text-ash block mt-0.5">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora de Salida */}
              <div>
                <span className="text-[10px] uppercase text-ash block mb-1">Hora de Salida</span>
                <div className="flex gap-2">
                  {['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDepartureTime(t)}
                      className={`px-2.5 py-1.5 text-xs font-mono border transition flex-1 text-center ${
                        departureTime === t
                          ? 'border-earth bg-earth/15 text-earth font-bold'
                          : 'border-white/10 bg-white/[0.02] text-ash hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Terracería */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase text-ash">Superficie</span>
                  <span className="text-xs font-bold text-white">
                    {offroadPercentage}% Terracería • {100 - offroadPercentage}% Asfalto
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={offroadPercentage}
                  onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                  className="w-full accent-[#C87D55] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* PASO 4: NOMBRE Y RESUMEN DEL PLAN                               */}
          {/* =============================================================== */}
          {step === 4 && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  ¿Cómo se llama el plan?
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Ponle título y añade un breve resumen.
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-ash block mb-1">Título de la Rodada / Ruta</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Ruta Mineral del Chico vía Hacienda"
                  className="w-full bg-black/60 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none focus:border-earth"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase text-ash block mb-1">Resumen del Plan (1-2 líneas)</span>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ej. Salida 7:30 AM puntual, parada a desayunar en la hacienda y regreso por la tarde."
                  className="w-full bg-black/60 border border-white/20 px-3 py-2 text-xs text-white focus:outline-none focus:border-earth resize-none"
                />
              </div>


            </div>
          )}
        </div>

        {/* =============================================================== */}
        {/* CONTROLES INFERIORES: ATRÁS / SIGUIENTE / PUBLICAR - PINNED    */}
        {/* =============================================================== */}
        <div className="shrink-0 px-5 sm:px-6 py-3.5 border-t border-white/10 bg-[#141210] flex items-center justify-between gap-3 z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-white/15 hover:border-white/30 text-ash hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ash hover:text-white text-xs uppercase font-bold tracking-wider transition"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 2 && !destination.trim()}
              className="px-5 py-2.5 bg-earth hover:bg-earth-bright disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ml-auto shadow"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-5 py-2.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition ml-auto shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{mode === 'alternative' ? 'Publicar Alternativa' : 'Convocar Rodada'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
