import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import AppWrapper from './src/AppWrapper';
import 'react-native-get-random-values';

 //AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => AppWrapper);