import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Text, View, FlatList, BackHandler, ToastAndroid, StyleSheet } from 'react-native';
import { Constants, Utils } from '../services/Utils';
import { Strings } from '../services/Strings';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import { CustomButtonStyles, commonStyles, syncButtonStyles, syncDisplayStyles } from "../services/Styles";
import GlobalContext from '../context/GlobalContext ';
import { Button } from 'react-native-paper';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DaoClient } from '../services/db/dao';
import { uploadTreesData } from '../services/sync/tree';
// import { uploadUsersData } from '../services/sync/users';
// import { uploadPlotsData } from '../services/sync/plots';
// import { uploadSitesData } from '../services/sync/sites';
// import { uploadVisitData } from '../services/sync/visits';
import { uploadVisitImagesData } from '../services/sync/visit_images';

const updateSyncStatus = async (setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount) => {
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

  const daoClient = await DaoClient.authenticate();
  const treesResp = await daoClient.trees.countTreesByChangeTye();
  setTreesCount(treesResp)

  // const usersResp = await daoClient.users.countUsersByChangeTye(false);
  // setUsersCount(usersResp);

  // const plotsResp = await daoClient.plots.countPlotsByChangeType(false);
  // setPlotsCount(plotsResp);

  // const sitesResp = await daoClient.sites.countSitesByChangeType(false);
  // setSitesCount(sitesResp);

  // const visitsResp = await daoClient.visits.countVisitsByChangeTye(false);
  // setVisitsCount(visitsResp);

  const visitImagesResp = await daoClient.visitImages.countVisitImages(false);
  setVisitImagesCount(visitImagesResp);
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
  const [treesCount, setTreesCount] = useState(null);
  // const [usersCount, setUsersCount] = useState(null);
  // const [plotsCount, setPlotsCount] = useState(null);
  // const [sitesCount, setSitesCount] = useState(null);
  // const [visitsCount, setVisitsCount] = useState(null);
  const [visitImagesCount, setVisitImagesCount] = useState(0);
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
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
    console.log('sync date updated', shiftID)
  }, []))

  const syncLogs = async () => {
    const response = await Utils.syncLogs();

    if (response?.success) {
      await Utils.deleteLogsFromLocalDB();
    }

  }

  const deleteSyncedTreesAndShifts = async (response) => {
    if (response) {

      const uploadedShiftIDs = Object.values(response.shiftDetails)
        .filter(shift => shift.shiftUploaded)
        .map(shift => shift.shiftID);

      //take care of uploadedSaplings
      await Utils.deleteSyncedShiftsBasedOnSaplings(uploadedShiftIDs);
      await Utils.deleteSyncedTreesAndImages()
    }
  };


  const uploadShift = async () => {
    let responseFromSyncShifts;

    if ((shiftsCount && shiftsCount.pending == 0)) {
      // ToastAndroid.show(
      //   Strings.alertMessages.NothingToSync,
      //   ToastAndroid.LONG,
      // );
      return;
    }



    responseFromSyncShifts = await Utils.syncShifts(setProgress);
    console.log("responseFromSyncShifts---", responseFromSyncShifts.failures, responseFromSyncShifts.shiftDetails);
    setFailedShifts(responseFromSyncShifts.failures);

    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);

    await Utils.fetchAndStoreHelperData();

    if (shiftDone && responseFromSyncShifts.shiftDetails) {
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
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
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
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
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
    console.log("---------failedPlotTreesMessages------", failures)
    setFailedPlotTrees(failures);
    setProgress(1);
    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
    setTimeout(() => {
      setShowProgress(false);
    }, 2000);

    return uploadedSaplings;
  }

  const commenceUpload = async () => {

    if (
      treeCounts &&
      treeCounts.pending.treesUpload === 0 && treeCounts.pending.plotUpload === 0 && treeCounts.pending.imagesUpload === 0 &&
      shiftsCount && shiftsCount.pending === 0 
      && treesCount && treesCount.add === 0 && treesCount.edit === 0 && treesCount.delete === 0
      // && usersCount && usersCount.add === 0 && usersCount.edit === 0 && usersCount.delete === 0
      // && plotsCount && plotsCount.add === 0 && plotsCount.edit === 0 && plotsCount.delete === 0
      // && sitesCount && sitesCount.add === 0 && sitesCount.edit === 0 && sitesCount.delete === 0
      // && visitsCount && visitsCount.add === 0 && visitsCount.edit === 0 && visitsCount.delete === 0
      && visitImagesCount === 0
    ) {
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
      uploadedImageSaplings = await uploadImages();
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
      //console.log("uploadedTreesPlotsSaplings---", uploadedTreesPlotsSaplings);
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

      await uploadShift();
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

    try {
      await uploadTreesData();
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

    // try {
    //   await uploadUsersData();
    // } catch (error) {
    //   console.log('unable to sync users---', error);
    //   const stackTrace = error.stack;
    //   const errorLog = {
    //     msg: 'happened while trying to sync users(inside sync display)',
    //     error: JSON.stringify(error),
    //     stackTrace: stackTrace,
    //   };
    //   await Utils.logException(JSON.stringify(errorLog));
    // }

    // try {
    //   await uploadPlotsData();
    // } catch (error) {
    //   console.log('unable to sync plots---', error);
    //   const stackTrace = error.stack;
    //   const errorLog = {
    //     msg: 'happened while trying to sync plots(inside sync display)',
    //     error: JSON.stringify(error),
    //     stackTrace: stackTrace,
    //   };
    //   await Utils.logException(JSON.stringify(errorLog));
    // }

    // try {
    //   await uploadSitesData();
    // } catch (error) {
    //   console.log('unable to sync sites---', error);
    //   const stackTrace = error.stack;
    //   const errorLog = {
    //     msg: 'happened while trying to sync sites(inside sync display)',
    //     error: JSON.stringify(error),
    //     stackTrace: stackTrace,
    //   };
    //   await Utils.logException(JSON.stringify(errorLog));
    // }

    // try {
    //   await uploadVisitData();
    // } catch (error) {
    //   console.log('unable to sync visits---', error);
    //   const stackTrace = error.stack;
    //   const errorLog = {
    //     msg: 'happened while trying to sync visits(inside sync display)',
    //     error: JSON.stringify(error),
    //     stackTrace: stackTrace,
    //   };
    //   await Utils.logException(JSON.stringify(errorLog));
    // }

    try {
      await uploadVisitImagesData();
    } catch (error) {
      console.log('unable to sync visit images---', error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to sync visit images(inside sync display)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await Utils.logException(JSON.stringify(errorLog));
    }

    updateSyncStatus(setSyncDate, setTreeCounts, setShiftsCount, setTreesCount, setVisitImagesCount);
    setShowProgress(false);
    await Utils.setLastSyncDateNow();

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

      <View style={{ margin: 20 }}>
        {treeCounts && (
          <View>
            <View style={syncDisplayStyles.syncDetailsContainer}>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), color: '#333' }}>
                {Strings.messages.pending}:
              </Text>
              <Text style={syncDisplayStyles.syncText(lightTheme)}>
                {treeCounts.pending.treesUpload + treeCounts.pending.plotUpload + treeCounts.pending.imagesUpload > 0 ? '❗' : '✅'}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), color: '#333' }}>
                {Strings.messages.synced}: {treeCounts.uploaded}
              </Text>
            </View>

            <View style={{ margin: 0, paddingLeft: 27 }}>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4, paddingTop: 3 }}>
                {Strings.messages.pendingTrees}: {treeCounts?.pending.treesUpload}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                {Strings.messages.pendingImages}: {treeCounts?.pending.imagesUpload}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                {Strings.messages.pendingPlotTrees}: {treeCounts?.pending.plotUpload}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                {Strings.screenNames.Shifts}: {shiftsCount?.pending}
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "bold", paddingBottom: 4 }}>
                {Strings.screenNames.TreesPage}: 
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                [ added: {treesCount?.add || 0}, edited: {treesCount?.edit || 0}, deleted: {treesCount?.delete || 0}]
              </Text>
              {/* <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "bold", paddingBottom: 4 }}>
                {Strings.screenNames.UsersPage}: 
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                [ added: {usersCount?.add || 0}, edited: {usersCount?.edit || 0}, deleted: {usersCount?.delete || 0}]
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "bold", paddingBottom: 4 }}>
                {Strings.screenNames.PlotsPage}: 
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                [ added: {plotsCount?.add || 0}, edited: {plotsCount?.edit || 0}, deleted: {plotsCount?.delete || 0}]
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "bold", paddingBottom: 4 }}>
                {Strings.screenNames.SitesPage}: 
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                [ added: {sitesCount?.add || 0}, edited: {sitesCount?.edit || 0}, deleted: {sitesCount?.delete || 0}]
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "bold", paddingBottom: 4 }}>
                {Strings.screenNames.VisitsPage}: 
              </Text>
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                [ added: {visitsCount?.add || 0}, edited: {visitsCount?.edit || 0}, deleted: {visitsCount?.delete || 0}]
              </Text> */}
              <Text style={{ ...syncDisplayStyles.syncText(lightTheme), fontWeight: "medium", paddingBottom: 4 }}>
                Visit Images: {visitImagesCount}
              </Text>
            </View>
          </View>

        )}

        <View style={syncDisplayStyles.buttonWifiContainer}>
          <Button
            icon={() => (
              <MCIcon name="wifi-sync" size={30} color="white" />
            )}
            mode={!lightTheme ? "elevated" : "contained"}
            buttonColor='#059636'
            onPress={commenceUpload}
            labelStyle={{ ...CustomButtonStyles.buttonLabel, paddingTop: 9, }}
            style={CustomButtonStyles.button}
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
            keyExtractor={item => item?.sapling_id ? item?.sapling_id : item}
            renderItem={({ item, index }) => {
              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {item?.sapling_id ? `${item.sapling_id} from ${item.old_plot} to ${item.new_plot}` : item}
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
            keyExtractor={item => item.id ? item.id : item}
            data={failedShifts}
            renderItem={({ item, index }) => {
              return (
                <Text style={commonStyles.text5}>
                  {index + 1}. {Strings.messages.ShiftNo} : {' '}
                  {item.id ? item.id : item}
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


