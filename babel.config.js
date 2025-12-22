module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Add any additional babel plugins here if needed
  ],
  env: {
    production: {
      plugins: [
        // Remove console statements in production
        ['transform-remove-console', {exclude: ['error', 'warn']}],
      ],
    },
  },
};
