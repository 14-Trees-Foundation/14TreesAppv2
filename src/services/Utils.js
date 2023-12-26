import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchCamera, } from 'react-native-image-picker';
import { Alert, StyleSheet, ToastAndroid } from "react-native";
import { DataService } from "./DataService";
import { LocalDatabase } from "./tree_db";
import RNRestart from 'react-native-restart';
import { Strings } from "./Strings";
import ImageResizer from "react-native-image-resizer";
import RNFS from 'react-native-fs';
const MIN_BATCH_SIZE = 5
export class Utils {
    static localdb = new LocalDatabase();
    static async storeLog(type,details){
        if(typeof details === "object"){
            details = JSON.stringify(details);
        }
        //store log locally.
        const log = {
            type:type,//integer
            details:details//text
        }
        await this.localdb.storeLog(log);
        console.log('stored log: ',log);
        //asynchronous sync request:
        Utils.syncLogs();
    }
    
    
    static async syncLogs() {
        if (await DataService.serverAvailable()) {
            const userId = await Utils.getUserId();
            const logs = await this.localdb.getAllLogs();
            console.log('sending logs: ', logs, userId);
            const response = await DataService.sendLogs(userId, logs);
            if (response.status === 200) {
                //assumes all logs done successfully.
                const localIds = (logs).map((log) => log.localid);
                await this.localdb.deleteLogs(localIds);
            }
        }
    }

