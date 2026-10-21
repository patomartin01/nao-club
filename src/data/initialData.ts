import { User, Motorcycle, Crew, Rodada, RouteProposal } from '../types';

export const CURRENT_USER: User = {
  id: 'user-patricio',
  name: 'Patricio Martin',
  handle: '@patomartin',
  email: 'pmartin.v2001@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=250',
  bio: 'Doble propósito lover. Rodando en pistas de tierra, bosque y sierra. Salidas desde Interlomas.',
  location: 'Interlomas, Huixquilucan, Edomex',
  ridingLevel: 'Intermedio',
  emergencyContact: '+52 55 1234 5678 (Papá)',
  phone: '+52 55 9876 5432'
};

export const INITIAL_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'user-diego',
    name: 'Diego "Capi" R.',
    handle: '@diego_capi',
    email: 'diego.capi@motomami.mx',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Navegación GPX, amante de brechas técnicas y fotos al atardecer.',
    location: 'Bosques de las Lomas, CDMX',
    ridingLevel: 'Avanzado',
  },
  {
    id: 'user-sofia',
    name: 'Sofía Montiel',
    handle: '@sofi_adv',
    email: 'sofi.adv@motomami.mx',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    bio: 'Maxi-trail rider. Lista para acampar bajo cero con tal de ver amanecer en la sierra.',
    location: 'Santa Fe, CDMX',
    ridingLevel: 'Intermedio',
  },
  {
    id: 'user-rigo',
    name: 'Rodrigo "Rigo" V.',
    handle: '@rigo_enduro',
    email: 'rigo.v@motomami.mx',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Mecánica de emergencia, compresores y fogatas master. La terracería es vida.',
    location: 'La Herradura, Huixquilucan',
    ridingLevel: 'Avanzado',
  }
];

export const INITIAL_MOTORCYCLES: Motorcycle[] = [
  {
    id: 'moto-1',
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
  {
    id: 'moto-2',
    userId: 'user-patricio',
    brand: 'KTM',
    model: '890 Adventure R',
    year: 2022,
    displacementCc: 889,
    type: 'Doble Propósito',
    nickname: 'La Avispa',
    photoUrl: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=800',
    modifications: ['Suspensión WP Pro revalvulada', 'Handguards Barkbusters', 'Asiento rally de una pieza'],
    tires: 'Mitas E-07+ Dakar'
  },
  {
    id: 'moto-diego',
    userId: 'user-diego',
    brand: 'Yamaha',
    model: 'Ténéré 700',
    year: 2023,
    displacementCc: 689,
    type: 'Doble Propósito',
    nickname: 'T7 Rally',
    photoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
    modifications: ['Cubre cárter AXP Extreme', 'Guía de cadena reforzada', 'Tanque Acerbis 23L'],
    tires: 'Motoz Tractionator RallZ'
  },
  {
    id: 'moto-sofia',
    userId: 'user-sofia',
    brand: 'Honda',
    model: 'CRF1100L Africa Twin',
    year: 2022,
    displacementCc: 1084,
    type: 'Adventure / Maxi-Trail',
    nickname: 'Dakar Queen',
    photoUrl: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    modifications: ['Barras Outback Motortek', 'Alforjas impermeables Mosko Moto Reckless 80L'],
    tires: 'Heidenau K60 Ranger'
  },
  {
    id: 'moto-rigo',
    userId: 'user-rigo',
    brand: 'Husqvarna',
    model: 'Norden 901 Expedition',
    year: 2023,
    displacementCc: 889,
    type: 'Doble Propósito',
    nickname: 'Viking Explorer',
    photoUrl: 'https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?auto=format&fit=crop&q=80&w=800',
    modifications: ['GPS Garmin Montana 700i en torre de navegación', 'Kit herramientas Kriega Tool Roll'],
    tires: 'Pirelli Scorpion Rally STR'
  }
];

export const INITIAL_CREWS: Crew[] = [
  {
    id: 'crew-motomami',
    name: 'MotoMami Adventure Crew',
    slug: 'motomami-adventure',
    tagline: 'Terracería, sierra, fogatas y doble propósito sin drama.',
    description: 'Comunidad de amigos apasionados por las motos trail y doble propósito. Rodamos fines de semana y puentes buscando campamentos base remotos, brechas forestales y buena comida.',
    inviteCode: 'MAMI-2026',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    baseCity: 'Interlomas & Poniente CDMX',
    creatorId: 'user-patricio',
    createdAt: '2024-03-15',
    members: [
      { userId: 'user-patricio', role: 'Capitán de Ruta', joinedAt: '2024-03-15' },
      { userId: 'user-diego', role: 'Capitán de Ruta', joinedAt: '2024-03-16' },
      { userId: 'user-sofia', role: 'Rider', joinedAt: '2024-03-18' },
      { userId: 'user-rigo', role: 'Barrendero', joinedAt: '2024-03-20' },
    ]
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
    proposedByName: 'Patricio Martin',
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
        userName: 'Patricio Martin',
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
    { id: 'p1', item: 'Compresor de aire eléctrico 12V / Batería', category: 'Herramientas', assignedToUserId: 'user-patricio', assignedToName: 'Patricio Martin', isDone: true },
    { id: 'p2', item: 'Kit de mechas para llantas tubeless y parches', category: 'Herramientas', assignedToUserId: 'user-rigo', assignedToName: 'Rodrigo V.', isDone: true },
    { id: 'p3', item: 'Juego de llaves Allen/Torx y desmontadores', category: 'Herramientas', assignedToUserId: 'user-diego', assignedToName: 'Diego "Capi"', isDone: true },
    { id: 'p4', item: 'Botiquín de primeros auxilios con torniquete y gasas', category: 'Seguridad & Salud', assignedToUserId: 'user-sofia', assignedToName: 'Sofía M.', isDone: true },
    { id: 'p5', item: 'Radio comunicadores Baofeng VHF (frecuencia 146.520)', category: 'Seguridad & Salud', assignedToUserId: 'user-patricio', assignedToName: 'Patricio Martin', isDone: true },
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
      uploadedByName: 'Patricio Martin',
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
