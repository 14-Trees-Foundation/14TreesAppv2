import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Alert, ToastAndroid, Modal} from 'react-native';
import {DataService} from './DataService';
import {LocalDatabase} from './tree_db';
import RNRestart from 'react-native-restart';
import {Strings} from './Strings';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
// import React, {useState} from 'react';
// import {trees, RealmContext, plots, tree_types} from '../models/Tree';
// // import {BSON} from 'realm';

// const {useQuery, useRealm} = RealmContext;
// const realm = useRealm();

const MIN_BATCH_SIZE = 5;

//  const atlastrees = useQuery(trees);

export class Utils {
    
   //static  atlastrees = atlastrees

  static localdb = new LocalDatabase();
  //treeTypes and PLots
  static async getLocalTreeTypesAndPlots() {
    let treeTypes = await this.localdb.getAllTreeTypes();
    let plots = await this.localdb.getAllPlots();
    //console.log("----------------getLocalPlots---------------",plots)
    return {treeTypes, plots};
  }

//   //namrata
//   static async fetchDataUsingRealm() {
    
//     // const atlastrees = useQuery(trees);
//     console.log(
//       '---------------------atlastrees-------------',
//       this.atlastrees.length,
//     );
//     const objectSizeOf = require('object-sizeof'); 
//     const treesSize = objectSizeOf(this.atlastrees);
//     console.log(`Size of the retrieved trees: ${treesSize} bytes`);
//     // const totalSize = atlastrees.reduce((acc, obj) => acc + objectSizeOf(obj), 0);
//     // console.log("Total size of documents:", totalSize, "bytes");

//     const atlasPlots = useQuery(plots);
//     //console.log(    '---------------------atlasplots---------------',atlasPlots.length,);
//     const plotsSize = objectSizeOf(atlasPlots); // Requires the 'object-sizeof' library
//     console.log(`Size of the retrieved plots: ${plotsSize} bytes`);

//     const atlasTreeTypes = useQuery(tree_types);
//     // console.log(
//     //   '---------------------atlasTreeTypes---------------',
//     //   atlasTreeTypes.length,
//     // );
//   }

  //Manjur
  static async logException(logs) {
    await this.localdb.logExceptionLocalDB(logs);
    return;
  }

  static async getLogsFromLocalDB() {
    return await this.localdb.getAllLogs();
  }

  static async deleteLogsFromLocalDB() {
    await this.localdb.deleteAllLogs();
  }

  static async syncLogs() {
    const logs = await Utils.getLogsFromLocalDB();
    const response = await DataService.uploadLogs(logs);
    return response;
  }


  //Namrata
  static async fetchSaplingIdsFromLiveDB() {
    let saplings = await this.localdb.getAllSaplingsInLiveDB();
    return saplings;
  }

  static async deleteTreeImages(saplingId) {
    //deleting previous images
    await this.localdb.deleteTreeImages(saplingId);
  }

  static async deleteTreeAndImages(saplingId) {
    await this.localdb.deleteTreeImages(saplingId);
    await this.localdb.deleteTree(saplingId);
    return;
  }
  static async fetchLocalTree(saplingId) {
    const results = await this.localdb.getTreeBySaplingID(saplingId);
    if (results.length > 0) {
      return await this.formatLocalTreeToJSON(results[0]);
    }
    return null;
  }

  static async saveTreeAndImagesToLocalDB(tree, images) {
    console.log('--------------updating image------------------');
    await this.localdb.saveTree(tree, 0);
    for (let index = 0; index < images.length; index++) {
      //console.log("image while adding tree: ", images[index].data)
      const element = {
        saplingid: tree.saplingid,
        image: images[index].data,
        imageid: images[index].name,
        remark: images[index].meta.remark,
        timestamp: images[index].meta.capturetimestamp,
      };

      //namrata - delete previous image first
      await this.localdb.saveTreeImages(element);
    }
  }
  static async getAppRootTag() {
    return Number.parseInt(await AsyncStorage.getItem(Constants.appRootTagKey));
  }
  // Function to force reload the app
  static async reloadApp() {
    RNRestart.restart();
  }

