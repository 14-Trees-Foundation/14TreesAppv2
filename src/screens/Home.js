import React, { useEffect, useContext, useCallback } from 'react';
import { View, BackHandler, Alert, TouchableOpacity, Image, Text, Dimensions, ScrollView } from 'react-native';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {

  const { langChanged, lightTheme } = useContext(GlobalContext);

  useEffect(() => {
    console.log("fetching from homescreen----");
    Utils.fetchAndStoreHelperData();
  }, []);

  useEffect(() => {
    console.log("langChanged inside HomeScreen: ", langChanged);
  }, [langChanged]);

  useFocusEffect(useCallback(() => {
    const backAction = () => {
      console.log("exiting from homescreen-----");

      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []))


  return (
    <ScrollView style={{ backgroundColor: 'white', height: '100%' }}>

      <View style={{ margin: 10 }}>
        <TouchableOpacity
          style={{
            width: 'auto',
            marginBottom: 2,
            marginTop: 22,
            backgroundColor: lightTheme ? '#e5e7ea' : 'lightgrey',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 82,
            borderColor: lightTheme ? '' : 'black',
            borderWidth: lightTheme ? 0 : 1,
            borderRadius: 50,
            shadowColor: lightTheme ? '#52525c' : 'black', // Shadow color
            shadowOffset: {
              width: 0,
              height: 0.5,
            },
            shadowOpacity: lightTheme ? 0.3 : 1,
            shadowRadius: 1,
            elevation: 3,
          }}

          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('Shifts', Strings.english),
            )
          }
        >
          <View
            style={{ padding: 20, alignItems: 'center', }}
          >
            <Image source={require('../../assets/icon-add-new-tree.png')}
              style={{ width: 100, height: 100, }} />
            <Text
              style={{
                fontFamily: 'Inter-Regular', fontSize: 20, fontWeight: '700',
                color: lightTheme ? '#113160' : 'black', textAlign: 'center'
              }}
            >{Strings.buttonLabels.Shifts}</Text>
          </View>

        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 'auto',
            marginBottom: 2,
            marginTop: 25,
            backgroundColor: lightTheme ? '#e5e7ea' : 'lightgrey',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 82,
            borderColor: lightTheme ? '' : 'black',
            borderWidth: lightTheme ? 0 : 1,
            borderRadius: 50,
            shadowColor: lightTheme ? '#52525c' : 'black', // Shadow color
            shadowOffset: {
              width: 0,
              height: 0.5,
            },
            shadowOpacity: lightTheme ? 0.3 : 1,
            shadowRadius: 1,
            elevation: 3,
          }}
          onPress={Utils.fetchAndStoreHelperData}
        >
          <View
            style={{ padding: 20, alignItems: 'center', }}
          >
            <Image source={require('../../assets/icon-fetch-data.png')}
              style={{ width: 100, height: 100, }} />
            <Text
              style={{
                fontFamily: 'Inter-Regular', fontSize: 20, fontWeight: '700',
                color: lightTheme ? '#113160' : 'black', textAlign: 'center'
              }}
            >{Strings.buttonLabels.FetchHelperData}</Text>
          </View>

        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 'auto',
            marginBottom: 2,
            marginTop: 25,
            backgroundColor: lightTheme ? '#e5e7ea' : 'lightgrey',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 82,
            borderColor: lightTheme ? '' : 'black',
            borderWidth: lightTheme ? 0 : 1,
            borderRadius: 50,
            shadowColor: lightTheme ? '#52525c' : 'black', // Shadow color
            shadowOffset: {
              width: 0,
              height: 0.5,
            },
            shadowOpacity: lightTheme ? 0.3 : 1,
            shadowRadius: 1,
            elevation: 3,
          }}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('SyncDisplay', Strings.english),
              { data: 0 }
            )
          }
        >
          <View
            style={{ padding: 20, alignItems: 'center', }}
          >
            <Image source={require('../../assets/icon-sync-data.png')}
              style={{ width: 130, height: 100, }} />
            <Text
              style={{
                fontFamily: 'Inter-Regular', fontSize: 20, fontWeight: '700',
                color: lightTheme ? '#113160' : 'black', textAlign: 'center'
              }}
            >{Strings.buttonLabels.SyncData}</Text>
          </View>

        </TouchableOpacity>
      </View>



    </ScrollView >
  );
};

export default HomeScreen;
