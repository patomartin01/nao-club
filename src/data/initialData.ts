import { User, Motorcycle, Crew, Rodada, RouteProposal, RouteList, ActivityPost, Challenge, CrewChatMessage } from '../types';

export const CURRENT_USER: User = {
  id: 'a1bac354-0a88-486c-9289-049e75c61c12',
  name: 'Patricio Martin Vidal',
  handle: '@pmartinv2001',
  email: 'pmartin.v2001@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  bio: 'Piloto multidisciplinario y miembro de MotoMami. Rodando carretera revirada, pistas y terracería. Salidas desde Interlomas.',
  location: 'Interlomas / CDMX',
  ridingLevel: 'Intermedio',
  emergencyContact: '+52 55 1234 5678 (Papá)',
  phone: '+52 55 9876 5432',
  completedRouteIds: [],
  savedRouteIds: [],
  stats: {
    totalKm: 0,
    completedCount: 0,
    elevationGain: 0
  }
};

export const INITIAL_USERS: User[] = [
  CURRENT_USER
];

export const INITIAL_MOTORCYCLES: Motorcycle[] = [];

export const INITIAL_CREWS: Crew[] = [
  {
    id: 'crew-1793316469201',
    name: 'Motomami',
    slug: 'motomami',
    tagline: 'Terracería, sierra, fogatas y doble propósito sin drama.',
    description: 'Comunidad de amigos apasionados por las motos trail y doble propósito. Rodamos fines de semana y puentes buscando campamentos base remotos, brechas forestales y buena comida.',
    inviteCode: 'MAMI-9408',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    baseCity: 'Interlomas / CDMX',
    creatorId: 'a1bac354-0a88-486c-9289-049e75c61c12',
    createdAt: '2026-10-29',
    members: [
      { userId: 'a1bac354-0a88-486c-9289-049e75c61c12', role: 'Capitán de Ruta', joinedAt: '2026-10-29' },
      { userId: '4ef9e183-2a42-4479-a091-6abebbfe5cb1', role: 'Rider', joinedAt: '2026-11-20' },
      { userId: '2aaa8305-2851-442f-a7cb-ad99d28e6bed', role: 'Rider', joinedAt: '2026-11-20' },
      { userId: 'be5c1d63-53f1-4a65-93ec-e021f104809a', role: 'Rider', joinedAt: '2026-11-20' },
      { userId: '416b1eda-5865-481d-bac2-3bebf20ffd51', role: 'Rider', joinedAt: '2026-11-20' },
      { userId: 'patomartin', role: 'Rider', joinedAt: '2026-11-20' }
    ],
    whatsappGroupUrl: 'https://chat.whatsapp.com/Jg1AKUEqoXF7nXZuAPJ588'
  }
];

export const INITIAL_ROUTE_PROPOSALS: RouteProposal[] = [];

export const INITIAL_RODADA: Rodada | null = null;

export const INITIAL_RODADAS: Rodada[] = [];

export const INITIAL_ROUTE_LISTS: RouteList[] = [];

export const INITIAL_ACTIVITIES: ActivityPost[] = [];

export const INITIAL_CHALLENGES: Challenge[] = [];

export const INITIAL_CREW_MESSAGES: CrewChatMessage[] = [];
