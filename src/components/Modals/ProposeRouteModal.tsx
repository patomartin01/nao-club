'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import confetti from 'canvas-confetti';

interface ProposeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecordRoute?: () => void;
}

export const ProposeRouteModal: React.FC<ProposeRouteModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenRecordRoute
}) => {
  const { currentUser, currentRodada, rodadas, proposeRoute } = useApp();

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
    const targetRodada = currentRodada || rodadas[0];
    if (!title.trim() || !destination.trim() || !targetRodada) return;

    let coords: [number, number][] = [
      [19.4005, -99.2816], // Interlomas
      [19.3500, -99.4800],
      [19.3100, -99.7000],
      [19.2500, -99.9000]
    ];

    proposeRoute({
      rodadaId: targetRodada.id,
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

    confetti({ particleCount: 50, spread: 70 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="border border-white/20 bg-[#0E0C0A] max-w-xl w-full p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ NUEVA PROPUESTA DE RUTA ]
            </span>
            <h3 className="font-display font-bold text-2xl text-white uppercase">
              Proponer Variante al Grupo
            </h3>
          </div>
          <button onClick={onClose} className="font-mono text-ash hover:text-white">✕</button>
        </div>

        {onOpenRecordRoute && (
          <div className="p-3 bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
            <span className="text-ash text-[11px]">¿Prefieres registrar las curvas conduciendo en moto?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecordRoute();
              }}
              className="text-earth hover:text-white font-bold text-[10px] uppercase tracking-wider underline transition"
            >
              Instrumento GPS en Vivo →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Título de la Variante</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Bosques de Amanalco & Monte Alto por Los Saucos"
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Destino / Zona</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Corral de Piedra / Valle de Bravo"
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>

            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Estado</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ej. Estado de México"
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Distancia (km)</label>
              <input
                type="number"
                value={totalKm}
                onChange={(e) => setTotalKm(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>

            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">% Off-Road</label>
              <input
                type="number"
                min="0"
                max="100"
                value={offroadPercentage}
                onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              />
            </div>

            <div>
              <label className="text-ash uppercase text-[10px] block mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
              >
                <option value="Fácil (Fluida)">Fácil (Fluida)</option>
                <option value="Intermedia">Intermedia</option>
                <option value="Técnica">Técnica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-ash uppercase text-[10px] block mb-1">Descripción & Brechas Destacadas</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el tipo de suelo (pinocha, grava, tierra compacta) y paradas de abastecimiento..."
              className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold tracking-widest transition"
            >
              Publicar Variante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
