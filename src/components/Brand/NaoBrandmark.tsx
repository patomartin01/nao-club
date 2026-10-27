'use client';

import React from 'react';

interface NaoBrandmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

/**
 * Authentic NAO Risograph / 70s Bauhaus Wordmark
 * Inspired directly by vintage serigraphy, matchbook lettering, and 70s display grotesque:
 * - Rounded brutalist N with solid stems and smooth junctions
 * - Distinctive arched-dome A with low crossbar and dome counter window (∩)
 * - Heavy squircle O with uniform optical wall thickness
 * - Poppy vermillion ink (#EB4438 / #E6332A) with analog serigraphic texture
 */
export const NaoBrandmark: React.FC<NaoBrandmarkProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const heightClasses = size === 'sm' 
    ? 'h-7 sm:h-8' 
    : size === 'lg' 
    ? 'h-11 sm:h-12' 
    : 'h-8 sm:h-9 md:h-10';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={`inline-flex items-center justify-center select-none cursor-pointer group focus:outline-none transition-transform duration-150 active:scale-95 ${className}`}
      title="NAO — Retornar a Inicio"
    >
      <svg
        className={`${heightClasses} w-auto text-[#EB4438] transition-all duration-200 group-hover:scale-[1.03] group-hover:drop-shadow-[0_2px_4px_rgba(235,68,56,0.15)]`}
        viewBox="0 0 160 52"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="NAO"
      >
        <defs>
          {/* Subtle analog ink-bleed filter for authentic serigraphic edge texture */}
          <filter id="nao-ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#nao-ink-bleed)">
          {/* ========================================================= */}
          {/* LETTER N                                                  */}
          {/* Heavy rounded brutalist stems with smooth corner cuts     */}
          {/* ========================================================= */}
          <path
            d="M11 0 H21 L37 38 V4 C37 1.8 38.8 0 41 0 H47 C49.2 0 51 1.8 51 4 V48 C51 50.2 49.2 52 47 52 H37 L21 14 V48 C21 50.2 19.2 52 17 52 H11 C8.8 52 7 50.2 7 48 V4 C7 1.8 8.8 0 11 0 Z"
          />

          {/* ========================================================= */}
          {/* LETTER A                                                  */}
          {/* 70s arched dome top, low solid crossbar & dome cutout (∩) */}
          {/* ========================================================= */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M62 52 H72 V37 H88 V52 H98 C100.2 52 102 50.2 102 48 V18 C102 7 93 0 80 0 C67 0 58 7 58 18 V48 C58 50.2 59.8 52 62 52 Z M72 27 V18 C72 13.5 75.5 10 80 10 C84.5 10 88 13.5 88 18 V27 Z"
          />

          {/* ========================================================= */}
          {/* LETTER O                                                  */}
          {/* Bold squircle-grotesque loop with uniform 14px wall       */}
          {/* ========================================================= */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M127 0 H135 C145 0 153 8 153 18 V34 C153 44 145 52 135 52 H127 C117 52 109 44 109 34 V18 C109 8 117 0 127 0 Z M127 14 H135 C137.5 14 139 15.5 139 18 V34 C139 36.5 137.5 38 135 38 H127 C124.5 38 123 36.5 123 34 V18 C123 15.5 124.5 14 127 14 Z"
          />
        </g>
      </svg>
    </div>
  );
};
