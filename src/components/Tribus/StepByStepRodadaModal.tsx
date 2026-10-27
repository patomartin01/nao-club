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

  // Auto-generate title if empty
  useEffect(() => {
    if (!title || title.startsWith('Ruta')) {
      if (destination) {
        const stopsSnippet = stops.length > 0 ? `${stops[0].name} & ` : '';
        setTitle(`Ruta ${stopsSnippet}${destination}`);
      }
    }
  }, [destination, stops]);

  if (!isOpen) return null;

  // Build sequential Google Maps link
  const previewMapsUrl = buildDynamicRouteGoogleMapsUrl(
    origin,
    stops.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })),
    destination
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
      dayOfDeadVibe: 'Camaradería de tribu',
      safetyTips: ['Tanque lleno', 'Revisar presiones']
    };

    if (mode === 'alternative') {
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
      <div className="relative border-2 border-[#1A1918] bg-[#FAF6ED] max-w-lg w-full max-h-[90dvh] flex flex-col font-sans text-[#1A1918] shadow-[8px_8px_0px_#1A1918] rounded-[28px] overflow-hidden animate-scaleUp">
        
        {/* Top Header: Step Indicator & Close - Pinned */}
        <div className="shrink-0 px-6 pt-5 pb-3.5 border-b-2 border-[#1A1918] bg-[#F4EEDB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-black text-[#E6332A] tracking-widest">
                {mode === 'alternative' ? '★ ALTERNATIVA ★' : '★ CONVOCAR RODADA ★'}
              </span>
              <span className="text-[#1A1918]/30 text-[10px]">•</span>
              <span className="text-[10px] text-[#1A1918]/70 font-mono font-bold uppercase tracking-wider">
                Paso {step} de 4
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-[#1A1918] hover:bg-[#E6332A] hover:text-white p-1.5 rounded-xl border-2 border-[#1A1918] bg-[#FAF6ED] transition shadow-[2px_2px_0px_#1A1918]"
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
                className={`h-2 rounded-full border border-[#1A1918] transition-all duration-300 ${
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
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  ¿Cuándo rodamos?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-serif italic font-medium">
                  Elige la fecha para salir a la ruta.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Opción A: Convocatoria activa */}
                {mode === 'alternative' && activeRodada && (
                  <button
                    type="button"
                    onClick={() => setDateSelection('current')}
                    className={`w-full p-4 text-left border-2 rounded-2xl transition flex items-center justify-between shadow-[3px_3px_0px_#1A1918] ${
                      dateSelection === 'current'
                        ? 'border-[#1A1918] bg-[#F7B32B] text-[#1A1918]'
                        : 'border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-display font-black block uppercase tracking-wide">
                        Para la fecha activa
                      </span>
                      <span className="text-[11px] font-serif italic text-[#1A1918]/70 font-medium">
                        {formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}
                      </span>
                    </div>
                    {dateSelection === 'current' && <span className="text-[#1A1918] text-xs font-black font-mono">✓</span>}
                  </button>
                )}

                {/* Opción B: Elegir fechas (Inicio y Fin) */}
                <div
                  onClick={() => setDateSelection('custom')}
                  className={`w-full p-4 border-2 rounded-2xl transition cursor-pointer shadow-[3px_3px_0px_#1A1918] ${
                    dateSelection === 'custom'
                      ? 'border-[#1A1918] bg-[#FAF6ED] ring-2 ring-[#E6332A]'
                      : 'border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-display font-black block uppercase text-[#1A1918] tracking-wide">
                      {mode === 'alternative' ? 'Proponer otra fecha' : 'Elegir fecha de la rodada'}
                    </span>
                    {dateSelection === 'custom' && <span className="text-[#E6332A] text-xs font-black font-mono">✓</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-3" onClick={e => e.stopPropagation()}>
                    <div>
                      <label className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black block mb-1">
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
                        className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] hover:border-[#E6332A] focus:border-[#E6332A] px-3 py-2 text-xs text-[#1A1918] focus:outline-none cursor-pointer rounded-xl font-bold shadow-[2px_2px_0px_#1A1918]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#1A1918]/70 uppercase font-display font-black block mb-1">
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
                        className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] hover:border-[#E6332A] focus:border-[#E6332A] px-3 py-2 text-xs text-[#1A1918] focus:outline-none cursor-pointer rounded-xl font-bold shadow-[2px_2px_0px_#1A1918]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#1A1918]/70 font-serif italic mt-2.5 font-medium">
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
                  className={`w-full p-4 text-left border-2 rounded-2xl transition flex items-center justify-between shadow-[3px_3px_0px_#1A1918] ${
                    dateSelection === 'tbd'
                      ? 'border-[#1A1918] bg-[#F7B32B] text-[#1A1918]'
                      : 'border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                  }`}
                >
                  <div>
                    <span className="text-xs font-display font-black block uppercase tracking-wide">
                      Fecha por definir
                    </span>
                    <span className="text-[11px] font-serif italic text-[#1A1918]/70 font-medium">
                      Decidir la fecha después en el chat con la tribu.
                    </span>
                  </div>
                  {dateSelection === 'tbd' && <span className="text-[#1A1918] text-xs font-black font-mono">✓</span>}
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: ¿A DÓNDE Y QUÉ PARADAS? */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  ¿Hacia dónde rodamos?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-serif italic font-medium">
                  Punto de salida, paradas intermedias en el camino y destino final.
                </p>
              </div>

              {/* 1. Salida / Origen */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A1918] inline-block" />
                  <span className="text-[10px] font-display uppercase font-black text-[#E6332A] tracking-wider">
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
                      className="text-[10px] px-2.5 py-1 border-2 border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F7B32B] text-[#1A1918] font-display font-black uppercase rounded-lg transition shadow-[1px_1px_0px_#1A1918]"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PARADAS INTERMEDIAS */}
              <div className="space-y-2.5 pt-3 border-t-2 border-b-2 border-[#1A1918] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F7B32B] border border-[#1A1918] inline-block" />
                    <span className="text-[10px] font-display uppercase font-black text-[#1A1918] tracking-wider">
                      Paradas en el camino ({stops.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-1 bg-[#1A1918] hover:bg-[#E6332A] text-white text-[11px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 rounded-xl transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Parada</span>
                  </button>
                </div>

                {stops.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="w-full py-3 px-3 border-2 border-dashed border-[#1A1918]/40 hover:border-[#1A1918] hover:bg-[#FAF6ED] text-[#1A1918]/70 hover:text-[#1A1918] transition flex items-center justify-center gap-2 text-xs font-serif italic rounded-2xl bg-[#F4EEDB] font-medium"
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
                        className={`p-3.5 border-2 rounded-2xl bg-[#FAF6ED] space-y-2.5 transition shadow-[3px_3px_0px_#1A1918] ${
                          draggedStopIndex === i 
                            ? 'border-[#1A1918] bg-[#F7B32B] opacity-70' 
                            : 'border-[#1A1918]'
                        }`}
                      >
                        {/* Header de la parada */}
                        <div className="flex items-center justify-between gap-2 border-b-2 border-[#1A1918] pb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="cursor-grab active:cursor-grabbing text-[#1A1918] p-0.5" 
                              title="Arrastra para reordenar parada"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-display font-black text-[#1A1918] uppercase">
                              Parada {i + 1} de {stops.length}
                            </span>
                            
                            {stops.length > 1 && (
                              <div className="flex items-center gap-1 ml-1.5">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() => handleMoveStopUp(i)}
                                  title="Mover parada antes"
                                  className="px-2 py-0.5 border border-[#1A1918] hover:bg-[#F7B32B] bg-[#FAF6ED] text-[10px] text-[#1A1918] disabled:opacity-20 flex items-center gap-0.5 transition rounded-md font-bold"
                                >
                                  <ArrowUp className="w-3 h-3 text-[#1A1918]" />
                                  <span className="text-[9px] font-black uppercase hidden sm:inline">Subir</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={i === stops.length - 1}
                                  onClick={() => handleMoveStopDown(i)}
                                  title="Mover parada después"
                                  className="px-2 py-0.5 border border-[#1A1918] hover:bg-[#F7B32B] bg-[#FAF6ED] text-[10px] text-[#1A1918] disabled:opacity-20 flex items-center gap-0.5 transition rounded-md font-bold"
                                >
                                  <ArrowDown className="w-3 h-3 text-[#1A1918]" />
                                  <span className="text-[9px] font-black uppercase hidden sm:inline">Bajar</span>
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
                          <span className="text-[9px] uppercase font-display font-black text-[#1A1918]/70 block mb-1">
                            Nota o plan de la parada (opcional)
                          </span>
                          <input
                            type="text"
                            placeholder="Ej. Desayuno de cecina, ver la hacienda, cargar gasolina..."
                            value={stop.description}
                            onChange={(e) => handleUpdateStop(stop.id, { description: e.target.value })}
                            className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3 py-2 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] placeholder-[#1A1918]/50 rounded-xl shadow-[2px_2px_0px_#1A1918] font-medium"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="w-full py-2 border-2 border-dashed border-[#1A1918]/40 hover:border-[#1A1918] text-[10px] text-[#1A1918] hover:bg-[#FAF6ED] font-display font-black uppercase tracking-wider transition flex items-center justify-center gap-1 rounded-xl bg-[#F4EEDB]"
                    >
                      <Plus className="w-3 h-3 text-[#E6332A]" />
                      <span>+ Añadir otra parada en el camino</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Destino Final */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6332A] inline-block" />
                  <span className="text-[10px] font-display uppercase font-black text-[#E6332A] tracking-wider">
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
                <div className="pt-2 flex items-center justify-between text-[11px] border-t-2 border-[#1A1918]">
                  <span className="text-[#1A1918]/70 font-serif italic font-medium">Ruta conectada:</span>
                  <a
                    href={previewMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E6332A] hover:text-[#1A1918] font-display font-black uppercase flex items-center gap-1.5 transition tracking-wider"
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
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  ¿Qué ritmo y hora?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-serif italic font-medium">
                  Dificultad técnica, horario y terreno.
                </p>
              </div>

              {/* Selector de Dificultad */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-display font-black text-[#1A1918]/70 tracking-wider block">
                  Dificultad del Trazado
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
                      className={`p-3 text-left border-2 rounded-2xl transition shadow-[3px_3px_0px_#1A1918] ${
                        difficulty === lvl.id
                          ? 'border-[#1A1918] bg-[#F7B32B] text-[#1A1918]'
                          : 'border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
                      }`}
                    >
                      <span className="text-xs font-display font-black block uppercase tracking-wide">{lvl.label}</span>
                      <span className="text-[10px] text-[#1A1918]/70 block mt-0.5 font-serif italic font-medium">{lvl.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora de Salida */}
              <div>
                <span className="text-[10px] uppercase font-display font-black text-[#1A1918]/70 tracking-wider block mb-1.5">
                  Hora de Salida
                </span>
                <div className="flex gap-2">
                  {['07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDepartureTime(t)}
                      className={`px-2.5 py-2 text-xs font-display border-2 rounded-xl transition flex-1 text-center shadow-[2px_2px_0px_#1A1918] ${
                        departureTime === t
                          ? 'border-[#1A1918] bg-[#E6332A] text-white font-black'
                          : 'border-[#1A1918] bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB] font-bold'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider de Terracería */}
              <div className="border-2 border-[#1A1918] bg-[#FAF6ED] p-4 rounded-2xl space-y-2 shadow-[3px_3px_0px_#1A1918]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-display font-black text-[#1A1918]/70 tracking-wider">Superficie</span>
                  <span className="text-xs font-mono font-black text-[#1A1918]">
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
                  className="w-full accent-[#E6332A] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* PASO 4: NOMBRE Y RESUMEN DEL PLAN */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  ¿Cómo se llama el plan?
                </h3>
                <p className="text-xs text-[#1A1918]/70 mt-0.5 font-serif italic font-medium">
                  Ponle título y añade un breve resumen.
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-display font-black text-[#1A1918]/70 tracking-wider block mb-1">
                  Título de la Rodada / Ruta
                </span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Ruta Mineral del Chico vía Hacienda"
                  className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-[2px_2px_0px_#1A1918] font-bold"
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-display font-black text-[#1A1918]/70 tracking-wider block mb-1">
                  Resumen del Plan (1-2 líneas)
                </span>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ej. Salida 7:30 AM puntual, parada a desayunar en la hacienda y regreso por la tarde."
                  className="w-full bg-[#F4EEDB] border-2 border-[#1A1918] px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] resize-none rounded-xl shadow-[2px_2px_0px_#1A1918] font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* CONTROLES INFERIORES: ATRÁS / SIGUIENTE / PUBLICAR - PINNED */}
        <div className="shrink-0 px-6 py-4 border-t-2 border-[#1A1918] bg-[#F4EEDB] flex items-center justify-between gap-3 z-10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border-2 border-[#1A1918] hover:bg-[#F7B32B] bg-[#FAF6ED] text-[#1A1918] text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#1A1918]/70 hover:text-[#1A1918] text-xs uppercase font-display font-black tracking-wider transition"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 2 && !destination.trim()}
              className="px-6 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-40 text-white border-2 border-[#1A1918] text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 transition ml-auto shadow-[3px_3px_0px_#1A1918] rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] text-xs font-display font-black uppercase tracking-widest flex items-center gap-2 transition ml-auto shadow-[3px_3px_0px_#1A1918] rounded-xl active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F7B32B]" />
              <span>{mode === 'alternative' ? 'Publicar Alternativa' : 'Convocar Rodada'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
