'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Motorcycle, 
  Crew, 
  CrewMember,
  Rodada, 
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
  routeProposals: RouteProposal[];
  currentRodadaRoutes: RouteProposal[];
  selectedRoute: RouteProposal | null;
  setSelectedRoute: (route: RouteProposal | null) => void;
  proposeRoute: (data: Omit<RouteProposal, 'id' | 'votes' | 'comments'>) => void;
  deleteRouteProposal: (routeId: string) => boolean;
  voteRoute: (routeId: string) => void;
  downvoteRoute: (routeId: string) => void;
  addRouteComment: (routeId: string, text: string) => void;
  lockWinningRoute: (rodadaId: string, routeId: string) => void;
  unlockWinningRoute: (rodadaId: string) => void;
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
}

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
      id: `user-${Date.now()}`,
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
        id: `user-${Date.now()}`,
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

  // Sign In with Google OAuth
  const signInWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured()) {
      try {
        const redirectUrl = typeof window !== 'undefined' 
          ? window.location.origin 
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
        parsed = parsed.map(c => {
          const coverOverride = customCovers[c.id];
          if (c.id === 'crew-motomami') {
            const currentMembers = Array.isArray(c.members) ? [...c.members] : [];
            INITIAL_CREWS[0].members.forEach(initM => {
              if (!currentMembers.some(m => m.userId === initM.userId)) {
                currentMembers.push(initM);
              }
            });
            return {
              ...c,
              coverImage: coverOverride || c.coverImage,
              name: 'MotoMami',
              inviteCode: 'MAMI-2026',
              members: currentMembers,
              whatsappGroupUrl: 'https://chat.whatsapp.com/Jg1AKUEqoXF7nXZuAPJ588'
            };
          }
          if (c.id === 'crew-sierrabrava') {
            const currentMembers = Array.isArray(c.members) ? [...c.members] : [];
            INITIAL_CREWS[1].members.forEach(initM => {
              if (!currentMembers.some(m => m.userId === initM.userId)) {
                currentMembers.push(initM);
              }
            });
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
            coverImage: coverOverride || c.coverImage
          };
        });

        // Filtrar tribus eliminadas (tombstones)
        let deletedCrewIds: string[] = [];
        try {
          const savedDeleted = localStorage.getItem(STORAGE_KEYS.DELETED_CREWS);
          if (savedDeleted) deletedCrewIds = JSON.parse(savedDeleted);
        } catch {}
        const deletedSet = new Set(deletedCrewIds);

        // Remove duplicates by ID and by Normalized Name/Slug, excluyendo eliminados
        const seenNames = new Set<string>();
        const uniqueCrews: Crew[] = [];
        for (const c of parsed) {
          if (deletedSet.has(c.id)) continue;
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
            const sanitizedActs = parsedActs.map((act: ActivityPost) => {
              if (act.groupInfo && act.groupInfo.crewName) {
                return {
                  ...act,
                  groupInfo: {
                    ...act.groupInfo,
                    crewName: act.groupInfo.crewName.replace(/MotoMami/gi, 'NAO')
                  }
                };
              }
              return act;
            });
            setActivities(sanitizedActs);
          }
        } catch {}
      }

      const savedRodadas = localStorage.getItem(STORAGE_KEYS.RODADAS);
      if (savedRodadas) {
        const parsed = JSON.parse(savedRodadas);
        setRodadas(parsed);
        if (parsed.length > 0) setCurrentRodada(parsed[0]);
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
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data && data.length > 0) {
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
          emergencyContact: p.emergency_contact
        }));
        setUsers(prev => {
          const cloudIds = new Set(mappedUsers.map(u => u.id));
          return [...mappedUsers, ...prev.filter(u => !cloudIds.has(u.id))];
        });
      }
    });

    // Hydrate crews from cloud
    supabase.from('crews').select('*, crew_members(*)').then(({ data }) => {
      if (data && data.length > 0) {
        const mappedCrews: Crew[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          tagline: c.tagline || '',
          description: c.description || '',
          inviteCode: c.invite_code,
          coverImage: c.cover_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
          baseCity: c.base_city || 'México',
          creatorId: c.creator_id || '',
          members: (c.crew_members || []).map((m: any) => ({
            userId: m.user_id,
            role: m.role || 'Rider',
            joinedAt: m.joined_at?.split('T')[0] || ''
          })),
          whatsappGroupUrl: c.whatsapp_group_url,
          createdAt: c.created_at?.split('T')[0] || ''
        }));
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
          const deletedSet = new Set(deletedCrewIds);

          const cloudIds = new Set(mergedMapped.map(cr => cr.id));
          const allCrews = [...mergedMapped, ...prev.filter(cr => !cloudIds.has(cr.id))];

          const seenNames = new Set<string>();
          const finalCrews: Crew[] = [];
          for (const c of allCrews) {
            if (deletedSet.has(c.id)) continue;
            const normKey = (c.slug || c.name.toLowerCase().trim().replace(/\s+/g, '-'));
            if (!seenNames.has(normKey)) {
              seenNames.add(normKey);
              finalCrews.push(c);
            }
          }

          // Sincronizar currentCrew si ya estaba seleccionado y pertenece a él
          setCurrentCrew(curr => {
            if (!curr) return null;
            const updatedCurr = finalCrews.find(c => c.id === curr.id);
            return updatedCurr || null;
          });

          return finalCrews;
        });
      }
    });

    // Hydrate follows from cloud and sync requests
    supabase.from('follows').select('*').then(async ({ data: followsData }) => {
      if (followsData) {
        setAllFollows(followsData.map((f: any) => ({ follower_id: f.follower_id, following_id: f.following_id })));

        const cloudFollowing = followsData
          .filter((f: any) => f.follower_id === currentUser.id)
          .map((f: any) => f.following_id);
        setFollowingUserIds(cloudFollowing);

        const cloudFollowers = followsData
          .filter((f: any) => f.following_id === currentUser.id)
          .map((f: any) => f.follower_id);
        setFollowersUserIds(cloudFollowers);

        // Si alguien sigue a currentUser pero no estaba reconocido en followRequests locales,
        // generar notificación visible en la campana
        if (currentUser.id && currentUser.id !== 'guest' && cloudFollowers.length > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('*');
          if (profilesData && profilesData.length > 0) {
            const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
            setFollowRequests(prev => {
              const existingFromIds = new Set(prev.map(r => r.fromUserId));
              const newReqs: FollowRequest[] = [];
              cloudFollowers.forEach((followerId: string) => {
                if (!existingFromIds.has(followerId)) {
                  const prof = profilesMap.get(followerId);
                  if (prof) {
                    newReqs.push({
                      id: `cloud-follow-${followerId}`,
                      fromUserId: prof.id,
                      fromUserName: prof.name || 'Piloto',
                      fromUserHandle: prof.handle || '@piloto',
                      fromUserAvatar: prof.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
                      toUserId: currentUser.id,
                      createdAt: new Date().toISOString(),
                      status: 'pending'
                    });
                  }
                }
              });
              return newReqs.length > 0 ? [...newReqs, ...prev] : prev;
            });
          }
        }
      }
    });

    // Hydrate motorcycles from cloud
    supabase.from('motorcycles').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        const mappedMotos: Motorcycle[] = data.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          brand: m.brand,
          model: m.model,
          year: m.year || 2023,
          displacementCc: m.displacement_cc || 500,
          type: (m.type as any) || 'Doble Propósito',
          nickname: m.nickname || '',
          photoUrl: m.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
          modifications: m.modifications || [],
          tires: m.tires || ''
        }));
        setMotorcycles(prev => {
          const cloudIds = new Set(mappedMotos.map(b => b.id));
          return [...mappedMotos, ...prev.filter(b => !cloudIds.has(b.id))];
        });
      }
    });

    // Hydrate activities (publicaciones reales) from cloud
    supabase.from('activities').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        const mappedActs: ActivityPost[] = data.map((a: any) => ({
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
          kudosCount: 0,
          hasKudoed: false,
          kudosAvatars: [],
          commentsCount: 0,
          comments: [],
          coordinates: a.route_coordinates || [],
          surfaceBreakdown: a.surface_breakdown || { asphaltPercentage: 50, dirtPercentage: 50, curveDensity: 'Media' },
          photos: a.photos || [],
          groupInfo: a.group_info
        }));
        setActivities(mappedActs);
      }
    });

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

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(crewsChannel);
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
      localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
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

  const addMotorcycle = (bikeData: Omit<Motorcycle, 'id'>) => {
    const newBike: Motorcycle = {
      ...bikeData,
      id: `moto-${Date.now()}`
    };
    setMotorcycles(prev => [newBike, ...prev]);

    if (isSupabaseConfigured() && currentUser.id && currentUser.id.length === 36) {
      supabase.from('motorcycles').insert({
        user_id: currentUser.id,
        brand: bikeData.brand,
        model: bikeData.model,
        year: bikeData.year,
        displacement_cc: bikeData.displacementCc,
        nickname: bikeData.nickname || null,
        image_url: bikeData.photoUrl || null,
        tires: bikeData.tires || null
      }).then(() => {});
    }
  };

  const updateMotorcycle = (id: string, updates: Partial<Motorcycle>) => {
    setMotorcycles(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    if (supabase) {
      supabase.from('motorcycles').update(updates).eq('id', id).then(() => {});
    }
  };

  const deleteMotorcycle = (id: string) => {
    setMotorcycles(prev => prev.filter(m => m.id !== id));
    if (isSupabaseConfigured()) {
      supabase.from('motorcycles').delete().eq('id', id).then(() => {});
    }
  };

  const createCrew = (data: { name: string; tagline: string; description: string; baseCity: string; coverImage: string; whatsappGroupUrl?: string }) => {
    const randomCode = `MAMI-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCrew: Crew = {
      id: `crew-${Date.now()}`,
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
        creator_id: currentUser.id && currentUser.id.length === 36 ? currentUser.id : null,
        whatsapp_group_url: newCrew.whatsappGroupUrl
      }).then(() => {
        if (currentUser.id && currentUser.id.length === 36) {
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
      id: `msg-${Date.now()}`,
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

    if (isSupabaseConfigured() && currentUser.id && currentUser.id.length === 36) {
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

    if (isSupabaseConfigured() && userId && userId.length === 36) {
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
      id: `rodada-${Date.now()}`,
      crewId: currentCrew?.id || 'crew-motomami',
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
    return newRodada;
  };

  const currentRodadaRoutes = routeProposals.filter(r => r.rodadaId === currentRodada?.id);

  const proposeRoute = (data: Omit<RouteProposal, 'id' | 'votes' | 'comments'>) => {
    const newRoute: RouteProposal = {
      ...data,
      id: `route-${Date.now()}`,
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
        id: `msg-sys-${Date.now()}`,
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
  };

  const deleteRouteProposal = (routeId: string): boolean => {
    const targetRoute = routeProposals.find(r => r.id === routeId);
    if (!targetRoute) return false;

    // Security check: Only author / creator can delete their route
    const isOwner = 
      (targetRoute.proposedByUserId && targetRoute.proposedByUserId === currentUser.id) ||
      (targetRoute.proposedByName && targetRoute.proposedByName.toLowerCase().trim() === currentUser.name?.toLowerCase().trim());

    if (!isOwner) {
      console.warn('Unauthorized: Only the creator of the route can delete it.');
      return false;
    }

    setRouteProposals(prev => {
      const updated = prev.filter(r => r.id !== routeId);
      try {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedRoute?.id === routeId) {
      setSelectedRoute(null);
    }

    return true;
  };

  const voteRoute = (routeId: string) => {
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
  };

  const addRouteComment = (routeId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
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
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return { ...rd, winningRouteId: routeId, status: 'fijada' };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, winningRouteId: routeId, status: 'fijada' });
    }
  };

  const unlockWinningRoute = (rodadaId: string) => {
    setRodadas(prev => prev.map(rd => {
      if (rd.id === rodadaId) {
        return { ...rd, winningRouteId: undefined, status: 'votacion' };
      }
      return rd;
    }));
    if (currentRodada && currentRodada.id === rodadaId) {
      setCurrentRodada({ ...currentRodada, winningRouteId: undefined, status: 'votacion' });
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
      id: `pack-${Date.now()}`,
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
      id: `photo-${Date.now()}`,
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
      id: `list-${Date.now()}`,
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

  const toggleKudo = (activityId: string) => {
    setActivities(prev => prev.map(act => {
      if (act.id === activityId) {
        const isNowKudoed = !act.hasKudoed;
        return {
          ...act,
          hasKudoed: isNowKudoed,
          kudosCount: isNowKudoed ? act.kudosCount + 1 : Math.max(0, act.kudosCount - 1),
          kudosAvatars: isNowKudoed 
            ? [currentUser.avatar, ...act.kudosAvatars.filter(a => a !== currentUser.avatar)]
            : act.kudosAvatars.filter(a => a !== currentUser.avatar)
        };
      }
      return act;
    }));
  };

  const addActivityComment = (activityId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: ActivityComment = {
      id: `comment-${Date.now()}`,
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
    const newActId = `act-${Date.now()}`;
    const newAct: ActivityPost = {
      ...data,
      id: newActId,
      kudosCount: 1,
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

    if (isSupabaseConfigured() && currentUser.id && currentUser.id.length === 36) {
      supabase.from('activities').insert({
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
        group_info: data.groupInfo || null
      }).then(() => {});
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
    setFollowingUserIds(prev => {
      const exists = prev.includes(userId);
      const next = exists ? prev.filter(id => id !== userId) : [...prev, userId];

      // Also keep allFollows in sync locally
      setAllFollows(prevAll => {
        if (exists) {
          return prevAll.filter(f => !(f.follower_id === currentUser.id && f.following_id === userId));
        } else {
          return [...prevAll, { follower_id: currentUser.id, following_id: userId }];
        }
      });

      if (isSupabaseConfigured() && currentUser.id && currentUser.id.length === 36 && userId.length === 36) {
        if (exists) {
          supabase.from('follows').delete().match({ follower_id: currentUser.id, following_id: userId }).then(() => {});
        } else {
          supabase.from('follows').insert({ follower_id: currentUser.id, following_id: userId }).then(() => {});
        }
      }

      return next;
    });
  };

  const getFollowersCountForUser = (userId: string): number => {
    if (!userId) return 0;
    // If checking current logged-in user, use followersUserIds length
    if (userId === currentUser.id) {
      return followersUserIds.length;
    }
    // Count how many records have following_id === userId in allFollows
    const fromAll = allFollows.filter(f => f.following_id === userId).length;
    // Also check if current user is following this user locally
    const currentFollowsTarget = followingUserIds.includes(userId);
    const countedInAll = allFollows.some(f => f.follower_id === currentUser.id && f.following_id === userId);
    if (currentFollowsTarget && !countedInAll) {
      return fromAll + 1;
    }
    return fromAll;
  };

  const getFollowingCountForUser = (userId: string): number => {
    if (!userId) return 0;
    // If checking current logged-in user, use followingUserIds length
    if (userId === currentUser.id) {
      return followingUserIds.length;
    }
    return allFollows.filter(f => f.follower_id === userId).length;
  };

  const isFollowingUser = (userId: string) => {
    return followingUserIds.includes(userId);
  };

  const isFollowRequested = (targetUserId: string) => {
    return followRequests.some(
      r => r.fromUserId === currentUser.id && r.toUserId === targetUserId && r.status === 'pending'
    );
  };

  const requestToFollowUser = (targetUserId: string) => {
    if (!targetUserId || targetUserId === currentUser.id) return;

    // Si ya lo sigue, no hacer nada o dejar de seguir
    if (isFollowingUser(targetUserId)) {
      toggleFollowUser(targetUserId);
      return;
    }

    // Si ya mandó solicitud, retirarla
    const existingIndex = followRequests.findIndex(
      r => r.fromUserId === currentUser.id && r.toUserId === targetUserId && r.status === 'pending'
    );
    if (existingIndex >= 0) {
      setFollowRequests(prev => prev.filter((_, idx) => idx !== existingIndex));
      return;
    }

    // Crear nueva solicitud
    const newReq: FollowRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserHandle: currentUser.handle,
      fromUserAvatar: currentUser.avatar,
      toUserId: targetUserId,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Broadcast en Realtime para que el receptor lo vea inmediatamente en su campana
    if (isSupabaseConfigured()) {
      supabase.channel('public:social_notifications').send({
        type: 'broadcast',
        event: 'new_follow_request',
        payload: newReq
      }).then(() => {}).catch(() => {});

      // Sincronizar en tabla follows si ambos son UUIDs
      if (currentUser.id?.length === 36 && targetUserId.length === 36) {
        supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetUserId }).then(() => {});
      }
    }

    setFollowRequests(prev => [newReq, ...prev]);
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

      if (currentUser.id?.length === 36 && req.fromUserId.length === 36) {
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

  const openPilotProfileById = (userId: string) => {
    if (!userId) return;

    // Si es el usuario actual, nunca abrir el modal de otro piloto: redirigir a su pestaña propia "Tú"
    if (userId === currentUser.id || userId === currentUser.handle) {
      setSelectedPilotProfile(null);
      setActiveNavTab('tu');
      return;
    }

    const found = users.find(u => u.id === userId || u.handle === userId || u.name === userId);
    if (found) {
      setSelectedPilotProfile(found);
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

    // Si no se encontró en memoria local, consultar Supabase directamente
    if (isSupabaseConfigured()) {
      const isUuid = userId.length === 36 && userId.includes('-');
      const queryBuilder = supabase.from('profiles').select('*');
      const finalQuery = isUuid 
        ? queryBuilder.eq('id', userId) 
        : queryBuilder.or(`handle.eq.${userId},handle.eq.@${userId.replace(/^@/, '')},name.ilike.%${userId}%`);

      finalQuery.maybeSingle().then(async ({ data: p }) => {
        if (p) {
          // Obtener motos de este usuario si existen
          const { data: userMotos } = await supabase.from('motorcycles').select('*').eq('user_id', p.id);
          if (userMotos && userMotos.length > 0) {
            setMotorcycles(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMotos = userMotos
                .filter((m: any) => !existingIds.has(m.id))
                .map((m: any) => ({
                  id: m.id,
                  userId: m.user_id,
                  brand: m.brand,
                  model: m.model,
                  year: m.year || 2023,
                  displacementCc: m.displacement_cc || 500,
                  type: (m.type as any) || 'Doble Propósito',
                  nickname: m.nickname || '',
                  photoUrl: m.image_url || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
                  modifications: m.modifications || [],
                  tires: m.tires || ''
                }));
              return [...prev, ...newMotos];
            });
          }

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

          // Guardarlo en users para el caché local
          setUsers(prev => prev.some(u => u.id === remoteUser.id) ? prev : [...prev, remoteUser]);
          setSelectedPilotProfile(remoteUser);
        } else {
          setSelectedPilotProfile(null);
        }
      });
      return;
    }

    // NUNCA hacer fallback al usuario actual
    setSelectedPilotProfile(null);
  };

  const closePilotProfile = () => {
    setSelectedPilotProfile(null);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('piloto')) {
          url.searchParams.delete('piloto');
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
        routeProposals,
        currentRodadaRoutes,
        selectedRoute,
        setSelectedRoute,
        proposeRoute,
        deleteRouteProposal,
        voteRoute,
        downvoteRoute,
        addRouteComment,
        lockWinningRoute,
        unlockWinningRoute,
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
        updateCurrentUserProfile
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
