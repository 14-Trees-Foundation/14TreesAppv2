
import React, { useState,useEffect} from 'react';
import {Alert, BackHandler,PermissionsAndroid,Platform} from 'react-native';
import HomeScreen from './Home';
import LoginScreen from './Login';
import AddTreeScreen from './AddTree';
import EditTreeScreen from './EditTree';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {checkMultiplePermissions} from './check_permissions';
import {PERMISSIONS} from 'react-native-permissions';
import NetInfo from '@react-native-community/netinfo';
import {fetch_tree_and_plot} from './get_tree_plot';
import {Location} from './get_location';
import { Constants, Utils } from './Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalDataView from './LocalDataView';
import { createDrawerNavigator } from '@react-navigation/drawer';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const navigationRef = React.createRef();
async function request() {
  //https://developer.android.com/training/data-storage/shared/media#storage-permission
  const androidVersion = Number.parseInt(Platform.constants['Release']);
  const versionOfPermissionChange = 12;
  const permissions = [
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,  
  ];
  if(androidVersion<versionOfPermissionChange){
    permissions.push(...[
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    ]);
  }
  else{
    permissions.push(...[
      PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
      PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
    ])
  }
  let res = await checkMultiplePermissions(permissions);
  console.log(res);
  if (!res) {
    Alert.alert(
      'Permissions required!',
      'Please go to Settings and grant permissions',
    );
  }
}
async function netInfo() {
  NetInfo.fetch().then(async state => {
    if (state.isConnected) {
      await fetch_tree_and_plot();
    } else {
      Alert.alert('No internet');
    }
  });
}
const App = () => {

  useEffect(() => {  
    request();
    netInfo();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
    });

    // Check if the user is already signed in
    const checkSignInStatus = async () => {
      try {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
          // User is signed in, navigate to HomeScreen
          Utils.userId = await AsyncStorage.getItem(Constants.userIdKey);
          console.log('Loaded userid: ',Utils.userId);
          navigationRef.current?.navigate('HomeScreen');
        }
        else {
          // User is not signed in, navigate to LoginScreen
          navigationRef.current?.navigate('Login');
        } 
      } catch (error) {
        console.error('Error checking sign-in status:', error);
      }
    };

    checkSignInStatus();
  }, []);

  const StackNavigator = () => (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

  
  
  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={StackNavigator} options={{ headerShown: false }}></Drawer.Screen>
        <Drawer.Screen name="AddTree" component={AddTreeScreen} options={{ headerShown: false }}></Drawer.Screen>
        <Drawer.Screen name="LocalDataView" component={LocalDataView} options={{ headerShown: false }}></Drawer.Screen>
        <Drawer.Screen name="EditTree" component={EditTreeScreen} options={{ headerShown: false }}></Drawer.Screen>
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;

