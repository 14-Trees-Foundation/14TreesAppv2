import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Button, Text, View, TouchableOpacity, FlatList, BackHandler, ToastAndroid } from 'react-native';
import { Constants, Utils } from '../services/Utils';
import { MyIconButton } from '../components/Components';
import { Strings } from '../services/Strings';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';

const updateSyncStatus = async (setSyncDate, setCounts, setShiftsCount) => {
  const lsdate = await Utils.getLastSyncDate();
  if (lsdate) {
    setSyncDate(Utils.getReadableDate(lsdate));
  }
  else {
    setSyncDate(Strings.messages.Never);
  }
  const counts = await Utils.getTreesCounts();
  setCounts(counts);
  const shiftsCount = await Utils.getShiftsCounts();
  setShiftsCount(shiftsCount);
  console.log('setting counts: ', counts, "setting shifts count: ", shiftsCount);
}

const getReadableProgress = (progress) => {
  return Math.round(progress * 100).toString() + '%';
}

const SyncDisplay = ({ navigation, onSyncComplete }) => {
  const [syncDate, setSyncDate] = useState('');
  const [treeCounts, setTreeCounts] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [failedTrees, setFailedTrees] = useState([]);
  const [failedShifts, setFailedShifts] = useState([]);
  const [shiftsCount, setShiftsCount] = useState(null);
  const { lightTheme } = useContext(GlobalContext);



  useEffect(() => {
    const backAction = () => {
      navigation.goBack()
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [])


  useFocusEffect(useCallback(() => {
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
    console.log('sync date updated')
  }, []))

  const syncLogs = async () => {
    const response = await Utils.syncLogs();

    if (response?.success) {
      await Utils.deleteLogsFromLocalDB();
    }

  }


  const commenceUpload = async () => {

    if (treeCounts && treeCounts.pending === 0 && shiftsCount && shiftsCount.pending === 0) {
      ToastAndroid.show(Strings.alertMessages.NothingToSync, ToastAndroid.LONG);
      return;
    }

    setShowProgress(true);

    try {
      await syncLogs();
    } catch (error) {
      console.log("unable to sync logs---", error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while trying to sync logs(inside sync display)",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await Utils.logException(JSON.stringify(errorLog));
    }

    try {
      if (shiftsCount && shiftsCount.pending == 0) {
        ToastAndroid.show(Strings.alertMessages.NothingToSync, ToastAndroid.LONG);
        return;
      }
      const failures = await Utils.syncShifts();
      setFailedShifts(failures);
      setProgress(1);
      updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
      setTimeout(() => {
        setShowProgress(false);
      }, 2000);

    } catch (error) {
      console.log("unable to sync shifts---", error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while trying to sync shifts(inside sync display)",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await Utils.logException(JSON.stringify(errorLog));
    }


    try {
      if (treeCounts && treeCounts.pending === 0) {
        ToastAndroid.show(Strings.alertMessages.NothingToSync, ToastAndroid.LONG);
        return;
      }
      const failures = await Utils.upload(setProgress);

      setFailedTrees(failures);
      setProgress(1);
      updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
      setTimeout(() => {
        setShowProgress(false);
      }, 2000);



    } catch (error) {
      console.log("unable to sync trees---", error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: "happened while trying to sync trees(inside sync display)",
        error: JSON.stringify(error),
        stackTrace: stackTrace
      }
      await this.logExceptionLocalDB(JSON.stringify(errorLog));
    }

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
            keyExtractor={(item) => item.sapling_id}
            renderItem={({ item, index }) => {
              return <Text style={commonStyles.text5}>{index + 1}. {Strings.messages.SaplingNo} : : {item.sapling_id}</Text>
            }}
          />
        }
        {
          (failedShifts.length > 0) &&
          <FlatList
            ListHeaderComponent={() => <Text style={commonStyles.text5}>{Strings.messages.failedToUpload} {failedTrees.length} {`${Strings.messages.Shift}s`}: </Text>}
            data={failedShifts}
            renderItem={({ item, index }) => {
              return <Text style={commonStyles.text5}>{index + 1}. {Strings.messages.ShiftNo} : {item}</Text>
            }}
          />
        }
      </View>
    </View>

  );
}

export default SyncDisplay;