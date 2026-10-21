import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const metadata: Metadata = {
  title: 'NAO — Navana Expeditions | Navegación Terrestre & Refugios de Diseño',
  description: 'Plataforma brutalista de exploración off-road en motos doble propósito, consenso de rutas efímeras y refugios arquitectónicos (Navana Cabins).',
  keywords: ['NAO', 'Navana Cabins', 'off-road', 'doble proposito', 'expediciones', 'rutas', 'valle de bravo'],
  authors: [{ name: 'Patricio Martin' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-obsidian text-chalk selection:bg-earth selection:text-white font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
