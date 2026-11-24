'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  Motorcycle, 
  Crew, 
  CrewMember,
  Rodada, 
  RodadaStatus,
  RouteProposal, 
  PackingItem,
  RodadaAttendee,
  RouteList,
  NavTab,
  ActivityPost,
  ActivityComment,
  Challenge,
  CrewChatMessage,
  RsvpStatus,
  FollowRequest,
  AppNotification,
  FounderFeedback
} from '../types';
import { 
  CURRENT_USER, 
  INITIAL_USERS, 
  INITIAL_MOTORCYCLES, 
  INITIAL_CREWS, 
  INITIAL_RODADA, 
  INITIAL_RODADAS,
  INITIAL_ROUTE_PROPOSALS,
  INITIAL_ROUTE_LISTS,
  INITIAL_ACTIVITIES,
  INITIAL_CHALLENGES,
  INITIAL_CREW_MESSAGES
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { enqueueOfflineAction, getPendingSyncQueue, removeOfflineAction, setOfflineQueueOwner } from '../lib/offlineStorage';
import confetti from 'canvas-confetti';

// Sufijo único para IDs generados en el cliente. Antes era solo Date.now(): si dos pilotos
// guardaban en el mismo milisegundo, el segundo insert chocaba y, al reintentarse desde la cola
// offline con upsert, sobrescribía la ruta/actividad del otro.
const makeUniqueSuffix = () => {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rand}`;
};

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  motorcycles: Motorcycle[];
  userBikes: Motorcycle[];
  addMotorcycle: (bike: Omit<Motorcycle, 'id'>) => void;
  updateMotorcycle: (id: string, updates: Partial<Motorcycle>) => void;
  deleteMotorcycle: (id: string) => void;
  crews: Crew[];
  currentCrew: Crew | null;
  setCurrentCrew: (crew: Crew | null) => void;
  enterCrew: (crewId: string) => void;
  createCrew: (data: { name: string; tagline: string; description: string; baseCity: string; coverImage: string; whatsappGroupUrl?: string }) => Crew;
  updateCrew: (crewId: string, updates: Partial<Crew>) => void;
  deleteCrew: (crewId: string) => { success: boolean; message: string };
  leaveCrew: (crewId: string) => { success: boolean; message: string };
  addCrewMember: (crewId: string, userId: string, role?: CrewMember['role']) => void;
  joinCrewByCode: (code: string) => { success: boolean; message: string; crew?: Crew };
  rodadas: Rodada[];
  currentRodada: Rodada | null;
  setCurrentRodada: (rodada: Rodada | null) => void;
  enterRodada: (rodadaId: string) => void;
  createRodada: (data: { title: string; subtitle: string; description: string; category: Rodada['category']; startDate: string; endDate: string; originPoint: string }) => Rodada;
  updateRodada: (rodadaId: string, updates: Partial<Rodada>) => boolean;
  deleteRodada: (rodadaId: string) => boolean;
  routeProposals: RouteProposal[];
  currentRodadaRoutes: RouteProposal[];
  selectedRoute: RouteProposal | null;
  setSelectedRoute: (route: RouteProposal | null) => void;
  proposeRoute: (data: Omit<RouteProposal, 'id' | 'votes' | 'comments'>) => void;
  updateRouteProposal: (routeId: string, updates: Partial<RouteProposal>) => boolean;
  deleteRouteProposal: (routeId: string) => boolean;
  voteRoute: (routeId: string) => void;
  downvoteRoute: (routeId: string) => void;
  addRouteComment: (routeId: string, text: string) => void;
  lockWinningRoute: (rodadaId: string, routeId: string) => void;
  unlockWinningRoute: (rodadaId: string) => void;
  completeRodada: (rodadaId: string) => void;
  reopenRodada: (rodadaId: string) => void;
  archiveRouteProposal: (routeId: string) => void;
  unarchiveRouteProposal: (routeId: string) => void;
  rsvpRodada: (rodadaId: string, motorcycleId: string, status: RsvpStatus) => void;
  togglePackingItem: (rodadaId: string, itemId: string) => void;
  assignPackingItem: (rodadaId: string, itemId: string, userId: string, userName: string) => void;
  addPackingItem: (rodadaId: string, item: string, category: PackingItem['category']) => void;
  addGalleryPhoto: (rodadaId: string, url: string, caption: string) => void;
  // Moto Expeditions & GPS Architecture Extensions
  activities: ActivityPost[];
  deleteActivity: (activityId: string) => boolean;
  toggleKudo: (activityId: string) => void;
  addActivityComment: (activityId: string, text: string) => void;
  addRecordedActivity: (activity: Omit<ActivityPost, 'id' | 'kudosCount' | 'hasKudoed' | 'kudosAvatars' | 'commentsCount'>) => void;
  challenges: Challenge[];
  toggleJoinChallenge: (challengeId: string) => void;
  completedRouteIds: string[];
  savedRouteIds: string[];
  routeLists: RouteList[];
  toggleCompletedRoute: (routeId: string) => void;
  toggleSavedRoute: (routeId: string) => void;
  createRouteList: (name: string, description?: string) => void;
  addRouteToList: (listId: string, routeId: string) => void;
  removeRouteFromList: (listId: string, routeId: string) => void;
  saveActivityAsRoute: (activity: ActivityPost) => void;
  selectedPilotProfile: User | null;
  setSelectedPilotProfile: (pilot: User | null) => void;
  openPilotProfileById: (userId: string) => void;
  closePilotProfile: () => void;
  followingUserIds: string[];
  followersUserIds: string[];
  allFollows: { follower_id: string; following_id: string }[];
  getFollowersCountForUser: (userId: string) => number;
  getFollowingCountForUser: (userId: string) => number;
  toggleFollowUser: (userId: string) => void;
  followUser: (userId: string) => void;
  isFollowingUser: (userId: string) => boolean;
  followRequests: FollowRequest[];
  pendingFollowRequests: FollowRequest[];
  requestToFollowUser: (targetUserId: string) => void;
  acceptFollowRequest: (requestId: string) => void;
  rejectFollowRequest: (requestId: string) => void;
  isFollowRequested: (targetUserId: string) => boolean;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  createNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  activeNavTab: NavTab;
  setActiveNavTab: (tab: NavTab) => void;
  crewMessages: CrewChatMessage[];
  sendCrewMessage: (crewId: string, text: string) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isSupabaseOnline: boolean;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  switchCurrentUser: (userId: string) => void;
  signUp: (email: string, password: string, name: string, handle: string) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  isOnboardingOpen: boolean;
  setOnboardingOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  founderUserNumber: number | null;
  dismissFounderWelcome: () => void;
  currentUserFounderNumber: number | null;
  founderFeedbacks: FounderFeedback[];
  sendFounderFeedback: (category: 'sugerencia' | 'problema' | 'comentario' | 'idea', message: string) => Promise<{ success: boolean; message: string }>;
  markFeedbackStatus: (feedbackId: string, status: 'nuevo' | 'leido' | 'archivado') => void;
  deleteFeedback: (feedbackId: string) => void;
  checkHandleAvailability: (handle: string, excludeUserId?: string) => Promise<{ available: boolean; message?: string }>;
  updateCurrentUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUsers: () => Promise<void>;
}

// Filas de Supabase -> modelos de la app (se usan al hidratar y en los eventos en tiempo real)
const mapActivityRow = (a: any, currentUserId?: string): ActivityPost => {
  const kudosUsers: string[] = Array.isArray(a.group_info?.kudos_users) ? a.group_info.kudos_users : [];
  const kudosAvatars: string[] = Array.isArray(a.group_info?.kudos_avatars) ? a.group_info.kudos_avatars : [];
  const hasKudoed = currentUserId ? kudosUsers.includes(currentUserId) : false;

  return {
    id: a.id,
    pilotId: a.pilot_id,
    pilotName: a.pilot_name,
    pilotHandle: a.pilot_handle,
    pilotAvatar: a.pilot_avatar || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
    dateText: a.created_at ? new Date(a.created_at).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
    device: '',
    location: a.location || 'México',
    title: a.title,
    motoModel: a.moto_model || 'Trail',
    discipline: (a.discipline as any) || 'Trail / Aventura',
    distanceKm: Number(a.distance_km) || 0,
    elevationGainM: Number(a.elevation_gain_m) || 0,
    durationText: a.duration_formatted || '0h 00m',
    avgSpeedKmh: Number(a.avg_speed_kmh) || 0,
    trophiesCount: 0,
    kudosCount: kudosUsers.length,
    hasKudoed,
    kudosAvatars,
    commentsCount: 0,
    comments: [],
    coordinates: a.route_coordinates || [],
    waypoints: a.waypoints || a.group_info?.waypoints || [],
    gmapsUrl: a.gmaps_url || a.group_info?.gmaps_url || '',
    routeProposalId: a.route_proposal_id || a.group_info?.route_proposal_id || '',
    surfaceBreakdown: a.surface_breakdown || { asphaltPercentage: 50, dirtPercentage: 50, curveDensity: 'Media' },
    photos: a.photos || [],
    groupInfo: a.group_info
  };
};

const mapRouteRow = (p: any): RouteProposal => ({
  id: p.id,
  rodadaId: p.rodada_id,
  crewId: p.crew_id,
  isRecorded: p.is_recorded || false,
  title: p.title,
  destination: p.destination,
  state: p.state || 'México',
  proposedByUserId: p.proposed_by_user_id,
  proposedByName: p.proposed_by_name,
  proposedByAvatar: p.proposed_by_avatar || '',
  description: p.description || '',
  coverImage: p.cover_image || '',
  totalKm: Number(p.total_km) || 0,
  estimatedHours: p.estimated_hours || '',
  offroadPercentage: p.offroad_percentage || 50,
  asphaltPercentage: p.asphalt_percentage || 50,
  difficulty: p.difficulty || 'Intermedio',
  campsite: p.campsite || undefined,
  itinerary: p.itinerary || [],
  waypoints: p.waypoints || [],
  coordinates: p.coordinates || [],
  votes: p.votes || [],
  downvotes: p.downvotes || [],
  comments: p.comments || [],
  dayOfDeadVibe: p.day_of_dead_vibe,
  safetyTips: p.safety_tips || []
});

// IDs de tribus obsoletas o de demo que deben ser purgadas y nunca mostrarse
export const DEPRECATED_CREW_IDS = new Set(['crew-motomami', 'crew-1793386544112']);

// Validador universal de tribus obsoletas, huérfanas o con 0 miembros
export const isDeprecatedCrew = (c: any): boolean => {
  if (!c) return true;
  if (c.id === 'crew-motomami' || c.id === 'crew-1793386544112' || DEPRECATED_CREW_IDS.has(c.id)) return true;
  if (c.invite_code === 'NAO-2026' || c.inviteCode === 'NAO-2026') return true;
  const baseCity = (c.base_city || c.baseCity || '').toLowerCase();
  if (baseCity.includes('poniente') || baseCity.includes('monterrey')) return true;
  // Cualquier duplicado llamado Motomami que no sea el oficial de 6 pilotos (crew-1793316469201)
  const name = (c.name || '').toLowerCase().trim();
  if (name === 'motomami' && c.id !== 'crew-1793316469201') return true;
  const members = c.members || c.crew_members;
  if (Array.isArray(members)) {
    const validMembers = members.filter((m: any) => {
      const uid = m?.userId || m?.user_id;
      return uid && uid !== 'user-patricio';
    });
    if (validMembers.length === 0) return true;
  }
  return false;
};

// Mapeadores para motocicletas de Hangar (conversión robusta entre camelCase y snake_case)
const mapMotorcycleRow = (m: any): Motorcycle => ({
  id: String(m.id),
  userId: String(m.user_id),
  brand: m.brand || 'Moto',
  model: m.model || '',
  year: Number(m.year) || new Date().getFullYear(),
  displacementCc: Number(m.displacement_cc) || 500,
  type: (m.type as any) || 'Doble Propósito',
  nickname: m.nickname || '',
  photoUrl: m.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
  modifications: Array.isArray(m.modifications)
    ? m.modifications
    : (typeof m.modifications === 'string' ? m.modifications.split(',').map((x: string) => x.trim()).filter(Boolean) : []),
  tires: m.tires || 'Mixtas 70/30',
  isPrimary: Boolean(m.is_primary)
});

const mapMotorcycleToRow = (bike: Partial<Motorcycle> & { userId?: string }) => {
  const row: Record<string, any> = {};
  if (bike.brand !== undefined) row.brand = bike.brand.trim();
  if (bike.model !== undefined) row.model = bike.model.trim();
  if (bike.year !== undefined) row.year = Number(bike.year) || new Date().getFullYear();
  if (bike.displacementCc !== undefined) row.displacement_cc = Number(bike.displacementCc) || 500;
  if (bike.nickname !== undefined) row.nickname = bike.nickname ? bike.nickname.trim() : null;
  if (bike.photoUrl !== undefined && bike.photoUrl.trim()) row.image_url = bike.photoUrl.trim();
  if (bike.tires !== undefined) row.tires = bike.tires ? bike.tires.trim() : null;
  if (bike.isPrimary !== undefined) row.is_primary = Boolean(bike.isPrimary);
  if (bike.userId !== undefined) row.user_id = bike.userId;
  return row;
};

// Evita que dos vaciados de la cola corran a la vez (al volver la señal, al reenfocar, al
// cambiar de usuario) y suban la misma acción dos veces
let isFlushingSyncQueue = false;

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'motomami_current_user',
  MOTORCYCLES: 'motomami_motorcycles',
  CREWS: 'motomami_crews',
  RODADAS: 'motomami_rodadas_v3',
  ROUTES: 'motomami_routes_v3',
  ACTIVITIES: 'nao_activities_v2',
  CHALLENGES: 'nao_challenges',
  CREW_MESSAGES: 'motomami_crew_messages',
  CREW_COVERS: 'nao_crew_custom_covers',
  FOLLOW_REQUESTS: 'nao_follow_requests_v1',
  APP_NOTIFICATIONS: 'nao_app_notifications_v1',
  FOUNDER_FEEDBACK: 'nao_founder_feedback_v1',
  DELETED_CREWS: 'nao_deleted_crews_v1'
};

const GUEST_PILOT: User = {
  id: 'guest',
  name: 'Piloto Invitado',
  handle: '@invitado',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  bio: 'Inicia sesión para crear tu credencial oficial de piloto.',
  location: 'México',
  ridingLevel: 'Intermedio',
  completedRouteIds: [],
  savedRouteIds: [],
  stats: {
    totalKm: 0,
    completedCount: 0,
    elevationGain: 0
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(GUEST_PILOT);
  const currentUserRef = useRef<User>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Marca las acciones offline con el piloto que tiene la sesión (ver offlineStorage)
  useEffect(() => {
    setOfflineQueueOwner(currentUser.id);
  }, [currentUser.id]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(INITIAL_MOTORCYCLES);
  const [crews, setCrews] = useState<Crew[]>(INITIAL_CREWS);
  const [currentCrew, setCurrentCrew] = useState<Crew | null>(null);
  const [rodadas, setRodadas] = useState<Rodada[]>(INITIAL_RODADAS);
  const [currentRodada, setCurrentRodada] = useState<Rodada | null>(INITIAL_RODADAS[0]);
  const [routeProposals, setRouteProposals] = useState<RouteProposal[]>(INITIAL_ROUTE_PROPOSALS);
  const [selectedRoute, setSelectedRoute] = useState<RouteProposal | null>(INITIAL_ROUTE_PROPOSALS[0]);
  const [activeNavTab, setActiveNavTab] = useState<NavTab>('inicio');
  const [crewMessages, setCrewMessages] = useState<CrewChatMessage[]>(INITIAL_CREW_MESSAGES);

  // Auth & Cloud State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSupabaseOnline] = useState(isSupabaseConfigured());
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [founderUserNumber, setFounderUserNumber] = useState<number | null>(null);
  const [currentUserFounderNumber, setCurrentUserFounderNumber] = useState<number | null>(null);

  // Founder feedbacks store (local storage + cloud sync via realtime broadcast)
  const [founderFeedbacks, setFounderFeedbacks] = useState<FounderFeedback[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.FOUNDER_FEEDBACK);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const dismissFounderWelcome = () => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`nao_founder_welcome_shown_${currentUser.id}`, 'true');
      } catch {}
    }
    setFounderUserNumber(null);
  };

  // Helper to determine exact user position in registration order (<= 50 means founder)
  const calculateUserFounderNumber = async (userId: string): Promise<number | null> => {
    if (!userId || userId === 'guest') return null;
    try {
      if (isSupabaseConfigured()) {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, created_at')
          .order('created_at', { ascending: true });

        if (!error && profiles && profiles.length > 0) {
          const userIndex = profiles.findIndex((p: any) => p.id === userId);
          if (userIndex !== -1) {
            const realPosition = userIndex + 1;
            return realPosition <= 50 ? realPosition : null;
          }
        }
      }

      // Fallback local memory
      const localIndex = users.findIndex(u => u.id === userId);
      if (localIndex !== -1) {
        const pos = localIndex + 1;
        return pos <= 50 ? pos : null;
      }
    } catch (err) {
      console.warn('Error calculating founder number:', err);
    }
    return null;
  };

  // Helper to check if current user is within first 50 registered users and show popup once
  const checkAndTriggerFounderWelcome = async (userId: string) => {
    if (!userId || userId === 'guest') return;
    try {
      const founderNum = await calculateUserFounderNumber(userId);
      if (founderNum !== null) {
        setCurrentUserFounderNumber(founderNum);
        const alreadyShown = localStorage.getItem(`nao_founder_welcome_shown_${userId}`);
        if (alreadyShown !== 'true') {
          setFounderUserNumber(founderNum);
        }
      } else {
        setCurrentUserFounderNumber(null);
      }
    } catch (err) {
      console.warn('Error checking founder number:', err);
    }
  };

  // Send feedback from founder to admin
  const sendFounderFeedback = async (
    category: 'sugerencia' | 'problema' | 'comentario' | 'idea',
    message: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!message.trim()) {
      return { success: false, message: 'Por favor escribe un mensaje.' };
    }

    const newFeedback: FounderFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: currentUser.handle,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatar,
      founderNumber: currentUserFounderNumber || undefined,
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'nuevo'
    };

    setFounderFeedbacks(prev => {
      const updated = [newFeedback, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.FOUNDER_FEEDBACK, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Broadcast in realtime so Admin immediately sees the new message
    if (isSupabaseConfigured()) {
      try {
        supabase.channel('public:admin_channel').send({
          type: 'broadcast',
          event: 'new_founder_feedback',
          payload: newFeedback
        }).then(() => {}).catch(() => {});
      } catch {}
    }

    return { success: true, message: '¡Gracias! Tu mensaje fue enviado directamente a Patricio Martin.' };
  };

  const markFeedbackStatus = (feedbackId: string, status: 'nuevo' | 'leido' | 'archivado') => {
    setFounderFeedbacks(prev => {
      const updated = prev.map(f => f.id === feedbackId ? { ...f, status } : f);
      try {
        localStorage.setItem(STORAGE_KEYS.FOUNDER_FEEDBACK, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteFeedback = (feedbackId: string) => {
    setFounderFeedbacks(prev => {
      const updated = prev.filter(f => f.id !== feedbackId);
      try {
        localStorage.setItem(STORAGE_KEYS.FOUNDER_FEEDBACK, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const completeOnboarding = () => {
    setOnboardingOpen(false);
    try {
      if (currentUser.id) {
        localStorage.setItem(`nao_onboarding_done_${currentUser.id}`, 'true');
      }
      localStorage.setItem('nao_onboarding_done_global', 'true');
    } catch {}
    // If they haven't seen founder welcome and are top 50, trigger it
    if (currentUser.id && currentUser.id !== 'guest') {
      checkAndTriggerFounderWelcome(currentUser.id);
    }
  };

  const isAuthenticated = currentUser.id !== 'guest' && currentUser.id !== '';

  // Switch active pilot (for demo testing and profile changing)
  const switchCurrentUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
      } catch {}
    }
  };

  const loadSupabaseProfile = async (authUserId: string, fallbackEmail?: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (profile) {
        const mappedUser: User = {
          id: profile.id,
          name: profile.name || (fallbackEmail ? fallbackEmail.split('@')[0] : 'Piloto'),
          handle: profile.handle || `@${(fallbackEmail ? fallbackEmail.split('@')[0] : 'piloto')}`,
          email: profile.email || fallbackEmail || '',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: profile.bio || 'Piloto en NAO.',
          location: profile.location || 'México',
          ridingLevel: (profile.riding_level as any) || 'Intermedio',
          phone: profile.phone,
          emergencyContact: profile.emergency_contact
        };
        setCurrentUser(mappedUser);
        setUsers(prev => {
          if (prev.some(u => u.id === mappedUser.id)) {
            return prev.map(u => u.id === mappedUser.id ? mappedUser : u);
          }
          return [mappedUser, ...prev];
        });
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mappedUser));
          localStorage.setItem(`nao_onboarding_done_${mappedUser.id}`, 'true');
        } catch {}
        setOnboardingOpen(false);
        // Trigger founder popup if user is in top 50 and hasn't seen it yet
        checkAndTriggerFounderWelcome(mappedUser.id);
      } else if (fallbackEmail) {
        // Create initial profile for OAuth or first-time user
        const newName = fallbackEmail.split('@')[0];
        const newHandle = `@${newName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const newAvatar = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250';
        
        await supabase.from('profiles').insert({
          id: authUserId,
          name: newName,
          handle: newHandle,
          email: fallbackEmail,
          avatar_url: newAvatar,
          bio: 'Piloto en NAO.',
          location: 'México',
          riding_level: 'Intermedio'
        });

        const mappedUser: User = {
          id: authUserId,
          name: newName,
          handle: newHandle,
          email: fallbackEmail,
          avatar: newAvatar,
          bio: 'Piloto en NAO.',
          location: 'México',
          ridingLevel: 'Intermedio'
        };
        setCurrentUser(mappedUser);
        setUsers(prev => [mappedUser, ...prev]);
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(mappedUser));
        } catch {}

        // For newly created user, open onboarding
        try {
          const done = localStorage.getItem(`nao_onboarding_done_${authUserId}`);
          if (!done) {
            setOnboardingOpen(true);
          }
        } catch {
          setOnboardingOpen(true);
        }
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  // Check if handle is already taken by another pilot
  const checkHandleAvailability = async (rawHandle: string, excludeUserId?: string): Promise<{ available: boolean; message?: string }> => {
    const cleanHandle = rawHandle.trim().toLowerCase().replace(/^@/, '');
    if (!cleanHandle) {
      return { available: false, message: 'El apodo o usuario no puede estar vacío.' };
    }
    if (cleanHandle.length < 3) {
      return { available: false, message: 'El apodo debe tener al menos 3 caracteres.' };
    }
    if (!/^[a-z0-9_.]+$/.test(cleanHandle)) {
      return { available: false, message: 'El apodo solo puede contener letras, números, puntos y guiones bajos.' };
    }

    const formattedHandle = `@${cleanHandle}`;

    // 1. Check in local memory/cache
    const foundInLocal = users.find(u => {
      if (excludeUserId && u.id === excludeUserId) return false;
      const uHandle = (u.handle || '').toLowerCase().trim();
      return uHandle === formattedHandle || uHandle.replace(/^@/, '') === cleanHandle;
    });

    if (foundInLocal) {
      return { available: false, message: `El apodo ${formattedHandle} ya está en uso por otro piloto.` };
    }

    // 2. Check in Supabase cloud profiles
    if (isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('profiles')
          .select('id, handle')
          .or(`handle.ilike.${formattedHandle},handle.ilike.@${cleanHandle},handle.ilike.${cleanHandle}`);

        if (excludeUserId) {
          query = query.neq('id', excludeUserId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return { available: false, message: `El apodo ${formattedHandle} ya está registrado. Elige uno diferente.` };
        }
      } catch (err) {
        console.warn('Error checking handle availability in cloud:', err);
      }
    }

    return { available: true };
  };

  // Sign Up with Supabase / Local Fallback
  const signUp = async (email: string, password: string, name: string, handle: string): Promise<{ success: boolean; message: string }> => {
    // Check handle availability first
    const handleCheck = await checkHandleAvailability(handle);
    if (!handleCheck.available) {
      return { success: false, message: handleCheck.message || 'Este apodo ya está en uso.' };
    }

    if (isSupabaseConfigured()) {
      const cleanHandle = handle.trim().toLowerCase().replace(/^@/, '');
      const formattedHandle = `@${cleanHandle}`;
      const defaultAvatar = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250';
      const redirectUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nao-club-three.vercel.app';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            handle: formattedHandle,
            avatar_url: defaultAvatar
          }
        }
      });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        // Also insert profile directly to profiles table
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name,
            handle: formattedHandle,
            email,
            avatar_url: defaultAvatar,
            bio: 'Piloto en NAO.',
            location: 'México',
            riding_level: 'Intermedio'
          });
        } catch {}

        const newPilot: User = {
          id: data.user.id,
          name,
          handle: formattedHandle,
          email,
          avatar: defaultAvatar,
          bio: 'Piloto en NAO.',
          location: 'México',
          ridingLevel: 'Intermedio'
        };
        setCurrentUser(newPilot);
        setUsers(prev => [newPilot, ...prev]);
        setOnboardingOpen(true);
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newPilot));
        } catch {}
        return { success: true, message: '¡Cuenta creada con éxito! Bienvenido a NAO.' };
      }
    }

    // Local / Demo registration
    const newPilot: User = {
      id: `user-${makeUniqueSuffix()}`,
      name,
      handle,
      email,
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
      bio: 'Piloto registrado en NAO.',
      location: 'México',
      ridingLevel: 'Intermedio'
    };
    setCurrentUser(newPilot);
    setUsers(prev => [newPilot, ...prev]);
    setOnboardingOpen(true);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newPilot));
    } catch {}
    return { success: true, message: '¡Cuenta creada con éxito en modo local!' };
  };

  // Sign In with Supabase / Local Fallback
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        await loadSupabaseProfile(data.user.id, data.user.email);
        return { success: true, message: '¡Sesión iniciada con éxito!' };
      }
    }

    // Local / Demo login
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
      } catch {}
      return { success: true, message: `¡Bienvenido de vuelta, ${found.name}!` };
    } else {
      const loggedPilot: User = {
        id: `user-${makeUniqueSuffix()}`,
        name: email.split('@')[0],
        handle: `@${email.split('@')[0]}`,
        email,
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
        bio: 'Piloto en NAO.',
        location: 'México',
        ridingLevel: 'Intermedio'
      };
      setCurrentUser(loggedPilot);
      setUsers(prev => [loggedPilot, ...prev]);
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(loggedPilot));
      } catch {}
      return { success: true, message: '¡Sesión iniciada!' };
    }
  };

  // Sign In with Google OAuth (preserves target pilot query / storage across redirect)
  const signInWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured()) {
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const p = urlParams.get('piloto') || urlParams.get('pilot') || localStorage.getItem('nao_target_pilot') || sessionStorage.getItem('nao_target_pilot');
          if (p) {
            localStorage.setItem('nao_target_pilot', p);
            localStorage.setItem('nao_pending_follow', 'true');
            sessionStorage.setItem('nao_target_pilot', p);
            sessionStorage.setItem('nao_pending_follow', 'true');
            try {
              document.cookie = `nao_target_pilot=${encodeURIComponent(p)}; path=/; max-age=86400; SameSite=Lax`;
            } catch {}
          }
        }

        const redirectUrl = typeof window !== 'undefined' 
          ? window.location.href 
          : 'https://nao-club-three.vercel.app';

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, message: 'Redirigiendo a Google...' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Error al conectar con Google' };
      }
    }
    return { success: false, message: 'Supabase no está configurado para OAuth.' };
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setCurrentUser(GUEST_PILOT);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
  };

  // Update Current User Profile
  const updateCurrentUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    // If handle is being updated, verify uniqueness
    if (updates.handle && updates.handle !== currentUser.handle) {
      const check = await checkHandleAvailability(updates.handle, currentUser.id);
      if (!check.available) {
        return { success: false, message: check.message || 'El apodo elegido ya está en uso por otro piloto.' };
      }
    }

    const updated: User = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured() && currentUser.id) {
      try {
        const { error } = await supabase.from('profiles').update({
          name: updated.name,
          handle: updated.handle,
          bio: updated.bio,
          location: updated.location,
          riding_level: updated.ridingLevel,
          phone: updated.phone,
          emergency_contact: updated.emergencyContact,
          avatar_url: updated.avatar
        }).eq('id', currentUser.id);

        if (error) {
          console.error('Error updating Supabase profile:', error);
          if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
            return { success: false, message: 'Este apodo ya está registrado en el club. Elige uno diferente.' };
          }
        }
      } catch (err: any) {
        console.error('Error updating Supabase profile:', err);
        return { success: false, message: err?.message || 'Error al guardar en el servidor' };
      }
    }

    return { success: true };
  };

  const refreshUsers = async (): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const mappedUsers: User[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          handle: p.handle,
          email: p.email,
          avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: p.bio || 'Piloto en NAO.',
          location: p.location || 'México',
          ridingLevel: (p.riding_level as any) || 'Intermedio',
          phone: p.phone,
          emergencyContact: p.emergency_contact,
          createdAt: p.created_at
        }));
        setUsers(prev => {
          const cloudIds = new Set(mappedUsers.map(u => u.id));
          return [
            ...mappedUsers,
            ...prev.filter(u => !cloudIds.has(u.id) && u.id !== 'user-patricio' && u.handle !== '@patomartin')
          ];
        });
      }
    } catch (err) {
      console.warn('Error refreshing users from cloud:', err);
    }
  };

  // Moto Expeditions & Social state
  const [activities, setActivities] = useState<ActivityPost[]>(INITIAL_ACTIVITIES);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [completedRouteIds, setCompletedRouteIds] = useState<string[]>(CURRENT_USER.completedRouteIds || ['route-1', 'route-4']);
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>(CURRENT_USER.savedRouteIds || ['route-2', 'route-3', 'route-5']);
  const [routeLists, setRouteLists] = useState<RouteList[]>(INITIAL_ROUTE_LISTS);
  const [selectedPilotProfile, setSelectedPilotProfile] = useState<User | null>(null);
  const [followingUserIds, setFollowingUserIds] = useState<string[]>([]);
  const [followersUserIds, setFollowersUserIds] = useState<string[]>([]);
  const [allFollows, setAllFollows] = useState<{ follower_id: string; following_id: string }[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.APP_NOTIFICATIONS);
      if (savedNotifications) {
        try {
          const parsedNotifs: AppNotification[] = JSON.parse(savedNotifications);
          setNotifications(parsedNotifs);
        } catch {}
      }

      const savedFollowing = localStorage.getItem('nao_following_users');
      if (savedFollowing) {
        const parsed: string[] = JSON.parse(savedFollowing);
        // Clean out legacy mock IDs
        const cleaned = parsed.filter(id => id !== 'user-manuel' && id !== 'user-mich');
        setFollowingUserIds(cleaned);
      }

      const savedFollowers = localStorage.getItem('nao_followers_users');
      if (savedFollowers) {
        const parsed: string[] = JSON.parse(savedFollowers);
        // Clean out legacy mock IDs
        const cleaned = parsed.filter(id => id !== 'user-manuel' && id !== 'user-mich');
        setFollowersUserIds(cleaned);
      }

      const savedRequests = localStorage.getItem(STORAGE_KEYS.FOLLOW_REQUESTS);
      if (savedRequests) {
        const parsedReqs: FollowRequest[] = JSON.parse(savedRequests);
        // Clean out legacy dummy requests
        const cleanedReqs = parsedReqs.filter(r => r.id !== 'req-mock-1' && r.fromUserId !== 'user-manuel');
        setFollowRequests(cleanedReqs);
      } else {
        setFollowRequests([]);
      }

      const savedMotos = localStorage.getItem(STORAGE_KEYS.MOTORCYCLES);
      if (savedMotos) {
        try {
          const parsedMotos: Motorcycle[] = JSON.parse(savedMotos);
          // Filter out legacy dummy bikes (moto-1, moto-2)
          const cleanMotos = parsedMotos.filter(m => m.id !== 'moto-1' && m.id !== 'moto-2');
          setMotorcycles(cleanMotos);
        } catch {}
      }

      const savedCrews = localStorage.getItem(STORAGE_KEYS.CREWS);
      if (savedCrews) {
        let customCovers: Record<string, string> = {};
        try {
          const savedCustomCovers = localStorage.getItem(STORAGE_KEYS.CREW_COVERS);
          if (savedCustomCovers) customCovers = JSON.parse(savedCustomCovers);
        } catch {}

        let parsed: Crew[] = JSON.parse(savedCrews);
        // Purgar inmediatamente IDs obsoletos de demo
        parsed = parsed.filter(c => !isDeprecatedCrew(c));
        parsed = parsed.map(c => {
          const coverOverride = customCovers[c.id];
          const sanitizedMembers = (Array.isArray(c.members) ? c.members : []).filter(m => m.userId !== 'user-patricio');
          if (c.id === 'crew-sierrabrava') {
            const currentMembers = [...sanitizedMembers];
            if (INITIAL_CREWS[1]?.members) {
              INITIAL_CREWS[1].members.forEach(initM => {
                if (!currentMembers.some(m => m.userId === initM.userId)) {
                  currentMembers.push(initM);
                }
              });
            }
            // Remover cualquier link falso/dummy de Sierra Brava
            const isDummyLink = !c.whatsappGroupUrl || 
              c.whatsappGroupUrl.includes('SierraBravaDualSport') || 
              c.whatsappGroupUrl.includes('Jg1AKUEqoXF7nXZuAPJ588');
            return {
              ...c,
              coverImage: coverOverride || c.coverImage,
              members: currentMembers,
              whatsappGroupUrl: isDummyLink ? undefined : c.whatsappGroupUrl
            };
          }
          return {
            ...c,
            coverImage: coverOverride || c.coverImage,
            members: sanitizedMembers
          };
        });

        // Filtrar tribus eliminadas (tombstones)
        let deletedCrewIds: string[] = [];
        try {
          const savedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_CREWS);
          if (savedDeleted) deletedCrewIds = JSON.parse(savedDeleted);
        } catch {}
        // Asegurar que las tribus obsoletas queden registradas permanentemente como eliminadas
        DEPRECATED_CREW_IDS.forEach(depId => {
          if (!deletedCrewIds.includes(depId)) deletedCrewIds.push(depId);
        });
        try {
          localStorage.setItem(STORAGE_KEYS.DELETED_CREWS, JSON.stringify(deletedCrewIds));
        } catch {}
        const deletedSet = new Set(deletedCrewIds);

        // Remove duplicates by ID and by Normalized Name/Slug, excluyendo eliminados
        const seenNames = new Set<string>();
        const uniqueCrews: Crew[] = [];
        for (const c of parsed) {
          if (deletedSet.has(c.id) || isDeprecatedCrew(c)) continue;
          const normKey = (c.slug || c.name.toLowerCase().trim().replace(/\s+/g, '-'));
          if (!seenNames.has(normKey)) {
            seenNames.add(normKey);
            uniqueCrews.push(c);
          }
        }
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(uniqueCrews));
        setCrews(uniqueCrews);
        // Las tribus son privadas: únicamente seleccionar si el usuario actual es creador o miembro
        const savedUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        let activeUid = CURRENT_USER.id;
        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            if (parsedUser?.id) activeUid = parsedUser.id;
          } catch {}
        }
        const myCrew = parsed.find(c => c.creatorId === activeUid || c.members.some(m => m.userId === activeUid));
        if (myCrew) {
          setCurrentCrew(myCrew);
        } else {
          setCurrentCrew(null);
        }
      }

      const savedActivities = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (savedActivities) {
        try {
          const parsedActs = JSON.parse(savedActivities);
          if (Array.isArray(parsedActs) && parsedActs.length > 0) {
            setActivities(parsedActs);
          }
        } catch {}
      }

      const savedRodadas = localStorage.getItem(STORAGE_KEYS.RODADAS);
      if (savedRodadas) {
        try {
          const parsed: Rodada[] = JSON.parse(savedRodadas);
          if (Array.isArray(parsed)) {
            // 1. Deduplicar por id
            const seenIds = new Set<string>();
            const uniqueRodadas = parsed.filter(rd => {
              if (seenIds.has(rd.id)) return false;
              seenIds.add(rd.id);
              return true;
            });

            // 2. Regla de Oro: Máximo 1 rodada confirmada activa a la vez
            let foundConfirmed = false;
            const sanitizedRodadas = uniqueRodadas.map(rd => {
              if (rd.status === 'fijada') {
                if (!foundConfirmed) {
                  foundConfirmed = true;
                  return rd;
                } else {
                  // Si ya había otra confirmada, esta vuelve a votación
                  return { ...rd, winningRouteId: undefined, status: 'votacion' as RodadaStatus };
                }
              }
              return rd;
            });

            setRodadas(sanitizedRodadas);
            if (sanitizedRodadas.length > 0) setCurrentRodada(sanitizedRodadas[0]);
          }
        } catch {}
      }

      const savedRoutes = localStorage.getItem(STORAGE_KEYS.ROUTES);
      if (savedRoutes) {
        const parsed = JSON.parse(savedRoutes);
        setRouteProposals(parsed);
        if (parsed.length > 0) setSelectedRoute(parsed[0]);
      }

      const savedMessages = localStorage.getItem(STORAGE_KEYS.CREW_MESSAGES);
      if (savedMessages) {
        try {
          const parsedMsgs = JSON.parse(savedMessages);
          if (Array.isArray(parsedMsgs) && parsedMsgs.length > 0) {
            setCrewMessages(parsedMsgs);
          }
        } catch {}
      }

      // End of local storage initial hydration
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Supabase Cloud Hydration & Realtime Session
  useEffect(() => {
    // Check saved user in localStorage first
    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed && parsed.id && parsed.id !== 'guest') {
          setCurrentUser(parsed);
          calculateUserFounderNumber(parsed.id).then(num => {
            if (num !== null) setCurrentUserFounderNumber(num);
          });
        }
      }
    } catch {}

    if (!isSupabaseConfigured()) {
      setIsAuthLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadSupabaseProfile(session.user.id, session.user.email);
      }
      setIsAuthLoading(false);
    }).catch(() => {
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadSupabaseProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(GUEST_PILOT);
        try {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        } catch {}
      }
    });

    // Hydrate profiles from cloud
    supabase.from('profiles').select('*').limit(200).then(({ data }) => {
      if (data && data.length > 0) {
        const mappedUsers: User[] = data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Piloto NAO',
          handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
          email: p.email || '',
          avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: p.bio || 'Piloto en NAO.',
          location: p.location || 'México',
          ridingLevel: (p.riding_level as any) || 'Intermedio',
          phone: p.phone,
          emergencyContact: p.emergency_contact,
          createdAt: p.created_at
        }));
        setUsers(prev => {
          const cloudIds = new Set(mappedUsers.map(u => u.id));
          return [
            ...mappedUsers,
            ...prev.filter(u => !cloudIds.has(u.id) && u.id !== 'user-patricio' && u.handle !== '@patomartin')
          ];
        });
      }
    });

    // Hydrate crews from cloud
    supabase.from('crews').select('*, crew_members(*)').then(({ data }) => {
      if (data && data.length > 0) {
        const cleanCloudData = data.filter((c: any) => !isDeprecatedCrew(c));
        const mappedCrews: Crew[] = cleanCloudData.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          tagline: c.tagline || '',
          description: c.description || '',
          inviteCode: c.invite_code,
          coverImage: c.cover_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
          baseCity: c.base_city || 'México',
          creatorId: c.creator_id || '',
          members: (c.crew_members || [])
            .filter((m: any) => m.user_id !== 'user-patricio')
            .map((m: any) => ({
              userId: m.user_id,
              role: m.role || 'Rider',
              joinedAt: m.joined_at?.split('T')[0] || ''
            })),
          whatsappGroupUrl: c.whatsapp_group_url,
          createdAt: c.created_at?.split('T')[0] || ''
        })).filter(c => !isDeprecatedCrew(c));
        setCrews(prev => {
          let customCovers: Record<string, string> = {};
          try {
            const savedCustomCovers = localStorage.getItem(STORAGE_KEYS.CREW_COVERS);
            if (savedCustomCovers) customCovers = JSON.parse(savedCustomCovers);
          } catch {}

          const mergedMapped = mappedCrews.map(cr => ({
            ...cr,
            coverImage: customCovers[cr.id] || cr.coverImage
          }));

          let deletedCrewIds: string[] = [];
          try {
            const savedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_CREWS);
            if (savedDeleted) deletedCrewIds = JSON.parse(savedDeleted);
          } catch {}
          DEPRECATED_CREW_IDS.forEach(depId => {
            if (!deletedCrewIds.includes(depId)) deletedCrewIds.push(depId);
          });
          const deletedSet = new Set(deletedCrewIds);

          const cloudIds = new Set(mergedMapped.map(cr => cr.id));
          const allCrews = [...mergedMapped, ...prev.filter(cr => !cloudIds.has(cr.id) && !isDeprecatedCrew(cr))];

          const seenNames = new Set<string>();
          const finalCrews: Crew[] = [];
          for (const c of allCrews) {
            if (deletedSet.has(c.id) || isDeprecatedCrew(c)) continue;
            const normKey = (c.slug || c.name.toLowerCase().trim().replace(/\s+/g, '-'));
            if (!seenNames.has(normKey)) {
              seenNames.add(normKey);
              finalCrews.push(c);
            }
          }

          // Sincronizar currentCrew si ya estaba seleccionado y pertenece a él
          setCurrentCrew(curr => {
            if (!curr || isDeprecatedCrew(curr)) {
              return finalCrews[0] || null;
            }
            const updatedCurr = finalCrews.find(c => c.id === curr.id);
            return updatedCurr || finalCrews[0] || null;
          });

          return finalCrews;
        });
      }
    });

    // Hydrate follows from cloud and sync community connections
    const effectiveCurrentId = currentUser.id === 'user-patricio' 
      ? 'a1bac354-0a88-486c-9289-049e75c61c12' 
      : currentUser.id;

    if (effectiveCurrentId && effectiveCurrentId !== 'guest') {
      supabase
        .from('follows')
        .select('*')
        .limit(200)
        .then(async ({ data: followsData }) => {
          if (followsData) {
            setAllFollows(prev => {
              const map = new Map(prev.map(f => [`${f.follower_id}_${f.following_id}`, f]));
              followsData.forEach((f: any) => map.set(`${f.follower_id}_${f.following_id}`, { follower_id: f.follower_id, following_id: f.following_id }));
              return Array.from(map.values());
            });

            const cloudFollowing = followsData
              .filter((f: any) => f.follower_id === effectiveCurrentId || f.follower_id === currentUser.id)
              .map((f: any) => f.following_id);
            setFollowingUserIds(prev => Array.from(new Set([...prev, ...cloudFollowing])));

            const cloudFollowers = followsData
              .filter((f: any) => f.following_id === effectiveCurrentId || f.following_id === currentUser.id)
              .map((f: any) => f.follower_id);
            setFollowersUserIds(cloudFollowers);

            // Asegurar que los perfiles de seguidores y seguidos estén en users para avatares y nombres
            const relatedUserIds = Array.from(new Set([...cloudFollowing, ...cloudFollowers]));
            if (relatedUserIds.length > 0) {
              const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .in('id', relatedUserIds.slice(0, 50));
              if (profilesData && profilesData.length > 0) {
                const mappedRelated: User[] = profilesData.map((p: any) => ({
                  id: p.id,
                  name: p.name || 'Piloto NAO',
                  handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
                  email: p.email || '',
                  avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
                  bio: p.bio || 'Piloto en NAO.',
                  location: p.location || 'México',
                  ridingLevel: (p.riding_level as any) || 'Intermedio',
                  phone: p.phone,
                  emergencyContact: p.emergency_contact
                }));
                setUsers(prev => {
                  const map = new Map(prev.map(u => [u.id, u]));
                  mappedRelated.forEach(u => map.set(u.id, u));
                  return Array.from(map.values());
                });
              }
            }
          }
        });
    }

    // Hydrate motorcycles from cloud (carga motos del piloto actual + recientes)
    const motoQuery = (currentUser.id && currentUser.id !== 'guest')
      ? supabase.from('motorcycles').select('*').or(`user_id.eq.${currentUser.id},is_primary.eq.true`).limit(50)
      : supabase.from('motorcycles').select('*').limit(50);

    motoQuery.then(({ data }) => {
      if (data && data.length > 0) {
        const mappedMotos: Motorcycle[] = data.map((m: any) => mapMotorcycleRow(m));
        setMotorcycles(prev => {
          // Merge inteligente: nunca sobreescribir una foto local personalizada con un placeholder si el usuario actual ya tiene foto
          const cloudMap = new Map(mappedMotos.map(b => [b.id, b]));
          const merged = prev.map(localBike => {
            const cloudBike = cloudMap.get(localBike.id);
            if (cloudBike) {
              cloudMap.delete(localBike.id);
              const hasCustomLocalPhoto = localBike.photoUrl && !localBike.photoUrl.includes('images.unsplash.com');
              return {
                ...cloudBike,
                photoUrl: hasCustomLocalPhoto ? localBike.photoUrl : (cloudBike.photoUrl || localBike.photoUrl)
              };
            }
            return localBike;
          });
          return [...merged, ...Array.from(cloudMap.values())];
        });
      }
    });

    // Hydrate activities (publicaciones reales) from cloud - top 50 más recientes
    supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data && data.length > 0) {
        const mappedActs: ActivityPost[] = data.map(row => mapActivityRow(row, currentUser.id));
        setActivities(mappedActs);
      }
    });

    // Hydrate rodadas from cloud - top 30
    supabase.from('rodadas').select('*').order('created_at', { ascending: false }).limit(30).then(({ data: cloudRodadas, error }) => {
      if (!error && cloudRodadas && cloudRodadas.length > 0) {
        const mappedR: Rodada[] = cloudRodadas.map((r: any) => ({
          id: r.id,
          crewId: r.crew_id,
          title: r.title,
          subtitle: r.subtitle || '',
          description: r.description || '',
          category: r.category || 'Fin de Semana',
          startDate: r.start_date,
          endDate: r.end_date,
          originPoint: r.origin_point || 'CDMX',
          status: (r.status as RodadaStatus) || 'votacion',
          winningRouteId: r.winning_route_id || undefined,
          attendees: [],
          packingList: [],
          gallery: [],
          createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setRodadas(mappedR);
        if (mappedR.length > 0) setCurrentRodada(mappedR[0]);
      }
    });

    // Hydrate route_proposals from cloud
    supabase.from('route_proposals').select('*').order('created_at', { ascending: false }).then(({ data: cloudProposals, error }) => {
      if (!error && cloudProposals && cloudProposals.length > 0) {
        const mappedP: RouteProposal[] = cloudProposals.map(mapRouteRow);
        setRouteProposals(mappedP);
        if (mappedP.length > 0) setSelectedRoute(mappedP[0]);
      }
    });

    // Background outbox sync: procesar acciones pendientes cuando hay red
    const flushSyncQueue = async () => {
      if (typeof window === 'undefined' || !navigator.onLine) return;
      // Solo con sesión real, y solo las acciones de este piloto
      if (!currentUser.id || currentUser.id === 'guest') return;
      if (isFlushingSyncQueue) return;
      isFlushingSyncQueue = true;
      try {
        const pending = await getPendingSyncQueue(currentUser.id);
        if (!pending || pending.length === 0) return;
        for (const item of pending) {
          try {
            if (item.action === 'publish_activity') {
              const { error } = await supabase.from('activities').upsert(item.payload);
              if (!error) {
                await removeOfflineAction(item.id);
                // Si al recargar la hidratación de la nube llegó antes que esta subida, re-mostrarla
                const synced = mapActivityRow(item.payload);
                setActivities(prev => prev.some(a => a.id === synced.id) ? prev : [synced, ...prev]);
              }
            } else if (item.action === 'create_route_proposal') {
              const { error } = await supabase.from('route_proposals').upsert(item.payload);
              if (!error) {
                await removeOfflineAction(item.id);
                const synced = mapRouteRow(item.payload);
                setRouteProposals(prev => prev.some(r => r.id === synced.id) ? prev : [synced, ...prev]);
              }
            } else if (item.action === 'delete_route_proposal') {
              const { error } = await supabase.from('route_proposals').delete().eq('id', item.payload.id);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'create_rodada') {
              const { error } = await supabase.from('rodadas').upsert(item.payload);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'delete_rodada') {
              const { error } = await supabase.from('rodadas').delete().eq('id', item.payload.id);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'join_crew') {
              const { error } = await supabase.from('crew_members').upsert(item.payload);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'follow_user') {
              const { error } = await supabase.from('follows').upsert(item.payload, { onConflict: 'follower_id,following_id', ignoreDuplicates: true });
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'unfollow_user') {
              const { error } = await supabase.from('follows').delete().match(item.payload);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'vote_route') {
              // Formato nuevo: { id, vote }. Formato viejo traía las listas completas, que al
              // reescribirse borraban votos ajenos: de ahí solo se rescata el voto de este piloto.
              let vote: 'up' | 'down' | 'none' = item.payload.vote;
              if (!vote) {
                const voterId = item.userId || currentUser.id;
                vote = (item.payload.votes || []).includes(voterId) ? 'up'
                  : (item.payload.downvotes || []).includes(voterId) ? 'down' : 'none';
              }
              const { error } = await supabase.rpc('set_route_vote', { p_route_id: item.payload.id, p_vote: vote });
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'lock_winning_route') {
              const { error } = await supabase.from('rodadas').update({ winning_route_id: item.payload.routeId, status: 'fijada' }).eq('id', item.payload.rodadaId);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'unlock_winning_route') {
              const { error } = await supabase.from('rodadas').update({ winning_route_id: null, status: 'votacion' }).eq('id', item.payload.rodadaId);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'complete_rodada') {
              const { error } = await supabase.from('rodadas').update({ status: 'completada' }).eq('id', item.payload.rodadaId);
              if (!error) {
                await supabase.from('route_proposals').update({ is_recorded: true }).eq('rodada_id', item.payload.rodadaId);
                await removeOfflineAction(item.id);
              }
            } else if (item.action === 'reopen_rodada') {
              const { error } = await supabase.from('rodadas').update({ status: 'votacion' }).eq('id', item.payload.rodadaId);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'archive_route') {
              const { error } = await supabase.from('route_proposals').update({ is_recorded: true }).eq('id', item.payload.routeId);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'unarchive_route') {
              const { error } = await supabase.from('route_proposals').update({ is_recorded: false }).eq('id', item.payload.routeId);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'add_motorcycle') {
              const { error } = await supabase.from('motorcycles').upsert(item.payload);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'update_motorcycle') {
              const { error } = await supabase.from('motorcycles').update(item.payload.payload).eq('id', item.payload.id);
              if (!error) await removeOfflineAction(item.id);
            } else if (item.action === 'delete_motorcycle') {
              const { error } = await supabase.from('motorcycles').delete().eq('id', item.payload.id);
              if (!error) await removeOfflineAction(item.id);
            }
          } catch (e) {
            console.warn('[SyncQueue] Error flushing item:', item.id, e);
          }
        }
      } catch (err) {
        console.warn('[SyncQueue] Error reading queue:', err);
      } finally {
        isFlushingSyncQueue = false;
      }
    };

    flushSyncQueue();
    window.addEventListener('online', flushSyncQueue);

    // Tiempo real: rutas grabadas y actividades que publican otros pilotos aparecen sin recargar
    // (requiere que activities y route_proposals estén en la publicación supabase_realtime)
    const ridesChannel = supabase
      .channel('public:rides_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const act = mapActivityRow(payload.new, currentUserRef.current?.id);
            setActivities(prev => prev.some(a => a.id === act.id) ? prev : [act, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const act = mapActivityRow(payload.new, currentUserRef.current?.id);
            setActivities(prev => prev.map(a => a.id === act.id ? { ...a, ...act } : a));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = (payload.old as any).id;
            if (oldId) setActivities(prev => prev.filter(a => a.id !== oldId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'route_proposals' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const route = mapRouteRow(payload.new);
            setRouteProposals(prev => prev.some(r => r.id === route.id) ? prev : [route, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const route = mapRouteRow(payload.new);
            setRouteProposals(prev => prev.map(r => r.id === route.id ? { ...r, ...route } : r));
            setSelectedRoute(prev => prev && prev.id === route.id ? { ...prev, ...route } : prev);
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = (payload.old as any).id;
            if (oldId) setRouteProposals(prev => prev.filter(r => r.id !== oldId));
          }
        }
      )
      .subscribe();

    // Realtime channel for crews sync across all users
    const crewsChannel = supabase
      .channel('public:crews')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crews' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as any;
            setCrews(prev => prev.map(c => c.id === updated.id ? {
              ...c,
              name: updated.name || c.name,
              tagline: updated.tagline !== undefined ? updated.tagline : c.tagline,
              description: updated.description !== undefined ? updated.description : c.description,
              coverImage: updated.cover_image || c.coverImage,
              baseCity: updated.base_city || c.baseCity,
              whatsappGroupUrl: updated.whatsapp_group_url !== undefined ? updated.whatsapp_group_url : c.whatsappGroupUrl
            } : c));
            setCurrentCrew(prev => prev && prev.id === updated.id ? {
              ...prev,
              name: updated.name || prev.name,
              tagline: updated.tagline !== undefined ? updated.tagline : prev.tagline,
              description: updated.description !== undefined ? updated.description : prev.description,
              coverImage: updated.cover_image || prev.coverImage,
              baseCity: updated.base_city || prev.baseCity,
              whatsappGroupUrl: updated.whatsapp_group_url !== undefined ? updated.whatsapp_group_url : prev.whatsappGroupUrl
            } : prev);
          }
        }
      )
      .subscribe();

    // Realtime channel for social follow notifications across all devices
    const socialChannel = supabase
      .channel('public:social_notifications')
      .on(
        'broadcast',
        { event: 'new_follow_request' },
        (payload: any) => {
          if (payload?.payload) {
            const req = payload.payload as FollowRequest;
            if (req.toUserId === currentUser.id || (currentUser.handle && req.toUserId === currentUser.handle)) {
              setFollowRequests(prev => {
                if (prev.some(r => r.id === req.id)) return prev;
                return [req, ...prev];
              });
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'follow_request_accepted' },
        (payload: any) => {
          if (payload?.payload) {
            const { followerId, followingId } = payload.payload;
            if (followerId === currentUser.id) {
              setFollowingUserIds(prev => prev.includes(followingId) ? prev : [...prev, followingId]);
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'new_route_published' },
        (payload: any) => {
          if (payload?.payload) {
            const notif = payload.payload as AppNotification;
            // Solo registrar si el usuario no es el autor de la ruta
            if (notif.fromUserId !== currentUser.id) {
              // Si la notificación va dirigida a un grupo, verificar si el usuario es miembro de esa crew
              if (notif.crewId) {
                const userCrews = crews.filter(c => 
                  c.id === notif.crewId && (c.members.some(m => m.userId === currentUser.id) || c.creatorId === currentUser.id)
                );
                if (userCrews.length === 0) return;
              }
              setNotifications(prev => {
                if (prev.some(n => n.id === notif.id)) return prev;
                const updated = [notif, ...prev];
                try {
                  localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'new_follower' },
        (payload: any) => {
          if (payload?.payload) {
            const data = payload.payload;
            const isMe = data.toUserId === currentUser.id || 
              (currentUser.handle && data.toUserId === currentUser.handle) ||
              (data.toUserId === 'user-patricio' && currentUser.id === 'a1bac354-0a88-486c-9289-049e75c61c12') ||
              (currentUser.id === 'user-patricio' && data.toUserId === 'a1bac354-0a88-486c-9289-049e75c61c12');
            if (isMe && data.followerId !== currentUser.id) {
              const newNotif: AppNotification = {
                id: `notif-follow-${data.followerId}-${Date.now()}`,
                type: 'new_follower',
                title: 'Nuevo Seguidor',
                message: `${data.followerName || 'Un piloto'} ha comenzado a seguirte.`,
                createdAt: new Date().toISOString(),
                read: false,
                toUserId: currentUser.id,
                fromUserId: data.followerId,
                fromUserName: data.followerName || 'Piloto',
                fromUserAvatar: data.followerAvatar || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150'
              };
              setNotifications(prev => {
                if (prev.some(n => n.id === newNotif.id || (n.type === 'new_follower' && n.fromUserId === data.followerId))) return prev;
                const updated = [newNotif, ...prev];
                try {
                  localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }
        }
      )
    // Realtime channel for admin events (feedback from founders)
    const adminChannel = supabase
      .channel('public:admin_channel')
      .on(
        'broadcast',
        { event: 'new_founder_feedback' },
        (payload: any) => {
          if (payload?.payload) {
            const fb = payload.payload as FounderFeedback;
            setFounderFeedbacks(prev => {
              if (prev.some(f => f.id === fb.id)) return prev;
              const updated = [fb, ...prev];
              try {
                localStorage.setItem(STORAGE_KEYS.FOUNDER_FEEDBACK, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Realtime channel for follows table changes across all devices
    const followsChannel = supabase
      .channel('public:follows_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'follows' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const row = payload.new as any;
            setAllFollows(prev => {
              if (prev.some(f => f.follower_id === row.follower_id && f.following_id === row.following_id)) return prev;
              return [...prev, { follower_id: row.follower_id, following_id: row.following_id }];
            });
            const isTargetMe = row.following_id === currentUser.id ||
              (currentUser.handle && row.following_id === currentUser.handle) ||
              (row.following_id === 'a1bac354-0a88-486c-9289-049e75c61c12' && currentUser.id === 'user-patricio') ||
              (row.following_id === 'user-patricio' && currentUser.id === 'a1bac354-0a88-486c-9289-049e75c61c12');

            if (isTargetMe) {
              setFollowersUserIds(prev => prev.includes(row.follower_id) ? prev : [...prev, row.follower_id]);
              const followerUser = users.find(u => u.id === row.follower_id || u.handle === row.follower_id);
              const followerName = followerUser?.name || 'Un piloto';
              setNotifications(prev => {
                if (prev.some(n => n.type === 'new_follower' && n.fromUserId === row.follower_id)) return prev;
                const newNotif: AppNotification = {
                  id: `notif-follow-${row.follower_id}-${Date.now()}`,
                  type: 'new_follower',
                  title: 'Nuevo Seguidor',
                  message: `${followerName} ha comenzado a seguirte.`,
                  createdAt: new Date().toISOString(),
                  read: false,
                  toUserId: currentUser.id,
                  fromUserId: row.follower_id,
                  fromUserName: followerName,
                  fromUserAvatar: followerUser?.avatar || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150'
                };
                const updated = [newNotif, ...prev];
                try {
                  localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
            if (row.follower_id === currentUser.id) {
              setFollowingUserIds(prev => prev.includes(row.following_id) ? prev : [...prev, row.following_id]);
            }
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldRow = payload.old as any;
            setAllFollows(prev => prev.filter(f => !(f.follower_id === oldRow.follower_id && f.following_id === oldRow.following_id)));
            if (oldRow.following_id === currentUser.id) {
              setFollowersUserIds(prev => prev.filter(id => id !== oldRow.follower_id));
            }
            if (oldRow.follower_id === currentUser.id) {
              setFollowingUserIds(prev => prev.filter(id => id !== oldRow.following_id));
            }
          }
        }
      )
      .subscribe();

    // Realtime channel for motorcycles table changes (hangar sync across devices)
    const motorcyclesChannel = supabase
      .channel('public:motorcycles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'motorcycles' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const m = payload.new as any;
            const newBike = mapMotorcycleRow(m);
            setMotorcycles(prev => {
              const existingIdx = prev.findIndex(x => x.id === newBike.id || (x.userId === newBike.userId && x.model === newBike.model));
              if (existingIdx >= 0) {
                // Si ya existía con id provisional, conciliar y preservar foto si la local es personalizada
                return prev.map((x, idx) => idx === existingIdx ? {
                  ...newBike,
                  photoUrl: (x.photoUrl && !x.photoUrl.includes('images.unsplash.com')) ? x.photoUrl : newBike.photoUrl
                } : x);
              }
              return [newBike, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const m = payload.new as any;
            const updatedBike = mapMotorcycleRow(m);
            setMotorcycles(prev => prev.map(x => x.id === updatedBike.id ? {
              ...updatedBike,
              photoUrl: (x.photoUrl && !x.photoUrl.includes('images.unsplash.com') && (!updatedBike.photoUrl || updatedBike.photoUrl.includes('images.unsplash.com')))
                ? x.photoUrl
                : updatedBike.photoUrl
            } : x));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const m = payload.old as any;
            if (m?.id) {
              setMotorcycles(prev => prev.filter(x => x.id !== String(m.id)));
            }
          }
        }
      )
      .subscribe();

    // Realtime channel for profiles table changes (new registrations & profile edits)
    const profilesChannel = supabase
      .channel('public:profiles_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload: any) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const p = payload.new;
            const newPilot: User = {
              id: p.id,
              name: p.name,
              handle: p.handle,
              email: p.email,
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
              bio: p.bio || 'Piloto en NAO.',
              location: p.location || 'México',
              ridingLevel: (p.riding_level as any) || 'Intermedio',
              phone: p.phone,
              emergencyContact: p.emergency_contact,
              createdAt: p.created_at
            };
            setUsers(prev => {
              const existingIdx = prev.findIndex(u => u.id === newPilot.id);
              if (existingIdx >= 0) {
                return prev.map((u, i) => i === existingIdx ? { ...u, ...newPilot } : u);
              }
              return [newPilot, ...prev];
            });
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const p = payload.new;
            setUsers(prev => prev.map(u => {
              if (u.id === p.id) {
                return {
                  ...u,
                  name: p.name || u.name,
                  handle: p.handle || u.handle,
                  email: p.email || u.email,
                  avatar: p.avatar_url || u.avatar,
                  bio: p.bio !== undefined ? p.bio : u.bio,
                  location: p.location || u.location,
                  ridingLevel: (p.riding_level as any) || u.ridingLevel,
                  phone: p.phone !== undefined ? p.phone : u.phone,
                  emergencyContact: p.emergency_contact !== undefined ? p.emergency_contact : u.emergencyContact,
                  createdAt: p.created_at || u.createdAt
                };
              }
              return u;
            }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const oldId = payload.old?.id;
            if (oldId) {
              setUsers(prev => prev.filter(u => u.id !== oldId));
            }
          }
        }
      )
      .subscribe();

    // Sincronización periódica y al reenfocar la ventana para garantizar que incluso si Realtime
    // en Supabase está en estado 'Unhealthy' o reconectando, los seguidores e interacciones NUNCA se pierdan
    const refreshFollowsAndSocial = async () => {
      if (!isSupabaseConfigured() || !currentUser.id || currentUser.id === 'guest') return;
      try {
        const { data: followsData } = await supabase
          .from('follows')
          .select('follower_id, following_id')
          .or(`follower_id.eq.${currentUser.id},following_id.eq.${currentUser.id}`);

        if (followsData) {
          setAllFollows(prev => {
            const map = new Map(prev.map(f => [`${f.follower_id}_${f.following_id}`, f]));
            followsData.forEach((f: any) => {
              map.set(`${f.follower_id}_${f.following_id}`, { follower_id: f.follower_id, following_id: f.following_id });
            });
            return Array.from(map.values());
          });

          const cloudFollowing = followsData
            .filter((f: any) => f.follower_id === currentUser.id)
            .map((f: any) => f.following_id);
          setFollowingUserIds(prev => Array.from(new Set([...prev, ...cloudFollowing])));

          const cloudFollowers = followsData
            .filter((f: any) => f.following_id === currentUser.id)
            .map((f: any) => f.follower_id);
          setFollowersUserIds(cloudFollowers);
        }
      } catch (e) {
        console.warn('Silent social refresh err:', e);
      }
    };

    window.addEventListener('focus', refreshFollowsAndSocial);
    const syncInterval = setInterval(refreshFollowsAndSocial, 25000);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', refreshFollowsAndSocial);
      window.removeEventListener('online', flushSyncQueue);
      clearInterval(syncInterval);
      supabase.removeChannel(ridesChannel);
      supabase.removeChannel(crewsChannel);
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(motorcyclesChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(socialChannel);
      supabase.removeChannel(adminChannel);
    };
  }, [currentUser.id, currentUser.handle]);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CREW_MESSAGES, JSON.stringify(crewMessages));
    } catch (e) { console.error(e); }
  }, [crewMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) { console.error(e); }
  }, [activities]);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOTORCYCLES, JSON.stringify(motorcycles));
    } catch (e) { console.error(e); }
  }, [motorcycles]);

  useEffect(() => {
    try {
      const sanitized = crews.filter(c => !isDeprecatedCrew(c));
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(sanitized));
    } catch (e) { console.error(e); }
  }, [crews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(rodadas));
    } catch (e) { console.error(e); }
  }, [rodadas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routeProposals));
    } catch (e) { console.error(e); }
  }, [routeProposals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOLLOW_REQUESTS, JSON.stringify(followRequests));
    } catch (e) { console.error(e); }
  }, [followRequests]);

  useEffect(() => {
    try {
      localStorage.setItem('nao_following_users', JSON.stringify(followingUserIds));
    } catch (e) { console.error(e); }
  }, [followingUserIds]);

  useEffect(() => {
    try {
      localStorage.setItem('nao_followers_users', JSON.stringify(followersUserIds));
    } catch (e) { console.error(e); }
  }, [followersUserIds]);

  const userBikes = motorcycles.filter(m => m.userId === currentUser.id);

  const generateBikeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch {}
    }
    return `moto-${makeUniqueSuffix()}`;
  };

  const addMotorcycle = async (bikeData: Omit<Motorcycle, 'id'>) => {
    const bikeId = generateBikeId();
    const newBike: Motorcycle = {
      ...bikeData,
      id: bikeId,
      userId: bikeData.userId || currentUser.id,
      modifications: bikeData.modifications && bikeData.modifications.length > 0 ? bikeData.modifications : ['Original de fábrica'],
      isPrimary: bikeData.isPrimary ?? (userBikes.length === 0)
    };

    // 1. Guardar de inmediato en estado local y persistir
    setMotorcycles(prev => [newBike, ...prev]);

    // 2. Mapear al esquema exacto de PostgreSQL de Supabase
    const dbPayload = mapMotorcycleToRow(newBike);
    dbPayload.id = bikeId;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline && isSupabaseConfigured() && newBike.userId && newBike.userId !== 'guest') {
      try {
        const { data, error } = await supabase.from('motorcycles').upsert(dbPayload).select().single();
        if (error) {
          console.warn('[Hangar] Error guardando moto en Supabase, encolando offline:', error.message);
          await enqueueOfflineAction('add_motorcycle', dbPayload);
        } else if (data && data.id && String(data.id) !== bikeId) {
          // Si Supabase generó un ID distinto, conciliar en el estado local
          setMotorcycles(prev => prev.map(m => m.id === bikeId ? { ...m, id: String(data.id) } : m));
        }
      } catch (err) {
        console.warn('[Hangar] Fallo de red al insertar moto:', err);
        await enqueueOfflineAction('add_motorcycle', dbPayload);
      }
    } else if (newBike.userId && newBike.userId !== 'guest') {
      // Fuera de línea: encolar para subir al reconectar
      await enqueueOfflineAction('add_motorcycle', dbPayload);
    }
  };

  const updateMotorcycle = async (id: string, updates: Partial<Motorcycle>) => {
    // 1. Actualizar estado local inmediatamente
    let updatedBikeSnapshot: Motorcycle | null = null;
    setMotorcycles(prev => prev.map(m => {
      if (m.id === id) {
        const merged: Motorcycle = {
          ...m,
          ...updates,
          // Protección contra pérdida de fotos: nunca vaciar la foto si updates no trae una nueva
          photoUrl: updates.photoUrl && updates.photoUrl.trim() ? updates.photoUrl.trim() : m.photoUrl
        };
        updatedBikeSnapshot = merged;
        return merged;
      }
      return m;
    }));

    // 2. Mapear a columnas de Supabase (snake_case)
    const dbPayload = mapMotorcycleToRow(updates);
    if (Object.keys(dbPayload).length === 0) return;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline && isSupabaseConfigured()) {
      try {
        const { error, data } = await supabase
          .from('motorcycles')
          .update(dbPayload)
          .eq('id', id)
          .select();

        if (error || !data || data.length === 0) {
          // Si falló por id (p. ej. id local antiguo que no coincide con UUID de Supabase), intentar por user_id y modelo
          if (currentUser.id && updatedBikeSnapshot) {
            const { error: fallbackError } = await supabase
              .from('motorcycles')
              .update(dbPayload)
              .eq('user_id', currentUser.id)
              .eq('model', (updatedBikeSnapshot as Motorcycle).model);

            if (fallbackError) {
              await enqueueOfflineAction('update_motorcycle', { id, payload: dbPayload, userId: currentUser.id });
            }
          } else {
            await enqueueOfflineAction('update_motorcycle', { id, payload: dbPayload, userId: currentUser.id });
          }
        }
      } catch (err) {
        console.warn('[Hangar] Fallo de red al actualizar moto:', err);
        await enqueueOfflineAction('update_motorcycle', { id, payload: dbPayload, userId: currentUser.id });
      }
    } else {
      // Sin conexión: encolar para sincronizar en cuanto vuelva la señal
      await enqueueOfflineAction('update_motorcycle', { id, payload: dbPayload, userId: currentUser.id });
    }
  };

  const deleteMotorcycle = async (id: string) => {
    setMotorcycles(prev => prev.filter(m => m.id !== id));
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('motorcycles').delete().eq('id', id);
        if (error) {
          await enqueueOfflineAction('delete_motorcycle', { id, userId: currentUser.id });
        }
      } catch (err) {
        await enqueueOfflineAction('delete_motorcycle', { id, userId: currentUser.id });
      }
    } else {
      await enqueueOfflineAction('delete_motorcycle', { id, userId: currentUser.id });
    }
  };

  const createCrew = (data: { name: string; tagline: string; description: string; baseCity: string; coverImage: string; whatsappGroupUrl?: string }) => {
    const randomCode = `MAMI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCrew: Crew = {
      id: `crew-${makeUniqueSuffix()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      tagline: data.tagline,
      description: data.description,
      inviteCode: randomCode,
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
      baseCity: data.baseCity,
      creatorId: currentUser.id,
      whatsappGroupUrl: data.whatsappGroupUrl,
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        { userId: currentUser.id, role: 'Capitán de Ruta', joinedAt: new Date().toISOString().split('T')[0] }
      ]
    };
    setCrews(prev => [newCrew, ...prev]);
    setCurrentCrew(newCrew);
    setActiveNavTab('crew');

    if (isSupabaseConfigured()) {
      supabase.from('crews').insert({
        id: newCrew.id,
        name: newCrew.name,
        slug: newCrew.slug,
        tagline: newCrew.tagline,
        description: newCrew.description,
        invite_code: newCrew.inviteCode,
        cover_image: newCrew.coverImage,
        base_city: newCrew.baseCity,
        creator_id: currentUser.id || null,
        whatsapp_group_url: newCrew.whatsappGroupUrl
      }).then(() => {
        if (currentUser.id) {
          supabase.from('crew_members').insert({
            crew_id: newCrew.id,
            user_id: currentUser.id,
            role: 'Capitán de Ruta'
          }).then(() => {});
        }
      });
    }

    return newCrew;
  };

  const syncActivitiesWithCrew = (crewId: string, newCrewName?: string, members?: CrewMember[]) => {
    setActivities(prev => {
      const updated = prev.map(act => {
        if (act.groupInfo?.crewId === crewId) {
          const crewName = newCrewName || act.groupInfo.crewName;
          let participants = act.groupInfo.participants;
          if (members && members.length > 0) {
            const existingMap = new Map((act.groupInfo.participants || []).map(p => [p.userId, p]));
            participants = members.map(m => {
              const existing = existingMap.get(m.userId);
              const u = users.find(user => user.id === m.userId);
              const b = motorcycles.find(moto => moto.userId === m.userId);
              return {
                userId: m.userId,
                name: u?.name || existing?.name || m.userId,
                handle: u?.handle || existing?.handle || `@${m.userId}`,
                avatar: u?.avatar || existing?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                role: m.role || existing?.role || 'Rider',
                motoModel: b ? `${b.brand} ${b.model}` : (existing?.motoModel || 'Doble Propósito')
              };
            });
          }
          return {
            ...act,
            groupInfo: {
              ...act.groupInfo,
              crewName,
              participants
            }
          };
        }
        return act;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateCrew = (crewId: string, updates: Partial<Crew>) => {
    let updatedList: Crew[] = [];
    setCrews(prev => {
      updatedList = prev.map(c => (c.id === crewId ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (updates.coverImage) {
      try {
        const savedCovers = localStorage.getItem(STORAGE_KEYS.CREW_COVERS);
        const coversMap = savedCovers ? JSON.parse(savedCovers) : {};
        coversMap[crewId] = updates.coverImage;
        localStorage.setItem(STORAGE_KEYS.CREW_COVERS, JSON.stringify(coversMap));
      } catch (e) {
        console.warn('Could not persist cover in CREW_COVERS:', e);
      }
    }

    setCurrentCrew(prev => (prev && prev.id === crewId ? { ...prev, ...updates } : prev));
    if (updates.name || updates.members) {
      syncActivitiesWithCrew(crewId, updates.name, updates.members);
    }

    // Persist to Supabase Cloud so all users see changes immediately
    if (isSupabaseConfigured()) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.tagline !== undefined) dbUpdates.tagline = updates.tagline;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
      if (updates.baseCity !== undefined) dbUpdates.base_city = updates.baseCity;
      if (updates.whatsappGroupUrl !== undefined) dbUpdates.whatsapp_group_url = updates.whatsappGroupUrl;

      if (Object.keys(dbUpdates).length > 0) {
        supabase
          .from('crews')
          .update(dbUpdates)
          .eq('id', crewId)
          .then(({ error }) => {
            if (error) console.error('Error updating crew in cloud:', error);
          });
      }
    }
  };

  const deleteCrew = (crewId: string): { success: boolean; message: string } => {
    const targetCrew = crews.find(c => c.id === crewId);
    if (!targetCrew) {
      return { success: false, message: 'El grupo no existe.' };
    }

    // Validación flexible: Solo quien lo creó lo puede borrar (o fundador / admin / capitán único)
    const isCreator = targetCrew.creatorId === currentUser.id ||
      currentUser.handle === '@patricio' ||
      targetCrew.members[0]?.userId === currentUser.id ||
      (targetCrew.members.length === 1 && targetCrew.members[0]?.userId === currentUser.id);

    if (!isCreator) {
      return { 
        success: false, 
        message: 'Permiso denegado. Solo el creador de la tribu tiene autoridad para borrar el grupo.' 
      };
    }

    // 0. Registrar crewId inmediatamente en la lista de tumbas (DELETED_CREWS)
    try {
      const savedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_CREWS);
      const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
      deletedSet.add(crewId);
      localStorage.setItem(STORAGE_KEYS.DELETED_CREWS, JSON.stringify(Array.from(deletedSet)));
    } catch {}

    // 1. Eliminar de crews local y storage
    setCrews(prev => {
      const updated = prev.filter(c => c.id !== crewId);
      try {
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Si estaba activa como currentCrew, resetear
    if (currentCrew?.id === crewId) {
      setCurrentCrew(null);
    }

    // 3. Limpiar mensajes locales del grupo
    setCrewMessages(prev => {
      const updated = prev.filter(m => m.crewId !== crewId);
      try {
        localStorage.setItem(STORAGE_KEYS.CREW_MESSAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 4. Limpiar rodadas asociadas a este grupo
    setRodadas(prev => {
      const updated = prev.filter(r => r.crewId !== crewId);
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 5. Eliminar de Supabase Cloud si está configurado
    if (isSupabaseConfigured()) {
      supabase.from('crew_messages').delete().eq('crew_id', crewId).then(() => {});
      supabase.from('crew_members').delete().eq('crew_id', crewId).then(() => {});
      supabase.from('crews').delete().eq('id', crewId).then(({ error }) => {
        if (error) console.error('Error deleting crew in Supabase:', error);
      });
    }

    return { success: true, message: `El grupo "${targetCrew.name}" ha sido eliminado exitosamente.` };
  };

  const leaveCrew = (crewId: string): { success: boolean; message: string } => {
    const targetCrew = crews.find(c => c.id === crewId);
    if (!targetCrew) {
      return { success: false, message: 'El grupo no existe.' };
    }

    // Si es el creador, no puede simplemente salirse sin borrar o transferir
    if (targetCrew.creatorId === currentUser.id) {
      return { 
        success: false, 
        message: 'Eres el creador de este grupo. Si ya no deseas mantenerlo, debes borrarlo.' 
      };
    }

    const updatedMembers = targetCrew.members.filter(m => m.userId !== currentUser.id);
    const updatedCrew: Crew = {
      ...targetCrew,
      members: updatedMembers
    };

    setCrews(prev => {
      const updated = prev.map(c => c.id === crewId ? updatedCrew : c);
      try {
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentCrew?.id === crewId) {
      setCurrentCrew(null);
    }

    if (isSupabaseConfigured()) {
      supabase
        .from('crew_members')
        .delete()
        .eq('crew_id', crewId)
        .eq('user_id', currentUser.id)
        .then(() => {});
    }

    return { success: true, message: `Te has salido de "${targetCrew.name}".` };
  };

  const sendCrewMessage = (crewId: string, text: string) => {
    if (!text.trim()) return;
    const userBikes = motorcycles.filter(m => m.userId === currentUser.id);
    const userBike = userBikes[0] ? `${userBikes[0].brand} ${userBikes[0].model}` : undefined;
    const newMsg: CrewChatMessage = {
      id: `msg-${makeUniqueSuffix()}`,
      crewId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userBike,
      message: text.trim(),
      createdAt: new Date().toISOString()
    };
    setCrewMessages(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(STORAGE_KEYS.CREW_MESSAGES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured() && currentUser.id) {
      supabase.from('crew_messages').insert({
        crew_id: crewId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        content: text.trim()
      }).then(() => {});
    }
  };

  const addCrewMember = (crewId: string, userId: string, role: CrewMember['role'] = 'Rider') => {
    let updatedMembers: CrewMember[] = [];
    setCrews(prev => {
      const updatedList = prev.map(c => {
        if (c.id === crewId) {
          if (c.members.some(m => m.userId === userId)) {
            updatedMembers = c.members;
            return c;
          }
          updatedMembers = [
            ...c.members,
            { userId, role, joinedAt: new Date().toISOString().split('T')[0] }
          ];
          return {
            ...c,
            members: updatedMembers
          };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(updatedList));
      } catch {}
      return updatedList;
    });

    if (isSupabaseConfigured() && userId) {
      supabase.from('crew_members').insert({
        crew_id: crewId,
        user_id: userId,
        role: role
      }).then(() => {});
    }

    setCurrentCrew(prev => {
      if (prev && prev.id === crewId) {
        if (prev.members.some(m => m.userId === userId)) return prev;
        return {
          ...prev,
          members: [
            ...prev.members,
            { userId, role, joinedAt: new Date().toISOString().split('T')[0] }
          ]
        };
      }
      return prev;
    });

    if (updatedMembers.length > 0) {
      syncActivitiesWithCrew(crewId, undefined, updatedMembers);
    }
  };

  const joinCrewByCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = crews.find(c => c.inviteCode.toUpperCase() === trimmed);
    if (!found) {
      return { success: false, message: 'Código de crew no encontrado. Verifica la clave e intenta de nuevo.' };
    }
    const alreadyMember = found.members.some(m => m.userId === currentUser.id);
    if (alreadyMember) {
      setCurrentCrew(found);
      setActiveNavTab('crew');
      return { success: true, message: `Ya eres miembro de ${found.name}`, crew: found };
    }
    const updatedMembers: CrewMember[] = [
      ...found.members,
      { userId: currentUser.id, role: 'Rider', joinedAt: new Date().toISOString().split('T')[0] }
    ];
    const updated: Crew = {
      ...found,
      members: updatedMembers
    };
    setCrews(prev => prev.map(c => c.id === found.id ? updated : c));
    setCurrentCrew(updated);
    setActiveNavTab('crew');
    syncActivitiesWithCrew(found.id, undefined, updatedMembers);

    // Persistir membresía en Supabase Cloud
    if (isSupabaseConfigured() && currentUser.id) {
      supabase.from('crew_members').upsert({
        crew_id: found.id,
        user_id: currentUser.id,
        role: 'Rider'
      }, { onConflict: 'crew_id,user_id' }).then(({ error }) => {
        if (error) {
          console.error('Error joining crew in Supabase:', error);
          enqueueOfflineAction('join_crew', { crew_id: found.id, user_id: currentUser.id, role: 'Rider' });
        }
      });
    }

    return { success: true, message: `¡Te uniste a ${found.name}! Bienvenido a bordo.`, crew: updated };
  };

  const enterCrew = (crewId: string) => {
    const found = crews.find(c => c.id === crewId);
    if (found) {
      const isMember = found.members.some(m => m.userId === currentUser.id) || found.creatorId === currentUser.id;
      if (!isMember) {
        // Los grupos son estrictamente privados: no se permite ver detalles sin ser miembro o creador
        return;
      }
      setCurrentCrew(found);
      setActiveNavTab('crew');
    }
  };

  const enterRodada = (rodadaId: string) => {
    const found = rodadas.find(rd => rd.id === rodadaId);
    if (found) {
      const associatedCrew = crews.find(c => c.id === found.crewId);
      if (associatedCrew) {
        const isMember = associatedCrew.members.some(m => m.userId === currentUser.id) || associatedCrew.creatorId === currentUser.id;
        if (!isMember) {
          // No se puede entrar a eventos privados de clubes a los que no perteneces
          return;
        }
        setCurrentCrew(associatedCrew);
      }
      setCurrentRodada(found);
      const routesForRodada = routeProposals.filter(r => r.rodadaId === rodadaId);
      if (routesForRodada.length > 0) {
        setSelectedRoute(routesForRodada[0]);
      }
      setActiveNavTab('crew');
    }
  };

  const createRodada = (data: { title: string; subtitle: string; description: string; category: Rodada['category']; startDate: string; endDate: string; originPoint: string }) => {
    const newRodada: Rodada = {
      id: `rodada-${makeUniqueSuffix()}`,
      crewId: currentCrew?.id || 'crew-1793316469201',
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      category: data.category,
      status: 'votacion',
      startDate: data.startDate,
      endDate: data.endDate,
      originPoint: data.originPoint,
      attendees: [
        {
          userId: currentUser.id,
          motorcycleId: userBikes[0]?.id,
          status: 'confirmado',
          confirmedAt: new Date().toISOString().split('T')[0],
          gearCheck: { sleepingBag0C: true, tireRepairKit: true, portableCompressor: true, firstAidKit: true, tools: true }
        }
      ],
      packingList: [],
      gallery: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRodadas(prev => [newRodada, ...prev]);
    setCurrentRodada(newRodada);
    setActiveNavTab('crew');

    const cloudPayload = {
      id: newRodada.id,
      crew_id: newRodada.crewId,
      creator_id: currentUser.id || null,
      title: newRodada.title,
      subtitle: newRodada.subtitle,
      description: newRodada.description,
      category: newRodada.category,
      start_date: newRodada.startDate,
      end_date: newRodada.endDate,
      origin_point: newRodada.originPoint,
      status: newRodada.status
    };

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').insert(cloudPayload).then(({ error }) => {
        if (error) {
          console.warn('[Supabase] Error inserting rodada, enqueuing offline:', error);
          enqueueOfflineAction('create_rodada', cloudPayload);
        }
      });
    } else {
      enqueueOfflineAction('create_rodada', cloudPayload);
    }

    return newRodada;
  };

  const currentRodadaRoutes = routeProposals.filter(r => r.rodadaId === currentRodada?.id);

  const proposeRoute = (data: Omit<RouteProposal, 'id' | 'votes' | 'comments'>) => {
    const newRoute: RouteProposal = {
      ...data,
      id: `route-${makeUniqueSuffix()}`,
      votes: [currentUser.id],
      comments: []
    };
    setRouteProposals(prev => {
      const updated = [newRoute, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSelectedRoute(newRoute);
    setActiveNavTab('crew');

    // Identificar el grupo destino (por crewId explícito o por la rodada a la que pertenece)
    const targetCrewId = newRoute.crewId || (newRoute.rodadaId ? rodadas.find(r => r.id === newRoute.rodadaId)?.crewId : currentCrew?.id);
    const targetCrew = crews.find(c => c.id === targetCrewId);

    if (targetCrewId && targetCrew) {
      // 1. Crear notificación para los miembros de la tribu
      const notifTitle = newRoute.isRecorded ? 'Nueva ruta grabada en tu tribu' : 'Nueva ruta propuesta en tu tribu';
      const notifMessage = `${currentUser.name} compartió "${newRoute.title}" (${newRoute.destination || 'Expedición'}) en ${targetCrew.name}.`;

      createNotification({
        type: 'route_published',
        title: notifTitle,
        message: notifMessage,
        crewId: targetCrew.id,
        crewName: targetCrew.name,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatar,
        routeId: newRoute.id
      });

      // 2. Enviar mensaje de sistema discreto al chat de la tribu
      const chatSysMsg: CrewChatMessage = {
        id: `msg-sys-${makeUniqueSuffix()}`,
        crewId: targetCrew.id,
        userId: 'system',
        userName: 'SISTEMA NAO',
        userAvatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=150',
        message: `📍 ${currentUser.name} publicó una nueva ruta: "${newRoute.title}" hacia ${newRoute.destination}.`,
        createdAt: new Date().toISOString(),
        systemAction: {
          type: 'ruta_propuesta',
          targetTitle: newRoute.title,
          targetId: newRoute.id
        }
      };

      setCrewMessages(prev => {
        const updated = [...prev, chatSysMsg];
        try {
          localStorage.setItem(STORAGE_KEYS.CREW_MESSAGES, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (isSupabaseConfigured()) {
        supabase.from('crew_messages').insert({
          crew_id: targetCrew.id,
          user_id: 'system',
          user_name: 'SISTEMA NAO',
          user_avatar: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=150',
          content: chatSysMsg.message
        }).then(() => {});
      }
    }

    const cloudProposalPayload = {
      id: newRoute.id,
      rodada_id: newRoute.rodadaId || null,
      crew_id: newRoute.crewId || targetCrewId || null,
      is_recorded: newRoute.isRecorded || false,
      title: newRoute.title,
      destination: newRoute.destination,
      state: newRoute.state || 'México',
      proposed_by_user_id: newRoute.proposedByUserId,
      proposed_by_name: newRoute.proposedByName,
      proposed_by_avatar: newRoute.proposedByAvatar || null,
      description: newRoute.description || '',
      cover_image: newRoute.coverImage || '',
      total_km: newRoute.totalKm || 0,
      estimated_hours: newRoute.estimatedHours || '',
      offroad_percentage: newRoute.offroadPercentage || 50,
      asphalt_percentage: newRoute.asphaltPercentage || 50,
      difficulty: newRoute.difficulty || 'Intermedio',
      campsite: newRoute.campsite || null,
      itinerary: newRoute.itinerary || [],
      waypoints: newRoute.waypoints || [],
      coordinates: newRoute.coordinates || [],
      votes: newRoute.votes || [],
      downvotes: newRoute.downvotes || [],
      comments: newRoute.comments || [],
      day_of_dead_vibe: newRoute.dayOfDeadVibe || null,
      safety_tips: newRoute.safetyTips || []
    };

    if (isSupabaseConfigured()) {
      supabase.from('route_proposals').insert(cloudProposalPayload).then(({ error }) => {
        if (error) {
          console.warn('[Supabase] Error inserting proposal, enqueuing offline:', error);
          enqueueOfflineAction('create_route_proposal', cloudProposalPayload);
        }
      });
    } else {
      enqueueOfflineAction('create_route_proposal', cloudProposalPayload);
    }
  };

  const updateRodada = (rodadaId: string, updates: Partial<Rodada>): boolean => {
    const targetRodada = rodadas.find(r => r.id === rodadaId);
    if (!targetRodada) return false;

    // Check permissions: creator of rodada, captain/creator of crew, or @patricio
    const targetCrew = crews.find(c => c.id === targetRodada.crewId);
    const isCrewCaptain = targetCrew?.creatorId === currentUser.id ||
      targetCrew?.members.some(m => m.userId === currentUser.id && m.role === 'Capitán de Ruta') ||
      currentUser.handle === '@patricio';
    const isRodadaCreator = (targetRodada.attendees?.[0]?.userId === currentUser.id) || isCrewCaptain;

    if (!isRodadaCreator) {
      console.warn('Unauthorized: Only the creator of the rodada or crew captain can edit it.');
      return false;
    }

    setRodadas(prev => {
      const updated = prev.map(rd => rd.id === rodadaId ? { ...rd, ...updates } : rd);
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRodada?.id === rodadaId) {
      setCurrentRodada(prev => prev ? { ...prev, ...updates } : null);
    }

    return true;
  };

  const deleteRodada = (rodadaId: string): boolean => {
    const targetRodada = rodadas.find(r => r.id === rodadaId);
    if (!targetRodada) return false;

    // Check permissions: creator of rodada, captain/creator of crew, or @patricio
    const targetCrew = crews.find(c => c.id === targetRodada.crewId);
    const isCrewCaptain = targetCrew?.creatorId === currentUser.id ||
      targetCrew?.members.some(m => m.userId === currentUser.id && m.role === 'Capitán de Ruta') ||
      currentUser.handle === '@patricio';
    const isRodadaCreator = (targetRodada.attendees?.[0]?.userId === currentUser.id) || isCrewCaptain;

    if (!isRodadaCreator) {
      console.warn('Unauthorized: Only the creator of the rodada or crew captain can delete it.');
      return false;
    }

    // 1. Remove the rodada
    setRodadas(prev => {
      const updated = prev.filter(rd => rd.id !== rodadaId);
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Remove any associated route proposals
    setRouteProposals(prev => {
      const updated = prev.filter(p => p.rodadaId !== rodadaId);
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRodada?.id === rodadaId) {
      setCurrentRodada(null);
    }

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').delete().eq('id', rodadaId).then(({ error }) => {
        if (error) enqueueOfflineAction('delete_rodada', { id: rodadaId });
      });
      supabase.from('route_proposals').delete().eq('rodada_id', rodadaId).then(() => {});
    } else {
      enqueueOfflineAction('delete_rodada', { id: rodadaId });
    }

    return true;
  };

  const updateRouteProposal = (routeId: string, updates: Partial<RouteProposal>): boolean => {
    const targetRoute = routeProposals.find(r => r.id === routeId);
    if (!targetRoute) return false;

    const isOwner = 
      (targetRoute.proposedByUserId && targetRoute.proposedByUserId === currentUser.id) ||
      (targetRoute.proposedByName && targetRoute.proposedByName.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) ||
      currentUser.handle === '@patricio';

    if (!isOwner) {
      console.warn('Unauthorized: Only the creator of the route can edit it.');
      return false;
    }

    setRouteProposals(prev => {
      const updated = prev.map(r => r.id === routeId ? { ...r, ...updates } : r);
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedRoute?.id === routeId) {
      setSelectedRoute(prev => prev ? { ...prev, ...updates } : null);
    }

    if (isSupabaseConfigured()) {
      supabase.from('route_proposals').update({
        title: updates.title,
        destination: updates.destination,
        description: updates.description,
        total_km: updates.totalKm,
        difficulty: updates.difficulty,
        offroad_percentage: updates.offroadPercentage,
        asphalt_percentage: updates.asphaltPercentage
      }).eq('id', routeId).then(() => {});
    }

    return true;
  };

  const deleteRouteProposal = (routeId: string): boolean => {
    const targetRoute = routeProposals.find(r => r.id === routeId);
    if (!targetRoute) return false;

    // Security check: Only author / creator can delete their route (or @patricio)
    const isOwner = 
      (targetRoute.proposedByUserId && targetRoute.proposedByUserId === currentUser.id) ||
      (targetRoute.proposedByName && targetRoute.proposedByName.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) ||
      currentUser.handle === '@patricio';

    if (!isOwner) {
      console.warn('Unauthorized: Only the creator of the route can delete it.');
      return false;
    }

    let updatedRouteProposals: RouteProposal[] = [];
    setRouteProposals(prev => {
      const updated = prev.filter(r => r.id !== routeId);
      updatedRouteProposals = updated;
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
    }

    // Sincronizar rodadas: Si alguna rodada tenía esta ruta como winningRouteId,
    // o si al borrar esta propuesta la rodada se queda sin propuestas válidas,
    // desvincularla y desconfirmarla para que NO siga apareciendo como confirmada arriba
    setRodadas(prev => {
      let changed = false;
      const updated = prev.map(rd => {
        const isAssociatedRodada = rd.id === targetRoute.rodadaId;
        const isWinningRoute = rd.winningRouteId === routeId;
        const remainingProposalsForRodada = isAssociatedRodada 
          ? updatedRouteProposals.filter(p => p.rodadaId === rd.id && !p.isRecorded)
          : [];

        if (isWinningRoute || (isAssociatedRodada && remainingProposalsForRodada.length === 0 && rd.status === 'fijada')) {
          changed = true;
          return {
            ...rd,
            winningRouteId: undefined,
            status: 'votacion' as RodadaStatus
          };
        }
        return rd;
      });

      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    if (currentRodada && (currentRodada.winningRouteId === routeId || (currentRodada.id === targetRoute.rodadaId && updatedRouteProposals.filter(p => p.rodadaId === currentRodada.id && !p.isRecorded).length === 0))) {
      setCurrentRodada(prev => prev ? { ...prev, winningRouteId: undefined, status: 'votacion' } : null);
    }

    if (isSupabaseConfigured()) {
      supabase.from('route_proposals').delete().eq('id', routeId).then(({ error }) => {
        if (error) enqueueOfflineAction('delete_route_proposal', { id: routeId });
      });
      supabase.from('rodadas').update({ winning_route_id: null, status: 'votacion' }).eq('winning_route_id', routeId).then(() => {});
    } else {
      enqueueOfflineAction('delete_route_proposal', { id: routeId });
    }

    return true;
  };

  // Guarda el voto del piloto en la nube con la función atómica set_route_vote
  // (supabase/migration_votos_atomicos.sql). Se manda el estado final deseado, no la lista
  // completa: así dos pilotos votando a la vez no se borran el voto, y reintentar es seguro.
  const persistRouteVote = (routeId: string, vote: 'up' | 'down' | 'none') => {
    if (!currentUser.id || currentUser.id === 'guest') return;
    if (!isSupabaseConfigured()) {
      enqueueOfflineAction('vote_route', { id: routeId, vote });
      return;
    }
    supabase.rpc('set_route_vote', { p_route_id: routeId, p_vote: vote }).then(({ data, error }) => {
      if (error) {
        console.warn('[Supabase] Error saving vote, enqueuing offline:', error);
        enqueueOfflineAction('vote_route', { id: routeId, vote });
        return;
      }
      // Sincronizar con lo que quedó en la base (incluye los votos que otros metieron mientras tanto)
      const row = Array.isArray(data) ? data[0] : data;
      if (row) {
        const votes: string[] = row.new_votes || [];
        const downvotes: string[] = row.new_downvotes || [];
        setRouteProposals(prev => prev.map(r => r.id === routeId ? { ...r, votes, downvotes } : r));
        setSelectedRoute(prev => prev && prev.id === routeId ? { ...prev, votes, downvotes } : prev);
      }
    });
  };

  const voteRoute = (routeId: string) => {
    // Antes el voto a favor solo cambiaba en este teléfono y nunca se guardaba en la nube
    const current = routeProposals.find(r => r.id === routeId) || (selectedRoute?.id === routeId ? selectedRoute : null);
    if (current) persistRouteVote(routeId, current.votes.includes(currentUser.id) ? 'none' : 'up');

    setRouteProposals(prev => {
      const target = prev.find(r => r.id === routeId);
      if (!target) return prev;
      const isAlreadyVoted = target.votes.includes(currentUser.id);

      return prev.map(r => {
        if (r.id === routeId) {
          const currentDownvotes = r.downvotes || [];
          return {
            ...r,
            votes: isAlreadyVoted
              ? r.votes.filter(id => id !== currentUser.id)
              : [...r.votes, currentUser.id],
            // Remove downvote if user is now upvoting
            downvotes: isAlreadyVoted ? currentDownvotes : currentDownvotes.filter(id => id !== currentUser.id)
          };
        }
        return r;
      });
    });

    setSelectedRoute(prev => {
      if (!prev || prev.id !== routeId) return prev;
      const hasVoted = prev.votes.includes(currentUser.id);
      const currentDownvotes = prev.downvotes || [];
      return {
        ...prev,
        votes: hasVoted
          ? prev.votes.filter(id => id !== currentUser.id)
          : [...prev.votes, currentUser.id],
        downvotes: hasVoted ? currentDownvotes : currentDownvotes.filter(id => id !== currentUser.id)
      };
    });
  };

  const downvoteRoute = (routeId: string) => {
    setRouteProposals(prev => {
      const target = prev.find(r => r.id === routeId);
      if (!target) return prev;
      const currentDownvotes = target.downvotes || [];
      const isAlreadyDownvoted = currentDownvotes.includes(currentUser.id);

      return prev.map(r => {
        if (r.id === routeId) {
          return {
            ...r,
            downvotes: isAlreadyDownvoted
              ? (r.downvotes || []).filter(id => id !== currentUser.id)
              : [...(r.downvotes || []), currentUser.id],
            // Remove upvote if user is now downvoting
            votes: isAlreadyDownvoted ? r.votes : r.votes.filter(id => id !== currentUser.id)
          };
        }
        return r;
      });
    });

    setSelectedRoute(prev => {
      if (!prev || prev.id !== routeId) return prev;
      const currentDownvotes = prev.downvotes || [];
      const isAlreadyDownvoted = currentDownvotes.includes(currentUser.id);
      return {
        ...prev,
        downvotes: isAlreadyDownvoted
          ? currentDownvotes.filter(id => id !== currentUser.id)
          : [...currentDownvotes, currentUser.id],
        votes: isAlreadyDownvoted ? prev.votes : prev.votes.filter(id => id !== currentUser.id)
      };
    });

    const targetRoute = routeProposals.find(r => r.id === routeId) || (selectedRoute?.id === routeId ? selectedRoute : null);
    if (targetRoute) {
      const isAlreadyDownvoted = (targetRoute.downvotes || []).includes(currentUser.id);
      persistRouteVote(routeId, isAlreadyDownvoted ? 'none' : 'down');
    }
  };

  const addRouteComment = (routeId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `comm-${makeUniqueSuffix()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: 'Hace un momento'
    };
    setRouteProposals(prev => {
      const updated = prev.map(r => {
        if (r.id === routeId) {
          return { ...r, comments: [...r.comments, newComment] };
        }
        return r;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSelectedRoute(prev => {
      if (!prev || prev.id !== routeId) return prev;
      return { ...prev, comments: [...prev.comments, newComment] };
    });
  };

  const lockWinningRoute = (rodadaId: string, routeId: string) => {
    setRodadas(prev => {
      const updated = prev.map(rd => {
        if (rd.id === rodadaId) {
          return { ...rd, winningRouteId: routeId, status: 'fijada' as RodadaStatus };
        }
        // Regla estricta: Solo puede haber 1 rodada confirmada a la vez.
        // Cualquier otra rodada confirmada previa vuelve a estado 'votacion'
        if (rd.status === 'fijada') {
          return { ...rd, winningRouteId: undefined, status: 'votacion' as RodadaStatus };
        }
        return rd;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRodada) {
      if (currentRodada.id === rodadaId) {
        setCurrentRodada({ ...currentRodada, winningRouteId: routeId, status: 'fijada' });
      } else if (currentRodada.status === 'fijada') {
        setCurrentRodada({ ...currentRodada, winningRouteId: undefined, status: 'votacion' });
      }
    }

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').update({ winning_route_id: routeId, status: 'fijada' }).eq('id', rodadaId).then(({ error }) => {
        if (error) enqueueOfflineAction('lock_winning_route', { rodadaId, routeId });
      });
      supabase.from('rodadas').update({ winning_route_id: null, status: 'votacion' }).neq('id', rodadaId).eq('status', 'fijada').then(() => {});
    } else {
      enqueueOfflineAction('lock_winning_route', { rodadaId, routeId });
    }
  };

  const unlockWinningRoute = (rodadaId: string) => {
    setRodadas(prev => {
      const updated = prev.map(rd => {
        if (rd.id === rodadaId) {
          return { ...rd, winningRouteId: undefined, status: 'votacion' as RodadaStatus };
        }
        return rd;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, winningRouteId: undefined, status: 'votacion' });
    }

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').update({ winning_route_id: null, status: 'votacion' }).eq('id', rodadaId).then(({ error }) => {
        if (error) enqueueOfflineAction('unlock_winning_route', { rodadaId });
      });
    } else {
      enqueueOfflineAction('unlock_winning_route', { rodadaId });
    }
  };

  const completeRodada = (rodadaId: string) => {
    let targetWinningRouteId: string | undefined;
    setRodadas(prev => {
      const updated = prev.map(rd => {
        if (rd.id === rodadaId) {
          targetWinningRouteId = rd.winningRouteId;
          return { ...rd, status: 'completada' as RodadaStatus };
        }
        return rd;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, status: 'completada' });
    }

    // Al marcar la rodada como concluida, archivamos la ruta oficial ganadora (y propuestas asociadas)
    // al Historial para que ya no aparezca como propuesta pendiente
    setRouteProposals(prev => {
      const updated = prev.map(p => {
        if (p.rodadaId === rodadaId || (targetWinningRouteId && p.id === targetWinningRouteId)) {
          return { ...p, isRecorded: true };
        }
        return p;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').update({ status: 'completada' }).eq('id', rodadaId).then(({ error }) => {
        if (error) enqueueOfflineAction('complete_rodada', { rodadaId });
      });
      if (targetWinningRouteId) {
        supabase.from('route_proposals').update({ is_recorded: true }).eq('id', targetWinningRouteId).then(() => {});
      } else {
        supabase.from('route_proposals').update({ is_recorded: true }).eq('rodada_id', rodadaId).then(() => {});
      }
    } else {
      enqueueOfflineAction('complete_rodada', { rodadaId });
    }
  };

  const reopenRodada = (rodadaId: string) => {
    setRodadas(prev => {
      const updated = prev.map(rd => {
        if (rd.id === rodadaId) {
          return { ...rd, status: 'votacion' as RodadaStatus };
        }
        return rd;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.RODADAS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, status: 'votacion' });
    }

    if (isSupabaseConfigured()) {
      supabase.from('rodadas').update({ status: 'votacion' }).eq('id', rodadaId).then(({ error }) => {
        if (error) enqueueOfflineAction('reopen_rodada', { rodadaId });
      });
    } else {
      enqueueOfflineAction('reopen_rodada', { rodadaId });
    }
  };

  const archiveRouteProposal = (routeId: string) => {
    setRouteProposals(prev => {
      const updated = prev.map(p => p.id === routeId ? { ...p, isRecorded: true } : p);
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured()) {
      supabase.from('route_proposals').update({ is_recorded: true }).eq('id', routeId).then(({ error }) => {
        if (error) enqueueOfflineAction('archive_route', { routeId });
      });
    } else {
      enqueueOfflineAction('archive_route', { routeId });
    }
  };

  const unarchiveRouteProposal = (routeId: string) => {
    setRouteProposals(prev => {
      const updated = prev.map(p => p.id === routeId ? { ...p, isRecorded: false } : p);
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (isSupabaseConfigured()) {
      supabase.from('route_proposals').update({ is_recorded: false }).eq('id', routeId).then(({ error }) => {
        if (error) enqueueOfflineAction('unarchive_route', { routeId });
      });
    } else {
      enqueueOfflineAction('unarchive_route', { routeId });
    }
  };

  const rsvpRodada = (rodadaId: string, motorcycleId: string, status: RsvpStatus) => {
    let updatedAttendeesList: any[] = [];
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        const existingIndex = rd.attendees.findIndex(a => a.userId === currentUser.id);
        let updatedAttendees = [...rd.attendees];
        if (existingIndex >= 0) {
          updatedAttendees[existingIndex] = {
            ...updatedAttendees[existingIndex],
            motorcycleId,
            status,
            confirmedAt: new Date().toISOString().split('T')[0]
          };
        } else {
          updatedAttendees.push({
            userId: currentUser.id,
            motorcycleId,
            status,
            confirmedAt: new Date().toISOString().split('T')[0],
            gearCheck: { sleepingBag0C: true, tireRepairKit: true, portableCompressor: false, firstAidKit: false, tools: true }
          });
        }
        updatedAttendeesList = updatedAttendees;
        return { ...rd, attendees: updatedAttendees };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, attendees: updatedAttendeesList });
    }
  };

  const togglePackingItem = (rodadaId: string, itemId: string) => {
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return {
          ...rd,
          packingList: rd.packingList.map(item => item.id === itemId ? { ...item, isDone: !item.isDone } : item)
        };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({
        ...currentRodada,
        packingList: currentRodada.packingList.map(item => item.id === itemId ? { ...item, isDone: !item.isDone } : item)
      });
    }
  };

  const assignPackingItem = (rodadaId: string, itemId: string, userId: string, userName: string) => {
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return {
          ...rd,
          packingList: rd.packingList.map(item => item.id === itemId ? { ...item, assignedToUserId: userId, assignedToName: userName } : item)
        };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({
        ...currentRodada,
        packingList: currentRodada.packingList.map(item => item.id === itemId ? { ...item, assignedToUserId: userId, assignedToName: userName } : item)
      });
    }
  };

  const addPackingItem = (rodadaId: string, item: string, category: PackingItem['category']) => {
    if (!item.trim()) return;
    const newItem: PackingItem = {
      id: `pack-${makeUniqueSuffix()}`,
      item: item.trim(),
      category,
      isDone: false
    };
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return { ...rd, packingList: [...rd.packingList, newItem] };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({
        ...currentRodada,
        packingList: [...currentRodada.packingList, newItem]
      });
    }
  };

  const addGalleryPhoto = (rodadaId: string, url: string, caption: string) => {
    if (!url.trim()) return;
    const newPhoto = {
      id: `photo-${makeUniqueSuffix()}`,
      url: url.trim(),
      caption: caption.trim() || 'Foto de rodada',
      uploadedByName: currentUser.name,
      uploadedAt: 'Hoy'
    };
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return { ...rd, gallery: [newPhoto, ...rd.gallery] };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({
        ...currentRodada,
        gallery: [newPhoto, ...currentRodada.gallery]
      });
    }
  };

  const toggleCompletedRoute = (routeId: string) => {
    setCompletedRouteIds(prev => {
      const exists = prev.includes(routeId);
      const updated = exists ? prev.filter(id => id !== routeId) : [...prev, routeId];
      const targetRoute = routeProposals.find(r => r.id === routeId);
      const kmDelta = targetRoute ? targetRoute.totalKm : 120;
      setCurrentUser(u => ({
        ...u,
        completedRouteIds: updated,
        stats: {
          totalKm: Math.max(0, (u.stats?.totalKm || 0) + (exists ? -kmDelta : kmDelta)),
          completedCount: Math.max(0, (u.stats?.completedCount || 0) + (exists ? -1 : 1)),
          elevationGain: Math.max(0, (u.stats?.elevationGain || 0) + (exists ? -650 : 650))
        }
      }));
      return updated;
    });
  };

  const toggleSavedRoute = (routeId: string) => {
    setSavedRouteIds(prev => {
      const exists = prev.includes(routeId);
      const updated = exists ? prev.filter(id => id !== routeId) : [...prev, routeId];
      setCurrentUser(u => ({ ...u, savedRouteIds: updated }));
      return updated;
    });
  };

  const createRouteList = (name: string, description?: string) => {
    if (!name.trim()) return;
    const newList: RouteList = {
      id: `list-${makeUniqueSuffix()}`,
      userId: currentUser.id,
      name: name.trim(),
      description: description?.trim(),
      routeIds: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRouteLists(prev => [newList, ...prev]);
  };

  const addRouteToList = (listId: string, routeId: string) => {
    setRouteLists(prev => prev.map(l => {
      if (l.id === listId && !l.routeIds.includes(routeId)) {
        return { ...l, routeIds: [...l.routeIds, routeId] };
      }
      return l;
    }));
  };

  const removeRouteFromList = (listId: string, routeId: string) => {
    setRouteLists(prev => prev.map(l => {
      if (l.id === listId) {
        return { ...l, routeIds: l.routeIds.filter(id => id !== routeId) };
      }
      return l;
    }));
  };

  const saveActivityAsRoute = (activity: ActivityPost) => {
    setRouteProposals(prev => {
      if (prev.some(r => r.id === activity.id)) return prev;
      const newProposal: RouteProposal = {
        id: activity.id,
        rodadaId: 'rodada-general',
        title: activity.title,
        destination: activity.location.split(',')[0] || activity.location,
        state: activity.location.includes(',') ? activity.location.split(',')[1].trim() : 'México',
        proposedByUserId: activity.pilotId,
        proposedByName: activity.pilotName,
        proposedByAvatar: activity.pilotAvatar,
        description: `Ruta registrada por ${activity.pilotName} en ${activity.location}. ${activity.discipline}. Desnivel acumulado: +${activity.elevationGainM}m.`,
        coverImage: (activity.photos && activity.photos[0]) || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
        totalKm: activity.distanceKm,
        estimatedHours: activity.durationText,
        offroadPercentage: activity.surfaceBreakdown?.dirtPercentage || 25,
        asphaltPercentage: activity.surfaceBreakdown?.asphaltPercentage || 75,
        difficulty: (activity.surfaceBreakdown?.dirtPercentage || 0) > 40 ? 'Avanzado / Técnico' : 'Intermedio',
        campsite: {
          name: 'Campamento Base ' + (activity.location.split(',')[0] || 'Ruta'),
          elevationMeters: activity.elevationGainM,
          minTempNight: '12°C',
          security: 'Zona transitable y segura',
          amenities: ['Señal celular intermitente', 'Agua']
        },
        itinerary: [],
        waypoints: [],
        coordinates: activity.coordinates,
        votes: [],
        comments: [],
        dayOfDeadVibe: 'Ruta descubierta en la comunidad',
        safetyTips: ['Revisar presión de llantas', 'Llevar agua y equipo de seguridad completo']
      };
      return [newProposal, ...prev];
    });
  };

  const toggleKudo = async (activityId: string) => {
    let updatedKudosUsers: string[] = [];
    let updatedKudosAvatars: string[] = [];
    let isNowKudoed = false;

    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        isNowKudoed = !act.hasKudoed;
        const currentUsers: string[] = Array.isArray((act.groupInfo as any)?.kudos_users) 
          ? (act.groupInfo as any).kudos_users 
          : [];
        const currentAvatars: string[] = Array.isArray(act.kudosAvatars) 
          ? act.kudosAvatars 
          : [];
        
        updatedKudosUsers = isNowKudoed 
          ? [...currentUsers.filter((u: string) => u !== currentUser.id), currentUser.id]
          : currentUsers.filter((u: string) => u !== currentUser.id);

        updatedKudosAvatars = isNowKudoed
          ? [currentUser.avatar, ...currentAvatars.filter((av: string) => av !== currentUser.avatar)]
          : currentAvatars.filter((av: string) => av !== currentUser.avatar);

        return {
          ...act,
          hasKudoed: isNowKudoed,
          kudosCount: updatedKudosUsers.length,
          kudosAvatars: updatedKudosAvatars,
          groupInfo: {
            ...(act.groupInfo || {}),
            kudos_users: updatedKudosUsers,
            kudos_avatars: updatedKudosAvatars
          }
        };
      }
      return act;
    }));

    // Sincronizar en tiempo real con Supabase para todas las cuentas
    if (isSupabaseConfigured() && activityId) {
      try {
        const target = activities.find(a => a.id === activityId);
        const existingGroupInfo = (target?.groupInfo as any) || {};
        const newGroupInfo = {
          ...existingGroupInfo,
          kudos_users: updatedKudosUsers,
          kudos_avatars: updatedKudosAvatars
        };
        await supabase
          .from('activities')
          .update({ group_info: newGroupInfo })
          .eq('id', activityId);
      } catch (err) {
        console.warn('Error syncing kudo to Supabase:', err);
      }
    }
  };

  const addActivityComment = (activityId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: ActivityComment = {
      id: `comment-${makeUniqueSuffix()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      createdAt: 'Hace un momento',
      text: text.trim()
    };

    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        const existingComments = act.comments || [];
        return {
          ...act,
          commentsCount: (act.commentsCount || existingComments.length) + 1,
          comments: [...existingComments, newComment]
        };
      }
      return act;
    }));
  };

  const addRecordedActivity = (data: Omit<ActivityPost, 'id' | 'kudosCount' | 'hasKudoed' | 'kudosAvatars' | 'commentsCount'>) => {
    const newActId = `act-${makeUniqueSuffix()}`;
    const newAct: ActivityPost = {
      ...data,
      id: newActId,
      kudosCount: 0,
      hasKudoed: false,
      kudosAvatars: [],
      commentsCount: 0
    };
    setActivities(prev => {
      const updated = [newAct, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update pilot real stats based on real ride
    setCurrentUser(prevUser => {
      const newTotalKm = Math.round(((prevUser.stats?.totalKm || 0) + (data.distanceKm || 0)) * 10) / 10;
      const newCompletedCount = (prevUser.stats?.completedCount || 0) + 1;
      const newElevationGain = (prevUser.stats?.elevationGain || 0) + (data.elevationGainM || 0);

      const updated = {
        ...prevUser,
        stats: {
          totalKm: newTotalKm,
          completedCount: newCompletedCount,
          elevationGain: newElevationGain
        }
      };

      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const cloudActivityPayload = {
      id: newActId,
      pilot_id: currentUser.id,
      pilot_name: data.pilotName || currentUser.name,
      pilot_handle: data.pilotHandle || currentUser.handle,
      pilot_avatar: data.pilotAvatar || currentUser.avatar,
      title: data.title,
      distance_km: data.distanceKm || 0,
      elevation_gain_m: data.elevationGainM || 0,
      duration_formatted: data.durationText || '0h 00m',
      avg_speed_kmh: data.avgSpeedKmh || 0,
      moto_model: data.motoModel || null,
      discipline: data.discipline || 'Trail / Aventura',
      location: data.location || 'México',
      route_coordinates: data.coordinates || [],
      photos: data.photos || [],
      surface_breakdown: data.surfaceBreakdown || { asphaltPercentage: 50, dirtPercentage: 50, curveDensity: 'Media' },
      group_info: {
        ...(data.groupInfo || {}),
        waypoints: data.waypoints || [],
        gmaps_url: data.gmapsUrl || '',
        route_proposal_id: data.routeProposalId || '',
        kudos_users: [],
        kudos_avatars: []
      }
    };

    // Notificar a miembros de la tribu o seguidores en tiempo real
    createNotification({
      type: 'route_published',
      title: 'Nueva Rodada Grabada',
      message: `${currentUser.name} ha publicado la expedición "${data.title}" (${data.distanceKm || 0} km).`,
      crewId: data.groupInfo?.crewId,
      crewName: data.groupInfo?.crewName,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=150',
      actionUrl: `/actividad/${newActId}`
    });

    // Antes el error se ignoraba: si se guardaba la rodada sin señal (en la montaña), la actividad
    // nunca llegaba al feed de los demás. Ahora se encola y se sube al volver la conexión.
    if (isSupabaseConfigured() && currentUser.id && currentUser.id !== 'guest') {
      supabase.from('activities').insert(cloudActivityPayload).then(({ error }) => {
        if (error) {
          console.warn('[Supabase] Error inserting activity, enqueuing offline:', error);
          enqueueOfflineAction('publish_activity', cloudActivityPayload);
        }
      });
    } else if (currentUser.id && currentUser.id !== 'guest') {
      enqueueOfflineAction('publish_activity', cloudActivityPayload);
    }
  };

  const deleteActivity = (activityId: string): boolean => {
    const targetActivity = activities.find(a => a.id === activityId);
    if (!targetActivity) return false;

    // Security check: Only author / publisher can delete their activity
    const isOwner = 
      (targetActivity.pilotId && targetActivity.pilotId === currentUser.id) ||
      (targetActivity.pilotName && targetActivity.pilotName.toLowerCase().trim() === currentUser.name?.toLowerCase().trim()) ||
      (targetActivity.pilotHandle && currentUser.handle && targetActivity.pilotHandle.toLowerCase().trim() === currentUser.handle.toLowerCase().trim());

    if (!isOwner) {
      console.warn('Unauthorized: Only the pilot who published this activity can delete it.');
      return false;
    }

    // Remove from activities list
    setActivities(prev => {
      const updated = prev.filter(a => a.id !== activityId);
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Recalculate pilot stats if the deleted activity belonged to currentUser
    setCurrentUser(prevUser => {
      const remainingUserActs = activities.filter(a => 
        a.id !== activityId && (
          (a.pilotId && a.pilotId === prevUser.id) ||
          (a.pilotName && a.pilotName.toLowerCase().trim() === prevUser.name?.toLowerCase().trim()) ||
          (a.groupInfo?.participants?.some(p => p.userId === prevUser.id || p.name?.toLowerCase().trim() === prevUser.name?.toLowerCase().trim()))
        )
      );

      const recalculatedKm = Math.round(remainingUserActs.reduce((acc, a) => acc + (a.distanceKm || 0), 0) * 10) / 10;
      const recalculatedElev = remainingUserActs.reduce((acc, a) => acc + (a.elevationGainM || 0), 0);
      const recalculatedCount = remainingUserActs.length;

      const updated = {
        ...prevUser,
        stats: {
          totalKm: recalculatedKm,
          completedCount: recalculatedCount,
          elevationGain: recalculatedElev
        }
      };

      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also delete from Supabase if online
    if (isSupabaseConfigured() && currentUser.id) {
      supabase.from('activities').delete().eq('id', activityId).then(() => {});
    }

    return true;
  };

  const toggleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === challengeId) {
        const joined = !ch.joined;
        return {
          ...ch,
          joined,
          participantsCount: joined ? ch.participantsCount + 1 : Math.max(1, ch.participantsCount - 1)
        };
      }
      return ch;
    }));
  };

  const toggleFollowUser = (userId: string) => {
    if (!userId || userId === currentUser.id || userId === 'guest') return;

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const effectiveFollowerId = currentUser.id === 'user-patricio' ? 'a1bac354-0a88-486c-9289-049e75c61c12' : currentUser.id;
    const targetUserObj = users.find(u => u.id === userId || u.handle === userId || u.name === userId);
    const effectiveTargetId = (targetUserObj && isUUID(targetUserObj.id)) ? targetUserObj.id : userId;

    setFollowingUserIds(prev => {
      const exists = prev.includes(userId) || prev.includes(effectiveTargetId);
      const next = exists 
        ? prev.filter(id => id !== userId && id !== effectiveTargetId) 
        : [...prev, effectiveTargetId];

      try {
        localStorage.setItem('nao_following_users', JSON.stringify(next));
      } catch {}

      // Keep allFollows in sync locally immediately
      setAllFollows(prevAll => {
        if (exists) {
          return prevAll.filter(f => !(
            (f.follower_id === currentUser.id || f.follower_id === effectiveFollowerId) && 
            (f.following_id === userId || f.following_id === effectiveTargetId)
          ));
        } else {
          return [...prevAll, { follower_id: effectiveFollowerId, following_id: effectiveTargetId }];
        }
      });

      if (isSupabaseConfigured() && isUUID(effectiveFollowerId) && isUUID(effectiveTargetId)) {
        if (exists) {
          supabase.from('follows').delete().match({ follower_id: effectiveFollowerId, following_id: effectiveTargetId }).then(({ error }) => {
            if (error) enqueueOfflineAction('unfollow_user', { follower_id: effectiveFollowerId, following_id: effectiveTargetId });
          });
        } else {
          supabase.from('follows').insert({ follower_id: effectiveFollowerId, following_id: effectiveTargetId }).then(({ error }) => {
            if (error && error.code !== '23505') {
              enqueueOfflineAction('follow_user', { follower_id: effectiveFollowerId, following_id: effectiveTargetId });
            }
          });
          supabase.channel('public:social_notifications').send({
            type: 'broadcast',
            event: 'new_follower',
            payload: {
              toUserId: effectiveTargetId,
              followerId: currentUser.id,
              followerName: currentUser.name,
              followerHandle: currentUser.handle,
              followerAvatar: currentUser.avatar
            }
          }).then(() => {}).catch(() => {});
        }
      }

      return next;
    });
  };

  // Idempotent follow: guarantees following without accidental unfollowing
  const followUser = (userId: string) => {
    if (!userId || userId === currentUser.id || currentUser.id === 'guest') return;

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const effectiveFollowerId = currentUser.id === 'user-patricio' ? 'a1bac354-0a88-486c-9289-049e75c61c12' : currentUser.id;
    const targetUserObj = users.find(u => u.id === userId || u.handle === userId || u.name === userId);
    const effectiveTargetId = (targetUserObj && isUUID(targetUserObj.id)) ? targetUserObj.id : userId;

    setFollowingUserIds(prev => {
      if (prev.includes(userId) || prev.includes(effectiveTargetId)) return prev;
      const next = [...prev, effectiveTargetId];

      try {
        localStorage.setItem('nao_following_users', JSON.stringify(next));
      } catch {}

      setAllFollows(prevAll => {
        if (prevAll.some(f => 
          (f.follower_id === currentUser.id || f.follower_id === effectiveFollowerId) && 
          (f.following_id === userId || f.following_id === effectiveTargetId)
        )) {
          return prevAll;
        }
        return [...prevAll, { follower_id: effectiveFollowerId, following_id: effectiveTargetId }];
      });

      if (isSupabaseConfigured() && isUUID(effectiveFollowerId) && isUUID(effectiveTargetId)) {
        supabase.from('follows').insert({ follower_id: effectiveFollowerId, following_id: effectiveTargetId }).then(({ error }) => {
          if (error && error.code !== '23505') {
            enqueueOfflineAction('follow_user', { follower_id: effectiveFollowerId, following_id: effectiveTargetId });
          }
        });
        supabase.channel('public:social_notifications').send({
          type: 'broadcast',
          event: 'new_follower',
          payload: {
            toUserId: effectiveTargetId,
            followerId: currentUser.id,
            followerName: currentUser.name,
            followerHandle: currentUser.handle,
            followerAvatar: currentUser.avatar
          }
        }).then(() => {}).catch(() => {});
      }

      return next;
    });
  };

  const getFollowersCountForUser = (userId: string): number => {
    if (!userId) return 0;
    const effectiveTargetId = users.find(u => u.id === userId || u.handle === userId || u.name === userId)?.id || userId;
    const effectiveCurrentId = currentUser.id === 'user-patricio' ? 'a1bac354-0a88-486c-9289-049e75c61c12' : currentUser.id;

    if (effectiveTargetId === effectiveCurrentId || userId === currentUser.id) {
      return followersUserIds.length;
    }
    const fromAll = allFollows.filter(f => f.following_id === effectiveTargetId || f.following_id === userId).length;
    const currentFollowsTarget = followingUserIds.includes(userId) || followingUserIds.includes(effectiveTargetId);
    const countedInAll = allFollows.some(f => 
      (f.follower_id === currentUser.id || f.follower_id === effectiveCurrentId) && 
      (f.following_id === userId || f.following_id === effectiveTargetId)
    );
    if (currentFollowsTarget && !countedInAll) {
      return fromAll + 1;
    }
    return fromAll;
  };

  const getFollowingCountForUser = (userId: string): number => {
    if (!userId) return 0;
    const effectiveTargetId = users.find(u => u.id === userId || u.handle === userId || u.name === userId)?.id || userId;
    const effectiveCurrentId = currentUser.id === 'user-patricio' ? 'a1bac354-0a88-486c-9289-049e75c61c12' : currentUser.id;

    if (effectiveTargetId === effectiveCurrentId || userId === currentUser.id) {
      return followingUserIds.length;
    }
    return allFollows.filter(f => f.follower_id === effectiveTargetId || f.follower_id === userId).length;
  };

  const isFollowingUser = (userId: string) => {
    if (!userId) return false;
    const effectiveTargetId = users.find(u => u.id === userId || u.handle === userId || u.name === userId)?.id || userId;
    return followingUserIds.includes(userId) || followingUserIds.includes(effectiveTargetId);
  };

  const isFollowRequested = (targetUserId: string) => {
    return false;
  };

  const requestToFollowUser = (targetUserId: string) => {
    if (!targetUserId || targetUserId === currentUser.id) return;
    toggleFollowUser(targetUserId);
  };

  const acceptFollowRequest = (requestId: string) => {
    const req = followRequests.find(r => r.id === requestId);
    if (!req) return;

    // Actualizar estado de la solicitud a 'accepted'
    setFollowRequests(prev => prev.filter(r => r.id !== requestId));

    // Agregar al solicitante a la lista de seguidores del usuario actual
    setFollowersUserIds(prev => prev.includes(req.fromUserId) ? prev : [...prev, req.fromUserId]);

    if (isSupabaseConfigured()) {
      supabase.channel('public:social_notifications').send({
        type: 'broadcast',
        event: 'follow_request_accepted',
        payload: { followerId: req.fromUserId, followingId: currentUser.id }
      }).then(() => {}).catch(() => {});

      if (currentUser.id && req.fromUserId) {
        supabase.from('follows').insert({ follower_id: req.fromUserId, following_id: currentUser.id }).then(() => {});
      }
    }
  };

  const rejectFollowRequest = (requestId: string) => {
    setFollowRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const pendingFollowRequests = followRequests.filter(
    r => r.toUserId === currentUser.id && r.status === 'pending'
  );

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
      try {
        localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      try {
        localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const createNotification = (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.APP_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Broadcast vía Supabase realtime
    if (isSupabaseConfigured()) {
      supabase.channel('public:social_notifications').send({
        type: 'broadcast',
        event: 'new_route_published',
        payload: newNotif
      }).then(() => {}).catch(() => {});
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const openPilotProfileById = async (userId: string) => {
    if (!userId) return;

    // Si es el usuario actual, nunca abrir el modal de otro piloto: redirigir a su pestaña propia "Tú"
    const isSelf = userId === currentUser.id || 
      userId === currentUser.handle || 
      (currentUser.handle && currentUser.handle.replace(/^@/, '').toLowerCase() === userId.replace(/^@/, '').toLowerCase());

    if (isSelf) {
      setSelectedPilotProfile(null);
      setActiveNavTab('tu');
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('nao_target_pilot');
          localStorage.removeItem('nao_target_pilot');
          sessionStorage.removeItem('nao_pending_follow');
          localStorage.removeItem('nao_pending_follow');
          document.cookie = 'nao_target_pilot=; path=/; max-age=0;';
        }
      } catch {}
      return;
    }

    const localFound = users.find(u => u.id === userId || u.handle === userId || u.name === userId);

    if (isSupabaseConfigured()) {
      try {
        const isUuid = userId.length === 36 && userId.includes('-');
        const clean = userId.replace(/^@/, '');
        const profilePromise = isUuid
          ? supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
          : supabase.from('profiles').select('*').or(`handle.eq.${userId},handle.eq.@${clean},handle.eq.${clean},name.ilike.%${clean}%`).maybeSingle();

        const { data: p } = await profilePromise;
        const resolvedId = p?.id || (isUuid ? userId : localFound?.id);

        if (resolvedId) {
          // Consultar motos y seguidores del piloto en paralelo para garantizar datos completos
          const [motosRes, followsRes] = await Promise.all([
            supabase.from('motorcycles').select('*').eq('user_id', resolvedId),
            supabase.from('follows').select('*').or(`follower_id.eq.${resolvedId},following_id.eq.${resolvedId}`)
          ]);

          if (motosRes.data && motosRes.data.length > 0) {
            setMotorcycles(prev => {
              const otherMotos = prev.filter(m => m.userId !== resolvedId);
              const mapped = motosRes.data.map((m: any) => mapMotorcycleRow(m));
              const currentForUser = prev.filter(m => m.userId === resolvedId);
              const reconciled = mapped.map(cb => {
                const match = currentForUser.find(lb => lb.id === cb.id || lb.model === cb.model);
                if (match && match.photoUrl && !match.photoUrl.includes('images.unsplash.com')) {
                  return { ...cb, photoUrl: match.photoUrl };
                }
                return cb;
              });
              return [...otherMotos, ...reconciled];
            });
          }

          if (followsRes.data && followsRes.data.length > 0) {
            setAllFollows(prev => {
              const map = new Map(prev.map(f => [`${f.follower_id}_${f.following_id}`, f]));
              followsRes.data.forEach((f: any) => {
                map.set(`${f.follower_id}_${f.following_id}`, { follower_id: f.follower_id, following_id: f.following_id });
              });
              return Array.from(map.values());
            });
          }
        }

        if (p) {
          const remoteUser: User = {
            id: p.id,
            name: p.name || 'Piloto NAO',
            handle: p.handle || `@${(p.name || 'piloto').toLowerCase().replace(/\s+/g, '')}`,
            email: p.email || '',
            avatar: p.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
            bio: p.bio || 'Piloto en NAO.',
            location: p.location || 'México',
            ridingLevel: (p.riding_level as any) || 'Intermedio',
            phone: p.phone,
            emergencyContact: p.emergency_contact
          };
          setUsers(prev => prev.some(u => u.id === remoteUser.id) ? prev.map(u => u.id === remoteUser.id ? remoteUser : u) : [...prev, remoteUser]);
          setSelectedPilotProfile(remoteUser);

          // Si venía pendiente de follow por enlace de invitación (?piloto=...)
          const isPending = typeof window !== 'undefined' && 
            (sessionStorage.getItem('nao_pending_follow') === 'true' || localStorage.getItem('nao_pending_follow') === 'true');

          if (isPending) {
            try {
              sessionStorage.removeItem('nao_pending_follow');
              localStorage.removeItem('nao_pending_follow');
              sessionStorage.removeItem('nao_target_pilot');
              localStorage.removeItem('nao_target_pilot');
              document.cookie = 'nao_target_pilot=; path=/; max-age=0;';
            } catch {}

            setTimeout(() => {
              followUser(remoteUser.id);
              try {
                confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
              } catch {}
            }, 300);
          }
          return;
        }
      } catch (err) {
        console.warn('Error fetching pilot data:', err);
      }
    }

    if (localFound) {
      setSelectedPilotProfile(localFound);
      const isPending = typeof window !== 'undefined' && 
        (sessionStorage.getItem('nao_pending_follow') === 'true' || localStorage.getItem('nao_pending_follow') === 'true');

      if (isPending) {
        try {
          sessionStorage.removeItem('nao_pending_follow');
          localStorage.removeItem('nao_pending_follow');
          sessionStorage.removeItem('nao_target_pilot');
          localStorage.removeItem('nao_target_pilot');
          document.cookie = 'nao_target_pilot=; path=/; max-age=0;';
        } catch {}

        setTimeout(() => {
          followUser(localFound.id);
          try {
            confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
          } catch {}
        }, 300);
      }
      return;
    }

    // Si no está en users, buscar en actividades y participantes
    for (const act of activities) {
      if (act.pilotId === userId) {
        const pilotActs = activities.filter(a => a.pilotId === userId);
        const calcKm = Math.round(pilotActs.reduce((acc, a) => acc + (a.distanceKm || 0), 0) * 10) / 10;
        const calcElev = pilotActs.reduce((acc, a) => acc + (a.elevationGainM || 0), 0);
        setSelectedPilotProfile({
          id: act.pilotId,
          name: act.pilotName,
          handle: act.pilotHandle,
          email: `${act.pilotHandle.replace('@', '')}@nao.club`,
          avatar: act.pilotAvatar,
          bio: `Piloto de NAO. Moto: ${act.motoModel}.`,
          location: act.location || 'México',
          ridingLevel: 'Intermedio',
          stats: {
            totalKm: calcKm,
            completedCount: pilotActs.length,
            elevationGain: calcElev
          }
        });
        return;
      }
      if (act.groupInfo?.participants) {
        const p = act.groupInfo.participants.find(part => part.userId === userId || part.handle === userId);
        if (p) {
          const participantActs = activities.filter(a => 
            a.pilotId === p.userId || 
            a.groupInfo?.participants?.some(part => part.userId === p.userId)
          );
          const calcKm = Math.round(participantActs.reduce((acc, a) => acc + (a.distanceKm || 0), 0) * 10) / 10;
          const calcElev = participantActs.reduce((acc, a) => acc + (a.elevationGainM || 0), 0);
          setSelectedPilotProfile({
            id: p.userId,
            name: p.name,
            handle: p.handle,
            email: `${p.handle.replace('@', '')}@nao.club`,
            avatar: p.avatar,
            bio: `Piloto de la tribu ${act.groupInfo.crewName}. Rodando en ${p.motoModel || 'moto dual-sport'}.`,
            location: 'México',
            ridingLevel: 'Intermedio',
            phone: '',
            stats: {
              totalKm: calcKm,
              completedCount: participantActs.length,
              elevationGain: calcElev
            }
          });
          return;
        }
      }
    }

    // NUNCA hacer fallback al usuario actual
    setSelectedPilotProfile(null);
  };

  const closePilotProfile = () => {
    setSelectedPilotProfile(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('nao_target_pilot');
        sessionStorage.removeItem('nao_target_pilot');
        localStorage.removeItem('nao_pending_follow');
        sessionStorage.removeItem('nao_pending_follow');
        document.cookie = 'nao_target_pilot=; path=/; max-age=0;';
        const url = new URL(window.location.href);
        if (url.searchParams.has('piloto') || url.searchParams.has('pilot')) {
          url.searchParams.delete('piloto');
          url.searchParams.delete('pilot');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch {}
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        motorcycles,
        userBikes,
        addMotorcycle,
        updateMotorcycle,
        deleteMotorcycle,
        crews,
        currentCrew,
        setCurrentCrew,
        enterCrew,
        createCrew,
        updateCrew,
        deleteCrew,
        leaveCrew,
        addCrewMember,
        joinCrewByCode,
        rodadas,
        currentRodada,
        setCurrentRodada,
        enterRodada,
        createRodada,
        updateRodada,
        deleteRodada,
        routeProposals,
        currentRodadaRoutes,
        selectedRoute,
        setSelectedRoute,
        proposeRoute,
        updateRouteProposal,
        deleteRouteProposal,
        voteRoute,
        downvoteRoute,
        addRouteComment,
        lockWinningRoute,
        unlockWinningRoute,
        completeRodada,
        reopenRodada,
        archiveRouteProposal,
        unarchiveRouteProposal,
        rsvpRodada,
        togglePackingItem,
        assignPackingItem,
        addPackingItem,
        addGalleryPhoto,
        activities,
        deleteActivity,
        toggleKudo,
        addActivityComment,
        addRecordedActivity,
        challenges,
        toggleJoinChallenge,
        completedRouteIds,
        savedRouteIds,
        routeLists,
        toggleCompletedRoute,
        toggleSavedRoute,
        createRouteList,
        addRouteToList,
        removeRouteFromList,
        saveActivityAsRoute,
        selectedPilotProfile,
        setSelectedPilotProfile,
        openPilotProfileById,
        closePilotProfile,
        followingUserIds,
        followersUserIds,
        allFollows,
        getFollowersCountForUser,
        getFollowingCountForUser,
        toggleFollowUser,
        followUser,
        isFollowingUser,
        followRequests,
        pendingFollowRequests,
        requestToFollowUser,
        acceptFollowRequest,
        rejectFollowRequest,
        isFollowRequested,
        notifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        createNotification,
        activeNavTab,
        setActiveNavTab,
        crewMessages,
        sendCrewMessage,
        isAuthModalOpen,
        setAuthModalOpen,
        isSupabaseOnline,
        isAuthLoading,
        isAuthenticated,
        switchCurrentUser,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        isOnboardingOpen,
        setOnboardingOpen,
        completeOnboarding,
        founderUserNumber,
        dismissFounderWelcome,
        currentUserFounderNumber,
        founderFeedbacks,
        sendFounderFeedback,
        markFeedbackStatus,
        deleteFeedback,
        checkHandleAvailability,
        updateCurrentUserProfile,
        refreshUsers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
