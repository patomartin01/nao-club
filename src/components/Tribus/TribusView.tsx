'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Calendar, 
  Plus, 
  Key, 
  MapPin, 
  Clock, 
  Check, 
  Copy,
  ChevronRight, 
  ArrowLeft,
  Navigation,
  Compass,
  CheckCircle2,
  X,
  ExternalLink,
  Shield,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Search,
  Sparkles,
  Share2,
  Bell,
  Pencil,
  Mountain,
  UserPlus,
  ChevronDown,
  Camera,
  Upload,
  Image as ImageIcon,
  Vote,
  AlertCircle,
  HelpCircle,
  XCircle,
  Bike
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { buildOrderedGoogleMapsUrl } from '../../utils/googleMaps';
import { RouteProposal, Rodada } from '../../types';
import { PlanCardModal } from './PlanCardModal';
import { StepByStepRodadaModal } from './StepByStepRodadaModal';
import { RouteTacticalMapCard } from '../Routes/RouteTacticalMapCard';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.879-2.056-.98-.276-.1-.476-.15-.676.15-.2.301-.776.98-.952 1.18-.175.201-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.799-1.498-1.786-1.674-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.201.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.234-.244-.587-.492-.507-.676-.516l-.577-.01c-.2 0-.527.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.228 3.11c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9.12.579-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.495 2 2 6.495 2 12.04c0 1.93.548 3.737 1.496 5.275L2.062 22l4.856-1.402C8.38 21.494 10.158 22 12.04 22c5.545 0 10.04-4.495 10.04-10.04C22.08 6.495 17.585 2 12.04 2z" />
  </svg>
);

const RoadIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 19L8 5h8l4 14" />
    <line x1="12" y1="8" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="16" />
  </svg>
);

interface TribusViewProps {
  onOpenCreateCrew: () => void;
  onOpenJoinCrew: () => void;
  onOpenCreateRodada: () => void;
  onOpenProposeRoute?: () => void;
}

