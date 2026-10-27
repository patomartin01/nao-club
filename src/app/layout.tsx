import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';

export const viewport: Viewport = {
  themeColor: '#121110',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'NAO — The Emporium of Two-Wheeled Escapes | Moto Expeditions & Commune',
  description: 'Plataforma comunitaria y de exploración para motociclismo de aventura, rodadas en consenso, garajes compartidos y expediciones off-road.',
  keywords: ['NAO', 'motos custom', 'dual-sport', 'deus ex machina', 'expediciones', 'rutas gpx', 'moto club'],
  authors: [{ name: 'Patricio Martin' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NAO Moto'
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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500;1,6..72,600&family=Oswald:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#F6F4EE] text-[#141312] selection:bg-[#F2B705] selection:text-[#141312] font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
