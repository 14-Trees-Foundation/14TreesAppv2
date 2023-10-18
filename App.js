
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
import { DataService } from './DataService';
import VerifyusersScreen from './VerifyUsers';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const navigationRef = React.createRef();
async function request() {
  //https://developer.android.com/training/data-storage/shared/media#storage-permission
  const androidVersion = Number.parseInt(Platform.constants['Release']);
  const versionOfPermissionChange = 13;
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
    Utils.fetchAndStoreHelperData();
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
          Utils.adminId = await AsyncStorage.getItem(Constants.adminIdKey);
          Utils.lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
          console.log('Loaded userid: ',Utils.userId);
          console.log('Loaded adminId: ',Utils.adminId);
          if(Utils.adminId){
            setIsAdmin(true);
          }
          
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

  const [isAdmin, setIsAdmin] = useState(false);

  const StackNavigator = () => (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );

  // check dynamically adminIdkey is stored in the async storage after login
  // if yes, then set the isAdmin to true
  // else set it to false  
  console.log('isadmin: ',isAdmin);
  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={StackNavigator} options={{ headerShown: false }}></Drawer.Screen>
        <Drawer.Screen name="AddTree" component={AddTreeScreen} options={{ headerShown: false }}></Drawer.Screen>
        <Drawer.Screen name="LocalDataView" component={LocalDataView} options={{ headerShown: false }}></Drawer.Screen>
        {/* {!isAdmin &&  */}
        <Drawer.Screen name="EditTree" component={EditTreeScreen} options={{ headerShown: false }}></Drawer.Screen>
        {/* } */}
        {/* {!isAdmin &&  */}
        <Drawer.Screen name="VerifyUsers" component={VerifyusersScreen} options={{ headerShown: false }}></Drawer.Screen>
        {/* } */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;

