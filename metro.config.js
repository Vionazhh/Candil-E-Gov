// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add platform resolution for web compatibility
config.resolver.resolverMainFields =
  ['react-native', 'browser', 'main'];

// Add support for web-specific extensions
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').concat([
    'expo.ts',
    'expo.tsx',
    'expo.js',
    'expo.jsx',
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'wasm',
    'svg'
  ]), ...(process.env.EXPO_PUBLIC_PLATFORM === 'web' ? ['web.js', 'web.jsx', 'web.ts', 'web.tsx'] : [])]
  : ['expo.ts',
    'expo.tsx',
    'expo.js',
    'expo.jsx',
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'wasm',
    'svg',
    ...(process.env.EXPO_PUBLIC_PLATFORM === 'web' ? ['web.js', 'web.jsx', 'web.ts', 'web.tsx'] : [])];

// Add support for CJS files
config.resolver.sourceExts.push('cjs', 'mjs');
config.resolver.unstable_enablePackageExports = false;

// Handle platform-specific file extensions
config.resolver.assetExts.push('pdf');

// Add Firebase-specific configurations
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@firebase/util': path.resolve(__dirname, 'node_modules/@firebase/util'),
};


module.exports = config;