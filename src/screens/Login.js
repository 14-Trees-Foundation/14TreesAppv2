import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { DataService } from '../services/DataService';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import { Utils, Constants } from '../services/Utils';
import { TextInput } from 'react-native-gesture-handler';
import { commonStyles } from "../services/Styles";
import { CustomButton } from '../components/Components';

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      langModalVisible: false,
      pinNumber: ''
    };
    this.loginUser = this.loginUser.bind(this);
  }


  async loginUser() {

    const { navigation } = this.props;
    const { phoneNumber, pinNumber } = this.state;

    console.log("phone: ", phoneNumber, "pin: ", pinNumber);

    try {

      if (phoneNumber.length !== 10) {
        Alert.alert(Strings.alertMessages.CorrectPhoneNumber); 
        return
      }

      if (pinNumber.length !== 4) {
        Alert.alert(Strings.alertMessages.CorrectPin); 
        return
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

          if (userRole === null) {
            Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.userNotAuthorized,
              [
                {
                  onPress: () => {
                    Utils.reloadApp(); // Call Utils.reloadApp() on pressing "OK"
                  },
                },
              ]);
          } else {
            Alert.alert(Strings.alertMessages.LoginFailed, Strings.alertMessages.userNotSetup,
              [
                {
                  onPress: () => {
                    Utils.reloadApp(); // Call Utils.reloadApp() on pressing "OK"
                  },
                },
              ]);
          }


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
        console.log('adminId stored');
        console.log('adminId : ', response.user.adminID)
      }
      else {
        console.log('adminId not stored')
      }


      try {
        await AsyncStorage.setItem(Constants.userIdKey, response.user._id);
        console.log('userId stored: ', response.user._id);
        response.data = { ...response.user, image: '' }
        console.log("response data: ", response.data);
        await AsyncStorage.setItem(Constants.userDetailsKey, JSON.stringify(response.data));
        console.log('userDetails stored');
      } catch (error) {
        console.log('Error storing userId', error);
      }

      if (response.success === true) {
        //when role is trelogging or admin
        console.log('Login successful');
        navigation.navigate(Strings.screenNames.getString('DrawerScreen', Strings.english));

        // Clear the TextInput values after successful login
        this.setState({ phoneNumber: '', pinNumber: '' });
      }



    } catch (error) {
      Alert.alert(Strings.alertMessages.LoginFailed)
    }
  };

  render() {

    const { navigation } = this.props;
    const { langModalVisible, phoneNumber, pinNumber } = this.state;

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
                text={Strings.buttonLabels.login} //here
                onPress={this.loginUser}
              />
            </View>

          </View>

        </View>


        <TouchableOpacity style={commonStyles.selLang} onPress={() => { this.setState({ langModalVisible: !langModalVisible }); }}>
          <Text style={{ color: '#36454F', fontWeight: 'bold' }}>{Strings.buttonLabels.SelectLanguage}</Text>
        </TouchableOpacity>
        <LanguageModal
          navigation={navigation}
          langModalVisible={langModalVisible}
          setLangModalVisible={(visible) => this.setState({ langModalVisible: visible })}
        />
      </View>
    );

  }
}

export default LoginScreen;