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
  }, [intermediateStops, destinationPoint]);

  // Handlers for intermediate stops
  const handleAddStop = () => {
    const newStop: IntermediateStop = {
      id: `stop-${Date.now()}`,
      name: '',
      type: 'food',
      description: ''
    };
    setIntermediateStops(prev => [...prev, newStop]);
  };

  const handleUpdateStop = (id: string, updates: Partial<IntermediateStop>) => {
    setIntermediateStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveStop = (id: string) => {
    setIntermediateStops(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === intermediateStops.length - 1)) return;
    const newStops = [...intermediateStops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;
    setIntermediateStops(newStops);
  };

  // Build live Google Maps preview link
  const previewMapsUrl = buildDynamicRouteGoogleMapsUrl(
    originPoint,
    intermediateStops.map(s => ({ name: s.name })).filter(s => Boolean(s.name)),
    destinationPoint
  );

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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="border border-[#E5DFD5] bg-white max-w-2xl w-full p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto font-sans text-[#141312] shadow-2xl rounded-2xl">
        
        {/* Header con Indicador de Pasos */}
        <div className="border-b border-[#E5DFD5] pb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-display text-[10px] text-[#C84B31] uppercase tracking-[0.2em] font-black flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C84B31]" />
                ★ ALTERNATIVA INTERACTIVA ★
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#141312] uppercase tracking-wide mt-0.5">
                Diseñar Alternativa de Rodada
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-serif italic">
                Configura fecha, puntos intermedios en Google Maps, nivel y plan de ruta.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-[#141312] p-2 rounded-full border border-[#E5DFD5] hover:border-[#141312] transition shrink-0 bg-[#FAF8F5]"
              title="Cerrar creador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-4 gap-2 mt-5">
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
                className={`text-center py-2.5 px-1 border transition text-[10px] font-display uppercase tracking-wider rounded-xl ${
                  currentStep === step.num
                    ? 'border-[#141312] bg-[#FAF8F5] text-[#141312] font-black shadow-xs'
                    : currentStep > step.num
                    ? 'border-[#E5DFD5] bg-white text-stone-700 font-bold'
                    : 'border-[#E5DFD5] bg-white text-stone-400 font-bold'
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PASO 1: SELECCIÓN DE FECHA */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-3.5 shadow-xs">
                <span className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
                  Elige la Fecha para esta Alternativa:
                </span>

                {/* Opción A: Mantener la fecha actual */}
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition shadow-xs ${
                  dateMode === 'current'
                    ? 'border-[#141312] bg-white text-[#141312]'
                    : 'border-[#E5DFD5] bg-white text-stone-600 hover:border-stone-400'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="current"
                    checked={dateMode === 'current'}
                    onChange={() => setDateMode('current')}
                    className="mt-1 accent-[#141312]"
                  />
                  <div>
                    <span className="text-xs font-display font-black text-[#141312] block uppercase tracking-wide">
                      Usar la fecha de la convocatoria ({formatHumanDate(rodada.startDate, rodada.endDate, true)})
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5 font-serif italic">
                      Competirás como alternativa directamente para la fecha fijada de la rodada.
                    </span>
                  </div>
                </label>

                {/* Opción B: Proponer otra fecha */}
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition shadow-xs ${
                  dateMode === 'custom'
                    ? 'border-[#141312] bg-white text-[#141312]'
                    : 'border-[#E5DFD5] bg-white text-stone-600 hover:border-stone-400'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="custom"
                    checked={dateMode === 'custom'}
                    onChange={() => setDateMode('custom')}
                    className="mt-1 accent-[#141312]"
                  />
                  <div className="w-full">
                    <span className="text-xs font-display font-black text-[#141312] block uppercase tracking-wide">
                      Proponer otra opción de fecha
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5 font-serif italic">
                      Si crees que otra fecha es mejor para la tribu (ej. siguiente fin de semana).
                    </span>

                    {dateMode === 'custom' && (
                      <div className="mt-3 pt-3 border-t border-[#E5DFD5] space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isMultiDay"
                            checked={isMultiDay}
                            onChange={(e) => setIsMultiDay(e.target.checked)}
                            className="accent-[#141312]"
                          />
                          <label htmlFor="isMultiDay" className="text-xs text-stone-700 cursor-pointer font-serif italic">
                            ¿Es rodada de varios días / fin de semana?
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-stone-500 font-display font-bold uppercase block mb-1">Fecha de Inicio</label>
                            <input
                              type="date"
                              required={dateMode === 'custom'}
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              className="w-full bg-[#FAF8F5] border border-[#DDD7CB] px-3 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                            />
                          </div>

                          {isMultiDay && (
                            <div>
                              <label className="text-[10px] text-stone-500 font-display font-bold uppercase block mb-1">Fecha de Fin</label>
                              <input
                                type="date"
                                required={dateMode === 'custom' && isMultiDay}
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full bg-[#FAF8F5] border border-[#DDD7CB] px-3 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                              />
                            </div>
                          )}
                        </div>

                        {customStartDate && (
                          <div className="p-2.5 border border-[#E5DFD5] bg-white rounded-xl text-xs text-[#C84B31] font-display font-bold">
                            Fecha propuesta: {formatHumanDate(customStartDate, isMultiDay ? customEndDate : undefined, true)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                {/* Opción C: Fecha por definir */}
                <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition shadow-xs ${
                  dateMode === 'tbd'
                    ? 'border-[#141312] bg-white text-[#141312]'
                    : 'border-[#E5DFD5] bg-white text-stone-600 hover:border-stone-400'
                }`}>
                  <input
                    type="radio"
                    name="dateMode"
                    value="tbd"
                    checked={dateMode === 'tbd'}
                    onChange={() => setDateMode('tbd')}
                    className="mt-1 accent-[#141312]"
                  />
                  <div>
                    <span className="text-xs font-display font-black text-[#141312] block uppercase tracking-wide">
                      Fecha Por Definir / A Consenso
                    </span>
                    <span className="text-[11px] text-stone-500 block mt-0.5 font-serif italic">
                      Proponer la ruta primero y decidir la fecha después en el chat de la tribu.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-[#141312] hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 rounded-xl transition shadow-sm active:scale-95"
                >
                  <span>Continuar a Ruta & Maps</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: MAPS & RUTA CONECTADA */}
          {currentStep === 2 && (
            <div className="space-y-4">
              
              {/* Origen (Punto A) */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#141312]" />
                    Punto de Salida / Origen (A)
                  </label>
                  <span className="text-[10px] text-stone-400 font-serif italic">Inicio de ruta</span>
                </div>

                <input
                  type="text"
                  required
                  value={originPoint}
                  onChange={(e) => setOriginPoint(e.target.value)}
                  placeholder="Ej. Interlomas, Huixquilucan o Caseta Tlalpan"
                  className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2.5 text-[#141312] text-xs placeholder-stone-400 focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                />

                {/* Accesos rápidos comunes */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-stone-500 font-serif italic">Sugerencias:</span>
                  {['Interlomas', 'Caseta Tlalpan', 'Perisur', 'Santa Fe', 'Caseta Tepotzotlán'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setOriginPoint(sug)}
                      className="text-[10px] px-2.5 py-1 rounded-lg border border-[#E5DFD5] bg-white hover:border-[#141312] text-stone-600 hover:text-[#141312] font-display font-bold uppercase transition shadow-xs"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Puntos Medios / Paradas en Ruta */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
                      Paradas Intermedias & Puntos de Interés
                    </label>
                    <p className="text-[11px] text-stone-500 font-serif italic">
                      Añade haciendas, miradores, desayunos o paradas de gasolina en el camino.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-1.5 border border-[#141312] bg-[#141312] text-white hover:bg-black text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 rounded-xl transition shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Parada</span>
                  </button>
                </div>

                {intermediateStops.length === 0 ? (
                  <div className="p-4 border border-dashed border-[#DDD7CB] rounded-xl text-center text-xs text-stone-500 font-serif italic bg-white">
                    No has añadido paradas intermedias aún. Haz clic en &ldquo;Añadir Parada&rdquo; si harás escala a comer, ver haciendas o miradores.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {intermediateStops.map((stop, index) => (
                      <div key={stop.id} className="p-4 border border-[#E5DFD5] bg-white rounded-xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-display font-black text-[#141312] uppercase tracking-wide flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF8F5] border border-[#DDD7CB] text-[#141312] flex items-center justify-center text-[10px] font-black">
                              {String.fromCharCode(66 + index)}
                            </span>
                            Parada {index + 1}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-stone-400 hover:text-[#141312] disabled:opacity-30 rounded-lg border border-transparent hover:border-[#E5DFD5]"
                              title="Mover antes"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStop(index, 'down')}
                              disabled={index === intermediateStops.length - 1}
                              className="p-1.5 text-stone-400 hover:text-[#141312] disabled:opacity-30 rounded-lg border border-transparent hover:border-[#E5DFD5]"
                              title="Mover después"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStop(stop.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 ml-1 rounded-lg border border-transparent hover:border-rose-200"
                              title="Eliminar parada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Nombre del punto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[10px] text-stone-500 font-display font-bold uppercase block mb-1">Nombre del Lugar / Parada</label>
                            <input
                              type="text"
                              required
                              value={stop.name}
                              onChange={(e) => handleUpdateStop(stop.id, { name: e.target.value })}
                              placeholder="Ej. Hacienda Santa María Regla"
                              className="w-full bg-[#FAF8F5] border border-[#DDD7CB] px-3 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-stone-500 font-display font-bold uppercase block mb-1">Tipo de Parada</label>
                            <select
                              value={stop.type}
                              onChange={(e) => handleUpdateStop(stop.id, { type: e.target.value as WaypointType })}
                              className="w-full bg-[#FAF8F5] border border-[#DDD7CB] px-3 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
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
                          <label className="text-[10px] text-stone-500 font-display font-bold uppercase block mb-1">
                            Breve descripción de la parada (¿Qué se hace aquí?)
                          </label>
                          <input
                            type="text"
                            value={stop.description}
                            onChange={(e) => handleUpdateStop(stop.id, { description: e.target.value })}
                            placeholder="Ej. Parada a desayunar cecina y café de olla en el mercado"
                            className="w-full bg-[#FAF8F5] border border-[#DDD7CB] px-3 py-2 text-[#141312] text-xs placeholder-stone-400 focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Destino Final (Punto Z) */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-[#C84B31]" />
                    Destino Final (Meta)
                  </label>
                  <span className="text-[10px] text-stone-400 font-serif italic">Fin de recorrido</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={destinationPoint}
                      onChange={(e) => setDestinationPoint(e.target.value)}
                      placeholder="Ej. Mineral del Chico o Valle de Bravo"
                      className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2.5 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={destinationState}
                      onChange={(e) => setDestinationState(e.target.value)}
                      placeholder="Estado (ej. Hidalgo)"
                      className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2.5 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Conexión en vivo con Google Maps Preview */}
              <div className="p-4 border border-[#E5DFD5] bg-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <span className="text-xs font-display font-black text-[#141312] uppercase flex items-center gap-1.5 tracking-wide">
                    <Compass className="w-4 h-4 text-[#C84B31]" />
                    Ruta Conectada en Google Maps
                  </span>
                  <p className="text-[11px] text-stone-500 font-serif italic">
                    Se generará el enlace secuencial con todas las paradas ordenadas (A &rarr; B &rarr; C &rarr; Z).
                  </p>
                </div>

                <a
                  href={previewMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#141312] bg-[#141312] text-white hover:bg-black text-xs uppercase font-display font-black tracking-wider flex items-center gap-1.5 shrink-0 justify-center transition rounded-xl shadow-xs active:scale-95"
                >
                  <span>Probar en Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#F2B705]" />
                </a>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-[#E5DFD5] hover:border-[#141312] bg-white text-stone-600 hover:text-[#141312] text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 transition rounded-xl shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-[#141312] hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 rounded-xl transition shadow-sm active:scale-95"
                >
                  <span>Continuar a Logística</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: LOGÍSTICA, DIFICULTAD & HORA */}
          {currentStep === 3 && (
            <div className="space-y-4">
              
              {/* Hora de salida & Distancia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl shadow-xs">
                <div>
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block mb-1">
                    Hora de Salida
                  </label>
                  <input
                    type="text"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    placeholder="Ej. 07:30 AM"
                    className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block mb-1">
                    Distancia Total Aprox. (km)
                  </label>
                  <input
                    type="number"
                    value={totalKm}
                    onChange={(e) => setTotalKm(Number(e.target.value))}
                    className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block mb-1">
                    Tiempo Estimado
                  </label>
                  <input
                    type="text"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="Ej. 4h 30m"
                    className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                  />
                </div>
              </div>

              {/* Nivel de Dificultad */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-3.5 shadow-xs">
                <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
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
                      className={`p-3.5 text-left border rounded-xl transition shadow-xs ${
                        difficulty === item.lvl
                          ? 'border-[#141312] bg-white text-[#141312]'
                          : 'border-[#E5DFD5] bg-white text-stone-600 hover:border-[#141312]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-display font-black uppercase tracking-wide">{item.lvl}</span>
                        {item.lvl === 'Desconocido / Por explorar' && (
                          <span className="text-[9px] font-display uppercase font-black bg-[#FAF8F5] text-[#C84B31] border border-[#E5DFD5] px-2 py-0.5 rounded">
                            Exploración
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 font-serif italic">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Porcentaje de Terracería vs Asfalto */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
                    Composición del Terreno
                  </label>
                  <span className="text-xs font-mono font-bold text-[#141312]">
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
                  className="w-full accent-[#141312] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-stone-500 font-serif italic">
                  <span>100% Carretera / Curvas</span>
                  <span>50 / 50 Mixto</span>
                  <span>100% Brecha Off-Road</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-[#E5DFD5] hover:border-[#141312] bg-white text-stone-600 hover:text-[#141312] text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 transition rounded-xl shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-[#141312] hover:bg-black text-white text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 rounded-xl transition shadow-sm active:scale-95"
                >
                  <span>Continuar a Resumen</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: PLAN, TÍTULO & CONFIRMACIÓN */}
          {currentStep === 4 && (
            <div className="space-y-4">
              
              {/* Título de la Ruta */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-2 shadow-xs">
                <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
                  Título de la Ruta Propuesta
                </label>
                <input
                  type="text"
                  required
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  placeholder="Ej. Ruta de las Haciendas & Paso de la Montaña"
                  className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2.5 text-[#141312] text-xs focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                />
              </div>

              {/* Resumen del Plan */}
              <div className="border border-[#E5DFD5] bg-[#FAF8F5] p-5 rounded-2xl space-y-2 shadow-xs">
                <label className="text-[10px] font-display text-[#C84B31] uppercase font-black tracking-widest block">
                  Resumen o Descripción del Plan
                </label>
                <textarea
                  rows={4}
                  required
                  value={planSummary}
                  onChange={(e) => setPlanSummary(e.target.value)}
                  placeholder="Explica el plan general: horarios, tipo de comida, paradas y equipo recomendado."
                  className="w-full bg-white border border-[#DDD7CB] px-3.5 py-2.5 text-[#141312] text-xs placeholder-stone-400 focus:outline-none focus:border-[#141312] rounded-xl shadow-xs"
                />
              </div>

              {/* Notificación Preview a Celulares */}
              <div className="p-4 border border-[#E5DFD5] bg-[#FAF8F5] rounded-xl flex items-start gap-3 shadow-xs">
                <div className="p-2 bg-white border border-[#E5DFD5] rounded-lg text-[#C84B31] shrink-0 mt-0.5 shadow-xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-display font-black text-[#141312] uppercase tracking-wide block">
                    Notificación que recibirán los integrantes en su celular:
                  </span>
                  <p className="text-stone-600 text-[11px] font-serif italic leading-relaxed">
                    &ldquo;{currentUser.name} ha propuesto una alternativa de ruta: <strong className="not-italic text-[#141312] font-display font-bold">&lsquo;{routeTitle || 'Ruta Propuesta'}&rsquo;</strong> para el {dateMode === 'current' ? formatHumanDate(rodada.startDate, rodada.endDate, true) : dateMode === 'custom' ? formatHumanDate(customStartDate, isMultiDay ? customEndDate : undefined, true) : 'Por Definir'}. Entra a votar manita arriba o abajo.&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 border border-[#E5DFD5] hover:border-[#141312] bg-white text-stone-600 hover:text-[#141312] text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 transition rounded-xl shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#141312] hover:bg-black text-white text-xs font-display font-black uppercase tracking-widest flex items-center gap-2 transition shadow-md rounded-xl active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#F2B705]" />
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
