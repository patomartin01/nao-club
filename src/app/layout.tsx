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
  title: 'MotoMami ADV Club | Plataforma de Rodadas & Terracería',
  description: 'Organiza rodadas en motos doble propósito, propone rutas con mapas interactivos, vota en comunidad, registra tus motos y coordina campamentos base.',
  keywords: ['motos', 'doble proposito', 'off-road', 'rodadas', 'campamento base', 'motomami', 'mexico'],
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
      <body className="min-h-screen bg-[#06090D] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
