
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton, statusCodes, } from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View , TouchableOpacity, ToastAndroid, Alert} from 'react-native';
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input';
import { DataService } from './DataService';
import { Constants, Utils } from './Utils';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';

const LoginScreen = ({navigation}) =>{
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false); 
  const googleLogin = async () => {
    try {
      // navigation.navigate(Strings.screenNames.getString('DrawerScreen',Strings.english));
      await GoogleSignin.hasPlayServices();
      // Alert.alert('Going to request google sign in.')
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo collected !!!!!!!');
      console.log('userInfo: ',userInfo);
      const userDataPayload = {
        name: userInfo.user.name,
        email: userInfo.user.email,
        phone: phoneNumber,
      };
      // Alert.alert('Data: ',`google data rec: ${userInfo.user.name}`);
      console.log('Sending google data to server.')
      const response = await DataService.loginUser(userDataPayload);
      // check whether adminId field exist in the response
      // if exist, then store it in the async storage
      console.log(response.data)
      // console.log('status: ',response.status)
      console.log(response.data.adminID)
      if (response.data.adminID) {
        await AsyncStorage.setItem(Constants.adminIdKey, response.data.adminID);
        console.log('adminId stored');
        console.log('adminId : ',response.data.adminID)
      }
      else{
        console.log('adminId not stored')
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.data._id);
        console.log('userId stored');
        response.data = {...response.data,image:userInfo.user.photo}
        if(!response.data.image){
          response.data.image = Constants.imagePlaceholder;
        }
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
        // await AsyncStorage.setItem(Constants.lastHashKey, "0");
        // Utils.reloadApp()
      } catch (error) {
        console.log('Error storing userId', error);
      }

      console.log('response status: ',response.status)
      // console.log(response.status);
      // console.log(response.data);
      // console.log(userObj._id);
      switch (response.status) {
        case 200:
          console.log('Login successful');
          navigation.navigate(Strings.screenNames.getString('DrawerScreen',Strings.english));
          break;
        case 400:
          Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.CheckPhoneNumber);
          break;
        default:
          Alert.alert(Strings.alertMessages.LoginFailed,Strings.alertMessages.UnknownError);
          break;
      }

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        Alert.alert(Strings.alertMessages.userCancelled)
        console.log('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        Alert.alert(Strings.alertMessages.signIninProgress)
        console.log('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert(Strings.alertMessages.playServicesOutdated)
        console.log('play services not available or outdated');
      } else {
        // some other error happened
        Alert.alert(Strings.alertMessages.someError,JSON.stringify(error))
      }
    }
  };
  return (
    
     <View style={{ backgroundColor: 'white', height: '100%' }}>
      {/* // create a header with title as 14 trees */}
        
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
      <TouchableOpacity style={styles.selLang} onPress={()=> {
        setLangModalVisible(!langModalVisible)
      }}>
        <Text style={{color:'#36454F', fontWeight:'bold'}}>{Strings.buttonLabels.SelectLanguage}</Text>
      </TouchableOpacity> 
      <LanguageModal 
        navigation={navigation}
        langModalVisible={langModalVisible} 
        setLangModalVisible={setLangModalVisible}
        />
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
  },

  selLang:{
    width:'50%',
    height:50,
    borderWidth:0.5,
    borderRadius:10,
    justifyContent:'center',
    alignItems:'center',
    marginTop:50,
    alignSelf:'center',
    backgroundColor:'#D3D3D3',
    borderColor:'#A9A9A9' 
  }
});


export default LoginScreen;