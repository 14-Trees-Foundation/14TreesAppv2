import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useContext, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { DataService } from '../services/DataService';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { Utils, Constants } from '../services/Utils';
import { commonStyles } from "../services/Styles";
import { CustomButton } from '../components/Components';
import LangContext from '../context/LangContext ';

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const { langChanged } = useContext(LangContext);

  useEffect(() => {
    console.log("langChanged inside LoginScreen: ", langChanged);
    navigation.setOptions({
      title: Strings.screenNames.LogIn
    });
  }, [langChanged]);

  const loginUser = async () => {
    console.log("phone: ", phoneNumber, "pin: ", pinNumber);

    try {
      if (phoneNumber.length !== 10) {
        Alert.alert(Strings.alertMessages.CorrectPhoneNumber);
        return;
      }

      if (pinNumber.length !== 4) {
        Alert.alert(Strings.alertMessages.CorrectPin);
        return;
      }

      const userDataPayload = {
        phone: phoneNumber,
        pinNumber: pinNumber
      };

      console.log('Sending user data to server.', userDataPayload);
      const isSignedIn = await DataService.loginUser(userDataPayload);

      const response = isSignedIn.data;
      console.log("response data from login-----: ", response);

      if (response.success === false) {
        const errorMsg = response.error.errorMsg;
        const user = response.user;
        console.log("errorMsg: ", errorMsg);
        console.log("user: ", user);

        if (user) {
          const userRole = user.userRole;
          console.log("userRole: ", userRole);

          let message = Strings.alertMessages.IncorrectUser;
          if (userRole === null) {
            message = Strings.alertMessages.userNotAuthorized;
          } else {
            message = Strings.alertMessages.userNotSetup;
          }

          Alert.alert(Strings.alertMessages.LoginFailed, message,
            [
              {
                onPress: () => {
                  Utils.reloadApp();
                },
              },
            ]);
        } else {
          Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.IncorrectUser,
            [
              {
                onPress: () => {
                  Utils.reloadApp();
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

      if (response.user.adminID) {
        await AsyncStorage.setItem(Constants.adminIdKey, response.user.adminID);
        const admin_id = await AsyncStorage.getItem(Constants.adminIdKey);
        console.log('adminId stored from async: ', admin_id);
        console.log('adminId : ', response.user.adminID);
      } else {
        console.log('adminId not stored');
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.user._id);
        console.log('userId stored: ', response.user._id);
        await AsyncStorage.setItem(Constants.phoneNumber, response.user.phone.toString());
        response.data = { ...response.user, image: '' };
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
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
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      <View style={commonStyles.pop}>
        <View style={{ marginVertical: 30 }}>
          <TextInput
            style={commonStyles.txtInput}
            placeholder="Enter your phone number"
            placeholderTextColor="grey"
            onChangeText={(text) => setPhoneNumber(text)}
            value={phoneNumber}
            keyboardType="number-pad"
            maxLength={10}
          />
          <TextInput
            style={commonStyles.txtInput}
            placeholder="Enter your pin"
            placeholderTextColor="grey"
            onChangeText={(text) => setPinNumber(text)}
            value={pinNumber}
            keyboardType="number-pad"
            maxLength={4}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
            <CustomButton
              text={Strings.buttonLabels.login}
              onPress={loginUser}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={commonStyles.selLang} onPress={() => { setLangModalVisible(!langModalVisible); }}>
        <Text style={{ color: '#36454F', fontWeight: 'bold' }}>{Strings.buttonLabels.SelectLanguage}</Text>
      </TouchableOpacity>

      <LanguageModal
        langModalVisible={langModalVisible}
        setLangModalVisible={(visible) => setLangModalVisible(visible)}
      />
    </View>
  );
};

export default LoginScreen;
