
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { Tree } from "../../model/tree";
import { ToastAndroid } from "react-native";
import { INITIAL_TIMESTAMP } from "../../constants/constants";
import { saveSyncInfo } from "./sync_info";

export const fetchAndStoreTrees = async (siteId?: number) => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let treeIds = await daoClient.trees.getLiveTreeIds()
    let timestamp = await AsyncStorage.getItem(Constants.lastTreesFetchedAt) || INITIAL_TIMESTAMP
    if (siteId) {
        const resp = await daoClient.siteSync.getSiteLastSyncTime(siteId, Constants.lastTreesFetchedAt);
        if (resp && new Date(timestamp).getTime() < new Date(resp.created_at).getTime()) timestamp = resp.created_at;
    }

    try {
        const now = new Date().toISOString();

        let offset: number = 0;
        while (true) {
            const response = await apiClient.trees.fetchChanges(timestamp, treeIds, offset, siteId)
            const trees = response.trees;

            let data = trees.map(tree => {
                tree.location = tree.location ? JSON.stringify(tree.location) : null;
                tree.tags = tree.tags ? JSON.stringify(tree.tags) : null;
                tree.memory_images = tree.memory_images ? JSON.stringify(tree.memory_images) : null;
                return tree;
            })

            let BATCH_SIZE = 90;
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                await daoClient.trees.bulkInsertTrees(data.slice(i, i + BATCH_SIZE));
            };

            // delete trees in local db
            for (const treeId of response.deleted_tree_ids) {
                await daoClient.trees.deleteLiveTreeFromLocalDb(treeId);
            }

            treeIds = []
            offset += trees.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }

        if (siteId) await daoClient.siteSync.createLastSyncTime(siteId, Constants.lastTreesFetchedAt, now);
        else await AsyncStorage.setItem(Constants.lastTreesFetchedAt, now);

        console.log('Trees fetch Done')
        ToastAndroid.show('Trees data upto date!', ToastAndroid.LONG)
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

export const uploadTreesData = async (syncTime: string) => {

    try {
        const daoClient = await DaoClient.authenticate();
        const trees = await daoClient.trees.getTrees(0, -1, false, true);
    
        const newTrees = trees.filter(tree => tree.change_type === 'add');
        const editedTrees = trees.filter(tree => tree.change_type === 'edit');
        const deletedTrees = trees.filter(tree => tree.change_type === 'delete');
    
        const syncInfo = await Utils.getSyncInfoBySyncTime(syncTime);
    
        await uploadDeletedTreesData(daoClient, deletedTrees, syncInfo);
    
        await uploadEditedTreesData(daoClient, editedTrees, syncInfo);
    
        await uploadNewTreesData(daoClient, newTrees, syncInfo);
    
        await daoClient.treeImages.deleteUploadedImages();
    } catch (error: any) {
        Utils.saveErrorLog("UploadTrees::uploadTreesData", error);
    }
}

export const uploadNewTreesData = async (daoClient: DaoClient, trees: Tree[], syncInfo: any) => {
    let apiClient = new ApiClient()

    for (let i = 0; i < trees.length; i++) {

        try {
            const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
            if (stopSync) break;

            const tree = trees[i]
            if (tree.assigned_to_local) {
                const user = await daoClient.users.getUserByLocalId(tree.assigned_to_local);
                if (user?.id) tree.assigned_to = user.id
                else continue;
            }
    
            const images = await daoClient.treeImages.getTreeImagesForSaplingId(tree.sapling_id, false);
            let treeReq: any = getNewTreeRequest(tree, images)
    
            let now = new Date().getTime();
            const response = await apiClient.trees.uploadTrees([treeReq]);
            const timeTaken = (new Date().getTime() - now) / 1000;
            const speed = 1024 / timeTaken;
            await AsyncStorage.setItem(Constants.networkSpeed, speed.toFixed(0))
    
            if (response && response[treeReq.sapling_id] && response[treeReq.sapling_id].dataUploaded) {
                await daoClient.trees.deleteLocalTree(treeReq.local_id)
                
                const tree = response[treeReq.sapling_id].tree;
                await saveNewTreeToLocalDb(daoClient, tree);
    
                images.tree_image && await daoClient.treeImages.markImageUploaded(images.tree_image.local_id);
                images.user_card_image && await daoClient.treeImages.markImageUploaded(images.user_card_image.local_id);
                images.user_tree_image && await daoClient.treeImages.markImageUploaded(images.user_tree_image.local_id);

                if (!response[treeReq.sapling_id].exisitng) syncInfo.trees.add += 1;
                syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
                await saveSyncInfo(daoClient, syncInfo);
            }
        } catch (error: any) {
            Utils.saveErrorLog("UploadTrees::uploadNewTreesData", error);
        }

    }
}