    static async getLocalTreeTypesAndPlots() {
        let treeTypes = await this.localdb.getAllTreeTypes();
        let plots = await this.localdb.getAllPlots();
        return { treeTypes, plots };
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
        await this.localdb.createTreesTable();
        await this.localdb.createSaplingPlotTbl();
        await this.localdb.createLogsTable();

    }
    static async fetchAndStoreHelperData(preRequest,onError,preStore,duringStore,onComplete) {
        console.log('fetching helper data');
        // console.log('ldb: ', this.localdb)
        preRequest();
        let lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting: ', userId, lastHash)
        //setStatus(requesting)
        const helperData = await DataService.fetchHelperData(userId, lastHash);
        if (!helperData) {
            onError();
            return;//error display, logging done by DataService.
        }
        preStore();

        const data = helperData.data['data'];
        const newHash = helperData.data['hash'];
        if (newHash == lastHash) {
            ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG)
            onComplete();
            return;
        }
        if (data) {
            await Utils.storeTreeTypes(data['treeTypes'],duringStore);
            preStore();
            await Utils.storePlots(data['plots'],duringStore);
            await AsyncStorage.setItem(Constants.lastHashKey, newHash);
            ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG)
            onComplete();
            return;
        }
        onError();
    }

    static async fetchAndStorePlotSaplings(preRequest,onError,preStore,duringStore,onComplete) {
        // await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey,'blah');
        // return;
        console.log('pre request');
        preRequest();
        let lastHash = await AsyncStorage.getItem(Constants.hashForPlotSaplingsKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting plot saps: ', userId, lastHash)
        const plotSaplingsData = await DataService.fetchPlotSaplings(userId, lastHash);
        if (!plotSaplingsData) {
            onError();
            //logging to server handled by interceptor in Dataservice.
            return;//error display, logging done by DataService.
        }
        preStore();
        // console.log(plotSaplingsData.data)
        const newHash = plotSaplingsData.data['hash'];
        const jsondata = plotSaplingsData.data['data'];
        console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
        console.log(newHash, 'is the new hash.');

        if (newHash === lastHash) {
            console.log('hashes match, returning.')
            ToastAndroid.show(Strings.alertMessages.plotSaplingsDataUpToDate, ToastAndroid.LONG)
            onComplete();
            return;
        }
        if (jsondata) {
            console.log('Storing Json data...')
            
            await Utils.storePlotSaplingData(jsondata,duringStore);
            console.log('data stored.')
            await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey, newHash);
            console.log('setting hash: ', newHash);
            ToastAndroid.show(Strings.alertMessages.plotSaplingsDataUpToDate, ToastAndroid.LONG)
            onComplete();
            return;
        }
        console.log('data was null.');
        onError();
    }

    static async storePlotSaplingData(jsondata,duringStore) {
        let plotIndex = 0;
        let totalPlots = jsondata.length;
        await Promise.all(jsondata.map(async (plot) => {
            await this.localdb.storePlotSaplings(plot.plot_id, plot.saplings);
            plotIndex+=1;
            if(plotIndex % 5 == 0){
                duringStore(plotIndex/totalPlots);
            }
        }));
    }

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


    static async storeTreeTypes(treeTypes,duringStore) {
        // console.log(treeTypes[0])
        const treeTypesInLocalDBFormat = treeTypes.map((treeType) => {
            return {
                name: treeType.name,
                tree_id: treeType.tree_id
            }
        })
        let failure = false;
        let treeIndex = 0;
        let totalTrees = treeTypesInLocalDBFormat.length;
        for (let dbTreeType of treeTypesInLocalDBFormat) {
            try {
                await this.localdb.updateTreeTypeTbl(dbTreeType);
                treeIndex+=1;
                if(treeIndex % 5 == 0){
                    duringStore(treeIndex/totalTrees);
                }
            }
            catch (err) {
                let errorLog = `Failed to save treeType: ${JSON.stringify(dbTreeType)}.`;
                await Utils.storeLog(LOGTYPES.LOCAL_ERROR,errorLog)
                console.log(errorLog);
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
    static async storePlots(plots,duringStore) {
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
        let plotIndex = 0;
        let totalPlots = plotsInLocalDBFormat.length;
        let failure = false;
        for (let dbPlot of plotsInLocalDBFormat) {
            try {
                await this.localdb.updatePlotTbl(dbPlot);
                plotIndex+=1;
                if(plotIndex % 5 ==0){
                    duringStore(plotIndex/totalPlots);
                }
            }
            catch (err) {
                let errorLog = `Failed to save plot: ${JSON.stringify(dbPlot)}`
                await Utils.storeLog(errorLog);
                console.log(errorLog);
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
    static async deleteSyncedTrees() {
        let newTreesList = await this.localdb.deleteSyncedTrees();
        newTreesList = await Promise.all(newTreesList.map(async (tree) => {
            return await Utils.formatLocalTreeToJSON(tree);
        }))
        return newTreesList;
    }
    static getDisplayString = (index, capturetimestamp,length) => {
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
        await this.setLastFetchedDateNowByKey(Constants.syncDateKey);
    }
    static async getLastSyncDate() {
        return await this.getLastFetchedDateByKey(Constants.syncDateKey);
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
            if(compressionRequired){
                const compressedData = await Utils.compressImageAt(filesz, imagePath);
                if(compressedData!==undefined){
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
    static async formatImageForSapling(image,saplingid){
        let newImage = {...image}
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
    static async getLastFetchedDateByKey(dateKey){
        return await AsyncStorage.getItem(dateKey);
    }
    static async setLastFetchedDateNowByKey(dateKey){
        let now = (new Date()).toString();
        await AsyncStorage.setItem(dateKey,now);
    }
    static async getLastFetchedHelperData(){
        return await this.getLastFetchedDateByKey(Constants.helperDataLastFetchedKey);
    }
    static async getLastFetchedPlotSaplingData(){
        return await this.getLastFetchedDateByKey(Constants.plotSaplingDataLastFetchedKey);
    }
    static async setLastFetchedHelperDataNow(){
        await this.setLastFetchedDateNowByKey(Constants.helperDataLastFetchedKey);
    }
    static async setLastFetchedPlotSaplingDataNow(){
        await this.setLastFetchedDateNowByKey(Constants.plotSaplingDataLastFetchedKey);
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
    static helperDataLastFetchedKey = 'helperDataLastFetched';
    static plotSaplingDataLastFetchedKey = 'plotSaplingDataLastFetched';
    static treeFormTemplateData = { inSaplingId: null, inLat: 0, inLng: 0, inImages: [], inPlot: null, inTreeType: null, inUserId: '' }
    static selectedLangKey = 'LANG';
    static logoImage() {
        return require('../../assets/logo.png');
    }
    static placeholderImage() {
        return require('../../assets/placeholder.png');
    }
    static timeout1 = 2000
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

export const commonStyles = StyleSheet.create({
    label: {
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 5,
        fontSize: 15,
        alignContent: 'center',
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 5,
        margin: 5
    },
    success: {
        backgroundColor: 'green',
    },
    danger: {
        backgroundColor: 'red',
    },
    iconBtn: {
        padding: 8,
        margin: 5,
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center'
    },
    borderedDisplay: {
        borderColor: 'grey', borderWidth: 3, borderRadius: 5, margin: 3, padding: 3
    },
    defaultButtonStyle: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        fontSize: 40,
        borderColor: 'gray',
        borderWidth: 3,
        backgroundColor: 'green',
        margin: 5,
        padding: 10,
        borderRadius: 5,
        shadowColor: 'black',
        elevation: 3,
        shadowOffset: {
            width: 50,
            height: 50
        },
        shadowOpacity: 1
    },
    defaultButtonTextStyle: {
        color: 'white',
        textAlign: 'center'
    },
    drawerHeader: {
        backgroundColor: '#5DB075',
    },
    headerTitleStyle: {
        color: 'white'
    },
    logOutButton: {
        color: 'white',
        bottom: 0
    },
    remark: {
        height: 70,
        borderWidth: 0.5,
        borderColor: 'grey',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        margin: 5,
        padding: 5,
        color: 'black', // Change font color here
        fontSize: 16,
    },
    btnview: {
        justifyContent: 'center',
        elevation: 3,
        marginHorizontal: 20,
        marginVertical: 10,
    },
    btn: {
        paddingHorizontal: 20,
        borderRadius: 9,
        backgroundColor: '#1f3625',
        alignItems: 'center',
        paddingVertical: 12,
        height: 50,
    },
    btndisabled: {
        paddingHorizontal: 20,
        borderRadius: 9,
        backgroundColor: '#686868',
        alignItems: 'center',
        paddingVertical: 12,
        height: 50,
    },
    text: {
        fontSize: 14,
        color: 'black',
        textAlign: 'left',
    },
    text2: {
        fontSize: 25,
        color: 'white',
        textAlign: 'center',
        marginVertical: 5,
        marginBottom: 40,
    },
    recordTxt: {
        fontSize: 18,
        color: '#1f3625',
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'center',
    },
    btntxt: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
    },
    text4: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        padding: 5,
    },
    text5: {
        fontSize: 20,
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        color: 'black'
    },
    text3: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
    },
    text6: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        backgroundColor: 'white',
        borderRadius: 3
    },
    txtInput: {
        height: 60,
        width: 310,
        borderWidth: 0.5,
        borderColor: 'grey',
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
        marginBottom: 10,
        padding: 10,
        color: 'black', // Change font color here
        fontSize: 16,
        fontWeight: 'bold',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    headerText: {
        fontSize: 30, color: 'white', textAlign: 'center', marginTop: 30, marginBottom: 30, fontFamily: 'cochin', fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    }
});
export const styleConfigs = {
    drawerHeaderOptions: {
        headerStyle: commonStyles.drawerHeader,
        headerTitleStyle: commonStyles.headerTitleStyle,
        headerTintColor: commonStyles.headerTitleStyle.color
    }
}
export const LOGTYPES = {
    INFO:0,//control flow details.
    LOCAL_ERROR:1,//errors due to local functions.
    API_ERROR:2,//errors in endpoints
    OTHER_ERROR:3,//other errors.
    GPS_ERROR:4,//gps related errors.
    SERVERSIDE_ERROR:5,//used on the server side ONLY.
}