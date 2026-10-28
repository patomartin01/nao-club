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
    totalKm: 2450,
    completedCount: 33,
    elevationGain: 14800
  }
};

export const INITIAL_USERS: User[] = [
  CURRENT_USER
];

export const INITIAL_MOTORCYCLES: Motorcycle[] = [
  {
    id: 'moto-1',
    userId: 'user-patricio',
    brand: 'Royal Enfield',
    model: 'Himalayan 411',
    year: 2023,
    displacementCc: 411,
    type: 'Doble Propósito',
    nickname: 'La Himalayan',
    photoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    modifications: ['Defensas de motor y tanque Royal Enfield', 'Skid plate de aluminio', 'Faros auxiliares LED Tripper', 'Cubrepuños Barkbusters'],
    tires: 'Ceat Gripp-XL (Doble Propósito)'
  },
  {
    id: 'moto-2',
    userId: 'user-patricio',
    brand: 'BMW',
    model: 'R 1250 GS Adventure',
    year: 2023,
    displacementCc: 1254,
    type: 'Adventure / Maxi-Trail',
    nickname: 'La Bestia Negra',
    photoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    modifications: ['Defensas altas Touratech', 'Skid plate de aluminio 4mm', 'Faros auxiliares Baja Designs', 'Escape Akrapovič HP'],
    tires: 'Continental TKC80 (Twinduro 50/50)'
  },
];

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
    votes: ['user-patricio', 'user-diego', 'user-rigo'],
    comments: [
      {
        id: 'c1',
        userId: 'user-diego',
        userName: 'Diego "Capi" R.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        text: '¡Esta es la buena! Conozco la brecha de Los Saucos, está perfecta para rodar parados sin riesgo de desbarrancarse.',
        createdAt: 'Hace 3 horas'
      },
      {
        id: 'c2',
        userId: 'user-sofia',
        userName: 'Sofía Montiel',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
        text: 'Solo no olviden su sleeping de pluma o de 0 grados porque a casi 3,000 metros de noche cala con ganas.',
        createdAt: 'Hace 1 hora'
      }
    ],
    dayOfDeadVibe: 'En el campamento es desconexión y fogata con estrellas. En Valle de Bravo (a 45 min) está el Festival de las Almas con ofrendas lacustres.',
    safetyTips: ['Bajar 3-4 PSI en llantas al entrar al parque', 'Cargar leña temprano antes de las 6 PM', 'Llevar linterna frontal de cabeza']
  },
  {
    id: 'route-nanacamilpa-malinche',
    rodadaId: 'rodada-dia-muertos-2026',
    title: 'Nanacamilpa & Volcán La Malinche (Tlaxcala)',
    destination: 'Nanacamilpa / Albergue Malintzi',
    state: 'Tlaxcala',
    proposedByUserId: 'user-sofia',
    proposedByName: 'Sofía Montiel',
    proposedByAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    description: 'La salida más relajada desde Interlomas: puro Arco Norte sin cruzar la ciudad. Bosques de encino y pino que en noviembre quedan solitarios tras la época de luciérnagas. Terracerías muy nobles de arena volcánica y haciendas pulqueras.',
    coverImage: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=1000',
    totalKm: 155,
    estimatedHours: '2h 20m asfalto + 4h brechas',
    offroadPercentage: 40,
    asphaltPercentage: 60,
    difficulty: 'Fácil (Fluida)',
    campsite: {
      name: 'Piedra Canteada / Canto del Bosque',
      elevationMeters: 2800,
      minTempNight: '4°C a 8°C (Frío seco de altiplano)',
      security: 'Reserva privada cercada con control de acceso y vigilancia',
      amenities: ['Área de fogatas individual', 'Baños limpios y agua corriente', 'Restaurante de comida tlaxcalteca', 'Cero tumultos en noviembre']
    },
    itinerary: [
      {
        day: 1,
        title: 'Interlomas por Arco Norte a Nanacamilpa',
        description: 'Salida 9:00 AM conectando Chamapa-Lechería directo al Arco Norte hacia Calpulalpan. Llegada al bosque 11:20 AM. Basecamp armado y rodada corta entre ranchos pulqueros de Soltepec.',
        distanceKm: 145,
        offroadKm: 30,
        terrainType: 'Tierra suelta suave, caminos rurales amplios y compactados'
      },
      {
        day: 2,
        title: 'Expedición perimetral al Volcán La Malinche',
        description: 'Ruta hacia Ixtacuixtla conectando por terracerías arenosas hacia las faldas de la Malinche (hasta 3,100 msnm). Almuerzo campirano y regreso por brechas madereras.',
        distanceKm: 125,
        offroadKm: 60,
        terrainType: 'Ceniza volcánica compacta y arena noble sin piedras filosas'
      },
      {
        day: 3,
        title: 'Ruta de las Haciendas + Tapetes de Huamantla',
        description: 'Paseo cultural mañanero por Tlaxco y Huamantla para admirar ofrendas de Día de Muertos y tapetes de aserrín. Regreso fluido por Arco Norte a Interlomas.',
        distanceKm: 160,
        offroadKm: 25,
        terrainType: 'Asfalto panorámico secundario y brechas de grava fina'
      }
    ],
    waypoints: [
      { id: 'w1', name: 'Interlomas', lat: 19.4005, lng: -99.2816, type: 'start', notes: 'Salida hacia Chamapa Norte' },
      { id: 'w2', name: 'Arco Norte / Caseta Calpulalpan', lat: 19.5850, lng: -98.5720, type: 'fuel', notes: 'Recarga de combustible' },
      { id: 'w3', name: 'Piedra Canteada Basecamp', lat: 19.4670, lng: -98.5410, type: 'camp', notes: 'Zona arbolada con pasto' },
      { id: 'w4', name: 'Albergue La Malinche', lat: 19.2450, lng: -98.0310, type: 'scenic', notes: 'Vistas brutales del volcán a 3,100m' }
    ],
    coordinates: [
      [19.4005, -99.2816],
      [19.4720, -99.2450],
      [19.6100, -99.1800],
      [19.5850, -98.5720],
      [19.4670, -98.5410], // Nanacamilpa
      [19.4120, -98.4200],
      [19.3200, -98.2400],
      [19.2450, -98.0310]  // Malinche
    ],
    votes: ['user-sofia', 'user-rigo'],
    comments: [
      {
        id: 'c3',
        userId: 'user-patricio',
        userName: 'Pato Martín',
        userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
        text: 'La salida por el Arco Norte es una chulada desde Interlomas, cero semáforos ni tráfico de Pantitlán.',
        createdAt: 'Ayer'
      }
    ],
    dayOfDeadVibe: 'Increíble: Tlaxcala y Huamantla tienen los tapetes de aserrín y ofrendas más bonitas del país sin el caos de Pátzcuaro u Oaxaca.',
    safetyTips: ['Cuidado con polvo volcánico fino en filtros de aire', 'Llevar candados de disco para cuando visitemos los pueblos']
  },
  {
    id: 'route-mineral-del-chico',
    rodadaId: 'rodada-dia-muertos-2026',
    title: 'Parque Nacional El Chico & Huasca de Ocampo',
    destination: 'Mineral del Chico / Huasca',
    state: 'Hidalgo',
    proposedByUserId: 'user-diego',
    proposedByName: 'Diego "Capi" R.',
    proposedByAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    description: 'Senderos balastados de grava compacta entre peñas monolíticas y bosque de niebla. Campamento controlado dentro del Parque Nacional con opción de bajar a comer pastes y ver el ambiente minero de Día de Muertos en Real del Monte.',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1000',
    totalKm: 135,
    estimatedHours: '2h 10m asfalto + 4h 30m off-road',
    offroadPercentage: 35,
    asphaltPercentage: 65,
    difficulty: 'Fácil (Fluida)',
    campsite: {
      name: 'Campamento Diego Mateo / Conejos',
      elevationMeters: 2750,
      minTempNight: '5°C a 9°C (Húmedo con neblina)',
      security: 'Parque Nacional vigilado por CONANP y guardabosques',
      amenities: ['Pequeño embalse de agua', 'Asadores y mesas de madera', 'Puntos delimitados para tiendas', 'Estacionamiento seguro']
    },
    itinerary: [
      {
        day: 1,
        title: 'Interlomas a El Chico + Travesía a Omitlán',
        description: 'Salida norte vía México-Pachuca. Llegada a Mineral del Chico a mediodía. Travesía por brecha maderera hacia Omitlán de Juárez evitando carreteras transitadas.',
        distanceKm: 135,
        offroadKm: 35,
        terrainType: 'Grava compacta balastada y curvas con bosque de oyamel'
      },
      {
        day: 2,
        title: 'Ruta de las Peñas y Huasca de Ocampo',
        description: 'Brechas secundarias hacia San Antonio Regla y cañadas alrededor de los Prismas Basálticos. Noche de ofrendas y pastes en Real del Monte.',
        distanceKm: 85,
        offroadKm: 40,
        terrainType: 'Tierra pedregosa compacta y caminos rurales vecinales'
      },
      {
        day: 3,
        title: 'Mirador Peña del Cuervo + Descenso',
        description: 'Subida mañanera a los miradores del parque con vista sobre el mar de niebla. Descenso relajado hacia Pachuca y regreso a casa.',
        distanceKm: 140,
        offroadKm: 20,
        terrainType: 'Asfalto con curvas cerradas de sierra y brechas cortas'
      }
    ],
    waypoints: [
      { id: 'w1', name: 'Interlomas', lat: 19.4005, lng: -99.2816, type: 'start', notes: 'Salida 9:00 AM' },
      { id: 'w2', name: 'Salida Pachuca Norte', lat: 20.1200, lng: -98.7300, type: 'fuel', notes: 'Cargar gasolina premium antes de subir' },
      { id: 'w3', name: 'Campamento Diego Mateo', lat: 20.2030, lng: -98.7180, type: 'camp', notes: 'Frente a las formaciones rocosas' },
      { id: 'w4', name: 'Real del Monte', lat: 20.1410, lng: -98.6720, type: 'food', notes: 'Pastes tradicionales mineros calientitos' }
    ],
    coordinates: [
      [19.4005, -99.2816],
      [19.5200, -99.2000],
      [19.8500, -98.9800],
      [20.1200, -98.7300],
      [20.2030, -98.7180], // Diego Mateo
      [20.1740, -98.6250],
      [20.2050, -98.5780], // Huasca
      [20.1410, -98.6720]  // Real del Monte
    ],
    votes: ['user-patricio'],
    comments: [
      {
        id: 'c4',
        userId: 'user-rigo',
        userName: 'Rodrigo "Rigo" V.',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        text: 'La neblina en Diego Mateo en la noche es mágica, y el café de olla en Real del Monte cura cualquier frío.',
        createdAt: 'Hace 4 horas'
      }
    ],
    dayOfDeadVibe: 'Muy alto: las calles empedradas de Real del Monte y Mineral del Chico se visten de flor de cempasúchil y calaveras de carbón.',
    safetyTips: ['Pavimento húmedo en curvas sombreadas de oyamel', 'Micas transparentes para la niebla de la tarde']
  },
  {
    id: 'route-sierra-gorda-bucareli',
    rodadaId: 'rodada-dia-muertos-2026',
    title: 'Sierra Gorda: Cañón de Bucareli & Pinal de Amoles',
    destination: 'Pinal de Amoles / Río Extoraz',
    state: 'Querétaro',
    proposedByUserId: 'user-rigo',
    proposedByName: 'Rodrigo "Rigo" V.',
    proposedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    description: 'La opción más de aventura y expedición pura: cañones colosales, vados de río seco con piedra redonda, clima cálido y templado en el fondo de la cañada y 22 km de terracería panorámica descendiendo hacia la Misión de Bucareli.',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1000',
    totalKm: 320,
    estimatedHours: '5h asfalto + 6h de aventura off-road',
    offroadPercentage: 60,
    asphaltPercentage: 40,
    difficulty: 'Intermedio',
    campsite: {
      name: 'Campamento Bucareli Extremo (Río Extoraz)',
      elevationMeters: 1350,
      minTempNight: '14°C a 18°C (Clima templado delicioso sin helada)',
      security: 'Campamento ecoturístico administrado por locales',
      amenities: ['Alberca natural de río', 'Palapas y baños rústicos', 'Área de fogatas bajo cañones de 400m', 'Cielos limpios sin contaminación de luz']
    },
    itinerary: [
      {
        day: 1,
        title: 'Interlomas a San Juan del Río y Cañón de Bucareli',
        description: 'Salida 7:30 AM por México-Querétaro hasta San Juan del Río, Cadereyta y Vizarrón. Descenso de 22 km de pura terracería alucinante hasta el campamento.',
        distanceKm: 310,
        offroadKm: 28,
        terrainType: 'Curvas de asfalto perfecto de sierra + bajada de grava y acantilados'
      },
      {
        day: 2,
        title: 'Loop del Río Extoraz & Cañón del Infiernillo',
        description: 'Día entero sin maletas rodando a lo largo del lecho del río, cruce de vados bajos y veredas hacia Peñamiller. Asado en el campamento.',
        distanceKm: 70,
        offroadKm: 65,
        terrainType: 'Canto rodado de río, tierra seca, grava y pasos de agua bajos'
      },
      {
        day: 3,
        title: 'Subida por Pinal de Amoles + Regreso',
        description: 'Ascenso a la sierra atravesando el mirador de Cuatro Palos. Comida campestre en Vizarrón y regreso por autopista.',
        distanceKm: 330,
        offroadKm: 25,
        terrainType: 'Curvas cerradas con voladeros panorámicos y tierra firme'
      }
    ],
    waypoints: [
      { id: 'w1', name: 'Interlomas', lat: 19.4005, lng: -99.2816, type: 'start', notes: 'Salida temprana 7:30 AM' },
      { id: 'w2', name: 'Vizarrón de Montes', lat: 20.8280, lng: -99.7210, type: 'fuel', notes: 'Última recarga y compra de víveres' },
      { id: 'w3', name: 'Pinal de Amoles', lat: 21.1340, lng: -99.6240, type: 'scenic', notes: 'El inicio de la bajada de terracería' },
      { id: 'w4', name: 'Campamento Bucareli Extremo', lat: 21.0370, lng: -99.6170, type: 'camp', notes: 'Fondo del cañón junto al agua' }
    ],
    coordinates: [
      [19.4005, -99.2816],
      [19.8200, -99.4200],
      [20.3800, -99.9900],
      [20.8280, -99.7210],
      [21.1340, -99.6240], // Pinal
      [21.0800, -99.6200],
      [21.0370, -99.6170]  // Bucareli Extoraz
    ],
    votes: ['user-rigo'],
    comments: [
      {
        id: 'c5',
        userId: 'user-diego',
        userName: 'Diego "Capi" R.',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        text: 'Bucareli es de otro planeta... el único tema son las 5 horas de carretera de ida y vuelta para un puente corto.',
        createdAt: 'Hace 5 horas'
      }
    ],
    dayOfDeadVibe: 'Naturaleza salvaje y cielo tapizado de estrellas. No hay festejos de pueblo, pero la vibra mística de los cañones es insuperable.',
    safetyTips: ['Tener cuidado con llantas con cámaras por la grava filosa', 'Llevar camelbak con mínimo 3L de agua']
  },
  {
    id: 'route-zempoala-lagunas',
    rodadaId: 'rodada-zempoala-2026',
    title: 'Paso del Lobo: Curvas de Bosque & Asado en Tres Marías',
    destination: 'Lagunas de Zempoala / Huitzilac',
    state: 'Morelos',
    proposedByUserId: 'user-manuel',
    proposedByName: 'Manuel Martin Galindo',
    proposedByAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    description: 'Ruta matutina de un solo día. Curvas rápidas de pavimento frío, desvío por la brecha de terracería compacta bordeando la laguna y bajada a los puestos tradicionales de cecina.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000',
    totalKm: 98,
    estimatedHours: '3h 30m',
    offroadPercentage: 30,
    asphaltPercentage: 70,
    difficulty: 'Fácil (Fluida)',
    campsite: {
      name: 'Área Recreativa Lagunas de Zempoala',
      elevationMeters: 2800,
      minTempNight: '6°C',
      security: 'Guardaparques CONANP',
      amenities: ['Comida típica', 'Estacionamiento vigilado', 'Senderos']
    },
    itinerary: [
      {
        day: 1,
        title: 'Curvas de Altura & Cecina de Tres Marías',
        description: 'Salida de Perisur hacia la libre de Cuernavaca con parada en mirador de Zempoala y almuerzo campestre.',
        distanceKm: 98,
        offroadKm: 30,
        terrainType: 'Asfalto revirado y brecha de bosque de oyamel'
      }
    ],
    dayOfDeadVibe: 'Recorrido fresco de otoño entre bosques de pino y comida montañesa tradicional',
    safetyTips: ['Cuidado con la humedad y hojas sueltas en curvas matutinas', 'Revisar presión de llantas para asfalto frío'],
    waypoints: [
      { id: 'zw-1', name: 'Perisur CDMX', lat: 19.3035, lng: -99.1878, type: 'start' },
      { id: 'zw-2', name: 'Mirador Lagunas de Zempoala', lat: 19.0531, lng: -99.3142, type: 'scenic' },
      { id: 'zw-3', name: 'Tres Marías (Cecina)', lat: 19.0558, lng: -99.2392, type: 'food' }
    ],
    coordinates: [
      [19.3035, -99.1878],
      [19.1820, -99.2150],
      [19.0531, -99.3142],
      [19.0558, -99.2392]
    ],
    votes: ['user-manuel', 'user-patricio'],
    downvotes: [],
    comments: [
      {
        id: 'cz-1',
        userId: 'user-patricio',
        userName: 'Pato Martín',
        userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
        text: 'Me late perfecto para no perder el ritmo antes de diciembre.',
        createdAt: 'Hace 2 horas'
      }
    ]
  },
  {
    id: 'route-sierra-negra-tehuacan',
    rodadaId: 'rodada-sierra-negra-2027',
    title: 'Ascenso al Telescopio Milimétrico & Reserva Tehuacán',
    destination: 'Sierra Negra / Pico de Orizaba',
    state: 'Puebla',
    proposedByUserId: 'user-diego',
    proposedByName: 'Diego Morales',
    proposedByAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
    description: 'Aventura de gran altitud subiendo por encima de los 4,000 msnm para contemplar el mar de nubes y acampar en el valle de cactáceas gigantes de Zapotitlán Salinas.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    totalKm: 280,
    estimatedHours: '6h',
    offroadPercentage: 55,
    asphaltPercentage: 45,
    difficulty: 'Intermedio',
    campsite: {
      name: 'Reserva de la Biósfera Tehuacán-Cuicatlán',
      elevationMeters: 1650,
      minTempNight: '11°C',
      security: 'Campamento comunitario Zapotitlán',
      amenities: ['Zona de fogata', 'Sanitarios ecológicos', 'Cielos limpios para astronomía']
    },
    itinerary: [
      {
        day: 1,
        title: 'Ascenso al Volcán Sierra Negra & Descenso a Tehuacán',
        description: 'Trepada hasta la cota de los 4,100m para admirar el Citlaltépetl y posterior bajada al altiplano.',
        distanceKm: 280,
        offroadKm: 154,
        terrainType: 'Tierra volcánica compacta, grava y cañones áridos'
      }
    ],
    dayOfDeadVibe: 'Silencio y misticismo del desierto de cactáceas gigantes y estrellas despejadas',
    safetyTips: ['Llevar capas térmicas para más de 4,000m', 'Monitorear posible mal de montaña en el ascenso'],
    waypoints: [
      { id: 'sn-1', name: 'Caseta San Marcos', lat: 19.3510, lng: -98.9210, type: 'start' },
      { id: 'sn-2', name: 'Base Volcán Sierra Negra', lat: 18.9830, lng: -97.3140, type: 'dirt' },
      { id: 'sn-3', name: 'Zapotitlán Salinas', lat: 18.3320, lng: -97.4720, type: 'camp' }
    ],
    coordinates: [
      [19.3510, -98.9210],
      [19.0430, -98.2010],
      [18.9830, -97.3140],
      [18.3320, -97.4720]
    ],
    votes: ['user-diego'],
    downvotes: [],
    comments: [
      {
        id: 'csn-1',
        userId: 'user-diego',
        userName: 'Diego Morales',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
        text: 'Lleven ropa térmica de montaña en capas, en la cima el viento cala.',
        createdAt: 'Ayer'
      }
    ]
  }
];

