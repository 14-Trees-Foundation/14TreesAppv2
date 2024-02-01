import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchCamera, } from 'react-native-image-picker';
import { Alert, ToastAndroid } from "react-native";
import { DataService } from "./DataService";
import { LocalDatabase } from "./tree_db";
import RNRestart from 'react-native-restart';
import { Strings } from "./Strings";
import ImageResizer from "react-native-image-resizer";
import RNFS from 'react-native-fs';

const MIN_BATCH_SIZE = 5

export class Utils {
    static localdb = new LocalDatabase();
//treeTypes and PLots
    static async getLocalTreeTypesAndPlots() {
        let treeTypes = await this.localdb.getAllTreeTypes();
        let plots = await this.localdb.getAllPlots();
        return { treeTypes, plots };
    }

    //Namrata
    static async fetchSaplingIdsFromLiveDB() {
        let saplings = await this.localdb.getAllSaplingsInLiveDB();
        return saplings;
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
        await this.localdb.saveTree(tree, 0);
        for (let index = 0; index < images.length; index++) {
            const element = {
                saplingid: tree.saplingid,
                image: images[index].data,
                imageid: images[index].name,
                remark: images[index].meta.remark,
                timestamp: images[index].meta.capturetimestamp,
            };
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

    static async confirmAction(onConfirm, title = undefined, message = undefined) {
        if (!title) {
            title = Strings.alertMessages.ConfirmActionTitle;
        }
        if (!message) {
            message = Strings.alertMessages.ConfirmActionMsg;
        }
        Alert.alert(title, message, [
            {
                text: Strings.alertMessages.Yes,
                onPress: () => onConfirm()
            },
            {
                text: Strings.alertMessages.No,
                onPress: () => null
            }
        ])
    }
    static async createLocalTablesIfNeeded() {
        // console.log('creating tables if needed.', this.localdb)
        await this.localdb.createTreetTypesTbl();
        await this.localdb.createPlotTbl();
        await this.localdb.createSaplingTbl();
        await this.localdb.createTreesTable();
        await this.localdb.createSaplingPlotTbl();

    }

//Namrata

   
    static async fetchAndStoreHelperData() {
        console.log('fetching helper data in Utils');
        // console.log('ldb: ', this.localdb)
        let lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting: ', userId, lastHash)
        //setStatus(requesting)
        
        const helperData = await DataService.fetchHelperData(userId, lastHash);

        console.log("userId ",userId,"lastHash ",lastHash)
        if (!helperData) {
            //setStatus(request failed)
            return;//error display, logging done by DataService.
        }
        // setStatus(storing)
        const data = helperData.data['data'];      
        const newHash = helperData.data['hash'];
        console.log("newHash ",newHash)
        if (newHash == lastHash) {
            console.log("---------------------------newHash == lastHash-------------")
            ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG)
            // setStatus(Data updated)
            return;
        }
        if (data) {
            console.log("---------------------------New Data-------------")
           
            await Utils.storeTreeTypes(data['treeTypes']);
            await Utils.storePlots(data['plots']);
            console.log("data['saplings'] :" ,data['saplings'].length)
            await Utils.storeTrees(data['saplings'])     
            await AsyncStorage.setItem(Constants.lastHashKey, newHash);
            ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG)
            // setstatus(data updated)
            return;
        }
        // setstatus(failed)
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
            console.log('example: ', saplings[0]);
        }
        return saplings;
    }


    static async storeTreeTypes(treeTypes) {
        // console.log(treeTypes[0])
        const treeTypesInLocalDBFormat = treeTypes.map((treeType) => {
            return {
                name: treeType.name,
                tree_id: treeType.tree_id
            }
        })
        let failure = false;
        for (let dbTreeType of treeTypesInLocalDBFormat) {
            try {
                await this.localdb.updateTreeTypeTbl(dbTreeType);
            }
            catch (err) {
                console.log('Failed to save treeType: ', dbTreeType);
                console.log(err)
                failure = true;
            }
        }
        if (failure) {
            ToastAndroid.show(Strings.alertMessages.FailureSavingTrees);
        }
        else {
            console.log('All tree types saved successfully.')
        }
    }
    static async storePlots(plots) {
        // console.log(plots[0])
        const plotsInLocalDBFormat = plots.map((plot) => {
            if (plot.name) {
                plot.name = plot.name.replace("'", "''");
            }
            return {
                name: plot.name,
                plot_id: plot.plot_id
            }
        })
        let failure = false;
        for (let dbPlot of plotsInLocalDBFormat) {
            try {
                await this.localdb.updatePlotTbl(dbPlot);
            }
            catch (err) {
                console.log('Failed to save plot: ', dbPlot);
                console.log(err)
                failure = true;
            }
        }
        if (failure) {
            ToastAndroid.show(Strings.alertMessages.FailureSavingPlots);
        }
        else {
            console.log('All plots saved successfully.')
        }
    }

    //store all trees - Namrata
    static async storeTrees(saplingsDocs) {
        
        const treesInLocalDBFormat = saplingsDocs.map((doc) => {
            return {
                saplingid: doc.sapling_id,
            }
        })
        let failure = false;
        console.log("length in storeTrees : ",treesInLocalDBFormat.length)
        
            try {
                await this.localdb.updateSaplingTbl(treesInLocalDBFormat);
                
            }
            catch (err) {
                console.log('Failed to save saplings : ',err);
                failure = true;
            }
        
        
        if (failure) {
            ToastAndroid.show(Strings.alertMessages.FailureSavingSaplings);
        }
        else {
            console.log('All saplings saved successfully.')
        }
    }


    static async deleteSyncedTrees() {
        let newTreesList = await this.localdb.deleteSyncedTrees();
        newTreesList = await Promise.all(newTreesList.map(async (tree) => {
            return await Utils.formatLocalTreeToJSON(tree);
        }))
        return newTreesList;
    }

    static getDisplayString = (index, capturetimestamp, length) => {
        const indexString = `(${index + 1} of ${length})\n`;
        const captureString = Strings.messages.CapturedAt + ' :\n' + Utils.getReadableDate(capturetimestamp);
        const displayString = `${indexString} ${captureString}`;
        return displayString;
    }
    static getReadableDate(date) {//string arg
        const epochMilliseconds = Date.parse(date);
        if (isNaN(epochMilliseconds)) {
            return date;
        }
        const dateObj = new Date(date);
        const dateStr = dateObj.toDateString().split(' ').slice(1).join(' ');//remove day
        const timeStr = dateObj.toTimeString().split(':').slice(0, -1).join(':');//remove seconds
        return dateStr + ', ' + timeStr;
    }
    static async getSyncCounts() {
        const pending = (await Utils.fetchTreesFromLocalDB(0)).length;
        const uploaded = (await Utils.fetchTreesFromLocalDB(1)).length;
        return { pending, uploaded };
    }
    static async batchUpload(batch) {
        let failures = batch;
        try {
            let response = await DataService.uploadTrees(batch);
            if (response) {
                failures = await Utils.setTreeSyncStatus(response, batch);
                console.log('batch failures: ', failures);
            }
        }
        catch (error) {
            console.error(error);
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
        const final = await Utils.fetchTreesFromLocalDB(0);//not uploaded.
        console.log('Attempting upload with total trees = ', final.length);
        const failures = [];
        for (let i = 0; i < final.length; i += MIN_BATCH_SIZE) {
            const batchFailures = await Utils.batchUpload(final.slice(i, i + MIN_BATCH_SIZE));
            failures.push(...batchFailures);
            if (onProgress) {
                onProgress(i / final.length);
            }
        }
        await Utils.setLastSyncDateNow();
        if (failures.length === 0) {
            Alert.alert(Strings.alertMessages.SyncSuccess, Strings.alertMessages.CheckLocalList);
        }
        else {
            Alert.alert(Strings.alertMessages.SyncFailure, Strings.alertMessages.ContactExpert);
        }
        return failures;
    };

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
            }
            else {
                failures.push(tree.sapling_id);
            }
        }
        return failures;

    }

    static async fetchTreesFromLocalDB(uploaded = undefined) {
        let res;
        if (uploaded !== undefined) {
            res = await this.localdb.getTreesByUploadStatus(uploaded);
        }
        else {
            res = await this.localdb.getAllTrees();
            console.log(res)
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
            console.log(images[index].name);
        }
        // console.log(element);
        const tree = {
            sapling_id: element.sapling_id,
            type_id: element.type_id,
            plot_id: element.plot_id,
            coordinates: [element.lat, element.lng],
            images: images,
            uploaded: (element.uploaded === 1)
        };
        if (element.uploaded !== undefined) {
            tree.uploaded = (element.uploaded === 1);
        }
        tree.user_id = await this.getUserId();
        return tree;
    }

    static async setDBConnection() {
        if (!(this.localdb.db)) {
            await this.localdb.getDBConnection();
        }
        return this.localdb;
    }
    static async treeTypeFromID(treeTypeID) {
        //both ids are numbers of type string.
        const treeNames = await this.localdb.getTreeTypes();
        const requiredTreeType = treeNames.find((tree) => (tree.value === treeTypeID));
        return requiredTreeType;
    }
    static async plotFromPlotID(plotID) {
        //both ids are numbers of type string.
        const plots = await this.localdb.getAllPlots();
        const requiredPlot = plots.find((plot) => (plot.value === plotID));
        console.log(requiredPlot)
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
    static async getImageFromCamera(compressionRequired = false) {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 200,
            maxWidth: 200,
        };

        const response = await launchCamera(options);
        console.log('from launch camera: ', response)
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        } else {
            // const { fileSize } = response.assets[0];
            // 
            const timestamp = new Date().toISOString();
            // only show time and not date
            const filesz = response.assets[0].fileSize;
            let base64Data = response.assets[0].base64;
            let imagePath = response.assets[0].uri;
            if (compressionRequired) {
                const compressedData = await Utils.compressImageAt(filesz, imagePath);
                if (compressedData !== undefined) {
                    base64Data = compressedData;
                }
            }
            const newImage = {
                data: base64Data,
                meta: {
                    capturetimestamp: timestamp,
                    remark: Strings.messages.defaultRemark,
                }
            };
            return newImage;
        }
    }
    static async formatImageForSapling(image, saplingid) {
        let newImage = { ...image }
        newImage.saplingid = saplingid;
        const timestamp = newImage.meta.capturetimestamp;
        const imageName = `${saplingid}_${timestamp}.jpg`;
        newImage.name = imageName;
        return newImage;
    }
    static async compressImageAt(filesz, imagePath) {
        console.log("original file size: ", filesz);
        let maxsz = 1024 * 10;
        let base64Data;
        if (filesz > maxsz) {
            // let compressedQuality = -5.536/10000000*filesz*filesz + 0.0128*filesz + 100;
            let compressedQuality = -0.00166 * filesz + 129.74;
            // let compressedQuality = 93;
            if (filesz < 17000) {
                if (filesz < 14000) {
                    compressedQuality = 98;
                }
                else if (filesz < 15500) {
                    compressedQuality = 97;
                }
                else if (filesz < 17000) {
                    compressedQuality = 96;
                }

            }

            if (compressedQuality < (maxsz / filesz) * 100) {
                compressedQuality = (maxsz / filesz) * 100;

            }

            // const compressedQuality = 75;
            console.log("compressed quality: ", compressedQuality);
            const resizedImage = await ImageResizer.createResizedImage(
                imagePath,
                200,
                200,
                'JPEG',
                compressedQuality
            );
            const resizedImagePath = resizedImage.uri;
            try {
                base64Data = await RNFS.readFile(resizedImagePath, 'base64');
            }
            catch (error) {
                // Handle any errors while reading the file
                console.error('Error reading file:', error);
            };
            console.log("resized image: ", resizedImage.size);
            console.log('off factor', maxsz / resizedImage.size);
        }
        return base64Data;
    }
}

export class Constants {
    static userIdKey = 'userid';
    static userDetailsKey = 'userobj';
    static adminIdKey = 'adminid';
    static lastHashKey = 'lasthash';
    static hashForPlotSaplingsKey = 'hashForPlotSaplings';
    static appRootTagKey = 'rootTag';
    static syncDateKey = 'date';
    static treeFormTemplateData = { inSaplingId: null, inLat: 0, inLng: 0, inImages: [], inPlot: null, inTreeType: null, inUserId: '' }
    static selectedLangKey = 'LANG';
    static logoImage() {
        return require('../../assets/logo.png');
    }
    static placeholderImage() {
        return require('../../assets/placeholder.png');
    }
}

export const getImageSourceObject = (src) => {
    if (src.length === 0) {
        return Constants.placeholderImage();
    }
    else if (src.startsWith('http')) {
        return { uri: src }
    }
    console.log('image src was unexpected.')
    return Constants.placeholderImage()
}
