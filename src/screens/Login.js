import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput } from 'react-native';
import { DataService } from '../services/DataService';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { Utils, Constants } from '../services/Utils';
import { commonStyles } from "../services/Styles";
import { CustomButton } from '../components/Components';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      pinNumber: '',
      langModalVisible: false
    };
    this.loginUser = this.loginUser.bind(this);
  }

  loginUser = async () => {
    const { phoneNumber, pinNumber } = this.state;
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
      console.log("response data: ", response);

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
                  Utils.reloadApp(); // Call Utils.reloadApp() on pressing "OK"
                },
              },
            ]);
        } else {
          Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.IncorrectUser,
            [
              {
                onPress: () => {
                  Utils.reloadApp(); // Call Utils.reloadApp() on pressing "OK"
                },
              },
            ]);
        }
        return;
      }

      if (response.user.adminID) {
        await AsyncStorage.setItem(Constants.adminIdKey, response.user.adminID);
        //const admin_id = await AsyncStorage.getItem(Constants.adminIdKey);
        //console.log('adminId stored from async: ', admin_id);
        console.log('adminId : ', response.user.adminID);
      } else {
        console.log('adminId not stored');
      }

      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.user._id);
        console.log('userId stored: ', response.user._id);
        response.data = { ...response.user, image: '' };
        console.log("response data modified: ", response.data);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
      } catch (error) {
        console.log('Error storing userId', error);
      }

      if (response.success === true) {
        console.log('Login successful');
        this.props.navigation.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));

        // Clear the TextInput values after successful login
        this.setState({ phoneNumber: '', pinNumber: '' });
      }

    } catch (error) {
      Alert.alert(Strings.alertMessages.LoginFailed)
    }
  };

  handleLanguageChange = () => {
    this.props.navigation.setOptions({
      title: Strings.screenNames.LogIn
    });
  }

  render() {
    const { phoneNumber, pinNumber, langModalVisible } = this.state;

    return (
      <View style={{ backgroundColor: 'white', height: '100%' }}>
        <View style={commonStyles.pop}>
          <View style={{ marginVertical: 30 }}>
            <TextInput
              style={commonStyles.txtInput}
              placeholder="Enter your phone number"
              placeholderTextColor="grey"
              onChangeText={(text) => this.setState({ phoneNumber: text })}
              value={phoneNumber}
              keyboardType="number-pad"
              maxLength={10}
            />
            <TextInput
              style={commonStyles.txtInput}
              placeholder="Enter your pin"
              placeholderTextColor="grey"
              onChangeText={(text) => this.setState({ pinNumber: text })}
              value={pinNumber}
              keyboardType="number-pad"
              maxLength={4}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 30, marginTop: 25, marginBottom: 10 }}>
              <CustomButton
                text={Strings.buttonLabels.login}
                onPress={this.loginUser}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={commonStyles.selLang} onPress={() => { this.setState({ langModalVisible: !langModalVisible }); }}>
          <Text style={{ color: '#36454F', fontWeight: 'bold' }}>{Strings.buttonLabels.SelectLanguage}</Text>
        </TouchableOpacity>

        <LanguageModal
          langModalVisible={langModalVisible}
          setLangModalVisible={(visible) => this.setState({ langModalVisible: visible })}
          handleLanguageChange={this.handleLanguageChange}
        />
      </View>
    );
  }
}

export default LoginScreen;
