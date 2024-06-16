import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Text, View, FlatList, BackHandler, ToastAndroid, StyleSheet } from 'react-native';
import { Constants, Utils } from '../services/Utils';
import { Strings } from '../services/Strings';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import { commonStyles, syncButtonStyles, syncDisplayStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const updateSyncStatus = async (setSyncDate, setTreeCounts, setShiftsCount) => {
  const lsdate = await Utils.getLastSyncDate();
  if (lsdate) {
    setSyncDate(Utils.getReadableDate(lsdate));
  }
  else {
    setSyncDate(Strings.messages.Never);
  }
  const counts = await Utils.getTreesCounts();
  console.log("count before sync---", counts);
  setTreeCounts(counts);
  const shiftsCount = await Utils.getShiftsCounts();
  setShiftsCount(shiftsCount);
  console.log('setting counts: ', counts, "setting shifts count: ", shiftsCount);
}

const getReadableProgress = (progress) => {
  return Math.round(progress * 100).toString() + '%';
}

const SyncDisplay = ({ navigation }) => {
  const [syncDate, setSyncDate] = useState('');
  const [treeCounts, setTreeCounts] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [failedTrees, setFailedTrees] = useState([]);
  const [failedShifts, setFailedShifts] = useState([]);
  const [failedImagesTrees, setFailedImagesTrees] = useState([]);
  const [failedPlotTrees, setFailedPlotTrees] = useState([]);
  const [shiftsCount, setShiftsCount] = useState(null);
  const { lightTheme, shiftID, shiftDone } = useContext(GlobalContext);

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
    console.log('sync date updated', shiftID)
  }, []))

  const syncLogs = async () => {
    const response = await Utils.syncLogs();

    if (response?.success) {
      await Utils.deleteLogsFromLocalDB();
    }

  }

  const deleteSyncedTreesAndShifts = async (response) => {

    const uploadedShiftIDs = Object.values(response.shiftDetails)
      .filter(shift => shift.shiftUploaded)
      .map(shift => shift.shiftID);

    //take care of uploadedSaplings
    await Utils.deleteSyncedShiftsBasedOnSaplings(uploadedShiftIDs);
    await Utils.deleteSyncedTreesAndImages()

  };


  const uploadShift = async (uploadedSaplings = [], uploadedImageSaplings = [], uploadedTreesPlotsSaplings = []) => {
    let responseFromSyncShifts;
    let combinedUploadedSaplings = [...uploadedSaplings, ...uploadedImageSaplings, ...uploadedTreesPlotsSaplings]

    console.log("combinedUploadedSaplings----", combinedUploadedSaplings);

    if ((shiftsCount && shiftsCount.pending == 0) 
      //|| combinedUploadedSaplings.length === 0
    ) {
      // ToastAndroid.show(
      //   Strings.alertMessages.NothingToSync,
      //   ToastAndroid.LONG,
      // );
      return;
    }



    responseFromSyncShifts = await Utils.syncShifts(combinedUploadedSaplings);

    setFailedShifts(responseFromSyncShifts.failures);

    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);

    await Utils.fetchAndStoreHelperData();
    if (shiftDone) {
      await deleteSyncedTreesAndShifts(responseFromSyncShifts);
      await Utils.fetchAndStoreShifts();
    }
  }


  const uploadTrees = async () => {
    if (treeCounts && treeCounts.pending.treesUpload === 0) {
      return;
    }

    ToastAndroid.show(Strings.alertMessages.SyncingTrees, ToastAndroid.SHORT);

    let result = await Utils.upload(setProgress);
    let uploadedSaplings = result.uploadedSaplings;
    let failures = result.failures;
    console.log("----------------uploadedSaplings-ni Syncdisplay-----------", uploadedSaplings);

    setFailedTrees(failures)
    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);
    return uploadedSaplings;
  }

  const uploadImages = async () => {
    if (treeCounts && treeCounts.pending.imagesUpload === 0) {
      return;
    }

    ToastAndroid.show(Strings.alertMessages.SyncingImageTrees, ToastAndroid.SHORT);
    let result = await Utils.uploadNewImages(setProgress);
    let uploadedImageSaplings = result.uploadedImageSaplings
    let failures = result.failures
    //console.log("----------------treesinNewImageTable-----------", treesinNewImageTable[0].uploaded)
    setFailedImagesTrees(failures);
    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);
    return uploadedImageSaplings
  }

  const uploadTreesPlots = async () => {

    if (treeCounts && treeCounts.pending.plotUpload === 0) {
      return;
    }

    ToastAndroid.show(Strings.alertMessages.SyncingPlotTrees, ToastAndroid.SHORT);
    let result = await Utils.uploadTreesPlots(setProgress); //plotUpload

    let uploadedSaplings = result.uploadedSaplings;
    let failures = result.failures;
    setFailedPlotTrees(failures);
    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);

    return uploadedSaplings;
  }

  const commenceUpload = async () => {

    if (
      treeCounts &&
      treeCounts.pending.treesUpload === 0 && treeCounts.pending.plotUpload === 0 && treeCounts.pending.imagesUpload &&
      shiftsCount && shiftsCount.pending === 0) {
      ToastAndroid.show(Strings.alertMessages.NothingToSync, ToastAndroid.LONG);
      return;
    }

    setShowProgress(true);

    try {

      await syncLogs();

    } catch (error) {
      console.log('unable to sync logs---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync logs(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }

    let uploadedSaplings;

    try {
      uploadedSaplings = await uploadTrees();
    } catch (error) {
      console.log('unable to sync trees---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync trees(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }



    let uploadedImageSaplings;
    try {
      uploadedImageSaplings = await uploadImages()
    } catch (error) {
      console.log('unable to sync new images---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync new images(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }


    let uploadedTreesPlotsSaplings;

    try {
      uploadedTreesPlotsSaplings = await uploadTreesPlots();
    } catch (error) {
      console.log('unable to sync trees---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync trees(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }

    try {
      await uploadShift(uploadedSaplings, uploadedImageSaplings, uploadedTreesPlotsSaplings);
    } catch (error) {
      console.log('unable to sync shifts---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync shifts(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }
  };

  return (
    <View style={{ backgroundColor: 'white', height: '100%' }}>
      <View style={{ marginBottom: 30 }}>
        <Text style={syncDisplayStyles.lastSyncedText(lightTheme)}>
          {Strings.messages.LastSynced}
        </Text>
        <Text style={syncDisplayStyles.lastSyncedStatus(lightTheme)}>
          {syncDate}
        </Text>
      </View>

      <View style={{ ...commonStyles.borderedDisplay, margin: 20 }}>
        {treeCounts && (
          <View>
            <View style={syncDisplayStyles.syncDetailsContainer}>
              <Text style={syncDisplayStyles.syncText(lightTheme)}>
                {Strings.messages.pending}:
              </Text>
              <Text style={syncDisplayStyles.syncText(lightTheme)}>
                {treeCounts.pending.treesUpload + treeCounts.pending.plotUpload + treeCounts.pending.imagesUpload > 0 ? '❗' : '✅'}
              </Text>
              <Text style={syncDisplayStyles.syncText(lightTheme)}>
                {Strings.messages.synced}: {treeCounts.uploaded}
              </Text>
            </View>

            <View style={{ margin: 0, paddingLeft: 27 }}>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium" }}>
                {Strings.messages.pendingTrees}: {treeCounts.pending.treesUpload}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium" }}>
                {Strings.messages.pendingImages}: {treeCounts.pending.imagesUpload}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium" }}>
                {Strings.messages.pendingPlotTrees}: {treeCounts.pending.plotUpload}
              </Text>
            </View>
          </View>

        )}

        <View style={syncDisplayStyles.buttonWifiContainer}>
          <Button
            icon={() => (
              <MCIcon name="wifi-sync" size={30} color="white" />
            )}
            mode="contained"
            buttonColor='#059636'
            onPress={commenceUpload}
            contentStyle={syncDisplayStyles.buttonContent}
            labelStyle={syncDisplayStyles.buttonLabel}
          >
            {Strings.buttonLabels.SyncData}

          </Button>

        </View>
        {showProgress && (
          <View style={syncDisplayStyles.progressBar}>
            <Text style={syncDisplayStyles.progressBarText(lightTheme)}>
              Progress:{' '}
            </Text>
            <Progress.Bar progress={progress} style={{ height: 6 }} />
            <Text style={syncDisplayStyles.progressBarText(lightTheme)}>
              {getReadableProgress(progress)}
            </Text>
          </View>
        )}
        {failedTrees.length > 0 && (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={commonStyles.text5}>
                {Strings.messages.failedToUpload} {failedTrees.length}{' '}
                {Strings.messages.trees}:{' '}
              </Text>
            )}
            data={failedTrees}
            keyExtractor={item => item.sapling_id ? item.sapling_id : item}
            renderItem={({ item, index }) => {
              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {Strings.messages.SaplingNo} : {' '}
                  {item.sapling_id ? item.sapling_id : item}
                </Text>
              );
            }}
          />
        )}
        {failedPlotTrees.length > 0 && (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={commonStyles.text5}>
                {Strings.messages.failedToUpdate} {failedPlotTrees.length}{' '}
                {Strings.messages.trees}:{' '}
              </Text>
            )}
            data={failedPlotTrees}
            keyExtractor={item => item.sapling_id ? item.sapling_id : item}
            renderItem={({ item, index }) => {

              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {item.sapling_id ? item.sapling_id : item}
                </Text>
              );
            }}
          />
        )}
        {failedImagesTrees.length > 0 && (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={commonStyles.text5}>
                {Strings.messages.couldNotAdd} {failedImagesTrees.length}{' '}
                {Strings.messages.trees}:{' '}
              </Text>
            )}
            data={failedImagesTrees}
            keyExtractor={item => item.sapling_id ? item.sapling_id : item}
            renderItem={({ item, index }) => {

              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {Strings.messages.SaplingNo} : {' '}
                  {item.sapling_id ? item.sapling_id : item}
                </Text>
              );
            }}
          />
        )}
        {failedShifts.length > 0 && (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={commonStyles.text5}>
                {Strings.messages.failedToUpload} {failedShifts.length}{' '}
                {`${Strings.messages.Shift}s`}:{' '}
              </Text>
            )}
            data={failedShifts}
            renderItem={({ item, index }) => {
              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {Strings.messages.ShiftNo} : {item}
                </Text>
              );
            }}
          />
        )}
      </View>
    </View>

  );
}


export default SyncDisplay;


