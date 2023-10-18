
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import AddTreeScreen from './AddTree';
import EditTreeScreen from './EditTree';
import HomeScreen from './Home';
import LocalDataView from './LocalDataView';
import LoginScreen from './Login';
import { Constants, Utils } from './Utils';
import VerifyusersScreen from './VerifyUsers';
import { checkMultiplePermissions } from './check_permissions';



const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const navigationRef = React.createRef();
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
}
const App = () => {

  const [isAdmin, setIsAdmin] = useState(false);
  const checkSignInStatus = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        // User is signed in, navigate to HomeScreen
        const userId = await AsyncStorage.getItem(Constants.userIdKey);
        const adminId = await AsyncStorage.getItem(Constants.adminIdKey);
        console.log('Loaded userid: ',userId);
        console.log('Loaded adminId: ',adminId);
        if(adminId){
          setIsAdmin(true);
        }
        navigationRef.current?.navigate('HomeScreen');
        return true;
      }
      else {
        // User is not signed in, navigate to LoginScreen
        navigationRef.current?.navigate('Login');
        return false;
      } 
    } catch (error) {
      console.error('Error checking sign-in status:', error);
      return false;
    }
  };
  const initTasks = async()=>{
    const loggedIn = await checkSignInStatus();
    await Utils.createLocalTablesIfNeeded();
    if(loggedIn){
      await Utils.fetchAndStoreHelperData();
    }
  }
  useEffect(() => {
    // GoogleSignin.configure({
    // });
    // Check if the user is already signed in
    initTasks();
  }, []);
  useEffect(() => {  
    requestPermissions();
  }, []);
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

