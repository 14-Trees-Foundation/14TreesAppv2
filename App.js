
import React, { useState,useEffect } from 'react';
import { View, ActivityIndicator   } from 'react-native';
import HomeScreen from './Home';
import LoginScreen from './Login';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';




// const App = () => {

 
//   return (
//     <View style = {{backgroundColor: 'white'}}>
//       <LoginScreen/>
//       {/* <HomeScreen/> */}
//     </View>

//   );
// };

const Stack = createStackNavigator();
const navigationRef = React.createRef();

const App = () => {

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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

