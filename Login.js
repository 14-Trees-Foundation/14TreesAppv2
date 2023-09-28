
import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input';
import {GoogleSignin,GoogleSigninButton,statusCodes,} from '@react-native-google-signin/google-signin'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = ({navigation}) =>{

  const [phoneNumber, setPhoneNumber] = useState('');

  const checkPhoneNumber = () => {
    if (isValidNumber(phoneNumber)) {
      return true;
    }
    return false;
  };

  
  const [password, setPassword] = useState('');

  const handlePasswordChange = (text) => {
    setPassword(text);
  };

  


  useEffect(() => {
    GoogleSignin.configure()
  }, [])

  


  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // navigation.navigate('Home');
// -------------------- add the endpoint here --------------------
      const response = await axios.post('https://ebcb-103-21-124-76.ngrok.io/api/v2/login', {
        name: userInfo.user.name,
        email: userInfo.user.email,
        phone: phoneNumber,
        secret: password
      });
      console.log('at login : ',response.data._id)
      // storeUserId(response.data._id);
      await AsyncStorage.setItem('userid', response.data._id);
      // const dummy = getUserId();
      console.log(response.status);
      // console.log(response.data);
      // console.log(userObj._id);
      console.log(response.status);
      if (response.status === 200) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Login Failed', 'Please check your credentials and try again.');
      }

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        console.log('play services not available or outdated');
      } else {
        // some other error happened
      }
    }
  };


  return (
    <View style={{ backgroundColor: 'black', height: '100%' }}>
      {/* // create a header with title as 14 trees */}
        
        <Text style={{ fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, shadowRadius: 10 }}>Log In</Text>
  

      <View >  
        <Text style={{ fontSize: 20, color: 'white',marginLeft: 35, marginTop: 70 }}>Enter your phone number</Text>
        <PhoneInput
          defaultValue={phoneNumber}
          defaultCode="IN"
          layout="first"
          onChangeText={(text) => {
            setPhoneNumber(text);
          }}
          onChangeFormattedText={(text) => {
            setPhoneNumber(text);
            
          }}
          
          withDarkTheme
          withShadow
          autoFocus
          containerStyle={{ marginTop: 20, marginLeft:35, marginRight: 20}}
        />
      </View>

      <View style={{ marginTop: 20, marginLeft: 35, marginRight: 35 , marginBottom: 50}}>
      
        <TextInput
          style={styles.textInput}
          onChangeText={handlePasswordChange}
          value={password}
          placeholder="Enter secret key"
          placeholderTextColor="black"
          // secureTextEntry={False}
        />
      </View>

      <View style={{ marginTop: 20, marginLeft: 35, marginRight: 35, marginTop: 20 , marginBottom: 20}}>
        <GoogleSigninButton
          style={{ width: '50%', height: 70, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center'}}
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Light}
          onPress={googleLogin}
        />
      </View>     
    </View>
  );
}

// { height: 70, backgroundColor: 'grey', borderWidth: 1, paddingLeft: 10, marginTop: 10, fontSize: 17 }
const styles = StyleSheet.create({
  textInput: {
    width: 310,
    height: 70,
    borderWidth: 1,
    borderColor: 'white',
    backfaceVisibility: 'hidden',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    color: 'black', // Change font color here
    fontSize: 16,
    fontWeight: 'bold',
   
  },
});


export default LoginScreen;
