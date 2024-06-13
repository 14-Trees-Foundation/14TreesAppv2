import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, RootTagContext, TouchableOpacity } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { DrawerNavigator } from './components/DrawerNavigator';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/Login';
import { Strings } from './services/Strings';
import { Constants, Utils } from './services/Utils';
import { checkMultiplePermissions } from './services/check_permissions';
import DeviceInfo from 'react-native-device-info';
import { DataService } from './services/DataService';
import { commonStyles } from './services/Styles';
import GlobalContext from './context/GlobalContext ';
import AddTreeShift from './screens/AddTreeShift';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { EditLocalTree } from './screens/EditLocalTree';
import TreesInShift from './screens/TreesInShift';
import SyncDisplay from './screens/SyncDisplay';
import SplashScreen from './screens/SplashScreen';
import ScreenHeaderContent from './components/ScreenHeaderContent';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import AddImageShift from './screens/AddImageShift';
import UpdatePlotShift from './screens/UpdatePlotShift';


const errorHandler = async (e, isFatal) => {
  const stackTrace = e.stack;

  const errorLog = {
    msg: e.message ? e.message : e,
    error: JSON.stringify(e.name),
    stackTrace: stackTrace,
  };


  await Utils.logException(JSON.stringify(errorLog));

  Alert.alert(
    'Unexpected error occurred',
    `Error: ${isFatal ? 'Fatal:' : ''} ${e}
    \nWe have reported this to our team! Please close the app and start again!`,
    [
      {
        text: 'Restart',
        onPress: () => {
          RNRestart.Restart();
        },
      },
      {
        text: 'Close',
        onPress: () => {
        },
        style: 'cancel', // the button is styled for cancellation
      },
    ],
    { cancelable: false } // user cannot dismiss the alert by tapping outside 
  );
};

setJSExceptionHandler((error, isFatal) => {
  console.log('--------setJSExceptionHandler----------');
  errorHandler(error, isFatal);
}, true);

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
  //console.log('app roottag app.js: ')

  const { userName, setUserName, lightTheme } = useContext(GlobalContext);

  AsyncStorage.setItem(Constants.appRootTagKey, rootTag.toString());

  const checkSignInStatus = async () => {
    console.log('app roottag app.js1: ')
    try {

      let phoneNumber;

      try {
        phoneNumber = await DeviceInfo.getPhoneNumber();
      } catch (error) {
        const stackTrace = error.stack;

        const errorLog = {
          msg: "happened while trying to auto login when user starts the app inside app.js",
          error: JSON.stringify(error),
          stackTrace: stackTrace
        }

        await Utils.logException(JSON.stringify(errorLog));
      }


      const userDataPayload = {
        phone: phoneNumber,
      }

      if (!phoneNumber) {
        // User is not signed in, navigate to LoginScreen
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }

      const isSignedIn = await DataService.loginUser(userDataPayload);

      if (!isSignedIn) {
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }

      const response = isSignedIn.data;
      console.log("response data inside app.js: ", response);

      if (response.success === false) {  // User is not signed in, navigate to LoginScreen
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
        //console.log("response data modified: ", response.data);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');

        let userKeyDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
        if (userKeyDetails) {
          userKeyDetails = JSON.parse(userKeyDetails);
          let name = userKeyDetails.name;
          if (name) {
            const firstName = name.split(' ')[0];
            console.log("user name in app.js and header---- ", firstName);
            setUserName(firstName);
          }
        }
      } catch (error) {
        console.log('Error storing userId', error);
        const stackTrace = error.stack;
        const errorLog = {
          msg: "happened while trying to store userId during auto login inside app.js",
          error: JSON.stringify(error),
          stackTrace: stackTrace
        }
        await Utils.logException(JSON.stringify(errorLog));
      }

      return true;

    } catch (error) {
      console.error('Error checking sign-in status:', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while trying to auto login inside app.js",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await Utils.logException(JSON.stringify(errorLog));
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



    console.log('stored lang: ', storedlang);

    await Utils.setDBConnection(); //ensures localdb setup in Utils
    await Utils.createLocalTablesIfNeeded();

    const loggedIn = await checkSignInStatus();

    if (loggedIn) {
      stackNavRef.current?.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));
    }
    else {
      stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
    }
  }

  const initializeApp = async () => {
    await requestPermissions();
    await initTasks();
  };

  useEffect(() => {
    console.log('app roottag app.js2: ')
    initializeApp();

  }, []);



  return (
    <NavigationContainer ref={stackNavRef}>
      <Stack.Navigator>
        <Stack.Screen
          name={Strings.screenNames.getString('startScreen', Strings.english)}
          component={SplashScreen}
          options={{ headerShown: false }} />
        <Stack.Screen
          name={Strings.screenNames.getString('LoadingScreen', Strings.english)}
          component={LoadingScreen}
          options={{ headerShown: false }} />
        <Stack.Screen
          name={Strings.screenNames.getString('AddTreeShift', Strings.english)}
          component={AddTreeShift}
          options={{
            headerLeft: () => null,
            headerRight: () => (
              <View style={{
                marginRight: 35,
              }}>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#52525C' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                }}>
                  {userName}
                </Text>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.AddTreeShift
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('AddImageShift', Strings.english)}
          component={AddImageShift}
          options={{
            headerLeft: () => null,
            headerRight: () => (
              <View style={{
                marginRight: 35,
              }}>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#52525C' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                }}>
                  {userName}
                </Text>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.AddImageShift
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('UpdatePlotShift', Strings.english)}
          component={UpdatePlotShift}
          options={{
            headerLeft: () => null,
            headerRight: () => (
              <View style={{
                marginRight: 35,
              }}>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#52525C' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                }}>
                  {userName}
                </Text>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.UpdatePlotShift
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('SyncDisplay', Strings.english)}
          component={SyncDisplay}
          options={{
            headerLeft: () => (
              <View style={{ marginLeft: 10 }}>
                <TouchableOpacity onPress={() => {
                  stackNavRef.current.goBack() // Go back when the button is pressed
                }}>
                  <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.SyncDisplay,
          }}
        />
        <Stack.Screen
          name={Strings.screenNames.getString('TreesInShift', Strings.english)}
          component={TreesInShift}
          options={{
            headerRight: () => (
              <View style={{
                marginRight: 35,
              }}>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#52525C' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                }}>
                  {userName}
                </Text>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.TreesInShift
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('LogIn', Strings.english)}
          component={LoginScreen}
          options={{
            headerLeft: () => null,
            headerRight: () => (
              <ScreenHeaderContent />
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.LogIn
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('DrawerScreen', Strings.english)}
          component={DrawerNavigator}
          options={{
            headerLeft: () => null,
            headerShown: false
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('UpdateSaplingsPlot', Strings.english)}
          component={DrawerNavigator}
          options={{
            headerLeft: () => null,
            headerShown: false
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('EditLocalTree', Strings.english)}
          component={EditLocalTree}
          options={{
            headerRight: () => (
              <View style={{
                marginRight: 70,
              }}>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#52525C' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 8,
                }}>
                  {userName}
                </Text>
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.EditLocalTree
          }} />

      </Stack.Navigator>
    </NavigationContainer>

  )
};

export default App;