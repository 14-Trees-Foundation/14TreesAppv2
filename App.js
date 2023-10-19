
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createDrawerNavigator, DrawerItemList, DrawerContentScrollView } from '@react-navigation/drawer';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, View, Image, Text, Button } from 'react-native';
import { PERMISSIONS } from 'react-native-permissions';
import AddTreeScreen from './AddTree';
import EditTreeScreen from './EditTree';
import HomeScreen from './Home';
import LocalDataView from './LocalDataView';
import LoginScreen from './Login';
import { Constants, Utils, styleConfigs,styles } from './Utils';
import VerifyusersScreen from './VerifyUsers';
import { checkMultiplePermissions } from './check_permissions';
import { LocalDatabase } from './tree_db';



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
  const [userDetails,setUserDetails] = useState(null);
  const checkSignInStatus = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        // User is signed in, navigate to HomeScreen
        const userId = await AsyncStorage.getItem(Constants.userIdKey);
        const adminId = await AsyncStorage.getItem(Constants.adminIdKey);
        let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
          if(storedUserDetails){
            console.log(storedUserDetails)
            storedUserDetails = JSON.parse(storedUserDetails);
            setUserDetails(storedUserDetails);
          }
        console.log('Loaded userid: ', userId);
        console.log('Loaded adminId: ', adminId);
        if (adminId) {
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
  const logout = async()=>{
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem(Constants.adminIdKey);
    await AsyncStorage.removeItem(Constants.userIdKey);
    await AsyncStorage.removeItem(Constants.userDetailsKey);
    Navigation
  }
  const initTasks = async () => {
    const loggedIn = await checkSignInStatus();
    await Utils.setDBConnection();
    await Utils.createLocalTablesIfNeeded();
    if (loggedIn) {
      await Utils.fetchAndStoreHelperData();
    }
  }
  useEffect(() => {
    initTasks();
    requestPermissions();
  }, []);
  const StackNavigator = () => (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
  const DrawerContent = (props) => {
    return (<DrawerContentScrollView {...props}>
      <View style={{flexDirection:'column',alignItems:'center',marginTop:50,bottom:0}}>
        <Image
          source={require('./assets/logo.png')} // Replace with your delete icon image
          style={{ width: 100, height: 100, marginLeft: 10 }} // Adjust the icon dimensions and margin
        />
        <Text style={{fontSize:20,fontWeight:'bold',color:'black'}}>14 Trees</Text>
        {
        userDetails
        ?
        <View style={{flexDirection:'row',alignItems:'center',alignSelf:'flex-start',margin:10,justifyContent:'space-around'}}>
          <Image source={{uri:userDetails.image}} style={{width:75,height:75,borderRadius:37.5}}>
          </Image>
          <View style={{flexDirection:'column',marginLeft:5}}>
            <Text style={{fontSize:15,color:'black'}}>{userDetails.name}</Text>
            <Text>{isAdmin?'Admin':'Logger'}</Text>
          </View>
        </View>
        :
        <Text>Loading user details...</Text>
        }
      </View>
      <DrawerItemList {...props} />
      {/* <View style={{flexDirection:'column',position:'relative',marginTop:100,alignSelf:'center'}}>
        <Button title='Log out' onPress={()=>logout()} style={styles.logOutButton} color='red' ></Button>
      </View> */}
    </DrawerContentScrollView>)
  }
  // check dynamically adminIdkey is stored in the async storage after login
  // if yes, then set the isAdmin to true
  // else set it to false  
  //TODO: navigation image load in first time login.
  return (
    <NavigationContainer ref={navigationRef}>
      <Drawer.Navigator drawerContent={DrawerContent}>
        <Drawer.Screen name="Home" component={StackNavigator} options={{...styleConfigs.drawerHeaderOptions}}></Drawer.Screen>
        <Drawer.Screen name="AddTree" component={AddTreeScreen} options={{...styleConfigs.drawerHeaderOptions}}></Drawer.Screen>
        <Drawer.Screen name="LocalDataView" component={LocalDataView} options={{...styleConfigs.drawerHeaderOptions}}></Drawer.Screen>
        {isAdmin && 
        <Drawer.Screen name="EditTree" component={EditTreeScreen} options={{...styleConfigs.drawerHeaderOptions}}></Drawer.Screen>
        }
        {isAdmin && 
        <Drawer.Screen name="VerifyUsers" component={VerifyusersScreen} options={{...styleConfigs.drawerHeaderOptions}}></Drawer.Screen>
        }
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;

