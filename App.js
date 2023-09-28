
import React, { useState,useEffect } from 'react';
import {Alert, BackHandler,PermissionsAndroid,} from 'react-native';
import HomeScreen from './Home';
import LoginScreen from './Login';
import AddTreeScreen from './AddTree';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {checkMultiplePermissions} from './check_permissions';
import {PERMISSIONS} from 'react-native-permissions';
import NetInfo from '@react-native-community/netinfo';
import {fetch_tree_and_plot} from './get_tree_plot';
import {Location} from './get_location';


const Stack = createStackNavigator();
const navigationRef = React.createRef();

const App = () => {

  useEffect(() => {
    const permissions = [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ];
    
    (async function request() {
      let res = await checkMultiplePermissions(permissions);
      console.log(res);
      if (!res) {
        Alert.alert(
          'Permissions required!',
          'Please go to Settings and grant permissions',
        );
      }
    })();
    (async function netInfo() {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          await fetch_tree_and_plot();
        } else {
          Alert.alert('No internet');
        }
      });
    })();
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
          navigationRef.current?.navigate('Home');
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

  
  
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AddTree" component={AddTreeScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

