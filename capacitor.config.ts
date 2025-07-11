import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.monroyramirez.CSResidente',
  appName: 'Comunidad Segura - Residentes',
  webDir: 'www',
  cordova: {
    preferences: {
      'android-minSdkVersion': '26',
      'android-targetSdkVersion': '34',
      'android-compileSdkVersion': '33',
      AndroidXEnabled: 'true',
      AutoHideSplashScreen: 'true',
      FadeSplashScreen: 'true',
      FadeSplashScreenDuration: '300',
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen'
    }
  }
};

export default config;
