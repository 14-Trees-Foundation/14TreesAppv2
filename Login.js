
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, GoogleSigninButton, statusCodes, } from '@react-native-google-signin/google-signin';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View , TouchableOpacity} from 'react-native';
import PhoneInput, { isValidNumber } from 'react-native-phone-number-input';
import { DataService } from './DataService';
import { Constants, Utils } from './Utils';
import LanguageModal from './Languagemodal';
import { Strings } from './Strings';

const LoginScreen = ({navigation}) =>{
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [signInText, setSignInText] = useState('');
  const [something, setSomething] = useState(true); // to re-render the component(jugaad)
  useEffect(() => {
    console.log('I am here ')
  }, [Strings.languages.SignIn]);

  useEffect(() => {
    // Strings.languageEvent.addListener('change',()=>{
    //   setSomething(!something);
    // });
    console.log('listener added');
    navigation.addListener('beforeRemove', async (e) => {
      const userId = await Utils.getUserId();
      console.log('userId fetched: ',userId);
      if(!(userId && userId.length>0)){
        e.preventDefault();
      }
    }
  )
  return ()=>{
    Strings.languageEvent.removeAllListeners('change');
  }
  }, [])
  
  const googleLogin = async () => {
    try {
      navigation.navigate('HomeScreen');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
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
        console.log('adminId : ',response.data.adminID)
      }
      else{
        console.log('adminId not stored')
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.data._id);
        response.data = {...response.data,image:userInfo.user.photo}
        if(!response.data.image){
          response.data.image = Constants.imagePlaceholder;
        }
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        // await AsyncStorage.setItem(Constants.lastHashKey, "0");
        Utils.reloadApp()
      } catch (error) {
        console.log('Error storing userId', error);
      }

      const dummy = getUserId();
      console.log(response.status);
      // console.log(response.data);
      // console.log(userObj._id);
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
        <Text style={{ fontSize: 20, color: 'white',marginLeft: 35, marginTop: 30 }}> {Strings.languages.SignIn}</Text>
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
        <Text style={{color:'#36454F', fontWeight:'bold'}}>{Strings.languages.SelectLanguage}</Text>
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
