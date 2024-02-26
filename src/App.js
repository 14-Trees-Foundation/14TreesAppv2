import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, RootTagContext } from 'react-native';
import { enableLatestRenderer } from 'react-native-maps';
import { PERMISSIONS, request } from 'react-native-permissions';
import { DrawerNavigator } from './components/Components';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/Login';
import { Strings } from './services/Strings';
import { Constants, Utils } from './services/Utils';
import { checkMultiplePermissions } from './services/check_permissions';
import DeviceInfo from 'react-native-device-info';
import { DataService } from './services/DataService';
import { styleConfigs } from './services/Styles';
import { LangProvider } from './context/LangContext ';

enableLatestRenderer();

async function requestPermissions() {
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
  let ungrantedPermissions = await checkMultiplePermissions(permissions);
  console.log("ungrantedPermissions: ", ungrantedPermissions);

  if (ungrantedPermissions.length > 0) {
    Alert.alert(Strings.alertMessages.PermissionsRequired, Strings.alertMessages.Settings);
  }

}


const Stack = createStackNavigator();


export const stackNavRef = createNavigationContainerRef();

const App = () => {
  const rootTag = useContext(RootTagContext);
  console.log('app roottag: ', rootTag)

  AsyncStorage.setItem(Constants.appRootTagKey, rootTag.toString());

  const checkSignInStatus = async () => {
    try {

      let phoneNumber, deviceinfo, deviceName, device;

      try {
        phoneNumber = await DeviceInfo.getPhoneNumber();
        deviceinfo = await DeviceInfo.getManufacturer();
        deviceName = await DeviceInfo.getDeviceName();
        device = deviceinfo + "" + deviceName;
        console.log("phone no: ", phoneNumber, " device: ", device);
      } catch (error) {
        const errorLog = error.toString();
        console.log("error phone: ", errorLog);
        //await Utils.logException(null, device, "not found", errorLog);
      }

      // const logs = await Utils.getLogsFromLocalDB();
      // console.log("logs from local db: ", logs);

      const userDataPayload = {
        phone: phoneNumber,
      }

      if (!phoneNumber) {
        // User is not signed in, navigate to LoginScreen
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }

      const isSignedIn = await DataService.loginUser(userDataPayload);
      const response = isSignedIn.data;
      console.log("response data inside app.js: ", response);

      if (response.success === false) {
        // User is not signed in, navigate to LoginScreen
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }

      if (response.user.adminID) {
        await AsyncStorage.setItem(Constants.adminIdKey, response.user.adminID);
        const admin_id = await AsyncStorage.getItem(Constants.adminIdKey);
        console.log('adminId stored from async: ', admin_id);
        console.log('adminId : ', response.user.adminID);
      } else {
        console.log('adminId not stored');
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.user._id);
        console.log('userId stored: ', response.user._id);
        response.data = { ...response.user, image: '' };
        console.log("response data modified: ", response.data);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
      } catch (error) {
        console.log('Error storing userId', error);
      }

      return true;

    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  };

  const initTasks = async () => {

    let storedlang = await Strings.getLanguage();

    if (storedlang === null) {
      Strings.setLanguage(Strings.english);
    }
    else {
      Strings.setLanguage(storedlang);
    }

    console.log('stored lang: ', storedlang,);

    await Utils.setDBConnection();//ensures ldb setup in Utils
    await Utils.createLocalTablesIfNeeded();

    const loggedIn = await checkSignInStatus();

    if (loggedIn) {
      stackNavRef.current?.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));
    }
    else {
      stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
    }
  }

  const backHandler = () => {
    return true;
  }

  useEffect(() => {

    const initializeApp = async () => {
      await requestPermissions();
      await initTasks();
      BackHandler.addEventListener('hardwareBackPress', backHandler);
    };

    initializeApp();

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    }
  }, []);

  return (
    <LangProvider>
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
    </LangProvider>
  )
};

export default App;