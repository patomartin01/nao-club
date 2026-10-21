'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Motorcycle, BikeType, RidingLevel } from '../../types';
import { Bike, Plus, Trash2, Wrench, Shield, Gauge, MapPin, Mail, Award, Check } from 'lucide-react';

export const GarageView: React.FC = () => {
  const { currentUser, setCurrentUser, userBikes, addMotorcycle, deleteMotorcycle } = useApp();
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
  const [modificationsInput, setModificationsInput] = useState('Skid plate, Defensas altas');

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

    // Reset & close
    setModel('');
    setNickname('');
    setPhotoUrl('');
    setShowAddBikeModal(false);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Rider Profile Card */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-500/50 shadow-glow" 
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                PRO
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-2xl text-white">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-mono text-amber-400">{currentUser.handle}</span>
              </div>
              
              <p className="text-xs text-slate-300 max-w-md">
                {currentUser.bio}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {currentUser.location}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  {currentUser.email}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Award className="w-3.5 h-3.5" />
                  Nivel: {currentUser.ridingLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Rider Stats */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-center shrink-0 w-full sm:w-auto">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Motos</p>
              <p className="text-lg font-black text-amber-400 font-mono">{userBikes.length}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Km Brechas</p>
              <p className="text-lg font-black text-emerald-400 font-mono">1,840</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Expediciones</p>
              <p className="text-lg font-black text-cyan-400 font-mono">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Garage Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
              <Bike className="w-6 h-6 text-amber-400" />
              Mi Garaje de Motos ({userBikes.length})
            </h2>
            <p className="text-xs text-slate-400">
              Registra tus motos para asociarlas a las rodadas y que el grupo conozca tu equipamiento.
            </p>
          </div>

          <button
            onClick={() => setShowAddBikeModal(true)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-glow transition"
          >
            <Plus className="w-4 h-4" /> Registrar Nueva Moto
          </button>
        </div>

        {/* Motorcycle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBikes.map(bike => (
            <div 
              key={bike.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl hover:border-amber-500/50 transition group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                  <img 
                    src={bike.photoUrl} 
                    alt={bike.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/80 text-xs font-mono font-bold text-amber-400">
                    {bike.brand} • {bike.year}
                  </div>

                  <button
                    onClick={() => deleteMotorcycle(bike.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition"
                    title="Eliminar moto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display font-black text-xl text-white">
                      {bike.brand} {bike.model}
                    </h3>
                    {bike.nickname && (
                      <p className="text-xs font-mono text-amber-400">"{bike.nickname}"</p>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Cilindrada</p>
                      <p className="font-mono font-bold text-slate-100">{bike.displacementCc} cc</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Tipo</p>
                      <p className="font-mono font-bold text-slate-100 truncate">{bike.type}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" /> Neumáticos Montados
                    </p>
                    <p className="text-xs font-bold text-slate-200">{bike.tires}</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Modificaciones & Protección
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {bike.modifications.map((mod, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Bike Modal */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-400" />
                Registrar Nueva Moto
              </h3>
              <button onClick={() => setShowAddBikeModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBike} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="BMW">BMW Motorrad</option>
                    <option value="KTM">KTM</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Honda">Honda</option>
                    <option value="Husqvarna">Husqvarna</option>
                    <option value="Ducati">Ducati</option>
                    <option value="Triumph">Triumph</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Kawasaki">Kawasaki</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Modelo</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej. Ténéré 700 / R 1250 GS"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400">Año</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Cilindrada (cc)</label>
                  <input
                    type="number"
                    value={displacementCc}
                    onChange={(e) => setDisplacementCc(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400">Apodo</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ej. La Avispa"
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Tipo de Moto</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as BikeType)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Doble Propósito">Doble Propósito</option>
                  <option value="Adventure / Maxi-Trail">Adventure / Maxi-Trail</option>
                  <option value="Enduro / Dual Sport">Enduro / Dual Sport</option>
                  <option value="Scrambler">Scrambler</option>
                  <option value="Trail Ligera">Trail Ligera</option>
                  <option value="Sport Touring">Sport Touring</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Llantas (Marca y Modelo)</label>
                <input
                  type="text"
                  value={tires}
                  onChange={(e) => setTires(e.target.value)}
                  placeholder="Ej. Mitas E-07+ / Continental TKC80"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Modificaciones (Separadas por comas)</label>
                <input
                  type="text"
                  value={modificationsInput}
                  onChange={(e) => setModificationsInput(e.target.value)}
                  placeholder="Ej. Skid plate de aluminio, Barras bajas, Handguards"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">URL Foto de tu moto (Opcional)</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-300 shadow-glow"
                >
                  Guardar en Garaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
