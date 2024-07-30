import React from "react";
import { Constants, Utils } from "../Utils";
import { fetchAndStoreTrees, uploadTreesData } from "./tree"
import { fetchAndStoreVisitImages, uploadVisitImagesData } from "./visit_images";
import { fetchAndStoreTreeSnapshots, uploadTreeSnapshotsData } from "./tree_snapshots";
import { fetchAndStoreUsers } from "./users";
import { fetchAndStoreSites } from "./sites";
import { fetchAndStorePlots } from "./plots";
import { fetchAndStoreVisits } from "./visits";
import { ApiClient } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const uploadLocalData = async (setProgress: React.Dispatch<React.SetStateAction<number>>, changesCount: any) => {
    const total = changesCount.trees.add + changesCount.trees.edit + changesCount.trees.delete
                    + changesCount.tree_images.add + changesCount.tree_images.delete 
                    + changesCount.visit_images.add + changesCount.visit_images.delete + 1;
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
    setProgress(prev => prev + 0.1);
    
    count = changesCount.trees.add + changesCount.trees.edit + changesCount.trees.delete;
    try {
        if (count !== 0) await uploadTreesData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local trees data',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    setProgress((count/total) * 0.9);

    count = changesCount.tree_images.add + changesCount.tree_images.delete 
    try {
        if (count !== 0) await uploadTreeSnapshotsData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
          msg: 'happened while trying to sync tree images(inside sync display)',
          error: JSON.stringify(error),
          stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    let progress = (count/total) * 0.9;
    setProgress(prev => prev + progress);

    count = changesCount.visit_images.add + changesCount.visit_images.delete
    try {
        if (count !== 0) await uploadVisitImagesData();
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error uploading local visit images',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
    progress = (count/total) * 0.9;
    setProgress(prev => prev + progress);
}

export const fetchDeltaChanges = async (setProgress: React.Dispatch<React.SetStateAction<number>>) => {
    const userDetailsDtr = await AsyncStorage.getItem(Constants.userDetailsKey);
    if (userDetailsDtr) {
        const userDetails = JSON.parse(userDetailsDtr);
        const apiClient = new ApiClient();
        const analytics = await apiClient.trees.analyticsCount(userDetails.name)
        await AsyncStorage.setItem(Constants.treeAnalyticsDataKey, JSON.stringify(analytics))
    }

    await Utils.fetchAndStoreHelperData();
    setProgress(0.1);

    await fetchAndStoreUsers();
    setProgress(0.2);

    await fetchAndStoreTrees();
    setProgress(0.5);

    await fetchAndStorePlots();
    setProgress(0.6);

    await fetchAndStoreSites();
    setProgress(0.7);

    await fetchAndStoreVisits();
    setProgress(0.8);

    await fetchAndStoreVisitImages();
    setProgress(0.9);

    await fetchAndStoreTreeSnapshots();
    setProgress(1);
}