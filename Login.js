
import React, { useState,useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input';
import {GoogleSignin,GoogleSigninButton,statusCodes,} from '@react-native-google-signin/google-signin'; 
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataService } from './DataService';
import { Constants, Utils } from './Utils';


const LoginScreen = ({navigation}) =>{
 
  const [phoneNumber, setPhoneNumber] = useState('');

  const checkPhoneNumber = () => {
    if (isValidNumber(phoneNumber)) {
      return true;
    }
    return false;
  };

  
  useEffect(() => {
    GoogleSignin.configure()
  }, [])

  
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // navigation.navigate('HomeScreen');
// -------------------- add the endpoint here --------------------
      const userDataPayload = {
        name: userInfo.user.name,
        email: userInfo.user.email,
        phone: phoneNumber,
      };
      console.log('Sending google data to server.')
      const response = await DataService.loginUser(userDataPayload);
      console.log('got a response');
      // console.log(response.data);
      console.log('at login : ',response.data._id)
      // check whether adminId field exist in the response
      // if exist, then store it in the async storage
      console.log(response.data)
      console.log(response.data.adminID)
      if (response.data.adminID) {
        await AsyncStorage.setItem(Constants.adminIdKey, response.data.adminID);
        console.log('adminId stored');
        console.log('adminId : ',Utils.adminId)
      }
      else{
        console.log('adminId not stored')
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.data._id);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        await AsyncStorage.setItem(Constants.lastHashKey, "0");
        Utils.userId = await AsyncStorage.getItem(Constants.userIdKey);
        Utils.adminId = await AsyncStorage.getItem(Constants.adminIdKey);
        Utils.lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
      } catch (error) {
        console.log('Error storing userId', error);
      }

      // const dummy = getUserId();
      console.log(response.status);
      // console.log(response.data);
      // console.log(userObj._id);
      console.log('user id : ',Constants.userId)
      switch (response.status) {
        case 200:
          navigation.navigate('HomeScreen');
          break;
        case 400:
          Alert.alert('Login Failed','Check phone number and secret.');
          break;
        default:
          Alert.alert('Login Failed','Unknown error. Consult an expert.');
          break;
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
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      {/* // create a header with title as 14 trees */}
        <View style={{backgroundColor:'#5DB075', borderBottomLeftRadius:10, borderBottomRightRadius:10}}>
          <Text style={styles.headerText}>Log In</Text>
        </View>
        
      <View style={styles.pop}>

        <View >  
          {/* <Text style={{ fontSize: 20, color: 'black',marginLeft: 35, marginTop: 70 }}>Enter your phone number</Text> */}
          <PhoneInput
            defaultValue={phoneNumber}
            defaultCode="IN"
            layout="first"
            // placeholder='Enter phone number'
          
            filterProps={{autoFocus: true}}
            containerStyle={{ // centre the phone number input
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 30,
            }}
            flagButtonStyle={{backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'white', borderRadius: 10, padding: 10, color: 'black', fontSize: 16, fontWeight: 'bold',}}
            textContainerStyle={{backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'white', borderRadius: 10, padding: 10, color: 'black', fontSize: 16, fontWeight: 'bold',}}
            onChangeText={(text) => {
              setPhoneNumber(text);
            }}
            onChangeFormattedText={(text) => {
              setPhoneNumber(text);
              
            }}
            
          
            autoFocus
            
          />
        </View>

        <View style={{marginVertical:30}}>
          <GoogleSigninButton
            style={{ width: '50%', height: 70, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center'}}
            size={GoogleSigninButton.Size.Standard}
            color={GoogleSigninButton.Color.Light}
            onPress={googleLogin}
          />
        </View>  
      </View>   
    </View>
  );
}

// { height: 70, backgroundColor: 'grey', borderWidth: 1, paddingLeft: 10, marginTop: 10, fontSize: 17 }
const styles = StyleSheet.create({
  textInput: {
    height: 75,
    width: 310,
    borderWidth: 0.5,
    borderColor: 'white',
    backgroundColor: '#f5f5f5',
   
    padding: 10,
    color: 'black', // Change font color here
    fontSize: 16,
    fontWeight: 'bold',  
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pop: {
    backgroundColor: '#5DB075',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
    elevation: 10,
    borderRadius: 10,
  },

  headerText: {
    fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily:'cochin', fontWeight:'bold' , textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3, 
  }
});


export default LoginScreen;
