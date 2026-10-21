'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Motorcycle, BikeType, RidingLevel } from '../../types';
import { Plus, Trash2, Shield, Gauge, Check } from 'lucide-react';

export const GarageView: React.FC = () => {
  const { currentUser, userBikes, addMotorcycle, deleteMotorcycle } = useApp();
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);

  // New bike form state
  const [brand, setBrand] = useState('BMW');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [displacementCc, setDisplacementCc] = useState<number>(1250);
  const [type, setType] = useState<BikeType>('Doble Propósito');
  const [nickname, setNickname] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tires, setTires] = useState('Continental TKC80 (50/50)');
  const [modificationsInput, setModificationsInput] = useState('Skid plate de aluminio, Defensas altas de motor, Faros auxiliares');

  const handleCreateBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;

    const modsArray = modificationsInput
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    addMotorcycle({
      userId: currentUser.id,
      brand,
      model: model.trim(),
      year,
      displacementCc,
      type,
      nickname: nickname.trim() || undefined,
      photoUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      modifications: modsArray.length > 0 ? modsArray : ['Original de fábrica'],
      tires: tires.trim() || 'Llantas Mixtas 70/30'
    });

    setModel('');
    setNickname('');
    setPhotoUrl('');
    setShowAddBikeModal(false);
  };

  return (
    <div className="space-y-12 pb-32 text-chalk">
      
      {/* 01. PILOT IDENTIFICATION MATRIX */}
      <section className="border border-white/10 bg-[#0B0A09]">
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-20 h-20 object-cover border-2 border-earth shrink-0"
            />
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                [ 04 // PILOTO & HANGAR ACTIVO ]
              </span>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white uppercase tracking-tight">
                {currentUser.name}
              </h1>
              <p className="font-mono text-xs text-ash">
                {currentUser.location} · {currentUser.bio}
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#0E0C0A] font-mono text-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>NIVEL DE MANEJO:</span>
                <span className="text-white font-bold">{currentUser.ridingLevel.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-ash border-b border-white/[0.06] pb-2">
                <span>EXPEDICIONES ACTIVAS:</span>
                <span className="text-earth font-bold">01 // DÍA DE MUERTOS</span>
              </div>
              <div className="flex justify-between text-ash">
                <span>MÁQUINAS REGISTRADAS:</span>
                <span className="text-white font-bold">{userBikes.length} UNIDADES</span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setShowAddBikeModal(true)}
                className="w-full py-3 bg-white hover:bg-earth text-obsidian hover:text-white font-mono text-xs uppercase font-bold tracking-widest transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Registrar Moto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry cells */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 font-mono text-xs">
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">ID Piloto</span>
            <p className="font-bold text-white text-base mt-1">#NAO-001</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Estilo Predilecto</span>
            <p className="font-bold text-earth text-base mt-1">Dual-Sport / Trail</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Punto de Partida</span>
            <p className="font-bold text-white text-base mt-1">Interlomas, Huixquilucan</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-ash uppercase tracking-wider block">Membresía</span>
            <p className="font-bold text-emerald-400 text-base mt-1">Navana Club Founder</p>
          </div>
        </div>
      </section>

      {/* 02. HANGAR FLEET */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
              [ MÁQUINAS EN HANGAR ]
            </span>
            <h2 className="font-display font-bold text-2xl text-white uppercase mt-1">
              Flotilla de Motos Registradas
            </h2>
          </div>

          <button
            onClick={() => setShowAddBikeModal(true)}
            className="px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase tracking-wider hover:border-earth transition"
          >
            + Añadir al Hangar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBikes.map((bike) => (
            <div 
              key={bike.id} 
              className="border border-white/10 bg-[#0B0A09] flex flex-col justify-between"
            >
              <div className="h-56 w-full relative overflow-hidden border-b border-white/10">
                <img 
                  src={bike.photoUrl} 
                  alt={bike.model} 
                  className="w-full h-full object-cover filter brightness-85"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] text-white border border-white/20">
                  {bike.brand.toUpperCase()} · {bike.displacementCc} CC
                </div>
                {bike.nickname && (
                  <div className="absolute top-4 right-4 bg-earth text-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase">
                    &quot;{bike.nickname}&quot;
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-white uppercase">
                    {bike.brand} {bike.model} ({bike.year})
                  </h3>
                  <p className="font-mono text-xs text-ash mt-1">
                    Compuesto: <strong className="text-white">{bike.tires}</strong>
                  </p>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <span className="font-mono text-[9px] text-ash uppercase tracking-wider block mb-1">
                    Preparación Off-Road & Accesorios
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bike.modifications.map((mod, i) => (
                      <span 
                        key={i} 
                        className="font-mono text-[10px] bg-white/[0.04] border border-white/10 px-2 py-0.5 text-chalk"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-xs">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold">
                    Lista para Ruta de Terracería
                  </span>
                  <button
                    onClick={() => deleteMotorcycle(bike.id)}
                    className="text-ash hover:text-rose-400 p-1"
                    title="Eliminar de hangar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 03. ADD BIKE MODAL */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="border border-white/20 bg-[#0E0C0A] max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold">
                  [ HANGAR NAVANA ]
                </span>
                <h3 className="font-display font-bold text-xl text-white uppercase">
                  Registrar Nueva Moto
                </h3>
              </div>
              <button 
                onClick={() => setShowAddBikeModal(false)}
                className="font-mono text-ash hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBike} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  >
                    <option value="BMW">BMW Motorrad</option>
                    <option value="KTM">KTM</option>
                    <option value="Husqvarna">Husqvarna</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Honda">Honda</option>
                    <option value="Ducati">Ducati</option>
                    <option value="Triumph">Triumph</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kawasaki">Kawasaki</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                  </select>
                </div>

                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. R 1250 GS, Ténéré 700"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>

                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Cilindrada (cc)</label>
                  <input
                    type="number"
                    value={displacementCc}
                    onChange={(e) => setDisplacementCc(Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              <div>
                <label className="text-ash uppercase text-[10px] block mb-1">Neumáticos Montados</label>
                <input
                  type="text"
                  value={tires}
                  onChange={(e) => setTires(e.target.value)}
                  placeholder="Ej. Metzeler Karoo 4 (50/50)"
                  className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                />
              </div>

              <div>
                <label className="text-ash uppercase text-[10px] block mb-1">Modificaciones & Protecciones (separadas por coma)</label>
                <input
                  type="text"
                  value={modificationsInput}
                  onChange={(e) => setModificationsInput(e.target.value)}
                  placeholder="Skid plate, Faros auxiliares, Escape Akrapovic"
                  className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="w-1/2 py-3 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-earth hover:bg-earth-bright text-white uppercase font-bold tracking-widest transition"
                >
                  Guardar en Hangar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
