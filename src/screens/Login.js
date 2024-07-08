import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useContext, useEffect } from 'react';
import { Alert, Text, View, TextInput } from 'react-native';
import { DataService } from '../services/DataService';
import LanguageModal from '../components/Languagemodal';
import DeviceInfo from 'react-native-device-info';
import { Strings } from '../services/Strings';
import { Utils, Constants } from '../services/Utils';
import { CustomButtonStyles, commonStyles, loginStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');

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
      const phone = await DeviceInfo.getPhoneNumber();
      if (phone) {
        if (phone.startsWith("91") && phone.length > 10) phone = phone.substring(2);
        if (phone.length === 10) setPhoneNumber(phone);
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
    console.log("phone: ", phoneNumber, "pin: ", pinNumber);

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
      const isSignedIn = await DataService.loginUser(userDataPayload);
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


  return (
    <View style={loginStyles.outerContainer}>
      <View style={loginStyles.inputContainer}>
        <View style={{ marginVertical: 30 }}>
          <TextInput
            style={loginStyles.textInput(lightTheme, phoneNumber)}
            placeholder="Enter your phone number"
            placeholderTextColor="grey"
            onChangeText={text => setPhoneNumber(text)}
            value={phoneNumber}
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextInput
            style={loginStyles.textInput(lightTheme, phoneNumber)}
            placeholder="Enter your pin"
            placeholderTextColor="grey"
            onChangeText={text => setPinNumber(text)}
            value={pinNumber}
            keyboardType="number-pad"
            maxLength={4}
          />

          <View style={loginStyles.loginView}>
            <Button
              onPress={loginUser}
              mode="contained"
              buttonColor='#059636'
              labelStyle={CustomButtonStyles.buttonLabel}
              style={CustomButtonStyles.button}
            >
              {Strings.buttonLabels.login}
            </Button>
          </View>
        </View>
      </View>


    </View >
  );
};

export default LoginScreen;
