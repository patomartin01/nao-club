export type RidingLevel = 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto / Pro';

export type MotoDiscipline = 
  | 'Carretera / Curvas' 
  | 'Doble Propósito / Trail' 
  | 'Adventure / Maxi-Trail' 
  | 'Enduro / Terracería' 
  | 'Sport / Pista' 
  | 'Custom / Cruiser' 
  | 'Urbana / Commuter';

export type BikeType = 
  | 'Doble Propósito' 
  | 'Adventure / Maxi-Trail' 
  | 'Enduro / Dual Sport' 
  | 'Sport / Deportiva' 
  | 'Naked / Roadster' 
  | 'Scrambler' 
  | 'Custom / Cruiser' 
  | 'Sport Touring' 
  | 'Trail Ligera';

export type NavTab = 'inicio' | 'mapas' | 'registrar' | 'tribus' | 'grupos' | 'tu' | 'crew' | 'rodada' | 'garaje' | 'home' | 'rutas' | 'admin';

export interface ActivityComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  text: string;
}

export interface ActivityParticipant {
  userId: string;
  name: string;
  handle: string;
  avatar: string;
  role?: string;
  motoModel?: string;
}

export interface ActivityGroupInfo {
  crewId?: string;
  crewName: string;
  rodadaId?: string;
  rodadaTitle?: string;
  participants: ActivityParticipant[];
}

export interface ActivityPost {
  id: string;
  pilotId: string;
  pilotName: string;
  pilotHandle: string;
  pilotAvatar: string;
  dateText: string;
  device: string;
  location: string;
  title: string;
  motoModel: string;
  discipline: MotoDiscipline;
  distanceKm: number;
  elevationGainM: number;
  durationText: string;
  avgSpeedKmh: number;
  trophiesCount?: number;
  kudosCount: number;
  hasKudoed: boolean;
  kudosAvatars: string[];
  commentsCount: number;
  comments?: ActivityComment[];
  groupInfo?: ActivityGroupInfo;
  coordinates: [number, number][];
  photos?: string[];
  surfaceBreakdown: {
    asphaltPercentage: number;
    dirtPercentage: number;
    curveDensity?: 'Alta' | 'Media' | 'Baja';
  };
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  targetKm: number;
  currentKm: number;
  participantsCount: number;
  badgeHex: string;
  endDate: string;
  joined: boolean;
}

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

export type WaypointType = 'start' | 'camp' | 'scenic' | 'fuel' | 'food' | 'dirt' | 'end' | 'culture';

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: WaypointType;
  notes?: string;
  description?: string;
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
  crewId?: string;
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
  difficulty: 'Fácil (Fluida)' | 'Intermedio' | 'Avanzado / Técnico' | 'Desconocido / Por explorar';
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
  downvotes?: string[]; // user IDs who downvoted
  comments: RouteComment[];
  dayOfDeadVibe?: string;
  safetyTips?: string[];
  isRecorded?: boolean; // Flag to identify routes created from live GPS recordings (Historial only)
}

export type RsvpStatus = 'confirmado' | 'por_confirmar' | 'no_asistire' | 'interesado';

export interface RodadaAttendee {
  userId: string;
  motorcycleId?: string;
  status: RsvpStatus;
  confirmedAt: string;
  gearCheck?: {
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
  whatsappGroupUrl?: string;
  createdAt: string;
}

export interface CrewChatMessage {
  id: string;
  crewId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBike?: string;
  message: string;
  createdAt: string;
  systemAction?: {
    type: 'rodada_confirmada' | 'ruta_propuesta' | 'nuevo_miembro';
    targetTitle?: string;
    targetId?: string;
  };
}export interface FollowRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserHandle: string;
  fromUserAvatar: string;
  toUserId: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type NotificationType = 'route_published' | 'follow_request' | 'crew_invite' | 'rodada_convoked';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  toUserId?: string; // If undefined or 'crew', targets members of the crew
  crewId?: string;
  crewName?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  routeId?: string;
  actionUrl?: string;
}

export interface FounderFeedback {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userEmail?: string;
  userAvatar?: string;
  founderNumber?: number;
  category: 'sugerencia' | 'problema' | 'comentario' | 'idea';
  message: string;
  createdAt: string;
  status: 'nuevo' | 'leido' | 'archivado';
}

