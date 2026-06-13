import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jamfind.app',
  appName: 'JamFind',
  webDir: 'out',

  // During development: point to your Mac's Next.js dev server
  // Replace with your Mac's local IP (find it with: ipconfig getifaddr en0)
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#0D0D0D',
    // Enable background audio
    appendUserAgent: 'JamFind-iOS',
  },

  android: {
    backgroundColor: '#0D0D0D',
    appendUserAgent: 'JamFind-Android',
    allowMixedContent: true,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#0D0D0D',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0D0D0D',
    },
  },
};

export default config;
