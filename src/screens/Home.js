import React, {useEffect, useContext, useCallback, useState} from 'react';
import {
  View,
  BackHandler,
  ToastAndroid,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Strings} from '../services/Strings';
import {Utils} from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';
import {useFocusEffect} from '@react-navigation/native';
import {homeStyles} from '../services/Styles';

const HomeScreen = ({navigation}) => {
  const {langChanged, lightTheme} = useContext(GlobalContext);
  const [dataUptoDate, setDataUptoDate] = useState(false);

  const fetchHelperDataAndShifts = async () => {
    if (!dataUptoDate) {
      ToastAndroid.show(
        Strings.alertMessages.DataGettingFetched,
        ToastAndroid.LONG,
      );
    }

    const helperDataStatus = await Utils.fetchAndStoreHelperData();

    if (helperDataStatus.helperDataUptoDate) {
      setDataUptoDate(true);
      ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG);
    } else {
      ToastAndroid.show(
        Strings.alertMessages.DataGettingFetched,
        ToastAndroid.LONG,
      );
    }
  };

  const initTask = async () => {
    await fetchHelperDataAndShifts();
    await Utils.fetchAndStoreShifts();
    await Utils.checkShiftsComplete();
  };

  useEffect(() => {
    //console.log('fetching from homescreen----');
    initTask();
  }, []);

  useEffect(() => {
    //console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        //console.log('exiting from homescreen-----');

        BackHandler.exitApp();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  return (
    <ScrollView style={{backgroundColor: 'white', height: '100%'}}>
      <View style={{margin: 10}}>
        <TouchableOpacity
          style={{
            ...homeStyles.button(lightTheme),
            backgroundColor: lightTheme ? dataUptoDate
                ? '#e5e7ea'
                : '#cccccc'
              : dataUptoDate
              ? 'lightgrey'
              : '#999999',
          }}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('Shifts', Strings.english),
            )
          }
          disabled={!dataUptoDate}>
          <View style={{padding: 20, alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-add-new-tree.png')}
              //style={{ width: 100, height: 100, }}
              style={{...homeStyles.imageSpecs, opacity: dataUptoDate ? 1 : 0.5}}
            />
            <Text
              style={{
                ...homeStyles.buttonText(lightTheme),
                color: lightTheme
                  ? dataUptoDate
                    ? '#113160'
                    : '#666666'
                  : dataUptoDate
                  ? 'black'
                  : '#333333',
              }}>
              {Strings.buttonLabels.Shifts}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={homeStyles.button(lightTheme)}
          onPress={fetchHelperDataAndShifts}>
          <View style={{padding: 20, alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-fetch-data.png')}
              style={homeStyles.imageSpecs}
            />
            <Text style={homeStyles.buttonText(lightTheme)}>
              {Strings.buttonLabels.FetchHelperData}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={homeStyles.button(lightTheme)}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('SyncDisplay', Strings.english),
              {data: 0},
            )
          }>
          <View style={{padding: 20, alignItems: 'center'}}>
            <Image
              source={require('../../assets/icon-sync-data.png')}
              style={{width: 130, height: 100}}
            />
            <Text style={homeStyles.buttonText(lightTheme)}>
              {Strings.buttonLabels.SyncData}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};


export default HomeScreen;
