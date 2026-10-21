export type RidingLevel = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Hard Enduro / Pro';

export type BikeType = 
  | 'Doble Propósito' 
  | 'Adventure / Maxi-Trail' 
  | 'Enduro / Dual Sport' 
  | 'Scrambler' 
  | 'Trail Ligera' 
  | 'Sport Touring';

export interface Motorcycle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  displacementCc: number;
  type: BikeType;
  nickname?: string;
  photoUrl: string;
  modifications: string[];
  tires: string; // e.g. "Mitas E-07+ (50/50)", "Continental TKC80", "Metzeler Karoo 4"
}

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  ridingLevel: RidingLevel;
  emergencyContact?: string;
  phone?: string;
  completedRouteIds?: string[];
  savedRouteIds?: string[];
  stats?: {
    totalKm: number;
    completedCount: number;
    elevationGain: number;
  };
}

export interface RouteList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  routeIds: string[];
  createdAt: string;
}

export type WaypointType = 'start' | 'camp' | 'scenic' | 'fuel' | 'food' | 'dirt' | 'end';

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: WaypointType;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  distanceKm: number;
  offroadKm: number;
  terrainType: string;
}

export interface RouteComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface RouteProposal {
  id: string;
  rodadaId: string;
  title: string;
  destination: string;
  state: string;
  proposedByUserId: string;
  proposedByName: string;
  proposedByAvatar: string;
  description: string;
  coverImage: string;
  totalKm: number;
  estimatedHours: string;
  offroadPercentage: number;
  asphaltPercentage: number;
  difficulty: 'Fácil (Fluida)' | 'Intermedio' | 'Avanzado / Técnico';
  campsite: {
    name: string;
    elevationMeters: number;
    minTempNight: string;
    security: string;
    amenities: string[];
  };
  itinerary: ItineraryDay[];
  waypoints: Waypoint[];
  coordinates: [number, number][]; // Route path coordinates for Leaflet
  votes: string[]; // user IDs who upvoted
  comments: RouteComment[];
  dayOfDeadVibe: string;
  safetyTips: string[];
}

export interface RodadaAttendee {
  userId: string;
  motorcycleId?: string;
  status: 'confirmado' | 'interesado';
  confirmedAt: string;
  gearCheck: {
    sleepingBag0C: boolean;
    tireRepairKit: boolean;
    portableCompressor: boolean;
    firstAidKit: boolean;
    tools: boolean;
  };
}

export interface PackingItem {
  id: string;
  item: string;
  category: 'Herramientas' | 'Campamento' | 'Comida / Asador' | 'Seguridad & Salud';
  assignedToUserId?: string;
  assignedToName?: string;
  isDone: boolean;
}

export interface RodadaPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedByName: string;
  uploadedAt: string;
}

export type RodadaStatus = 'votacion' | 'fijada' | 'en_progreso' | 'completada';

export interface Rodada {
  id: string;
  crewId: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'Puente / Expedición Multi-días' | 'Fin de Semana' | 'Rodada Rápida 1 Día';
  status: RodadaStatus;
  startDate: string;
  endDate: string;
  originPoint: string;
  winningRouteId?: string;
  attendees: RodadaAttendee[];
  packingList: PackingItem[];
  gallery: RodadaPhoto[];
  createdAt: string;
}

export interface CrewMember {
  userId: string;
  role: 'Capitán de Ruta' | 'Barrendero' | 'Rider';
  joinedAt: string;
}

export interface Crew {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  inviteCode: string;
  coverImage: string;
  logoUrl?: string;
  baseCity: string;
  creatorId: string;
  members: CrewMember[];
  createdAt: string;
}
