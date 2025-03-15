// Override for app.json with dynamic configuration
const appJson = require('./app.json');

module.exports = {
  ...appJson,
  // Add any dynamic configuration here
  extra: {
    ...appJson.expo.extra,
    // Force enable Hermes for better performance
    jsEngine: 'hermes',
  },
};