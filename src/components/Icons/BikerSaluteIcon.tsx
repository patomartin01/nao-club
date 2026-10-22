import React from 'react';

interface BikerSaluteIconProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
}

/**
 * Universal Biker Salute (El Saludo Motero en V hacia abajo).
 * El saludo tradicional de los motociclistas en ruta con dos dedos extendidos.
 */
export const BikerSaluteIcon: React.FC<BikerSaluteIconProps> = ({ 
  className = "w-4 h-4", 
  active = false,
  ...props 
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={active ? "1.5" : "1.8"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Universal Biker Salute (Two fingers in V pointing downward/forward) */}
      {/* Wrist / Glove Cuff */}
      <path d="M2 11l2-2.5c1.2-1.5 3.3-1.8 4.8-.8l1.2.8" />
      <path d="M2 15l2.2 1.8c1.5 1.2 3.6.9 4.8-.6l.8-1" />
      
      {/* Index finger pointing forward */}
      <path d="M10 9.5l9.5-1.5c1.4-.2 2.5.8 2.5 2.2 0 1.2-.9 2.2-2.1 2.3l-6.9.5" />
      
      {/* Middle finger forming the V downwards */}
      <path d="M13 13l7.5 4c1.2.6 1.6 2.1 1 3.2-.6 1.1-2 1.5-3.1.9l-7.4-4.1" />
      
      {/* Folded ring, pinky & thumb holding them in place */}
      <path d="M8.5 10.5c.8.8 1.5 2 1.2 3.5-.3 1.5-1.5 2.5-3 2" />
      <path d="M8 12.5c.8 0 1.5.5 1.8 1.2" />
    </svg>
  );
};