  static async confirmAction(
    onConfirm,
    title = undefined,
    message = undefined,
  ) {
    if (!title) {
      title = Strings.alertMessages.ConfirmActionTitle;
    }
    if (!message) {
      message = Strings.alertMessages.ConfirmActionMsg;
    }
    Alert.alert(title, message, [
      {
        text: Strings.alertMessages.Yes,
        onPress: () => onConfirm(),
      },
      {
        text: Strings.alertMessages.No,
        onPress: () => null,
      },
    ]);
  }
  static async createLocalTablesIfNeeded() {
    // console.log('creating tables if needed.', this.localdb)
    await this.localdb.createTreetTypesTbl();
    await this.localdb.createPlotTbl();
    await this.localdb.createSaplingTbl();
    await this.localdb.createTreesTable();
    await this.localdb.createLogsTable();
    await this.localdb.createSaplingPlotTbl();
  }

  //Namrata

  static async fetchAndStoreHelperData(atlastrees,atlasPlots,atlasTreeTypes) {
    
    console.log('------------fetching helper data in Utils------------');

    // //----------------------------DATA SERVICE.fetchHelperData---------------------------
    // let lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
    // lastHash = String(lastHash); 
    //  let userId = await Utils.getUserId(); 


    //  const helperData = await DataService.fetchHelperData(userId, lastHash);
    
    
    // if (!helperData) {
    //     console.log("---------empty helper data------",helperData)
    //   return; 
    // }
    
    //  const newHash = helperData.data['hash'];
    //  const data = helperData.data['data'];
    
    // //console.log("-----atlasPlots-----",data['plots'][0].data['treeTypes'][0])
    // if (newHash == lastHash) {
    //   console.log(
    //     '---------------------------newHash == lastHash-------------',
    //   );
    //   ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG);

    //   return;
    // }
    // if (data) {
    //   console.log('---------------------------New Data-------------');

    //   await Utils.storeTreeTypes(data['treeTypes']);
    //   await Utils.storeTrees(data['saplings']);
    //   await Utils.storePlots(data['plots']);
      
      //-------------------------------REALM DATA--------------------------
     
      // console.log("-----------atlasTrees---------",atlastrees.length)
       console.log("--atlasTreeTypes--",atlasTreeTypes.length,"atlasPLots  ",atlasPlots.length,"atlasTrees ",atlastrees.length)
      await Utils.storeTreeTypes(atlasTreeTypes.length!==0?atlasTreeTypes:data['treeTypes'])
      await Utils.storePlots(atlasPlots.length!==0?atlasPlots:data['plots']);
      await Utils.storeTrees(atlastrees.length!==0?atlastrees:data['trees']);

      // await AsyncStorage.setItem(Constants.lastHashKey, newHash);
      // ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG);

      return;
    //}
  }

  // // FETCH STORE SAPLINGS
  // static async fetchAndStorePlotSaplings() {
  //     // await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey,'blah');
  //     // return;
  //     let lastHash = await AsyncStorage.getItem(Constants.hashForPlotSaplingsKey);
  //     lastHash = String(lastHash);//take care of null values.
  //     let userId = await Utils.getUserId();
  //     console.log('requesting plot saps: ', userId, lastHash)
  //     const plotSaplingsData = await DataService.fetchPlotSaplings(userId, lastHash);

  //     if (!plotSaplingsData) {
  //         return;//error display, logging done by DataService.
  //     }
  //     // console.log(plotSaplingsData.data)
  //     const newHash = plotSaplingsData.data['hash'];
  //     const jsondata = plotSaplingsData.data['data'];
  //     console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
  //     console.log(newHash, 'is the new hash.');

  //     if (newHash === lastHash) {
  //         console.log('hashes match, returning.')
  //         ToastAndroid.show(Strings.alertMessages.plotSaplingsDataUpToDate, ToastAndroid.LONG)
  //         return;
  //     }
  //     if (jsondata) {
  //         console.log('Storing Json data...')
  //         await Promise.all(jsondata.map(async (plot) => {
  //             console.log(this)
  //             await this.localdb.storePlotSaplings(plot.plot_id, plot.saplings);
  //             console.log(plot.plot_id, 'plot stored.')
  //         }));
  //         console.log('data stored.')
  //         await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey, newHash);
  //         console.log('setting hash: ', newHash);
  //         ToastAndroid.show(Strings.alertMessages.plotSaplingsDataUpToDate, ToastAndroid.LONG)
  //     }
  //     else {
  //         console.log('data was null.');
  //     }

