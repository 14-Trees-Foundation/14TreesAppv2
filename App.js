
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
  const [userDetails,setUserDetails] = useState(null);
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
            setUserDetails(storedUserDetails);
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
  const logout = async()=>{
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem(Constants.adminIdKey);
    await AsyncStorage.removeItem(Constants.userIdKey);
    await AsyncStorage.removeItem(Constants.userDetailsKey);
    navigationRef.current?.navigate(Strings.screenNames.getString('LogIn',Strings.english));
  }
  const initTasks = async () => {
    
    let storedlang = await Strings.getLanguage();
      console.log('stored lang: ', storedlang);
      if (storedlang === null) {
        Strings.setLanguage(Strings.english);
      }
      else {
        Strings.setLanguage(storedlang);
      }
    GoogleSignin.configure();
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
  const fetchUserDetails = async()=>{
    console.log('refreshing details');
    let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
    if(storedUserDetails){
      storedUserDetails = JSON.parse(storedUserDetails);
      console.log('existing details: ',userDetails);
      console.log('received details:', storedUserDetails);
      if((userDetails===null)){
        console.log(userDetails);
        setUserDetails(storedUserDetails);
      }
      else if(storedUserDetails.email!==userDetails.email){
        console.log(userDetails.email,storedUserDetails.email);
        setUserDetails(storedUserDetails);
      }
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

  const DrawerContent = (props) => {
    // const [isAdmin, setIsAdmin] = useState(false);
    // const [userDetails,setUserDetails] = useState(null);
    const fillInUserDetails = async ()=>{
      // let storedUserDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
      // if(storedUserDetails){
        // storedUserDetails = JSON.parse(storedUserDetails);
        // setUserDetails(storedUserDetails);
      //   if(storedUserDetails.adminID){
      //     if(!isAdmin){
      //       setIsAdmin(true);
      //     }
      //   }
      // }
    }
    useFocusEffect(()=>{
      console.log('in focus',isAdmin)
      fillInUserDetails();
      return ()=>null
    })
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
      <View style={{flexDirection:'column',position:'relative',marginTop:100,alignSelf:'center'}}>
        <Button title='Log out' onPress={()=>Utils.confirmAction(logout,undefined,'Do you want to log out?')} style={commonStyles.logOutButton} color='red' ></Button>
      </View>
    </DrawerContentScrollView>)
  }
  const DrawerNavigator = ({navigation,route})=>{
    return (
      <Drawer.Navigator drawerContent={DrawerContent}>
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
  // if yes, then set the isAdmin to true
  // else set it to false  
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
          initialParams={{userDetails:userDetails}}
          options={{
            headerLeft:()=>null,
            headerShown: false
            }} />
      </Stack.Navigator>
    </NavigationContainer>
    )
};

export default App;