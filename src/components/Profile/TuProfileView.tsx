'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BikeType, Motorcycle } from '../../types';
import { 
  BarChart2, 
  FileText, 
  Grid, 
  Share2, 
  Edit3, 
  Search, 
  Wrench, 
  MapPin, 
  Navigation,
  UserCheck,
  Bike,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  Phone,
  HeartPulse,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditProfileModal } from '../Modals/EditProfileModal';
import { EditMotorcycleModal } from '../Modals/EditMotorcycleModal';

interface TuProfileViewProps {
  onOpenEditProfile?: () => void;
  onOpenGarage?: () => void;
}

type ProfileSubTab = 'hangar' | 'progreso' | 'actividades' | 'galeria';

// Sample 12-week telemetry data for the chart
const WEEKLY_DATA = [
  { week: 'Sem 1', km: 24, elev: 450, rides: 1 },
  { week: 'Sem 2', km: 48, elev: 890, rides: 2 },
  { week: 'Sem 3', km: 0, elev: 0, rides: 0 },
  { week: 'Sem 4', km: 82, elev: 1620, rides: 2 },
  { week: 'Sem 5', km: 35, elev: 600, rides: 1 },
  { week: 'Sem 6', km: 110, elev: 2150, rides: 3 },
  { week: 'Sem 7', km: 14, elev: 280, rides: 1 },
  { week: 'Sem 8', km: 65, elev: 1200, rides: 2 },
  { week: 'Sem 9', km: 92, elev: 1850, rides: 2 },
  { week: 'Sem 10', km: 40, elev: 780, rides: 1 },
  { week: 'Sem 11', km: 74, elev: 1420, rides: 2 },
  { week: 'Sem 12 (Esta)', km: 42.8, elev: 890, rides: 1 }
];

