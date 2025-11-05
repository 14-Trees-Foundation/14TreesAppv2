import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { GlobalContextProvider } from './src/context/GlobalContext ';

import ReactNativeForegroundService from "@supersami/rn-foreground-service";
ReactNativeForegroundService.register();

// ✅ Console overrides for logging (RCTLog not available in JS)
// if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
  };
// }
console.log("🚀 App bootstrap: overrides are being applied!");

const Main = () => (
  <GlobalContextProvider>
    <App />
  </GlobalContextProvider>
);

AppRegistry.registerComponent(appName, () => Main);
