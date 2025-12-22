/**
 * Polyfills for React Native
 * This file handles global variables that might be missing in the React Native environment
 */

// Import URL polyfill
import 'react-native-url-polyfill/auto';

// Import other necessary polyfills
import 'react-native-polyfill-globals/auto';

// Additional polyfills for specific React Native environment
if (typeof global !== 'undefined') {
  // Ensure setTimeout and setImmediate are available
  if (typeof global.setTimeout === 'undefined') {
    global.setTimeout =
      require('react-native/Libraries/Core/Timers/JSTimers').setTimeout;
  }

  if (typeof global.setImmediate === 'undefined') {
    global.setImmediate =
      require('react-native/Libraries/Core/Timers/JSTimers').setImmediate;
  }

  if (typeof global.clearTimeout === 'undefined') {
    global.clearTimeout =
      require('react-native/Libraries/Core/Timers/JSTimers').clearTimeout;
  }

  // Polyfill for queueMicrotask if not available
  if (typeof global.queueMicrotask === 'undefined') {
    global.queueMicrotask = require('react-native/Libraries/Core/Timers/queueMicrotask');
  }
}
