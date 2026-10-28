'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { 
  ShieldCheck, 
  Users, 
  Bike, 
  Compass, 
  Activity, 
  RefreshCw, 
  Database, 
  Trash2, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboardView: React.FC = () => {
  const { 
    currentUser, 
    users, 
    motorcycles, 
    crews, 
    activities, 
    rodadas, 
    routeProposals, 
    setActiveNavTab,
    isSupabaseOnline 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'crews' | 'motos' | 'database'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isAdmin = currentUser.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || currentUser.id === 'user-patricio';

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      if (isSupabaseConfigured()) {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: crewsCount } = await supabase.from('crews').select('*', { count: 'exact', head: true });
        const { count: bikesCount } = await supabase.from('motorcycles').select('*', { count: 'exact', head: true });
        setStatusMessage(`Sincronización exitosa: ${usersCount ?? 0} usuarios, ${crewsCount ?? 0} clubs, ${bikesCount ?? 0} motos en Supabase.`);
      } else {
        setStatusMessage('Supabase no está disponible en este momento.');
      }
      try { confetti({ particleCount: 30, spread: 60 }); } catch {}
    } catch (err: any) {
      setStatusMessage(`Error de sincronización: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearLocalCache = () => {
    if (confirm('¿Deseas restablecer la memoria caché local? Se recargarán los datos limpios de la nube.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-[#1A1918]">
      
      {/* 1. Header & Identity */}
      <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6332A] text-white border-2 border-[#1A1918] flex items-center justify-center shadow-[2px_2px_0px_#1A1918]">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-black bg-[#1A1918] text-white px-2 py-0.5 rounded">
                COMMAND CENTER // ADMIN
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#1A1918] ${
                isSupabaseOnline ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-[#FFF9C4] text-[#827717]'
              }`}>
                {isSupabaseOnline ? 'CLOUD ONLINE' : 'LOCAL CACHE'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black uppercase text-[#1A1918] mt-1">
              Panel de Usabilidad y Control
            </h1>
            <p className="text-xs text-[#1A1918]/70 font-sans">
              Administrador en sesión: <span className="font-bold text-[#1A1918]">{currentUser.name} ({currentUser.email})</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="py-2.5 px-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer disabled:opacity-60"
            title="Verificar estado de Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Verificando...' : 'Verificar Nube'}</span>
          </button>

          <button
            onClick={handleClearLocalCache}
            className="py-2.5 px-3.5 bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918] border-2 border-[#1A1918] rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
            title="Limpiar almacenamiento temporal y recargar limpio"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#E6332A]" />
            <span>Limpiar Caché</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-[#E8F5E9] border-2 border-[#2E7D32] rounded-xl text-xs font-mono font-bold text-[#1B5E20] flex items-center gap-2 shadow-[2px_2px_0px_#1A1918]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. Usability Key Metrics (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Pilotos</span>
            <Users className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{users.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Registrados</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Hangar</span>
            <Bike className="w-4 h-4 text-[#F7B32B]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{motorcycles.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Motos activas</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Clubs</span>
            <Layers className="w-4 h-4 text-[#1A1918]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{crews.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Tribus fundadas</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Rodadas</span>
            <Calendar className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{rodadas.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Convocadas</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Rutas GPX</span>
            <Compass className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{routeProposals.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Trazadas</p>
        </div>

        {/* Metric 6 */}
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-4 shadow-[3px_3px_0px_#1A1918]">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-black">Feed</span>
            <Activity className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-black text-[#1A1918]">{activities.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Actividades</p>
        </div>
      </div>

      {/* 3. Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b-2 border-[#1A1918] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Resumen General
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Pilotos ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('crews')}
          className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer shrink-0 ${
            activeTab === 'crews'
              ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Clubs & Tribus ({crews.length})
        </button>
        <button
          onClick={() => setActiveTab('motos')}
          className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer shrink-0 ${
            activeTab === 'motos'
              ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Hangar Motos ({motorcycles.length})
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] transition cursor-pointer shrink-0 ${
            activeTab === 'database'
              ? 'bg-[#E6332A] text-white shadow-[2px_2px_0px_#1A1918]'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Estado Base de Datos
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
            <h3 className="text-base font-display font-black uppercase text-[#1A1918] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E6332A]" />
              Estado de Producción y Lanzamiento
            </h3>
            <p className="text-xs text-[#1A1918]/80 leading-relaxed font-sans">
              La plataforma se encuentra vinculada a <strong>Supabase Nube</strong> con autenticación de correo y contraseña, y compatibilidad completa con <strong>Google OAuth</strong>. Los datos registrados de motos, clubs y perfiles se sincronizan con las tablas de PostgreSQL.
            </p>
            
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918] rounded-lg">
                <span className="text-[#1A1918]/70">Motor de Base de Datos:</span>
                <span className="font-bold text-[#1A1918]">PostgreSQL 15 (Supabase)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918] rounded-lg">
                <span className="text-[#1A1918]/70">Hosting & Edge Network:</span>
                <span className="font-bold text-[#1A1918]">Vercel Production</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918] rounded-lg">
                <span className="text-[#1A1918]/70">URL Oficial:</span>
                <a href="https://nao-club-three.vercel.app" target="_blank" rel="noreferrer" className="font-bold text-[#E6332A] hover:underline flex items-center gap-1">
                  nao-club-three.vercel.app <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
            <h3 className="text-base font-display font-black uppercase text-[#1A1918] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#F7B32B]" />
              Pilotos Registrados Recientemente
            </h3>
            <div className="space-y-2">
              {users.slice(0, 4).map(u => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-[#F4EEDB] border border-[#1A1918] rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-[#1A1918]" />
                    <div className="min-w-0">
                      <p className="text-xs font-display font-black uppercase text-[#1A1918] truncate">{u.name}</p>
                      <p className="text-[10px] font-mono text-[#1A1918]/60 truncate">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#1A1918] text-white px-2 py-0.5 rounded">
                    {u.ridingLevel || 'Intermedio'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-base font-display font-black uppercase text-[#1A1918]">
              Directorio de Pilotos Registrados ({users.length})
            </h3>
            <input
              type="text"
              placeholder="Buscar por nombre, handle o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3 py-1.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#E6332A] font-sans shadow-[2px_2px_0px_#1A1918]"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-[#1A1918] text-[10px] font-mono uppercase font-black text-[#1A1918]/70">
                  <th className="py-2.5 px-3">Piloto</th>
                  <th className="py-2.5 px-3">Correo</th>
                  <th className="py-2.5 px-3">Nivel</th>
                  <th className="py-2.5 px-3">Ubicación</th>
                  <th className="py-2.5 px-3">Motos en Hangar</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-[#1A1918]/20">
                {filteredUsers.map(u => {
                  const bikesCount = motorcycles.filter(m => m.userId === u.id).length;
                  return (
                    <tr key={u.id} className="hover:bg-[#F4EEDB]/50 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-[#1A1918]" />
                          <div>
                            <span className="font-display font-black uppercase text-[#1A1918] block">{u.name}</span>
                            <span className="font-mono text-[10px] text-[#E6332A]">{u.handle}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#1A1918]/80">{u.email || '—'}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono font-bold bg-[#F4EEDB] border border-[#1A1918] px-2 py-0.5 rounded">
                          {u.ridingLevel || 'Intermedio'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#1A1918]/80">{u.location || 'México'}</td>
                      <td className="py-3 px-3 font-mono font-bold">{bikesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREWS TAB */}
      {activeTab === 'crews' && (
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
          <h3 className="text-base font-display font-black uppercase text-[#1A1918]">
            Tribus y Motoclubs Fundados ({crews.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crews.map(c => (
              <div key={c.id} className="p-4 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-display font-black uppercase text-[#1A1918]">{c.name}</h4>
                    <p className="text-xs font-serif italic text-[#1A1918]/70">{c.tagline}</p>
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase bg-[#F7B32B] text-[#1A1918] px-2 py-0.5 border border-[#1A1918] rounded">
                    CÓDIGO: {c.inviteCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-[#1A1918]/70 pt-2 border-t border-[#1A1918]/20">
                  <span>Ciudad: <strong>{c.baseCity}</strong></span>
                  <span>Miembros: <strong>{c.members?.length || 1}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOTOS TAB */}
      {activeTab === 'motos' && (
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
          <h3 className="text-base font-display font-black uppercase text-[#1A1918]">
            Hangar General de Motos Registradas ({motorcycles.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {motorcycles.map(m => (
              <div key={m.id} className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.photoUrl} alt={m.model} className="w-16 h-16 rounded-lg object-cover border border-[#1A1918] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono uppercase font-black text-[#E6332A] block">{m.brand} • {m.year}</span>
                  <p className="text-xs font-display font-black uppercase text-[#1A1918] truncate">{m.model}</p>
                  <p className="text-[10px] font-serif italic text-[#1A1918]/70 truncate">{m.nickname || m.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DATABASE TAB */}
      {activeTab === 'database' && (
        <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-6 shadow-[4px_4px_0px_#1A1918] space-y-4">
          <h3 className="text-base font-display font-black uppercase text-[#1A1918] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#E6332A]" />
            Arquitectura y Tablas Supabase
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918]">
              <span className="font-black text-[#1A1918] block mb-1">profiles</span>
              <p className="text-[11px] text-[#1A1918]/70">Perfiles de pilotos vinculados con auth.users, con nombre, handle, bio, riding level y teléfono.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918]">
              <span className="font-black text-[#1A1918] block mb-1">motorcycles</span>
              <p className="text-[11px] text-[#1A1918]/70">Hangar técnico con marca, modelo, año, cilindrada cc, llantas y modificaciones.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918]">
              <span className="font-black text-[#1A1918] block mb-1">crews & crew_members</span>
              <p className="text-[11px] text-[#1A1918]/70">Comunidades y motoclubs con roles (Capitán de Ruta, Rider, Barrendero) y links de WhatsApp.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918]">
              <span className="font-black text-[#1A1918] block mb-1">crew_messages</span>
              <p className="text-[11px] text-[#1A1918]/70">Chat de radio táctico en tiempo real por cada tribu creada.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