  //     //-----------------------------------------
  //     //Possibly, LDB set to null on app reload

  //     // const jsonData = DummyData;
  //     // console.log("got the data")
  //     // const jsondata = jsonData['data'];

  //     // console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
  //     // await Promise.all(jsondata.map(async (plot) => {
  //     //     const { plot_id, saplings } = plot;
  //     //     // console.log(plot_id);
  //     //     // console.log(saplings);
  //     //     await this.localdb.storePlotSaplings(plot_id, saplings);
  //     //     // console.log('plot stored.')
  //     // }));
  //     // console.log('data stored.')
  // }

  static async deletePlotSaplings() {
    await this.localdb.deletePlotSaplings();
  }

  static async getPlotSaplings(plotId) {
    console.log('getting plot saplings for ', plotId);
    const saplings = await this.localdb.getSaplingsforPlot(plotId);
    console.log(`# saplings : `, saplings.length);
    if (saplings.length > 0) {
      //console.log('example: ', saplings[0]);
    }
    return saplings;
  }

  static async storeTreeTypes(treeTypes) {
    // console.log(treeTypes[0])
    const treeTypesInLocalDBFormat = treeTypes.map(treeType => {
      return {
        name: treeType.name,
        tree_id: treeType.tree_id,
        _id: treeType._id
      };
    });
    let failure = false;
    //for (let dbTreeType of treeTypesInLocalDBFormat) {
      try {
        await this.localdb.updateTreeTypeTbl(treeTypesInLocalDBFormat);
      } catch (error) {
        console.log('Failed to save treeType: ', error);
        failure = true;
        const stackTrace = error.stack;
        const errorLog = {
          msg: 'happened while trying to save treeType(inside Utils)',
          error: JSON.stringify(error),
          stackTrace: stackTrace,
        };
        await this.logException(JSON.stringify(errorLog));
      }
   // }
    if (failure) {
      ToastAndroid.show(Strings.alertMessages.FailureSavingTrees);
    } else {
      console.log('All tree types saved successfully.');
    }
  }
  static async storePlots(plots) {
     
    const plotsInLocalDBFormat = plots.map(plot => {
      if (plot.name) {
        
        plot.name = plot.name.replace("'", "''");
      }
      return {
        name: plot.name,
        plot_id: plot.plot_id,
        _id:plot._id
      };
    });
    let failure = false;
     //for (let dbPlot of plotsInLocalDBFormat) {
      try {
        await this.localdb.updatePlotTbl(plotsInLocalDBFormat);
      } catch (error) {
        console.log('Failed to save plots: ', error);
        //(error);
        failure = true;
        const stackTrace = error.stack;
        const errorLog = {
          msg: 'happened while trying to save plot(inside Utils)',
          error: JSON.stringify(error),
          stackTrace: stackTrace,
        };
        await this.logException(JSON.stringify(errorLog));
      }
    //}
    if (failure) {
      ToastAndroid.show(Strings.alertMessages.FailureSavingPlots);
      console.log("----Failure saving plots---",stackTrace)
    } else {
      console.log('All plots saved successfully.');
    }
  }

  //store all trees - Namrata
  static async storeTrees(saplingsDocs) {
    //console.log("------called storeTrees------")
    const treesInLocalDBFormat = saplingsDocs.map(doc => {
      return {
        saplingid: doc.sapling_id,
      };
    });
    let failure = false;
    //console.log('length in storeTrees : ', treesInLocalDBFormat.length);

    try {
      await this.localdb.updateSaplingTbl(treesInLocalDBFormat);
    } catch (error) {
      console.log('Failed to save saplings : ', error);
      failure = true;
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to save saplings(inside Utils)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await this.logException(JSON.stringify(errorLog));
    }

    if (failure) {
      ToastAndroid.show(Strings.alertMessages.FailureSavingSaplings);
    } else {
      console.log('All saplings saved successfully.');
    }
  }

