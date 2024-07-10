import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect } from 'react';
import { Alert, Platform, RootTagContext, TouchableOpacity, SafeAreaView } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import { DrawerNavigator } from './components/DrawerNavigator';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/Login';
import { Strings } from './services/Strings';
import { Constants, Utils } from './services/Utils';
import { checkMultiplePermissions } from './services/check_permissions';
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
import EditLocalAddImage from './screens/EditLocalAddImage';


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
    `Error: ${isFatal ? 'Fatal:' : ''} ${errorLog.msg}
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
      const token = await AsyncStorage.getItem(Constants.authToken)
      return token && token !== ''
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while login status in side app.js",
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
                marginRight: 30, flexDirection: "row"
              }}>
                <View style={{ height: 35, marginRight: 7, marginTop: 5, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 10,
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
                marginRight: 30, flexDirection: "row"
              }}>
                <View style={{ height: 35, marginRight: 6, marginTop: 10, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                  paddingLeft: 10
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
                marginRight: 30, flexDirection: "row"
              }}>
                <View style={{ height: 35, marginRight: 6, marginTop: 10, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 15,
                  paddingLeft: 10
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
            headerRight: () => (
              <View style={{ height: 35, marginRight: 13, marginTop: 2, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
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
                marginRight: 35, flexDirection: "row"
              }}>
                <View style={{ height: 35, marginRight: 4, marginTop: 3, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                {/* <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 8,
                }}>
                  {userName}
                </Text> */}
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
                marginRight: 35, flexDirection: "row"
              }}>
                <View style={{ height: 35, marginRight: 4, marginTop: 3, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                {/* <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 8,
                }}>
                  {userName}
                </Text> */}
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.EditLocalTree
          }} />
        <Stack.Screen
          name={Strings.screenNames.getString('EditLocalAddImage', Strings.english)}
          component={EditLocalAddImage}
          options={{
            // headerLeft: () => (
            //   <View style={{ marginLeft: 5 }}>
            //     <TouchableOpacity onPress={() => {
            //       stackNavRef.current.goBack() // Go back when the button is pressed
            //     }}>
            //       <Icon name="arrow-back" size={24} color="black" />
            //     </TouchableOpacity>
            //   </View>
            // ),
            headerRight: () => (
              <View style={{
                marginRight: 35, flexDirection: "row"
              }}>
                <View
                  style={{ height: 35, marginRight: 4, marginTop: 3, borderRadius: 10, borderColor: "white", borderWidth: 1 }}>
                  <Text style={{ color: lightTheme ? '#333' : 'black', fontSize: 20, fontWeight: "bold", paddingLeft: 4, paddingTop: 2 }}>2.4.1</Text>
                </View>
                {/* <Text style={{
                  fontFamily: 'Inter-Regular',
                  color: lightTheme ? '#333' : 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                  padding: 8,
                }}>
                  {userName}
                </Text> */}
              </View>
            ),
            headerStyle: lightTheme ? commonStyles.drawerHeaderLight : commonStyles.drawerHeaderDark,
            headerTitleStyle: lightTheme ? commonStyles.headerTitleStyleLight : commonStyles.headerTitleStyleDark,
            headerTintColor: lightTheme ? commonStyles.headerTitleStyleLight.color : commonStyles.headerTitleStyleDark.color,
            title: Strings.screenNames.EditLocalAddImage
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;