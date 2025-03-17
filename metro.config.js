const {getDefaultConfig} = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Additional configuration for Expo projects
const { resolver: { sourceExts, assetExts } } = config;

// Add additional extensions used by Expo and React Native
config.resolver.assetExts = assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg', 'mjs', 'cjs'];

// Handle SVG files appropriately
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer')
};

module.exports = config;