export const INITIAL_RODADA: Rodada = {
  id: 'rodada-dia-muertos-2026',
  crewId: 'crew-motomami',
  title: 'Expedición Puente Día de Muertos 2026',
  subtitle: 'Campamento Base & Loops Off-Road en Motos Doble Propósito',
  description: 'Salida de 3 días / 2 noches aprovechando el puente de noviembre. El plan maestro: establecer un campamento base seguro, descargar maletas pesadas para rodar ligeros y hacer rutas circulares de terracería técnica fluida.',
  category: 'Puente / Expedición Multi-días',
  status: 'votacion',
  startDate: '2026-10-31',
  endDate: '2026-11-02',
  originPoint: 'Interlomas, Huixquilucan, Edomex',
  attendees: [
    {
      userId: 'user-patricio',
      motorcycleId: 'moto-1',
      status: 'confirmado',
      confirmedAt: '2026-10-18',
      gearCheck: {
        sleepingBag0C: true,
        tireRepairKit: true,
        portableCompressor: true,
        firstAidKit: true,
        tools: true
      }
    },
    {
      userId: 'user-diego',
      motorcycleId: 'moto-diego',
      status: 'confirmado',
      confirmedAt: '2026-10-18',
      gearCheck: {
        sleepingBag0C: true,
        tireRepairKit: true,
        portableCompressor: false,
        firstAidKit: false,
        tools: true
      }
    },
    {
      userId: 'user-sofia',
      motorcycleId: 'moto-sofia',
      status: 'confirmado',
      confirmedAt: '2026-10-19',
      gearCheck: {
        sleepingBag0C: true,
        tireRepairKit: true,
        portableCompressor: false,
        firstAidKit: true,
        tools: false
      }
    },
    {
      userId: 'user-rigo',
      motorcycleId: 'moto-rigo',
      status: 'confirmado',
      confirmedAt: '2026-10-19',
      gearCheck: {
        sleepingBag0C: true,
        tireRepairKit: true,
        portableCompressor: true,
        firstAidKit: true,
        tools: true
      }
    }
  ],
  packingList: [
    { id: 'p1', item: 'Compresor de aire eléctrico 12V / Batería', category: 'Herramientas', assignedToUserId: 'user-patricio', assignedToName: 'Pato Martín', isDone: true },
    { id: 'p2', item: 'Kit de mechas para llantas tubeless y parches', category: 'Herramientas', assignedToUserId: 'user-rigo', assignedToName: 'Rodrigo V.', isDone: true },
    { id: 'p3', item: 'Juego de llaves Allen/Torx y desmontadores', category: 'Herramientas', assignedToUserId: 'user-diego', assignedToName: 'Diego "Capi"', isDone: true },
    { id: 'p4', item: 'Botiquín de primeros auxilios con torniquete y gasas', category: 'Seguridad & Salud', assignedToUserId: 'user-sofia', assignedToName: 'Sofía M.', isDone: true },
    { id: 'p5', item: 'Radio comunicadores Baofeng VHF (frecuencia 146.520)', category: 'Seguridad & Salud', assignedToUserId: 'user-patricio', assignedToName: 'Pato Martín', isDone: true },
    { id: 'p6', item: 'Casas de campaña resistentes a viento 4 estaciones', category: 'Campamento', isDone: true },
    { id: 'p7', item: 'Aislantes térmicos inflables R-value > 3.0', category: 'Campamento', isDone: true },
    { id: 'p8', item: 'Lámparas frontales de cabeza con baterías extra', category: 'Campamento', isDone: false },
    { id: 'p9', item: 'Carne para asar, tortillas y carbón para primera noche', category: 'Comida / Asador', assignedToUserId: 'user-diego', assignedToName: 'Diego "Capi"', isDone: false },
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

export const SECOND_RODADA: Rodada = {
  id: 'rodada-sierra-gorda',
  crewId: 'crew-sierrabrava',
  title: 'Travesía Cañón del Plátano & Sierra Gorda',
  subtitle: 'Brechas de grava, ríos secos y noche de vivac bajo las estrellas',
  description: 'Expedición de fin de semana explorando los pasos de montaña entre Querétaro y San Luis Potosí.',
  category: 'Fin de Semana',
  status: 'fijada',
  startDate: '2026-11-20',
  endDate: '2026-11-22',
  originPoint: 'San Juan del Río, Qro.',
  attendees: [
    {
      userId: 'user-patricio',
      motorcycleId: 'moto-1',
      status: 'confirmado',
      confirmedAt: '2026-10-18',
      gearCheck: { sleepingBag0C: true, tireRepairKit: true, portableCompressor: true, firstAidKit: true, tools: true }
    },
    {
      userId: 'user-diego',
      motorcycleId: 'moto-diego',
      status: 'confirmado',
      confirmedAt: '2026-10-18',
      gearCheck: { sleepingBag0C: true, tireRepairKit: true, portableCompressor: false, firstAidKit: false, tools: true }
    }
  ],
  packingList: [
    { id: 'pn-1', item: 'Lámpara frontal recargable y pilas de repuesto', category: 'Campamento', assignedToUserId: 'user-patricio', assignedToName: 'Pato Martín', isDone: true },
    { id: 'pn-2', item: 'Kit de hidratación Camelbak 3L', category: 'Seguridad & Salud', assignedToUserId: 'user-diego', assignedToName: 'Diego "Capi"', isDone: true }
  ],
  gallery: [],
  createdAt: '2026-10-18'
};

export const THIRD_RODADA: Rodada = {
  id: 'rodada-zempoala-2026',
  crewId: 'crew-motomami',
  title: 'Ruta Relámpago Zempoala & Huitzilac',
  subtitle: 'Curvas de montaña fría, paso de terracería y cecina en Tres Marías',
  description: 'Rodada mañanera de 1 solo día convocada por Manuel. Salida 7:30 AM para desayunar en el bosque y estar de vuelta antes del tráfico.',
  category: 'Rodada Rápida 1 Día',
  status: 'votacion',
  startDate: '2026-11-20',
  endDate: '2026-11-20',
  originPoint: 'Insurgentes Sur / Perisur, CDMX',
  attendees: [
    {
      userId: 'user-manuel',
      motorcycleId: 'moto-manuel',
      status: 'confirmado',
      confirmedAt: '2026-10-20'
    },
    {
      userId: 'user-patricio',
      motorcycleId: 'moto-1',
      status: 'confirmado',
      confirmedAt: '2026-10-21'
    }
  ],
  packingList: [],
  gallery: [],
  createdAt: '2026-10-20'
};

export const FOURTH_RODADA: Rodada = {
  id: 'rodada-sierra-negra-2027',
  crewId: 'crew-motomami',
  title: 'Travesía Sierra Negra & Valle de Tehuacán',
  subtitle: 'Expedición de gran altitud a 4,000 msnm y campamento en cactáceas gigantes',
  description: 'Convocatoria preliminar abierta para el primer puente del año. Ideal para preparar maletas pesadas y autonomía.',
  category: 'Puente / Expedición Multi-días',
  status: 'votacion',
  startDate: '2027-02-06',
  endDate: '2027-02-08',
  originPoint: 'Caseta San Marcos, Autopista Puebla',
  attendees: [
    {
      userId: 'user-diego',
      motorcycleId: 'moto-diego',
      status: 'confirmado',
      confirmedAt: '2026-10-21'
    }
  ],
  packingList: [],
  gallery: [],
  createdAt: '2026-10-21'
};

export const INITIAL_RODADAS: Rodada[] = [INITIAL_RODADA, THIRD_RODADA, FOURTH_RODADA, SECOND_RODADA];

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

export const INITIAL_ACTIVITIES: ActivityPost[] = [
  {
    id: 'act-1',
    pilotId: 'user-manuel',
    pilotName: 'Manuel Martin Galindo',
    pilotHandle: '@manuel_martin',
    pilotAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    dateText: 'Hoy a las 6:58 a.m.',
    device: '',
    location: 'Miguel Hidalgo, Ciudad de México',
    title: 'Rodada Matutina // Curvas y Cañón de Zempoala',
    motoModel: 'BMW 650 GS',
    discipline: 'Carretera / Curvas',
    distanceKm: 74.2,
    elevationGainM: 1420,
    durationText: '1h 12m',
    avgSpeedKmh: 61.8,
    trophiesCount: 2,
    kudosCount: 8,
    hasKudoed: false,
    kudosAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
    ],
    commentsCount: 3,
    comments: [
      {
        id: 'comm-1',
        userId: 'user-patricio',
        userName: 'Pato Martín',
        userAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
        createdAt: 'Hoy a las 7:45 a.m.',
        text: '¡Gran paso de curvas en el cañón! La 650 GS se portó impecable.'
      },
      {
        id: 'comm-2',
        userId: 'user-mich',
        userName: 'Mich Aboumrad',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        createdAt: 'Hoy a las 8:12 a.m.',
        text: 'Qué buena salida nos aventamos hoy equipo. ¡La próxima toca parada en Tres Marías!'
      },
      {
        id: 'comm-3',
        userId: 'user-pepe',
        userName: 'Pepe González',
        userAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250',
        createdAt: 'Hoy a las 8:30 a.m.',
        text: 'Cerrando el grupo con la Africa Twin, todo el camino despejado y sin incidentes.'
      }
    ],
    coordinates: [
      [19.4100, -99.1900],
      [19.3800, -99.2300],
      [19.3100, -99.2800],
      [19.1800, -99.3200],
      [19.0600, -99.3100]
    ],
    surfaceBreakdown: {
      asphaltPercentage: 88,
      dirtPercentage: 12,
      curveDensity: 'Alta'
    },
    photos: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200'
    ],
    groupInfo: {
      crewId: 'crew-motomami',
      crewName: 'MotoMami',
      rodadaTitle: 'Curvas Matutinas & Cañón de Zempoala',
      participants: [
        {
          userId: 'user-manuel',
          name: 'Manuel Martin Galindo',
          handle: '@manuel_martin',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
          motoModel: 'BMW 650 GS'
        },
        {
          userId: 'user-patricio',
          name: 'Pato Martín',
          handle: '@patomartin',
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          motoModel: 'BMW R 1250 GS Adventure'
        },
        {
          userId: 'user-manu-vidal',
          name: 'Manu Martin Vidal',
          handle: '@manumartin_v',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
          motoModel: 'BMW R 1250 GS'
        },
        {
          userId: 'user-mich',
          name: 'Mich Aboumrad',
          handle: '@mich_aboumrad',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          motoModel: 'BMW R 1200 GS'
        },
        {
          userId: 'user-diego-terrazas',
          name: 'Diego Terrazas',
          handle: '@diego_terrazas',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          motoModel: 'KTM 890 Adventure R'
        },
        {
          userId: 'user-pepe',
          name: 'Pepe González',
          handle: '@pepe_gonzalez',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250',
          motoModel: 'Honda Africa Twin'
        }
      ]
    }
  },
  {
    id: 'act-2',
    pilotId: 'user-patricio',
    pilotName: 'Pato Martín',
    pilotHandle: '@patomartin',
    pilotAvatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
    dateText: 'Ayer a las 7:01 a.m.',
    device: '',
    location: 'San Pedro Cholula, Puebla',
    title: 'Paso por Brechas y Reserva Cerro Zapotecas',
    motoModel: 'Royal Enfield Himalayan 411 2023',
    discipline: 'Doble Propósito / Trail',
    distanceKm: 42.8,
    elevationGainM: 890,
    durationText: '1h 45m',
    avgSpeedKmh: 24.5,
    trophiesCount: 7,
    kudosCount: 14,
    hasKudoed: true,
    kudosAvatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
    ],
    commentsCount: 5,
    coordinates: [
      [19.0600, -98.3100],
      [19.0700, -98.3400],
      [19.0900, -98.3600],
      [19.0800, -98.3800],
      [19.0650, -98.3200]
    ],
    surfaceBreakdown: {
      asphaltPercentage: 35,
      dirtPercentage: 65,
      curveDensity: 'Media'
    },
    photos: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1200'
    ],
    groupInfo: {
      crewId: 'crew-sierrabrava',
      crewName: 'Sierra Brava Dual-Sport Club',
      rodadaTitle: 'Paso por Brechas y Zapotecas',
      participants: [
        {
          userId: 'user-patricio',
          name: 'Pato Martín',
          handle: '@patomartin',
          avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
          motoModel: 'Royal Enfield Himalayan 411 2023'
        },
        {
          userId: 'user-rigo',
          name: 'Rodrigo "Rigo" V.',
          handle: '@rigo_enduro',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          motoModel: 'Yamaha Ténéré 700'
        }
      ]
    }
  },
  {
    id: 'act-3',
    pilotId: 'user-diego-terrazas',
    pilotName: 'Diego Terrazas',
    pilotHandle: '@diego_terrazas',
    pilotAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    dateText: 'Ayer a las 6:52 a.m.',
    device: 'NAO Cockpit GPS',
    location: 'Zinacantepec & Nevado de Toluca, Edomex',
    title: 'Travesía de Altura // Nevado de Toluca & Raíces',
    motoModel: 'KTM 890 Adventure R',
    discipline: 'Doble Propósito / Trail',
    distanceKm: 68.4,
    elevationGainM: 1850,
    durationText: '2h 15m',
    avgSpeedKmh: 38.0,
    trophiesCount: 4,
    kudosCount: 11,
    hasKudoed: false,
    kudosAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
    ],
    commentsCount: 2,
    coordinates: [
      [19.1200, -99.7800],
      [19.1450, -99.7750],
      [19.1620, -99.7700],
      [19.1380, -99.7760]
    ],
    surfaceBreakdown: {
      asphaltPercentage: 30,
      dirtPercentage: 70,
      curveDensity: 'Alta'
    },
    photos: [
      'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515777315835-281b94c9589f?auto=format&fit=crop&q=80&w=1200'
    ],
    groupInfo: {
      crewId: 'crew-motomami',
      crewName: 'MotoMami',
      participants: [
        {
          userId: 'user-diego-terrazas',
          name: 'Diego Terrazas',
          handle: '@diego_terrazas',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          motoModel: 'KTM 890 Adventure R'
        },
        {
          userId: 'user-manuel',
          name: 'Manuel Martin Galindo',
          handle: '@manuel_martin',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
          motoModel: 'BMW 650 GS'
        }
      ]
    }
  },
  {
    id: 'act-4',
    pilotId: 'user-diego',
    pilotName: 'Diego "Capi" R.',
    pilotHandle: '@diego_capi',
    pilotAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    dateText: '10 de octubre de 2026',
    device: 'NAO Cockpit GPS',
    location: 'Valle de Bravo, Estado de México',
    title: 'Travesía Panorámica Laguna & Brechas Altas',
    motoModel: 'Triumph Tiger 900 Rally Pro',
    discipline: 'Adventure / Maxi-Trail',
    distanceKm: 118.5,
    elevationGainM: 2150,
    durationText: '3h 10m',
    avgSpeedKmh: 37.4,
    trophiesCount: 9,
    kudosCount: 19,
    hasKudoed: true,
    kudosAvatars: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=150'
    ],
    commentsCount: 7,
    coordinates: [
      [19.2900, -99.9800],
      [19.2400, -100.0800],
      [19.1900, -100.1300],
      [19.1500, -100.0500]
    ],
    surfaceBreakdown: {
      asphaltPercentage: 55,
      dirtPercentage: 45,
      curveDensity: 'Alta'
    },
    photos: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'
    ]
  }
];

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
