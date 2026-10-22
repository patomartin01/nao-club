'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  Navigation, 
  ExternalLink, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Utensils, 
  Landmark, 
  Camera, 
  Fuel, 
  Trees, 
  Bell, 
  ArrowUp, 
  ArrowDown,
  Sparkles,
  HelpCircle,
  Flag
} from 'lucide-react';
import { Rodada, RouteProposal, User, Waypoint, WaypointType } from '../../types';
import { buildDynamicRouteGoogleMapsUrl } from '../../utils/googleMaps';

interface InteractiveRouteProposalModalProps {
  rodada: Rodada;
  currentUser: User;
  onClose: () => void;
  onSubmit: (proposal: Omit<RouteProposal, 'id' | 'votes' | 'comments'>, dateConfig?: { mode: 'current' | 'custom' | 'tbd'; startDate?: string; endDate?: string }) => void;
  formatHumanDate: (start: string, end?: string, includeYear?: boolean) => string;
}

interface IntermediateStop {
  id: string;
  name: string;
  type: WaypointType;
  description: string;
}

export const InteractiveRouteProposalModal: React.FC<InteractiveRouteProposalModalProps> = ({
  rodada,
  currentUser,
  onClose,
  onSubmit,
  formatHumanDate
}) => {
  // Stepper state (1: Fecha, 2: Ruta y Maps, 3: Logística y Dificultad, 4: Plan y Resumen)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Fecha
  const [dateMode, setDateMode] = useState<'current' | 'custom' | 'tbd'>('current');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Step 2: Ruta conectada con Google Maps (Inicio, Puntos medios, Fin)
  const [originPoint, setOriginPoint] = useState(rodada.originPoint || 'Interlomas, Huixquilucan');
  const [destinationPoint, setDestinationPoint] = useState(rodada.title || '');
  const [destinationState, setDestinationState] = useState('Hidalgo');
  const [intermediateStops, setIntermediateStops] = useState<IntermediateStop[]>([
    {
      id: 'stop-1',
      name: 'Hacienda Santa María Regla',
      type: 'culture',
      description: 'Visita rápida a los arcos históricos y toma de fotos en la cascada.'
    },
    {
      id: 'stop-2',
      name: 'Huasca de Ocampo Centro',
      type: 'food',
      description: 'Parada a almorzar cecina y pastes tradicionales.'
    }
  ]);

  // Step 3: Hora, Dificultad & Terreno
  const [departureTime, setDepartureTime] = useState('07:30 AM');
  const [difficulty, setDifficulty] = useState<RouteProposal['difficulty']>('Intermedio');
  const [offroadPercentage, setOffroadPercentage] = useState(35);
  const [totalKm, setTotalKm] = useState(135);
  const [estimatedHours, setEstimatedHours] = useState('4h 30m');

  // Step 4: Título & Resumen del Plan
  const [routeTitle, setRouteTitle] = useState('');
  const [planSummary, setPlanSummary] = useState('');

  // Auto-generate suggested title if user hasn't typed one
  useEffect(() => {
    if (!routeTitle || routeTitle.startsWith('Ruta')) {
      const stopsSummary = intermediateStops.length > 0 
        ? `${intermediateStops[0].name} & ` 
        : '';
      const destClean = destinationPoint || 'Destino';
      setRouteTitle(`Ruta ${stopsSummary}${destClean}`);
    }
  }, [destinationPoint, intermediateStops]);

  // Auto-generate plan summary suggestion
  useEffect(() => {
    if (!planSummary) {
      const stopsNames = intermediateStops.map(s => s.name).join(', ');
      setPlanSummary(
        `Salida puntual a las ${departureTime} desde ${originPoint}. Trayecto con paradas programadas en ${stopsNames || 'puntos escénicos'} y llegada a ${destinationPoint || 'destino'}. Nivel ${difficulty} con ${offroadPercentage}% de terracería.`
      );
    }
  }, [originPoint, destinationPoint, departureTime, difficulty, offroadPercentage, intermediateStops]);

  // Dynamic Google Maps URL
  const gmapsWaypoints = intermediateStops.map(s => ({ name: s.name }));
  const previewMapsUrl = buildDynamicRouteGoogleMapsUrl(originPoint, gmapsWaypoints, destinationPoint);

  // Stop handlers
  const handleAddStop = () => {
    const newStop: IntermediateStop = {
      id: `stop-${Date.now()}`,
      name: '',
      type: 'food',
      description: ''
    };
    setIntermediateStops(prev => [...prev, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    setIntermediateStops(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<IntermediateStop>) => {
    setIntermediateStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === intermediateStops.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...intermediateStops];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setIntermediateStops(copy);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build structured waypoints
    const allWaypoints: Waypoint[] = [
      {
        id: `wp-origin-${Date.now()}`,
        name: originPoint,
        lat: 19.4000,
        lng: -99.2500,
        type: 'start',
        notes: `Salida oficial a las ${departureTime}`
      },
      ...intermediateStops.map((stop, i) => ({
        id: `wp-${stop.id}`,
        name: stop.name || `Parada ${i + 1}`,
        lat: 20.0000 + i * 0.05,
        lng: -98.7000 - i * 0.05,
        type: stop.type,
        notes: stop.description,
        description: stop.description
      })),
      {
        id: `wp-dest-${Date.now()}`,
        name: destinationPoint || 'Destino Final',
        lat: 20.2000,
        lng: -98.7300,
        type: 'camp',
        notes: 'Punto de llegada de la rodada'
      }
    ];

    const newProposal: Omit<RouteProposal, 'id' | 'votes' | 'comments'> = {
      rodadaId: rodada.id,
      title: routeTitle.trim() || `Alternativa ${destinationPoint}`,
      destination: destinationPoint.trim() || 'Destino Propuesto',
      state: destinationState.trim() || 'México',
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: planSummary.trim() || `Alternativa propuesta por ${currentUser.name}. Salida ${departureTime}.`,
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
      totalKm,
      estimatedHours,
      offroadPercentage,
      asphaltPercentage: Math.max(0, 100 - offroadPercentage),
      difficulty,
      campsite: {
        name: `Campamento / Parada ${destinationPoint}`,
        elevationMeters: 2600,
        minTempNight: '8°C',
        security: 'Zona segura para motociclistas',
        amenities: ['Comida cercana', 'Área de fogata', 'Estacionamiento de motos']
      },
      itinerary: [
        {
          day: 1,
          title: `Travesía hacia ${destinationPoint}`,
          description: planSummary,
          distanceKm: totalKm,
          offroadKm: Math.round((totalKm * offroadPercentage) / 100),
          terrainType: `${offroadPercentage}% brecha / ${100 - offroadPercentage}% asfalto`
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
      safetyTips: ['Tanque lleno al salir', 'Herramienta básica y compresor', 'Revisar presión de llantas']
    };

    const dateConfig = {
      mode: dateMode,
      startDate: dateMode === 'custom' ? customStartDate : undefined,
      endDate: dateMode === 'custom' ? (isMultiDay ? customEndDate : customStartDate) : undefined
    };

    onSubmit(newProposal, dateConfig);
  };

  const getStopTypeLabel = (type: WaypointType) => {
    switch (type) {
      case 'food':
        return 'Comida / Restaurante';
      case 'culture':
        return 'Hacienda / Cultura';
      case 'scenic':
        return 'Mirador / Paisaje';
      case 'fuel':
        return 'Gasolinera';
      case 'dirt':
        return 'Entrada Terracería';
      default:
        return 'Punto de Interés';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="border border-white/20 bg-[#0E0C0A] max-w-2xl w-full p-5 sm:p-7 space-y-6 my-auto max-h-[92vh] overflow-y-auto font-mono text-chalk shadow-2xl">
        
        {/* Header con Indicador de Pasos */}
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                [ PROPOSICIÓN INTERACTIVA DE RUTA ]
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase mt-0.5">
                Diseñar Alternativa de Rodada
              </h2>
              <p className="text-xs text-ash mt-0.5">
                Configura fecha, puntos intermedios en Google Maps, nivel y plan de ruta.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-ash hover:text-white p-1.5 border border-white/10 hover:border-white/30 transition shrink-0"
              title="Cerrar creador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 mt-5">
            {[
              { num: 1, label: '1. FECHA' },
              { num: 2, label: '2. MAPS & RUTA' },
              { num: 3, label: '3. LOGÍSTICA' },
              { num: 4, label: '4. PLAN & RESUMEN' }
            ].map(step => (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num as any)}
                className={`text-center py-2 px-1 border transition text-[10px] font-mono font-bold uppercase tracking-wider ${
                  currentStep === step.num
                    ? 'border-earth bg-earth/15 text-earth'
                    : currentStep > step.num
                    ? 'border-white/20 bg-white/[0.03] text-chalk'
                    : 'border-white/5 bg-transparent text-ash/60'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* =================================================================== */}
          {/* PASO 1: SELECCIÓN DE FECHA                                          */}
          {/* =================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border border-white/10 bg-black/40 p-4 space-y-3">
                <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                  Elige la Fecha para esta Alternativa:
                </span>

                {/* Opción A: Mantener la fecha actual de la convocatoria */}
                <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition ${
                  dateMode === 'current'
                    ? 'border-earth bg-earth/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="current"
                    checked={dateMode === 'current'}
                    onChange={() => setDateMode('current')}
                    className="mt-1 accent-[#C87D55]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">
                      Usar la fecha de la convocatoria ({formatHumanDate(rodada.startDate, rodada.endDate, true)})
                    </span>
                    <span className="text-[11px] text-ash block mt-0.5">
                      Competirás como alternativa directamente para la fecha fijada de la rodada.
                    </span>
                  </div>
                </label>

                {/* Opción B: Proponer otra fecha alternativa */}
                <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition ${
                  dateMode === 'custom'
                    ? 'border-earth bg-earth/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="custom"
                    checked={dateMode === 'custom'}
                    onChange={() => setDateMode('custom')}
                    className="mt-1 accent-[#C87D55]"
                  />
                  <div className="w-full">
                    <span className="text-xs font-bold text-white block uppercase">
                      Proponer otra opción de fecha
                    </span>
                    <span className="text-[11px] text-ash block mt-0.5">
                      Si crees que otra fecha es mejor para la tribu (ej. siguiente fin de semana).
                    </span>

                    {dateMode === 'custom' && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isMultiDay"
                            checked={isMultiDay}
                            onChange={(e) => setIsMultiDay(e.target.checked)}
                            className="accent-[#C87D55]"
                          />
                          <label htmlFor="isMultiDay" className="text-xs text-chalk cursor-pointer">
                            ¿Es rodada de varios días / fin de semana?
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-ash uppercase block mb-1">Fecha de Inicio</label>
                            <input
                              type="date"
                              required={dateMode === 'custom'}
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                            />
                          </div>

                          {isMultiDay && (
                            <div>
                              <label className="text-[10px] text-ash uppercase block mb-1">Fecha de Fin</label>
                              <input
                                type="date"
                                required={dateMode === 'custom' && isMultiDay}
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                              />
                            </div>
                          )}
                        </div>

                        {customStartDate && (
                          <div className="p-2 border border-earth/30 bg-earth/5 text-[11px] text-earth">
                            Fecha propuesta: {formatHumanDate(customStartDate, isMultiDay ? customEndDate : undefined, true)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                {/* Opción C: Fecha por definir */}
                <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition ${
                  dateMode === 'tbd'
                    ? 'border-earth bg-earth/10 text-white'
                    : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/20'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="tbd"
                    checked={dateMode === 'tbd'}
                    onChange={() => setDateMode('tbd')}
                    className="mt-1 accent-[#C87D55]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block uppercase">
                      Fecha Por Definir / A Consenso
                    </span>
                    <span className="text-[11px] text-ash block mt-0.5">
                      Proponer la ruta primero y decidir la fecha después en el chat de la tribu.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <span>Continuar a Ruta & Maps</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PASO 2: MAPS & RUTA CONECTADA (INICIO, PUNTOS MEDIOS, FIN)          */}
          {/* =================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-4">
              
              {/* Origen (Punto A) */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    Punto de Salida / Origen (A)
                  </label>
                  <span className="text-[10px] text-ash">Inicio de ruta</span>
                </div>

                <input
                  type="text"
                  required
                  value={originPoint}
                  onChange={(e) => setOriginPoint(e.target.value)}
                  placeholder="Ej. Interlomas, Huixquilucan o Caseta Tlalpan"
                  className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs placeholder-ash/50 focus:outline-none focus:border-earth"
                />

                {/* Accesos rápidos comunes */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-ash">Sugerencias:</span>
                  {['Interlomas', 'Caseta Tlalpan', 'Perisur', 'Santa Fe', 'Caseta Tepotzotlán'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setOriginPoint(sug)}
                      className="text-[10px] px-2 py-0.5 border border-white/10 hover:border-earth text-ash hover:text-white transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Puntos Medios / Paradas en Ruta (B, C...) */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                      Paradas Intermedias & Puntos de Interés
                    </label>
                    <p className="text-[11px] text-ash">
                      Añade haciendas, miradores, desayunos o paradas de gasolina en el camino.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-1.5 border border-earth/40 hover:bg-earth/10 text-earth text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Parada</span>
                  </button>
                </div>

                {intermediateStops.length === 0 ? (
                  <div className="p-4 border border-dashed border-white/15 text-center text-xs text-ash">
                    No has añadido paradas intermedias aún. Haz clic en &ldquo;Añadir Parada&rdquo; si harás escala a comer, ver haciendas o miradores.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intermediateStops.map((stop, index) => (
                      <div key={stop.id} className="p-3 border border-white/15 bg-white/[0.02] space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-white uppercase flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded bg-earth/20 border border-earth text-earth flex items-center justify-center text-[10px]">
                              {String.fromCharCode(66 + index)}
                            </span>
                            Parada {index + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-ash hover:text-white disabled:opacity-30"
                              title="Mover antes"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'down')}
                              disabled={index === intermediateStops.length - 1}
                              className="p-1 text-ash hover:text-white disabled:opacity-30"
                              title="Mover después"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(stop.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 ml-1"
                              title="Eliminar parada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nombre del punto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-ash uppercase block mb-1">Nombre del Lugar / Parada</label>
                            <input
                              type="text"
                              required
                              value={stop.name}
                              onChange={(e) => handleUpdateStop(stop.id, { name: e.target.value })}
                              placeholder="Ej. Hacienda Santa María Regla"
                              className="w-full bg-black/60 border border-white/20 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-earth"
                            />
                          </div>

                          <div>
                            <label className="text-[9px] text-ash uppercase block mb-1">Tipo de Parada</label>
                            <select
                              value={stop.type}
                              onChange={(e) => handleUpdateStop(stop.id, { type: e.target.value as WaypointType })}
                              className="w-full bg-black/60 border border-white/20 px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-earth"
                            >
                              <option value="food">🍽️ Parar a Comer / Desayuno</option>
                              <option value="culture">🏛️ Ver Hacienda / Punto Cultural</option>
                              <option value="scenic">📸 Mirador / Foto Panorámica</option>
                              <option value="fuel">⛽ Gasolinera</option>
                              <option value="dirt">🌲 Brecha / Terracería</option>
                            </select>
                          </div>
                        </div>

                        {/* Breve descripción de la parada */}
                        <div>
                          <label className="text-[9px] text-ash uppercase block mb-1">
                            Breve descripción de la parada (¿Qué se hace aquí?)
                          </label>
                          <input
                            type="text"
                            value={stop.description}
                            onChange={(e) => handleUpdateStop(stop.id, { description: e.target.value })}
                            placeholder="Ej. Parada a desayunar cecina y café de olla en el mercado"
                            className="w-full bg-black/60 border border-white/20 px-2.5 py-1.5 text-white text-xs placeholder-ash/50 focus:outline-none focus:border-earth"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destino Final (Punto Z) */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-earth" />
                    Destino Final (Meta)
                  </label>
                  <span className="text-[10px] text-ash">Fin de recorrido</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={destinationPoint}
                      onChange={(e) => setDestinationPoint(e.target.value)}
                      placeholder="Ej. Mineral del Chico o Valle de Bravo"
                      className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={destinationState}
                      onChange={(e) => setDestinationState(e.target.value)}
                      placeholder="Estado (ej. Hidalgo)"
                      className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                    />
                  </div>
                </div>
              </div>

              {/* Conexión en vivo con Google Maps Preview */}
              <div className="p-3.5 border border-earth/40 bg-earth/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-earth" />
                    Ruta Conectada en Google Maps
                  </span>
                  <p className="text-[11px] text-ash">
                    Se generará el enlace secuencial con todas las paradas ordenadas (A &rarr; B &rarr; C &rarr; Z).
                  </p>
                </div>

                <a
                  href={previewMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 border border-earth bg-earth text-white hover:bg-earth-bright text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shrink-0 justify-center transition shadow"
                >
                  <span>Probar en Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-white/20 hover:border-white/40 text-ash hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <span>Continuar a Logística</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PASO 3: LOGÍSTICA, DIFICULTAD & HORA                                */}
          {/* =================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              
              {/* Hora de salida & Distancia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-white/10 bg-black/40 p-4">
                <div>
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block mb-1">
                    Hora de Salida
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Ej. 07:30 AM"
                    className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block mb-1">
                    Distancia Total Aprox. (km)
                  </label>
                  <input
                    type="number"
                    value={totalKm}
                    onChange={(e) => setTotalKm(Number(e.target.value))}
                    className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block mb-1">
                    Tiempo Estimado
                  </label>
                  <input
                    type="text"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="Ej. 4h 30m"
                    className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              {/* Nivel de Dificultad (incluyendo 'Desconocido') */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-3">
                <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                  Nivel de Dificultad del Trazado:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      lvl: 'Fácil (Fluida)',
                      desc: 'Pavimento en buen estado y terracería compacta. Apta para novatos y motos asfálticas.'
                    },
                    {
                      lvl: 'Intermedio',
                      desc: 'Curvas reviradas, brechas de grava y pequeños desniveles. Requiere experiencia básica.'
                    },
                    {
                      lvl: 'Avanzado / Técnico',
                      desc: 'Trialeras, piedras sueltas, zanjas o lodo pesado. Requiere llantas de gajos y buena condición.'
                    },
                    {
                      lvl: 'Desconocido / Por explorar',
                      desc: 'Ruta no prospectada o virgen. Aventura de exploración en grupo sin certezas del terreno.'
                    }
                  ].map(item => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => setDifficulty(item.lvl as any)}
                      className={`p-3 text-left border transition ${
                        difficulty === item.lvl
                          ? 'border-earth bg-earth/15 text-white'
                          : 'border-white/10 bg-white/[0.02] text-ash hover:border-white/25 hover:text-chalk'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase">{item.lvl}</span>
                        {item.lvl === 'Desconocido / Por explorar' && (
                          <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2">
                            Exploración
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-ash mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Porcentaje de Terracería vs Asfalto */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                    Composición del Terreno
                  </label>
                  <span className="text-xs font-bold text-white">
                    {offroadPercentage}% Terracería • {100 - offroadPercentage}% Asfalto
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={offroadPercentage}
                  onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                  className="w-full accent-[#C87D55] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-ash">
                  <span>100% Carretera / Curvas</span>
                  <span>50 / 50 Mixto</span>
                  <span>100% Brecha Off-Road</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-white/20 hover:border-white/40 text-ash hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <span>Continuar a Resumen</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* PASO 4: PLAN, TÍTULO & CONFIRMACIÓN                                 */}
          {/* =================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-4">
              
              {/* Título de la Ruta */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-2">
                <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                  Título de la Ruta Propuesta
                </label>
                <input
                  type="text"
                  required
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  placeholder="Ej. Ruta de las Haciendas & Paso de la Montaña"
                  className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs focus:outline-none focus:border-earth"
                />
              </div>

              {/* Resumen del Plan */}
              <div className="border border-white/10 bg-black/40 p-4 space-y-2">
                <label className="text-[10px] font-mono text-earth uppercase font-bold tracking-wider block">
                  Resumen o Descripción del Plan
                </label>
                <textarea
                  rows={4}
                  required
                  value={planSummary}
                  onChange={(e) => setPlanSummary(e.target.value)}
                  placeholder="Explica el plan general: horarios, tipo de comida, paradas y equipo recomendado."
                  className="w-full bg-black/60 border border-white/20 px-3 py-2 text-white text-xs placeholder-ash/50 focus:outline-none focus:border-earth"
                />
              </div>

              {/* Notificación Preview a Celulares */}
              <div className="p-3.5 border border-white/15 bg-white/[0.02] flex items-start gap-3">
                <div className="p-2 bg-earth/20 border border-earth text-earth shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white uppercase block">
                    Notificación que recibirán los integrantes en su celular:
                  </span>
                  <p className="text-ash text-[11px]">
                    &ldquo;{currentUser.name} ha propuesto una alternativa de ruta: <span className="text-chalk font-semibold">&lsquo;{routeTitle || 'Ruta Propuesta'}&rsquo;</span> para el {dateMode === 'current' ? formatHumanDate(rodada.startDate, rodada.endDate, true) : dateMode === 'custom' ? formatHumanDate(customStartDate, isMultiDay ? customEndDate : undefined, true) : 'Por Definir'}. Entra a votar manita arriba o abajo.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-white/20 hover:border-white/40 text-ash hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition shadow-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publicar Alternativa & Notificar</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
