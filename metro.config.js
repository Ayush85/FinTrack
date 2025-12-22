const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    minifierConfig: {
      // Reduce verbose warnings in production builds
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
  resolver: {
    // Ensure proper resolution of polyfills
    alias: {
      'react-native-url-polyfill/auto': require.resolve(
        'react-native-url-polyfill/auto',
      ),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
