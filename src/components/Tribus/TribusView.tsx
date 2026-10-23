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
  XCircle
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

  // Search query for Tribus list
  const [searchTribuQuery, setSearchTribuQuery] = useState('');

  // Selected Route Option Detail Modal (Airbnb style detail view)
  const [detailProposalId, setDetailProposalId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Detailed Plan Card Modal state (tarjetita del plan)
  const [showPlanCardModal, setShowPlanCardModal] = useState<boolean>(false);
  const [selectedConfirmedRodadaForPlan, setSelectedConfirmedRodadaForPlan] = useState<Rodada | null>(null);

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
    if (!searchTribuQuery.trim()) return true;
    const q = searchTribuQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.baseCity.toLowerCase().includes(q);
  });

  // =========================================================================
  // VIEW 1: DIRECTORIO DE TRIBUS (COMPACTO, ELEGANTE Y ESCALABLE)
  // =========================================================================
  if (!activeTribu) {
    return (
      <div className="max-w-[1200px] w-full mx-auto pb-28 px-4 sm:px-6 font-mono">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-5 pt-3 gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-earth uppercase font-bold block mb-1">
              [ RED DE COMUNIDADES ]
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              Tribus
            </h1>
            <p className="text-xs text-ash mt-1 max-w-xl">
              Flotillas privadas de pilotos, garajes compartidos y votación de rodadas en consenso colaborativo.
            </p>
          </div>

          {/* Action buttons with authentic NAO brand styling */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenJoinCrew}
              className="px-3.5 py-2 border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-chalk text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
            >
              <Key className="w-3.5 h-3.5 text-ash" />
              <span>Unirse con Clave</span>
            </button>
            <button
              onClick={onOpenCreateCrew}
              className="px-4 py-2 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition border border-earth/30 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Tribu</span>
            </button>
          </div>
        </div>

        {/* Directory Controls: Search and Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-white/[0.06]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTribuQuery}
              onChange={(e) => setSearchTribuQuery(e.target.value)}
              placeholder="Buscar tribu por nombre o ciudad..."
              className="w-full bg-[#12100E] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-ash/50 focus:outline-none focus:border-earth"
            />
          </div>
          <span className="text-[10px] text-ash uppercase tracking-wider">
            {filteredCrews.length} {filteredCrews.length === 1 ? 'Tribu Activa' : 'Tribus Activas'}
          </span>
        </div>

        {/* Compact, Sensible Directory List (Scales cleanly to 10+ Tribus) */}
        <div className="divide-y divide-white/[0.06] border border-white/10 bg-[#0D0B0A] mt-4">
          {filteredCrews.map((crew) => {
            const isUserAdmin = crew.creatorId === currentUser.id;
            const crewRides = rodadas.filter(r => r.crewId === crew.id);

            // 1. Siguiente ruta confirmada (si es que hay)
            const confirmedRides = crewRides
              .filter(r => r.status === 'fijada' || Boolean(r.winningRouteId))
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            const nextConfirmedRide = confirmedRides[0] || null;
            const otherConfirmedCount = Math.max(0, confirmedRides.length - 1);

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
            const hasPendingRsvp = Boolean(nextConfirmedRide && !userAttendeeForRide);
            const isUserUndecided = Boolean(
              nextConfirmedRide && userAttendeeForRide && (userAttendeeForRide.status === 'por_confirmar' || userAttendeeForRide.status === 'interesado')
            );

            return (
              <div
                key={crew.id}
                onClick={() => {
                  setSelectedTribuId(crew.id);
                  setCurrentCrew(crew);
                }}
                className="group p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.03] transition cursor-pointer"
              >
                {/* Left: Tribu Identity */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Foto de la Tribu / Portada o Monograma si no tiene */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center shrink-0 group-hover:border-earth/50 transition shadow-sm">
                    {crew.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={crew.coverImage} 
                        alt={crew.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                    ) : (
                      <span className="text-earth font-display font-bold text-sm">
                        {crew.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-sm sm:text-base text-white uppercase group-hover:text-earth transition truncate">
                        {crew.name}
                      </h3>
                      {isUserAdmin ? (
                        <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 bg-earth/15 border border-earth/40 text-earth">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-ash">
                          Miembro
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-[11px] text-ash mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-chalk/80">
                        <MapPin className="w-3 h-3 text-earth shrink-0" />
                        {crew.baseCity}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-ash shrink-0" />
                        {crew.members.length} {crew.members.length === 1 ? 'piloto' : 'pilotos'}
                      </span>
                      <span>•</span>
                      <span className="text-[10px] text-ash/80">Clave: {crew.inviteCode}</span>
                    </div>
                  </div>
                </div>

                {/* Center / Right: Siguiente ruta confirmada (solo si hay) + Notificaciones */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                  <div className="text-left md:text-right space-y-1.5">
                    {nextConfirmedRide ? (
                      <div>
                        <span className="text-[9px] text-ash uppercase tracking-wider block font-bold">
                          Próxima Ruta Confirmada
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 md:justify-end">
                          <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="text-xs text-chalk font-bold truncate max-w-[200px] sm:max-w-[260px]">
                            {formatHumanDate(nextConfirmedRide.startDate, nextConfirmedRide.endDate)} • {nextConfirmedRide.title}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1 shrink-0">
                            <Check className="w-2.5 h-2.5" />
                            <span>Confirmada</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="md:text-right">
                        <span className="text-[10px] text-ash/60 font-mono italic block">
                          Sin ruta confirmada aún
                        </span>
                      </div>
                    )}

                    {/* Notificaciones de fechas por votar, nuevas propuestas u otras confirmadas */}
                    {(unvotedDatesCount > 0 || newProposalsCount > 0 || otherConfirmedCount > 0 || hasPendingRsvp) && (
                      <div className="flex items-center gap-1.5 flex-wrap md:justify-end pt-0.5">
                        {unvotedDatesCount > 0 && (
                          <span 
                            title="Fechas abiertas convocadas pendientes de tu voto"
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1"
                          >
                            <Vote className="w-2.5 h-2.5 text-amber-400" />
                            <span>{unvotedDatesCount} {unvotedDatesCount === 1 ? 'fecha por votar' : 'fechas por votar'}</span>
                          </span>
                        )}

                        {newProposalsCount > 0 && (
                          <span 
                            title="Nuevas propuestas de ruta en el grupo"
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-earth/15 border border-earth/40 text-earth font-bold flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-earth" />
                            <span>{newProposalsCount} {newProposalsCount === 1 ? 'nueva propuesta' : 'nuevas propuestas'}</span>
                          </span>
                        )}

                        {otherConfirmedCount > 0 && (
                          <span 
                            title="Otras fechas confirmadas en el calendario"
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/15 text-ash font-bold flex items-center gap-1"
                          >
                            <Calendar className="w-2.5 h-2.5 text-ash" />
                            <span>+{otherConfirmedCount} confirmada</span>
                          </span>
                        )}

                        {hasPendingRsvp && (
                          <span 
                            title="Confirma tu asistencia en la rodada confirmada"
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1"
                          >
                            <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                            <span>RSVP pendiente</span>
                          </span>
                        )}

                        {isUserUndecided && (
                          <span 
                            title="Marcaste tu asistencia como 'por confirmar'"
                            className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1"
                          >
                            <HelpCircle className="w-2.5 h-2.5 text-amber-400" />
                            <span>Por confirmar</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-ash group-hover:text-white transition pl-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider hidden sm:inline group-hover:text-earth">
                      Entrar
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCrews.length === 0 && (
            <div className="p-8 text-center text-ash text-xs space-y-3">
              <p>No se encontraron tribus con ese criterio.</p>
              <button
                onClick={onOpenCreateCrew}
                className="px-4 py-2 bg-earth text-white font-bold uppercase text-xs"
              >
                Crear una Nueva Tribu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: DENTRO DE LA TRIBU (VISTA SUTIL SUPERIOR + BOARD ESTILO AIRBNB)
  // =========================================================================
  return (
    <div className="max-w-[1300px] w-full mx-auto pb-28 px-4 sm:px-6 font-mono space-y-6">
      
      {/* App Header (Responsive & Mobile-Native) */}
      <div className="relative border-b border-white/10 pb-3 pt-1 space-y-2.5">
        
        {/* Row 1: Back + Tribe Selector + Clean Icon Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Izquierda: Volver al directorio */}
          <button
            onClick={() => setSelectedTribuId(null)}
            className="p-1.5 -ml-1 text-ash hover:text-white transition group flex items-center gap-1 text-xs uppercase shrink-0"
            title="Ver todas las tribus"
          >
            <ArrowLeft className="w-4 h-4 text-earth group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-bold">Tribus</span>
          </button>

          {/* Centro: Selector de Grupo */}
          <div className="relative flex-1 flex items-center justify-center min-w-0">
            <button
              type="button"
              onClick={() => setShowCrewDropdown(prev => !prev)}
              className={`px-2 sm:px-3 py-1 rounded-xl transition-all flex items-center gap-2 group max-w-[200px] sm:max-w-md mx-auto active:scale-95 ${
                showCrewDropdown ? 'bg-white/10 ring-1 ring-white/10' : 'hover:bg-white/5'
              }`}
            >
              {activeTribu.coverImage && (
                <div className="w-5 h-5 rounded-md overflow-hidden border border-white/20 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeTribu.coverImage} 
                    alt={activeTribu.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight truncate">
                {activeTribu.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-earth shrink-0 transition-transform duration-200 ${showCrewDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown selector de Tribus */}
            {showCrewDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity" 
                  onClick={() => setShowCrewDropdown(false)} 
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 bg-[#161311]/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/5 z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Notch pointer */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#161311] border-t border-l border-white/10" />
                  
                  {/* Header */}
                  <div className="px-2 py-1 flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-earth" />
                      <span className="text-xs font-semibold text-white/90">Tus Grupos</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-ash border border-white/10">
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
                              ? 'bg-earth/15 border border-earth/40 text-white shadow-sm' 
                              : 'hover:bg-white/5 text-ash hover:text-white border border-transparent'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border transition ${
                            isCurrent 
                              ? 'border-earth ring-1 ring-earth/50 shadow-md' 
                              : 'border-white/10 bg-white/5'
                          }`}>
                            {c.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={c.coverImage} 
                                alt={c.name} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span className={`font-bold text-xs ${isCurrent ? 'text-earth' : 'text-ash'}`}>
                                {initials || 'TR'}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-white truncate">{c.name}</p>
                            <p className="text-xs text-ash/90 truncate mt-0.5">
                              {c.baseCity} • {c.members.length} {c.members.length === 1 ? 'piloto' : 'pilotos'}
                            </p>
                          </div>

                          {isCurrent ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                          ) : (
                            <span className="text-xs text-ash/40">Entrar</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    {activeTribu.whatsappGroupUrl ? (
                      <a
                        href={activeTribu.whatsappGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5 transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Abrir grupo de WhatsApp</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCrewDropdown(false);
                          handleOpenEditCrew();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2.5 transition"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Conectar grupo de WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        handleOpenEditCrew();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-ash hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-earth" />
                      <span>Editar grupo</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        handleShareCrewWithCode();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-ash hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-earth" />
                      <span>Compartir clave ({activeTribu.inviteCode})</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCrewDropdown(false);
                        onOpenCreateCrew();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-chalk hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-earth" />
                      <span>Crear nuevo grupo</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Derecha: Acciones Compactas (KISS: iconos limpios) */}
          <div className="relative flex items-center gap-1 shrink-0">
            {/* Editar grupo */}
            <button
              type="button"
              onClick={handleOpenEditCrew}
              title="Editar grupo"
              className="p-1.5 rounded-lg text-ash hover:text-earth hover:bg-white/5 transition shrink-0 cursor-pointer active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>

            {/* Compartir grupo */}
            <button
              type="button"
              onClick={handleShareCrewWithCode}
              title={`Compartir clave ${activeTribu.inviteCode}`}
              className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer active:scale-90 ${
                copiedCrewShare 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-ash hover:text-earth hover:bg-white/5'
              }`}
            >
              {copiedCrewShare ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {/* WhatsApp Icon */}
            <button
              type="button"
              onClick={handleWhatsAppHeaderClick}
              className={`p-1.5 rounded-lg border transition shrink-0 cursor-pointer shadow-sm active:scale-90 relative ${
                activeTribu.whatsappGroupUrl
                  ? 'bg-[#25D366]/15 hover:bg-[#25D366]/25 border-[#25D366]/40 text-[#25D366]'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/15 text-ash hover:text-white'
              }`}
              title={activeTribu.whatsappGroupUrl ? 'Abrir grupo de WhatsApp' : 'Sin enlace de WhatsApp'}
            >
              <WhatsAppIcon className={`w-4 h-4 ${activeTribu.whatsappGroupUrl ? 'text-[#25D366]' : 'text-ash'}`} />
              {activeTribu.whatsappGroupUrl && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
              )}
            </button>

            {/* Mini Aviso: Sin enlace de WhatsApp vinculado */}
            {showWhatsappMissingNotice && (
              <div className="absolute top-full right-0 mt-2 z-50 w-72 p-3 bg-[#141210] border border-white/20 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-ash" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1 text-left">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Sin WhatsApp
                    </h5>
                    <p className="text-[11px] text-ash leading-relaxed">
                      Este grupo aún no tiene enlace de WhatsApp vinculado.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWhatsappMissingNotice(false);
                        handleOpenEditCrew();
                      }}
                      className="text-[11px] font-bold text-earth hover:text-earth-bright underline pt-0.5 block cursor-pointer"
                    >
                      Vincular en Ajustes ✏️ →
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWhatsappMissingNotice(false)}
                    className="text-ash/60 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Segmented Tabs (Clean, Full-Width on Mobile, Touch-Friendly) */}
        <div className="flex items-center justify-center pt-0.5">
          <div className="w-full sm:w-auto inline-flex p-1 bg-black/60 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveTribuTab('rodadas')}
              className={`flex-1 sm:flex-initial px-6 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTribuTab === 'rodadas'
                  ? 'bg-earth text-white shadow-sm'
                  : 'text-ash hover:text-white'
              }`}
            >
              Rodadas
            </button>
            <button
              onClick={() => setActiveTribuTab('miembros')}
              className={`flex-1 sm:flex-initial px-6 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                activeTribuTab === 'miembros'
                  ? 'bg-earth text-white shadow-sm'
                  : 'text-ash hover:text-white'
              }`}
            >
              Pilotos ({activeTribu.members.length})
            </button>
          </div>
        </div>

      </div>

      {/* =================================================================== */}
      {/* 1. VISTA SUTIL DE PRÓXIMAS RODADAS CONFIRMADAS                      */}
      {/* (Solo rodadas confirmadas; las que están en votación van abajo)     */}
      {/* =================================================================== */}
      {confirmedRodadas.length === 0 ? null : confirmedRodadas.length === 1 ? (
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
              className="group relative overflow-hidden border border-earth/40 hover:border-earth bg-[#0D0B0A] transition-all duration-300 cursor-pointer shadow-lg p-3 sm:p-4"
              title="Click para ver el plan completo de la rodada"
            >
              {/* Background Tactical Topographic & GPS Vector Pattern */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity duration-500 overflow-hidden">
                {confWinning && (
                  <RouteTacticalMapCard
                    proposal={confWinning}
                    isWinner={true}
                    className="w-full h-full scale-110 pointer-events-none"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0B0A] via-[#0D0B0A]/85 to-transparent" />
              </div>

              {/* Content Container: Compact Layout */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Left side: Badge + Destination + Metrics */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase font-black px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ruta Confirmada
                    </span>

                    <span className="text-[11px] font-mono text-ash font-bold flex items-center gap-1 bg-black/60 px-2 py-0.5 border border-white/10">
                      <Calendar className="w-3 h-3 text-earth" />
                      <span className="text-white">{formatHumanDate(confRodada.startDate, confRodada.endDate, true)}</span>
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-earth shrink-0 self-center" />
                    <h3 className="text-sm sm:text-base font-display font-black text-white uppercase truncate group-hover:text-chalk transition tracking-tight">
                      {confWinning ? confWinning.destination : confRodada.title}
                    </h3>
                    <span className="text-white/20 hidden md:inline">•</span>
                    <span className="text-xs text-ash truncate hidden md:inline">
                      {confWinning?.title || confRodada.subtitle}
                    </span>
                  </div>

                  {/* Compact Metrics Row */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap pt-0.5">
                    {confWinning && (
                      <span className="px-2 py-0.5 bg-black/60 border border-white/10 text-white font-bold">
                        {confWinning.totalKm} km
                      </span>
                    )}
                    {confWinning && (
                      <span className="px-2 py-0.5 bg-earth/15 border border-earth/30 text-earth font-bold flex items-center gap-1">
                        <Mountain className="w-3 h-3 text-earth shrink-0" />
                        <span>{confWinning.offroadPercentage}% tierra</span>
                      </span>
                    )}
                    {confWinning?.difficulty && (
                      <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-ash uppercase">
                        {confWinning.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Pilots + Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 justify-between md:justify-end">
                  {/* Attendees */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {confAttendees.slice(0, 4).map((att, i) => (
                        <img 
                          key={att.userId + i}
                          src={att.userAvatar} 
                          alt={att.userName} 
                          title={att.userName}
                          className="w-5 h-5 rounded-full border border-black object-cover" 
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-ash">
                      <strong className="text-white">{confCount}</strong>
                    </span>
                  </div>

                  {/* 3-way RSVP selector: Asistiré, Por confirmar, No asistiré */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="inline-flex rounded-lg border border-white/15 bg-black/70 p-0.5 text-[11px] font-mono gap-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        rsvpRodada(
                          confRodada.id, 
                          userBikes[0]?.id || 'moto-default', 
                          'confirmado'
                        );
                        if (userRsvpStatus !== 'confirmado') {
                          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                        }
                      }}
                      className={`px-2 sm:px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 ${
                        userRsvpStatus === 'confirmado'
                          ? 'bg-emerald-500/25 border border-emerald-500/60 text-emerald-300 shadow'
                          : 'text-ash hover:text-white border border-transparent'
                      }`}
                      title="Confirmar que asistirás"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Asistiré</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        rsvpRodada(
                          confRodada.id, 
                          userBikes[0]?.id || 'moto-default', 
                          'por_confirmar'
                        );
                      }}
                      className={`px-2 sm:px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 ${
                        userRsvpStatus === 'por_confirmar' || userRsvpStatus === 'interesado'
                          ? 'bg-amber-500/25 border border-amber-500/60 text-amber-300 shadow'
                          : 'text-ash hover:text-white border border-transparent'
                      }`}
                      title="Por confirmar tu asistencia"
                    >
                      <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="hidden sm:inline">Por confirmar</span>
                      <span className="sm:hidden">Duda</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        rsvpRodada(
                          confRodada.id, 
                          userBikes[0]?.id || 'moto-default', 
                          'no_asistire'
                        );
                      }}
                      className={`px-2 sm:px-2.5 py-1 rounded font-bold uppercase transition flex items-center gap-1 ${
                        userRsvpStatus === 'no_asistire'
                          ? 'bg-rose-500/25 border border-rose-500/60 text-rose-300 shadow'
                          : 'text-ash hover:text-white border border-transparent'
                      }`}
                      title="No podrás asistir"
                    >
                      <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="hidden sm:inline">No asistiré</span>
                      <span className="sm:hidden">No voy</span>
                    </button>
                  </div>

                  {/* Ver Plan */}
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs font-mono text-earth font-bold uppercase tracking-wider px-2.5 py-1.5 bg-black/60 border border-earth/30 group-hover:border-earth group-hover:bg-earth group-hover:text-white transition-all"
                  >
                    <span>Plan</span>
                    <ChevronRight className="w-3.5 h-3.5 text-current" />
                  </button>

                  {isCreatorOrAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockWinningRoute(confRodada.id);
                      }}
                      className="text-[10px] font-mono text-ash/60 hover:text-white uppercase px-1"
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
                  className="group relative overflow-hidden bg-[#0D0B0A] border border-earth/30 hover:border-earth p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 shadow-lg"
                  title="Click para ver la tarjeta del plan"
                >
                  {/* Background Tactical Topographic & GPS Vector Pattern */}
                  {winning && (
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500 overflow-hidden">
                      <RouteTacticalMapCard
                        proposal={winning}
                        isWinner={true}
                        className="w-full h-full scale-110 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0A] via-[#0D0B0A]/80 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 space-y-2">
                    {/* Fecha + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-white group-hover:text-chalk transition">
                        {formatHumanDate(rodada.startDate, rodada.endDate, true)}
                      </span>
                      <span className="text-[8px] font-mono uppercase font-black px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                        Confirmada
                      </span>
                    </div>

                    {/* Destino */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-earth shrink-0" />
                      <h4 className="text-base font-display font-black text-white uppercase truncate group-hover:text-chalk transition">
                        {winning ? winning.destination : rodada.title}
                      </h4>
                    </div>
                  </div>

                  {/* Asistentes & Ver Plan */}
                  <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-ash">
                      <Users className="w-3.5 h-3.5 text-earth" />
                      <span className="text-white font-bold">{attendees.length}</span>
                      <span>{attendees.length === 1 ? 'asistente' : 'asistentes'}</span>
                    </div>
                    <span className="text-earth text-[10px] uppercase font-bold tracking-wider group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Ver Plan <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. TAB: MIEMBROS & GARAJE                                          */}
      {/* =================================================================== */}
      {activeTribuTab === 'miembros' && (
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-base text-white uppercase">
                Pilotos ({activeTribu.members.length})
              </h3>
            </div>

            <button
              onClick={() => setShowAddPilotModal(true)}
              className="px-3 py-1.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition self-start sm:self-auto border border-earth/40 shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Invitar Piloto</span>
            </button>
          </div>

          {/* Tarjeta de integración con WhatsApp */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/15 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wide flex items-center gap-2">
                  <span>Chat de WhatsApp</span>
                  {activeTribu.whatsappGroupUrl && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Conectado
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-ash">
                  {activeTribu.whatsappGroupUrl 
                    ? 'Chat para avisos rápidos y coordinación.'
                    : 'Sin enlace de WhatsApp vinculado.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeTribu.whatsappGroupUrl ? (
                <a
                  href={activeTribu.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                  <span>Abrir WhatsApp</span>
                </a>
              ) : (
                <button
                  onClick={handleOpenEditCrew}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Vincular</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyNaoLink}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-ash hover:text-white text-xs font-mono transition flex items-center gap-1.5"
                title="Copiar link de NAO para el grupo"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">{copiedNaoLink ? '¡Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeTribu.members.map(member => {
              const isCreator = member.userId === activeTribu.creatorId;
              const u = users.find(user => user.id === member.userId);
              const bike = motorcycles?.find(m => m.userId === member.userId);
              const displayName = u ? (u.id === currentUser.id ? `${u.name} (Tú)` : u.name) : member.userId;
              const avatar = u?.avatar;
              const motoModel = bike ? `${bike.brand} ${bike.model}` : null;

              return (
                <div 
                  key={member.userId}
                  onClick={() => openPilotProfileById(member.userId)}
                  className="p-3 bg-[#0D0B0A] border border-white/10 flex items-center gap-3 hover:border-earth/40 transition cursor-pointer"
                >
                  <div className="w-10 h-10 border border-white/15 bg-black/40 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                    {avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      member.userId.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase truncate">
                        {displayName}
                      </span>
                      {isCreator && (
                        <span className="text-[9px] font-mono uppercase font-bold text-earth border border-earth/30 px-1 shrink-0">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-ash block mt-0.5 truncate">
                      {member.role} {motoModel ? `• ${motoModel}` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. TAB: RODADAS & CONVOCATORIAS PROPUESTAS                          */}
      {/* =================================================================== */}
      {activeTribuTab === 'rodadas' && (
        <div className="space-y-5">
          
          {/* Header limpio de convocatorias */}
          <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-white/10">
            <h2 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
              Convocatorias
            </h2>

            <button
              onClick={() => setShowConvokeModal(true)}
              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-chalk hover:text-white border border-white/15 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-earth" />
              <span>+ Convocar</span>
            </button>
          </div>

          {/* Selector de Fechas Convocadas (Pills compactas y claras con scroll touch) */}
          <div className="flex items-stretch gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {tribuRodadas.map((rodada) => {
              const isSelected = activeRodada?.id === rodada.id;
              const rodadaProposals = routeProposals.filter(p => p.rodadaId === rodada.id);
              const isConfirmed = rodada.status === 'fijada';

              return (
                <button
                  key={rodada.id}
                  onClick={() => setSelectedRodadaId(rodada.id)}
                  className={`text-left px-3 py-2 border transition flex items-center gap-2.5 shrink-0 active:scale-95 ${
                    isSelected
                      ? 'border-earth bg-earth/15 text-white shadow-sm ring-1 ring-earth/40'
                      : 'border-white/10 bg-black/40 text-ash hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold tracking-wider uppercase ${
                        isSelected ? 'text-earth' : 'text-chalk'
                      }`}>
                        {formatHumanDate(rodada.startDate, rodada.endDate, true)}
                      </span>
                      {isConfirmed ? (
                        <span className="text-[8px] font-mono uppercase font-bold px-1.5 py-0.2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                          Confirmada
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono uppercase font-bold px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/30 text-amber-300">
                          {rodadaProposals.length} {rodadaProposals.length === 1 ? 'ruta' : 'rutas'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/90 font-bold uppercase line-clamp-1 mt-0.5">
                      {rodada.title}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Opciones para la Fecha Seleccionada */}
          {activeRodada && (
            <div className="space-y-3.5 pt-1">
              
              {/* Header directo y sin redundancias */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-tight">
                    Propuestas
                  </h3>
                  <span className="text-xs font-mono font-bold text-earth bg-earth/10 border border-earth/25 px-1.5 py-0.5">
                    {activeProposals.length}
                  </span>
                </div>

                <button
                  onClick={() => setShowInteractiveProposeModal(true)}
                  className="px-3 py-1.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shrink-0 shadow border border-earth/40 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Proponer</span>
                </button>
              </div>

          {/* Proposals Grid: Airbnb style cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className={`bg-[#0D0B0A] border transition flex flex-col justify-between group ${
                    isWinner 
                      ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : isLeader
                      ? 'border-earth/50 shadow-[0_0_15px_rgba(200,125,85,0.08)]'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    {/* Tactical Map Header with Topo Contours & GPS Vector Track */}
                    <div 
                      onClick={() => setDetailProposalId(proposal.id)}
                      className="cursor-pointer group/map"
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
                          className="font-display font-bold text-base text-white uppercase group-hover:text-earth transition cursor-pointer truncate"
                        >
                          {proposal.title}
                        </h3>
                        <p className="text-xs text-ash line-clamp-2 mt-1 leading-relaxed">
                          {proposal.description}
                        </p>
                      </div>

                      {/* Proposer row */}
                      <div className="flex items-center justify-between text-[11px] text-ash border-y border-white/[0.06] py-2">
                        <div className="flex items-center gap-1.5 truncate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={proposal.proposedByAvatar}
                            alt={proposal.proposedByName}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">Por {proposal.proposedByName}</span>
                        </div>
                        <span className="text-chalk/80 shrink-0 font-medium">{proposal.estimatedHours} est.</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Collaborative Voting Toolbar (Airbnb Thumbs Up / Down) */}
                  <div className="p-3 bg-black/30 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    
                    {/* Thumbs Up & Thumbs Down Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Upvote button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          voteRoute(proposal.id);
                        }}
                        className={`px-2.5 py-1.5 border text-xs font-bold flex items-center gap-1.5 transition ${
                          hasUpvoted
                            ? 'bg-earth/20 border-earth text-earth'
                            : 'bg-white/[0.03] border-white/10 text-ash hover:text-white hover:border-white/20'
                        }`}
                        title="Votar a favor (Manita arriba)"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-earth' : ''}`} />
                        <span>{upvotesCount}</span>
                      </button>

                      {/* Downvote button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downvoteRoute(proposal.id);
                        }}
                        className={`px-2.5 py-1.5 border text-xs font-bold flex items-center gap-1.5 transition ${
                          hasDownvoted
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-white/[0.03] border-white/10 text-ash hover:text-white hover:border-white/20'
                        }`}
                        title="Votar en contra (Manita abajo)"
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${hasDownvoted ? 'text-rose-400' : ''}`} />
                        <span>{downvotesCount}</span>
                      </button>

                      {/* Net score */}
                      <span className={`text-xs font-mono font-bold ml-1 ${
                        netScore > 0 ? 'text-earth' : netScore < 0 ? 'text-rose-400' : 'text-ash'
                      }`}>
                        {netScore > 0 ? `+${netScore}` : netScore}
                      </span>
                    </div>

                    {/* View Detail & Comments Button */}
                    <button
                      onClick={() => setDetailProposalId(proposal.id)}
                      className="px-2.5 py-1.5 text-xs text-ash hover:text-white flex items-center gap-1 transition"
                      title="Ver detalle y comentarios"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{proposal.comments?.length || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Si solo hay 1 opción, invitar a proponer alternativas */}
          {activeProposals.length === 1 && (
            <div className="p-4 border border-white/10 bg-[#0B0908] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-white/[0.04] text-earth border border-white/10 shrink-0">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-white uppercase text-xs">¿Tienes otra ruta en mente para esta fecha?</h4>
                  <p className="text-ash text-[11px] mt-0.5">
                    Puedes proponer un trazado alternativo para que los pilotos elijan entre ambas opciones antes de la rodada.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInteractiveProposeModal(true)}
                className="px-3.5 py-2 border border-earth/40 hover:bg-earth/10 text-earth font-bold uppercase text-[11px] tracking-wider shrink-0 transition"
              >
                + Proponer Alternativa
              </button>
            </div>
          )}

          {activeProposals.length === 0 && (
            <div className="p-8 border border-white/10 bg-[#0D0B0A] text-center space-y-3">
              <Compass className="w-8 h-8 text-ash mx-auto" />
              <p className="text-xs text-ash">Aún no hay opciones de ruta propuestas para esta fecha.</p>
              <button
                onClick={() => setShowInteractiveProposeModal(true)}
                className="px-4 py-2 bg-earth text-white font-bold uppercase text-xs"
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
      {/* 4. MODAL: DETALLE DE RUTA + VOTACIÓN + COMENTARIOS (AIRBNB STYLE)    */}
      {/* =================================================================== */}
      {selectedProposalForDetail && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border border-white/20 bg-[#0E0C0A] max-w-2xl w-full p-5 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto font-mono">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div>
                <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest block mb-1">
                  [ DETALLE DE RUTA PROPUESTA ]
                </span>
                <h3 className="font-display font-bold text-xl text-white uppercase">
                  {selectedProposalForDetail.title}
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Propuesta por {selectedProposalForDetail.proposedByName} para {selectedProposalForDetail.destination}
                </p>
              </div>
              <button
                onClick={() => setDetailProposalId(null)}
                className="text-ash hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tactical Topo Map & Quick Metrics in Detail Modal */}
            <div className="border border-white/10 overflow-hidden">
              <RouteTacticalMapCard
                proposal={selectedProposalForDetail}
                heightClass="h-52"
                showOverlayBadges={true}
              />
            </div>

            {/* Voting Bar in Detail Modal - Pure KISS */}
            <div className="bg-black/40 border border-white/10 p-3 sm:p-3.5 flex items-center justify-between gap-3 font-mono">
              <div className="flex items-center gap-3">
                <span className={`text-base font-bold font-mono ${
                  ((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) > 0
                    ? 'text-earth'
                    : ((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) < 0
                    ? 'text-rose-400'
                    : 'text-white'
                }`}>
                  {((selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)) > 0 
                    ? `+${(selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)}`
                    : (selectedProposalForDetail.votes?.length || 0) - (selectedProposalForDetail.downvotes?.length || 0)}
                </span>

                <div className="flex items-center gap-3 text-xs border-l border-white/10 pl-3">
                  <span className="text-emerald-400 flex items-center gap-1 font-bold" title="Votos a favor">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{selectedProposalForDetail.votes?.length || 0}</span>
                  </span>
                  <span className="text-rose-400 flex items-center gap-1 font-bold" title="Votos en contra">
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{selectedProposalForDetail.downvotes?.length || 0}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => voteRoute(selectedProposalForDetail.id)}
                  title="Votar a favor"
                  className={`p-2 sm:px-3 sm:py-2 border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                    selectedProposalForDetail.votes?.includes(currentUser.id)
                      ? 'bg-earth/20 border-earth text-earth'
                      : 'bg-white/[0.03] border-white/15 text-ash hover:text-white hover:border-white/30'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => downvoteRoute(selectedProposalForDetail.id)}
                  title="Votar en contra"
                  className={`p-2 sm:px-3 sm:py-2 border text-xs font-bold flex items-center justify-center transition cursor-pointer ${
                    selectedProposalForDetail.downvotes?.includes(currentUser.id)
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-white/[0.03] border-white/15 text-ash hover:text-white hover:border-white/30'
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
                    className="px-3 py-1.5 bg-earth hover:bg-earth-bright text-white text-xs font-bold uppercase tracking-wider border border-earth/30 transition"
                  >
                    Confirmar como Oficial
                  </button>
                )}
              </div>
            </div>

            {/* Description & Technical Itinerary */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] text-ash uppercase tracking-wider block font-bold">
                Descripción & Plan de Ruta
              </span>
              <p className="text-chalk leading-relaxed bg-white/[0.02] border border-white/[0.06] p-3">
                {selectedProposalForDetail.description}
              </p>
              {selectedProposalForDetail.itinerary && selectedProposalForDetail.itinerary[0] && (
                <div className="text-[11px] text-ash bg-white/[0.02] border border-white/[0.06] p-3 space-y-1">
                  <p><strong className="text-white">Terreno:</strong> {selectedProposalForDetail.itinerary[0].terrainType}</p>
                  <p><strong className="text-white">Itinerario:</strong> {selectedProposalForDetail.itinerary[0].description}</p>
                </div>
              )}
            </div>

            {/* Collaborative Comments Section (Airbnb style) */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-ash uppercase tracking-wider font-bold">
                  Comentarios del Grupo ({selectedProposalForDetail.comments?.length || 0})
                </span>
                <span className="text-[10px] text-ash">Notas breves sobre esta opción</span>
              </div>

              {/* Comments List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedProposalForDetail.comments && selectedProposalForDetail.comments.length > 0 ? (
                  selectedProposalForDetail.comments.map(c => (
                    <div key={c.id} className="p-2.5 bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-ash">
                        <span className="font-bold text-chalk">{c.userName}</span>
                        <span>{c.createdAt}</span>
                      </div>
                      <p className="text-chalk/90 leading-normal">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-ash/60 italic py-2">
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
                  className="flex-1 bg-white/[0.03] border border-white/15 px-3 py-2 text-xs text-white placeholder-ash/50 focus:outline-none focus:border-earth"
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={!commentInput.trim()}
                  className="px-3.5 py-2 bg-earth hover:bg-earth-bright disabled:opacity-40 text-white text-xs font-bold uppercase transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-white/10 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailProposalId(null)}
                className="px-4 py-2 border border-white/20 text-ash hover:text-white uppercase text-xs font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border border-white/20 bg-[#0E0C0A] max-w-lg w-full p-5 sm:p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto font-mono">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-earth uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <Bell className="w-3 h-3" />
                  [ PROPONER RUTA ALTERNATIVA ]
                </span>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  Alternativa para el {formatHumanDate(activeRodada.startDate, activeRodada.endDate, true)}
                </h3>
                <p className="text-[11px] text-ash mt-0.5">
                  Al enviar tu propuesta, se notificará a los celulares de los pilotos de la tribu para que voten entre las opciones.
                </p>
              </div>
              <button onClick={() => setShowProposeModal(false)} className="text-ash hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickProposeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-ash uppercase text-[10px] block mb-1">Título de la Ruta</label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="Ej. Brecha de los Volcanes & Paso de Cortés"
                  className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white placeholder-ash/50 focus:outline-none focus:border-earth"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Destino Principal</label>
                  <input
                    type="text"
                    required
                    value={propDestination}
                    onChange={(e) => setPropDestination(e.target.value)}
                    placeholder="Ej. Paso de Cortés"
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Estado</label>
                  <input
                    type="text"
                    value={propState}
                    onChange={(e) => setPropState(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Distancia Total (km)</label>
                  <input
                    type="number"
                    value={propKm}
                    onChange={(e) => setPropKm(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">% Terracería (Off-Road)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={propOffroad}
                    onChange={(e) => setPropOffroad(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Hora de Salida</label>
                  <input
                    type="text"
                    value={propMeetingTime}
                    onChange={(e) => setPropMeetingTime(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
                <div>
                  <label className="text-ash uppercase text-[10px] block mb-1">Punto de Encuentro</label>
                  <input
                    type="text"
                    value={propMeetingPoint}
                    onChange={(e) => setPropMeetingPoint(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                  />
                </div>
              </div>

              <div>
                <label className="text-ash uppercase text-[10px] block mb-1">Plan / Resumen de la Ruta</label>
                <textarea
                  rows={2}
                  value={propPlan}
                  onChange={(e) => setPropPlan(e.target.value)}
                  placeholder="Por qué propones esta ruta, tipo de motos y parada a comer..."
                  className="w-full bg-white/[0.03] border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-earth"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="w-1/2 py-2.5 border border-white/20 text-ash uppercase font-bold tracking-wider hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-earth hover:bg-earth-bright text-white font-bold uppercase tracking-wider transition border border-earth/30"
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="border border-white/20 bg-[#0E0C0A] max-w-lg w-full p-5 sm:p-6 space-y-5 my-auto max-h-[92vh] overflow-y-auto font-mono">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-3">
              <div>
                <span className="text-[10px] font-mono text-earth uppercase font-bold tracking-widest block mb-1">
                  [ AÑADIR O INVITAR PILOTOS ]
                </span>
                <h3 className="font-display font-bold text-lg text-white uppercase">
                  Añadir Piloto a {activeTribu.name}
                </h3>
                <p className="text-xs text-ash mt-0.5">
                  Los nuevos pilotos se reflejarán de inmediato en los posts y rodadas de la tribu.
                </p>
              </div>
              <button
                onClick={() => setShowAddPilotModal(false)}
                className="text-ash hover:text-white p-1"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invite code quick copy */}
            <div className="p-3 bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-ash uppercase block">Clave de Invitación de la Tribu</span>
                <span className="text-sm font-bold text-white tracking-wider font-mono">{activeTribu.inviteCode}</span>
              </div>
              <button
                onClick={() => handleCopyCode(activeTribu.inviteCode)}
                className="px-3 py-1.5 bg-earth/20 border border-earth/40 hover:bg-earth text-earth hover:text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Copiar Clave</span>
              </button>
            </div>

            {/* Available community riders */}
            <div className="space-y-3">
              <span className="text-[10px] text-earth uppercase font-bold tracking-wider block">
                Pilotos disponibles en MotoMami ({users.filter(u => !activeTribu.members.some(m => m.userId === u.id)).length})
              </span>

              {(() => {
                const available = users.filter(u => !activeTribu.members.some(m => m.userId === u.id));
                if (available.length === 0) {
                  return (
                    <div className="p-4 text-center border border-dashed border-white/10 text-xs text-ash">
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
                          className="p-2.5 bg-black/40 border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={u.avatar} 
                              alt={u.name} 
                              className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0" 
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white uppercase truncate">{u.name}</p>
                              <p className="text-[10px] text-ash truncate">
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
                            className="px-2.5 py-1.5 bg-earth hover:bg-earth-bright text-white text-[11px] font-bold uppercase transition flex items-center gap-1 shrink-0"
                          >
                            <UserPlus className="w-3 h-3" />
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
            <div className="border-t border-white/10 pt-4 flex justify-end">
              <button
                onClick={() => setShowAddPilotModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase transition"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR NOMBRE Y FOTO DEL GRUPO */}
      {showEditCrewModal && activeTribu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#141210] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-earth" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide">Editar Grupo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCrewModal(false)}
                className="text-ash hover:text-white transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre del Grupo */}
              <div>
                <label className="text-[11px] font-mono uppercase text-ash block mb-1.5 font-bold tracking-wider">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  value={editedCrewName}
                  onChange={(e) => setEditedCrewName(e.target.value)}
                  placeholder="Ej. MotoMami Adventure Crew"
                  className="w-full bg-black/60 border border-white/15 focus:border-white/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-ash/40 focus:outline-none transition font-sans"
                />
              </div>

              {/* Portada del Grupo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase text-ash font-bold tracking-wider">
                    Portada
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-ash hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg">
                    <Upload className="w-3 h-3 text-ash" />
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
                <div className="relative h-24 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  {editedCrewCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={editedCrewCover} 
                      alt="Portada de la tribu" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ash text-xs">
                      <Camera className="w-5 h-5 mr-2 text-ash/40" />
                      <span>Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Presets discretos */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono text-ash/60 shrink-0">Presets:</span>
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
                          className={`relative w-12 h-8 rounded-lg overflow-hidden border transition shrink-0 cursor-pointer ${
                            isSelected 
                              ? 'border-earth ring-1 ring-earth' 
                              : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
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

              {/* Vínculo de WhatsApp (Limpio, moderno, sin muros de texto) */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase text-ash font-bold flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>Chat de WhatsApp</span>
                    </label>
                    {editedCrewWhatsapp && (
                      <a
                        href={editedCrewWhatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#25D366] hover:underline font-mono"
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
                    className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-xs text-white placeholder-ash/40 focus:outline-none transition font-mono"
                  />
                  <span className="text-[10px] text-ash/60 mt-1 block">
                    Pega el enlace de invitación de tu grupo para que tus pilotos se unan con 1 toque.
                  </span>
                </div>

                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs text-white font-medium block">Link de NAO</span>
                    <span className="text-[10px] text-ash/70 block">Pégalo en la descripción de tu WhatsApp</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNaoLink}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3 h-3 text-ash" />
                    <span>{copiedNaoLink ? '✓ Copiado' : 'Copiar link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowEditCrewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-ash hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCrewDetails}
                disabled={!editedCrewName.trim()}
                className="px-4 py-2 rounded-xl bg-earth hover:bg-earth-bright disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
