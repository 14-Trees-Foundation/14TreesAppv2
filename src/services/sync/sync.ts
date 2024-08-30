import React from "react";
import { Constants, Utils } from "../Utils";
import { fetchAndStoreTrees, uploadSingleTreeData, uploadTreesData } from "./tree"
import { fetchAndStoreVisitImages, uploadVisitImagesData } from "./visit_images";
import { fetchAndStoreTreeSnapshots, uploadSingleTreeSnapshotsData, uploadTreeSnapshotsData } from "./tree_snapshots";
import { fetchAndStoreUsers } from "./users";
import { fetchAndStoreSites } from "./sites";
import { fetchAndStorePlots } from "./plots";
import { fetchAndStoreVisits } from "./visits";
import { ApiClient } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAndStoreDeltaSyncInformation, saveSyncInfo, uploadSyncInfoData } from "./sync_info";
import { DaoClient } from "../db/dao";

export const uploadLocalData = async (changesCount: any, syncTime: string) => {

    let count = 0;
    try {
        const response = await Utils.syncLogs();
        if (response?.success) await Utils.deleteLogsFromLocalDB();

    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'happened while trying to sync logs(inside sync display)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }

    count = changesCount.trees.add + changesCount.trees.edit + changesCount.trees.delete;
    try {
        if (count !== 0) await uploadTreesData(syncTime);
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local trees data',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }

    count = changesCount.tree_images.add + changesCount.tree_images.delete
    try {
        if (count !== 0) await uploadTreeSnapshotsData(syncTime);
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'happened while trying to sync tree images(inside sync display)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }

    count = changesCount.visit_images.add + changesCount.visit_images.delete
    try {
        if (count !== 0) await uploadVisitImagesData(syncTime);
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local visit images',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }

    try {
        await uploadSyncInfoData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local sync history',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
}

export const fetchDeltaChanges = async (setProgress: React.Dispatch<React.SetStateAction<number>>) => {
    const userDetailsDtr = await AsyncStorage.getItem(Constants.userDetailsKey);
    if (userDetailsDtr) {
        const userDetails = JSON.parse(userDetailsDtr);
        const apiClient = new ApiClient();
        const analytics = await apiClient.trees.analyticsCount(userDetails.name)
        await AsyncStorage.setItem(Constants.treeAnalyticsDataKey, JSON.stringify(analytics))
    }

    const selectedSiteId = await AsyncStorage.getItem(Constants.selectedSiteId);
    let siteId: number | undefined = undefined;
    if (selectedSiteId) {
        siteId = parseInt(selectedSiteId);
    }

    await Utils.fetchAndStoreHelperData();
    setProgress(0.1);

    await fetchAndStoreUsers();
    setProgress(0.2);

    await fetchAndStoreSites();
    setProgress(0.2);

    await fetchAndStorePlots(siteId);
    setProgress(0.3);

    await fetchAndStoreVisits();
    setProgress(0.4);

    await fetchAndStoreVisitImages();
    setProgress(0.5);

    await fetchAndStoreTrees(siteId);
    setProgress(0.9);

    await fetchAndStoreTreeSnapshots();
    setProgress(0.95);

    await fetchAndStoreDeltaSyncInformation();
    setProgress(1);
}


/*

    Single Tree sync
    Upload only

*/


export const syncSingleTree = async (localId: number, saplingId: string, timeStamp: string) => {

    try {
        const daoClient = await DaoClient.authenticate();
        const syncInfoRequest = {
            synced_at: timeStamp,
            upload_time: 0,
            fetch_time: 0,
            upload_error: '',
            fetch_error: '',
            trees: { add: 0, edit: 0, delete: 0 },
            tree_images: { add: 0, delete: 0 },
            visit_images: { add: 0, delete: 0 },
        }
        await saveSyncInfo(daoClient, syncInfoRequest);
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error in single tree sync feature (while initiating sync)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    

    try {
        await uploadSingleTreeData(localId, timeStamp)
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error in single tree sync feature (upload tree details)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }

    try {
        await uploadSingleTreeSnapshotsData(saplingId, timeStamp)
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error in single tree sync feature (upload tree audit)',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
}