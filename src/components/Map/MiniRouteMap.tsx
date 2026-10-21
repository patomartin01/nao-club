'use client';

import React, { useEffect, useRef } from 'react';

interface MiniRouteMapProps {
  coordinates: [number, number][];
}

const MiniRouteMap: React.FC<MiniRouteMapProps> = ({ coordinates }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import('leaflet')).default;
      if (!isMounted || !containerRef.current) return;

      const defaultCenter: [number, number] = coordinates.length > 0 ? coordinates[0] : [19.4326, -99.1332];

      const map = L.map(containerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false
      });

      mapRef.current = map;

      // CartoDB Dark Matter tiles (identical to Strava's sleek dark map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      if (coordinates.length > 1) {
        // Orange Strava-style polyline
        const polyline = L.polyline(coordinates, {
          color: '#E06D38',
          weight: 4,
          opacity: 0.95,
          smoothFactor: 1
        }).addTo(map);

        // Green start marker dot
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `<div style="width: 10px; height: 10px; background-color: #22c55e; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.8);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
        L.marker(coordinates[0], { icon: startIcon }).addTo(map);

        // Red/Orange end marker dot
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `<div style="width: 10px; height: 10px; background-color: #ef4444; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(0,0,0,0.8);"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
        L.marker(coordinates[coordinates.length - 1], { icon: endIcon }).addTo(map);

        map.fitBounds(polyline.getBounds(), { padding: [24, 24] });
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div ref={containerRef} className="w-full h-full relative z-0 select-none pointer-events-none" />
  );
};

export default MiniRouteMap;
