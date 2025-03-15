import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register the app directly with AppRegistry
// This is more reliable than using Expo's registerRootComponent
AppRegistry.registerComponent('main', () => App);
