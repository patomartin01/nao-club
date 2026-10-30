import { User, Motorcycle, Crew, Rodada, RouteProposal, RouteList, ActivityPost, Challenge, CrewChatMessage } from '../types';

export const CURRENT_USER: User = {
  id: 'user-patricio',
  name: 'Pato Martín',
  handle: '@patomartin',
  email: 'pmartin.v2001@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  bio: 'Piloto multidisciplinario y miembro de MotoMami. Rodando carretera revirada, pistas y terracería. Salidas desde Interlomas.',
  location: 'Interlomas / CDMX',
  ridingLevel: 'Avanzado',
  emergencyContact: '+52 55 1234 5678 (Papá)',
  phone: '+52 55 9876 5432',
  completedRouteIds: ['route-1', 'route-4', 'route-2'],
  savedRouteIds: ['route-2', 'route-3', 'route-5'],
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
    id: 'crew-motomami',
    name: 'MotoMami',
    slug: 'motomami',
    tagline: 'Terracería, sierra, fogatas y doble propósito sin drama.',
    description: 'Comunidad de amigos apasionados por las motos trail y doble propósito. Rodamos fines de semana y puentes buscando campamentos base remotos, brechas forestales y buena comida.',
    inviteCode: 'NAO-2026',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    baseCity: 'Interlomas & Poniente CDMX',
    creatorId: 'user-patricio',
    createdAt: '2024-03-15',
    members: [
      { userId: 'user-patricio', role: 'Capitán de Ruta', joinedAt: '2024-03-15' }
    ],
    whatsappGroupUrl: 'https://chat.whatsapp.com/Jg1AKUEqoXF7nXZuAPJ588'
  }
];

export const INITIAL_ROUTE_PROPOSALS: RouteProposal[] = [
  {
    id: 'route-corral-piedra',
    rodadaId: 'rodada-dia-muertos-2026',
    title: 'Corral de Piedra & Faldas del Nevado de Toluca',
    destination: 'Amanalco de Becerra / Valle de Bravo',
    state: 'Estado de México',
    proposedByUserId: 'user-patricio',
    proposedByName: 'Pato Martín',
    proposedByAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
    description: 'Campamento base a 3,000 msnm junto a un lago alpino. El mejor bosque de coníferas para soltar maletas pesadas y salir a hacer loops circulares por brechas madereras con pinocha y descensos a Valle de Bravo.',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1000',
    totalKm: 125,
    estimatedHours: '2h 15m asfalto + 5h loops off-road',
    offroadPercentage: 45,
    asphaltPercentage: 55,
    difficulty: 'Fácil (Fluida)',
    campsite: {
      name: 'Parque Ecoturístico Corral de Piedra',
      elevationMeters: 2980,
      minTempNight: '2°C a 6°C (Obligatorio sleeping 0°C y aislante)',
      security: 'Parque cercado y vigilado 24/7 con cabañas de respaldo',
      amenities: ['Lago con truchas', 'Venta de leña para fogata', 'Baños limpios con regadera', 'Motos seguras al lado de la tienda']
    },
    itinerary: [
      {
        day: 1,
        title: 'Interlomas a Corral de Piedra + Loop "Los Saucos"',
        description: 'Salida de Interlomas 9:30 AM por Chamapa-Lechería y Naucalpan-Toluca. Llegada a Corral de Piedra 11:45 AM. Montaje de tiendas, descarga de motos y loop vespertino de 40 km por brecha maderera suave.',
        distanceKm: 120,
        offroadKm: 40,
        terrainType: 'Asfalto rápido de montaña + tierra negra compacta y pinocha'
      },
      {
        day: 2,
        title: 'Descenso Off-Road a Avándaro / Valle de Bravo',
        description: 'Loop sin equipaje cruzando la sierra por brechas secundarias hacia Monte Alto y San Gaspar. Comida en Avándaro y ascenso de regreso por cañada antes del anochecer.',
        distanceKm: 95,
        offroadKm: 55,
        terrainType: 'Senderos forestales anchos, cruces de zanjas leves y tierra firme'
      },
      {
        day: 3,
        title: 'Faldas del Nevado de Toluca (Raíces) & Regreso',
        description: 'Descampamento por la mañana. Rodada por la cara norte del Nevado a 3,500 msnm con vistas panorámicas al volcán. Almuerzo de cecina/trucha y regreso ágil por autopista.',
        distanceKm: 135,
        offroadKm: 35,
        terrainType: 'Tierra volcánica y cascajo fino sin piedras sueltas'
      }
    ],
    waypoints: [
      { id: 'w1', name: 'Salida: Gasolinera Interlomas', lat: 19.4005, lng: -99.2816, type: 'start', notes: 'Punto de reunión 9:00 AM, tanques llenos' },
      { id: 'w2', name: 'Caseta Toluca / Vía Monumento', lat: 19.2965, lng: -99.6582, type: 'fuel', notes: 'Última gasolinera Shell antes de subir' },
      { id: 'w3', name: 'Basecamp: Corral de Piedra', lat: 19.3364, lng: -99.9885, type: 'camp', notes: 'Registro de campamento y descarga de maletas' },
      { id: 'w4', name: 'Mirador Los Saucos', lat: 19.2612, lng: -100.0450, type: 'scenic', notes: 'Vista impresionante a la cuenca de Valle' },
      { id: 'w5', name: 'Avándaro / La Chopería', lat: 19.1685, lng: -100.1280, type: 'food', notes: 'Comida rica y cervezas artesanales sin alcohol' }
    ],
    coordinates: [
      [19.4005, -99.2816],
      [19.3820, -99.3510],
      [19.3240, -99.4980],
      [19.2965, -99.6582],
      [19.3080, -99.8240],
      [19.3364, -99.9885], // Corral de Piedra
      [19.2950, -100.0210],
      [19.2612, -100.0450],
      [19.2150, -100.0890],
      [19.1685, -100.1280]  // Valle / Avandaro
    ],
    votes: [],
    comments: [],
    dayOfDeadVibe: 'En el campamento es desconexión y fogata con estrellas. En Valle de Bravo (a 45 min) está el Festival de las Almas con ofrendas lacustres.',
    safetyTips: ['Bajar 3-4 PSI en llantas al entrar al parque', 'Cargar leña temprano antes de las 6 PM', 'Llevar linterna frontal de cabeza']
  }
];

