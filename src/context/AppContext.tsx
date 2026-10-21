'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Motorcycle, 
  Crew, 
  Rodada, 
  RouteProposal, 
  PackingItem,
  RodadaAttendee
} from '../types';
import { 
  CURRENT_USER, 
  INITIAL_USERS, 
  INITIAL_MOTORCYCLES, 
  INITIAL_CREWS, 
  INITIAL_RODADA, 
  INITIAL_ROUTE_PROPOSALS 
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  motorcycles: Motorcycle[];
  userBikes: Motorcycle[];
  addMotorcycle: (bike: Omit<Motorcycle, 'id'>) => void;
  deleteMotorcycle: (id: string) => void;
  crews: Crew[];
  currentCrew: Crew | null;
  setCurrentCrew: (crew: Crew | null) => void;
  createCrew: (data: { name: string; tagline: string; description: string; baseCity: string; coverImage: string }) => Crew;
  joinCrewByCode: (code: string) => { success: boolean; message: string; crew?: Crew };
  rodadas: Rodada[];
  currentRodada: Rodada | null;
  setCurrentRodada: (rodada: Rodada | null) => void;
  createRodada: (data: { title: string; subtitle: string; description: string; category: Rodada['category']; startDate: string; endDate: string; originPoint: string }) => Rodada;
  routeProposals: RouteProposal[];
  currentRodadaRoutes: RouteProposal[];
  selectedRoute: RouteProposal | null;
  setSelectedRoute: (route: RouteProposal | null) => void;
  proposeRoute: (data: Omit<RouteProposal, 'id' | 'votes' | 'comments'>) => void;
  voteRoute: (routeId: string) => void;
  addRouteComment: (routeId: string, text: string) => void;
  lockWinningRoute: (rodadaId: string, routeId: string) => void;
  unlockWinningRoute: (rodadaId: string) => void;
  rsvpRodada: (rodadaId: string, motorcycleId: string, status: 'confirmado' | 'interesado') => void;
  togglePackingItem: (rodadaId: string, itemId: string) => void;
  assignPackingItem: (rodadaId: string, itemId: string, userId: string, userName: string) => void;
  addPackingItem: (rodadaId: string, item: string, category: PackingItem['category']) => void;
  addGalleryPhoto: (rodadaId: string, url: string, caption: string) => void;
  activeNavTab: 'rodada' | 'rutas' | 'crew' | 'garaje' | 'brand';
  setActiveNavTab: (tab: 'rodada' | 'rutas' | 'crew' | 'garaje' | 'brand') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'motomami_current_user',
  MOTORCYCLES: 'motomami_motorcycles',
  CREWS: 'motomami_crews',
  RODADAS: 'motomami_rodadas',
  ROUTES: 'motomami_routes'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [users] = useState<User[]>(INITIAL_USERS);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(INITIAL_MOTORCYCLES);
  const [crews, setCrews] = useState<Crew[]>(INITIAL_CREWS);
  const [currentCrew, setCurrentCrew] = useState<Crew | null>(INITIAL_CREWS[0]);
  const [rodadas, setRodadas] = useState<Rodada[]>([INITIAL_RODADA]);
  const [currentRodada, setCurrentRodada] = useState<Rodada | null>(INITIAL_RODADA);
  const [routeProposals, setRouteProposals] = useState<RouteProposal[]>(INITIAL_ROUTE_PROPOSALS);
  const [selectedRoute, setSelectedRoute] = useState<RouteProposal | null>(INITIAL_ROUTE_PROPOSALS[0]);
  const [activeNavTab, setActiveNavTab] = useState<'rodada' | 'rutas' | 'crew' | 'garaje' | 'brand'>('rodada');

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedMotos = localStorage.getItem(STORAGE_KEYS.MOTORCYCLES);
      if (savedMotos) setMotorcycles(JSON.parse(savedMotos));

      const savedCrews = localStorage.getItem(STORAGE_KEYS.CREWS);
      if (savedCrews) {
        const parsed = JSON.parse(savedCrews);
        setCrews(parsed);
        if (parsed.length > 0) setCurrentCrew(parsed[0]);
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
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Save changes
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

  const userBikes = motorcycles.filter(m => m.userId === currentUser.id);

  const addMotorcycle = (bikeData: Omit<Motorcycle, 'id'>) => {
    const newBike: Motorcycle = {
      ...bikeData,
      id: `moto-${Date.now()}`
    };
    setMotorcycles(prev => [newBike, ...prev]);
  };

  const deleteMotorcycle = (id: string) => {
    setMotorcycles(prev => prev.filter(m => m.id !== id));
  };

  const createCrew = (data: { name: string; tagline: string; description: string; baseCity: string; coverImage: string }) => {
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
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        { userId: currentUser.id, role: 'Capitán de Ruta', joinedAt: new Date().toISOString().split('T')[0] }
      ]
    };
    setCrews(prev => [newCrew, ...prev]);
    setCurrentCrew(newCrew);
    return newCrew;
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
      return { success: true, message: `Ya eres miembro de ${found.name}`, crew: found };
    }
    const updated: Crew = {
      ...found,
      members: [...found.members, { userId: currentUser.id, role: 'Rider', joinedAt: new Date().toISOString().split('T')[0] }]
    };
    setCrews(prev => prev.map(c => c.id === found.id ? updated : c));
    setCurrentCrew(updated);
    return { success: true, message: `¡Te uniste a ${found.name}! Bienvenido a bordo.`, crew: updated };
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
  };

  const voteRoute = (routeId: string) => {
    setRouteProposals(prev => prev.map(r => {
      if (r.id === routeId) {
        const hasVoted = r.votes.includes(currentUser.id);
        const newVotes = hasVoted 
          ? r.votes.filter(id => id !== currentUser.id)
          : [...r.votes, currentUser.id];
        return { ...r, votes: newVotes };
      }
      return r;
    }));
    setSelectedRoute(prev => {
      if (!prev || prev.id !== routeId) return prev;
      const hasVoted = prev.votes.includes(currentUser.id);
      const newVotes = hasVoted
        ? prev.votes.filter(id => id !== currentUser.id)
        : [...prev.votes, currentUser.id];
      return { ...prev, votes: newVotes };
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

  const rsvpRodada = (rodadaId: string, motorcycleId: string, status: 'confirmado' | 'interesado') => {
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
        return { ...rd, attendees: updatedAttendees };
      }
      return rd;
    }));
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        motorcycles,
        userBikes,
        addMotorcycle,
        deleteMotorcycle,
        crews,
        currentCrew,
        setCurrentCrew,
        createCrew,
        joinCrewByCode,
        rodadas,
        currentRodada,
        setCurrentRodada,
        createRodada,
        routeProposals,
        currentRodadaRoutes,
        selectedRoute,
        setSelectedRoute,
        proposeRoute,
        voteRoute,
        addRouteComment,
        lockWinningRoute,
        unlockWinningRoute,
        rsvpRodada,
        togglePackingItem,
        assignPackingItem,
        addPackingItem,
        addGalleryPhoto,
        activeNavTab,
        setActiveNavTab
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
