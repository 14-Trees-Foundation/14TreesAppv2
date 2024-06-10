import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { GlobalContextProvider } from './src/context/GlobalContext ';

import ReactNativeForegroundService from "@supersami/rn-foreground-service";
ReactNativeForegroundService.register();

const Main = () => (
    <GlobalContextProvider>
        <App />
    </GlobalContextProvider>
);

AppRegistry.registerComponent(appName, () => Main);

//AppRegistry.registerComponent(appName, () => App);