export const INITIAL_RODADA: Rodada = {
  id: 'rodada-dia-muertos-2026',
  crewId: 'crew-motomami',
  title: 'Expedición Puente Día de Muertos 2026',
  subtitle: 'Campamento Base & Loops Off-Road en Motos Doble Propósito',
  description: 'Salida de 3 días / 2 noches aprovechando el puente de noviembre. El plan maestro: establecer un campamento base seguro, descargar maletas pesadas para rodar ligeros y hacer rutas circulares de terracería técnica fluida.',
  category: 'Puente / Expedición Multi-días',
  status: 'fijada',
  winningRouteId: 'route-corral-piedra',
  startDate: '2026-10-31',
  endDate: '2026-11-02',
  originPoint: 'Interlomas, Huixquilucan, Edomex',
  attendees: [],
  packingList: [
    { id: 'p1', item: 'Compresor de aire eléctrico 12V / Batería', category: 'Herramientas', assignedToUserId: 'user-patricio', assignedToName: 'Pato Martín', isDone: true },
    { id: 'p2', item: 'Kit de mechas para llantas tubeless y parches', category: 'Herramientas', isDone: false },
    { id: 'p3', item: 'Juego de llaves Allen/Torx y desmontadores', category: 'Herramientas', isDone: false },
    { id: 'p4', item: 'Botiquín de primeros auxilios con torniquete y gasas', category: 'Seguridad & Salud', isDone: false },
    { id: 'p5', item: 'Radio comunicadores Baofeng VHF (frecuencia 146.520)', category: 'Seguridad & Salud', assignedToUserId: 'user-patricio', assignedToName: 'Pato Martín', isDone: true },
    { id: 'p6', item: 'Casas de campaña resistentes a viento 4 estaciones', category: 'Campamento', isDone: false },
    { id: 'p7', item: 'Aislantes térmicos inflables R-value > 3.0', category: 'Campamento', isDone: false },
    { id: 'p8', item: 'Lámparas frontales de cabeza con baterías extra', category: 'Campamento', isDone: false },
    { id: 'p9', item: 'Carne para asar, tortillas y carbón para primera noche', category: 'Comida / Asador', isDone: false },
    { id: 'p10', item: 'Garrafón plegable de agua 10L', category: 'Comida / Asador', isDone: false }
  ],
  gallery: [
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000',
      caption: 'Explorando las brechas madereras en amanecer',
      uploadedByName: 'Pato Martín',
      uploadedAt: 'Hace 2 días'
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1000',
      caption: 'El bosque alpino listo para el campamento',
      uploadedByName: 'Diego "Capi"',
      uploadedAt: 'Hace 1 día'
    },
    {
      id: 'g3',
      url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=1000',
      caption: 'Fogata nocturna con leña de pino',
      uploadedByName: 'Sofía M.',
      uploadedAt: 'Hace 1 día'
    }
  ],
  createdAt: '2026-10-15'
};

