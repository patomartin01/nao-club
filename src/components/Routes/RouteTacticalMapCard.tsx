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

// Paletas editoriales inspiradas en cartografía alpina y serigrafía Risograph
const TACTICAL_PALETTES = [
  {
    id: 'sierra-pergamino',
    name: 'Sierra Pergamino',
    bg: 'bg-[#FAF6ED]',
    contourColor: 'rgba(26, 25, 24, 0.16)',
    contourAccent: 'rgba(224, 100, 35, 0.45)', // Terracotta
    trailColor: '#E6332A', // Poppy Vermillion
    trailGlow: 'rgba(230, 51, 42, 0.25)',
    gridColor: 'rgba(26, 25, 24, 0.08)',
    accentLabel: 'Cordillera Volcánica',
  },
  {
    id: 'valle-canela',
    name: 'Valle Canela',
    bg: 'bg-[#F4EEDB]',
    contourColor: 'rgba(26, 25, 24, 0.18)',
    contourAccent: 'rgba(29, 68, 119, 0.42)', // Cobalt
    trailColor: '#E06423', // Terracotta
    trailGlow: 'rgba(224, 100, 35, 0.25)',
    gridColor: 'rgba(26, 25, 24, 0.09)',
    accentLabel: 'Alta Montaña 3,500m',
  },
  {
    id: 'bosque-coniferas',
    name: 'Bosque Coníferas',
    bg: 'bg-[#F2EFE8]',
    contourColor: 'rgba(59, 74, 55, 0.22)',
    contourAccent: 'rgba(230, 51, 42, 0.42)',
    trailColor: '#1A1918', // Deep carbon
    trailGlow: 'rgba(26, 25, 24, 0.2)',
    gridColor: 'rgba(26, 25, 24, 0.08)',
    accentLabel: 'Brecha Forestal',
  },
  {
    id: 'altiplano-ocre',
    name: 'Altiplano Ocre',
    bg: 'bg-[#F6EEDD]',
    contourColor: 'rgba(26, 25, 24, 0.15)',
    contourAccent: 'rgba(247, 179, 43, 0.60)', // Mustard
    trailColor: '#1D4477', // Vintage Cobalt
    trailGlow: 'rgba(29, 68, 119, 0.25)',
    gridColor: 'rgba(26, 25, 24, 0.08)',
    accentLabel: 'Terracería Compacta',
  },
];

