'use client';

import React, { useMemo } from 'react';
import { RouteProposal } from '../../types';

interface RouteTacticalMapCardProps {
  proposal: RouteProposal;
  className?: string;
  heightClass?: string;
  showOverlayBadges?: boolean;
  isWinner?: boolean;
  isLeader?: boolean;
  optionIndex?: number;
}

// 10 Paletas exclusivas de marca NAO inspiradas en orografía y aventura alpina
const TACTICAL_PALETTES = [
  {
    id: 'sierra-basalto',
    name: 'Sierra Basalto',
    bg: 'from-[#0A0908] via-[#12100E] to-[#0A0908]',
    contourColor: 'rgba(214, 114, 59, 0.14)',
    contourAccent: 'rgba(214, 114, 59, 0.28)',
    trailColor: '#E26D34',
    trailGlow: 'rgba(226, 109, 52, 0.45)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    accentLabel: 'Cordillera Volcánica',
  },
  {
    id: 'nevado-glaciar',
    name: 'Nevado Glaciar',
    bg: 'from-[#070A0F] via-[#0E1520] to-[#070A0F]',
    contourColor: 'rgba(125, 175, 215, 0.12)',
    contourAccent: 'rgba(125, 175, 215, 0.26)',
    trailColor: '#F58238',
    trailGlow: 'rgba(245, 130, 56, 0.4)',
    gridColor: 'rgba(125, 175, 215, 0.05)',
    accentLabel: 'Alta Montaña 3,500m',
  },
  {
    id: 'bosque-coniferas',
    name: 'Bosque Coníferas',
    bg: 'from-[#060D0A] via-[#0D1C16] to-[#060D0A]',
    contourColor: 'rgba(74, 222, 128, 0.11)',
    contourAccent: 'rgba(74, 222, 128, 0.22)',
    trailColor: '#F27A38',
    trailGlow: 'rgba(242, 122, 56, 0.45)',
    gridColor: 'rgba(74, 222, 128, 0.04)',
    accentLabel: 'Brecha Forestal',
  },
  {
    id: 'canon-arcilla',
    name: 'Cañón Arcilla',
    bg: 'from-[#0F0A07] via-[#1E120A] to-[#0F0A07]',
    contourColor: 'rgba(235, 130, 75, 0.15)',
    contourAccent: 'rgba(235, 130, 75, 0.3)',
    trailColor: '#FF6B2C',
    trailGlow: 'rgba(255, 107, 44, 0.5)',
    gridColor: 'rgba(235, 130, 75, 0.05)',
    accentLabel: 'Terracería Compacta',
  },
  {
    id: 'valle-niebla',
    name: 'Valle Niebla',
    bg: 'from-[#0B0D0E] via-[#15191C] to-[#0B0D0E]',
    contourColor: 'rgba(190, 205, 215, 0.12)',
    contourAccent: 'rgba(190, 205, 215, 0.25)',
    trailColor: '#E8652A',
    trailGlow: 'rgba(232, 101, 42, 0.4)',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    accentLabel: 'Paso de Sierra',
  },
  {
    id: 'lava-petrificada',
    name: 'Lava Petrificada',
    bg: 'from-[#090807] via-[#161311] to-[#090807]',
    contourColor: 'rgba(255, 255, 255, 0.09)',
    contourAccent: 'rgba(255, 255, 255, 0.18)',
    trailColor: '#FF7A38',
    trailGlow: 'rgba(255, 122, 56, 0.45)',
    gridColor: 'rgba(255, 255, 255, 0.04)',
    accentLabel: 'Malpaís & Roca',
  },
  {
    id: 'sierra-madre-oro',
    name: 'Sierra Madre',
    bg: 'from-[#0D0B08] via-[#1A160F] to-[#0D0B08]',
    contourColor: 'rgba(234, 179, 8, 0.12)',
    contourAccent: 'rgba(234, 179, 8, 0.24)',
    trailColor: '#EA580C',
    trailGlow: 'rgba(234, 88, 12, 0.4)',
    gridColor: 'rgba(234, 179, 8, 0.04)',
    accentLabel: 'Miradores & Crestas',
  },
  {
    id: 'altiplano-zenit',
    name: 'Altiplano Zenit',
    bg: 'from-[#080B0D] via-[#10181F] to-[#080B0D]',
    contourColor: 'rgba(56, 189, 248, 0.12)',
    contourAccent: 'rgba(56, 189, 248, 0.22)',
    trailColor: '#F97316',
    trailGlow: 'rgba(249, 115, 22, 0.45)',
    gridColor: 'rgba(56, 189, 248, 0.04)',
    accentLabel: 'Planicie & Senderos',
  },
  {
    id: 'volcan-popocatepetl',
    name: 'Volcán Ceniza',
    bg: 'from-[#0A0706] via-[#1A0E0B] to-[#0A0706]',
    contourColor: 'rgba(239, 68, 68, 0.12)',
    contourAccent: 'rgba(239, 68, 68, 0.25)',
    trailColor: '#FB923C',
    trailGlow: 'rgba(251, 146, 60, 0.4)',
    gridColor: 'rgba(239, 68, 68, 0.04)',
    accentLabel: 'Ruta de Fuego',
  },
  {
    id: 'cumbra-nocturna',
    name: 'Cumbra Nocturna',
    bg: 'from-[#050505] via-[#111111] to-[#050505]',
    contourColor: 'rgba(255, 255, 255, 0.08)',
    contourAccent: 'rgba(255, 255, 255, 0.2)',
    trailColor: '#F36E21',
    trailGlow: 'rgba(243, 110, 33, 0.5)',
    gridColor: 'rgba(255, 255, 255, 0.03)',
    accentLabel: 'Expedición Táctica',
  },
];

