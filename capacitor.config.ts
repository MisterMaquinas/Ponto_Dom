import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dd0d6e4af5a7467e95dd09ad46b4d472',
  appName: 'pontodom',
  webDir: 'dist',
  server: {
    url: 'https://dd0d6e4a-f5a7-467e-95dd-09ad46b4d472.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e40af',
      showSpinner: false
    }
  },
  android: {
    minWebViewVersion: 60,
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    scheme: 'PontoDom',
    contentInset: 'automatic'
  }
};

export default config;
