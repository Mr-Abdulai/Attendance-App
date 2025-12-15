const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidPatch(config) {
    return withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            // The enableBundleCompression property was removed in React Native 0.76
            // But the Expo template still generates it (as of SDK 54.0.29)
            // We must remove it to prevent "Could not set unknown property" error
            config.modResults.contents = config.modResults.contents.replace(
                /enableBundleCompression\s*=\s*.*$/gm,
                '// enableBundleCompression = (removed by withAndroidPatch for RN 0.76 compatibility)'
            );
        }
        return config;
    });
};
