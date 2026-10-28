'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Motorcycle, BikeType, RidingLevel } from '../../types';
import { Plus, Trash2, Shield, Gauge, Check, X, Bike, Wrench } from 'lucide-react';
import { EditMotorcycleModal } from '../Modals/EditMotorcycleModal';

export const GarageView: React.FC = () => {
  const { currentUser, userBikes, addMotorcycle, updateMotorcycle, deleteMotorcycle } = useApp();
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [editingBike, setEditingBike] = useState<Motorcycle | null>(null);

  // New bike form state
  const [brand, setBrand] = useState('BMW');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2023);
  const [displacementCc, setDisdisplacementCc] = useState<number>(1250);
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
    <div className="space-y-12 pb-32 text-[#141312] font-sans">
      
      {/* 01. DEUS WORKSHOP PILOT DOSSIER */}
      <section className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] shadow-[6px_6px_0px_#1A1918] overflow-hidden">
        <div className="grid grid-cols-12 border-b-2 border-[#1A1918]">
          <div className="col-span-12 md:col-span-8 p-6 sm:p-10 border-b-2 md:border-b-0 md:border-r-2 border-[#1A1918] flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[4px_4px_0px_#1A1918] shrink-0 bg-[#F4EEDB]">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black">
                  ★ EXPEDITION WORKSHOP &amp; FLEET ★
                </span>
                <span className="text-[9px] font-mono bg-[#FAF6ED] px-2.5 py-0.5 border-2 border-[#1A1918] rounded-md font-black text-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
                  TALLER NO. 01
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1A1918] uppercase tracking-wide">
                {currentUser.name}
              </h1>
              <p className="font-serif italic text-sm text-[#1A1918]/70 font-medium">
                {currentUser.location} — {currentUser.bio}
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 p-6 sm:p-8 flex flex-col justify-between bg-[#F4EEDB] font-sans text-xs">
            <div className="space-y-3">
              <div className="flex justify-between text-[#1A1918]/80 border-b-2 border-[#1A1918] pb-2">
                <span className="font-serif italic font-bold">NIVEL DE MANEJO:</span>
                <span className="text-[#1A1918] font-display font-black uppercase tracking-wider">{currentUser.ridingLevel}</span>
              </div>
              <div className="flex justify-between text-[#1A1918]/80 border-b-2 border-[#1A1918] pb-2">
                <span className="font-serif italic font-bold">ESTATUS TALLER:</span>
                <span className="text-[#E6332A] font-display font-black tracking-wider">MÁQUINAS LISTAS</span>
              </div>
              <div className="flex justify-between text-[#1A1918]/80">
                <span className="font-serif italic font-bold">MÁQUINAS ACTIVAS:</span>
                <span className="text-[#1A1918] font-display font-black tracking-wider">{userBikes.length} UNIDADES</span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setShowAddBikeModal(true)}
                className="w-full py-3.5 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display text-xs uppercase font-black tracking-widest transition rounded-xl flex items-center justify-center gap-2 border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>+ Registrar Máquina</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workshop Telemetry cells */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#1A1918] font-sans text-xs bg-[#FAF6ED]">
          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 font-serif italic uppercase tracking-wider block font-bold">ID Registro</span>
            <p className="font-display font-black text-[#1A1918] text-lg mt-1 uppercase tracking-wider">PILOT-01</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 font-serif italic uppercase tracking-wider block font-bold">Disciplina</span>
            <p className="font-display font-black text-[#E06423] text-lg mt-1 uppercase tracking-wider">Dual-Sport / Trail</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 font-serif italic uppercase tracking-wider block font-bold">Basecamp Habitual</span>
            <p className="font-display font-black text-[#1A1918] text-base mt-1 uppercase tracking-wide truncate">Huixquilucan, CDMX</p>
          </div>
          <div className="p-6">
            <span className="text-[10px] text-[#1A1918]/70 font-serif italic uppercase tracking-wider block font-bold">Rango</span>
            <p className="font-display font-black text-[#E6332A] text-lg mt-1 uppercase tracking-wider">Rider Titular</p>
          </div>
        </div>
      </section>

      {/* 02. WORKSHOP STABLE / MACHINES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
          <div>
            <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black">
              ★ CUSTOM STABLE &amp; FLEET ★
            </span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-[#1A1918] uppercase tracking-wide mt-1">
              Máquinas en Garaje
            </h2>
          </div>

          <button
            onClick={() => setShowAddBikeModal(true)}
            className="px-4 py-2.5 border-2 border-[#1A1918] bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] font-display text-xs uppercase tracking-widest font-black transition rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#1A1918]" />
            <span>+ Añadir al Taller</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBikes.map((bike) => (
            <div 
              key={bike.id} 
              className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[24px] transition duration-200 flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] group"
            >
              <div className="h-64 w-full relative overflow-hidden bg-[#F4EEDB] border-b-2 border-[#1A1918]">
                <img 
                  src={bike.photoUrl} 
                  alt={bike.model} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-95"
                />
                
                <div className="absolute top-4 left-4 bg-[#FAF6ED] px-3.5 py-1.5 font-display uppercase tracking-widest text-[11px] text-[#1A1918] border-2 border-[#1A1918] font-black shadow-[2px_2px_0px_#1A1918] rounded-lg">
                  {bike.brand.toUpperCase()} • {bike.displacementCc} CC
                </div>

                <div className="absolute bottom-4 left-4 font-mono text-[9px] uppercase font-black text-[#FAF6ED] bg-[#1A1918] px-2.5 py-1 rounded-md border border-[#FAF6ED]/20 shadow-[2px_2px_0px_#1A1918]">
                  INSPECCIÓN TÉCNICA // OK
                </div>

                {bike.nickname && (
                  <div className="absolute top-4 right-4 bg-[#E6332A] text-white px-3 py-1 font-display text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] border-2 border-[#1A1918] rounded-lg">
                    &quot;{bike.nickname}&quot;
                  </div>
                )}

                {/* Quick Edit shortcut on photo */}
                <button
                  onClick={() => setEditingBike(bike)}
                  className="absolute bottom-4 right-4 bg-[#FAF6ED] hover:bg-[#F7B32B] text-[#1A1918] px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] border-2 border-[#1A1918] rounded-lg flex items-center gap-1 transition cursor-pointer"
                  title="Editar ficha de la moto"
                >
                  <Wrench className="w-3 h-3 text-[#E6332A]" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <h3 className="font-display font-black text-xl sm:text-2xl text-[#1A1918] uppercase tracking-wide group-hover:text-[#E6332A] transition">
                    {bike.brand} {bike.model} ({bike.year})
                  </h3>
                  <p className="font-serif italic text-xs text-[#1A1918]/70 mt-1 font-medium">
                    Compuesto &amp; Neumáticos: <strong className="text-[#1A1918] font-sans font-bold">{bike.tires}</strong>
                  </p>
                </div>

                <div className="border-t-2 border-[#1A1918] pt-3">
                  <span className="font-display uppercase tracking-wider text-[10px] text-[#1A1918]/70 font-black block mb-2">
                    Preparación &amp; Modificaciones de Taller
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {bike.modifications.map((mod, i) => (
                      <span 
                        key={i} 
                        className="font-sans text-xs bg-[#F4EEDB] border-2 border-[#1A1918] px-3 py-1 text-[#1A1918] rounded-lg font-bold shadow-[1px_1px_0px_#1A1918]"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-[#1A1918] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingBike(bike)}
                    className="px-3.5 py-1.5 bg-[#F4EEDB] hover:bg-[#F7B32B] text-[#1A1918] font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    title="Editar ficha técnica de la máquina"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#E6332A]" />
                    <span>Editar Ficha Moto</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#1A1918]/70 font-black">
                      #{bike.id.slice(0, 8)}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`¿Dar de baja la ${bike.brand} ${bike.model} de tu hangar?`)) {
                          deleteMotorcycle(bike.id);
                        }
                      }}
                      className="p-2 text-[#1A1918]/60 hover:text-white hover:bg-[#E6332A] rounded-lg transition border border-transparent hover:border-[#1A1918] cursor-pointer"
                      title="Dar de baja máquina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 03. ADD BIKE MODAL (DEUS WORKSHOP REGISTER) */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-[8px_8px_0px_#1A1918] animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
              <div>
                <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black block mb-1">
                  ★ REGISTRO OFICIAL DE TALLER ★
                </span>
                <h3 className="font-display font-black text-2xl text-[#1A1918] uppercase tracking-wide">
                  Registrar Máquina
                </h3>
              </div>
              <button 
                onClick={() => setShowAddBikeModal(false)}
                className="text-[#1A1918] hover:bg-[#E6332A] hover:text-white p-1.5 transition rounded-lg border-2 border-transparent hover:border-[#1A1918]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBike} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
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
                  <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Modelo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. R 1250 GS, Ténéré 700"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold placeholder-[#1A1918]/40 focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>

                <div>
                  <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Cilindrada (cc)</label>
                  <input
                    type="number"
                    value={displacementCc}
                    onChange={(e) => setDisdisplacementCc(Number(e.target.value))}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Neumáticos Montados</label>
                <input
                  type="text"
                  value={tires}
                  onChange={(e) => setTires(e.target.value)}
                  placeholder="Ej. Metzeler Karoo 4 (50/50)"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold placeholder-[#1A1918]/40 focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
                />
              </div>

              <div>
                <label className="text-[#1A1918]/80 uppercase text-[10px] block mb-1 font-display font-black tracking-wider">Modificaciones &amp; Protecciones (separadas por coma)</label>
                <input
                  type="text"
                  value={modificationsInput}
                  onChange={(e) => setModificationsInput(e.target.value)}
                  placeholder="Skid plate, Faros auxiliares, Escape Akrapovic"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-2.5 text-[#1A1918] font-bold placeholder-[#1A1918]/40 focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[2px_2px_0px_#1A1918]"
                />
              </div>

              <div className="pt-4 border-t-2 border-[#1A1918] flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="w-1/2 py-3 border-2 border-[#1A1918] bg-[#F4EEDB] text-[#1A1918] uppercase font-display text-xs tracking-widest hover:bg-[#FAF6ED] transition font-black rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white uppercase font-display text-xs font-black tracking-widest transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none border-2 border-[#1A1918] rounded-xl"
                >
                  Guardar en Garaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 04. EDIT BIKE MODAL */}
      <EditMotorcycleModal
        isOpen={!!editingBike}
        onClose={() => setEditingBike(null)}
        bike={editingBike}
        onSave={(id, updates) => {
          updateMotorcycle(id, updates);
        }}
      />

    </div>
  );
};
