import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, ToastAndroid,StyleSheet } from "react-native";
import { DataService } from "./DataService";
import { LocalDatabase } from "./tree_db";

export class Utils{
    static ldb = new LocalDatabase();
    static async confirmAction(onConfirm,title=undefined,message=undefined){
        if(!title){
            title = 'Are you sure?';
        }
        if(!message){
            message = 'Please confirm the action.'
        }
        Alert.alert(title,message,[
            {
                text:'Yes',
                onPress:()=>onConfirm()
            },
            {
                text:'No',
                onPress:()=>null
            }
        ])
    }
    static async createLocalTablesIfNeeded(){
        // await this.setDBConnection();
        
        await this.ldb.createTreetTypesTbl();
        await this.ldb.createPlotTbl();
        await this.ldb.createTreesTable();
    }
    static async fetchAndStoreHelperData(){
        console.log('fetching helper data');
        let lastHash = await AsyncStorage.getItem(Constants.lastHashKey);
        lastHash = String(lastHash);//take care of null values.
        let userId = await Utils.getUserId();
        console.log('requesting: ',userId,lastHash)
        const helperData = await DataService.fetchHelperData(userId,lastHash);
        if(!helperData){
            return;//error display, logging done by DataService.

        }
        const data = helperData.data['data'];
        const newHash = helperData.data['hash'];
        if(newHash==lastHash){
            ToastAndroid.show('Tree types and plot already up to date.',ToastAndroid.LONG)
            return;
        }
        if(data){
            await Utils.storeTreeTypes(data['treeTypes']);
            await Utils.storePlots(data['plots']);
            await AsyncStorage.setItem(Constants.lastHashKey,newHash);
        }
        else{
            console.log('data was null.');
        }
    }
    static async storeTreeTypes(treeTypes){
        // console.log(treeTypes[0])
        const treeTypesInLocalDBFormat = treeTypes.map((treeType)=>{
            return {
                name:treeType.name,
                tree_id:treeType.tree_id
            }
        })
        // await this.setDBConnection();
        let failure = false;
        for(let dbTreeType of treeTypesInLocalDBFormat){
            try{
                await this.ldb.updateTreeTypeTbl(dbTreeType);
            }
            catch(err){
                console.log('Failed to save treeType: ',dbTreeType);
                console.log(err)
                failure = true;
            }
        }
        if(failure){
            ToastAndroid.show('Failed to save some tree types. See logs.');
        }
        else{
            console.log('All tree types saved successfully.')
        }
    }
    static async storePlots(plots){
        // console.log(plots[0])
        const plotsInLocalDBFormat = plots.map((plot)=>{
            if(plot.name){
                plot.name = plot.name.replace("'","''");
            }
            return {
                name:plot.name,
                plot_id:plot.plot_id
            }
        })
        // await this.setDBConnection();
        let failure = false;
        for(let dbPlot of plotsInLocalDBFormat){
            try{
                await this.ldb.updatePlotTbl(dbPlot);
            }
            catch(err){
                console.log('Failed to save plot: ',dbPlot);
                console.log(err)
                failure = true;
            }
        }
        if(failure){
            ToastAndroid.show('Failed to save some plots. See logs.');
        }
        else{
            console.log('All plots saved successfully.')
        }
    }
    static async deleteSyncedTrees(){
        //TODO implement.
        ToastAndroid.show('Deleted synced trees',ToastAndroid.SHORT);
    }
    static async upload(){
        try {
            const final = await Utils.fetchTreesFromLocalDB(0);
            console.log(final);
            let response = await DataService.uploadTrees(final);
            console.log(response.data);
            if (response) {
                await Utils.setTreeSyncStatus(final);
                Alert.alert('Sync Successful!', 'See local tree list to check statuses.')
            }
            else{
                Alert.alert('Sync Failed','Contact an expert, please.');
            }
            // await fetch();
        }
        catch (error) {
          console.error(error);
        }
    }; 
    static userId;
    static adminId;
    static ldb;
    static async setTreeSyncStatus(final) {
        for (let index = 0; index < final.length; index++) {
            const element = final[index];
            await this.ldb.updateUpload(element.sapling_id);
        }
    }

    static async fetchTreesFromLocalDB(uploaded=undefined) {
        let res;
        if(uploaded){
            res = await this.ldb.getTreesByUploadStatus(uploaded);
        }
        else{
            res = await this.ldb.getAllTrees();
            console.log(res)
        }
        const currentTime = new Date().toString();
        await AsyncStorage.setItem(Constants.syncDateKey, currentTime);
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
            let images = await this.ldb.getTreeImages(element.sapling_id);
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
            };
            if(element.uploaded!==undefined){
                tree.uploaded = (element.uploaded===1)
            }
            tree.user_id = await this.getUserId();
            final.push(tree);
        }
        return final;
    }
    static async setDBConnection(){
        if(!(this.ldb.db)){
            await this.ldb.getDBConnection();
        }
        return this.ldb;
    }
    static async treeTypeFromID(treeTypeID){
        //both ids are numbers of type string.
        const treeNames = await this.ldb.getTreeTypes();
        const requiredTreeType = treeNames.find((tree)=>(tree.value===treeTypeID));
        return requiredTreeType;
    }
    static async plotFromPlotID(plotID){
        //both ids are numbers of type string.
        const plots = await this.ldb.getPlotsList();
        const requiredPlot = plots.find((plot)=>(plot.value===plotID));
        console.log(requiredPlot)
        return requiredPlot;
    }
    static async fetchTreeTypesFromLocalDB() {
        let res = await this.ldb.getTreeNames();
        return res;
    }

    static async fetchPlotNamesFromLocalDB() {
        let res = await this.ldb.getPlotNames();
        return res;
    }

    static async fetchSaplingIdsFromLocalDB() {
        let res = await this.ldb.getSaplingIds();
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
}

export class Constants{
    static userIdKey = 'userid';
    static userDetailsKey = 'userobj';
    static adminIdKey = 'adminid';
    static lastHashKey = 'lasthash';
    static syncDateKey = 'date';
    static imagePlaceholder = 'https://i.imgur.com/vxP6SFl.png'
    static treeFormTemplateData = {inSaplingId:null,inLat:0,inLng:0,inImages:[],inPlot:{},inTreeType:{},inUserId:''}
}


export const styles = StyleSheet.create({
    defaultButtonStyle:{
        flexDirection:'row',
        alignContent:'center',
        alignItems:'center',
        fontSize:40,
        borderColor:'gray',
        borderWidth:3,
        backgroundColor:'green',
        margin:5,
        padding:10,
        borderRadius:5,
        shadowColor:'black',
        elevation:3,
        shadowOffset:{
            width:50,
            height:50
        },
        shadowOpacity:1
    },
    defaultButtonTextStyle:{
        color:'white',
        textAlign:'center'
    },
    drawerHeader:{
        backgroundColor:'#5DB075',
    },
    headerTitleStyle:{
        color:'white'
    },
    logOutButton:{
        color:'white',
        bottom:0
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
    text4:{
        fontSize: 17,
        color: 'black',
        textAlign: 'left',  
        padding:5,
    },
    text3: {
      fontSize: 17,
      color: 'black',
      textAlign: 'left',
    },
    txtInput: {
      height: 60,
      width: 310,
      borderWidth: 0.5,
      borderColor: 'grey',
      borderRadius: 10,
      backgroundColor: '#f5f5f5',
      marginTop: 30,
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
        headerStyle: styles.drawerHeader,
        headerTitleStyle: styles.headerTitleStyle,
        headerTintColor: styles.headerTitleStyle.color
    }
}
