import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'club.nao.motomami',
  appName: 'NAO Club',
  webDir: 'out',
  server: {
    url: 'https://nao-club-three.vercel.app',
    cleartext: false,
    androidScheme: 'https'
  }
};

export default config;
