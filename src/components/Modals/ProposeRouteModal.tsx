'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import { Compass, Plus, Trash2, MapPin, Tent } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProposeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposeRouteModal: React.FC<ProposeRouteModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentRodada, proposeRoute } = useApp();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [state, setState] = useState('Estado de México');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [totalKm, setTotalKm] = useState<number>(140);
  const [estimatedHours, setEstimatedHours] = useState('2h 30m asfalto + 4h brechas');
  const [offroadPercentage, setOffroadPercentage] = useState<number>(45);
  const [difficulty, setDifficulty] = useState<RouteProposal['difficulty']>('Fácil (Fluida)');
  const [campsiteName, setCampsiteName] = useState('');
  const [campsiteElevation, setCampsiteElevation] = useState<number>(2800);
  const [campsiteTemp, setCampsiteTemp] = useState('4°C a 8°C');
  const [dayOfDeadVibe, setDayOfDeadVibe] = useState('Fogatas nocturnas en bosque y ofrendas tradicionales');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !currentRodada) return;

    // Approximate coordinates based on state/destination
    let coords: [number, number][] = [
      [19.4005, -99.2816], // Interlomas start
      [19.3500, -99.4800],
      [19.3100, -99.7000],
      [19.2500, -99.9000]
    ];

    proposeRoute({
      rodadaId: currentRodada.id,
      title: title.trim(),
      destination: destination.trim(),
      state: state.trim(),
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: description.trim() || 'Ruta escénica propuesta por ' + currentUser.name,
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1000',
      totalKm,
      estimatedHours,
      offroadPercentage,
      asphaltPercentage: 100 - offroadPercentage,
      difficulty,
      campsite: {
        name: campsiteName.trim() || 'Campamento Base ' + destination,
        elevationMeters: campsiteElevation,
        minTempNight: campsiteTemp,
        security: 'Zona controlada y vigilada para acampar',
        amenities: ['Área de fogata', 'Baños', 'Espacio para motos']
      },
      itinerary: [
        {
          day: 1,
          title: `Interlomas a ${destination} + Reconocimiento`,
          description: 'Salida de Interlomas, montaje de campamento base y rodada vespertina ligera.',
          distanceKm: Math.round(totalKm * 0.4),
          offroadKm: Math.round(totalKm * 0.4 * (offroadPercentage / 100)),
          terrainType: 'Asfalto y brecha forestal compacta'
        },
        {
          day: 2,
          title: 'Loop Off-Road Sin Maletas (Día Completo)',
          description: 'Recorrido circular exploratorio dejando todo el equipaje en el campamento.',
          distanceKm: Math.round(totalKm * 0.4),
          offroadKm: Math.round(totalKm * 0.4 * (offroadPercentage / 100)),
          terrainType: 'Terracería, grava y curvas de montaña'
        },
        {
          day: 3,
          title: 'Desmonte y Regreso por Brechas Panorámicas',
          description: 'Desayuno campirano y retorno ágil a Interlomas antes del tráfico de la tarde.',
          distanceKm: Math.round(totalKm * 0.2),
          offroadKm: Math.round(totalKm * 0.2 * (offroadPercentage / 100)),
          terrainType: 'Brechas secundarias y autopista'
        }
      ],
      waypoints: [
        { id: 'w1', name: 'Salida Interlomas', lat: 19.4005, lng: -99.2816, type: 'start', notes: 'Punto de reunión' },
        { id: 'w2', name: `Basecamp ${destination}`, lat: 19.3200, lng: -99.9000, type: 'camp', notes: 'Área de tiendas' }
      ],
      coordinates: coords,
      dayOfDeadVibe: dayOfDeadVibe.trim(),
      safetyTips: ['Revisar presión de llantas', 'Llevar sleeping bag térmico', 'Cargar leña temprano']
    });

    confetti({ particleCount: 70, spread: 80 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">Proponer Nueva Ruta al Grupo</h3>
              <p className="text-xs text-slate-400">Sube tu propuesta para que el grupo vote por ella.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Título de la Propuesta</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Paso de Cortés & Amecameca por Brechas Altas"
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Destino / Zona</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Izta-Popo / Paso de Cortés"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Estado</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ej. Edomex / Puebla"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Distancia (km)</label>
              <input
                type="number"
                value={totalKm}
                onChange={(e) => setTotalKm(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">% Off-Road</label>
              <input
                type="number"
                min="0"
                max="100"
                value={offroadPercentage}
                onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Fácil (Fluida)">Fácil (Fluida)</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado / Técnico">Avanzado / Técnico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Campamento Base</label>
              <input
                type="text"
                value={campsiteName}
                onChange={(e) => setCampsiteName(e.target.value)}
                placeholder="Ej. Parque Apatlaco"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Altitud (msnm)</label>
              <input
                type="number"
                value={campsiteElevation}
                onChange={(e) => setCampsiteElevation(Number(e.target.value))}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400">Clima Noche</label>
              <input
                type="text"
                value={campsiteTemp}
                onChange={(e) => setCampsiteTemp(e.target.value)}
                placeholder="Ej. 1°C a 5°C"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Descripción / Por qué recomiendas esta ruta</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica qué tipo de suelo hay, vistas, etc."
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">URL Imagen de Portada (Opcional)</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 shadow-glow"
            >
              Publicar Propuesta & Abrir Votos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
