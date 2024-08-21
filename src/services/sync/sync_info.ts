import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import { Constants, Utils } from "../Utils";
import { INITIAL_TIMESTAMP } from "../../constants/constants";
import { ToastAndroid } from "react-native";
import { User } from "../../model/user";


export const saveSyncInfo = async (daoClient: DaoClient, info: any) => {
    const data = JSON.parse(JSON.stringify(info)); // copy

    data.trees = JSON.stringify(data.trees);
    data.tree_images = JSON.stringify(data.tree_images);
    data.visit_images = JSON.stringify(data.visit_images);
    await daoClient.syncInfo.createSyncInfo(data);
}

export const fetchAndStoreDeltaSyncInformation = async () => {

    try {
        const apiClient = new ApiClient();
        const daoClient = await DaoClient.authenticate();
        const timestamp = await AsyncStorage.getItem(Constants.lastSyncInfoFetchedAt) || INITIAL_TIMESTAMP
        const now = new Date().toISOString();
        let offset = 0;

        let userData: User | null = null
        let userId: number;
        const userDataStr = await AsyncStorage.getItem(Constants.userDetailsKey)
        if (userDataStr) userData = JSON.parse(userDataStr);

        if (userData?.id) {
            userId = userData.id
        } else {
            throw new Error("Current User's details not found!")
        }

        while (true) {
            const response = await apiClient.syncInfo.fetchDeltaChanges(timestamp, userId, offset)
            const syncInfoList = response.sync_histories;

            // upload sync info in local db
            for (const syncInfo of syncInfoList) {
                syncInfo.synced_at = new Date(syncInfo.synced_at).toISOString();
                await daoClient.syncInfo.upsertLiveSyncInfo(syncInfo);
            }

            offset += syncInfoList.length;
            if (offset >= response.total) break;
        }

        await AsyncStorage.setItem(Constants.lastSyncInfoFetchedAt, now);
        console.log('Sync Info fetch Done!')
        ToastAndroid.show('Sync History upto date!', ToastAndroid.LONG)
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error inside fetchAndStoreDeltaSyncInformation',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
}

export const uploadSyncInfoData = async () => {
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let userData: User | null = null
    let userId: number;
    const userDataStr = await AsyncStorage.getItem(Constants.userDetailsKey)
    if (userDataStr) userData = JSON.parse(userDataStr);

    if (userData?.id) {
        userId = userData.id
    } else {
        throw new Error("Current User's details not found!")
    }

    const syncInfo = await daoClient.syncInfo.getSyncInfo(0, -1, false, true);
    const newInfos = syncInfo.filter(info => info.change_type === 'add');

    for (const info of newInfos) {
        const resp = await apiClient.syncInfo.createSyncInfo(info, userId);
        console.log('Before:', resp.synced_at)
        resp.synced_at = new Date(resp.synced_at).toISOString();
        console.log(resp.synced_at)
        if (resp) await daoClient.syncInfo.upsertLiveSyncInfo(resp);
    }
}