export const INITIAL_RODADAS: Rodada[] = [INITIAL_RODADA];

export const INITIAL_ROUTE_LISTS: RouteList[] = [
  {
    id: 'list-wishlist',
    userId: 'user-patricio',
    name: 'Por Rodar // Wishlist 2026',
    description: 'Rutas pendientes para puentes y fines de semana largos con el grupo.',
    routeIds: ['route-2', 'route-3', 'route-5'],
    createdAt: '2026-10-15'
  },
  {
    id: 'list-tecnicas',
    userId: 'user-patricio',
    name: 'Retos Técnicos de Sierra',
    description: 'Brechas rocosas, cañones y pasos de río para poner a prueba llantas 50/50.',
    routeIds: ['route-3', 'route-5'],
    createdAt: '2026-10-18'
  }
];

export const INITIAL_ACTIVITIES: ActivityPost[] = [];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Desafío Sierra Madre: 1,000 KM',
    subtitle: 'Acumula 1,000 km en cualquier tipo de moto durante el mes de Octubre.',
    targetKm: 1000,
    currentKm: 642,
    participantsCount: 428,
    badgeHex: '1K',
    endDate: '31 Oct 2026',
    joined: true
  },
  {
    id: 'ch-2',
    title: 'Cazador de Puertos de Montaña',
    subtitle: 'Corona 5 puertos sobre los 2,800 msnm con tu escuadrón.',
    targetKm: 5,
    currentKm: 3,
    participantsCount: 184,
    badgeHex: 'MTN',
    endDate: '15 Nov 2026',
    joined: true
  },
  {
    id: 'ch-3',
    title: 'Gravel & Mud Master',
    subtitle: 'Registra al menos 200 km de pura terracería y brecha técnica.',
    targetKm: 200,
    currentKm: 85,
    participantsCount: 96,
    badgeHex: 'ADV',
    endDate: '10 Nov 2026',
    joined: false
  }
];

export const INITIAL_CREW_MESSAGES: CrewChatMessage[] = [
  {
    id: 'msg-1',
    crewId: 'crew-motomami',
    userId: 'user-sofia',
    userName: 'Sofía Ramos',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    userBike: 'Yamaha Ténéré 700',
    message: '¡Qué onda tribu! ¿Quién lleva el compresor portátil para este fin?',
    createdAt: '2026-10-22T09:15:00Z'
  },
  {
    id: 'msg-2',
    crewId: 'crew-motomami',
    userId: 'user-mateo',
    userName: 'Mateo Garza',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    userBike: 'KTM 890 Adventure R',
    message: 'Yo lo cargo en las maletas, junto con el kit de mechas y bomba de inflado rápido 🛠️',
    createdAt: '2026-10-22T09:22:00Z'
  },
  {
    id: 'msg-3',
    crewId: 'crew-motomami',
    userId: 'user-patricio',
    userName: 'Pato Martín',
    userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
    userBike: 'BMW R 1250 GS Adv',
    message: 'Vientos. El punto de reunión en la gasolinera de Santa Fe sigue en pie a las 6:30 AM para salir con tanque lleno.',
    createdAt: '2026-10-22T09:35:00Z'
  },
  {
    id: 'msg-4',
    crewId: 'crew-motomami',
    userId: 'user-manu-vidal',
    userName: 'Manu Martin Vidal',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    userBike: 'BMW R 1250 GS',
    message: 'Perfecto, tanque lleno y presiones de llantas listas desde la noche anterior ⚡',
    createdAt: '2026-10-22T09:42:00Z'
  }
];