// Hash determinista para que la misma ruta siempre tenga la misma paleta editorial
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
  const { pathString, startPt, endPt, waypointPoints } = useMemo(() => {
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

    // Margen interno en el viewport SVG (X: 50 a 350, Y: 40 a 160)
    const project = (lat: number, lng: number) => {
      const x = 50 + ((lng - minLng) / lngSpan) * 300;
      const y = 160 - ((lat - minLat) / latSpan) * 120;
      return { x, y };
    };

    const projected = rawCoords.map(([lat, lng]) => project(lat, lng));

    // Curva Bézier fluida para el trazado del camino
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

    const start = projected[0];
    const end = projected[projected.length - 1];

    const wpPts = (proposal.waypoints || []).map((wp, idx) => {
      const pt = project(wp.lat, wp.lng);
      return { ...wp, ...pt, idx };
    });

    return {
      pathString: d,
      startPt: start,
      endPt: end,
      waypointPoints: wpPts,
    };
  }, [proposal.coordinates, proposal.waypoints]);

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden select-none ${palette.bg} border-b-2 border-[#1A1918] ${className}`}
    >
      {/* 1. Malla Cartográfica de Topografía Editorial */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`grid-${proposal.id}`}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke={palette.gridColor}
              strokeWidth="0.8"
            />
            <circle cx="36" cy="36" r="0.8" fill={palette.gridColor} />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${proposal.id})`} />

        {/* 2. Curvas de Nivel Topográficas Vectoriales (Estilo Litográfico) */}
        <g fill="none">
          {/* Contorno Index Principal 1 */}
          <path
            d="M -20,60 Q 80,20 180,70 T 360,40 T 430,85"
            stroke={palette.contourAccent}
            strokeWidth="1.4"
            strokeDasharray="5 2.5"
          />
          {/* Contornos Intermedios */}
          <path
            d="M -30,85 Q 70,45 170,95 T 350,65 T 440,110"
            stroke={palette.contourColor}
            strokeWidth="0.9"
          />
          <path
            d="M -20,110 Q 90,70 190,120 T 370,90 T 430,135"
            stroke={palette.contourColor}
            strokeWidth="0.9"
          />
          {/* Contorno Index Principal 2 */}
          <path
            d="M -40,135 Q 60,95 160,145 T 340,115 T 450,160"
            stroke={palette.contourAccent}
            strokeWidth="1.4"
          />
          <path
            d="M -30,160 Q 80,120 180,170 T 360,140 T 440,185"
            stroke={palette.contourColor}
            strokeWidth="0.9"
          />
          
          {/* Elevaciones concéntricas de cumbres */}
          <ellipse
            cx="290"
            cy="70"
            rx="65"
            ry="30"
            stroke={palette.contourColor}
            strokeWidth="0.9"
            transform="rotate(-15 290 70)"
          />
          <ellipse
            cx="290"
            cy="70"
            rx="45"
            ry="20"
            stroke={palette.contourColor}
            strokeWidth="0.9"
            transform="rotate(-15 290 70)"
          />
          <ellipse
            cx="290"
            cy="70"
            rx="25"
            ry="11"
            stroke={palette.contourAccent}
            strokeWidth="1.2"
            transform="rotate(-15 290 70)"
          />

          <ellipse
            cx="95"
            cy="145"
            rx="55"
            ry="25"
            stroke={palette.contourColor}
            strokeWidth="0.9"
            transform="rotate(10 95 145)"
          />
          <ellipse
            cx="95"
            cy="145"
            rx="35"
            ry="16"
            stroke={palette.contourAccent}
            strokeWidth="1.2"
            transform="rotate(10 95 145)"
          />
        </g>

        {/* 3. Trazo GPS de la Ruta (Tinta Sólida Risograph con sombra mecánica) */}
        <path
          d={pathString}
          fill="none"
          stroke="#1A1918"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.25"
          transform="translate(1, 1)"
        />
        <path
          d={pathString}
          fill="none"
          stroke={palette.trailColor}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4. Waypoints Intermedios (Remaches) */}
        {waypointPoints.slice(1, -1).map((wp, i) => (
          <g key={i}>
            <circle
              cx={wp.x}
              cy={wp.y}
              r="3.5"
              fill="#FAF6ED"
              stroke="#1A1918"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* 5. Punto de Salida (A) */}
        <g transform={`translate(${startPt.x}, ${startPt.y})`}>
          <circle r="7" fill="#FAF6ED" stroke="#1A1918" strokeWidth="2" />
          <circle r="3" fill="#1A1918" />
          <rect x="-14" y="-19" width="10" height="9" rx="2" fill="#1A1918" />
          <text
            x="-9"
            y="-12"
            fill="#FAF6ED"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            A
          </text>
        </g>

        {/* 6. Destino / Campamento (B) */}
        <g transform={`translate(${endPt.x}, ${endPt.y})`}>
          <circle r="8" fill="#FAF6ED" stroke="#1A1918" strokeWidth="2" />
          <circle r="4" fill="#E6332A" />
          <rect x="5" y="-17" width="11" height="9" rx="2" fill="#E6332A" stroke="#1A1918" strokeWidth="1" />
          <text
            x="10.5"
            y="-10"
            fill="#FFFFFF"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            B
          </text>
        </g>

        {/* 7. Altitud y Coordenadas Topográficas */}
        <text
          x="12"
          y="188"
          fill="#1A1918"
          opacity="0.65"
          fontSize="8"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.08em"
        >
          {proposal.campsite?.elevationMeters ? `${proposal.campsite.elevationMeters}m MSNM` : 'CARTA 1:50,000'} • {palette.accentLabel.toUpperCase()}
        </text>

        {/* Rosa de los vientos / Norte discreto */}
        <g transform="translate(378, 22)">
          <path d="M 0,-8 L 3,3 L 0,1 L -3,3 Z" fill="#1A1918" opacity="0.75" />
          <text
            x="-2.5"
            y="-10"
            fill="#1A1918"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            opacity="0.85"
          >
            N
          </text>
        </g>

        {/* Escala gráfica en km */}
        <g transform="translate(325, 185)" opacity="0.75">
          <line x1="0" y1="0" x2="35" y2="0" stroke="#1A1918" strokeWidth="1.2" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#1A1918" strokeWidth="1.2" />
          <line x1="35" y1="-3" x2="35" y2="3" stroke="#1A1918" strokeWidth="1.2" />
          <text x="7" y="-4" fill="#1A1918" fontSize="7" fontFamily="monospace" fontWeight="bold">
            20 KM
          </text>
        </g>
      </svg>

      {/* Badges superiores tipo sello postal / placa mecánica */}
      {showOverlayBadges && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 gap-2">
          {isWinner ? (
            <span className="text-[9px] font-mono uppercase font-black px-2.5 py-1 bg-[#E6332A] text-white border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-md flex items-center gap-1">
              <span>★</span>
              <span>RUTA SELECCIONADA</span>
            </span>
          ) : isLeader ? (
            <span className="text-[9px] font-mono uppercase font-black px-2.5 py-1 bg-[#F7B32B] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-md flex items-center gap-1">
              <span>★</span>
              <span>#1 LÍDER EN APOYO</span>
            </span>
          ) : (
            <span className="text-[9px] font-mono uppercase font-black px-2.5 py-1 bg-[#FAF6ED] text-[#1A1918] border-2 border-[#1A1918] shadow-[2px_2px_0px_#1A1918] rounded-md">
              OPCIÓN #{typeof optionIndex === 'number' ? optionIndex + 1 : 1}
            </span>
          )}

          <span className="text-[9px] font-mono uppercase px-2.5 py-1 bg-[#FAF6ED] border-2 border-[#1A1918] text-[#1A1918] font-black shadow-[2px_2px_0px_#1A1918] rounded-md flex items-center gap-1.5">
            <span>{proposal.totalKm} KM</span>
            <span className="text-[#1A1918]/30">•</span>
            <span className="text-[#E06423]" title="Terracería">
              {proposal.offroadPercentage}% OFF
            </span>
            <span className="text-[#1A1918]/30">|</span>
            <span className="text-[#1A1918]/70" title="Asfalto">
              {proposal.asphaltPercentage || 100 - proposal.offroadPercentage}% ASF
            </span>
          </span>
        </div>
      )}

      {/* Destino y Dificultad al pie del mapa */}
      {showOverlayBadges && (
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 gap-2">
          <span className="text-[11px] font-mono font-black text-[#1A1918] bg-[#FAF6ED]/95 px-2.5 py-0.5 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] rounded-md flex items-center gap-1.5 truncate max-w-[220px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: palette.trailColor }} />
            <span className="truncate">{proposal.destination}</span>
          </span>
          <span className="text-[10px] font-mono font-black text-[#1A1918] bg-[#FAF6ED]/95 px-2 py-0.5 border border-[#1A1918] shadow-[1px_1px_0px_#1A1918] rounded-md shrink-0">
            {proposal.difficulty}
          </span>
        </div>
      )}
    </div>
  );
};
