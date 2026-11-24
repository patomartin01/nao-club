import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NAO — Moto Club & Expeditions',
    short_name: 'NAO Moto',
    description: 'Plataforma comunitaria y de exploración para motociclismo de aventura, rodadas en consenso, garajes compartidos y expediciones.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6ED',
    theme_color: '#1A1918',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/apple-icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/apple-icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  };
}
