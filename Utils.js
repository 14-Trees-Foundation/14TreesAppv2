import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, ToastAndroid, StyleSheet, RootTagContext } from "react-native";
import { DataService } from "./DataService";
import { LocalDatabase } from "./tree_db";
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { Strings } from "./Strings";
import RNRestart from 'react-native-restart';
import DummyData from "./DummyData";

// Your app's root component
import App from './App'; // Replace with the actual path to your app's root component
const MIN_BATCH_SIZE = 5
export class Utils {
    static localdb = new LocalDatabase();
    static async getLocalTreeTypesAndPlots(){
        let treeTypes = await this.localdb.getTreesList();
        let plots = await this.localdb.getPlotsList();
        return {treeTypes,plots};
    }
    static async saveTreeAndImagesToLocalDB(tree,images){
        await this.localdb.saveTrees(tree, 0);
        for (let index = 0; index < images.length; index++) {
            const element = {
            saplingid: images[index].saplingid,
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
        // let rootTag = await Utils.getAppRootTag();
        // console.log('app root tag:',(rootTag))
        // // AppRegistry.unmountApplicationComponentAtRootTag(rootTag);
        // // const response = AppRegistry.registerComponent(appName, () => App);
        // // console.log(response,' from register')
        // // rootTag = await Utils.getAppRootTag();
        // console.log(rootTag, 'root tag post unmount');
        // AppRegistry.runApplication(appName,{rootTag: rootTag}); 
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

    }
    static async fetchAndStoreHelperData() {
        console.log('fetching helper data');
        // console.log('ldb: ', this.localdb)
        let lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting: ', userId, lastHash)
        const helperData = await DataService.fetchHelperData(userId, lastHash);
        if (!helperData) {
            return;//error display, logging done by DataService.

        }
        const data = helperData.data['data'];
        const newHash = helperData.data['hash'];
        if (newHash == lastHash) {
            ToastAndroid.show(Strings.alertMessages.DataUptodate, ToastAndroid.LONG)
            return;
        }
        if (data) {
            await Utils.storeTreeTypes(data['treeTypes']);
            await Utils.storePlots(data['plots']);
            await AsyncStorage.setItem(Constants.lastHashKey, newHash);
        }
        else {
            console.log('data was null.');
        }
    }

    static async fetchAndStorePlotSaplings() {
        // await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey,'blah');
        // return;
        let lastHash = await AsyncStorage.getItem(Constants.hashForPlotSaplingsKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting plot saps: ', userId, lastHash)
        const plotSaplingsData = await DataService.fetchPlotSaplings(userId, lastHash);

        if (!plotSaplingsData) {
            return;//error display, logging done by DataService.
        }
        // console.log(plotSaplingsData.data)
        const newHash = plotSaplingsData.data['hash'];
        const jsondata = plotSaplingsData.data['data'];
        console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
        console.log(newHash, 'is the new hash.');

        if (newHash === lastHash) {
            console.log('hashes match, returning.')
            ToastAndroid.show(Strings.alertMessages.plotSaplingsDataUpToDate, ToastAndroid.LONG)
            return;
        }
        if (jsondata) {
            console.log('Storing Json data...')
            await Promise.all(jsondata.map(async (plot) => {
                await this.localdb.storePlotSaplings(plot.plot_id, plot.saplings);
                console.log(plot.plot_id,'plot stored.')
            }));
            console.log('data stored.')
            await AsyncStorage.setItem(Constants.hashForPlotSaplingsKey, newHash);
            console.log('setting hash: ', newHash);
        }
        else {
            console.log('data was null.');
        }

        //-----------------------------------------


        // const jsonData = DummyData;
        // console.log("got the data")
        // const jsondata = jsonData['data'];

        // console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
        // await Promise.all(jsondata.map(async (plot) => {
        //     const { plot_id, saplings } = plot;
        //     // console.log(plot_id);
        //     // console.log(saplings);
        //     await this.localdb.storePlotSaplings(plot_id, saplings);
        //     // console.log('plot stored.')
        // }));
        // console.log('data stored.')
    }

    static async deletePlotSaplings() {
        await this.localdb.deletePlotSaplings();
    }

    // just for testing purposes
    // static async storeplotsaptest() {
        // console.log('storing plot saplings', this.localdb);
        // const jsonData = DummyData;
        // console.log("got the data")
        // const jsondata = jsonData['data'];

        // console.log((jsondata ? (jsondata.length + 'is the data length') : 'jsondata null'))
        // await Promise.all(jsondata.map(async (plot) => {
        //     const { plot_id, saplings } = plot;
        //     // console.log(plot_id);
        //     // console.log(saplings);
        //     await this.localdb.storePlotSaplings(plot_id, saplings);
        //     // console.log('plot stored.')
        // }));
        // console.log('data stored.')
    // }

    static async getPlotSaplings(plotId) {
        console.log('getting plot saplings for ',plotId);
        const saplings = await this.localdb.getSaplingsforPlot(plotId);
        console.log(`# saplings : `,saplings.length);
        if(saplings.length>0){
            console.log('example: ',saplings[0]);
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
    static async deleteSyncedTrees() {
        const newTreesList = await this.localdb.deleteSyncedTrees();
        return newTreesList;
    }
    static getReadableDate(date){//string arg
        const epochMilliseconds = Date.parse(date);
        if(isNaN(epochMilliseconds)){
            return date;
        }
        const dateObj = new Date(date);
        const dateStr = dateObj.toDateString().split(' ').slice(1).join(' ');//remove day
        const timeStr = dateObj.toTimeString().split(':').slice(0,-1).join(':');//remove seconds
        return dateStr + ', ' + timeStr;
    }
    static async getSyncCounts(){
        const pending = (await Utils.fetchTreesFromLocalDB(0)).length;
        const uploaded = (await Utils.fetchTreesFromLocalDB(1)).length;
        return {pending,uploaded};
    }
    static async batchUpload(batch){
        let failures = batch;
        try {
            let response = await DataService.uploadTrees(batch);
            if (response) {
                failures = await Utils.setTreeSyncStatus(response,batch);
            }
        }
        catch (error) {
            console.error(error);
        }
        return failures;
    }
    static async setLastSyncDateNow(){
        const currentTime = new Date().toString();
        await AsyncStorage.setItem(Constants.syncDateKey, currentTime);
    }
    static async getLastSyncDate(){
        return await AsyncStorage.getItem(Constants.syncDateKey);
    }
    static async upload(onProgress=undefined) {
        const final = await Utils.fetchTreesFromLocalDB(0);//not uploaded.
        console.log('Attempting upload with total trees = ',final.length);
        const failures = [];
        for(let i=0;i<final.length;i+=MIN_BATCH_SIZE){
            const batchFailures = await Utils.batchUpload(final.slice(i,i+MIN_BATCH_SIZE));
            failures.push(...batchFailures);
            if(onProgress){
                onProgress(i/final.length);
            }
        }
        await Utils.setLastSyncDateNow();
        if(failures.length===0){
            Alert.alert(Strings.alertMessages.SyncSuccess, Strings.alertMessages.CheckLocalList);
        }
        else{
            Alert.alert(Strings.alertMessages.SyncFailure, Strings.alertMessages.ContactExpert);
        }
        return failures;
    };
    static userId;
    static adminId;
    static localdb;
    // static lang;
    static async setTreeSyncStatus(statuses,batch) {
        const failures = [];
        for (let tree of batch) {
            const status = statuses[tree.sapling_id];
            if(status && status.dataUploaded){
                await this.localdb.updateUpload(tree.sapling_id);
            }
            else{
                failures.push(tree.sapling_id);
            }
        }
        return failures;

    }

    static async fetchTreesFromLocalDB(uploaded = undefined) {
        let res;
        if (uploaded!==undefined) {
            res = await this.localdb.getTreesByUploadStatus(uploaded);
        }
        else {
            res = await this.localdb.getAllTrees();
            console.log(res)
        }

        // console.log(res);
        var final = [];
        for (let index = 0; index < res.length; index++) {
            var element = res[index];
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
                uploaded:(element.uploaded===1)
            };
            if (element.uploaded !== undefined) {
                tree.uploaded = (element.uploaded === 1)
            }
            tree.user_id = await this.getUserId();
            final.push(tree);
        }
        return final;
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
        const plots = await this.localdb.getPlotsList();
        const requiredPlot = plots.find((plot) => (plot.value === plotID));
        console.log(requiredPlot)
        return requiredPlot;
    }
    static async fetchTreeTypesFromLocalDB() {
        let res = await this.localdb.getTreeNames();
        return res;
    }

    static async fetchPlotNamesFromLocalDB() {
        let res = await this.localdb.getPlotNames();
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

    // Language related functions

    // display the string in currently set language


}

export class Constants {
    static userIdKey = 'userid';
    static userDetailsKey = 'userobj';
    static adminIdKey = 'adminid';
    static lastHashKey = 'lasthash';
    static hashForPlotSaplingsKey = 'hashForPlotSaplings';
    static appRootTagKey = 'rootTag';
    static syncDateKey = 'date';
    static imagePlaceholder = 'https://i.imgur.com/vxP6SFl.png'
    static treeFormTemplateData = { inSaplingId: null, inLat: 0, inLng: 0, inImages: [], inPlot: null, inTreeType: null, inUserId: '' }
    static
        selectedLangKey = 'LANG';
}


export const commonStyles = StyleSheet.create({
    iconBtn: {
        padding: 5,
        margin: 5,
        borderRadius: 5,
        flexDirection: 'row',
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center'
    },
    borderedDisplay:{
        borderColor:'grey',borderWidth:3,borderRadius:5,margin:3,padding:3
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
        color: '#1f3625',
        textAlign: 'center',
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
    text5:{
        fontSize: 20,
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        color: 'black' },
    text3: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
    },
    text6: {
        fontSize: 17,
        color: 'black',
        textAlign: 'left',
        backgroundColor:'white',
        borderRadius:3
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
