
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { ToastAndroid } from "react-native";
import { TreeSnapshot } from "../../model/tree_snapshot";
import { saveSyncInfo } from "./sync_info";
import { INITIAL_TIMESTAMP } from "../../constants/constants";

export const fetchAndStoreTreeSnapshots = async (siteId?: number) => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let treeSnapshotIds = await daoClient.treeSnapshots.getLiveTreeSnapshotIds()
    let timestamp = await AsyncStorage.getItem(Constants.lastTreeSnapshotsFetchedAt) || INITIAL_TIMESTAMP
    if (siteId) {
        const resp = await daoClient.siteSync.getSiteLastSyncTime(siteId, Constants.lastTreeSnapshotsFetchedAt);
        if (resp && new Date(timestamp).getTime() < new Date(resp.created_at).getTime()) timestamp = resp.created_at;
    }

    try {
        const now = new Date().toISOString();

        let offset = 0;
        while (true) {
            const response = await apiClient.treeSnapshots.fetchChanges(timestamp, treeSnapshotIds, offset, siteId)
            const treeSnapshots = response.tree_snapshots;

            // upload visit images in local db
            for (const treeSnapshot of treeSnapshots) {
                await daoClient.treeSnapshots.upsertLiveTreeSnapshotIntoLocalDb(treeSnapshot);
            }

            // delete visit images in local db
            for (const treeSnapshotId of response.deleted_tree_snapshot_ids) {
                await daoClient.treeSnapshots.deleteLiveTreeSnapshotFromLocalDb(treeSnapshotId);
            }

            treeSnapshotIds = []
            offset += treeSnapshots.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }

        if (siteId) await daoClient.siteSync.createLastSyncTime(siteId, Constants.lastTreeSnapshotsFetchedAt, now);
        else await AsyncStorage.setItem(Constants.lastTreeSnapshotsFetchedAt, now);
        
        console.log('Tree snapshots fetch Done!')
        ToastAndroid.show('Trees images data upto date!', ToastAndroid.LONG)
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error inside fetchAndStoreTrees',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
}

export const uploadTreeSnapshotsData = async (syncTime: string) => {
    const daoClient = await DaoClient.authenticate();
    const treeSnapshots = await daoClient.treeSnapshots.getTreeSnapshots(false);
    const deletedImages = treeSnapshots.filter(image => image.is_deleted === 1)
    const newImages = treeSnapshots.filter(image => image.is_deleted === 0)

    const resp = await daoClient.syncInfo.getSyncInfoBySyncTime(syncTime);
    const syncInfo = { ...resp, trees: JSON.parse(resp.trees), tree_images: JSON.parse(resp.tree_images), visit_images: JSON.parse(resp.visit_images) }

    await deleteTreeSnapshots(daoClient, deletedImages, syncInfo);
    await uploadNewTreeSnapshots(daoClient, newImages, syncInfo);

    await daoClient.treeSnapshots.deleteUploadedImages();
}

export const uploadSingleTreeSnapshotsData = async (saplingId: string, syncTime: string) => {
    const daoClient = await DaoClient.authenticate();

    const treeSnapshots = await daoClient.treeSnapshots.getTreeSnapshotsBySaplingId(saplingId, false);
    const deletedImages = treeSnapshots.filter(image => image.is_deleted === 1)
    const newImages = treeSnapshots.filter(image => image.is_deleted === 0)

    const resp = await daoClient.syncInfo.getSyncInfoBySyncTime(syncTime);
    const syncInfo = { ...resp, trees: JSON.parse(resp.trees), tree_images: JSON.parse(resp.tree_images), visit_images: JSON.parse(resp.visit_images) }

    await deleteTreeSnapshots(daoClient, deletedImages, syncInfo);
    await uploadNewTreeSnapshots(daoClient, newImages, syncInfo);

    await daoClient.treeSnapshots.deleteUploadedImages();
}

const deleteTreeSnapshots = async (daoClient: DaoClient, images: TreeSnapshot[], syncInfo: any) => {
    const apiClient = new ApiClient();
    let imageIds: number[] = []
    images.forEach(image => { if (image.id) imageIds.push(image.id) });

    if (imageIds.length > 0) {
        await apiClient.treeSnapshots.deleteTreeSnapshots(imageIds);
    }

    for (const image of images) {
        await daoClient.treeSnapshots.markImageUploaded(image.local_id);
        syncInfo.tree_images.delete += 1;
        syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
        await saveSyncInfo(daoClient, syncInfo);
    }
}

const uploadNewTreeSnapshots = async (daoClient: DaoClient, treeSnapshots: TreeSnapshot[], syncInfo: any) => {
    const apiClient = new ApiClient();

    let saplingIds: string[] = [];
    let userId = 0;
    let treeSnapshotsMap: Record<string, TreeSnapshot[]> = {};
    for (let treeSnapshot of treeSnapshots) {
        userId = treeSnapshot.user_id;
        if (Object.hasOwn(treeSnapshotsMap, treeSnapshot.sapling_id)) {
            treeSnapshotsMap[treeSnapshot.sapling_id].push(treeSnapshot);
        } else {
            saplingIds.push(treeSnapshot.sapling_id);
            treeSnapshotsMap[treeSnapshot.sapling_id] = [treeSnapshot]
        }
    }

    if (userId === 0) return;

    for (const saplingId of saplingIds) {
        const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
        if (stopSync) break;
        
        const images = treeSnapshotsMap[saplingId];
        const treeSnapshots = await apiClient.treeSnapshots.createTreeSnapshots(saplingId, userId, images)

        for (const image of images) {
            await daoClient.treeSnapshots.markImageUploaded(image.local_id);
            syncInfo.tree_images.add += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        }

        for (const treeSnapshot of treeSnapshots) {
            await daoClient.treeSnapshots.upsertLiveTreeSnapshotIntoLocalDb(treeSnapshot);
        }
    }
}