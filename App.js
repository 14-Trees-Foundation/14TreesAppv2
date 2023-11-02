
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createDrawerNavigator, DrawerItemList, DrawerContentScrollView, useDrawerProgress } from '@react-navigation/drawer';
import { NavigationContainer, createNavigationContainerRef, useFocusEffect, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, View, Image, Text, Button, RootTagContext, BackHandler } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import AddTreeScreen from './AddTree';
import EditTreeScreen from './EditTree';
import HomeScreen from './Home';
import LocalDataView from './LocalDataView';
import LoginScreen from './Login';
import { Constants, Utils, styleConfigs,commonStyles } from './Utils';
import VerifyusersScreen from './VerifyUsers';
import { checkMultiplePermissions } from './check_permissions';
import { LocalDatabase } from './tree_db';
import LoadingScreen from './LoadingScreen';
import { enableLatestRenderer } from 'react-native-maps';
import { utils } from '@react-native-firebase/app';
import { Strings } from './Strings';
import { DrawerContent } from './Components';
enableLatestRenderer();

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
async function requestPermissions() {
  //https://developer.android.com/training/data-storage/shared/media#storage-permission
  const androidVersion = Number.parseInt(Platform.constants['Release']);
  const versionOfPermissionChange = 13;
  const permissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
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
  let res = await checkMultiplePermissions(permissions);
  if (!res) {
    Alert.alert(
      'Permissions required!',
      'Please go to Settings and grant permissions',
    );
  }
}
// async function netInfo() {
// }
const navigationRef = createNavigationContainerRef();
const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const rootTag = useContext(RootTagContext);
  console.log('app roottag: ',rootTag)
  
  AsyncStorage.setItem(Constants.appRootTagKey,rootTag.toString());
  const checkSignInStatus = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        // User is signed in, navigate to HomeScreen
        const userId = await AsyncStorage.getItem(Constants.userIdKey);
        const adminId = await AsyncStorage.getItem(Constants.adminIdKey);
        let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
          if(storedUserDetails){
            storedUserDetails = JSON.parse(storedUserDetails);
          }
        if (adminId) {
          setIsAdmin(true);
        }
        if (userId === null) {
            GoogleSignin.signOut();
            return false;
        }
        return true;
      }
      else {
        // User is not signed in, navigate to LoginScreen
        navigationRef.current?.navigate(Strings.screenNames.getString('LogIn',Strings.english));
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
    // Alert.alert('going to call GoogleSignin configure.')
    console.log('going to call GoogleSignin configure.')
    GoogleSignin.configure();
    // Alert.alert('GoogleSignin configure called.')
    console.log('GoogleSignin configure called.')
    const loggedIn = await checkSignInStatus();
    await Utils.setDBConnection();
    await Utils.createLocalTablesIfNeeded();
    if (loggedIn) {
      Utils.fetchAndStoreHelperData();
      navigationRef.current?.navigate(Strings.screenNames.getString('DrawerScreen',Strings.english));
    }
    else{
      navigationRef.current?.navigate(Strings.screenNames.getString('LogIn',Strings.english));
    }
  }

  const setNavigationListener = ()=>{
    if(navigationRef.isReady()){
      navigationRef.addListener('state',(e)=>{
        // fetchUserDetails();
      })
    }
  }
  const backHandler = ()=>{
    return true;
  }
  useEffect(() => {
    initTasks();
    BackHandler.addEventListener('hardwareBackPress',backHandler)//disables back button presses.
    requestPermissions();
    setNavigationListener();
    return ()=>{
      BackHandler.removeEventListener('hardwareBackPress',backHandler);
    }
  }, []);

  const DrawerNavigator = ({navigation,route})=>{
    return (
      <Drawer.Navigator drawerContent={(props)=> <DrawerContent navigationRef={navigationRef} {...props}/>}>
                <Drawer.Screen
          name={Strings.screenNames.getString('HomePage',Strings.english)}
          component={HomeScreen}
          options={{
            ...styleConfigs.drawerHeaderOptions,
            title:Strings.screenNames.HomePage
          }} />
        <Drawer.Screen
        name={Strings.screenNames.getString('localDataView',Strings.english)}
        component={LocalDataView}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.localDataView
        }} />
        <Drawer.Screen
        name={Strings.screenNames.getString('AddTree',Strings.english)}
        component={AddTreeScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.AddTree
        }}/>
        {isAdmin && 
        <Drawer.Screen
        name={Strings.screenNames.getString('EditTree',Strings.english)}
        component={EditTreeScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.EditTree
        }}/>
        }
        {isAdmin && 
        <Drawer.Screen
        name={Strings.screenNames.getString('VerifyUsers',Strings.english)}
        component={VerifyusersScreen}
        options={{
          ...styleConfigs.drawerHeaderOptions,
          title:Strings.screenNames.VerifyUsers
        }}/>
        }
      </Drawer.Navigator>
  );
  }
  // check dynamically adminIdkey is stored in the async storage after login
  //TODO: navigation image load in first time login.


  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name={Strings.screenNames.getString('startScreen',Strings.english)}
          component={LoadingScreen}
          options={{headerShown:false}}/>
        <Stack.Screen
          name={Strings.screenNames.getString('LogIn',Strings.english)}
           component={LoginScreen}
           options={{
            headerLeft:()=>null,
            ...styleConfigs.drawerHeaderOptions,
            title:Strings.screenNames.LogIn
            }} />
        <Stack.Screen
          name={Strings.screenNames.getString('DrawerScreen',Strings.english)}
          component={DrawerNavigator}
          options={{
            headerLeft:()=>null,
            headerShown: false
            }} />
      </Stack.Navigator>
    </NavigationContainer>
    )
};

export default App;