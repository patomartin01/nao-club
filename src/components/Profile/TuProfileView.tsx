'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BikeType, Motorcycle } from '../../types';
import { 
  BarChart2, 
  Grid, 
  Share2, 
  Edit3, 
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
  Camera,
  Radio,
  Image as ImageIcon,
  Calendar,
  Clock,
  Flame,
  Compass,
  TrendingUp,
  Map as MapIcon,
  ChevronRight,
  MessageSquarePlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditProfileModal } from '../Modals/EditProfileModal';
import { EditMotorcycleModal } from '../Modals/EditMotorcycleModal';
import { FollowersModal } from '../Modals/FollowersModal';
import { ActivityDetailModal } from '../Modals/ActivityDetailModal';
import { FounderFeedbackModal } from '../Modals/FounderFeedbackModal';
import { ActivityPost } from '../../types';

interface TuProfileViewProps {
  onOpenEditProfile?: () => void;
  onOpenGarage?: () => void;
}

type ProfileSubTab = 'hangar' | 'progreso' | 'galeria';

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
    users,
    followingUserIds,
    followersUserIds,
    pendingFollowRequests,
    setAuthModalOpen,
    setActiveNavTab,
    deleteActivity,
    toggleKudo,
    addActivityComment,
    openPilotProfileById,
    currentUserFounderNumber
  } = useApp();

  const validFollowersCount = users.filter(u => followersUserIds.includes(u.id)).length;
  const validFollowingCount = users.filter(u => followingUserIds.includes(u.id)).length;

  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('hangar');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Todos los deportes');
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following' | 'requests'>('followers');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  
  // Custom uploaded photos state
  const [customPhotos, setCustomPhotos] = useState<{ url: string; caption: string }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('motomami_user_gallery_photos');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newPhoto = {
            url: reader.result,
            caption: `Expedición ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`
          };
          setCustomPhotos(prev => {
            const updated = [newPhoto, ...prev];
            try {
              localStorage.setItem('motomami_user_gallery_photos', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGalleryPhoto = (indexToDelete: number) => {
    setCustomPhotos(prev => {
      const updated = prev.filter((_, i) => i !== indexToDelete);
      try {
        localStorage.setItem('motomami_user_gallery_photos', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Profile edit modal state
  const [isEditProfileOpen, setEditProfileOpen] = useState(false);

  // Bike editing modal state
  const [editingBike, setEditingBike] = useState<Motorcycle | null>(null);

  // Add bike modal state
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [bikeBrand, setBikeBrand] = useState('BMW');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeYear, setBikeYear] = useState<number | string>(2023);
  const [bikeCc, setBikeCc] = useState<number | string>(1250);
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
          const raw = reader.result;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxW = 900;
            let w = img.width;
            let h = img.height;
            if (w > maxW) {
              h = Math.round((h * maxW) / w);
              w = maxW;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              setBikePhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
            } else {
              setBikePhotoUrl(raw);
            }
          };
          img.onerror = () => setBikePhotoUrl(raw);
          img.src = raw;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // State for inspecting activity detail
  const [selectedActivityForDetail, setSelectedActivityForDetail] = useState<ActivityPost | null>(null);

  // Filter completed activities by user:
  // 1. Where currentUser is the author/pilot (by pilotId, pilotName or pilotHandle)
  // 2. Where someone else recorded the expedition and added currentUser as participant/attendee
  const userActivities = React.useMemo(() => {
    return activities.filter(a => {
      const isPilot = 
        (a.pilotId && a.pilotId === currentUser.id) ||
        (a.pilotName && a.pilotName.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) ||
        (a.pilotHandle && currentUser.handle && a.pilotHandle.toLowerCase().trim() === currentUser.handle.toLowerCase().trim());
      
      const isGroupAttendee = Boolean(
        a.groupInfo?.participants?.some(p => 
          (p.userId && p.userId === currentUser.id) ||
          (p.name && p.name.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) ||
          (p.handle && currentUser.handle && p.handle.toLowerCase().trim() === currentUser.handle.toLowerCase().trim())
        )
      );

      return isPilot || isGroupAttendee;
    });
  }, [activities, currentUser.id, currentUser.name, currentUser.handle]);

  const displayActivities = userActivities.length > 0 ? userActivities : [];

  // Compute real statistics strictly from published activities (0 when no rides)
  const realTotalKm = Math.round(userActivities.reduce((acc, a) => acc + (a.distanceKm || 0), 0) * 10) / 10;
  const realTotalElev = userActivities.reduce((acc, a) => acc + (a.elevationGainM || 0), 0);
  const realRidesCount = userActivities.length;

  // Compute total duration in minutes then format nicely
  const parseDurationMinutes = (durStr?: string): number => {
    if (!durStr) return 0;
    const hMatch = durStr.match(/(\d+)\s*h/i);
    const mMatch = durStr.match(/(\d+)\s*m/i);
    const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
    const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
    return hours * 60 + mins;
  };

  const totalMinutes = userActivities.reduce((acc, a) => acc + parseDurationMinutes(a.durationText), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const realDurationFormatted = totalHours > 0 
    ? `${totalHours}h ${remainingMins}m` 
    : totalMinutes > 0 ? `${remainingMins}m` : '0h 00m';

  // Real weekly telemetry breakdown (last 12 weeks dynamically generated)
  const realWeeklyData = React.useMemo(() => {
    const weeks: { week: string; km: number; elev: number; rides: number }[] = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      // Match activities that fall in this week window
      const weekActs = userActivities.filter(a => {
        if (!a.dateText) return false;
        // Try parsing activity timestamp or id
        const actTime = a.id?.startsWith('act-') 
          ? parseInt(a.id.replace('act-', ''), 10) 
          : new Date(a.dateText).getTime();
        if (isNaN(actTime)) return false;
        return actTime >= weekStart.getTime() && actTime < weekEnd.getTime();
      });

      const km = Math.round(weekActs.reduce((sum, a) => sum + (a.distanceKm || 0), 0) * 10) / 10;
      const elev = weekActs.reduce((sum, a) => sum + (a.elevationGainM || 0), 0);
      weeks.push({
        week: i === 0 ? 'Esta' : `Sem -${i}`,
        km,
        elev,
        rides: weekActs.length
      });
    }
    return weeks;
  }, [userActivities]);

  const maxKmWeek = Math.max(...realWeeklyData.map(d => d.km), 10);
  const avgWeeklyKm = Math.round((realTotalKm / 12) * 10) / 10;

  // Aggregate photos from custom user uploads + published activities
  const galleryPhotos = React.useMemo(() => {
    const list: { url: string; caption: string; isCustom?: boolean; customIndex?: number }[] = [];
    
    // Add custom uploaded photos
    customPhotos.forEach((cp, idx) => {
      list.push({ url: cp.url, caption: cp.caption, isCustom: true, customIndex: idx });
    });

    // Add photos from user's published activities
    userActivities.forEach(act => {
      if (act.photos && act.photos.length > 0) {
        act.photos.forEach(photoUrl => {
          list.push({
            url: photoUrl,
            caption: `${act.title} • ${act.location}`
          });
        });
      }
    });

    return list;
  }, [customPhotos, userActivities]);

  const [shareToast, setShareToast] = useState(false);

  const handleShareProfile = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
    const profileUrl = `${origin}?piloto=${encodeURIComponent(currentUser.handle || currentUser.id)}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
    try {
      confetti({ particleCount: 25, spread: 60 });
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
      year: Number(bikeYear) || 2024,
      displacementCc: Number(bikeCc) || 500,
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

      {/* 01. PROFILE HEADER (Simplified & Compact Pilot Card) */}
      <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[3px_3px_0px_#1A1918] relative overflow-hidden">
        {/* Top-Right Action: Share button */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          {shareToast && (
            <span className="text-[10px] font-mono font-bold bg-[#1A1918] text-[#FAF6ED] px-2.5 py-1 rounded-lg border border-[#1A1918] shadow-[2px_2px_0px_#1A1918] animate-in fade-in duration-150 flex items-center gap-1">
              <Check className="w-3 h-3 text-[#F7B32B]" />
              ¡Link copiado!
            </span>
          )}
          <button
            type="button"
            onClick={handleShareProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7B32B] hover:bg-[#e5a424] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center justify-center transition cursor-pointer"
            title="Compartir perfil de piloto (copiar enlace para que te sigan)"
          >
            <Share2 className="w-3.5 h-3.5 text-[#1A1918]" />
          </button>
        </div>

        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 relative z-10 pr-10">
          {/* Avatar with edit badge */}
          <div className="relative shrink-0 group">
            <button
              type="button"
              onClick={() => {
                if (onOpenEditProfile) onOpenEditProfile();
                setEditProfileOpen(true);
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] bg-[#F4EEDB] block relative text-left cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
              title="Toca para cambiar foto o editar perfil"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenEditProfile) onOpenEditProfile();
                setEditProfileOpen(true);
              }}
              className="absolute -bottom-1 -right-1 p-1 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] rounded-lg border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
              title="Editar foto y perfil"
            >
              <Edit3 className="w-2.5 h-2.5 text-[#1A1918]" />
            </button>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            {/* Level badge & Handle as Primary Identifier */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono font-black text-[#E6332A] bg-[#E6332A]/10 px-2 py-0.5 rounded-md border border-[#E6332A]/30 tracking-tight">
                {currentUser.handle}
              </span>
              <span className="text-[9px] font-mono text-[#1A1918]/80 uppercase tracking-wider bg-[#F4EEDB] px-1.5 py-0.5 border border-[#1A1918]/30 rounded font-bold">
                {currentUser.ridingLevel?.toUpperCase() || 'INTERMEDIO'}
              </span>
            </div>

            {/* Pilot Name with inline Edit Icon */}
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-display font-black text-[#1A1918] uppercase tracking-wide truncate">
                {currentUser.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  if (onOpenEditProfile) onOpenEditProfile();
                  setEditProfileOpen(true);
                }}
                className="p-1 rounded-lg border border-[#1A1918] bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer inline-flex items-center justify-center shrink-0"
                title="Editar información de perfil"
              >
                <Edit3 className="w-3 h-3 text-[#1A1918]" />
              </button>
            </div>
            
            <p className="text-[11px] font-serif italic text-[#1A1918]/80 truncate">
              {currentUser.location || 'México'}
            </p>
          </div>
        </div>

        {/* Dedicated stats & community bar - Clean, spacious, beautifully aligned */}
        <div className="mt-3.5 pt-3 border-t-2 border-[#1A1918]/15 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Hangar badge */}
            <button 
              type="button"
              onClick={() => setActiveSubTab('hangar')}
              className="inline-flex items-center gap-1.5 font-display font-black text-[#1A1918] bg-[#F4EEDB] hover:bg-[#EDE6D3] px-2.5 py-1 rounded-xl border-2 border-[#1A1918] shadow-[1.5px_1.5px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition cursor-pointer text-[10px]"
              title="Ver motos en el Hangar"
            >
              <Bike className="w-3.5 h-3.5 text-[#E6332A]" />
              <span>{userBikes.length} {userBikes.length === 1 ? 'MOTO' : 'MOTOS'}</span>
            </button>

            {/* Salidas count */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/70 border border-[#1A1918]/30 rounded-xl text-[11px]">
              <span className="font-display font-black text-[#1A1918]">{userActivities.length || currentUser.stats?.completedCount || 0}</span>
              <span className="text-[#1A1918]/70 font-medium">salidas</span>
            </div>

            {/* Seguidores */}
            <button
              type="button"
              onClick={() => {
                setFollowersModalTab('followers');
                setFollowersModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 hover:bg-[#EDE6D3] border border-[#1A1918]/30 hover:border-[#1A1918] rounded-xl text-[11px] cursor-pointer transition group"
              title="Ver personas que te siguen"
            >
              <span className="font-display font-black text-[#1A1918] group-hover:text-[#E6332A] transition">
                {validFollowersCount}
              </span>
              <span className="text-[#1A1918]/70 group-hover:text-[#1A1918] font-medium transition">
                {validFollowersCount === 1 ? 'seguidor' : 'seguidores'}
              </span>
            </button>

            {/* Siguiendo */}
            <button
              type="button"
              onClick={() => {
                setFollowersModalTab('following');
                setFollowersModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 hover:bg-[#EDE6D3] border border-[#1A1918]/30 hover:border-[#1A1918] rounded-xl text-[11px] cursor-pointer transition group"
              title="Ver pilotos a los que sigues"
            >
              <span className="font-display font-black text-[#1A1918] group-hover:text-[#E6332A] transition">
                {validFollowingCount}
              </span>
              <span className="text-[#1A1918]/70 group-hover:text-[#1A1918] font-medium transition">
                siguiendo
              </span>
            </button>

            {/* Solicitudes pendientes si las hay */}
            {pendingFollowRequests.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFollowersModalTab('requests');
                  setFollowersModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E6332A] text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-[9px] uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] animate-pulse hover:bg-[#c92820] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                title="Tienes solicitudes de seguimiento pendientes"
              >
                <span>{pendingFollowRequests.length} SOLICITUD{pendingFollowRequests.length > 1 ? 'ES' : ''}</span>
              </button>
            )}
          </div>

          {/* Botón sutil exclusivo para los primeros 50 usuarios: sugerencias o comentarios */}
          {currentUserFounderNumber !== null && currentUserFounderNumber <= 50 && (
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(true)}
              className="py-1 px-2.5 bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition rounded-xl border border-[#1A1918]/40 hover:border-[#1A1918] shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer shrink-0 ml-auto"
              title={`Piloto Fundador #${currentUserFounderNumber}: Enviar sugerencia o comentario directo al CEO`}
            >
              <MessageSquarePlus className="w-3 h-3 text-[#E6332A]" />
              <span className="hidden sm:inline">Sugerencias</span>
              <span className="sm:hidden">Feedback</span>
              <span className="text-[8px] font-black bg-[#F7B32B] text-[#1A1918] px-1 py-0.2 rounded font-mono">
                #{currentUserFounderNumber}
              </span>
            </button>
          )}

          {/* Optional Admin shortcut button if admin */}
          {(currentUser.email?.toLowerCase() === 'pmartin.v2001@gmail.com' || currentUser.handle === '@patomartin' || currentUser.id === 'user-patricio') && (
            <button
              onClick={() => setActiveNavTab('admin')}
              className={`py-1 px-2.5 bg-[#1A1918] hover:bg-black text-[#F7B32B] text-[9px] font-display font-black uppercase tracking-wider flex items-center justify-center gap-1 transition rounded-xl border-2 border-[#1A1918] shadow-[1.5px_1.5px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 ${
                currentUserFounderNumber !== null && currentUserFounderNumber <= 50 ? 'ml-1' : 'ml-auto'
              }`}
              title="Panel Administrativo de Usabilidad y Control"
            >
              <ShieldCheck className="w-3 h-3 text-[#F7B32B]" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* 02. SUB-TABS (HANGAR / PROGRESO / GALERÍA) */}
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
          onClick={() => setActiveSubTab('galeria')}
          className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-2 uppercase tracking-wider font-display transition rounded-xl text-xs cursor-pointer ${
            activeSubTab === 'galeria'
              ? 'bg-[#1A1918] text-[#FAF6ED] font-black border border-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
              : 'text-[#1A1918]/70 hover:text-[#1A1918] font-bold'
          }`}
        >
          <Grid className="w-4 h-4 text-[#F7B32B]" />
          <span className="text-[10px] tracking-widest">Galería ({galleryPhotos.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 03. SUB-TAB: HANGAR DE MOTOS (MÁQUINAS DEL PILOTO)         */}
      {/* ========================================================= */}
      {activeSubTab === 'hangar' && (
        <div className="space-y-6">
          {/* Motorcycles Grid / Empty State */}
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
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddBikeModal(true)}
                  className="px-4 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white font-display font-black text-xs uppercase tracking-wider rounded-xl border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Añadir Moto</span>
                </button>
              </div>
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
          </div>
        )}
      </div>
    )}

      {/* ========================================================= */}
      {/* 04. SUB-TAB: PROGRESO (TELEMETRY CHARTS)                  */}
      {/* ========================================================= */}
      {/* 04. SUB-TAB: PROGRESO (TELEMETRY CHARTS) */}
      {activeSubTab === 'progreso' && (
        <div className="space-y-6">
          {userActivities.length === 0 ? (
            /* Clean Empty State when user hasn't published any rides yet */
            <div className="bg-[#FAF6ED] border-2 border-dashed border-[#1A1918] rounded-[28px] p-8 sm:p-12 text-center space-y-4 shadow-[4px_4px_0px_#1A1918]">
              <div className="w-16 h-16 rounded-2xl bg-[#F7B32B] border-2 border-[#1A1918] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1A1918]">
                <BarChart2 className="w-8 h-8 text-[#1A1918]" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-xl font-display font-black text-[#1A1918] uppercase tracking-wide">
                  Sin Rodadas Registradas Aún
                </h3>
                <p className="text-xs text-[#1A1918]/70 font-serif italic">
                  Tus kilómetros, desnivel, velocidad y gráficas semanales se calcularán automáticamente en tiempo real conforme grabes y publiques tus rodadas oficiales.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveNavTab('registrar')}
                  className="px-6 py-3 bg-[#E6332A] hover:bg-[#c92820] text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4" />
                  <span>Grabar Mi Primera Rodada</span>
                </button>
              </div>
            </div>
          ) : (
            /* Real Telemetry Data */
            <>
              {/* Summary Card with Real Data */}
              <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-5 sm:p-6 space-y-4 shadow-[5px_5px_0px_#1A1918]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#E6332A] uppercase tracking-widest font-display font-black">
                    ★ TELEMETRÍA ACUMULADA REAL ★
                  </span>
                  <span className="text-[10px] font-mono text-[#1A1918]/70 uppercase">
                    {realRidesCount} {realRidesCount === 1 ? 'salida publicada' : 'salidas publicadas'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 sm:p-4 shadow-[2px_2px_0px_#1A1918]">
                    <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Distancia</span>
                    <span className="text-xl sm:text-3xl font-black text-[#1A1918] font-display">
                      {realTotalKm} <span className="text-[10px] sm:text-xs text-[#1A1918]/70 font-sans font-bold">km</span>
                    </span>
                  </div>
                  <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 sm:p-4 shadow-[2px_2px_0px_#1A1918]">
                    <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Desnivel</span>
                    <span className="text-xl sm:text-3xl font-black text-[#1A1918] font-display">
                      {realTotalElev} <span className="text-[10px] sm:text-xs text-[#1A1918]/70 font-sans font-bold">m</span>
                    </span>
                  </div>
                  <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl p-3 sm:p-4 shadow-[2px_2px_0px_#1A1918]">
                    <span className="text-[9px] uppercase tracking-wider text-[#1A1918]/70 block font-display font-black">Tiempo</span>
                    <span className="text-xl sm:text-3xl font-black text-[#1A1918] font-display">
                      {realDurationFormatted}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#1A1918]/70 border-t-2 border-[#1A1918] pt-3 font-serif italic font-medium">
                  Estadísticas calculadas directamente de tus publicaciones de ruta.
                </p>
              </div>

              {/* 12-Week Dynamic Bar Chart */}
              <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-5 sm:p-6 space-y-5 shadow-[5px_5px_0px_#1A1918]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">Últimas 12 Semanas</h4>
                    <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">Kilómetros reales acumulados por semana</p>
                  </div>
                  <span className="text-xs text-[#1A1918] font-display font-black bg-[#F7B32B] px-2.5 py-1 rounded-md border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918] shrink-0">
                    Prom: {avgWeeklyKm} km/sem
                  </span>
                </div>

                <div className="h-40 flex items-end gap-1.5 pt-6 pb-2 border-b-2 border-[#1A1918]">
                  {realWeeklyData.map((item, idx) => {
                    const heightPct = item.km > 0 ? Math.max(15, Math.round((item.km / maxKmWeek) * 100)) : 6;
                    const isCurrent = idx === realWeeklyData.length - 1;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-9 bg-[#1A1918] text-[#FAF6ED] text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10 font-mono shadow-[2px_2px_0px_#1A1918] border border-[#FAF6ED]/20">
                          {item.km} km ({item.elev}m)
                        </div>

                        <div 
                          className={`w-full rounded-t-sm transition-all duration-300 border border-[#1A1918] ${
                            isCurrent 
                              ? (item.km > 0 ? 'bg-[#E6332A]' : 'bg-[#E6332A]/30')
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

              {/* Dynamic Compact List of Pilot Rides (Simple & clean) */}
              <div className="bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] p-5 sm:p-6 space-y-4 shadow-[5px_5px_0px_#1A1918]">
                <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
                  <div>
                    <h4 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide flex items-center gap-2">
                      <MapIcon className="w-4 h-4 text-[#E6332A]" />
                      <span>Bitácora de Rodadas del Piloto ({userActivities.length})</span>
                    </h4>
                    <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">
                      Tus expediciones grabadas y salidas en grupo como asistente
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#1A1918]/70 uppercase hidden sm:inline-block">
                    Orden cronológico
                  </span>
                </div>

                <div className="space-y-2.5">
                  {userActivities.map((act) => {
                    const isAuthor = act.pilotId === currentUser.id || act.pilotName === currentUser.name;
                    return (
                      <div
                        key={act.id}
                        onClick={() => setSelectedActivityForDetail(act)}
                        className="bg-[#F4EEDB] hover:bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] hover:shadow-[3px_3px_0px_#1A1918] transition cursor-pointer group active:translate-x-0.5 active:translate-y-0.5"
                      >
                        {/* Left: Icon & Core Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] border-2 border-[#1A1918] flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_#1A1918] group-hover:bg-[#F7B32B] transition">
                            <Compass className="w-5 h-5 text-[#1A1918]" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-display font-black text-xs sm:text-sm text-[#1A1918] uppercase tracking-tight truncate group-hover:text-[#E6332A] transition">
                                {act.title}
                              </h5>
                              {!isAuthor && (
                                <span className="bg-[#1A1918] text-[#F7B32B] text-[8px] font-display font-black uppercase px-1.5 py-0.5 rounded border border-[#1A1918] shrink-0">
                                  Asistente
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2.5 text-[10px] text-[#1A1918]/70 font-mono mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-[#E6332A]" />
                                <span>{act.dateText}</span>
                              </span>
                              {act.location && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{act.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Metrics & Action */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <div className="font-display font-black text-sm sm:text-base text-[#1A1918] leading-none">
                              {act.distanceKm} <span className="text-[10px] font-sans font-bold text-[#1A1918]/70">km</span>
                            </div>
                            <div className="text-[9px] font-mono text-[#1A1918]/60 mt-0.5">
                              {act.durationText || '0h 00m'}
                            </div>
                          </div>

                          {/* Delete button (Solo autor / quien la grabó) */}
                          {isAuthor && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`¿Seguro que deseas eliminar la rodada grabada "${act.title}"? Esta acción no se puede deshacer.`)) {
                                  deleteActivity(act.id);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-[#FAF6ED] hover:bg-[#E6332A] hover:text-white border-2 border-[#1A1918] flex items-center justify-center text-[#1A1918]/60 transition shrink-0 shadow-[1px_1px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5"
                              title="Eliminar tu rodada grabada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div className="w-7 h-7 rounded-lg bg-[#FAF6ED] border-2 border-[#1A1918] flex items-center justify-center text-[#1A1918] group-hover:bg-[#1A1918] group-hover:text-white transition shrink-0 shadow-[1px_1px_0px_#1A1918]">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 05. SUB-TAB: GALERÍA (REAL RIDE PHOTOS + UPLOADS)         */}
      {/* ========================================================= */}
      {activeSubTab === 'galeria' && (
        <div className="space-y-5">
          {/* Header bar with photo counter and upload button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#1A1918] pb-4">
            <div>
              <h3 className="text-sm font-display font-black text-[#1A1918] uppercase tracking-wide">
                Galería de Expediciones ({galleryPhotos.length})
              </h3>
              <p className="text-xs text-[#1A1918]/70 font-serif italic font-medium">
                Fotos de tus rodadas publicadas y capturas subidas directamente
              </p>
            </div>

            {/* Hidden file input for uploading gallery photos */}
            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadGalleryPhoto}
            />

            <button
              type="button"
              onClick={() => galleryFileInputRef.current?.click()}
              className="px-4 py-2 bg-[#E6332A] hover:bg-[#c92820] text-white border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto</span>
            </button>
          </div>

          {galleryPhotos.length === 0 ? (
            /* Empty state when no photos have been added yet */
            <div className="bg-[#FAF6ED] border-2 border-dashed border-[#1A1918] rounded-[28px] p-8 sm:p-12 text-center space-y-4 shadow-[4px_4px_0px_#1A1918]">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EEDB] border-2 border-[#1A1918] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1A1918]">
                <ImageIcon className="w-8 h-8 text-[#1A1918]/50" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-display font-black text-[#1A1918] uppercase tracking-wide">
                  Tu Galería Está Vacía
                </h3>
                <p className="text-xs text-[#1A1918]/70 font-serif italic">
                  Las fotos que subas aquí o adjuntes a las rodadas que publiques se guardarán y mostrarán en esta cuadrícula.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#E6332A]" />
                  <span>Subir Mi Primera Foto</span>
                </button>
              </div>
            </div>
          ) : (
            /* Dynamic grid of real photos */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {galleryPhotos.map((photo, idx) => (
                <div 
                  key={idx}
                  className="aspect-square bg-[#F4EEDB] overflow-hidden relative group border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] hover:shadow-[5px_5px_0px_#1A1918] transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={photo.url} 
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  
                  {/* Caption Overlay */}
                  <div className="absolute inset-0 bg-[#1A1918]/80 opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                    <div className="flex justify-end">
                      {photo.isCustom && photo.customIndex !== undefined && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGalleryPhoto(photo.customIndex!);
                          }}
                          className="p-1 bg-[#E6332A] text-white rounded-md border border-[#1A1918] hover:bg-[#c92820] transition"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-white leading-tight font-serif italic line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-[#1A1918]/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[8px_8px_0px_#1A1918] my-auto max-h-[88vh] overflow-y-auto overscroll-contain text-[#1A1918] font-sans animate-scaleUp p-5 sm:p-7 space-y-5 pb-8"
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

                  <div className="flex-1 text-center sm:text-left">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
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

                <div className="grid grid-cols-2 sm:contents gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                      Año *
                    </label>
                    <input
                      type="number"
                      min="1970"
                      max="2027"
                      value={bikeYear}
                      onChange={(e) => setBikeYear(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="2024"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-black text-[#1A1918] block mb-1">
                      Cilindrada (cc) *
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="2500"
                      value={bikeCc}
                      onChange={(e) => setBikeCc(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Ej. 411"
                      className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none transition font-sans font-medium shadow-[2px_2px_0px_#1A1918]"
                    />
                  </div>
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

      {/* Followers & Following Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        initialTab={followersModalTab}
        targetUser={currentUser}
      />

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivityForDetail}
        isOpen={!!selectedActivityForDetail}
        onClose={() => setSelectedActivityForDetail(null)}
        onOpenPilotProfile={(pilotId) => {
          setSelectedActivityForDetail(null);
          openPilotProfileById(pilotId);
        }}
        onToggleSaludo={(activityId) => toggleKudo(activityId)}
        onAddComment={(activityId, text) => addActivityComment(activityId, text)}
      />

      {/* Founder Feedback Modal (Exclusive for top 50 users) */}
      <FounderFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
      />

    </div>
  );
};
