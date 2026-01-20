module.exports = {
  expo: {
    name: 'TwilioVoiceExpoExample',
    slug: 'TwilioVoiceExpoExample',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'com.awx.autoworx',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.awx.autoworx',
      appleTeamId: 'HD3DRJP77N',
      infoPlist: {
        NSMicrophoneUsageDescription: 'foobar',
        UIBackgroundModes: ['audio', 'voip'],
      },
      entitlements: {
        'aps-environment': 'development',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.awx.autoworx',
      googleServicesFile: './google-services.json',
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
