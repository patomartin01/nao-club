import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

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
    <html lang="es" className={`${inter.variable} ${outfit.variable} dark`}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-[#060709] text-white selection:bg-[#C87D55] selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
