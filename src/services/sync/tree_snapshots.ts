
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { ToastAndroid } from "react-native";
import { TreeSnapshot } from "../../model/tree_snapshot";

export const fetchAndStoreTreeSnapshots = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let treeSnapshotIds = await daoClient.treeSnapshots.getLiveTreeSnapshotIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastTreeSnapshotsFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();

        let offset = 0;
        while (true) {
            const response = await apiClient.treeSnapshots.fetchChanges(timestamp, treeSnapshotIds, offset)
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

        await AsyncStorage.setItem(Constants.lastTreeSnapshotsFetchedAt, now);
        console.log('Tree snapshots fetch Done!')
        ToastAndroid.show('Trees images data upto date!', ToastAndroid.LONG)
    } catch(err: any) {
        console.log('Inside fetchAndStoreTreeSnapshots:', err)
    }
}

export const uploadTreeSnapshotsData = async () => {
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();
    const treeSnapshots = await daoClient.treeSnapshots.getTreeSnapshots(false);

    

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
        const images = treeSnapshotsMap[saplingId];
        await apiClient.treeSnapshots.createTreeSnapshots(saplingId, userId, images)

        for (const image of images) {
            await daoClient.treeSnapshots.markImageUploaded(image.local_id)
        }
    }

    await daoClient.treeSnapshots.deleteUploadedImages();
}
