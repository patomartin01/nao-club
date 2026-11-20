'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RouteProposal } from '../../types';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="border border-[#1A1918]/10 bg-[#FAF6ED] max-w-xl w-full p-6 sm:p-8 space-y-5 my-auto max-h-[94vh] overflow-y-auto shadow-sm relative text-[#1A1918] font-sans rounded-[28px] animate-scaleUp">
        <div className="flex items-center justify-between border-b border-[#1A1918]/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-semibold">
              NUEVA PROPUESTA DE RUTA
            </span>
            <h3 className="font-display font-semibold text-2xl text-[#1A1918] mt-1">
              Proponer variante al grupo
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 border border-[#1A1918]/10 bg-[#F4EEDB] hover:bg-[#E6332A] hover:text-white text-[#1A1918] rounded-xl transition shadow-sm flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {onOpenRecordRoute && (
          <div className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-2xl flex items-center justify-between text-xs shadow-sm">
            <span className="text-[#1A1918]/70 font-sans text-xs font-medium">¿Prefieres registrar las curvas conduciendo en moto?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenRecordRoute();
              }}
              className="text-[#E6332A] hover:text-[#1A1918] font-sans font-semibold text-[10px] uppercase tracking-wider underline transition"
            >
              GPS en Vivo →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Título de la variante</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Bosques de Amanalco & Monte Alto por Los Saucos"
              className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Destino / Zona</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Corral de Piedra / Valle de Bravo"
                className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
              />
            </div>

            <div>
              <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Estado</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ej. Estado de México"
                className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Distancia (km)</label>
              <input
                type="number"
                value={totalKm}
                onChange={(e) => setTotalKm(Number(e.target.value))}
                className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">% Off-Road</label>
              <input
                type="number"
                min="0"
                max="100"
                value={offroadPercentage}
                onChange={(e) => setOffroadPercentage(Number(e.target.value))}
                className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Dificultad</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm font-sans font-semibold"
              >
                <option value="Fácil (Fluida)">Fácil (Fluida)</option>
                <option value="Intermedia">Intermedia</option>
                <option value="Técnica">Técnica</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#1A1918]/70 uppercase font-sans font-semibold text-[10px] block mb-1">Descripción &amp; Brechas Destacadas</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el tipo de suelo (pinocha, grava, tierra compacta) y paradas de abastecimiento..."
              className="w-full bg-[#F4EEDB] border border-[#1A1918]/10 px-3.5 py-2.5 text-[#1A1918] focus:outline-none focus:border-[#E6332A] rounded-xl shadow-sm resize-none font-medium"
            />
          </div>

          <div className="pt-4 border-t border-[#1A1918]/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 border border-[#1A1918]/10 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] font-sans font-semibold text-xs transition rounded-xl shadow-sm active:shadow-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white border border-[#1A1918]/10 font-sans font-semibold text-xs transition rounded-xl shadow-sm active:shadow-none"
            >
              Publicar variante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
