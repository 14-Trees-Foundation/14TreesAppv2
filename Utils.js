import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllTrees, getDBConnection, getTreeImages, getTreesByUploadStatus, updateUpload , getTreeNames,getPlotNames, getSaplingIds} from "./tree_db";
import { DataService } from "./DataService";
import { Alert } from "react-native";
import { createDrawerNavigator } from '@react-navigation/drawer';


export class Utils{

    static async upload(){
        try {
            const final = await Utils.fetchTreesFromLocalDB(0);
            console.log(final);
            console.log(Utils.userId);
            let response = await DataService.uploadTrees(final);
            console.log(response.data);
            if (response.status === 200) {
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
    static async setTreeSyncStatus(final) {
        const db = await getDBConnection();
        for (let index = 0; index < final.length; index++) {
            const element = final[index];
            await updateUpload(db, element.sapling_id);
        }
    }

    static async fetchTreesFromLocalDB(uploaded=undefined) {
        const db = await getDBConnection();
        let res;
        if(uploaded){
            res = await getTreesByUploadStatus(db,uploaded);
        }
        else{
            res = await getAllTrees(db);
            console.log(res)
        }
        const currentTime = new Date().toString();
        await AsyncStorage.setItem('date', currentTime);
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
            const db = await getDBConnection(); //TODO: Do we need a new connection?
            let images = await getTreeImages(db, element.sapling_id);
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

    static async fetchTreeNamesFromLocalDB() {
        const db = await getDBConnection();
        let res = await getTreeNames(db);
        return res;
    }

    static async fetchPlotNamesFromLocalDB() {
        const db = await getDBConnection();
        let res = await getPlotNames(db);
        return res;
    }

    static async fetchSaplingIdsFromLocalDB() {
        const db = await getDBConnection();
        let res = await getSaplingIds(db);
        return res;
    }
    

    static async getUserId() {
        return await AsyncStorage.getItem(Constants.userIdKey);
    }

    static async getAdminId() {
        return await AsyncStorage.getItem(Constants.adminIdKey);
    }
}

export class Constants{
    static userIdKey = 'userid';
    static userDetailsKey = 'userobj';
    static adminIdKey = 'adminid';
}