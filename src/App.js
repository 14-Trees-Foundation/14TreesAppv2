import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, RootTagContext } from 'react-native';
import { enableLatestRenderer } from 'react-native-maps';
import { PERMISSIONS } from 'react-native-permissions';
import { DrawerNavigator } from './components/Components';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/Login';
import { Strings } from './services/Strings';
import { Constants, Utils } from './services/Utils';
import { checkMultiplePermissions } from './services/check_permissions';
import DeviceInfo from 'react-native-device-info';
import { DataService } from './services/DataService';
import { styleConfigs } from './services/Styles';

enableLatestRenderer();



const Stack = createStackNavigator();
async function requestPermissions() {
  //https://developer.android.com/training/data-storage/shared/media#storage-permission
  const androidVersion = Number.parseInt(Platform.constants['Release']);
  const versionOfPermissionChange = 13;
  const permissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    PERMISSIONS.ANDROID.READ_PHONE_NUMBERS
  ];
  if (androidVersion < versionOfPermissionChange) {
    permissions.push(...[
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    ]);
  }
  else {
    permissions.push(...[
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
    ])
  }
  console.log("permission array: ", permissions);

  let res = await checkMultiplePermissions(permissions);
  if (!res) {
    Alert.alert(
      Strings.alertMessages.PermissionsRequired,
      Strings.alertMessages.Settings,
    );
  }
}
export const stackNavRef = createNavigationContainerRef();
const App = () => {
  const rootTag = useContext(RootTagContext);
  console.log('app roottag: ', rootTag)

  AsyncStorage.setItem(Constants.appRootTagKey, rootTag.toString());

  const checkSignInStatus = async () => {
    try {

      const phoneNumber = await DeviceInfo.getPhoneNumber();

      console.log("phone no: ", phoneNumber);

      const userDataPayload = {
        phone: phoneNumber.length > 10 ? phoneNumber.substring(2) : phoneNumber,
      }

      const isSignedIn = await DataService.loginUser(userDataPayload);
      const response = isSignedIn.data;
      console.log("response data: ", response);

      if (response.success) {
        // User is signed in, navigate to HomeScreen
        await AsyncStorage.setItem(Constants.userIdKey, response.user._id);
        console.log('userId stored: ', response.user._id);
        response.data = { ...response.user, image: '' }
        console.log("response data: ", response.data);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
        return true;
      }
      else {
        // User is not signed in, navigate to LoginScreen
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  };

  const initTasks = async () => {

    let storedlang = await Strings.getLanguage();
    console.log('stored lang: ', storedlang);
    if (storedlang === null) {
      Strings.setLanguage(Strings.english);
    }
    else {
      Strings.setLanguage(storedlang);
    }

    const loggedIn = await checkSignInStatus();
    await Utils.setDBConnection();//ensures ldb setup in Utils
    await Utils.createLocalTablesIfNeeded();
    if (loggedIn) {
      stackNavRef.current?.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));
    }
    else {
      stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
    }
  }
  //Code cleanup.

  const backHandler = () => {
    return true;
  }

  useEffect(() => {
    requestPermissions();
    initTasks();
    BackHandler.addEventListener('hardwareBackPress', backHandler)//disables back button presses.
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }
  }, []);

  return (
    <NavigationContainer ref={stackNavRef}>
      <Stack.Navigator>
        <Stack.Screen
          name={Strings.screenNames.getString('startScreen', Strings.english)}
          component={LoadingScreen}
          options={{ headerShown: false }} />
        <Stack.Screen
          name={Strings.screenNames.getString('LogIn', Strings.english)}
          component={LoginScreen}
          options={{
            headerLeft: () => null,
            ...styleConfigs.drawerHeaderOptions,
            title: Strings.screenNames.LogIn
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('DrawerScreen', Strings.english)}
          component={DrawerNavigator}
          options={{
            headerLeft: () => null,
            headerShown: false
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;