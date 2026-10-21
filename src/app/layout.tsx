import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const viewport: Viewport = {
  themeColor: '#0B0A09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'NAO — Moto Expeditions | Plataforma de Rodadas Off-Road & Dual-Sport',
  description: 'Plataforma de exploración comunitaria para rodadas en motos doble propósito, consenso de rutas por votación, navegación GPX y organización de clubs.',
  keywords: ['NAO', 'motos trail', 'off-road', 'doble proposito', 'expediciones', 'rutas gpx', 'moto clubs'],
  authors: [{ name: 'Patricio Martin' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NAO Club'
  },
  formatDetection: {
    telephone: false
  }
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
