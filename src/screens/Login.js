import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useContext, useEffect } from 'react';
import { Alert, View } from 'react-native';
import { DataService } from '../services/DataService';
import DeviceInfo from 'react-native-device-info';
import { Strings } from '../services/Strings';
import { Utils, Constants } from '../services/Utils';
import { CustomButtonStyles, commonStyles, loginStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import InternetBanner from '../components/InternetInfo';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [isPinInvalid, setIsPinInvalid] = useState(false);
  const [isPhoneInvalid, setIsPhoneInvalid] = useState(false);

  const { langChanged, lightTheme, setUserName } = useContext(GlobalContext);

  useEffect(() => {
    console.log("langChanged inside LoginScreen: ", langChanged);
    navigation.setOptions({
      title: Strings.screenNames.LogIn
    });
  }, [langChanged]);

  useEffect(() => {
    autoSetPhoneNumber();
  }, [])

  const autoSetPhoneNumber = async () => {
    try {
      let phone = await DeviceInfo.getPhoneNumber();
      if (phone) {
        if (phone.length > 10) phone = phone.slice(-10);
        if (phone.length === 10) setPhoneNumber(phone);
      }
      if (phone === '5551234567') {
        setPhoneNumber('7829723729');
        setPinNumber('1234')
      }
    } catch (error) {
      const stackTrace = error.stack;
  
      const errorLog = {
        msg: "happened while trying to auto login when user inside Login.js",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
  
      await Utils.logException(JSON.stringify(errorLog));
    }
  }

  const loginUser = async () => {
    console.log("Debugger test: loginUser called");
    console.log("phone: ", phoneNumber, "pin: ", pinNumber);

    if (invalidPhoneNumber()) {
      setIsPhoneInvalid(true);
      return;
    } else { setIsPhoneInvalid(false) }

    if (invalidPin()) {
      setIsPinInvalid(true);
      return;
    } else { setIsPinInvalid(false) }

    try {
      if (phoneNumber.length !== 10) {
        Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.CorrectPhoneNumber);
        return;
      }

      if (pinNumber.length !== 4) {
        Alert.alert(Strings.alertMessages.Error, Strings.alertMessages.CorrectPin);
        return;
      }

      const userDataPayload = {
        phone: phoneNumber,
        pinNumber: pinNumber
      };

      console.log('Sending user data to server.', userDataPayload);
      let isSignedIn = null;
      try {
        isSignedIn = await DataService.loginUser(userDataPayload);
      } catch(error) {
        Alert.alert(Strings.alertMessages.LoginFailed,
          [
            {
              onPress: () => {
                setPhoneNumber('');
                setPinNumber('');
              },
            },
          ]);

        const stackTrace = error.stack;
        const errorLog = {
          msg: "happened while trying to store userId during login",
          error: JSON.stringify(error),
          stackTrace: stackTrace
        }
        await Utils.logException(JSON.stringify(errorLog));
      }
      if (!isSignedIn) {
        stackNavRef.current?.navigate(Strings.screenNames.getString('LogIn', Strings.english));
        return false;
      }
      const response = isSignedIn.data;
      console.log("response data from login-----: ", response);

      if (response.success === false) {
        const errorMsg = response.error.errorMsg;
        const user = response.user;
        console.log("errorMsg: ", errorMsg);
        console.log("user: ", user);

        if (user) {
          const userRoles = user.roles;
          console.log("userRoles: ", userRoles);

          let message = Strings.alertMessages.IncorrectUser;
          if (!userRoles || userRoles.length === 0) {
            message = Strings.alertMessages.userNotAuthorized;
          } else {
            message = Strings.alertMessages.userNotSetup;
          }

          Alert.alert(Strings.alertMessages.LoginFailed, message,
            [
              {
                onPress: () => {
                  setPhoneNumber('');
                  setPinNumber('');
                },
              },
            ]);
        } else {
          Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.IncorrectUser,
            [
              {
                onPress: () => {
                  setPhoneNumber('');
                  setPinNumber('');
                },
              },
            ]);
        }
        return;
      }

      const logsArray = await Utils.getLogsFromLocalDB();
      for (const logData of logsArray) {
        console.log("logs from local db: ", logData);
      }

      if (response.user.roles) {
        if (response.user.roles.includes('admin')) await AsyncStorage.setItem(Constants.userRole, 'admin');
        else if (response.user.roles.includes('treelogging')) await AsyncStorage.setItem(Constants.userRole, 'treelogging');
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.user.id.toString());
        console.log('userId stored: ', response.user.id);
        await AsyncStorage.setItem(Constants.phoneNumber, response.user.phone);
        response.data = { ...response.user, image: '' };
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
        await AsyncStorage.setItem(Constants.authToken, response.user.token);

        let userKeyDetails = await AsyncStorage.getItem(Constants.userDetailsKey);
        if (userKeyDetails) {
          userKeyDetails = JSON.parse(userKeyDetails);
          let name = userKeyDetails.name;
          if (name) {
            const firstName = name.split(' ')[0];
            console.log("user name in login screen and header---- ", firstName);
            setUserName(firstName);
          }
        }
      } catch (error) {
        console.log('Error storing userId', error);
        const stackTrace = error.stack;
        const errorLog = {
          msg: "happened while trying to store userId during login",
          error: JSON.stringify(error),
          stackTrace: stackTrace
        }
        await Utils.logException(JSON.stringify(errorLog));
      }

      if (response.success === true) {
        console.log('Login successful');
        navigation.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));
        setPhoneNumber('');
        setPinNumber('');
      }

    } catch (error) {
      Alert.alert(Strings.alertMessages.LoginFailed);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "login failed",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await Utils.logException(JSON.stringify(errorLog));
    }
  };

  const invalidPhoneNumber = () => {
    if (phoneNumber.length < 10) return true;
    return !isNumeric(phoneNumber);
  }

  const invalidPin = () => {
    if (pinNumber.length < 4) return true;
    return !isNumeric(pinNumber);
  }

  const isNumeric = (str) => {
    const regex = /^\d+$/;
    return regex.test(str);
  }


  return (
    <View style={loginStyles.outerContainer}>
      <InternetBanner/>
      <View style={loginStyles.inputContainer}>
        <View style={{ marginVertical: 10}}>
          <View style={{ marginVertical: 5, justifyContent: 'center', alignItems: 'center'}}>
            <Text variant='headlineLarge'>Log In</Text>
          </View>
          <View style={{ marginVertical: 5, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput
              style={{ width: '90%' }}
              label='Phone number'
              placeholder="Enter your phone number"
              placeholderTextColor="grey"
              onChangeText={text => setPhoneNumber(text)}
              value={phoneNumber}
              keyboardType="number-pad"
              maxLength={10}
              mode='outlined'
            />
          </View>
          <View style={{ marginVertical: 5, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput
              style={{ width: '90%' }}
              label='Pin'
              placeholder="Enter your pin"
              placeholderTextColor="grey"
              onChangeText={text => setPinNumber(text)}
              value={pinNumber}
              keyboardType="number-pad"
              secureTextEntry={!pinVisible}
              right={<TextInput.Icon icon={pinVisible ? "eye" : "eye-off"} onPress={() => setPinVisible(prev => !prev)}/>}
              maxLength={4}
              mode='outlined'
            />
          </View>

          <View style={loginStyles.loginView}>
            <Button
              onPress={loginUser}
              mode="contained"
              buttonColor='#059636'
              labelStyle={CustomButtonStyles.buttonLabel}
              style={CustomButtonStyles.button}
            >
              {Strings.buttonLabels.Submit}
            </Button>
          </View>
        </View>
      </View>


    </View >
  );
};

export default LoginScreen;