const GALLERY_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600', caption: 'Paso de montaña en la sierra' },
  { url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600', caption: 'KTM lista para brecha' },
  { url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=600', caption: 'Atardecer en Laguna de Zempoala' },
  { url: 'https://images.unsplash.com/photo-1502744688674-c619d38864a8?auto=format&fit=crop&q=80&w=600', caption: 'Basecamp bajo las estrellas' },
  { url: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=600', caption: 'Curvas de asfalto en cañón' },
  { url: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?auto=format&fit=crop&q=80&w=600', caption: 'Parada de hidratación' },
  { url: 'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=600', caption: 'Trocha técnica con lodo' },
  { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600', caption: 'Escuadrón en cumbre' },
  { url: 'https://images.unsplash.com/photo-1525160354320-d8e92641c563?auto=format&fit=crop&q=80&w=600', caption: 'Mecánica de ruta' }
];

const PRESET_MOTO_PHOTOS = [
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=800'
];

export const TuProfileView: React.FC<TuProfileViewProps> = ({
  onOpenEditProfile,
  onOpenGarage
}) => {
  const { 
    currentUser, 
    activities, 
    userBikes,
    addMotorcycle,
    updateMotorcycle,
    deleteMotorcycle,
    followingUserIds,
    setAuthModalOpen,
    setActiveNavTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('hangar');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todos los deportes');
  
  // Profile edit modal state
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);

  // Bike editing modal state
  const [editingBike, setEditingBike] = useState<Motorcycle | null>(null);

  // Add bike modal state
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [bikeBrand, setBikeBrand] = useState('BMW');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeYear, setBikeYear] = useState<number>(2023);
  const [bikeCc, setBikeCc] = useState<number>(1250);
  const [bikeType, setBikeType] = useState<BikeType>('Doble Propósito');
  const [bikeNickname, setBikeNickname] = useState('');
  const [bikePhotoUrl, setBikePhotoUrl] = useState('');
  const [bikeTires, setBikeTires] = useState('Continental TKC80 (50/50)');
  const [bikeMods, setBikeMods] = useState('Skid plate de aluminio, Defensas de motor, Faros auxiliares');

  const bikeFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleBikePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setBikePhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter completed activities by user and search
  const userActivities = activities.filter(a => a.pilotId === currentUser.id || a.pilotName === currentUser.name);
  const displayActivities = userActivities.length > 0 ? userActivities : activities;

  const filteredHistory = displayActivities.filter(a => 
    a.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.location.toLowerCase().includes(activitySearch.toLowerCase()) ||
    a.motoModel.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    try {
      confetti({ particleCount: 20, spread: 50 });
    } catch {}
  };

  const handleAddBikeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bikeModel.trim()) return;

    const modsArray = bikeMods
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    addMotorcycle({
      userId: currentUser.id,
      brand: bikeBrand,
      model: bikeModel.trim(),
      year: bikeYear,
      displacementCc: bikeCc,
      type: bikeType,
      nickname: bikeNickname.trim() || undefined,
      photoUrl: bikePhotoUrl.trim() || PRESET_MOTO_PHOTOS[0],
      modifications: modsArray.length > 0 ? modsArray : ['Configuración estándar de fábrica'],
      tires: bikeTires.trim() || 'Mixtas 70/30'
    });

    setBikeModel('');
    setBikeNickname('');
    setShowAddBikeModal(false);

    try {
      confetti({ particleCount: 30, spread: 60 });
    } catch {}
  };

  const maxKmWeek = Math.max(...WEEKLY_DATA.map(d => d.km));

  return (
    <div className="space-y-8 pb-32 max-w-[1440px] w-full mx-auto font-sans text-[#141312]">
      
      {/* GUEST WARNING / LOGIN PROMPT */}
      {currentUser.id === 'guest' && (
        <div className="bg-[#FAF6ED] border-2 border-[#E6332A] rounded-[24px] p-5 sm:p-6 shadow-[5px_5px_0px_#1A1918] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-black text-[#E6332A] bg-[#E6332A]/10 px-2 py-0.5 rounded border border-[#E6332A]/30">
              MODO INVITADO
            </span>
            <h2 className="text-xl font-display font-black text-[#1A1918] uppercase">
              Crea tu perfil de piloto personal
            </h2>
            <p className="text-xs font-serif italic text-[#1A1918]/80">
              Inicia sesión o regístrate para tener tu propio hangar de motos, registrar salidas y que nadie más tenga acceso a tus datos.
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-[#E6332A] hover:bg-[#c92820] text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition shrink-0 cursor-pointer"
          >
            Iniciar Sesión / Registrarse
          </button>
        </div>
      )}

      {/* 01. PROFILE HEADER (Authentic Pilot Matchbook Dossier) */}
      <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-[4px_4px_0px_#1A1918] sm:shadow-[6px_6px_0px_#1A1918] relative overflow-hidden">
        {/* Subtle background typographic watermark */}
        <div className="absolute right-[-10px] top-[-15px] pointer-events-none select-none opacity-[0.04] text-[#1A1918] font-display font-black text-9xl tracking-tighter">
          PILOT
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[4px_4px_0px_#1A1918] bg-[#F4EEDB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#E6332A] text-white text-[8px] font-mono uppercase font-black rounded border border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">
              VERIFICADO
            </span>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-[10px] text-[#E6332A] uppercase tracking-[0.2em] font-black">
                ★ CREDENCIAL DE PILOTO OFICIAL ★
              </span>
              <span className="text-[10px] font-mono text-[#1A1918] uppercase tracking-widest bg-[#FAF6ED] px-2.5 py-0.5 border-2 border-[#1A1918] rounded-md font-black shadow-[1px_1px_0px_#1A1918]">
                NIVEL: {currentUser.ridingLevel?.toUpperCase() || 'INTERMEDIO'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black text-[#1A1918] uppercase tracking-wide">
              {currentUser.name}
            </h1>
            
            <p className="text-xs font-serif italic text-[#1A1918]/80 font-medium">
              <span className="text-[#E6332A] font-bold not-italic font-mono">{currentUser.handle}</span> • {currentUser.location || 'México'} {currentUser.bio ? `— ${currentUser.bio}` : ''}
            </p>

            {/* Quick stats and primary bike summary */}
            <div className="flex items-center gap-3 pt-2 text-xs flex-wrap">
              <button 
                onClick={() => setActiveSubTab('hangar')}
                className="flex items-center gap-1.5 font-display font-black text-[#1A1918] bg-[#F4EEDB] hover:bg-[#EDE6D3] px-2.5 py-1 rounded-lg border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] transition cursor-pointer"
                title="Ver motos en el Hangar"
              >
                <Bike className="w-3.5 h-3.5 text-[#E6332A]" />
                <span>{userBikes.length} {userBikes.length === 1 ? 'MOTO' : 'MOTOS'} EN HANGAR</span>
              </button>

              <span className="text-[#1A1918]/30">•</span>
              
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-[#1A1918]">{currentUser.stats?.completedCount || userActivities.length || 12}</span>
                <span className="text-[#1A1918]/70 font-medium">salidas</span>
              </div>

              <span className="text-[#1A1918]/30">•</span>

              <div className="flex items-center gap-1">
                <span className="font-display font-black text-[#1A1918]">{followingUserIds.length}</span>
                <span className="text-[#1A1918]/70 font-medium">siguiendo</span>
              </div>
            </div>

            {/* Safety & SOS Indicator */}
            {currentUser.emergencyContact && (
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#1A1918]/70 font-mono">
                <HeartPulse className="w-3 h-3 text-[#E6332A] shrink-0" />
                <span>SOS: {currentUser.emergencyContact}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Clean grid layout */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 pt-2 relative z-10">
          <button
            onClick={() => {
              if (onOpenEditProfile) onOpenEditProfile();
              setEditProfileOpen(true);
            }}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#1A1918] hover:bg-black text-[#FAF6ED] text-[11px] sm:text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#F7B32B]" />
            <span>Editar perfil</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('hangar');
              if (userBikes.length > 0) {
                setEditingBike(userBikes[0]);
              } else {
                setShowAddBikeModal(true);
              }
            }}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#F4EEDB] hover:bg-[#EDE6D3] text-[#1A1918] text-[11px] sm:text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Editar ficha técnica de tu moto en el Hangar"
          >
            <Wrench className="w-3.5 h-3.5 text-[#E6332A]" />
            <span>Editar Hangar</span>
          </button>

          <button
            onClick={handleShareProfile}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] text-[11px] sm:text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1A1918]" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => setAuthModalOpen(true)}
            className="py-2.5 sm:py-3 px-3 sm:px-4 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] text-[11px] sm:text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Gestionar sesión o cambiar piloto"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#E6332A]" />
            <span>Cuenta</span>
          </button>

          {(currentUser.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || currentUser.handle === '@patomartin' || currentUser.id === 'user-patricio') && (
            <button
              onClick={() => setActiveNavTab('admin')}
              className="col-span-2 sm:col-span-1 py-2 sm:py-3 px-3 sm:px-4 bg-[#1A1918] hover:bg-black text-[#F7B32B] text-[11px] sm:text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="Panel Administrativo de Usabilidad y Control"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F7B32B]" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. SUB-TABS (HANGAR / PROGRESO / ACTIVIDADES / GALERÍA) */}
      <div className="p-1.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl flex gap-1.5 shadow-[3px_3px_0px_#1A1918] overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('hangar')}
          className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs cursor-pointer ${
            activeSubTab === 'hangar'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <Bike className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Hangar ({userBikes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('progreso')}
          className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs cursor-pointer ${
            activeSubTab === 'progreso'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Progreso</span>
        </button>

        <button
          onClick={() => setActiveSubTab('actividades')}
          className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs cursor-pointer ${
            activeSubTab === 'actividades'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <FileText className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Actividades</span>
        </button>

        <button
          onClick={() => setActiveSubTab('galeria')}
          className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs cursor-pointer ${
            activeSubTab === 'galeria'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <Grid className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Galería</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 03. SUB-TAB: HANGAR DE MOTOS (MÁQUINAS DEL PILOTO)         */}
      {/* ========================================================= */}
      {activeSubTab === 'hangar' && (
        <div className="space-y-6">
          {/* Hangar Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4EEDB] border-2 border-[#1A1918] p-5 rounded-[24px] shadow-[4px_4px_0px_#1A1918]">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#E6332A]" />
                <span className="text-[10px] font-mono uppercase font-black text-[#E6332A] tracking-wider">
                  FLOTA DE EXPEDICIÓN // HANGAR PRIVADO
                </span>
              </div>
              <h3 className="text-xl font-display font-black text-[#1A1918] uppercase tracking-wide mt-0.5">
                Tus Máquinas de Ruta
              </h3>
              <p className="text-xs font-serif italic text-[#1A1918]/70">
                Motos asignadas para rodadas, telemetría y credencial de piloto.
              </p>
            </div>

            <button
              onClick={() => setShowAddBikeModal(true)}
              className="px-5 py-3 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Añadir Moto al Hangar</span>
            </button>
          </div>

          {/* Motorcycles Grid */}
          {userBikes.length === 0 ? (
            <div className="bg-[#FAF6ED] border-2 border-dashed border-[#1A1918] rounded-[28px] p-8 sm:p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EEDB] border-2 border-[#1A1918] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1A1918]">
                <Bike className="w-8 h-8 text-[#E6332A]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-xl text-[#1A1918] uppercase">
                  Tu Hangar está Vacío
                </h4>
                <p className="text-xs font-serif italic text-[#1A1918]/70 max-w-md mx-auto">
                  Aún no has registrado ninguna motocicleta en tu hangar. Añade tu moto para seleccionarla en expediciones y rodadas de tribu.
                </p>
              </div>
              <button
                onClick={() => setShowAddBikeModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Registrar Mi Primera Moto</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userBikes.map((bike, index) => (
                <div 
                  key={bike.id}
                  className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[26px] overflow-hidden shadow-[5px_5px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] transition flex flex-col justify-between"
                >
                  {/* Photo Container with overlay tags */}
                  <div className="h-56 bg-[#F4EEDB] border-b-2 border-[#1A1918] relative overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={bike.photoUrl || PRESET_MOTO_PHOTOS[0]} 
                      alt={`${bike.brand} ${bike.model}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    
                    {/* Badge top-left */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#1A1918] text-[#FAF6ED] text-[10px] font-mono font-black uppercase rounded-lg border border-[#FAF6ED]/30 shadow-[2px_2px_0px_#1A1918]">
                        {bike.brand}
                      </span>
                      {index === 0 && (
                        <span className="px-2.5 py-1 bg-[#F7B32B] text-[#1A1918] text-[10px] font-display font-black uppercase rounded-lg border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]">
                          ★ PRINCIPAL
                        </span>
                      )}
                    </div>

                    {/* Tag bottom-right & Edit button */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#FAF6ED]/95 backdrop-blur-sm text-[#1A1918] text-[10px] font-mono font-black uppercase rounded-lg border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918]">
                        {bike.displacementCc} CC • {bike.year}
                      </span>
                    </div>

                    {/* Quick Edit button top-right on photo */}
                    <button
                      type="button"
                      onClick={() => setEditingBike(bike)}
                      className="absolute top-3 right-3 px-2.5 py-1 bg-[#FAF6ED] hover:bg-[#F7B32B] text-[#1A1918] text-[10px] font-display font-black uppercase tracking-wider rounded-lg border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      title="Editar especificaciones de la moto"
                    >
                      <Wrench className="w-3 h-3 text-[#E6332A]" />
                      <span>Editar</span>
                    </button>
                  </div>

                  {/* Bike Info Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xl font-display font-black text-[#1A1918] uppercase tracking-wide">
                          {bike.brand} {bike.model}
                        </h4>
                        <span className="text-[10px] font-mono uppercase bg-[#F4EEDB] text-[#1A1918] font-bold px-2 py-0.5 border border-[#1A1918] rounded">
                          {bike.type}
                        </span>
                      </div>
                      
                      {bike.nickname && (
                        <p className="text-xs font-serif italic text-[#E6332A] font-bold">
                          &ldquo;{bike.nickname}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Technical Specs Pill Box */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F4EEDB] border-2 border-[#1A1918] p-3 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-[9px] uppercase text-[#1A1918]/60 block font-bold">Neumáticos</span>
                        <span className="text-[#1A1918] font-black truncate block">{bike.tires || '70/30 Mixtas'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-[#1A1918]/60 block font-bold">Cilindrada</span>
                        <span className="text-[#1A1918] font-black">{bike.displacementCc} cc</span>
                      </div>
                    </div>

                    {/* Modifications List */}
                    {bike.modifications && bike.modifications.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase font-black text-[#1A1918]/70 block">
                          Modificaciones Técnicas:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {bike.modifications.map((mod, mIdx) => (
                            <span 
                              key={mIdx}
                              className="text-[10px] px-2.5 py-1 bg-[#FAF6ED] text-[#1A1918] font-medium border border-[#1A1918] rounded-md shadow-[1px_1px_0px_#1A1918]"
                            >
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="pt-3 border-t-2 border-[#1A1918] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBike(bike)}
                        className="px-3.5 py-1.5 bg-[#FAF6ED] hover:bg-[#F7B32B] text-[#1A1918] font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                        title="Editar especificaciones de la moto"
                      >
                        <Wrench className="w-3.5 h-3.5 text-[#E6332A]" />
                        <span>Editar Ficha Moto</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-700 hidden sm:flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          MÁQUINA LISTA
                        </span>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la ${bike.brand} ${bike.model} de tu hangar?`)) {
                              deleteMotorcycle(bike.id);
                            }
                          }}
                          className="p-2 text-[#1A1918]/60 hover:text-[#E6332A] hover:bg-[#F4EEDB] rounded-lg transition border border-transparent hover:border-[#1A1918] cursor-pointer"
                          title="Eliminar del Hangar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 04. SUB-TAB: PROGRESO (TELEMETRY CHARTS)                  */}
      {/* ========================================================= */}
      {activeSubTab === 'progreso' && (
        <div className="space-y-6">
          {/* Discipline selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['Todos los deportes', 'Carretera', 'Doble Propósito', 'Enduro', 'Pista'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDiscipline(d)}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-display whitespace-nowrap rounded-xl border-2 transition shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
                  selectedDiscipline === d
                    ? 'bg-[#1A1918] text-[#FAF6ED] border-[#1A1918] font-black'
                    : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F4EEDB] font-bold'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* This Week Summary */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-4 shadow-[5px_5px_0px_#1A1918]">
            <span className="text-[10px] text-[#E6332A] uppercase tracking-widest font-display font-black">
              ★ BITÁCORA DE ESTA SEMANA ★
            </span>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Distancia</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">42.8 <span className="text-xs text-[#1A1918]/70 font-sans font-bold">km</span></span>
              </div>
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Desnivel</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">890 <span className="text-xs text-[#1A1918]/70 font-sans font-bold">m</span></span>
              </div>
              <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-4 shadow-[2px_2px_0px_#1A1918]">
                <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Tiempo</span>
                <span className="text-2xl sm:text-3xl font-black text-[#1A1918] font-display">1h 45m</span>
              </div>
            </div>

            <p className="text-xs text-[#1A1918]/70 border-t-2 border-[#1A1918] pt-3 font-serif italic font-medium">
              Máquina en óptimo desempeño. Próxima revisión programada a los 5,000 km.
            </p>
          </div>

          {/* 12-Week Interactive Bar Chart */}
          <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-6 space-y-5 shadow-[5px_5px_0px_#1A1918]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">Últimas 12 Semanas</h4>
                <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">Kilómetros acumulados por semana</p>
              </div>
              <span className="text-xs text-[#1A1918] font-display font-black bg-[#F7B32B] px-2.5 py-1 rounded-md border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918]">Prom: 48.2 km/sem</span>
            </div>

            <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 border-b-2 border-[#1A1918]">
              {WEEKLY_DATA.map((item, idx) => {
                const heightPct = item.km > 0 ? Math.max(12, Math.round((item.km / maxKmWeek) * 100)) : 4;
                const isCurrent = idx === WEEKLY_DATA.length - 1;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-9 bg-[#1A1918] text-[#FAF6ED] text-[9px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 font-mono shadow-[2px_2px_0px_#1A1918] border border-[#FAF6ED]/20">
                      {item.km} km ({item.elev}m)
                    </div>

                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 border border-[#1A1918] ${
                        isCurrent 
                          ? 'bg-[#E6332A] shadow-xs' 
                          : item.km > 0 ? 'bg-[#1A1918] group-hover:bg-[#E06423]' : 'bg-[#F4EEDB]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] text-[#1A1918]/70 uppercase font-display font-black">
              <span>Hace 12 semanas</span>
              <span>Esta semana</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 05. SUB-TAB: ACTIVIDADES (SEARCHABLE HISTORICAL LOG)      */}
      {/* ========================================================= */}
      {activeSubTab === 'actividades' && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#1A1918]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Buscar por destino, moto o título..."
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] pl-10 pr-4 py-3 text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:ring-2 focus:ring-[#E6332A] shadow-[3px_3px_0px_#1A1918] rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map(act => (
              <div 
                key={act.id}
                className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-5 space-y-4 shadow-[4px_4px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] transition duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-[#1A1918]/70 font-serif italic font-medium">{act.dateText}</span>
                    <h4 className="text-base font-display font-black text-[#1A1918] uppercase tracking-wide mt-0.5">
                      {act.title}
                    </h4>
                    <span className="text-xs text-[#E6332A] font-display font-black">{act.location}</span>
                  </div>
                  <span className="text-[10px] text-[#1A1918] font-display font-black bg-[#F4EEDB] px-2.5 py-1 border-2 border-[#1A1918] uppercase tracking-wider rounded-md shadow-[1px_1px_0px_#1A1918]">
                    {act.motoModel}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 text-xs shadow-[2px_2px_0px_#1A1918]">
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Distancia</span>
                    <span className="text-[#1A1918] font-display font-black">{act.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Desnivel</span>
                    <span className="text-[#1A1918] font-display font-black">{act.elevationGainM} m</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-[#1A1918]/70 block font-display font-black">Tiempo</span>
                    <span className="text-[#1A1918] font-display font-black">{act.durationText}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 06. SUB-TAB: GALERÍA (PHOTO GRID FROM TRAILS)             */}
      {/* ========================================================= */}
      {activeSubTab === 'galeria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
            <h3 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">
              Fotos de Expediciones ({GALLERY_PHOTOS.length})
            </h3>
            <span className="text-xs text-[#1A1918]/70 font-serif italic font-medium">Capturas en ruta con telemetría GPS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {GALLERY_PHOTOS.map((photo, idx) => (
              <div 
                key={idx}
                className="aspect-square bg-[#F4EEDB] overflow-hidden relative group cursor-pointer border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] hover:shadow-[5px_5px_0px_#1A1918] transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={photo.url} 
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-[#1A1918]/80 opacity-0 group-hover:opacity-100 transition p-2.5 flex items-end">
                  <p className="text-[10px] text-white leading-tight font-serif italic line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 07. MODAL: EDITAR PERFIL DE PILOTO                       */}
      {/* ========================================================= */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setEditProfileOpen(false)} 
      />

      {/* ========================================================= */}
      {/* 08. MODAL: AÑADIR MOTO AL HANGAR                         */}
      {/* ========================================================= */}
      {showAddBikeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] my-auto max-h-[92vh] overflow-y-auto text-[#1A1918] font-sans animate-scaleUp p-5 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-black tracking-widest text-[#E6332A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E6332A]" />
                  HANGAR // REGISTRO DE MÁQUINA
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-black text-[#1A1918] uppercase tracking-wide">
                  Añadir Moto al Hangar
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddBikeModal(false)}
                className="p-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAddBikeSubmit} className="space-y-5">
              
              {/* Photo Upload from Gallery (No presets) */}
              <div className="space-y-3 bg-[#F4EEDB] border-2 border-[#1A1918] p-4 rounded-2xl shadow-[3px_3px_0px_#1A1918]">
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block">
                  Foto de la Máquina (Galería de Fotos)
                </label>

                <input
                  ref={bikeFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBikePhotoUpload}
                />

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div 
                    onClick={() => bikeFileInputRef.current?.click()}
                    className="relative w-full sm:w-36 h-28 rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] bg-white cursor-pointer group shrink-0 flex items-center justify-center"
                  >
                    {bikePhotoUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bikePhotoUrl} alt="Foto seleccionada" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute inset-0 bg-[#1A1918]/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-mono font-bold uppercase p-1">
                          <Camera className="w-4 h-4 mb-1" />
                          Cambiar
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-[#1A1918]/60 group-hover:text-[#E6332A] transition">
                        <Bike className="w-7 h-7 mb-1" />
                        <span className="text-[9px] font-mono uppercase font-black">
                          Tocar para subir
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs font-serif italic text-[#1A1918]/80 font-medium">
                      Sube una fotografía real de tu moto desde los archivos o galería de tu dispositivo.
                    </p>
                    <button
                      type="button"
                      onClick={() => bikeFileInputRef.current?.click()}
                      className="px-4 py-2 bg-white hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#E6332A]" />
                      <span>{bikePhotoUrl ? 'Cambiar foto de galería' : 'Subir foto de mi galería'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Marca *
                  </label>
                  <select
                    value={bikeBrand}
                    onChange={(e) => setBikeBrand(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                  >
                    {['BMW', 'KTM', 'Honda', 'Yamaha', 'Ducati', 'Triumph', 'Husqvarna', 'Royal Enfield', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'Moto Guzzi', 'Aprilia', 'Otro'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    required
                    value={bikeModel}
                    onChange={(e) => setBikeModel(e.target.value)}
                    placeholder="Ej. R 1250 GS Adventure"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              {/* Nickname, Year, CC */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Apodo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={bikeNickname}
                    onChange={(e) => setBikeNickname(e.target.value)}
                    placeholder="Ej. La Bestia"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max="2027"
                    value={bikeYear}
                    onChange={(e) => setBikeYear(Number(e.target.value))}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Cilindrada (cc)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="2500"
                    value={bikeCc}
                    onChange={(e) => setBikeCc(Number(e.target.value))}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              {/* Type and Tires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Tipo de Moto
                  </label>
                  <select
                    value={bikeType}
                    onChange={(e) => setBikeType(e.target.value as BikeType)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918] cursor-pointer"
                  >
                    {[
                      'Doble Propósito', 
                      'Adventure / Maxi-Trail', 
                      'Enduro', 
                      'Scrambler', 
                      'Naked', 
                      'Deportiva', 
                      'Chopper / Cruiser', 
                      'Touring', 
                      'Cafe Racer',
                      'Scooter'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                    Neumáticos Instalados
                  </label>
                  <input
                    type="text"
                    value={bikeTires}
                    onChange={(e) => setBikeTires(e.target.value)}
                    placeholder="Ej. Continental TKC80 (50/50)"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                  />
                </div>
              </div>

              {/* Modifications */}
              <div>
                <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                  Modificaciones Técnicas (Separadas por coma)
                </label>
                <textarea
                  rows={2}
                  value={bikeMods}
                  onChange={(e) => setBikeMods(e.target.value)}
                  placeholder="Ej. Skid plate de aluminio, Faros auxiliares LED, Defensas altas, Escape Akrapovič"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl p-3 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBikeModal(false)}
                  className="flex-1 py-3 px-4 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="flex-2 py-3 px-6 bg-[#E6332A] hover:bg-[#d02c24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider transition shadow-[3px_3px_0px_#1A1918] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Guardar en Hangar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Motorcycle Modal */}
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