export const TribusView: React.FC<TribusViewProps> = ({
  onOpenCreateCrew,
  onOpenJoinCrew,
  onOpenCreateRodada,
}) => {
  const { 
    crews, 
    currentCrew,
    setCurrentCrew,
    updateCrew,
    addCrewMember,
    rodadas, 
    currentRodada,
    setCurrentRodada,
    createRodada,
    routeProposals,
    proposeRoute,
    voteRoute,
    downvoteRoute,
    addRouteComment,
    lockWinningRoute,
    unlockWinningRoute,
    rsvpRodada,
    userBikes,
    motorcycles,
    currentUser,
    users,
    openPilotProfileById
  } = useApp();

  // Helper to format date cleanly as "31 Oct 26", "20 Nov 26", or "31 Oct - 02 Nov 26"
  const formatHumanDate = (dateStr: string, endDateStr?: string, includeYear: boolean = true): string => {
    if (!dateStr) return '';
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const parsePart = (str: string) => {
      const parts = str.split('-');
      if (parts.length === 3) {
        const year = parts[0].slice(-2);
        const day = parts[2].padStart(2, '0');
        const monthIdx = parseInt(parts[1], 10) - 1;
        return { day, month: months[monthIdx] || parts[1], year };
      }
      return null;
    };

    const start = parsePart(dateStr);
    if (!start) return dateStr;

    const yrSuffix = includeYear ? ` ${start.year}` : '';

    if (endDateStr) {
      const end = parsePart(endDateStr);
      if (end) {
        if (start.month === end.month) {
          if (start.day === end.day) return `${start.day} ${start.month}${yrSuffix}`;
          return `${start.day} - ${end.day} ${start.month}${yrSuffix}`;
        }
        return `${start.day} ${start.month} - ${end.day} ${end.month}${yrSuffix}`;
      }
    }

    return `${start.day} ${start.month}${yrSuffix}`;
  };

  const formatDayOnly = (dateStr: string, endDateStr?: string): string => {
    if (!dateStr) return '';
    const parseDay = (s: string) => {
      const p = s.split('-');
      return p.length === 3 ? parseInt(p[2], 10) : s;
    };
    const startDay = parseDay(dateStr);
    if (endDateStr) {
      const endDay = parseDay(endDateStr);
      if (startDay !== endDay) {
        return `${startDay}-${endDay}`;
      }
    }
    return `${startDay}`;
  };

  const formatMonthOnly = (dateStr: string): string => {
    if (!dateStr) return '';
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const mIdx = parseInt(parts[1], 10) - 1;
      return months[mIdx] || parts[1];
    }
    return '';
  };

  // Selected Tribu inside this view (null = Directorio de Mis Tribus)
  const [selectedTribuId, setSelectedTribuId] = useState<string | null>(null);
  const [activeTribuTab, setActiveTribuTab] = useState<'rodadas' | 'miembros'>('rodadas');
  
  // Selected Rodada / Convocatoria Date inside the Tribu
  const [selectedRodadaId, setSelectedRodadaId] = useState<string | null>(null);

  // Simulated notification toast for sending alert to group pilots' phones
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [showWhatsappMissingNotice, setShowWhatsappMissingNotice] = useState<boolean>(false);
  const [copiedCrewShare, setCopiedCrewShare] = useState<boolean>(false);

  // Search query & filter for Tribus directory
  const [searchTribuQuery, setSearchTribuQuery] = useState('');
  const [tribuFilterTab, setTribuFilterTab] = useState<'all' | 'admin' | 'confirmed'>('all');
  const [copiedCodeCrewId, setCopiedCodeCrewId] = useState<string | null>(null);

  // Search & filter for Pilots tab
  const [pilotSearchQuery, setPilotSearchQuery] = useState('');
  const [pilotRoleFilter, setPilotRoleFilter] = useState<'all' | 'capitan' | 'barrendero' | 'rider'>('all');

  // Selected Route Option Detail Modal (Airbnb style detail view)
  const [detailProposalId, setDetailProposalId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Detailed Plan Card Modal state (tarjetita del plan)
  const [showPlanCardModal, setShowPlanCardModal] = useState<boolean>(false);
  const [selectedConfirmedRodadaForPlan, setSelectedConfirmedRodadaForPlan] = useState<Rodada | null>(null);
  
  // Tactical RSVP Dropdown popover state
  const [rsvpDropdownOpenRodadaId, setRsvpDropdownOpenRodadaId] = useState<string | null>(null);

  // Interactive Route Proposal Modal state (multistop Google Maps route planner)
  const [showInteractiveProposeModal, setShowInteractiveProposeModal] = useState<boolean>(false);
  const [showConvokeModal, setShowConvokeModal] = useState<boolean>(false);

  // Quick propose modal state
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false);
  const [showAddPilotModal, setShowAddPilotModal] = useState<boolean>(false);
  const [propTitle, setPropTitle] = useState('');
  const [propDestination, setPropDestination] = useState('');
  const [propState, setPropState] = useState('Estado de México');
  const [propKm, setPropKm] = useState('140');
  const [propOffroad, setPropOffroad] = useState('45');
  const [propMeetingTime, setPropMeetingTime] = useState('08:00 AM');
  const [propMeetingPoint, setPropMeetingPoint] = useState('Gasolinera Interlomas');
  const [propPlan, setPropPlan] = useState('');

  // Toast / feedback state
  const [copiedCode, setCopiedCode] = useState(false);

  // Edit group state
  const [isEditingCrewName, setIsEditingCrewName] = useState(false);
  const [editedCrewName, setEditedCrewName] = useState('');
  const [editedCrewCover, setEditedCrewCover] = useState('');
  const [editedCrewWhatsapp, setEditedCrewWhatsapp] = useState('');
  const [copiedNaoLink, setCopiedNaoLink] = useState(false);
  const [showEditCrewModal, setShowEditCrewModal] = useState(false);
  const [showCrewDropdown, setShowCrewDropdown] = useState(false);

  // Active crew object
  const activeTribu = crews.find(c => c.id === selectedTribuId) || null;
  const isCreatorOrAdmin = activeTribu ? activeTribu.creatorId === currentUser.id : false;

  const handleOpenEditCrew = () => {
    if (!activeTribu) return;
    setEditedCrewName(activeTribu.name);
    setEditedCrewCover(activeTribu.coverImage || '');
    setEditedCrewWhatsapp(activeTribu.whatsappGroupUrl || '');
    setShowEditCrewModal(true);
  };

  const handleCopyNaoLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?tab=tribus` : 'https://nao-club-three.vercel.app';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedNaoLink(true);
      setNotificationToast('¡Enlace de NAO copiado! Pégalo en la descripción de tu grupo de WhatsApp.');
      setTimeout(() => setCopiedNaoLink(false), 3000);
    }
  };

  const handleWhatsAppHeaderClick = (e: React.MouseEvent) => {
    if (activeTribu?.whatsappGroupUrl && activeTribu.whatsappGroupUrl.trim() !== '') {
      window.open(activeTribu.whatsappGroupUrl, '_blank', 'noopener,noreferrer');
    } else {
      e.preventDefault();
      setShowWhatsappMissingNotice((prev) => !prev);
      setTimeout(() => setShowWhatsappMissingNotice(false), 4500);
    }
  };

  const handleShareCrewWithCode = async () => {
    if (!activeTribu) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';
    const shareUrl = `${origin}/?tab=tribus&tribu=${activeTribu.id}&code=${activeTribu.inviteCode}`;
    const shareText = `🏍️ Únete a la tribu "${activeTribu.name}" en NAO\n🔑 Clave de acceso: ${activeTribu.inviteCode}\n🔗 Enlace directo: ${shareUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Tribu ${activeTribu.name} - NAO`,
          text: `Únete a la tribu "${activeTribu.name}" en NAO. Clave de acceso: ${activeTribu.inviteCode}`,
          url: shareUrl,
        });
        setCopiedCrewShare(true);
        setTimeout(() => setCopiedCrewShare(false), 3000);
        return;
      } catch (err) {
        // Fallback to clipboard if share cancelled
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopiedCrewShare(true);
      setNotificationToast(`¡Enlace y clave (${activeTribu.inviteCode}) de ${activeTribu.name} copiados!`);
      setTimeout(() => {
        setCopiedCrewShare(false);
        setNotificationToast(null);
      }, 4000);
    }
  };

  const handleSaveCrewDetails = () => {
    if (!activeTribu) return;
    const trimmedName = editedCrewName.trim();
    const trimmedCover = editedCrewCover.trim();
    if (trimmedName) {
      updateCrew(activeTribu.id, { 
        name: trimmedName,
        coverImage: trimmedCover || activeTribu.coverImage,
        whatsappGroupUrl: editedCrewWhatsapp.trim() || undefined
      });
      setNotificationToast(`Grupo actualizado: "${trimmedName}".`);
    }
    setShowEditCrewModal(false);
  };

  const handleSaveCrewName = () => {
    if (!activeTribu) return;
    const trimmed = editedCrewName.trim();
    if (trimmed && trimmed !== activeTribu.name) {
      updateCrew(activeTribu.id, { name: trimmed });
      setNotificationToast(`Nombre del grupo actualizado a "${trimmed}".`);
    }
    setIsEditingCrewName(false);
  };

  // Rodadas belonging to this Tribu
  const tribuRodadas = activeTribu 
    ? rodadas.filter(r => r.crewId === activeTribu.id)
    : [];

  // Rodadas Confirmadas (status === 'fijada') - Solo estas aparecen en la sección superior
  const confirmedRodadas = tribuRodadas.filter(r => r.status === 'fijada');

  // Active selected rodada (user-selected or first available)
  const activeRodada = (selectedRodadaId ? tribuRodadas.find(r => r.id === selectedRodadaId) : null)
    || tribuRodadas.find(r => r.id === currentRodada?.id) 
    || tribuRodadas[0] 
    || null;

  // Route proposals for this rodada/date
  const activeProposals = activeRodada 
    ? routeProposals.filter(p => p.rodadaId === activeRodada.id)
    : [];

  // Sort proposals by net votes: (upvotes - downvotes) descending (Airbnb Wishlist style)
  const sortedProposals = [...activeProposals].sort((a, b) => {
    const scoreA = (a.votes?.length || 0) - (a.downvotes?.length || 0);
    const scoreB = (b.votes?.length || 0) - (b.downvotes?.length || 0);
    return scoreB - scoreA;
  });

  // Winning confirmed route if already locked
  const winningRoute: RouteProposal | null = activeRodada?.winningRouteId 
    ? (routeProposals.find(p => p.id === activeRodada.winningRouteId) || sortedProposals[0] || null)
    : (activeRodada?.status === 'fijada' ? sortedProposals[0] || null : null);

  // Confirmed attendees for active rodada
  const confirmedAttendees = (activeRodada?.attendees || [])
    .filter(a => a.status === 'confirmado')
    .map(a => {
      const user = users?.find(u => u.id === a.userId);
      return {
        userId: a.userId,
        userName: user?.name || (a.userId === currentUser.id ? currentUser.name : a.userId),
        userAvatar: user?.avatar || (a.userId === currentUser.id ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
      };
    });
  const confirmedCount = confirmedAttendees.length;

  // Proposal being viewed in detail modal
  const selectedProposalForDetail = routeProposals.find(p => p.id === detailProposalId) || null;

  // Copy invitation code
  const handleCopyCode = (code: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Submit quick proposal
  const handleQuickProposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRodada || !propTitle.trim()) return;

    const km = Number(propKm) || 120;
    const off = Number(propOffroad) || 40;
    const asp = 100 - off;

    proposeRoute({
      rodadaId: activeRodada.id,
      title: propTitle.trim(),
      destination: propDestination.trim() || 'Ruta Propuesta',
      state: propState,
      proposedByUserId: currentUser.id,
      proposedByName: currentUser.name,
      proposedByAvatar: currentUser.avatar,
      description: propPlan.trim() || 'Propuesta alternativa para la rodada del grupo.',
      coverImage: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
      totalKm: km,
      estimatedHours: `${Math.round(km / 35)}h`,
      offroadPercentage: off,
      asphaltPercentage: asp,
      difficulty: off > 50 ? 'Avanzado / Técnico' : 'Intermedio',
      campsite: {
        name: propDestination || 'Punto de reunión',
        elevationMeters: 2800,
        minTempNight: '7°C',
        security: 'Comunitario / Seguro',
        amenities: ['Comida local', 'Gasolina cercana']
      },
      itinerary: [
        {
          day: 1,
          title: `Travesía a ${propDestination}`,
          description: `Punto de encuentro: ${propMeetingPoint} a las ${propMeetingTime}. Itinerario: ${propPlan || 'Rodada fluida y convivencia.'}`,
          distanceKm: km,
          offroadKm: Math.round((km * off) / 100),
          terrainType: off > 40 ? 'Terracería, grava suelta y asfalto escénico' : 'Asfalto con curvas y brecha'
        }
      ],
      waypoints: [
        { id: `wp-${Date.now()}-1`, name: propMeetingPoint, lat: 19.3985, lng: -99.2789, type: 'start' },
        { id: `wp-${Date.now()}-2`, name: propDestination, lat: 19.1923, lng: -100.1245, type: 'end' }
      ],
      coordinates: [
        [19.3985, -99.2789],
        [19.2800, -99.6500],
        [19.1923, -100.1245]
      ],
      dayOfDeadVibe: 'Ambiente de camaradería y rodada de grupo',
      safetyTips: ['Tanque lleno', 'Herramienta básica', 'Presiones revisadas']
    });

    const submittedTitle = propTitle.trim();
    // Reset form
    setPropTitle('');
    setPropDestination('');
    setPropPlan('');
    setShowProposeModal(false);

    // Notification toast for crew
    setNotificationToast(`📱 Notificación enviada al celular de los integrantes: "${submittedTitle}" para el ${formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}`);
    setTimeout(() => setNotificationToast(null), 5000);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.6 }
    });
  };

  // Submit handler for interactive multi-stop route builder modal
  const handleInteractiveProposalSubmit = (
    proposalData: Omit<RouteProposal, 'id' | 'votes' | 'comments'>,
    dateConfig?: { mode: 'current' | 'custom' | 'tbd'; startDate?: string; endDate?: string }
  ) => {
    proposeRoute(proposalData);

    const dateFormatted = dateConfig?.mode === 'custom' && dateConfig.startDate
      ? formatHumanDate(dateConfig.startDate, dateConfig.endDate, true)
      : dateConfig?.mode === 'tbd'
      ? 'Fecha por definir'
      : formatHumanDate(activeRodada?.startDate || '', activeRodada?.endDate, true);

    setNotificationToast(
      `📱 Notificación enviada al celular del grupo: "${proposalData.title}" para ${proposalData.destination} (${dateFormatted}).`
    );
    setTimeout(() => setNotificationToast(null), 5500);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setShowInteractiveProposeModal(false);
  };

  // Submit handler for step-by-step convoke rodada modal
  const handleConvokeSubmit = (data: {
    title: string;
    subtitle: string;
    description: string;
    category: any;
    startDate: string;
    endDate: string;
    originPoint: string;
    proposal?: Omit<RouteProposal, 'id' | 'votes' | 'comments'>;
  }) => {
    const newRodada = createRodada({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      originPoint: data.originPoint
    });

    if (data.proposal && newRodada) {
      proposeRoute({ ...data.proposal, rodadaId: newRodada.id });
    }

    if (newRodada) {
      setSelectedRodadaId(newRodada.id);
    }

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    setNotificationToast(
      `📱 Notificación enviada al grupo: Nueva rodada convocada para ${formatHumanDate(data.startDate, data.endDate, true)}`
    );
    setTimeout(() => setNotificationToast(null), 5000);

    setShowConvokeModal(false);
  };

  // Lock winning route
  const handleLockRoute = (routeId: string) => {
    if (!activeRodada) return;
    lockWinningRoute(activeRodada.id, routeId);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Add comment to proposal
  const handleSendComment = () => {
    if (!detailProposalId || !commentInput.trim()) return;
    addRouteComment(detailProposalId, commentInput.trim());
    setCommentInput('');
  };

  // Filtered tribus for the directory
  const filteredCrews = crews.filter(c => {
    // 1. Search filter
    if (searchTribuQuery.trim()) {
      const q = searchTribuQuery.toLowerCase();
      const match = c.name.toLowerCase().includes(q) || c.baseCity.toLowerCase().includes(q) || c.inviteCode.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Tab filter
    if (tribuFilterTab === 'admin') {
      return c.creatorId === currentUser.id;
    }
    if (tribuFilterTab === 'confirmed') {
      const crewRides = rodadas.filter(r => r.crewId === c.id);
      return crewRides.some(r => r.status === 'fijada' || Boolean(r.winningRouteId));
    }

    return true;
  });

  // Network stats
  const allNetworkPilotIds = new Set<string>();
  crews.forEach(c => c.members.forEach(m => allNetworkPilotIds.add(m.userId)));
  const totalNetworkPilotsCount = allNetworkPilotIds.size;

  const totalConfirmedRidesCount = rodadas.filter(
    r => (r.status === 'fijada' || Boolean(r.winningRouteId)) && crews.some(c => c.id === r.crewId)
  ).length;

  // =========================================================================
  // VIEW 1: DIRECTORIO DE TRIBUS (PANORÁMICO, TÁCTICO Y BIKER AUTHENTIC)
  // =========================================================================
  if (!activeTribu) {
    return (
      <div className="max-w-[1240px] w-full mx-auto pb-28 px-4 sm:px-6 font-sans">
        
        {/* Top Header: Risograph Motorcycle Chapters Editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#1A1918] pb-6 pt-3 gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3.5 py-1 bg-[#E6332A] text-white border-2 border-[#1A1918] text-[10px] font-display font-black uppercase tracking-widest rounded-lg shadow-[2px_2px_0px_#1A1918]">
                ★ MOTORCYCLE GUILDS &amp; FELLOWSHIPS ★
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F7B32B] animate-pulse" />
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-[#1A1918] uppercase tracking-wide">
              Clubs &amp; Tribus
            </h1>
            <p className="text-xs sm:text-sm font-serif italic text-[#1A1918]/80 mt-1 max-w-xl leading-relaxed font-medium">
              &quot;The Emporium of Two-Wheeled Escapes — Private brotherhoods, shared custom stables &amp; roadbook expeditions in consensus.&quot;
            </p>

            {/* Quick Metrics in Vintage Plaque Style */}
            <div className="flex items-center gap-4 text-xs font-sans text-[#1A1918] mt-3.5 flex-wrap font-bold">
              <span className="text-[#1A1918] font-bold flex items-center gap-1.5 bg-[#FAF6ED] px-2.5 py-1 border border-[#1A1918] rounded-md shadow-[1px_1px_0px_#1A1918]">
                <Shield className="w-3.5 h-3.5 text-[#E6332A]" /> {crews.length} {crews.length === 1 ? 'Club Activo' : 'Clubs Activos'}
              </span>
              <span className="text-[#1A1918]/30">•</span>
              <span className="text-[#1A1918] flex items-center gap-1.5 bg-[#FAF6ED] px-2.5 py-1 border border-[#1A1918] rounded-md shadow-[1px_1px_0px_#1A1918]">
                <Users className="w-3.5 h-3.5 text-[#1A1918]/70" /> {totalNetworkPilotsCount} Pilotos en tu red
              </span>
              <span className="text-[#1A1918]/30">•</span>
              <span className="text-[#E06423] font-black flex items-center gap-1.5 bg-[#FAF6ED] px-2.5 py-1 border border-[#1A1918] rounded-md shadow-[1px_1px_0px_#1A1918]">
                <Calendar className="w-3.5 h-3.5 text-[#E06423]" /> {totalConfirmedRidesCount} {totalConfirmedRidesCount === 1 ? 'Expedición en puerta' : 'Expediciones en puerta'}
              </span>
            </div>
          </div>

          {/* Action buttons with mechanical press Risograph styling */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={onOpenJoinCrew}
              className="btn-mustard px-4 py-3 rounded-xl text-xs flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-[#1A1918]" />
              <span>Clave de Club #</span>
            </button>
            <button
              onClick={onOpenCreateCrew}
              className="btn-vermillion px-5 py-3 rounded-xl text-xs flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Fundar Club</span>
            </button>
          </div>
        </div>

        {/* Directory Controls: Search and Filter Pills (Risograph Matchbook Style) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4 border-b-2 border-[#1A1918]">
          {/* Filter Pills */}
          <div className="inline-flex gap-2 p-1.5 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl shadow-[3px_3px_0px_#1A1918] overflow-x-auto">
            <button
              type="button"
              onClick={() => setTribuFilterTab('all')}
              className={`px-3.5 py-1.5 font-display text-xs uppercase tracking-widest font-black transition rounded-xl border-2 shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                tribuFilterTab === 'all'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F7B32B]'
              }`}
            >
              Todos ({crews.length})
            </button>
            <button
              type="button"
              onClick={() => setTribuFilterTab('admin')}
              className={`px-3.5 py-1.5 font-display text-xs uppercase tracking-widest font-black transition rounded-xl border-2 shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                tribuFilterTab === 'admin'
                  ? 'bg-[#1A1918] text-white border-[#1A1918]'
                  : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F7B32B]'
              }`}
            >
              Donde soy Admin
            </button>
            <button
              type="button"
              onClick={() => setTribuFilterTab('confirmed')}
              className={`px-3.5 py-1.5 font-display text-xs uppercase tracking-widest font-black transition rounded-xl border-2 shadow-[2px_2px_0px_#1A1918] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                tribuFilterTab === 'confirmed'
                  ? 'bg-[#E6332A] text-white border-[#1A1918]'
                  : 'bg-[#FAF6ED] text-[#1A1918] border-[#1A1918] hover:bg-[#F7B32B]'
              }`}
            >
              <Check className="w-3 h-3 text-[#F7B32B]" />
              Con Rodada Confirmada
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#1A1918]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              value={searchTribuQuery}
              onChange={(e) => setSearchTribuQuery(e.target.value)}
              placeholder="Buscar por nombre, clave o ciudad..."
              className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] pl-9 pr-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none focus:ring-1 focus:ring-[#1A1918] font-sans font-semibold rounded-xl shadow-[2px_2px_0px_#1A1918]"
            />
          </div>
        </div>

        {/* Tactical 2-Column Tribus Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5">
          {filteredCrews.map((crew) => {
            const isUserAdmin = crew.creatorId === currentUser.id;
            const crewRides = rodadas.filter(r => r.crewId === crew.id);

            // 1. Siguiente ruta confirmada (si es que hay)
            const confirmedRides = crewRides
              .filter(r => r.status === 'fijada' || Boolean(r.winningRouteId))
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            const nextConfirmedRide = confirmedRides[0] || null;
            const otherConfirmedCount = Math.max(0, confirmedRides.length - 1);

            const winningRoute = nextConfirmedRide 
              ? routeProposals.find(p => p.rodadaId === nextConfirmedRide.id && p.id === nextConfirmedRide.winningRouteId)
                || routeProposals.find(p => p.rodadaId === nextConfirmedRide.id)
              : null;

            // 2. Fechas abiertas convocadas pendientes de tu voto
            const openVotingRides = crewRides.filter(r => r.status === 'votacion');
            const unvotedRides = openVotingRides.filter(r => {
              const proposalsForRide = routeProposals.filter(p => p.rodadaId === r.id);
              if (proposalsForRide.length === 0) return true;
              const hasVoted = proposalsForRide.some(p => 
                p.votes.includes(currentUser.id) || (p.downvotes && p.downvotes.includes(currentUser.id))
              );
              return !hasVoted;
            });
            const unvotedDatesCount = unvotedRides.length;

            // 3. Nuevas propuestas en la tribu que no has votado ni propuesto tú
            const crewProposals = routeProposals.filter(p => 
              crewRides.some(r => r.id === p.rodadaId)
            );
            const unvotedProposals = crewProposals.filter(p => 
              !p.votes.includes(currentUser.id) && 
              !(p.downvotes && p.downvotes.includes(currentUser.id)) && 
              p.proposedByUserId !== currentUser.id
            );
            const newProposalsCount = unvotedProposals.length;

            // 4. Si hay rodada confirmada y el usuario aún no ha respondido o está en 'por confirmar'
            const userAttendeeForRide = nextConfirmedRide?.attendees.find(a => a.userId === currentUser.id);

            // 5. Garaje: Motos de los miembros
            const memberIds = crew.members.map(m => m.userId);
            const crewBikes = (motorcycles || []).filter(m => memberIds.includes(m.userId));
            const garageBrands = Array.from(new Set(crewBikes.map(b => b.brand))).slice(0, 3);

            // 6. Preview de miembros (primeros 4)
            const previewMembers = crew.members.slice(0, 4).map(m => users.find(u => u.id === m.userId));

            return (
              <div
                key={crew.id}
                onClick={() => {
                  setSelectedTribuId(crew.id);
                  setCurrentCrew(crew);
                }}
                className="group bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[24px] shadow-[4px_4px_0px_#1A1918] hover:shadow-[7px_7px_0px_#1A1918] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between relative"
              >
                {/* 1. Panoramic Cover Image Banner (Risograph Poster Header) */}
                <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-[#F4EEDB] border-b-2 border-[#1A1918]">
                  {crew.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={crew.coverImage} 
                      alt={crew.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F4EEDB] flex items-center justify-center">
                      <span className="font-display font-black text-5xl text-[#1A1918]/10 uppercase tracking-widest">
                        {crew.name.slice(0, 4)}
                      </span>
                    </div>
                  )}
                  {/* Subtle warm vignette gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6ED] via-[#FAF6ED]/30 to-transparent" />

                  {/* Overlaid Badges on Top Right */}
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                    {/* Clave de Invitación con Copia 1-Click */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(crew.inviteCode);
                        setCopiedCodeCrewId(crew.id);
                        setTimeout(() => setCopiedCodeCrewId(null), 2000);
                      }}
                      className="px-2.5 py-1 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] text-[10px] font-mono flex items-center gap-1.5 transition active:scale-95 shadow-[2px_2px_0px_#1A1918] font-bold rounded-lg"
                      title="Copiar clave de invitación de la tribu"
                    >
                      <Key className="w-3 h-3 text-[#E6332A]" />
                      <span>{copiedCodeCrewId === crew.id ? '¡Copiada!' : crew.inviteCode}</span>
                      <Copy className="w-2.5 h-2.5 text-[#1A1918]/60" />
                    </button>

                    {/* Role Pill */}
                    {isUserAdmin ? (
                      <span className="px-2.5 py-1 text-[9px] font-display uppercase tracking-widest font-black bg-[#E6332A] text-white border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-lg flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[9px] font-display uppercase tracking-widest font-black bg-[#1A1918] text-white border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-lg">
                        Miembro
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Card Content & Identity */}
                <div className="px-5 pb-5 -mt-9 relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Avatar + Title + City */}
                    <div className="flex items-start gap-3.5">
                      {/* Emblem / Avatar */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#1A1918] bg-[#FAF6ED] shadow-[3px_3px_0px_#1A1918] shrink-0 group-hover:ring-2 group-hover:ring-[#E6332A] transition duration-300">
                        {crew.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={crew.coverImage} alt={crew.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-display font-black text-base text-[#1A1918] bg-[#F4EEDB]">
                            {crew.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Title & Location */}
                      <div className="min-w-0 flex-1 pt-1.5">
                        <h3 className="font-display font-black text-lg sm:text-xl text-[#1A1918] uppercase group-hover:text-[#E6332A] transition truncate tracking-wide leading-tight">
                          {crew.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs font-serif italic text-[#1A1918]/70 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#E6332A] shrink-0" />
                          <span className="truncate">{crew.baseCity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tagline / Subtitle */}
                    {crew.tagline && (
                      <p className="text-xs font-serif italic text-[#1A1918]/80 mt-2.5 line-clamp-2 leading-relaxed font-medium">
                        &quot;{crew.tagline}&quot;
                      </p>
                    )}

                    {/* Pilots Stack & Garage Brands */}
                    <div className="mt-3.5 pt-3 border-t-2 border-[#1A1918] flex items-center justify-between text-xs">
                      {/* Member Avatars */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {previewMembers.map((u, idx) => (
                            <div 
                              key={u?.id || idx}
                              className="inline-block w-6 h-6 rounded-lg ring-1 ring-[#1A1918] bg-[#FAF6ED] overflow-hidden shadow-xs"
                            >
                              {u?.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#1A1918]">
                                  {u?.name?.slice(0, 1) || 'P'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] font-display uppercase tracking-wider text-[#1A1918] font-black">
                          {crew.members.length} {crew.members.length === 1 ? 'piloto' : 'pilotos'}
                        </span>
                      </div>

                      {/* Garage Brands preview */}
                      {garageBrands.length > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-sans text-[#1A1918]/70 font-semibold truncate">
                          <Bike className="w-3.5 h-3.5 text-[#E06423] shrink-0" />
                          <span className="truncate">{garageBrands.join(' • ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Next Confirmed Ride Box (Matchbook Expedition Roadbook Card) */}
                    <div className="mt-3.5">
                      {nextConfirmedRide ? (
                        <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl group-hover:border-[#E6332A] transition shadow-[2px_2px_0px_#1A1918]">
                          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-[#1A1918]/20 pb-1.5">
                            <span className="text-[10px] font-display uppercase tracking-widest text-[#E06423] font-black flex items-center gap-1">
                              <Check className="w-3 h-3 text-[#E06423]" />
                              <span>Salida Confirmada</span>
                            </span>

                            {/* User's RSVP state in this ride */}
                            {userAttendeeForRide?.status === 'confirmado' ? (
                              <span className="text-[9px] font-display uppercase tracking-wider text-white bg-[#1A1918] px-2 py-0.5 border border-[#1A1918] font-black flex items-center gap-1 shadow-sm rounded">
                                <CheckCircle2 className="w-3 h-3 text-[#F7B32B]" />
                                <span>Asistirás</span>
                              </span>
                            ) : userAttendeeForRide?.status === 'por_confirmar' || userAttendeeForRide?.status === 'interesado' ? (
                              <span className="text-[9px] font-display uppercase tracking-wider text-[#1A1918] bg-[#F7B32B] px-2 py-0.5 border border-[#1A1918] font-black flex items-center gap-1 shadow-sm rounded">
                                <HelpCircle className="w-3 h-3 text-[#1A1918]" />
                                <span>Por confirmar</span>
                              </span>
                            ) : userAttendeeForRide?.status === 'no_asistire' ? (
                              <span className="text-[9px] font-display uppercase tracking-wider text-white bg-[#E6332A] px-2 py-0.5 border border-[#1A1918] font-black flex items-center gap-1 shadow-sm rounded">
                                <XCircle className="w-3 h-3 text-white" />
                                <span>No asistes</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-display uppercase tracking-wider text-[#1A1918] font-black flex items-center gap-1 bg-[#F7B32B] px-2 py-0.5 border border-[#1A1918] shadow-sm rounded">
                                <AlertCircle className="w-3 h-3 text-[#1A1918]" />
                                <span>RSVP Pendiente</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-display font-black text-[#1A1918] truncate uppercase tracking-wide">
                            {winningRoute ? winningRoute.destination : nextConfirmedRide.title}
                          </h4>

                          <div className="flex items-center gap-2 text-xs font-sans text-[#1A1918]/80 mt-1 flex-wrap font-medium">
                            <span className="text-[#1A1918] flex items-center gap-1 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-[#E6332A]" />
                              {formatHumanDate(nextConfirmedRide.startDate, nextConfirmedRide.endDate)}
                            </span>
                            {winningRoute && (
                              <>
                                <span className="text-[#1A1918]/30">•</span>
                                <span className="font-mono font-bold text-[#1A1918]">{winningRoute.totalKm} km</span>
                                <span className="text-[#1A1918]/30">•</span>
                                <span className="text-[#E06423] font-bold">{winningRoute.offroadPercentage}% tierra</span>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#F4EEDB] border-2 border-dashed border-[#1A1918]/40 rounded-xl text-center">
                          <span className="text-[11px] text-[#1A1918]/70 font-serif italic block font-medium">
                            Sin fecha confirmada en el calendario
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notifications & Activity Chips */}
                    {(unvotedDatesCount > 0 || newProposalsCount > 0 || otherConfirmedCount > 0) && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {unvotedDatesCount > 0 && (
                          <span 
                            title="Fechas abiertas convocadas pendientes de tu voto"
                            className="text-[9px] font-display uppercase tracking-wider px-2 py-0.5 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] font-black flex items-center gap-1 shadow-[1px_1px_0px_#1A1918] rounded"
                          >
                            <Vote className="w-2.5 h-2.5 text-[#E06423]" />
                            <span>{unvotedDatesCount} {unvotedDatesCount === 1 ? 'fecha por votar' : 'fechas por votar'}</span>
                          </span>
                        )}

                        {newProposalsCount > 0 && (
                          <span 
                            title="Nuevas propuestas de ruta en el grupo"
                            className="text-[9px] font-display uppercase tracking-wider px-2 py-0.5 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#E6332A] font-black flex items-center gap-1 shadow-[1px_1px_0px_#1A1918] rounded"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#E6332A]" />
                            <span>{newProposalsCount} {newProposalsCount === 1 ? 'nueva propuesta' : 'nuevas propuestas'}</span>
                          </span>
                        )}

                        {otherConfirmedCount > 0 && (
                          <span 
                            title="Otras fechas confirmadas en el calendario"
                            className="text-[9px] font-display uppercase tracking-wider px-2 py-0.5 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918]/70 font-black flex items-center gap-1 shadow-[1px_1px_0px_#1A1918] rounded"
                          >
                            <Calendar className="w-2.5 h-2.5 text-[#1A1918]/60" />
                            <span>+{otherConfirmedCount} confirmada</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="mt-4 pt-3 border-t-2 border-[#1A1918] flex items-center justify-between text-xs">
                    <span className="text-[#1A1918]/70 transition text-[11px] font-serif italic font-medium">
                      {crew.whatsappGroupUrl ? '💬 WhatsApp conectado' : '🛡️ Cuartel Privado'}
                    </span>
                    <span className="text-[#1A1918] group-hover:text-[#E6332A] font-display font-black uppercase tracking-widest text-xs flex items-center gap-1 transition-transform group-hover:translate-x-1">
                      <span>Entrar al Club</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCrews.length === 0 && (
          <div className="p-12 text-center text-ash text-xs space-y-3 bg-[#0F0C0A] border border-white/10 rounded-2xl mt-5">
            <p className="font-mono text-white text-sm">No se encontraron tribus con ese criterio.</p>
            <p className="text-ash/70 text-xs max-w-sm mx-auto">Prueba con otro término de búsqueda o cambia el filtro seleccionado.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearchTribuQuery('');
                  setTribuFilterTab('all');
                }}
                className="px-3.5 py-1.5 border border-white/15 text-ash hover:text-white font-mono text-xs rounded-lg transition"
              >
                Limpiar filtros
              </button>
              <button
                onClick={onOpenCreateCrew}
                className="px-4 py-1.5 bg-earth hover:bg-earth-bright text-white font-bold uppercase text-xs rounded-lg transition"
              >
                Crear una Nueva Tribu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DENTRO DE LA TRIBU (VISTA SUTIL SUPERIOR + BOARD ESTILO AIRBNB)
  // =========================================================================
  return (
    <div className="max-w-[1300px] w-full mx-auto pb-28 px-4 sm:px-6 font-sans space-y-6">
      
      {/* App Header (Deus Lookbook Masthead) */}
      <div className="relative border-b border-[#E5DFD5] pb-4 pt-1 space-y-3">
        
        {/* Row 1: Back + Tribe Selector + Clean Icon Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Izquierda: Volver al directorio */}
          <button
            onClick={() => setSelectedTribuId(null)}
            className="p-2 -ml-1 text-stone-500 hover:text-[#141312] transition group flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider shrink-0 bg-white border border-[#E5DFD5] rounded-xl shadow-xs hover:border-[#141312]"
            title="Ver todas las tribus"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C84B31] group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Tribus</span>
          </button>

          {/* Centro: Selector de Grupo */}
          <div className="relative flex-1 flex items-center justify-center min-w-0">
            <button
              type="button"
              onClick={() => setShowCrewDropdown(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2.5 group max-w-[220px] sm:max-w-md mx-auto active:scale-95 shadow-xs ${
                showCrewDropdown ? 'bg-white border-[#141312] shadow-sm' : 'bg-white border-[#E5DFD5] hover:border-[#141312]'
              }`}
            >
              {activeTribu.coverImage && (
                <div className="w-5 h-5 rounded-md overflow-hidden border border-[#E5DFD5] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeTribu.coverImage} 
                    alt={activeTribu.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <span className="font-display font-black text-sm sm:text-base text-[#141312] uppercase tracking-wide truncate">
                {activeTribu.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#C84B31] shrink-0 transition-transform duration-200 ${showCrewDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown selector de Tribus */}
            {showCrewDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity" 
                  onClick={() => setShowCrewDropdown(false)} 
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 bg-white border border-[#E5DFD5] rounded-2xl shadow-2xl z-50 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Notch pointer */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-t border-l border-[#E5DFD5]" />
                  
                  {/* Header */}
                  <div className="px-1 flex items-center justify-between border-b border-[#E5DFD5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#C84B31]" />
                      <span className="text-xs font-display font-black text-[#141312] uppercase tracking-wider">Tus Clubs &amp; Tribus</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] text-stone-600 border border-[#E5DFD5] font-bold">
                      {crews.length} {crews.length === 1 ? 'grupo' : 'grupos'}
                    </span>
                  </div>

                  {/* Crew List */}
                  <div className="max-h-64 overflow-y-auto space-y-1 py-1 pr-1">
                    {crews.map(c => {
                      const isCurrent = c.id === activeTribu.id;
                      const initials = c.name
                        .split(' ')
                        .map(w => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedTribuId(c.id);
                            setShowCrewDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 ${
                            isCurrent 
                              ? 'bg-[#FAF8F5] border border-[#141312] text-[#141312] shadow-xs' 
                              : 'hover:bg-[#FAF8F5] text-stone-600 hover:text-[#141312] border border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border transition ${
                            isCurrent 
                              ? 'border-[#141312] ring-1 ring-[#141312] shadow-xs' 
                              : 'border-[#E5DFD5] bg-[#FAF8F5]'
                          }`}>
                            {c.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={c.coverImage} 
                                alt={c.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className={`font-display font-bold text-xs ${isCurrent ? 'text-[#C84B31]' : 'text-stone-500'}`}>
                                {initials || 'TR'}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-[#141312] uppercase tracking-wide truncate">{c.name}</p>
                            <p className="text-xs font-serif italic text-stone-500 truncate mt-0.5">
                              {c.baseCity} • {c.members.length} {c.members.length === 1 ? 'piloto' : 'pilotos'}
                            </p>
                          </div>

                          {isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-[#141312] flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3 h-3 text-white stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-[11px] font-display font-bold text-stone-400 uppercase">Entrar</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E5DFD5] space-y-1">
                    {activeTribu.whatsappGroupUrl ? (
                      <a
                        href={activeTribu.whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-[#25D366] hover:bg-[#25D366]/10 flex items-center gap-2.5 transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Abrir grupo de WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCrewDropdown(false);
                          handleOpenEditCrew();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-[#25D366] hover:bg-[#25D366]/10 flex items-center gap-2.5 transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Conectar grupo de WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        handleOpenEditCrew();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-[#141312] hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-display font-bold uppercase tracking-wider"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#C84B31]" />
                      <span>Editar grupo</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        handleShareCrewWithCode();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-stone-600 hover:text-[#141312] hover:bg-[#FAF8F5] flex items-center gap-2.5 transition cursor-pointer font-display font-bold uppercase tracking-wider"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#C84B31]" />
                      <span>Compartir clave ({activeTribu.inviteCode})</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        onOpenCreateCrew();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider text-[#141312] hover:bg-[#FAF8F5] flex items-center gap-2.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C84B31]" />
                      <span>Crear nuevo grupo</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Derecha: Acciones Compactas */}
          <div className="relative flex items-center gap-1.5 shrink-0">
            {/* Editar grupo */}
            <button
              type="button"
              onClick={handleOpenEditCrew}
              title="Editar grupo"
              className="p-2 rounded-xl border border-[#E5DFD5] bg-white text-stone-600 hover:text-[#141312] hover:border-[#141312] transition shrink-0 cursor-pointer shadow-xs active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Compartir grupo */}
            <button
              type="button"
              onClick={handleShareCrewWithCode}
              title={`Compartir clave ${activeTribu.inviteCode}`}
              className={`p-2 rounded-xl border transition shrink-0 cursor-pointer shadow-xs active:scale-90 ${
                copiedCrewShare 
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-300' 
                  : 'text-stone-600 hover:text-[#141312] bg-white border-[#E5DFD5] hover:border-[#141312]'
              }`}
            >
              {copiedCrewShare ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* WhatsApp Icon */}
            <button
              type="button"
              onClick={handleWhatsAppHeaderClick}
              className={`p-2 rounded-xl border transition shrink-0 cursor-pointer shadow-xs active:scale-90 relative ${
                activeTribu.whatsappGroupUrl
                  ? 'bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/40 text-[#25D366]'
                  : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] text-stone-400 hover:text-stone-600'
              }`}
              title={activeTribu.whatsappGroupUrl ? 'Abrir grupo de WhatsApp' : 'Sin enlace de WhatsApp'}
            >
              <WhatsAppIcon className={`w-4 h-4 ${activeTribu.whatsappGroupUrl ? 'text-[#25D366]' : 'text-stone-400'}`} />
              {activeTribu.whatsappGroupUrl && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              )}
            </button>

            {/* Mini Aviso: Sin enlace de WhatsApp vinculado */}
            {showWhatsappMissingNotice && (
              <div className="absolute top-full right-0 mt-2 z-50 w-72 p-4 bg-white border border-[#E5DFD5] rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center shrink-0 mt-0.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1 text-left">
                    <h5 className="text-xs font-display font-black text-[#141312] uppercase tracking-wider">
                      Sin WhatsApp
                    </h5>
                    <p className="text-xs text-stone-500 font-serif italic leading-relaxed">
                      Este grupo aún no tiene enlace de WhatsApp vinculado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsappMissingNotice(false);
                        handleOpenEditCrew();
                      }}
                      className="text-xs font-display font-bold text-[#C84B31] hover:underline pt-0.5 block cursor-pointer uppercase tracking-wider"
                    >
                      Vincular en Ajustes ✏️ →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWhatsappMissingNotice(false)}
                    className="text-stone-400 hover:text-[#141312] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Segmented Tabs (Deus Lookbook Tabs) */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-full sm:w-auto inline-flex p-1.5 bg-[#FAF8F5] border border-[#DDD7CB] rounded-2xl gap-2 shadow-xs">
            <button
              onClick={() => setActiveTribuTab('rodadas')}
              className={`flex-1 sm:flex-initial px-8 py-2.5 text-xs font-display font-black uppercase tracking-widest transition rounded-xl ${
                activeTribuTab === 'rodadas'
                  ? 'bg-[#141312] text-white shadow-md'
                  : 'text-stone-600 hover:text-[#141312] hover:bg-[#F2EDE4]'
              }`}
            >
              Expediciones &amp; Rutas
            </button>
            <button
              onClick={() => setActiveTribuTab('miembros')}
              className={`flex-1 sm:flex-initial px-8 py-2.5 text-xs font-display font-black uppercase tracking-widest transition rounded-xl ${
                activeTribuTab === 'miembros'
                  ? 'bg-[#141312] text-white shadow-md'
                  : 'text-stone-600 hover:text-[#141312] hover:bg-[#F2EDE4]'
              }`}
            >
              Pilotos ({activeTribu.members.length})
            </button>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 1. VISTA SUTIL DE PRÓXIMAS RODADAS CONFIRMADAS                      */}
      {/* (Solo en pestaña Rodadas; en Pilotos se muestra el roster de lleno)  */}
      {/* =================================================================== */}
      {activeTribuTab === 'rodadas' && (confirmedRodadas.length === 0 ? null : confirmedRodadas.length === 1 ? (
        /* Caso 1: Una sola rodada confirmada -> Hero Card cinematográfica */
        (() => {
          const confRodada = confirmedRodadas[0];
          const confWinning = routeProposals.find(p => p.rodadaId === confRodada.id && p.id === confRodada.winningRouteId) 
            || routeProposals.find(p => p.rodadaId === confRodada.id);
          const confAttendees = (confRodada.attendees || [])
            .filter(a => a.status === 'confirmado')
            .map(a => {
              const u = users?.find(user => user.id === a.userId);
              return {
                userId: a.userId,
                userName: u?.name || (a.userId === currentUser.id ? currentUser.name : a.userId),
                userAvatar: u?.avatar || (a.userId === currentUser.id ? currentUser.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
              };
            });
          const confCount = confAttendees.length;
          const userAtt = confRodada.attendees.find(a => a.userId === currentUser.id);
          const userRsvpStatus = userAtt ? userAtt.status : null;

          return (
            <div 
              onClick={() => {
                setSelectedConfirmedRodadaForPlan(confRodada);
                setShowPlanCardModal(true);
              }}
              className="group relative overflow-hidden border-2 border-[#1A1918] bg-[#FAF6ED] transition-all duration-300 cursor-pointer shadow-[6px_6px_0px_#1A1918] hover:shadow-[9px_9px_0px_#1A1918] p-6 sm:p-7 rounded-[28px]"
              title="Click para ver el plan completo de la rodada"
            >
              {/* Ticket Top Strip Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#E6332A] border-b-2 border-[#1A1918]" />

              {/* Content Container: Editorial Risograph Ticket Layout */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 pt-2">
                
                {/* Left side: Badge + Destination + Metrics */}
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[10px] font-display uppercase font-black px-3 py-1 bg-[#1A1918] text-[#FAF6ED] border border-[#1A1918] tracking-widest rounded-lg shadow-[2px_2px_0px_#1A1918]">
                      <span className="w-2 h-2 rounded-full bg-[#F7B32B] animate-pulse" />
                      Ruta Confirmada
                    </span>

                    <span className="text-xs font-mono text-[#1A1918] font-bold flex items-center gap-1.5 bg-[#FAF6ED] px-3 py-1 border-2 border-[#1A1918] rounded-lg shadow-[2px_2px_0px_#1A1918]">
                      <Calendar className="w-3.5 h-3.5 text-[#E6332A]" />
                      <span className="text-[#1A1918] font-bold">{formatHumanDate(confRodada.startDate, confRodada.endDate, true)}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <MapPin className="w-4 h-4 text-[#E6332A] shrink-0 self-center" />
                    <h3 className="text-xl sm:text-3xl font-display font-black text-[#1A1918] uppercase truncate group-hover:text-[#E6332A] transition tracking-tight">
                      {confWinning ? confWinning.destination : confRodada.title}
                    </h3>
                    <span className="text-[#1A1918]/30 hidden md:inline">•</span>
                    <span className="text-xs sm:text-sm font-serif italic text-[#1A1918]/70 truncate hidden md:inline font-medium">
                      {confWinning?.title || confRodada.subtitle}
                    </span>
                  </div>

                  {/* Compact Metrics Row */}
                  <div className="flex items-center gap-2 text-xs font-display font-black flex-wrap pt-0.5">
                    {confWinning && (
                      <span className="px-3 py-1 bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] font-mono rounded-lg shadow-[1px_1px_0px_#1A1918]">
                        {confWinning.totalKm} km
                      </span>
                    )}
                    {confWinning && (
                      <span className="px-3 py-1 bg-[#F4EEDB] border-2 border-[#1A1918] text-[#E06423] flex items-center gap-1 rounded-lg shadow-[1px_1px_0px_#1A1918]">
                        <Mountain className="w-3.5 h-3.5 text-[#E06423] shrink-0" />
                        <span>{confWinning.offroadPercentage}% tierra</span>
                      </span>
                    )}
                    {confWinning?.difficulty && (
                      <span className="px-3 py-1 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] uppercase rounded-lg shadow-[1px_1px_0px_#1A1918]">
                        {confWinning.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Pilots + Action Buttons */}
                <div className="flex items-center gap-3.5 shrink-0 pt-4 md:pt-0 border-t-2 md:border-t-0 border-[#1A1918] justify-between md:justify-end">
                  {/* Attendees */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {confAttendees.slice(0, 4).map((att, i) => (
                        <img 
                          key={att.userId + i}
                          src={att.userAvatar} 
                          alt={att.userName} 
                          title={att.userName}
                          className="w-7 h-7 rounded-lg border border-[#1A1918] object-cover shadow-xs" 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-sans text-[#1A1918] font-medium">
                      <strong className="text-[#1A1918] font-mono font-bold">{confCount}</strong> pilotos
                    </span>
                  </div>

                  {/* Tactical Matchbook RSVP Dropdown */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    {/* Trigger Button Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        setRsvpDropdownOpenRodadaId(prev => prev === confRodada.id ? null : confRodada.id);
                      }}
                      className={`px-4 py-2.5 font-display uppercase tracking-wider text-xs font-black transition rounded-xl flex items-center gap-2 border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        userRsvpStatus === 'confirmado'
                          ? 'bg-[#1A1918] text-[#FAF6ED] hover:bg-black'
                          : userRsvpStatus === 'por_confirmar' || userRsvpStatus === 'interesado'
                          ? 'bg-[#F7B32B] text-[#1A1918]'
                          : userRsvpStatus === 'no_asistire'
                          ? 'bg-[#E6332A] text-white'
                          : 'bg-[#F7B32B] text-[#1A1918]'
                      }`}
                      title="Cambiar tu estatus de asistencia"
                    >
                      {userRsvpStatus === 'confirmado' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F7B32B] shrink-0" />
                          <span>Asistiré</span>
                        </>
                      ) : userRsvpStatus === 'por_confirmar' || userRsvpStatus === 'interesado' ? (
                        <>
                          <HelpCircle className="w-3.5 h-3.5 text-[#1A1918] shrink-0" />
                          <span>Por confirmar</span>
                        </>
                      ) : userRsvpStatus === 'no_asistire' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-white shrink-0" />
                          <span>No asistiré</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-[#1A1918] shrink-0" />
                          <span>¿Asistirás?</span>
                        </>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${rsvpDropdownOpenRodadaId === confRodada.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Popover Dropdown Menu */}
                    {rsvpDropdownOpenRodadaId === confRodada.id && (
                      <>
                        {/* Backdrop to catch clicks outside and close */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRsvpDropdownOpenRodadaId(null);
                          }} 
                        />

                        {/* Floating Menu */}
                        <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl shadow-[6px_6px_0px_#1A1918] p-3 animate-in fade-in-0 zoom-in-95">
                          <div className="px-3 py-2 border-b-2 border-[#1A1918] mb-2">
                            <span className="text-[10px] font-display uppercase tracking-widest text-[#1A1918]/60 font-black block">
                              Tu Asistencia a la Rodada
                            </span>
                            <span className="text-xs font-display font-black text-[#1A1918] uppercase truncate block mt-0.5">
                              {confWinning ? confWinning.destination : confRodada.title}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {/* Option 1: Asistiré */}
                            <button
                              type="button"
                              onClick={() => {
                                rsvpRodada(confRodada.id, userBikes[0]?.id || 'moto-default', 'confirmado');
                                if (userRsvpStatus !== 'confirmado') {
                                  confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                                }
                                setRsvpDropdownOpenRodadaId(null);
                              }}
                              className={`w-full p-2.5 text-left transition rounded-xl flex items-start gap-2.5 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                userRsvpStatus === 'confirmado'
                                  ? 'bg-[#1A1918] text-[#FAF6ED]'
                                  : 'bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918]'
                              }`}
                            >
                              <div className={`w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 ${
                                userRsvpStatus === 'confirmado' ? 'text-[#F7B32B]' : 'text-[#1A1918]'
                              }`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-display font-black uppercase ${
                                    userRsvpStatus === 'confirmado' ? 'text-[#FAF6ED]' : 'text-[#1A1918]'
                                  }`}>
                                    Asistiré
                                  </span>
                                  {userRsvpStatus === 'confirmado' && (
                                    <span className="text-[9px] font-display font-black text-[#F7B32B] uppercase">Activo</span>
                                  )}
                                </div>
                                <span className={`text-[11px] block leading-tight mt-0.5 font-sans ${
                                  userRsvpStatus === 'confirmado' ? 'text-[#FAF6ED]/70' : 'text-[#1A1918]/70'
                                }`}>
                                  Confirmado en el convoy de ruta
                                </span>
                              </div>
                            </button>

                            {/* Option 2: Por confirmar */}
                            <button
                              type="button"
                              onClick={() => {
                                rsvpRodada(confRodada.id, userBikes[0]?.id || 'moto-default', 'por_confirmar');
                                setRsvpDropdownOpenRodadaId(null);
                              }}
                              className={`w-full p-2.5 text-left transition rounded-xl flex items-start gap-2.5 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                userRsvpStatus === 'por_confirmar' || userRsvpStatus === 'interesado'
                                  ? 'bg-[#F7B32B] text-[#1A1918]'
                                  : 'bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918]'
                              }`}
                            >
                              <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-[#1A1918]">
                                <HelpCircle className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-display font-black uppercase text-[#1A1918]">
                                    Por confirmar
                                  </span>
                                  {(userRsvpStatus === 'por_confirmar' || userRsvpStatus === 'interesado') && (
                                    <span className="text-[9px] font-display font-black text-[#1A1918] uppercase">Activo</span>
                                  )}
                                </div>
                                <span className="text-[11px] text-[#1A1918]/70 block leading-tight mt-0.5 font-sans">
                                  Interesado, pendiente de agenda o clima
                                </span>
                              </div>
                            </button>

                            {/* Option 3: No asistiré */}
                            <button
                              type="button"
                              onClick={() => {
                                rsvpRodada(confRodada.id, userBikes[0]?.id || 'moto-default', 'no_asistire');
                                setRsvpDropdownOpenRodadaId(null);
                              }}
                              className={`w-full p-2.5 text-left transition rounded-xl flex items-start gap-2.5 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                                userRsvpStatus === 'no_asistire'
                                  ? 'bg-[#E6332A] text-white'
                                  : 'bg-[#F4EEDB] hover:bg-[#FAF6ED] text-[#1A1918]'
                              }`}
                            >
                              <div className={`w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 ${
                                userRsvpStatus === 'no_asistire' ? 'text-white' : 'text-[#E6332A]'
                              }`}>
                                <XCircle className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-xs font-display font-black uppercase ${
                                    userRsvpStatus === 'no_asistire' ? 'text-white' : 'text-[#1A1918]'
                                  }`}>
                                    No asistiré
                                  </span>
                                  {userRsvpStatus === 'no_asistire' && (
                                    <span className="text-[9px] font-display font-black text-white uppercase">Activo</span>
                                  )}
                                </div>
                                <span className={`text-[11px] block leading-tight mt-0.5 font-sans ${
                                  userRsvpStatus === 'no_asistire' ? 'text-white/80' : 'text-[#1A1918]/70'
                                }`}>
                                  No puedo acompañarlos esta vez
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ver Plan */}
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-display font-black text-[#1A1918] uppercase tracking-wider px-4 py-2.5 bg-[#FAF6ED] border-2 border-[#1A1918] hover:bg-[#1A1918] hover:text-[#FAF6ED] transition-all rounded-xl shadow-[3px_3px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <span>Plan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {isCreatorOrAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockWinningRoute(confRodada.id);
                      }}
                      className="text-[10px] font-display font-bold text-stone-400 hover:text-[#C84B31] uppercase px-1 transition"
                      title="Reabrir debate"
                    >
                      Reabrir
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })()
      ) : (
        /* Caso 2: Varias rodadas confirmadas -> Cuadros con cover de foto */
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-earth">
              Próximas Rodadas Confirmadas ({confirmedRodadas.length})
            </h3>
            <span className="text-[10px] text-ash font-mono hidden sm:inline">
              Haz clic para ver el plan completo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {confirmedRodadas.map(rodada => {
              const winning = routeProposals.find(p => p.rodadaId === rodada.id && p.id === rodada.winningRouteId) 
                || routeProposals.find(p => p.rodadaId === rodada.id);
              const attendees = (rodada.attendees || []).filter(a => a.status === 'confirmado');

              return (
                <div
                  key={rodada.id}
                  onClick={() => {
                    setSelectedConfirmedRodadaForPlan(rodada);
                    setShowPlanCardModal(true);
                  }}
                  className="group relative overflow-hidden bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 shadow-[4px_4px_0px_#1A1918] hover:shadow-[6px_6px_0px_#1A1918] hover:-translate-y-0.5"
                  title="Click para ver la tarjeta del plan"
                >
                  {/* Background Tactical Topographic & GPS Vector Pattern */}
                  {winning && (
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity duration-300 overflow-hidden">
                      <RouteTacticalMapCard
                        proposal={winning}
                        isWinner={true}
                        className="w-full h-full scale-110 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF6ED] via-[#FAF6ED]/70 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 space-y-2">
                    {/* Fecha + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-black text-[#1A1918]">
                        {formatHumanDate(rodada.startDate, rodada.endDate, true)}
                      </span>
                      <span className="text-[9px] font-mono uppercase font-black px-2 py-0.5 bg-emerald-100 border border-[#1A1918] text-emerald-900 rounded shadow-[1px_1px_0px_#1A1918]">
                        Confirmada
                      </span>
                    </div>

                    {/* Destino */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-[#E6332A] shrink-0" />
                      <h4 className="text-base font-display font-black text-[#1A1918] uppercase truncate group-hover:text-[#E6332A] transition-colors">
                        {winning ? winning.destination : rodada.title}
                      </h4>
                    </div>
                  </div>

                  {/* Asistentes & Ver Plan */}
                  <div className="relative z-10 flex items-center justify-between pt-2.5 border-t-2 border-[#1A1918]/15 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-[#1A1918]/80 font-bold">
                      <Users className="w-3.5 h-3.5 text-[#E6332A]" />
                      <span className="text-[#1A1918] font-black">{attendees.length}</span>
                      <span>{attendees.length === 1 ? 'asistente' : 'asistentes'}</span>
                    </div>
                    <span className="text-[#1A1918] text-[11px] font-display font-black uppercase tracking-wider group-hover:text-[#E6332A] group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                      Ver Plan <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* =================================================================== */}
      {/* 2. TAB: PILOTOS & GARAJE DE LA TRIBU                                */}
      {/* =================================================================== */}
      {activeTribuTab === 'miembros' && (() => {
        const captainsCount = activeTribu.members.filter(m => m.role === 'Capitán de Ruta').length;
        const sweepersCount = activeTribu.members.filter(m => m.role === 'Barrendero').length;
        const ridersCount = activeTribu.members.filter(m => m.role !== 'Capitán de Ruta' && m.role !== 'Barrendero').length;
        const nextConfirmedRide = confirmedRodadas[0];

        const filteredMembers = activeTribu.members.filter(member => {
          const u = users.find(user => user.id === member.userId);
          const bike = motorcycles?.find(m => m.userId === member.userId);
          const nameMatch = (u?.name || member.userId).toLowerCase().includes(pilotSearchQuery.toLowerCase());
          const handleMatch = (u?.handle || '').toLowerCase().includes(pilotSearchQuery.toLowerCase());
          const motoMatch = bike ? `${bike.brand} ${bike.model}`.toLowerCase().includes(pilotSearchQuery.toLowerCase()) : false;
          const matchesSearch = !pilotSearchQuery || nameMatch || handleMatch || motoMatch;

          if (!matchesSearch) return false;

          if (pilotRoleFilter === 'capitan') return member.role === 'Capitán de Ruta';
          if (pilotRoleFilter === 'barrendero') return member.role === 'Barrendero';
          if (pilotRoleFilter === 'rider') return member.role !== 'Capitán de Ruta' && member.role !== 'Barrendero';
          return true;
        });

        return (
          <div className="space-y-4 font-sans">
            {/* Header & Quick Action Toolbar (Deus Paddock Look) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-[#C25434] uppercase font-bold">
                    ★ PADDOCK &amp; ESCUDERÍA ★
                  </span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-bone uppercase tracking-wider flex items-center gap-2.5">
                  <span>Roster de Pilotos</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#121110] border border-white/15 text-ochre">
                    {activeTribu.members.length}
                  </span>
                </h3>
                <p className="text-xs font-serif italic text-ash mt-0.5">
                  {captainsCount} {captainsCount === 1 ? 'Capitán' : 'Capitanes'} • {sweepersCount} {sweepersCount === 1 ? 'Barrendero' : 'Barrenderos'} • {ridersCount} Riders en filas
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {activeTribu.whatsappGroupUrl ? (
                  <a
                    href={activeTribu.whatsappGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#181614] hover:bg-[#1E1B18] border border-emerald-500/40 text-emerald-400 text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Abrir chat grupal en WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                ) : (
                  <button
                    onClick={handleOpenEditCrew}
                    className="px-3 py-1.5 bg-[#181614] hover:bg-bone hover:text-[#121110] border border-white/20 text-ash hover:border-bone text-xs font-display uppercase tracking-wider font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="Vincular grupo de WhatsApp del club"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ WhatsApp</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyNaoLink}
                  className="px-3 py-1.5 bg-[#181614] hover:bg-bone hover:text-[#121110] border border-white/20 text-ash hover:border-bone text-xs font-display uppercase tracking-wider font-bold transition flex items-center gap-1.5 shadow-sm"
                  title="Copiar link de invitación al club"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{copiedNaoLink ? 'Copiado' : 'Link Club'}</span>
                </button>

                <button
                  onClick={() => setShowAddPilotModal(true)}
                  className="px-3.5 py-1.5 bg-bone hover:bg-white text-[#121110] text-xs font-display uppercase tracking-widest font-bold flex items-center gap-1.5 transition shadow-md active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Reclutar Piloto</span>
                </button>
              </div>
            </div>

            {/* Filter Pills & Search Input (Deus Style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Role filter pills */}
              <div className="inline-flex gap-1 p-1 bg-[#121110] border border-white/10 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setPilotRoleFilter('all')}
                  className={`px-3 py-1 text-xs font-display uppercase tracking-widest font-bold transition ${
                    pilotRoleFilter === 'all'
                      ? 'bg-bone text-[#121110] shadow-sm'
                      : 'text-ash hover:text-bone'
                  }`}
                >
                  Todos ({activeTribu.members.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPilotRoleFilter('capitan')}
                  className={`px-3 py-1 text-xs font-display uppercase tracking-widest font-bold transition flex items-center gap-1 ${
                    pilotRoleFilter === 'capitan'
                      ? 'bg-ochre text-[#121110] shadow-sm'
                      : 'text-ash hover:text-bone'
                  }`}
                >
                  <Compass className="w-3 h-3 text-current" />
                  Capitanes ({captainsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPilotRoleFilter('barrendero')}
                  className={`px-3 py-1 text-xs font-display uppercase tracking-widest font-bold transition flex items-center gap-1 ${
                    pilotRoleFilter === 'barrendero'
                      ? 'bg-blue-400 text-[#121110] shadow-sm'
                      : 'text-ash hover:text-bone'
                  }`}
                >
                  <Shield className="w-3 h-3 text-current" />
                  Barrenderos ({sweepersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPilotRoleFilter('rider')}
                  className={`px-3 py-1 text-xs font-display uppercase tracking-widest font-bold transition ${
                    pilotRoleFilter === 'rider'
                      ? 'bg-bone text-[#121110] shadow-sm'
                      : 'text-ash hover:text-bone'
                  }`}
                >
                  Riders ({ridersCount})
                </button>
              </div>

              {/* Search input */}
              <div className="relative sm:w-64">
                <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={pilotSearchQuery}
                  onChange={(e) => setPilotSearchQuery(e.target.value)}
                  placeholder="Buscar piloto o máquina..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-[#121110] border border-white/15 text-bone placeholder-ash/50 focus:outline-none focus:border-bone"
                />
              </div>
            </div>

            {/* Pilot Cards Grid (Vintage Paddock Cards) */}
            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredMembers.map(member => {
                  const isCreator = member.userId === activeTribu.creatorId;
                  const u = users.find(user => user.id === member.userId);
                  const bike = motorcycles?.find(m => m.userId === member.userId);
                  const displayName = u ? (u.id === currentUser.id ? `${u.name} (Tú)` : u.name) : member.userId;
                  const avatar = u?.avatar;
                  const isCaptain = member.role === 'Capitán de Ruta';
                  const isSweeper = member.role === 'Barrendero';
                  const memberRsvp = nextConfirmedRide?.attendees?.find(a => a.userId === member.userId);

                  return (
                    <div 
                      key={member.userId}
                      onClick={() => openPilotProfileById(member.userId)}
                      className="p-5 bg-white hover:border-[#141312] border border-[#E5DFD5] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md"
                    >
                      {/* Top: Avatar + Identity + Role Badges */}
                      <div>
                        <div className="flex items-start gap-3.5">
                          {/* Avatar with Deus circular ring */}
                          <div className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 bg-stone-100 relative shadow-sm ${
                            isCaptain 
                              ? 'border-[#141312] ring-2 ring-[#F2B705]' 
                              : isSweeper 
                              ? 'border-[#141312] ring-2 ring-stone-400' 
                              : isCreator 
                              ? 'border-[#141312] ring-2 ring-[#C84B31]' 
                              : 'border-[#141312]'
                          }`}>
                            {avatar ? (
                              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-display font-black text-[#141312] text-xs bg-[#FAF8F5]">
                                {member.userId.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Identity Info */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-display font-black text-sm text-[#141312] uppercase group-hover:text-[#C84B31] transition truncate tracking-wide">
                                {displayName}
                              </span>
                              {isCreator && (
                                <span className="text-[9px] font-display uppercase tracking-widest font-black text-white bg-[#C84B31] px-1.5 py-0.2 shrink-0 shadow-xs">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            
                            <span className="text-xs font-serif italic text-stone-500 block truncate mt-0.5">
                              {u?.handle || '@piloto'} {u?.location ? `• ${u.location}` : ''}
                            </span>

                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              {isCaptain ? (
                                <span className="px-2 py-0.5 text-[9px] font-display uppercase tracking-wider font-bold bg-[#141312] text-[#F2B705] flex items-center gap-1 shadow-xs">
                                  <Compass className="w-2.5 h-2.5 text-[#F2B705]" />
                                  Capitán
                                </span>
                              ) : isSweeper ? (
                                <span className="px-2 py-0.5 text-[9px] font-display uppercase tracking-wider font-bold bg-[#141312] text-white flex items-center gap-1 shadow-xs">
                                  <Shield className="w-2.5 h-2.5 text-stone-300" />
                                  Barrendero
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[9px] font-display uppercase tracking-wider font-bold bg-[#FAF8F5] border border-[#DDD7CB] text-[#141312]">
                                  Rider
                                </span>
                              )}
                              
                              {u?.ridingLevel && (
                                <span className="text-[10px] font-sans text-stone-500 truncate">
                                  • {u.ridingLevel}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Moto / Workshop plaque */}
                        <div className="mt-3.5 pt-2.5 border-t border-[#E5DFD5] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 min-w-0 bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 w-full shadow-xs">
                            <div className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 border border-[#E5DFD5]">
                              <Bike className="w-3.5 h-3.5 text-[#D49B35]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-display font-black text-[#141312] block truncate text-xs uppercase tracking-wide">
                                {bike ? `${bike.brand} ${bike.model}` : 'Sin máquina registrada'}
                              </span>
                              {bike?.displacementCc ? (
                                <span className="text-[10px] font-mono text-stone-500 block truncate">
                                  {bike.displacementCc} cc {bike.type ? `• ${bike.type}` : ''}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Next Rodada RSVP Status & Profile Action */}
                      <div className="mt-3 pt-2.5 border-t border-[#E5DFD5] flex items-center justify-between text-xs">
                        {nextConfirmedRide ? (
                          <div className="flex items-center gap-1.5">
                            {memberRsvp?.status === 'confirmado' ? (
                              <span className="text-[#141312] font-display uppercase tracking-wider font-bold flex items-center gap-1 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-[#141312] shrink-0" />
                                <span>Asistirá</span>
                              </span>
                            ) : memberRsvp?.status === 'por_confirmar' || memberRsvp?.status === 'interesado' ? (
                              <span className="text-[#D49B35] font-display uppercase tracking-wider font-bold flex items-center gap-1 text-[10px]">
                                <HelpCircle className="w-3 h-3 text-[#D49B35] shrink-0" />
                                <span>Por confirmar</span>
                              </span>
                            ) : memberRsvp?.status === 'no_asistire' ? (
                              <span className="text-[#C84B31] font-display uppercase tracking-wider font-bold flex items-center gap-1 text-[10px]">
                                <XCircle className="w-3 h-3 text-[#C84B31] shrink-0" />
                                <span>No asistirá</span>
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[10px] font-serif italic">Sin confirmar</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[10px] font-serif italic">Miembro activo</span>
                        )}

                        <span className="font-display uppercase tracking-widest text-[10px] text-[#141312] group-hover:text-[#C84B31] flex items-center gap-1 ml-auto transition-transform group-hover:translate-x-0.5 font-black">
                          Dossier →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-white/10 bg-[#121110] text-center space-y-2">
                <p className="text-ash font-serif italic text-xs">No se encontraron pilotos con ese filtro de búsqueda.</p>
                <button
                  type="button"
                  onClick={() => {
                    setPilotSearchQuery('');
                    setPilotRoleFilter('all');
                  }}
                  className="text-xs font-display uppercase tracking-wider text-[#C25434] hover:underline font-bold"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* =================================================================== */}
      {/* 3. TAB: RODADAS & CONVOCATORIAS PROPUESTAS                          */}
      {/* =================================================================== */}
      {activeTribuTab === 'rodadas' && (
        <div className="space-y-5">
          
          {/* Header de convocatorias estilo editorial */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-[#1A1918]">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 bg-[#E6332A] border-2 border-[#1A1918] shadow-[1px_1px_0px_#1A1918]" />
              <h2 className="font-display font-black text-xl sm:text-2xl text-[#1A1918] uppercase tracking-wide">
                Convocatorias &amp; Calendario
              </h2>
            </div>

            <button
              onClick={() => setShowConvokeModal(true)}
              className="px-4 py-2 bg-[#F7B32B] hover:bg-[#e0a020] text-[#1A1918] border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] text-xs font-display font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Convocar Rodada</span>
            </button>
          </div>

          {/* Selector de Fechas Convocadas (Plaquitas mecánicas coleccionables) */}
          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {tribuRodadas.map((rodada) => {
              const isSelected = activeRodada?.id === rodada.id;
              const rodadaProposals = routeProposals.filter(p => p.rodadaId === rodada.id);
              const isConfirmed = rodada.status === 'fijada';

              return (
                <button
                  key={rodada.id}
                  onClick={() => setSelectedRodadaId(rodada.id)}
                  className={`text-left px-4 py-3 border-2 border-[#1A1918] rounded-2xl transition-all duration-150 flex items-center gap-3 shrink-0 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    isSelected
                      ? 'bg-[#E6332A] text-white shadow-[4px_4px_0px_#1A1918]'
                      : 'bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] shadow-[2px_2px_0px_#1A1918]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-black tracking-wider uppercase ${
                        isSelected ? 'text-white' : 'text-[#1A1918]'
                      }`}>
                        {formatHumanDate(rodada.startDate, rodada.endDate, true)}
                      </span>
                      {isConfirmed ? (
                        <span className={`text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded border ${
                          isSelected 
                            ? 'bg-white/25 border-white text-white' 
                            : 'bg-emerald-100 border-[#1A1918] text-emerald-900'
                        }`}>
                          Confirmada
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono uppercase font-black px-1.5 py-0.5 rounded border ${
                          isSelected 
                            ? 'bg-white/20 border-white text-white' 
                            : 'bg-[#F7B32B] border-[#1A1918] text-[#1A1918]'
                        }`}>
                          {rodadaProposals.length} {rodadaProposals.length === 1 ? 'ruta' : 'rutas'}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-display font-black uppercase line-clamp-1 mt-1 tracking-wide ${
                      isSelected ? 'text-white' : 'text-[#1A1918]'
                    }`}>
                      {rodada.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Opciones para la Fecha Seleccionada */}
          {activeRodada && (
            <div className="space-y-4 pt-2">
              
              {/* Header de Propuestas estilo Cartel Serigráfico */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-[#1A1918]">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-[#1A1918] uppercase tracking-wide">
                    Propuestas
                  </h3>
                  <span className="text-xs font-mono font-black text-[#1A1918] bg-[#F7B32B] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] px-2.5 py-0.5 rounded-lg">
                    {activeProposals.length} {activeProposals.length === 1 ? 'OPCIÓN' : 'OPCIONES'}
                  </span>
                </div>

                <button
                  onClick={() => setShowInteractiveProposeModal(true)}
                  className="px-4 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] text-xs font-display font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Proponer</span>
                </button>
              </div>

              {/* Proposals Grid: Cartas Editoriales Risograph sobre Papel Cálido */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedProposals.map((proposal, index) => {
                  const upvotesCount = proposal.votes?.length || 0;
                  const downvotesCount = proposal.downvotes?.length || 0;
                  const netScore = upvotesCount - downvotesCount;
                  const hasUpvoted = proposal.votes?.includes(currentUser.id);
                  const hasDownvoted = proposal.downvotes?.includes(currentUser.id);
                  const isLeader = index === 0 && netScore > 0;
                  const isWinner = activeRodada.winningRouteId === proposal.id;

                  return (
                    <div
                      key={proposal.id}
                      className={`bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                        isWinner 
                          ? 'shadow-[6px_6px_0px_#E6332A] ring-2 ring-[#E6332A]'
                          : isLeader
                          ? 'shadow-[5px_5px_0px_#F7B32B] hover:shadow-[7px_7px_0px_#F7B32B]'
                          : 'shadow-[4px_4px_0px_#1A1918] hover:shadow-[6px_6px_0px_#1A1918]'
                      }`}
                    >
                      <div>
                        {/* Tactical Map Header with Topo Contours & GPS Vector Track */}
                        <div 
                          onClick={() => setDetailProposalId(proposal.id)}
                          className="cursor-pointer group/map overflow-hidden"
                        >
                          <RouteTacticalMapCard
                            proposal={proposal}
                            heightClass="h-44"
                            isWinner={isWinner}
                            isLeader={isLeader}
                            optionIndex={index}
                            showOverlayBadges={true}
                          />
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 
                              onClick={() => setDetailProposalId(proposal.id)}
                              className="font-display font-black text-lg text-[#1A1918] uppercase tracking-wide group-hover:text-[#E6332A] transition-colors cursor-pointer leading-snug line-clamp-1"
                              title={proposal.title}
                            >
                              {proposal.title}
                            </h3>
                            <p className="text-xs text-[#1A1918]/80 line-clamp-2 mt-1 leading-relaxed font-sans font-medium">
                              {proposal.description}
                            </p>
                          </div>

                          {/* Proposer row */}
                          <div className="flex items-center justify-between text-xs text-[#1A1918]/80 border-y-2 border-[#1A1918]/15 py-2 font-mono">
                            <div className="flex items-center gap-2 truncate">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={proposal.proposedByAvatar}
                                alt={proposal.proposedByName}
                                className="w-5 h-5 rounded-full object-cover border border-[#1A1918] shrink-0 bg-[#F4EEDB]"
                              />
                              <span className="truncate font-bold text-[#1A1918]">Por {proposal.proposedByName}</span>
                            </div>
                            <span className="text-[#1A1918] shrink-0 font-bold bg-[#F4EEDB] px-2 py-0.5 border border-[#1A1918]/40 rounded text-[10px]">
                              {proposal.estimatedHours} est.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Collaborative Voting Toolbar */}
                      <div className="p-3 bg-[#F4EEDB] border-t-2 border-[#1A1918] flex items-center justify-between gap-2">
                        
                        {/* Thumbs Up & Thumbs Down Buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Upvote button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              voteRoute(proposal.id);
                            }}
                            className={`px-3 py-1.5 border-2 border-[#1A1918] rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition-all ${
                              hasUpvoted
                                ? 'bg-[#F7B32B] text-[#1A1918] shadow-none translate-x-0.5 translate-y-0.5'
                                : 'bg-[#FAF6ED] text-[#1A1918] shadow-[2px_2px_0px_#1A1918] hover:bg-[#F7B32B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                            }`}
                            title="Votar a favor (Manita arriba)"
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-[#1A1918]' : ''}`} />
                            <span>{upvotesCount}</span>
                          </button>

                          {/* Downvote button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downvoteRoute(proposal.id);
                            }}
                            className={`px-2.5 py-1.5 border-2 border-[#1A1918] rounded-xl text-xs font-mono font-black flex items-center gap-1 transition-all ${
                              hasDownvoted
                                ? 'bg-[#E6332A] text-white shadow-none translate-x-0.5 translate-y-0.5'
                                : 'bg-[#FAF6ED] text-[#1A1918] shadow-[2px_2px_0px_#1A1918] hover:bg-[#E6332A] hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                            }`}
                            title="Votar en contra (Manita abajo)"
                          >
                            <ThumbsDown className={`w-3.5 h-3.5 ${hasDownvoted ? 'fill-white' : ''}`} />
                            <span>{downvotesCount}</span>
                          </button>

                          {/* Net score */}
                          <span className={`text-xs font-mono font-black px-2 py-1 rounded-md border border-[#1A1918] ${
                            netScore > 0 
                              ? 'bg-[#FAF6ED] text-[#E06423] shadow-[1px_1px_0px_#1A1918]' 
                              : netScore < 0 
                              ? 'bg-[#FAF6ED] text-[#E6332A] shadow-[1px_1px_0px_#1A1918]' 
                              : 'bg-[#FAF6ED] text-[#1A1918]/60'
                          }`}>
                            {netScore > 0 ? `+${netScore}` : netScore}
                          </span>
                        </div>

                        {/* View Detail & Comments Button */}
                        <button
                          onClick={() => setDetailProposalId(proposal.id)}
                          className="px-3 py-1.5 bg-[#FAF6ED] hover:bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          title="Ver detalle y comentarios"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#1A1918]" />
                          <span>{proposal.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Si solo hay 1 opción, invitar a proponer alternativas */}
              {activeProposals.length === 1 && (
                <div className="p-5 border-2 border-[#1A1918] bg-[#F4EEDB] rounded-2xl shadow-[4px_4px_0px_#1A1918] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-[#FAF6ED] text-[#E6332A] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] shrink-0">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </span>
                    <div>
                      <h4 className="font-display font-black text-sm text-[#1A1918] uppercase">¿Tienes otra ruta en mente para esta fecha?</h4>
                      <p className="text-[#1A1918]/80 text-xs mt-0.5 font-sans">
                        Propón un trazado alternativo para que la tribu debata y vote antes de rodar.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInteractiveProposeModal(true)}
                    className="px-4 py-2.5 bg-[#F7B32B] hover:bg-[#e0a020] text-[#1A1918] border-2 border-[#1A1918] font-display font-black uppercase text-xs tracking-wider rounded-xl shadow-[2px_2px_0px_#1A1918] shrink-0 transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    + Proponer Alternativa
                  </button>
                </div>
              )}

              {activeProposals.length === 0 && (
                <div className="p-10 border-2 border-[#1A1918] bg-[#FAF6ED] rounded-2xl shadow-[4px_4px_0px_#1A1918] text-center space-y-4">
                  <Compass className="w-10 h-10 text-[#E6332A] mx-auto animate-spin-slow" />
                  <p className="text-sm font-sans font-bold text-[#1A1918]">Aún no hay opciones de ruta propuestas para esta fecha.</p>
                  <button
                    onClick={() => setShowInteractiveProposeModal(true)}
                    className="px-5 py-2.5 bg-[#E6332A] text-white border-2 border-[#1A1918] font-display font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_#1A1918]"
                  >
                    Proponer la Primera Opción
                  </button>
                </div>
              )}
              </div>
            )}
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL: DETALLE DE RUTA + VOTACIÓN + COMENTARIOS (RISOGRAPH)      */}
      {/* =================================================================== */}
      {selectedProposalForDetail && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] max-w-2xl w-full p-5 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto font-sans text-[#1A1918] shadow-[6px_6px_0px_#1A1918]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1A1918] pb-4 gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#E6332A] uppercase font-black tracking-widest block mb-1">
                  ★ DETALLE DE RUTA • PROPUESTA ★
                </span>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-[#1A1918] uppercase tracking-wide leading-tight">
                  {selectedProposalForDetail.title}
                </h3>
                <p className="text-xs font-mono font-bold text-[#1A1918]/70 mt-1">
                  Propuesta por {selectedProposalForDetail.proposedByName} para {selectedProposalForDetail.destination}
                </p>
              </div>
              <button
                onClick={() => setDetailProposalId(null)}
                className="p-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition shrink-0"
                title="Cerrar modal"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Tactical Topo Map & Quick Metrics in Detail Modal */}
            <div className="border-2 border-[#1A1918] rounded-2xl overflow-hidden shadow-[3px_3px_0px_#1A1918]">
              <RouteTacticalMapCard
                proposal={selectedProposalForDetail}
                heightClass="h-52"
                showOverlayBadges={true}
              />
            </div>

            {/* Voting Bar in Detail Modal */}
            <div className="bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <span className={`text-base font-mono font-black px-2.5 py-1 rounded-xl border-2 border-[#1A1918] bg-[#FAF6ED] shadow-[1px_1px_0px_#1A1918] ${
                  ((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) > 0
                    ? 'text-[#E06423]'
                    : ((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) < 0
                    ? 'text-[#E6332A]'
                    : 'text-[#1A1918]'
                }`}>
                  {((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) > 0 
                    ? `+${(selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)}`
                    : (selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)}
                </span>

                <div className="flex items-center gap-3 text-xs font-mono font-black border-l-2 border-[#1A1918]/20 pl-3">
                  <span className="text-emerald-800 flex items-center gap-1" title="Votos a favor">
                    <ThumbsUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{selectedProposalForDetail.votes?.length || 0}</span>
                  </span>
                  <span className="text-[#E6332A] flex items-center gap-1" title="Votos en contra">
                    <ThumbsDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{selectedProposalForDetail.downvotes?.length || 0}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => voteRoute(selectedProposalForDetail.id)}
                  title="Votar a favor"
                  className={`p-2 sm:px-3 sm:py-2 border-2 border-[#1A1918] rounded-xl text-xs font-mono font-black flex items-center justify-center transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    selectedProposalForDetail.votes?.includes(currentUser.id)
                      ? 'bg-[#F7B32B] text-[#1A1918] shadow-none translate-x-0.5 translate-y-0.5'
                      : 'bg-[#FAF6ED] text-[#1A1918] shadow-[2px_2px_0px_#1A1918] hover:bg-[#F7B32B]'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => downvoteRoute(selectedProposalForDetail.id)}
                  title="Votar en contra"
                  className={`p-2 sm:px-3 sm:py-2 border-2 border-[#1A1918] rounded-xl text-xs font-mono font-black flex items-center justify-center transition cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    selectedProposalForDetail.downvotes?.includes(currentUser.id)
                      ? 'bg-[#E6332A] text-white shadow-none translate-x-0.5 translate-y-0.5'
                      : 'bg-[#FAF6ED] text-[#1A1918] shadow-[2px_2px_0px_#1A1918] hover:bg-[#E6332A] hover:text-white'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                {/* If user is Admin, they can crown this route */}
                {isCreatorOrAdmin && activeRodada && (
                  <button
                    onClick={() => {
                      handleLockRoute(selectedProposalForDetail.id);
                      setDetailProposalId(null);
                    }}
                    className="px-4 py-2 bg-[#E6332A] hover:bg-[#d02c24] text-white text-xs font-display font-black uppercase tracking-wider border-2 border-[#1A1918] shadow-[3px_3px_0px_#1A1918] rounded-xl transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Confirmar como Oficial
                  </button>
                )}
              </div>
            </div>

            {/* Description & Technical Itinerary */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-mono text-[#1A1918] uppercase tracking-wider block font-black">
                Descripción &amp; Plan de Ruta
              </span>
              <p className="text-[#1A1918] leading-relaxed bg-[#FAF6ED] border-2 border-[#1A1918] rounded-2xl p-4 font-sans font-medium shadow-[2px_2px_0px_#1A1918]">
                {selectedProposalForDetail.description}
              </p>
              {selectedProposalForDetail.itinerary && selectedProposalForDetail.itinerary[0] && (
                <div className="text-xs text-[#1A1918] bg-[#F4EEDB] border-2 border-[#1A1918] rounded-2xl p-4 space-y-1.5 shadow-[2px_2px_0px_#1A1918] font-sans">
                  <p><strong className="font-display font-black uppercase tracking-wide text-[#1A1918]">Terreno:</strong> {selectedProposalForDetail.itinerary[0].terrainType}</p>
                  <p><strong className="font-display font-black uppercase tracking-wide text-[#1A1918]">Itinerario:</strong> {selectedProposalForDetail.itinerary[0].description}</p>
                </div>
              )}
            </div>

            {/* Collaborative Comments Section */}
            <div className="border-t-2 border-[#1A1918] pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#1A1918] uppercase tracking-wider font-black">
                  Comentarios del Grupo ({selectedProposalForDetail.comments?.length || 0})
                </span>
                <span className="text-[11px] font-mono text-[#1A1918]/60 font-bold">Notas breves sobre esta opción</span>
              </div>

              {/* Comments List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedProposalForDetail.comments && selectedProposalForDetail.comments.length > 0 ? (
                  selectedProposalForDetail.comments.map(c => (
                    <div key={c.id} className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl text-xs space-y-1 shadow-[2px_2px_0px_#1A1918]">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-black text-[#1A1918]">{c.userName}</span>
                        <span className="text-[#1A1918]/60 font-bold">{c.createdAt}</span>
                      </div>
                      <p className="text-[#1A1918]/90 font-sans leading-normal font-medium">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#1A1918]/60 font-serif italic py-2">
                    Aún no hay comentarios sobre esta ruta. Sé el primero en dejar una sugerencia o nota.
                  </p>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder="Añade un comentario sobre esta opción..."
                  className="flex-1 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!commentInput.trim()}
                  className="px-4 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-40 text-white text-xs font-bold uppercase transition border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none shrink-0"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-[#1A1918] pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailProposalId(null)}
                className="px-5 py-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl text-[#1A1918] uppercase text-xs font-display font-black shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. MODAL: PROPUESTA RÁPIDA DE RUTA ALTERNATIVA                    */}
      {/* =================================================================== */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] max-w-lg w-full p-5 sm:p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto font-sans text-[#1A1918] shadow-[6px_6px_0px_#1A1918]">
            
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
              <div>
                <span className="font-mono text-[10px] text-[#E6332A] uppercase tracking-widest font-black flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  ★ PROPONER RUTA ALTERNATIVA ★
                </span>
                <h3 className="font-display font-black text-xl text-[#1A1918] uppercase tracking-wide mt-0.5">
                  Alternativa para el {formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}
                </h3>
                <p className="text-xs font-serif italic text-[#1A1918]/70 mt-0.5 font-medium">
                  Al enviar tu propuesta, se notificará a los celulares de los pilotos de la tribu para que voten entre las opciones.
                </p>
              </div>
              <button 
                onClick={() => setShowProposeModal(false)} 
                className="p-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition shrink-0"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleQuickProposeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Título de la Ruta</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="Ej. Brecha de los Volcanes & Paso de Cortés"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Destino Principal</label>
                  <input
                    type="text"
                    required
                    value={propDestination}
                    onChange={(e) => setPropDestination(e.target.value)}
                    placeholder="Ej. Paso de Cortés"
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Estado</label>
                  <input
                    type="text"
                    value={propState}
                    onChange={(e) => setPropState(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Distancia Total (km)</label>
                  <input
                    type="number"
                    value={propKm}
                    onChange={(e) => setPropKm(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">% Terracería (Off-Road)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={propOffroad}
                    onChange={(e) => setPropOffroad(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Hora de Salida</label>
                  <input
                    type="text"
                    value={propMeetingTime}
                    onChange={(e) => setPropMeetingTime(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
                <div>
                  <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Punto de Encuentro</label>
                  <input
                    type="text"
                    value={propMeetingPoint}
                    onChange={(e) => setPropMeetingPoint(e.target.value)}
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl px-3.5 py-2.5 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#1A1918] uppercase text-[10px] font-mono font-black block mb-1">Plan / Resumen de la Ruta</label>
                <textarea
                  rows={2}
                  value={propPlan}
                  onChange={(e) => setPropPlan(e.target.value)}
                  placeholder="Por qué propones esta ruta, tipo de motos y parada a comer..."
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl p-3 text-[#1A1918] placeholder-[#1A1918]/50 focus:outline-none focus:border-[#E6332A] font-sans font-medium resize-none"
                />
              </div>

              <div className="pt-3 border-t-2 border-[#1A1918] flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="w-1/2 py-2.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-xl font-display font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
                >
                  Proponer a la Tribu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. MODAL: TARJETITA DEL PLAN DE LA RODADA (EXPEDICIÓN DETALLADA)    */}
      {/* =================================================================== */}
      {showPlanCardModal && (selectedConfirmedRodadaForPlan || activeRodada) && (
        <PlanCardModal
          rodada={selectedConfirmedRodadaForPlan || activeRodada!}
          winningRoute={
            (() => {
              const r = selectedConfirmedRodadaForPlan || activeRodada!;
              return r.winningRouteId 
                ? routeProposals.find(p => p.id === r.winningRouteId) || routeProposals.find(p => p.rodadaId === r.id) || undefined
                : routeProposals.find(p => p.rodadaId === r.id) || undefined;
            })()
          }
          currentUser={currentUser}
          allUsers={users}
          userBikes={userBikes}
          onClose={() => {
            setShowPlanCardModal(false);
            setSelectedConfirmedRodadaForPlan(null);
          }}
          onRsvp={rsvpRodada}
          formatHumanDate={formatHumanDate}
        />
      )}

      {/* =================================================================== */}
      {/* 7. MODAL: PROPOSITOR MINIMALISTA POR PASOS (KISS ALTERNATIVA)       */}
      {/* =================================================================== */}
      {showInteractiveProposeModal && (
        <StepByStepRodadaModal
          isOpen={showInteractiveProposeModal}
          mode="alternative"
          activeRodada={activeRodada}
          currentUser={currentUser}
          onClose={() => setShowInteractiveProposeModal(false)}
          onSubmitAlternative={handleInteractiveProposalSubmit}
          formatHumanDate={formatHumanDate}
        />
      )}

      {/* =================================================================== */}
      {/* 8. MODAL: CONVOCAR FECHA / NUEVA RODADA POR PASOS (KISS CONVOCAR)   */}
      {/* =================================================================== */}
      {showConvokeModal && (
        <StepByStepRodadaModal
          isOpen={showConvokeModal}
          mode="convoke"
          activeRodada={activeRodada}
          currentUser={currentUser}
          onClose={() => setShowConvokeModal(false)}
          onSubmitConvoke={handleConvokeSubmit}
          formatHumanDate={formatHumanDate}
        />
      )}

      {/* =================================================================== */}
      {/* 9. MODAL: AÑADIR O INVITAR PILOTOS A LA TRIBU                       */}
      {/* =================================================================== */}
      {showAddPilotModal && activeTribu && (
        <div className="fixed inset-0 z-50 bg-[#1A1918]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border-2 border-[#1A1918] bg-[#FAF6ED] rounded-[28px] max-w-lg w-full p-5 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto font-sans text-[#1A1918] shadow-[6px_6px_0px_#1A1918]">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1A1918] pb-4 gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#E6332A] uppercase font-black tracking-widest block mb-1">
                  ★ AÑADIR O INVITAR PILOTOS ★
                </span>
                <h3 className="font-display font-black text-xl text-[#1A1918] uppercase tracking-wide">
                  Añadir Piloto a {activeTribu.name}
                </h3>
                <p className="text-xs font-serif italic text-[#1A1918]/70 mt-0.5 font-medium">
                  Los nuevos pilotos se reflejarán de inmediato en los posts y rodadas de la tribu.
                </p>
              </div>
              <button
                onClick={() => setShowAddPilotModal(false)}
                className="p-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition shrink-0"
                title="Cerrar"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Invite code quick copy */}
            <div className="p-3.5 bg-[#F4EEDB] border-2 border-[#1A1918] rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918]">
              <div>
                <span className="text-[10px] font-mono text-[#1A1918]/70 uppercase block font-black">Clave de Invitación de la Tribu</span>
                <span className="text-sm font-black text-[#1A1918] tracking-wider font-mono">{activeTribu.inviteCode}</span>
              </div>
              <button
                onClick={() => handleCopyCode(activeTribu.inviteCode)}
                className="px-3 py-1.5 bg-[#F7B32B] hover:bg-[#e0a020] text-[#1A1918] border-2 border-[#1A1918] rounded-lg shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-mono font-black transition flex items-center gap-1.5 shrink-0"
              >
                <Key className="w-3.5 h-3.5 text-[#1A1918]" />
                <span>Copiar Clave</span>
              </button>
            </div>

            {/* Available community riders */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-[#1A1918] uppercase font-black tracking-wider block">
                Pilotos disponibles en NAO ({users.filter(u => !activeTribu.members.some(m => m.userId === u.id)).length})
              </span>

              {(() => {
                const available = users.filter(u => !activeTribu.members.some(m => m.userId === u.id));
                if (available.length === 0) {
                  return (
                    <div className="p-4 text-center border-2 border-dashed border-[#1A1918]/30 rounded-xl text-xs text-[#1A1918]/70 font-sans font-medium">
                      Todos los pilotos registrados ya forman parte de esta tribu.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {available.map(u => {
                      const bike = motorcycles?.find(m => m.userId === u.id);
                      return (
                        <div 
                          key={u.id}
                          className="p-3 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_#1A1918] hover:bg-[#F4EEDB] transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={u.avatar} 
                              alt={u.name} 
                              className="w-9 h-9 rounded-full object-cover border-2 border-[#1A1918] shrink-0" 
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-display font-black text-[#1A1918] uppercase truncate">{u.name}</p>
                              <p className="text-[10px] font-mono text-[#1A1918]/70 truncate font-bold">
                                {bike ? `${bike.brand} ${bike.model}` : u.handle}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              addCrewMember(activeTribu.id, u.id, 'Rider');
                              setNotificationToast(`${u.name} ha sido añadido a ${activeTribu.name}.`);
                              try {
                                confetti({ particleCount: 25, spread: 60 });
                              } catch {}
                            }}
                            className="px-3 py-1.5 bg-[#E6332A] hover:bg-[#d02c24] text-white border-2 border-[#1A1918] rounded-lg shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-[11px] font-display font-black uppercase transition flex items-center gap-1 shrink-0"
                          >
                            <UserPlus className="w-3 h-3 stroke-[2.5]" />
                            <span>+ Añadir</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t-2 border-[#1A1918] pt-4 flex justify-end">
              <button
                onClick={() => setShowAddPilotModal(false)}
                className="px-5 py-2 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl font-display font-black uppercase text-xs shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR NOMBRE Y FOTO DEL GRUPO */}
      {showEditCrewModal && activeTribu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1918]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#FAF6ED] border-2 border-[#1A1918] rounded-[28px] shadow-[6px_6px_0px_#1A1918] p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200 font-sans text-[#1A1918]">
            
            <div className="flex items-center justify-between border-b-2 border-[#1A1918] pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#E6332A]" />
                <h3 className="text-base font-display font-black text-[#1A1918] uppercase tracking-wide">Editar Tribu</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCrewModal(false)}
                className="p-1.5 bg-[#FAF6ED] hover:bg-[#F4EEDB] text-[#1A1918] border-2 border-[#1A1918] rounded-xl shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre de la Tribu */}
              <div>
                <label className="text-[11px] font-mono uppercase text-[#1A1918] block mb-1.5 font-black tracking-wider">
                  Nombre de la Tribu
                </label>
                <input
                  type="text"
                  value={editedCrewName}
                  onChange={(e) => setEditedCrewName(e.target.value)}
                  placeholder="Ej. NAO Adventure Crew"
                  className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-sans font-medium"
                />
              </div>

              {/* Portada de la Tribu */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase text-[#1A1918] font-black tracking-wider">
                    Portada
                  </label>
                  <label className="cursor-pointer text-[11px] font-display font-black uppercase text-[#1A1918] hover:bg-[#F4EEDB] transition flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF6ED] border-2 border-[#1A1918] rounded-lg shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                    <Upload className="w-3 h-3 text-[#1A1918]" />
                    <span>Subir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditedCrewCover(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {/* Banner Preview */}
                <div className="relative h-24 w-full rounded-xl overflow-hidden border-2 border-[#1A1918] bg-[#F4EEDB] shadow-[2px_2px_0px_#1A1918]">
                  {editedCrewCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={editedCrewCover} 
                      alt="Portada de la tribu" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1A1918]/60 text-xs font-serif italic">
                      <Camera className="w-5 h-5 mr-2 text-[#1A1918]/40" />
                      <span>Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-[#1A1918]/70 font-bold shrink-0">Presets:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                    {[
                      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=800',
                    ].map((imgUrl, idx) => {
                      const isSelected = editedCrewCover === imgUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditedCrewCover(imgUrl)}
                          className={`relative w-12 h-8 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                            isSelected 
                              ? 'border-[#E6332A] ring-2 ring-[#E6332A]' 
                              : 'border-[#1A1918] opacity-70 hover:opacity-100'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={imgUrl} 
                            alt={`Preset ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vínculo de WhatsApp */}
              <div className="p-3.5 rounded-xl bg-[#F4EEDB] border-2 border-[#1A1918] space-y-3 shadow-[2px_2px_0px_#1A1918]">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase text-[#1A1918] font-black flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Chat de WhatsApp</span>
                    </label>
                    {editedCrewWhatsapp && (
                      <a
                        href={editedCrewWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-800 hover:underline font-mono font-bold"
                      >
                        Abrir enlace ↗
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editedCrewWhatsapp}
                    onChange={(e) => setEditedCrewWhatsapp(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-[#FAF6ED] border-2 border-[#1A1918] focus:border-[#E6332A] rounded-xl px-3 py-2 text-xs text-[#1A1918] placeholder-[#1A1918]/40 focus:outline-none transition font-mono"
                  />
                  <span className="text-[10px] text-[#1A1918]/60 mt-1 block font-sans">
                    Pega el enlace de invitación de tu grupo para que tus pilotos se unan con 1 toque.
                  </span>
                </div>

                <div className="pt-2.5 border-t border-[#1A1918]/20 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs text-[#1A1918] font-bold block font-sans">Link de NAO</span>
                    <span className="text-[10px] text-[#1A1918]/60 block font-sans">Pégalo en la descripción de tu WhatsApp</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNaoLink}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF6ED] hover:bg-[#F4EEDB] border-2 border-[#1A1918] text-[#1A1918] text-xs font-mono font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    <Copy className="w-3 h-3 text-[#1A1918]" />
                    <span>{copiedNaoLink ? '✓ Copiado' : 'Copiar link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-[#1A1918]">
              <button
                type="button"
                onClick={() => setShowEditCrewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-display font-black uppercase text-[#1A1918] hover:bg-[#F4EEDB] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCrewDetails}
                disabled={!editedCrewName.trim()}
                className="px-5 py-2 rounded-xl bg-[#E6332A] hover:bg-[#d02c24] disabled:opacity-50 text-white text-xs font-display font-black uppercase tracking-wider transition flex items-center gap-1.5 border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Guardar Cambios</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
