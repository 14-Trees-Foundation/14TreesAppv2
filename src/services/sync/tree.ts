
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { Tree } from "../../model/tree";
import { TreeImageType } from "../../model/tree_image";
import { ToastAndroid } from "react-native";

export const fetchAndStoreTrees = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let treeIds = await daoClient.trees.getLiveTreeIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastTreesFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();

        let offset: number = 0;
        while (true) {
            const response = await apiClient.trees.fetchChanges(timestamp, treeIds, offset)
            const trees = response.trees;
            
            let data = trees.map(tree => {
                tree.location = tree.location ? JSON.stringify(tree.location) : null;
                tree.tags = tree.tags ? JSON.stringify(tree.tags) : null;
                tree.memory_images = tree.memory_images ? JSON.stringify(tree.memory_images) : null;
                return tree;
            })

            const BATCH_SIZE = 1000;
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                await daoClient.trees.bulkInsertTrees(data.slice(i, i + BATCH_SIZE));
            };
        
            // delete trees in local db
            for (const treeId of response.deleted_tree_ids) {
                await daoClient.trees.deleteLiveTreeFromLocalDb(treeId);
            }

            treeIds = []
            offset += trees.length;
            console.log(offset+"/"+response.total)
            if (offset >= response.total) break;
        }

        await AsyncStorage.setItem(Constants.lastTreesFetchedAt, now);
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

const getTreeImages = async (daoClient: DaoClient) => {
    const saplingIdToImgMap: Record<string, any> = {};

    const treeImagesByType = async (type: TreeImageType) => {
        const images = await daoClient.treeImages.getTreeImages(type, false)
        images.forEach(image => {
            if (Object.hasOwn(saplingIdToImgMap, image.sapling_id)) saplingIdToImgMap[image.sapling_id][type] = image;
            else saplingIdToImgMap[image.sapling_id] = { [type]: image }
        })
    }

    await treeImagesByType('tree_image')
    await treeImagesByType('user_tree_image')
    await treeImagesByType('user_card_image')

    return saplingIdToImgMap;
}

export const uploadTreesData = async () => {
    const daoClient = await DaoClient.authenticate();
    const trees = await daoClient.trees.getTrees(0, -1, false, true);

    const saplingIdToImgMap = await getTreeImages(daoClient);

    const newTrees = trees.filter(tree => tree.change_type === 'add');
    const editedTrees = trees.filter(tree => tree.change_type === 'edit');
    const deletedTrees = trees.filter(tree => tree.change_type === 'delete');

    await uploadDeletedTreesData(deletedTrees);
    deletedTrees.forEach(async (tree) => {
        await daoClient.trees.deleteLocalTree(tree.local_id);
    })

    await uploadEditedTreesData(editedTrees, saplingIdToImgMap);
    editedTrees.forEach(async (tree) => {
        await daoClient.trees.updateTreeUploadStatus(tree.local_id);
    })

    await uploadNewTreesData(newTrees, saplingIdToImgMap);
    newTrees.forEach(async (tree) => {
        await daoClient.trees.deleteLocalTree(tree.local_id);
    })

    for (let images of Object.values(saplingIdToImgMap)) {
        images['tree_image'] && await daoClient.treeImages.markImageUploaded(images['tree_image'].local_id);
        images['user_card_image'] && await daoClient.treeImages.markImageUploaded(images['user_card_image'].local_id);
        images['user_tree_image'] && await daoClient.treeImages.markImageUploaded(images['user_tree_image'].local_id);
    }
    await daoClient.treeImages.deleteUploadedImages();
}

export const uploadNewTreesData = async (trees: Tree[], saplingIdToImgMap: Record<string, any>) => {
    let apiClient = new ApiClient()
    let data = trees.map(tree => {
        const location = tree.location ? JSON.parse(tree.location) : { coordinates: [0, 0] };
        let treeReq: any = { ...tree, coordinates: location.coordinates}

        const images = saplingIdToImgMap[tree.sapling_id];
        if (images['tree_image']) treeReq = { ...treeReq, images: [{ name: images['tree_image'].name, data: images['tree_image'].data }] }
        if (images['user_card_image']) treeReq = { ...treeReq, user_card_image: { name: images['user_card_image'].name, data: images['user_card_image'].data } }
        if (images['user_tree_image']) treeReq = { ...treeReq, user_tree_image: { name: images['user_tree_image'].name, data: images['user_tree_image'].data } }
        return treeReq;
    })

    for (let i = 0; i < data.length; i += 5) {
        await apiClient.trees.uploadTrees(data.slice(i, i + 5));
    }
}

export const uploadEditedTreesData = async (trees: Tree[], saplingIdToImgMap: any) => {
    let apiClient = new ApiClient()
    let data = trees.map(tree => {
        const location = tree.location ? JSON.parse(tree.location) : null;
        let treeReq: any = { tree: {...tree, location: location} }

        const images = saplingIdToImgMap[tree.sapling_id];
        console.log(saplingIdToImgMap)
        if (images && images['tree_image']) treeReq = { ...treeReq, new_image: { name: images['tree_image'].name, data: images['tree_image'].data } }
        return treeReq
    })

    for (let i = 0; i < data.length; i++) {
        await apiClient.trees.updateTree(data[i]);
    }
}

export const uploadDeletedTreesData = async (trees: Tree[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < trees.length; i++) {
        await apiClient.trees.deleteTree(trees[i]);
    }
}