  static async deleteSyncedTrees() {
    let newTreesList = await this.localdb.deleteSyncedTrees();
    newTreesList = await Promise.all(
      newTreesList.map(async tree => {
        return await Utils.formatLocalTreeToJSON(tree);
      }),
    );
    return newTreesList;
  }

  static getDisplayString = (index, capturetimestamp, length) => {
    const indexString = `(${index + 1} of ${length})\n`;
    const captureString =
      Strings.messages.CapturedAt +
      ' :\n' +
      Utils.getReadableDate(capturetimestamp);
    const displayString = `${indexString} ${captureString}`;
    return displayString;
  };

  static getReadableDate(date) {
    //string arg
    const epochMilliseconds = Date.parse(date);
    if (isNaN(epochMilliseconds)) {
      return date;
    }
    const dateObj = new Date(date);
    const dateStr = dateObj.toDateString().split(' ').slice(1).join(' '); //remove day
    const timeStr = dateObj.toTimeString().split(':').slice(0, -1).join(':'); //remove seconds
    return dateStr + ', ' + timeStr;
  }

  static async getSyncCounts() {
    const pending = (await Utils.fetchTreesFromLocalDB(0)).length;
    const uploaded = (await Utils.fetchTreesFromLocalDB(1)).length;
    return {pending, uploaded};
  }

