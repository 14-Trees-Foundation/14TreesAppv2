import React, { useEffect, useContext, useCallback, useState } from 'react';
import { View, BackHandler, ToastAndroid, TouchableOpacity, Image, Text, ScrollView } from 'react-native';
import { Strings } from '../services/Strings';
import { Utils } from '../services/Utils';
import GlobalContext from '../context/GlobalContext ';
import { useFocusEffect } from '@react-navigation/native';
import { homeStyles } from '../services/Styles';
import { fetchAndStoreTrees } from '../services/sync/tree';
import { fetchAndStoreUsers } from '../services/sync/users';
import { fetchAndStoreSites } from '../services/sync/sites';


const HomeScreen = ({ navigation }) => {
  const { langChanged, lightTheme } = useContext(GlobalContext);
  const [dataUptoDate, setDataUptoDate] = useState(false);

  const fetchHelperDataAndShifts = async () => {
    if (!dataUptoDate) {
      ToastAndroid.show(
        Strings.alertMessages.DataGettingFetched,
        ToastAndroid.LONG,
      );
    }

    const helperDataStatus = await Utils.fetchAndStoreHelperData();

    await fetchAndStoreUsers();
    await fetchAndStoreTrees();
    await fetchAndStoreSites();

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
    initTask();
  }, []);

  useEffect(() => {
    console.log('langChanged inside HomeScreen: ', langChanged);
  }, [langChanged]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
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
    <ScrollView style={{ backgroundColor: 'white', height: '100%' }}>
      <View style={{ flex: 1, flexDirection: "column", justifyContent: 'center', alignItems: 'center', paddingBottom: 10, marginTop: 20 }}>
        <TouchableOpacity
          style={{
            ...homeStyles.button(lightTheme),
            width: 170,
            backgroundColor: dataUptoDate ? '#F3F4F6' : '#cccccc',
            // padding:10
          }}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('Shifts', Strings.english),
            )
          }
          disabled={!dataUptoDate}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Image
              source={require('../../assets/ico-add-new-tree.png')}
              style={{ ...homeStyles.imageSpecs, opacity: dataUptoDate ? 1 : 0.5 }}
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
           style={{...homeStyles.button(lightTheme),width: 170,}}
          onPress={fetchHelperDataAndShifts}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Image
              source={require('../../assets/icon-fetch-data.png')}
              style={homeStyles.imageSpecs}
            />
            <Text style={{...homeStyles.buttonText(lightTheme) ,marginTop: 5}}>
              {Strings.buttonLabels.FetchHelperData}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{...homeStyles.button(lightTheme),width: 170,}}
          onPress={() =>
            navigation.navigate(
              Strings.screenNames.getString('SyncDisplay', Strings.english),
              { data: 0 },
            )
          }>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Image
              source={require('../../assets/icon-sync-data.png')}
              style={{ width: 130, height: 100 }}
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