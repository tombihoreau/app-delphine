import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sportcoach.app',
  appName: 'SportCoach',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;