  //realm image
  static async imageUpload(image){
    try{
    let response = await DataService.uploadImagesRealm(image);
    if(response){
      return response.url
    }
    } catch (error) {
      console.error(error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to upload image to S3 fro realm(inside Utils)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await this.logException(JSON.stringify(errorLog));
    }
  }

  static async batchUpload(batch) {
    let failures = batch;
    //console.log('______----------______batch____------________', batch);
    try {
      let response = await DataService.uploadTrees(batch);
      //console.log('response from uploadTrees: ', response);
      if (response) {
        failures = await Utils.setTreeSyncStatus(response, batch);
        console.log('batch failures: ', failures);
      }
    } catch (error) {
      console.error(error);
      const stackTrace = error.stack;
      const errorLog = {
        msg: 'happened while trying to batchUpload(inside Utils)',
        error: JSON.stringify(error),
        stackTrace: stackTrace,
      };
      await this.logException(JSON.stringify(errorLog));
    }
    return failures;
  }

  static async setLastSyncDateNow() {
    const currentTime = new Date().toString();
    await AsyncStorage.setItem(Constants.syncDateKey, currentTime);
  }
  static async getLastSyncDate() {
    return await AsyncStorage.getItem(Constants.syncDateKey);
  }
  static async upload(onProgress = undefined) {
    const final = await Utils.fetchTreesFromLocalDB(0); //array of objects - trees with images
    console.log('Attempting upload with total trees = ', final.length);
    const failures = [];
    for (let i = 0; i < final.length; i += MIN_BATCH_SIZE) {
      const batchFailures = await Utils.batchUpload(
        final.slice(i, i + MIN_BATCH_SIZE),
      );
      failures.push(...batchFailures);
      if (onProgress) {
        onProgress(i / final.length);
      }
    }
    await Utils.setLastSyncDateNow();
    if (failures.length === 0) {
      Alert.alert(
        Strings.alertMessages.SyncSuccess,
        Strings.alertMessages.CheckLocalList,
      );
    } else {
      Alert.alert(
        Strings.alertMessages.SyncFailure,
        Strings.alertMessages.ContactExpert,
      );
    }
    return failures;
  }

  static userId;
  static adminId;
  static localdb;
  // static lang;
  static async setTreeSyncStatus(statuses, batch) {
    const failures = [];
    for (let tree of batch) {
      const status = statuses[tree.sapling_id];
      if (status && status.dataUploaded) {
        await this.localdb.updateUpload(tree.sapling_id);
      } else {
        failures.push(tree.sapling_id);
      }
    }
    return failures;
  }

  static async fetchTreesFromLocalDB(uploaded = undefined) {
    let res;
    if (uploaded !== undefined) {
      res = await this.localdb.getTreesByUploadStatus(uploaded);
    } else {
      res = await this.localdb.getAllTrees();
      //console.log(res);
    }

    // console.log(res);
    var final = [];
    for (let index = 0; index < res.length; index++) {
      let tree = await Utils.formatLocalTreeToJSON(res[index]);
      final.push(tree);
    }
    return final;
  }
  static async formatLocalTreeToJSON(element) {
    // if lat or lng is null, change it to 0
    if (element.lat === 'undefined') {
      element.lat = 0;
    }
    if (element.lng === 'undefined') {
      element.lng = 0;
    }
    console.log(element.lat, element.lng);
    let images = await this.localdb.getTreeImages(element.sapling_id);
    for (let index = 0; index < images.length; index++) {
      //console.log(images[index].name);
    }
    // console.log("_______________________",element);
    const tree = {
      sapling_id: element.sapling_id,
      type_id: element.type_id,
      plot_id: element.plot_id,
      coordinates: [element.lat, element.lng],
      images: images,
      uploaded: element.uploaded === 1,
    };
    if (element.uploaded !== undefined) {
      tree.uploaded = element.uploaded === 1;
    }
    tree.user_id = await this.getUserId();
    return tree;
  }

  static async setDBConnection() {
    if (!this.localdb.db) {
      await this.localdb.getDBConnection();
    }
    return this.localdb;
  }
  static async treeTypeFromID(treeTypeID) {
    //both ids are numbers of type string.
    const treeNames = await this.localdb.getTreeTypes();
    const requiredTreeType = treeNames.find(tree => tree.value === treeTypeID);
    return requiredTreeType;
  }

  static async treeTypeFromObjectID(treeTypeObjectId) {
    //both ids are object ids.
    const treeNames = await this.localdb.getTreeTypes();
    //console.log("-----------------objectId from Edit Tree------------",typeof treeTypeObjectId,"-----type from treeNames----",typeof treeNames[0]._id)
    const requiredTreeType = treeNames.find(tree => tree._id === treeTypeObjectId.toString());
    return requiredTreeType;
  }

  static async plotFromPlotID(plotID) {
    //both ids are numbers of type string.
    const plots = await this.localdb.getAllPlots();
    //console.log("---plot-----",typeof plotID,"-----------plots--------",typeof plots[0].value)
   
    const requiredPlot = plots.find(plot => plot.value === plotID);
    //(requiredPlot);
    return requiredPlot;
  }

  static async plotFromObjectID(plotObjectId) {
    //both ids are object ids.
    const plots = await this.localdb.getAllPlots();
    //console.log("---plotObjectId-----",plotObjectId,"----------------plots------------",plots)
    const requiredPlot = plots.find(plot => plot._id === plotObjectId.toString());
    return requiredPlot;
  }

  static async fetchTreeTypesFromLocalDB() {
    let res = await this.localdb.getTreeTypesUsedByLocalTrees();
    return res;
  }

  static async fetchPlotNamesFromLocalDB() {
    let res = await this.localdb.getPlotNamesUsedByLocalTrees();
    return res;
  }

  static async fetchSaplingIdsFromLocalDB() {
    let res = await this.localdb.getSaplingIds();
    return res;
  }

  static async getUserId() {
    return await AsyncStorage.getItem(Constants.userIdKey);
  }

  static async getAdminId() {
    return await AsyncStorage.getItem(Constants.adminIdKey);
  }

  static async getLastHash() {
    return await AsyncStorage.getItem(Constants.lastHashKey);
  }

  static async getImage(compressionRequired = false, selectionId) {
    console.log('-------called getImage------');
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 960,
      maxWidth: 720,
    };

    let response = {};
    if (selectionId === 0) {
      console.log('-----launching camera--------');
      response = await launchCamera(options);
      //console.log('-----in getImage-----', response);
    } else {
      response = await launchImageLibrary(options);
    }

    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      //('ImagePicker Error: ', response.error);
    } else {
      const timestamp = new Date().toISOString(); // only show time and not date
      let filesz = response.assets[0].fileSize;
      let base64Data = response.assets[0].base64;

      let imagePath = response.assets[0].uri;

      //console.log('response.assets[0]----', filesz);

      if (compressionRequired) {
        const compressedData = await Utils.compressImageAt(filesz, imagePath);
        //console.log("compressedData: ", compressedData.size);
        if (compressedData) {
          base64Data = compressedData;
        } else {
          console.log('could not compressed------');
        }
      }
      const newImage = {
        data: base64Data,
        meta: {
          capturetimestamp: timestamp,
          remark: Strings.messages.defaultRemark,
        },
      };

      return newImage;
      //return { newImage: newImage, imageForModal: imageForModal };
    }
  }
  static async formatImageForSapling(image, saplingid) {
    let newImage = {...image};
    newImage.saplingid = saplingid;
    const timestamp = newImage.meta.capturetimestamp;
    const imageName = `${saplingid}_${timestamp}.jpg`;
    newImage.name = imageName;
    newImage.size = newImage.size;
    return newImage;
  }

  static async compressImageAt(filesz, imagePath) {
    //console.log('Original file size:', filesz);
    const maxsz = 1024 * 900; // 900 KB ->

    if (filesz > maxsz) {
      //console.log('File size exceeds maxsz:', maxsz);

      // Initialize quality parameters
      let minQuality = 1; // Minimum quality
      let maxQuality = 100; // Maximum quality
      let compressedQuality = 100; // Initial quality

      // Binary search to find optimal quality
      while (maxQuality - minQuality > 1) {
        compressedQuality = Math.floor((minQuality + maxQuality) / 2);

        // Compress the image
        const resizedImage = await ImageResizer.createResizedImage(
          imagePath,
          960, // Target width
          720, // Target height
          'JPEG', // Format
          compressedQuality, // Quality
        );

        const resizedImageSize = resizedImage.size;
        //('resizedImage----:', resizedImageSize);

        if (resizedImageSize > maxsz) {
          // Image size is still too large, reduce quality
          maxQuality = compressedQuality;
        } else {
          // Image size is within limits, increase quality
          minQuality = compressedQuality;
        }
      }

      // Final compressed image
      const finalResizedImage = await ImageResizer.createResizedImage(
        imagePath,
        960, // Target width
        720, // Target height
        'JPEG', // Format
        minQuality, // Final quality
      );

      const finalResizedImagePath = finalResizedImage.uri;

      try {
        // Read the final compressed image file as base64
        const base64Data = await RNFS.readFile(finalResizedImagePath, 'base64');
        //console.log('Final resized image:', finalResizedImage.size);
        //console.log('Off factor:', maxsz / finalResizedImage.size);
        return base64Data;
      } catch (error) {
        // Handle any errors while reading the file
        console.error('Error reading file:', error);
        const stackTrace = error.stack;
        const errorLog = {
          msg: 'Error occurred while trying to read base64 image file (inside Utils)',
          error: JSON.stringify(error),
          stackTrace: stackTrace,
        };
        await this.logException(JSON.stringify(errorLog));
        return null; // Return null if there's an error
      }
    }

    return null; // Return null if file size is already within limit
  }
}

export class Constants {
  static userIdKey = 'userid';
  static userDetailsKey = 'userobj';
  static adminIdKey = 'adminid';
  static phoneNumber = 'phoneNo';
  static lastHashKey = 'lasthash';
  static hashForPlotSaplingsKey = 'hashForPlotSaplings';
  static appRootTagKey = 'rootTag';
  static syncDateKey = 'date';
  static treeFormTemplateData = {
    inSaplingId: null,
    inLat: 0,
    inLng: 0,
    inImages: [],
    inPlot: null,
    inTreeType: null,
    inUserId: '',
  };
  static selectedLangKey = 'LANG';
  static logoImage() {
    return require('../../assets/logo.png');
  }
  static placeholderImage() {
    return require('../../assets/placeholder1.png');
  }
}

export const getImageSourceObject = src => {
  if (src.length === 0) {
    return Constants.placeholderImage();
  } else if (src.startsWith('http')) {
    return {uri: src};
  }
  console.log('image src was unexpected.');
  return Constants.placeholderImage();
};