// Hash determinista para que la misma ruta siempre tenga la misma paleta
function getPaletteForRoute(id: string, title: string) {
  let hash = 0;
  const str = id + title;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % TACTICAL_PALETTES.length;
  return TACTICAL_PALETTES[index];
}

export const RouteTacticalMapCard: React.FC<RouteTacticalMapCardProps> = ({
  proposal,
  className = '',
  heightClass = 'h-44',
  showOverlayBadges = true,
  isWinner = false,
  isLeader = false,
  optionIndex,
}) => {
  const palette = useMemo(
    () => getPaletteForRoute(proposal.id, proposal.title),
    [proposal.id, proposal.title]
  );

  // Generación SVG de la ruta y curvas de nivel topográficas
  const { pathString, startPt, endPt, waypointPoints, elevationPoints } = useMemo(() => {
    const rawCoords = proposal.coordinates && proposal.coordinates.length > 1
      ? proposal.coordinates
      : [
          [19.4005, -99.2816],
          [19.3820, -99.3510],
          [19.3510, -99.4520],
          [19.3210, -99.6200],
          [19.2840, -99.8200],
          [19.2612, -100.0450],
        ];

    // Bounding Box para normalizar coordenadas al viewport SVG (viewBox 0 0 400 200)
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    rawCoords.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const latSpan = maxLat - minLat || 0.01;
    const lngSpan = maxLng - minLng || 0.01;

    // Margen interno en el viewport SVG (X: 45 a 355, Y: 40 a 160)
    const project = (lat: number, lng: number) => {
      const x = 50 + ((lng - minLng) / lngSpan) * 300;
      // Invertir Y porque latitud norte crece hacia arriba
      const y = 160 - ((lat - minLat) / latSpan) * 120;
      return { x, y };
    };

    const projected = rawCoords.map(([lat, lng]) => project(lat, lng));

    // Crear curva suave Bézier o polilínea para la ruta
    let d = `M ${projected[0].x.toFixed(1)} ${projected[0].y.toFixed(1)}`;
    for (let i = 1; i < projected.length; i++) {
      const prev = projected[i - 1];
      const curr = projected[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    const last = projected[projected.length - 1];
    d += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

    // Puntos de inicio y fin
    const start = projected[0];
    const end = projected[projected.length - 1];

    // Waypoints proyectados
    const wpPts = (proposal.waypoints || []).map((wp, idx) => {
      const pt = project(wp.lat, wp.lng);
      return { ...wp, ...pt, idx };
    });

    // Puntos para silueta mini de perfil de elevación al fondo
    const elev = [
      { x: 300, y: 185 },
      { x: 320, y: 172 },
      { x: 345, y: 160 },
      { x: 370, y: 168 },
      { x: 390, y: 155 },
    ];

    return {
      pathString: d,
      startPt: start,
      endPt: end,
      waypointPoints: wpPts,
      elevationPoints: elev,
    };
  }, [proposal.coordinates, proposal.waypoints]);

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden select-none bg-gradient-to-br ${palette.bg} ${className}`}
    >
      {/* 1. Malla Cartográfica Táctica (Grid de Coordenadas) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`grid-${proposal.id}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={palette.gridColor}
              strokeWidth="0.8"
            />
            <circle cx="40" cy="40" r="0.8" fill={palette.gridColor} />
          </pattern>

          {/* Gradiente de brillo del trazo GPS */}
          <filter id={`glow-${proposal.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${proposal.id})`} />

        {/* 2. Curvas de Nivel Topográficas Vectoriales (Topo Contours) */}
        <g fill="none" opacity="0.9">
          {/* Contorno Index Principal 1 */}
          <path
            d="M -20,60 Q 80,20 180,70 T 360,40 T 430,85"
            stroke={palette.contourAccent}
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          {/* Contornos Intermedios */}
          <path
            d="M -30,85 Q 70,45 170,95 T 350,65 T 440,110"
            stroke={palette.contourColor}
            strokeWidth="0.8"
          />
          <path
            d="M -20,110 Q 90,70 190,120 T 370,90 T 430,135"
            stroke={palette.contourColor}
            strokeWidth="0.8"
          />
          {/* Contorno Index Principal 2 */}
          <path
            d="M -40,135 Q 60,95 160,145 T 340,115 T 450,160"
            stroke={palette.contourAccent}
            strokeWidth="1.2"
          />
          <path
            d="M -30,160 Q 80,120 180,170 T 360,140 T 440,185"
            stroke={palette.contourColor}
            strokeWidth="0.8"
          />
          {/* Formaciones montañosas concéntricas (Cimas topográficas) */}
          <ellipse
            cx="290"
            cy="70"
            rx="65"
            ry="30"
            stroke={palette.contourColor}
            strokeWidth="0.8"
            transform="rotate(-15 290 70)"
          />
          <ellipse
            cx="290"
            cy="70"
            rx="45"
            ry="20"
            stroke={palette.contourColor}
            strokeWidth="0.8"
            transform="rotate(-15 290 70)"
          />
          <ellipse
            cx="290"
            cy="70"
            rx="25"
            ry="11"
            stroke={palette.contourAccent}
            strokeWidth="1"
            transform="rotate(-15 290 70)"
          />

          <ellipse
            cx="95"
            cy="145"
            rx="55"
            ry="25"
            stroke={palette.contourColor}
            strokeWidth="0.8"
            transform="rotate(10 95 145)"
          />
          <ellipse
            cx="95"
            cy="145"
            rx="35"
            ry="16"
            stroke={palette.contourAccent}
            strokeWidth="1"
            transform="rotate(10 95 145)"
          />
        </g>

        {/* 3. Trazo GPS de la Ruta (Brillo exterior + Línea continua) */}
        <path
          d={pathString}
          fill="none"
          stroke={palette.trailGlow}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
        <path
          d={pathString}
          fill="none"
          stroke={palette.trailColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${proposal.id})`}
        />

        {/* 4. Waypoints Intermedios */}
        {waypointPoints.slice(1, -1).map((wp, i) => (
          <g key={i}>
            <circle
              cx={wp.x}
              cy={wp.y}
              r="2.5"
              fill="#FFFFFF"
              stroke={palette.trailColor}
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* 5. Punto de Salida (A) */}
        <g transform={`translate(${startPt.x}, ${startPt.y})`}>
          <circle r="6" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle r="2.5" fill="#FFFFFF" />
          <text
            x="-3"
            y="-9"
            fill="#FFFFFF"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            A
          </text>
        </g>

        {/* 6. Destino / Campamento (B) */}
        <g transform={`translate(${endPt.x}, ${endPt.y})`}>
          {/* Anillo de pulso radar */}
          <circle
            r="9"
            fill="none"
            stroke={palette.trailColor}
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping"
          />
          <circle r="6" fill={palette.trailColor} stroke="#FFFFFF" strokeWidth="1.5" />
          <circle r="2" fill="#000000" />
          <text
            x="8"
            y="3"
            fill="#FFFFFF"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            B
          </text>
        </g>

        {/* 7. Altitud y Coordenadas Topográficas (Estilo Cartográfico Militar) */}
        <text
          x="12"
          y="188"
          fill="rgba(255, 255, 255, 0.45)"
          fontSize="7.5"
          fontFamily="monospace"
          letterSpacing="0.08em"
        >
          {proposal.campsite?.elevationMeters ? `${proposal.campsite.elevationMeters}m MSNM` : 'TOPO 1:50K'} • {palette.accentLabel.toUpperCase()}
        </text>

        {/* Rosa de los vientos / Norte discreto */}
        <g transform="translate(378, 22)">
          <path d="M 0,-8 L 3,3 L 0,1 L -3,3 Z" fill="#FFFFFF" opacity="0.6" />
          <text
            x="-2.5"
            y="-10"
            fill="#FFFFFF"
            fontSize="6.5"
            fontFamily="monospace"
            fontWeight="bold"
            opacity="0.7"
          >
            N
          </text>
        </g>

        {/* Escala gráfica en km */}
        <g transform="translate(325, 185)" opacity="0.55">
          <line x1="0" y1="0" x2="35" y2="0" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#FFFFFF" strokeWidth="1" />
          <line x1="35" y1="-3" x2="35" y2="3" stroke="#FFFFFF" strokeWidth="1" />
          <text x="7" y="-4" fill="#FFFFFF" fontSize="6.5" fontFamily="monospace">
            20 KM
          </text>
        </g>
      </svg>

      {/* Degradado inferior para legibilidad perfecta de textos */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0B0A] via-transparent to-black/20 pointer-events-none" />

      {/* Badges superiores (Líder / Opción / Distancia y Terreno) */}
      {showOverlayBadges && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          {isWinner ? (
            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-emerald-500 text-black shadow">
              ★ Rodada Oficial
            </span>
          ) : isLeader ? (
            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-earth text-white shadow">
              #1 Líder en Apoyo
            </span>
          ) : (
            <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 bg-black/75 backdrop-blur-md border border-white/20 text-ash">
              Opción #{typeof optionIndex === 'number' ? optionIndex + 1 : 1}
            </span>
          )}

          <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-black/80 backdrop-blur-md border border-white/15 text-chalk font-bold flex items-center gap-1.5 shadow-sm">
            <span>{proposal.totalKm} km</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-0.5 text-earth" title="Terracería">
              <span>{proposal.offroadPercentage}% off</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="text-ash" title="Asfalto">
              <span>{proposal.asphaltPercentage || 100 - proposal.offroadPercentage}% asf</span>
            </span>
          </span>
        </div>
      )}

      {/* Destino y Dificultad al pie del mapa */}
      {showOverlayBadges && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="text-xs text-white font-bold flex items-center gap-1 drop-shadow-md">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: palette.trailColor }} />
            <span className="truncate max-w-[200px]">{proposal.destination}</span>
          </span>
          <span className="text-[10px] text-ash drop-shadow font-mono">
            {proposal.difficulty}
          </span>
        </div>
      )}
    </div>
  );
};
