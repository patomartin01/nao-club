'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { User, Motorcycle, Crew } from '../../types';
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
  Sparkles,
  MessageSquare,
  MessageSquarePlus,
  Clock,
  Phone,
  PhoneCall,
  PhoneForwarded,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  X,
  UserCheck,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveMembership {
  id: string;
  crew_id: string;
  user_id: string;
  role: string;
  joined_at?: string;
}

interface EnrichedUser extends User {
  clubs: { crewId: string; crewName: string; role: string; joinedAt?: string }[];
  bikes: Motorcycle[];
  isNewUser?: boolean;
}

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
    isSupabaseOnline,
    founderFeedbacks,
    markFeedbackStatus,
    deleteFeedback,
    openPilotProfileById,
    refreshUsers
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'users' | 'crews' | 'motos' | 'database'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'con_moto' | 'sin_moto' | 'en_club' | 'sin_club' | 'admins' | 'nuevos'>('todos');
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  // Live Cloud Data direct from Supabase tables
  const [cloudProfiles, setCloudProfiles] = useState<any[]>([]);
  const [cloudMemberships, setCloudMemberships] = useState<LiveMembership[]>([]);
  const [cloudCrews, setCloudCrews] = useState<any[]>([]);
  const [cloudBikes, setCloudBikes] = useState<any[]>([]);
  const [selectedPilotForModal, setSelectedPilotForModal] = useState<EnrichedUser | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isAdmin = currentUser.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || currentUser.id === 'a1bac354-0a88-486c-9289-049e75c61c12' || currentUser.id === 'user-patricio';

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  // Fetch full live cloud data directly from Supabase REST
  const fetchLiveCloudData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [profilesRes, membersRes, crewsRes, bikesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('crew_members').select('*'),
        supabase.from('crews').select('*'),
        supabase.from('motorcycles').select('*')
      ]);

      if (profilesRes.data) {
        setCloudProfiles(profilesRes.data);
      }
      if (membersRes.data) {
        setCloudMemberships(membersRes.data);
      }
      if (crewsRes.data) {
        setCloudCrews(crewsRes.data);
      }
      if (bikesRes.data) {
        setCloudBikes(bikesRes.data);
      }

      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Error fetching live cloud data in admin:', err);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    fetchLiveCloudData();

    // Subscribe to Supabase Realtime changes for profiles & memberships
    if (isSupabaseConfigured()) {
      const adminLiveChannel = supabase
        .channel('admin:live_monitor')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          fetchLiveCloudData();
          refreshUsers?.();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'crew_members' }, () => {
          fetchLiveCloudData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'motorcycles' }, () => {
          fetchLiveCloudData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(adminLiveChannel);
      };
    }
  }, [fetchLiveCloudData, refreshUsers]);

  // Handle Cloud Sync button
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    setStatusMessage(null);
    try {
      if (isSupabaseConfigured()) {
        await fetchLiveCloudData();
        if (refreshUsers) {
          await refreshUsers();
        }
        const usersCount = cloudProfiles.length || users.length;
        const crewsCount = cloudCrews.length || crews.length;
        const bikesCount = cloudBikes.length || motorcycles.length;
        setStatusMessage(`Sincronización en vivo completada: ${usersCount} usuarios registrados, ${crewsCount} tribus y ${bikesCount} motos obtenidas directamente de Supabase.`);
        try { confetti({ particleCount: 35, spread: 65, origin: { y: 0.8 } }); } catch {}
      } else {
        setStatusMessage('Supabase no está configurado en este entorno.');
      }
    } catch (err: any) {
      setStatusMessage(`Error de sincronización: ${err?.message || 'Error de red'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearLocalCache = () => {
    if (confirm('¿Deseas restablecer la memoria caché local? Se recargarán los datos limpios directamente de Supabase.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Build Enriched User List merging live cloud data with local fallback
  const enrichedUsers: EnrichedUser[] = React.useMemo(() => {
    // If cloud profiles are available, use them as primary source
    const baseList: User[] = cloudProfiles.length > 0
      ? cloudProfiles
          .filter(p => p.id !== 'user-patricio' && p.handle !== '@patomartin')
          .map(p => ({
            id: p.id,
            name: p.name || 'Piloto NAO',
            handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
            email: p.email || '—',
            avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
            bio: p.bio || 'Piloto en NAO.',
            location: p.location || 'México',
            ridingLevel: (p.riding_level as any) || 'Intermedio',
            phone: p.phone || undefined,
            emergencyContact: p.emergency_contact || undefined,
            createdAt: p.created_at
          }))
      : users.filter(u => u.id !== 'user-patricio' && u.handle !== '@patomartin');

    const crewsMap = new Map<string, string>();
    cloudCrews.forEach(c => crewsMap.set(c.id, c.name));
    crews.forEach(c => crewsMap.set(c.id, c.name));

    const now = new Date().getTime();

    return baseList.map(u => {
      // Find memberships
      const memberships = cloudMemberships.filter(m => m.user_id === u.id);
      const clubs = memberships.map(m => ({
        crewId: m.crew_id,
        crewName: crewsMap.get(m.crew_id) || 'Club NAO',
        role: m.role || 'Rider',
        joinedAt: m.joined_at
      }));

      // Find bikes
      const bikesFromCloud = cloudBikes
        .filter(b => b.user_id === u.id)
        .map(b => ({
          id: b.id,
          userId: b.user_id,
          brand: b.brand || 'Moto',
          model: b.model || '',
          year: Number(b.year) || 2023,
          displacementCc: Number(b.displacement_cc) || 500,
          type: b.type || 'Doble Propósito',
          nickname: b.nickname || '',
          photoUrl: b.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
          modifications: Array.isArray(b.modifications) ? b.modifications : [],
          tires: b.tires || 'Mixtas',
          isPrimary: Boolean(b.is_primary)
        }));

      const bikesFromState = motorcycles.filter(m => m.userId === u.id);
      const combinedBikes = bikesFromCloud.length > 0 ? bikesFromCloud : bikesFromState;

      // Check if new (last 48 hours)
      const userCreatedMs = u.createdAt ? new Date(u.createdAt).getTime() : 0;
      const isNewUser = (now - userCreatedMs) < (48 * 60 * 60 * 1000);

      return {
        ...u,
        clubs,
        bikes: combinedBikes,
        isNewUser
      };
    });
  }, [cloudProfiles, cloudMemberships, cloudCrews, cloudBikes, users, crews, motorcycles]);

  // Filtering
  const filteredUsers = enrichedUsers.filter(u => {
    // Search match
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q)) ||
      u.clubs.some(c => c.crewName.toLowerCase().includes(q)) ||
      u.bikes.some(b => b.model.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    // Filter match
    if (activeFilter === 'con_moto') return u.bikes.length > 0;
    if (activeFilter === 'sin_moto') return u.bikes.length === 0;
    if (activeFilter === 'en_club') return u.clubs.length > 0;
    if (activeFilter === 'sin_club') return u.clubs.length === 0;
    if (activeFilter === 'admins') return u.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || u.id === 'a1bac354-0a88-486c-9289-049e75c61c12';
    if (activeFilter === 'nuevos') return Boolean(u.isNewUser);

    return true;
  });

  // Stats calculation
  const totalUsers = enrichedUsers.length;
  const withBikesCount = enrichedUsers.filter(u => u.bikes.length > 0).length;
  const inClubsCount = enrichedUsers.filter(u => u.clubs.length > 0).length;
  const newUsersCount = enrichedUsers.filter(u => u.isNewUser).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-[#1A1918]">
      
      {/* 1. Header & Identity */}
      <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E6332A] text-white border border-[#1A1918]/10 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-semibold bg-[#1A1918] text-white px-2 py-0.5 rounded">
                Centro de control · Admin
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#1A1918]/10 ${
                isSupabaseOnline ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-[#FFF9C4] text-[#827717]'
              }`}>
                {isSupabaseOnline ? 'CLOUD REALTIME ACTIVO' : 'MODO LOCAL'}
              </span>
              {lastSyncTime && (
                <span className="text-[10px] font-mono text-[#1A1918]/60 hidden sm:inline">
                  Sync: {lastSyncTime}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[#1A1918] mt-1">
              Directorio General de Pilotos & Control
            </h1>
            <p className="text-xs text-[#1A1918]/70 font-sans">
              Administrador: <span className="font-bold text-[#1A1918]">{currentUser.name} ({currentUser.email})</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="py-2.5 px-3.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/10 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 shadow-sm active:shadow-none transition cursor-pointer disabled:opacity-60"
            title="Refrescar en vivo todos los perfiles de Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E6332A]' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Cloud'}</span>
          </button>

          <button
            onClick={handleClearLocalCache}
            className="py-2.5 px-3.5 bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918] border border-[#1A1918]/10 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 shadow-sm active:shadow-none transition cursor-pointer"
            title="Limpiar almacenamiento temporal y recargar limpio"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#E6332A]" />
            <span>Limpiar caché</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-[#E8F5E9] border border-[#2E7D32]/30 rounded-xl text-xs font-mono font-bold text-[#1B5E20] flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#1B5E20]/60 hover:text-[#1B5E20]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Key Metrics (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Pilotos */}
        <div 
          onClick={() => { setActiveTab('users'); setActiveFilter('todos'); }}
          className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#E6332A] transition"
        >
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Pilotos Cloud</span>
            <Users className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#1A1918]">{totalUsers}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Registrados en total</p>
        </div>

        {/* Metric 2: Hangar */}
        <div 
          onClick={() => setActiveTab('motos')}
          className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#F7B32B] transition"
        >
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Hangar</span>
            <Bike className="w-4 h-4 text-[#F7B32B]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#1A1918]">
            {cloudBikes.length > 0 ? cloudBikes.length : motorcycles.length}
          </div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Motos activas</p>
        </div>

        {/* Metric 3: Tribus */}
        <div 
          onClick={() => setActiveTab('crews')}
          className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#1A1918] transition"
        >
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Clubs</span>
            <Layers className="w-4 h-4 text-[#1A1918]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#1A1918]">
            {cloudCrews.length > 0 ? cloudCrews.length : crews.length}
          </div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Tribus fundadas</p>
        </div>

        {/* Metric 4: Rodadas */}
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Rodadas</span>
            <Calendar className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#1A1918]">{rodadas.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Convocadas</p>
        </div>

        {/* Metric 5: Rutas */}
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Rutas GPX</span>
            <Compass className="w-4 h-4 text-[#2E7D32]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#1A1918]">{routeProposals.length}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Trazadas</p>
        </div>

        {/* Metric 6: Nuevos (48h) */}
        <div 
          onClick={() => { setActiveTab('users'); setActiveFilter('nuevos'); }}
          className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl p-4 shadow-sm cursor-pointer hover:border-[#E6332A] transition"
        >
          <div className="flex items-center justify-between text-[#1A1918]/60 mb-2">
            <span className="text-[10px] font-mono uppercase font-semibold">Nuevos (48h)</span>
            <Sparkles className="w-4 h-4 text-[#E6332A]" />
          </div>
          <div className="text-3xl font-display font-semibold text-[#E6332A]">{newUsersCount}</div>
          <p className="text-[10px] font-mono text-[#1A1918]/60 mt-1">Registrados hoy</p>
        </div>
      </div>

      {/* 3. Sub Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#1A1918]/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Directorio de Pilotos ({totalUsers})</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Resumen General
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Buzón fundadores</span>
          {founderFeedbacks.filter(f => f.status === 'nuevo').length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#F7B32B] text-[#1A1918] font-mono text-[9px] font-semibold flex items-center justify-center">
              {founderFeedbacks.filter(f => f.status === 'nuevo').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('crews')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 ${
            activeTab === 'crews'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Clubs & Tribus ({cloudCrews.length || crews.length})
        </button>

        <button
          onClick={() => setActiveTab('motos')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 ${
            activeTab === 'motos'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Hangar Motos ({cloudBikes.length || motorcycles.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-sans font-semibold border border-[#1A1918]/10 transition cursor-pointer shrink-0 ${
            activeTab === 'database'
              ? 'bg-[#E6332A] text-white shadow-sm'
              : 'bg-[#FAF6ED] text-[#1A1918] hover:bg-[#F4EEDB]'
          }`}
        >
          Estado Base de Datos
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* ================= USERS TAB (COMPREHENSIVE PILOT DIRECTORY) ================= */}
      {activeTab === 'users' && (
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Top Bar: Title & Search */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#1A1918]/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-semibold text-[#1A1918]">
                  Directorio Integral de Pilotos Registrados
                </h3>
                <span className="text-xs font-mono font-bold bg-[#E6332A] text-white px-2 py-0.5 rounded-full">
                  {filteredUsers.length} de {totalUsers}
                </span>
              </div>
              <p className="text-xs text-[#1A1918]/70 font-sans mt-0.5">
                Datos sincronizados en tiempo real con Supabase Auth & Profiles. Incluye contacto directo, fecha de ingreso, motos y clubs.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1918]/40" />
              <input
                type="text"
                placeholder="Buscar por nombre, @handle, correo, teléfono, club o moto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF6ED] border border-[#1A1918]/15 rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none focus:border-[#E6332A] font-sans shadow-sm"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1918]/40 hover:text-[#1A1918]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-sans">
            <span className="text-[10px] font-mono uppercase font-semibold text-[#1A1918]/50 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtro:
            </span>
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'todos'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              Todos ({totalUsers})
            </button>
            <button
              onClick={() => setActiveFilter('con_moto')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'con_moto'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              Con Moto ({withBikesCount})
            </button>
            <button
              onClick={() => setActiveFilter('sin_moto')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'sin_moto'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              Sin Moto ({totalUsers - withBikesCount})
            </button>
            <button
              onClick={() => setActiveFilter('en_club')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'en_club'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              En Club ({inClubsCount})
            </button>
            <button
              onClick={() => setActiveFilter('sin_club')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'sin_club'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              Sin Club ({totalUsers - inClubsCount})
            </button>
            {newUsersCount > 0 && (
              <button
                onClick={() => setActiveFilter('nuevos')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border flex items-center gap-1 ${
                  activeFilter === 'nuevos'
                    ? 'bg-[#E6332A] text-white border-[#E6332A]'
                    : 'bg-[#FFEBEE] text-[#C62828] border-[#EF9A9A] hover:bg-[#FFCDD2]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Nuevos hoy ({newUsersCount})</span>
              </button>
            )}
            <button
              onClick={() => setActiveFilter('admins')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer border ${
                activeFilter === 'admins'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#F4EEDB] text-[#1A1918]/80 border-[#1A1918]/10 hover:bg-[#EDE6D3]'
              }`}
            >
              Admins
            </button>
          </div>

          {/* Pilot Table */}
          <div className="overflow-x-auto rounded-xl border border-[#1A1918]/10 bg-white/40 shadow-inner">
            <table className="w-full text-left text-xs min-w-[950px]">
              <thead>
                <tr className="border-b border-[#1A1918]/10 bg-[#F4EEDB] text-[10px] font-mono uppercase font-semibold text-[#1A1918]/70">
                  <th className="py-3 px-3.5">Piloto & ID</th>
                  <th className="py-3 px-3.5">Contacto Directo</th>
                  <th className="py-3 px-3.5">Clubs & Tribus</th>
                  <th className="py-3 px-3.5">Motos en Hangar</th>
                  <th className="py-3 px-3.5">Nivel & Ubicación</th>
                  <th className="py-3 px-3.5">Fecha Registro</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1918]/10">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs font-mono text-[#1A1918]/60">
                      No se encontraron pilotos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isPatricioAdmin = u.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || u.id === 'a1bac354-0a88-486c-9289-049e75c61c12';
                    const hasBikes = u.bikes.length > 0;
                    const hasClubs = u.clubs.length > 0;

                    // Formatted registration date
                    let regDateFormatted = '—';
                    if (u.createdAt) {
                      try {
                        const d = new Date(u.createdAt);
                        regDateFormatted = d.toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      } catch {
                        regDateFormatted = u.createdAt.slice(0, 10);
                      }
                    }

                    return (
                      <tr key={u.id} className="hover:bg-[#F4EEDB]/60 transition">
                        
                        {/* 1. Piloto */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={u.avatar} 
                              alt={u.name} 
                              className="w-9 h-9 rounded-full object-cover border border-[#1A1918]/15 shrink-0 shadow-sm" 
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-sans font-semibold text-[#1A1918] truncate block">
                                  {u.name}
                                </span>
                                {isPatricioAdmin && (
                                  <span className="text-[9px] font-mono font-bold bg-[#E6332A] text-white px-1.5 py-0.2 rounded shrink-0">
                                    ADMIN
                                  </span>
                                )}
                                {u.isNewUser && (
                                  <span className="text-[9px] font-mono font-bold bg-[#F7B32B] text-[#1A1918] px-1.5 py-0.2 rounded shrink-0">
                                    NUEVO
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[11px] text-[#E6332A] font-semibold block">
                                {u.handle}
                              </span>
                              <span className="font-mono text-[9px] text-[#1A1918]/40 block" title={u.id}>
                                ID: {u.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Contacto Directo */}
                        <td className="py-3 px-3.5 font-mono text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-[#1A1918]/50 shrink-0" />
                            <a 
                              href={`mailto:${u.email}`} 
                              className="text-[#1A1918]/90 hover:text-[#E6332A] hover:underline truncate max-w-[170px] block" 
                              title={u.email}
                            >
                              {u.email}
                            </a>
                          </div>
                          {u.phone ? (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#2E7D32] shrink-0" />
                              <a
                                href={`https://wa.me/${u.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-[#2E7D32] hover:underline"
                                title="Abrir chat de WhatsApp"
                              >
                                {u.phone}
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#1A1918]/40 italic block">Sin teléfono</span>
                          )}
                          {u.emergencyContact && (
                            <div className="text-[10px] text-[#C62828] font-sans flex items-center gap-1">
                              <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate max-w-[160px]" title={u.emergencyContact}>
                                SOS: {u.emergencyContact}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* 3. Clubs & Tribus */}
                        <td className="py-3 px-3.5">
                          {hasClubs ? (
                            <div className="flex flex-col gap-1">
                              {u.clubs.map(c => (
                                <div key={c.crewId} className="flex items-center gap-1">
                                  <span className="text-[10px] font-sans font-semibold bg-[#F4EEDB] border border-[#1A1918]/15 px-2 py-0.5 rounded text-[#1A1918]">
                                    {c.crewName}
                                  </span>
                                  <span className={`text-[9px] font-mono px-1 rounded ${
                                    c.role.includes('Capitán') 
                                      ? 'bg-[#F7B32B] text-[#1A1918] font-bold' 
                                      : 'bg-[#1A1918]/10 text-[#1A1918]/80'
                                  }`}>
                                    {c.role}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-[#1A1918]/40 italic">
                              Sin tribu asignada
                            </span>
                          )}
                        </td>

                        {/* 4. Motos en Hangar */}
                        <td className="py-3 px-3.5">
                          {hasBikes ? (
                            <div className="space-y-1">
                              {u.bikes.map(b => (
                                <div key={b.id} className="flex items-center gap-1.5">
                                  <Bike className="w-3 h-3 text-[#E6332A] shrink-0" />
                                  <span className="font-sans font-semibold text-[11px] text-[#1A1918]">
                                    {b.brand} {b.model}
                                  </span>
                                  <span className="text-[9px] font-mono text-[#1A1918]/60 bg-[#F4EEDB] px-1 rounded">
                                    {b.displacementCc}cc
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-[#1A1918]/40 italic">
                              0 motos registradas
                            </span>
                          )}
                        </td>

                        {/* 5. Nivel & Ubicación */}
                        <td className="py-3 px-3.5">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold bg-[#1A1918] text-white px-2 py-0.5 rounded inline-block">
                              {u.ridingLevel || 'Intermedio'}
                            </span>
                            <span className="text-[10px] font-sans text-[#1A1918]/70 block">
                              {u.location || 'México'}
                            </span>
                          </div>
                        </td>

                        {/* 6. Fecha Registro */}
                        <td className="py-3 px-3.5 font-mono text-[10px] text-[#1A1918]/80">
                          <span className="block font-semibold">{regDateFormatted}</span>
                        </td>

                        {/* 7. Acciones */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedPilotForModal(u)}
                              className="px-2.5 py-1 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/15 rounded-lg font-sans font-bold text-[10px] shadow-sm flex items-center gap-1 cursor-pointer"
                              title="Ver ficha técnica completa de admin"
                            >
                              <Info className="w-3 h-3 text-[#E6332A]" />
                              <span>Ficha</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => openPilotProfileById(u.id)}
                              className="px-2 py-1 bg-[#1A1918] hover:bg-black text-white rounded-lg font-sans font-bold text-[10px] shadow-sm flex items-center gap-1 cursor-pointer"
                              title="Ver perfil público en NAO"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">Perfil</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL FICHA TÉCNICA DE PILOTO ================= */}
      {selectedPilotForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6ED] border border-[#1A1918]/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#1A1918]/10 pb-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedPilotForModal.avatar} 
                  alt={selectedPilotForModal.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#E6332A] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-semibold text-[#1A1918]">
                      {selectedPilotForModal.name}
                    </h3>
                    {selectedPilotForModal.isNewUser && (
                      <span className="text-[10px] font-mono font-bold bg-[#F7B32B] text-[#1A1918] px-2 py-0.5 rounded">
                        NUEVO
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold text-[#E6332A]">
                    {selectedPilotForModal.handle}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-[#1A1918]/60">
                      ID: {selectedPilotForModal.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedPilotForModal.id, 'id')}
                      className="text-[10px] font-mono text-[#1A1918]/60 hover:text-[#1A1918] flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedField === 'id' ? <Check className="w-3 h-3 text-[#2E7D32]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPilotForModal(null)}
                className="w-8 h-8 rounded-full bg-[#F4EEDB] hover:bg-[#EDE6D3] flex items-center justify-center text-[#1A1918]/70 hover:text-[#1A1918] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
              <div className="p-3 bg-white/60 border border-[#1A1918]/10 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-[#1A1918]/60 block">Correo Electrónico</span>
                <div className="flex items-center justify-between">
                  <a href={`mailto:${selectedPilotForModal.email}`} className="font-mono font-bold text-[#1A1918] hover:text-[#E6332A] truncate">
                    {selectedPilotForModal.email}
                  </a>
                  <button onClick={() => copyToClipboard(selectedPilotForModal.email, 'email')} className="text-[#1A1918]/60 hover:text-[#1A1918] ml-2">
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white/60 border border-[#1A1918]/10 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-[#1A1918]/60 block">Teléfono / WhatsApp</span>
                <div className="flex items-center justify-between">
                  {selectedPilotForModal.phone ? (
                    <a 
                      href={`https://wa.me/${selectedPilotForModal.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-mono font-bold text-[#2E7D32] hover:underline"
                    >
                      {selectedPilotForModal.phone} (Abrir WA)
                    </a>
                  ) : (
                    <span className="text-[#1A1918]/40 italic">No registrado</span>
                  )}
                  {selectedPilotForModal.phone && (
                    <button onClick={() => copyToClipboard(selectedPilotForModal.phone!, 'phone')} className="text-[#1A1918]/60 hover:text-[#1A1918] ml-2">
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-[#2E7D32]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-white/60 border border-[#1A1918]/10 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-[#1A1918]/60 block">Contacto de Emergencia</span>
                <span className="font-sans font-bold text-[#C62828] block">
                  {selectedPilotForModal.emergencyContact || 'No asignado'}
                </span>
              </div>

              <div className="p-3 bg-white/60 border border-[#1A1918]/10 rounded-xl space-y-1">
                <span className="text-[10px] font-mono uppercase font-semibold text-[#1A1918]/60 block">Fecha de Registro en Nube</span>
                <span className="font-mono font-bold text-[#1A1918] block">
                  {selectedPilotForModal.createdAt ? new Date(selectedPilotForModal.createdAt).toLocaleString('es-MX') : 'Fecha no disponible'}
                </span>
              </div>
            </div>

            {/* Motos en Hangar */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-semibold text-[#1A1918]/70 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#E6332A]" />
                Motos en Hangar ({selectedPilotForModal.bikes.length})
              </h4>
              {selectedPilotForModal.bikes.length === 0 ? (
                <div className="p-4 bg-white/40 border border-[#1A1918]/10 rounded-xl text-center text-xs font-mono text-[#1A1918]/50">
                  El piloto aún no ha registrado ninguna moto en su garaje.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPilotForModal.bikes.map(b => (
                    <div key={b.id} className="p-3 bg-white/80 border border-[#1A1918]/10 rounded-xl flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.photoUrl} alt={b.model} className="w-14 h-14 rounded-lg object-cover border border-[#1A1918]/10 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-mono uppercase font-bold text-[#E6332A] block">{b.brand} • {b.year}</span>
                        <p className="text-xs font-sans font-semibold text-[#1A1918] truncate">{b.model}</p>
                        <p className="text-[10px] font-mono text-[#1A1918]/60">{b.displacementCc}cc • {b.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clubs & Tribus */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase font-semibold text-[#1A1918]/70 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#1A1918]" />
                Membresías de Tribu ({selectedPilotForModal.clubs.length})
              </h4>
              {selectedPilotForModal.clubs.length === 0 ? (
                <div className="p-4 bg-white/40 border border-[#1A1918]/10 rounded-xl text-center text-xs font-mono text-[#1A1918]/50">
                  El piloto no pertenece a ningún motoclub actualmente.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedPilotForModal.clubs.map(c => (
                    <div key={c.crewId} className="p-2.5 bg-white/80 border border-[#1A1918]/10 rounded-xl flex items-center gap-2 text-xs">
                      <span className="font-sans font-semibold text-[#1A1918]">{c.crewName}</span>
                      <span className="text-[9px] font-mono font-bold bg-[#1A1918] text-white px-1.5 py-0.5 rounded">
                        {c.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1918]/10">
              <button
                type="button"
                onClick={() => setSelectedPilotForModal(null)}
                className="px-4 py-2 bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918] rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedPilotForModal.id;
                  setSelectedPilotForModal(null);
                  openPilotProfileById(id);
                }}
                className="px-4 py-2 bg-[#E6332A] hover:bg-[#C62828] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver Perfil Público Completo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-display font-semibold text-[#1A1918] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E6332A]" />
              Estado de producción y lanzamiento
            </h3>
            <p className="text-xs text-[#1A1918]/80 leading-relaxed font-sans">
              La plataforma se encuentra vinculada a <strong>Supabase Nube</strong> con autenticación de correo y contraseña, y compatibilidad completa con <strong>Google OAuth</strong>. Los datos registrados de motos, clubs y perfiles se sincronizan con las tablas de PostgreSQL.
            </p>
            
            <div className="space-y-2 pt-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-lg">
                <span className="text-[#1A1918]/70">Motor de Base de Datos:</span>
                <span className="font-bold text-[#1A1918]">PostgreSQL 15 (Supabase)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-lg">
                <span className="text-[#1A1918]/70">Hosting & Edge Network:</span>
                <span className="font-bold text-[#1A1918]">Vercel Production</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-lg">
                <span className="text-[#1A1918]/70">URL Oficial:</span>
                <a href="https://nao-club-three.vercel.app" target="_blank" rel="noreferrer" className="font-bold text-[#E6332A] hover:underline flex items-center gap-1">
                  nao-club-three.vercel.app <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-semibold text-[#1A1918] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F7B32B]" />
                Últimos pilotos registrados en la nube
              </h3>
              <button 
                onClick={() => setActiveTab('users')}
                className="text-xs font-mono text-[#E6332A] hover:underline font-bold"
              >
                Ver todos ({totalUsers}) →
              </button>
            </div>
            <div className="space-y-2">
              {enrichedUsers.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center justify-between p-2.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-xl">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-[#1A1918]/10" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-sans font-semibold text-[#1A1918] truncate">{u.name}</p>
                        {u.isNewUser && (
                          <span className="text-[8px] font-mono font-bold bg-[#F7B32B] text-[#1A1918] px-1 rounded">NUEVO</span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-[#1A1918]/60 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-[#1A1918] text-white px-2 py-0.5 rounded">
                      {u.ridingLevel || 'Intermedio'}
                    </span>
                    <span className="text-[9px] font-mono text-[#1A1918]/50 block mt-0.5">
                      {u.bikes.length} moto{u.bikes.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK TAB (BUZÓN FUNDADORES) */}
      {activeTab === 'feedback' && (
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1A1918]/10 pb-3">
            <div>
              <h3 className="text-base font-display font-semibold text-[#1A1918] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#E6332A]" />
                Buzón Exclusivo de Fundadores (Top 50)
              </h3>
              <p className="text-xs text-[#1A1918]/70 font-sans mt-0.5">
                Comentarios, sugerencias y reportes enviados directamente por los primeros 50 usuarios desde su perfil.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#1A1918] text-[#FAF6ED] rounded-xl border border-[#1A1918]/10">
              {founderFeedbacks.length} Mensaje{founderFeedbacks.length === 1 ? '' : 's'}
            </span>
          </div>

          {founderFeedbacks.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F4EEDB] border border-[#1A1918]/10 flex items-center justify-center text-[#1A1918]/60 shadow-sm">
                <MessageSquarePlus className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-sm font-sans font-semibold text-[#1A1918]">
                Aún no hay mensajes en el buzón
              </p>
              <p className="text-xs font-sans text-[#1A1918]/60 max-w-sm mx-auto">
                Cuando los primeros 50 pilotos dejen una sugerencia o idea en su panel de perfil, aparecerá aquí en tiempo real.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {founderFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-4 rounded-2xl border border-[#1A1918]/10 shadow-sm transition ${
                    fb.status === 'nuevo'
                      ? 'bg-[#FAF6ED] ring-2 ring-[#E6332A]'
                      : fb.status === 'archivado'
                      ? 'bg-[#EDE6D3] opacity-75'
                      : 'bg-[#F4EEDB]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1A1918]/20 pb-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={fb.userAvatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'}
                        alt={fb.userName}
                        className="w-8 h-8 rounded-full object-cover border border-[#1A1918]/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-sans font-semibold text-[#1A1918]">
                            {fb.userName}
                          </span>
                          <span className="text-[10px] font-mono text-[#1A1918]/60">
                            {fb.userHandle}
                          </span>
                          {fb.founderNumber && (
                            <span className="text-[9px] font-mono font-semibold uppercase bg-[#F7B32B] text-[#1A1918] px-1.5 py-0.2 rounded border border-[#1A1918]/10">
                              Fundador #{fb.founderNumber}
                            </span>
                          )}
                        </div>
                        {fb.userEmail && (
                          <span className="text-[10px] font-mono text-[#1A1918]/60 block">
                            {fb.userEmail}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border border-[#1A1918]/10 ${
                        fb.category === 'problema'
                          ? 'bg-[#FFCDD2] text-[#C62828]'
                          : fb.category === 'idea'
                          ? 'bg-[#E1BEE7] text-[#6A1B9A]'
                          : fb.category === 'sugerencia'
                          ? 'bg-[#C8E6C9] text-[#2E7D32]'
                          : 'bg-[#FFF9C4] text-[#F57F17]'
                      }`}>
                        {fb.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#1A1918]/60 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(fb.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="p-3 bg-white/80 rounded-xl border border-[#1A1918]/30 mb-3">
                    <p className="text-xs font-sans text-[#1A1918] leading-relaxed whitespace-pre-wrap">
                      {fb.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1A1918]/70">Estado:</span>
                      <span className={` font-semibold px-1.5 py-0.5 rounded ${
                        fb.status === 'nuevo'
                          ? 'bg-[#E6332A] text-white'
                          : fb.status === 'leido'
                          ? 'bg-[#1A1918] text-white'
                          : 'bg-[#B0BEC5] text-[#1A1918]'
                      }`}>
                        {fb.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {fb.status === 'nuevo' && (
                        <button
                          type="button"
                          onClick={() => markFeedbackStatus(fb.id, 'leido')}
                          className="px-2 py-1 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/10 rounded-lg font-bold shadow-sm cursor-pointer"
                        >
                          Marcar leído
                        </button>
                      )}
                      {fb.status !== 'archivado' ? (
                        <button
                          type="button"
                          onClick={() => markFeedbackStatus(fb.id, 'archivado')}
                          className="px-2 py-1 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/10 rounded-lg font-bold shadow-sm cursor-pointer"
                        >
                          Archivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => markFeedbackStatus(fb.id, 'leido')}
                          className="px-2 py-1 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border border-[#1A1918]/10 rounded-lg font-bold shadow-sm cursor-pointer"
                        >
                          Desarchivar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteFeedback(fb.id)}
                        className="px-2 py-1 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#C62828] rounded-lg font-bold shadow-sm cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREWS TAB */}
      {activeTab === 'crews' && (
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-[#1A1918]">
              Tribus y Motoclubs Fundados ({cloudCrews.length || crews.length})
            </h3>
            <span className="text-xs font-mono text-[#1A1918]/60">Sincronizado con Supabase</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(cloudCrews.length > 0 ? cloudCrews : crews).map((c: any) => {
              const membersCount = cloudMemberships.filter(m => m.crew_id === c.id).length || c.members?.length || 1;
              return (
                <div key={c.id} className="p-4 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-display font-semibold text-[#1A1918]">{c.name}</h4>
                      <p className="text-xs font-sans text-[#1A1918]/70">{c.tagline || c.description}</p>
                    </div>
                    {c.invite_code || c.inviteCode ? (
                      <span className="text-[10px] font-mono font-semibold uppercase bg-[#F7B32B] text-[#1A1918] px-2 py-0.5 border border-[#1A1918]/10 rounded">
                        CÓDIGO: {c.invite_code || c.inviteCode}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#1A1918]/70 pt-2 border-t border-[#1A1918]/20">
                    <span>Ciudad: <strong>{c.base_city || c.baseCity || 'México'}</strong></span>
                    <span>Miembros: <strong>{membersCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MOTOS TAB */}
      {activeTab === 'motos' && (
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-semibold text-[#1A1918]">
              Hangar General de Motos Registradas ({cloudBikes.length || motorcycles.length})
            </h3>
            <span className="text-xs font-mono text-[#1A1918]/60">Sincronizado con Supabase</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cloudBikes.length > 0 ? cloudBikes : motorcycles).map((m: any) => {
              const photo = m.image_url || m.photoUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800';
              const owner = enrichedUsers.find(u => u.id === (m.user_id || m.userId));
              return (
                <div key={m.id} className="p-3.5 bg-[#F4EEDB] border border-[#1A1918]/10 rounded-xl shadow-sm flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={m.model} className="w-16 h-16 rounded-lg object-cover border border-[#1A1918]/10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-mono uppercase font-semibold text-[#E6332A] block">{m.brand} • {m.year}</span>
                    <p className="text-xs font-sans font-semibold text-[#1A1918] truncate">{m.model}</p>
                    <p className="text-[10px] font-sans text-[#1A1918]/70 truncate">{m.displacement_cc || m.displacementCc}cc • {m.type}</p>
                    {owner && (
                      <p className="text-[9px] font-mono text-[#1A1918]/50 truncate mt-0.5">
                        Piloto: {owner.name} ({owner.handle})
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DATABASE TAB */}
      {activeTab === 'database' && (
        <div className="bg-[#FAF6ED] border border-[#1A1918]/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-display font-semibold text-[#1A1918] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#E6332A]" />
            Arquitectura y tablas Supabase
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl shadow-sm">
              <span className="font-semibold text-[#1A1918] block mb-1">profiles ({cloudProfiles.length || users.length} filas)</span>
              <p className="text-[11px] text-[#1A1918]/70">Perfiles de pilotos vinculados con auth.users, con nombre, handle, bio, riding level, created_at y teléfono.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl shadow-sm">
              <span className="font-semibold text-[#1A1918] block mb-1">motorcycles ({cloudBikes.length || motorcycles.length} filas)</span>
              <p className="text-[11px] text-[#1A1918]/70">Hangar técnico con marca, modelo, año, cilindrada cc, llantas y modificaciones.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl shadow-sm">
              <span className="font-semibold text-[#1A1918] block mb-1">crews & crew_members ({cloudCrews.length} clubs, {cloudMemberships.length} miembros)</span>
              <p className="text-[11px] text-[#1A1918]/70">Comunidades y motoclubs con lista de miembros y links de WhatsApp.</p>
            </div>
            <div className="p-3 bg-[#FAF6ED] border border-[#1A1918]/10 rounded-xl shadow-sm">
              <span className="font-semibold text-[#1A1918] block mb-1">founder_feedback</span>
              <p className="text-[11px] text-[#1A1918]/70">Buzón de sugerencias e ideas de los primeros 50 usuarios con categorías.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
