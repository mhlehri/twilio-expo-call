const {
  withAndroidManifest,
  withPlugins,
  AndroidConfig,
  withInfoPlist,
} = require("@expo/config-plugins");

// 1. Android Manifest Configuration
const withCallKeepManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );
    const serviceName = "io.wazo.callkeep.VoiceConnectionService";

    if (!mainApplication.service) mainApplication.service = [];

    const hasService = mainApplication.service.some(
      (s) => s.$["android:name"] === serviceName
    );

    if (!hasService) {
      mainApplication.service.push({
        $: {
          "android:name": serviceName,
          "android:label": "AutoWorx",
          "android:permission":
            "android.permission.BIND_TELECOM_CONNECTION_SERVICE",
          // CRITICAL: added phoneCall type
          "android:foregroundServiceType": "phoneCall|microphone|camera",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.telecom.ConnectionService" } },
            ],
          },
        ],
      });
    }
    return config;
  });
};

// 2. iOS Info.plist Configuration
const withCallKeepIOS = (config) => {
  return withInfoPlist(config, (config) => {
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }
    if (!config.modResults.UIBackgroundModes.includes("voip")) {
      config.modResults.UIBackgroundModes.push("voip");
    }
    // Required for CallKit to show the system UI
    config.modResults.LSSupportsOpeningDocumentsInPlace = true;
    return config;
  });
};

const withCallKeepPermissions = (config) => {
  return AndroidConfig.Permissions.withPermissions(config, [
    "android.permission.BIND_TELECOM_CONNECTION_SERVICE",
    "android.permission.MANAGE_OWN_CALLS",
    "android.permission.READ_CALL_LOG",
    "android.permission.READ_PHONE_STATE",
    "android.permission.CALL_PHONE",
    "android.permission.RECORD_AUDIO",
    "android.permission.FOREGROUND_SERVICE_PHONE_CALL", // Added for Android 14
  ]);
};

module.exports = (config) => {
  return withPlugins(config, [
    withCallKeepPermissions,
    withCallKeepManifest,
    withCallKeepIOS,
  ]);
};
