import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Button, StyleSheet, Text, View, TouchableOpacity, FlatList, BackHandler } from 'react-native';
import { Constants, Utils } from '../services/Utils';
import { CustomButton, MyIconButton, MyIconStack } from '../components/Components';
import LanguageModal from '../components/Languagemodal';
import { Strings } from '../services/Strings';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';

const updateSyncStatus = async (setSyncDate, setCounts) => {
  const lsdate = await Utils.getLastSyncDate();
  if (lsdate) {
    setSyncDate(Utils.getReadableDate(lsdate));
  }
  else {
    setSyncDate(Strings.messages.Never);
  }
  const counts = await Utils.getSyncCounts();
  console.log('setting counts: ', counts);
  setCounts(counts);
}

const getReadableProgress = (progress) => {
  return Math.round(progress * 100).toString() + '%';
}

const SyncDisplay = ({ navigation, onSyncComplete, route }) => {
  const [syncDate, setSyncDate] = useState('');
  const [treeCounts, setTreeCounts] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [failedTrees, setFailedTrees] = useState([]);

  const { shiftDone, lightTheme } = useContext(GlobalContext);

  const {data} =route.params
  

  console.log("final ref sync display ---", data, 'shiftDone----', shiftDone);

  useEffect(() => {
    const backAction = () => {
      console.log('here----');
      navigation.goBack()
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [])


  useFocusEffect(useCallback(() => {
    updateSyncStatus(setSyncDate, setTreeCounts);
    console.log('sync date updated')
  }, []))

  const syncLogs = async () => {
    const response = await Utils.syncLogs();
    //console.log("response logs from server: ", response);

    if (response.success) {
      await Utils.deleteLogsFromLocalDB();
    }

    // const logsArray = await Utils.getLogsFromLocalDB();

    // console.log("logs array length from local db after sync: ", logsArray.length);

  }

  const syncShifts = async () => {
    const response = await Utils.syncShifts();
    console.log("response logs from server: ", response);

    // if (response.success) {
    //   await Utils.deleteShiftsFromLocalDB();
    // }
  }

  const addShiftsLocalDB = async () => {
    console.log("currentd data---", data);
    const endtime = Utils.getCurrentTime12Hr();
    const timetaken = Utils.formatTime(data.current.seconds); //this is null
    const user_id = await Utils.getUserId();

    const shiftData = {
      shiftID: data.current.shiftID,
      user_id: user_id,
      plotselected: data.current.plotselected,
      starttime: data.current.shiftTime,
      endtime: endtime,
      timetaken: timetaken,
      treesplanted: data.current.treesPlanted
    }

    console.log("final shift data sync display---", shiftData);

    await Utils.saveShiftsToLocalDB(shiftData);

  }

  const commenceUpload = async () => {
    console.log("shiftdone----", shiftDone);

    if (!shiftDone) {
      addShiftsLocalDB();
    }

    setShowProgress(true);
    await syncLogs();
    await syncShifts();

    Utils.upload(setProgress).then(async (failures) => {
      setFailedTrees(failures);
      setProgress(1);
      updateSyncStatus(setSyncDate, setTreeCounts);
      setTimeout(() => {
        setShowProgress(false);
      }, 2000);
      if (onSyncComplete) {
        onSyncComplete();
      }
    });

  }


  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>

      <View style={{ marginBottom: 30 }}>
        <Text style={{
          ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black',
          margin: 20
        }}>
          {Strings.messages.LastSynced}
        </Text>
        <Text style={{
          ...commonStyles.borderText, marginHorizontal: 20, color: lightTheme ? '#52525C' : 'black',
          padding: 5, textAlign: 'center', fontWeight: '500'
        }}>
          {syncDate}
        </Text>
      </View>


      <View style={{ ...commonStyles.borderedDisplay, margin: 20 }}>

        {
          treeCounts &&
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 3 }}>
            <Text style={{ ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black', }}>
              {Strings.messages.pending}: {treeCounts.pending}
            </Text>
            <Text style={{ ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black', }}>{treeCounts.pending > 0 ? '❗' : '✅'}</Text>
            <Text style={{ ...commonStyles.textSync, color: lightTheme ? '#52525C' : 'black', }}>
              {Strings.messages.synced}: {treeCounts.uploaded}
            </Text>
          </View>
        }


        <View
          style={{
            marginHorizontal: 40,
            marginTop: 25,
            marginBottom: 10
          }}
        >
          <MyIconButton
            name={"wifi-sync"}
            text={Strings.buttonLabels.SyncData}
            onPress={commenceUpload}
          />
        </View>
        {
          showProgress &&
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 5, alignItems: 'center' }}>
            <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>Progress: </Text>
            <Progress.Bar progress={progress} style={{ height: 6 }} />
            <Text style={{ ...commonStyles.text5, color: lightTheme ? '#52525C' : 'black', }}>{getReadableProgress(progress)}</Text>
          </View>
        }
        {
          (failedTrees.length > 0) &&
          <FlatList
            ListHeaderComponent={() => <Text style={commonStyles.text5}>{Strings.messages.failedToUpload} {failedTrees.length} {Strings.messages.trees}: </Text>}
            data={failedTrees}
            renderItem={({ item, index }) => {
              return <Text style={commonStyles.text5}>{index + 1}. {Strings.messages.SaplingNo} : {item.sapling_id}</Text>
            }}
          />
        }
      </View>
    </View>

  );
}

export default SyncDisplay;