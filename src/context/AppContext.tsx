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
  RsvpStatus
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
  followingUserIds: string[];
  toggleFollowUser: (userId: string) => void;
  isFollowingUser: (userId: string) => boolean;
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
  updateCurrentUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'motomami_current_user',
  MOTORCYCLES: 'motomami_motorcycles',
  CREWS: 'motomami_crews',
  RODADAS: 'motomami_rodadas',
  ROUTES: 'motomami_routes',
  ACTIVITIES: 'nao_activities_v2',
  CHALLENGES: 'nao_challenges',
  CREW_MESSAGES: 'motomami_crew_messages'
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
  const [currentCrew, setCurrentCrew] = useState<Crew | null>(INITIAL_CREWS[0]);
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
        } catch {}
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
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  };

  // Sign Up with Supabase / Local Fallback
  const signUp = async (email: string, password: string, name: string, handle: string): Promise<{ success: boolean; message: string }> => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            handle,
            avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250'
          }
        }
      });
      if (error) {
        return { success: false, message: error.message };
      }
      if (data.user) {
        const newPilot: User = {
          id: data.user.id,
          name,
          handle,
          email,
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          bio: 'Piloto en NAO.',
          location: 'México',
          ridingLevel: 'Intermedio'
        };
        setCurrentUser(newPilot);
        setUsers(prev => [newPilot, ...prev]);
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
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined
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
  const updateCurrentUserProfile = async (updates: Partial<User>) => {
    const updated: User = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured() && currentUser.id) {
      try {
        await supabase.from('profiles').update({
          name: updated.name,
          handle: updated.handle,
          bio: updated.bio,
          location: updated.location,
          riding_level: updated.ridingLevel,
          phone: updated.phone,
          emergency_contact: updated.emergencyContact,
          avatar_url: updated.avatar
        }).eq('id', currentUser.id);
      } catch (err) {
        console.error('Error updating Supabase profile:', err);
      }
    }
  };

  // Moto Expeditions & Social state
  const [activities, setActivities] = useState<ActivityPost[]>(INITIAL_ACTIVITIES);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [completedRouteIds, setCompletedRouteIds] = useState<string[]>(CURRENT_USER.completedRouteIds || ['route-1', 'route-4']);
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>(CURRENT_USER.savedRouteIds || ['route-2', 'route-3', 'route-5']);
  const [routeLists, setRouteLists] = useState<RouteList[]>(INITIAL_ROUTE_LISTS);
  const [selectedPilotProfile, setSelectedPilotProfile] = useState<User | null>(null);
  const [followingUserIds, setFollowingUserIds] = useState<string[]>(['user-manuel', 'user-mich']);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedFollowing = localStorage.getItem('nao_following_users');
      if (savedFollowing) setFollowingUserIds(JSON.parse(savedFollowing));

      const savedMotos = localStorage.getItem(STORAGE_KEYS.MOTORCYCLES);
      if (savedMotos) {
        const parsedMotos: Motorcycle[] = JSON.parse(savedMotos);
        INITIAL_MOTORCYCLES.forEach(initM => {
          if (!parsedMotos.some(m => m.id === initM.id)) {
            parsedMotos.push(initM);
          }
        });
        setMotorcycles(parsedMotos);
      }

      const savedCrews = localStorage.getItem(STORAGE_KEYS.CREWS);
      if (savedCrews) {
        let parsed: Crew[] = JSON.parse(savedCrews);
        parsed = parsed.map(c => {
          if (c.id === 'crew-motomami') {
            const currentMembers = Array.isArray(c.members) ? [...c.members] : [];
            INITIAL_CREWS[0].members.forEach(initM => {
              if (!currentMembers.some(m => m.userId === initM.userId)) {
                currentMembers.push(initM);
              }
            });
            return {
              ...c,
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
              members: currentMembers,
              whatsappGroupUrl: isDummyLink ? undefined : c.whatsappGroupUrl
            };
          }
          return c;
        });
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(parsed));
        setCrews(parsed);
        const myCrew = parsed.find(c => c.members.some(m => m.userId === CURRENT_USER.id)) || parsed[0];
        setCurrentCrew(myCrew);
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
          const cloudIds = new Set(mappedCrews.map(cr => cr.id));
          return [...mappedCrews, ...prev.filter(cr => !cloudIds.has(cr.id))];
        });
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      localStorage.setItem('nao_following_users', JSON.stringify(followingUserIds));
    } catch (e) { console.error(e); }
  }, [followingUserIds]);

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
    setCurrentCrew(prev => (prev && prev.id === crewId ? { ...prev, ...updates } : prev));
    if (updates.name || updates.members) {
      syncActivitiesWithCrew(crewId, updates.name, updates.members);
    }
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
    setCrewMessages(prev => [...prev, newMsg]);

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
      const isMember = found.members.some(m => m.userId === currentUser.id);
      if (!isMember) {
        // No se permite ver el detalle de clubes a los que no perteneces
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
        const isMember = associatedCrew.members.some(m => m.userId === currentUser.id);
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
    setRouteProposals(prev => [newRoute, ...prev]);
    setSelectedRoute(newRoute);
    setActiveNavTab('crew');
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
    setRouteProposals(prev => prev.map(r => {
      if (r.id === routeId) {
        return { ...r, comments: [...r.comments, newComment] };
      }
      return r;
    }));
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
    setActivities(prev => [newAct, ...prev]);

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

  const isFollowingUser = (userId: string) => {
    return followingUserIds.includes(userId);
  };

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
        setSelectedPilotProfile({
          id: act.pilotId,
          name: act.pilotName,
          handle: act.pilotHandle,
          email: `${act.pilotHandle.replace('@', '')}@nao.club`,
          avatar: act.pilotAvatar,
          bio: `Piloto de NAO. Moto: ${act.motoModel}.`,
          location: act.location || 'México',
          ridingLevel: 'Avanzado',
          stats: {
            totalKm: Math.round(act.distanceKm * 18),
            completedCount: 15,
            elevationGain: act.elevationGainM * 12
          }
        });
        return;
      }
      if (act.groupInfo?.participants) {
        const p = act.groupInfo.participants.find(part => part.userId === userId || part.handle === userId);
        if (p) {
          setSelectedPilotProfile({
            id: p.userId,
            name: p.name,
            handle: p.handle,
            email: `${p.handle.replace('@', '')}@nao.club`,
            avatar: p.avatar,
            bio: `Piloto de la tribu ${act.groupInfo.crewName}. Rodando en ${p.motoModel || 'moto dual-sport'}.`,
            location: 'México',
            ridingLevel: 'Avanzado',
            phone: '+52 55 4567 8901',
            stats: {
              totalKm: 5120,
              completedCount: 26,
              elevationGain: 21800
            }
          });
          return;
        }
      }
    }

    // NUNCA hacer fallback al usuario actual
    setSelectedPilotProfile(null);
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
        followingUserIds,
        toggleFollowUser,
        isFollowingUser,
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