export const uploadEditedTreesData = async (daoClient: DaoClient, trees: Tree[], syncInfo: any) => {
    let apiClient = new ApiClient()

    for (let i = 0; i < trees.length; i++) {

        try {
            const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
            if (stopSync) break;
    
            const tree = trees[i]
            if (tree.assigned_to_local) {
                const user = await daoClient.users.getUserByLocalId(tree.assigned_to_local);
                if (user?.id) tree.assigned_to = user.id
                else continue;
            }
    
            const location = tree.location ? JSON.parse(tree.location) : { coordinates: [0, 0] };
            let treeReq: any = { tree: { ...tree, location: location } }
            const images = await daoClient.treeImages.getTreeImagesForSaplingId(tree.sapling_id, false);
    
            if (images.tree_image) treeReq = { ...treeReq, new_image: { name: images.tree_image.name, data: images.tree_image.data } }
            if (images.user_card_image) treeReq = { ...treeReq, user_card_image: { name: images.user_card_image.name, data: images.user_card_image.data } }
            if (images.user_tree_image) treeReq = { ...treeReq, user_tree_image: { name: images.user_tree_image.name, data: images.user_tree_image.data } }
    
            let now = new Date().getTime();
            const updatedTree = await apiClient.trees.updateTree(treeReq);
            const timeTaken = (new Date().getTime() - now) / 1000;
            const speed = 1024 / timeTaken;
            await AsyncStorage.setItem(Constants.networkSpeed, speed.toFixed(0))
    
            updatedTree.location = updatedTree.location ? JSON.stringify(updatedTree.location) : null;
            updatedTree.tags = updatedTree.tags ? JSON.stringify(updatedTree.tags) : null;
            updatedTree.memory_images = updatedTree.memory_images ? JSON.stringify(updatedTree.memory_images) : null;
            await daoClient.trees.upsertLiveTreeIntoLocalDb(updatedTree);
            images.tree_image && await daoClient.treeImages.markImageUploaded(images.tree_image.local_id);
            images.user_card_image && await daoClient.treeImages.markImageUploaded(images.user_card_image.local_id);
            images.user_tree_image && await daoClient.treeImages.markImageUploaded(images.user_tree_image.local_id);
            syncInfo.trees.edit += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        } catch (error: any) {
            Utils.saveErrorLog("UploadTrees::uploadEditedTreesData", error);
        }
    }

}

export const uploadDeletedTreesData = async (daoClient: DaoClient, trees: Tree[], syncInfo: any) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < trees.length; i++) {
        try {
            const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
            if (stopSync) break;
            
            await apiClient.trees.deleteTree(trees[i]);
            await daoClient.trees.deleteLocalTree(trees[i].local_id);
            syncInfo.trees.delete += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        } catch (error: any) {
            Utils.saveErrorLog("UploadTrees::uploadDeletedTreesData", error);
        }
    }
}

export const uploadSingleTreeData = async (localId: number, timeStamp: string) => {
    try {
        const daoClient = await DaoClient.authenticate();
        const tree = await daoClient.trees.getTreeByLocalId(localId);
    
        if (!tree) {
            ToastAndroid.show("Tree doesn't exists!", ToastAndroid.LONG);
        } else if (!tree.is_uploaded) {
            const syncInfo = await Utils.getSyncInfoBySyncTime(timeStamp);
    
            if (tree.change_type === 'add') {
                await uploadNewTreesData(daoClient, [tree], syncInfo)
            } else if (tree.change_type === 'edit') {
                await uploadEditedTreesData(daoClient, [tree], syncInfo)
            }
        }
    } catch (error: any) {
        Utils.saveErrorLog("UploadTrees::uploadSingleTreeData", error);
    }
}

const getNewTreeRequest = (tree: Tree, images: any) => {
    const location = tree.location ? JSON.parse(tree.location) : { coordinates: [0, 0] };
    let treeReq: any = { ...tree, coordinates: location.coordinates }

    if (images.tree_image) treeReq = { ...treeReq, images: [{ name: images.tree_image.name, data: images.tree_image.data }] }
    if (images.user_card_image) treeReq = { ...treeReq, user_card_image: { name: images.user_card_image.name, data: images.user_card_image.data } }
    if (images.user_tree_image) treeReq = { ...treeReq, user_tree_image: { name: images.user_tree_image.name, data: images.user_tree_image.data } }

    return treeReq;
}

const saveNewTreeToLocalDb = async (daoClient: DaoClient, tree: any) => {
    tree.location = tree.location ? JSON.stringify(tree.location) : null;
    tree.tags = tree.tags ? JSON.stringify(tree.tags) : null;
    tree.memory_images = tree.memory_images ? JSON.stringify(tree.memory_images) : null;
    await daoClient.trees.upsertLiveTreeIntoLocalDb(tree)
}