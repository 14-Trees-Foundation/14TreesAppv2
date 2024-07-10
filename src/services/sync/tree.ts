
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { Tree } from "../../model/tree";

export const fetchAndStoreTrees = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    const treeIds = await daoClient.trees.getLiveTreeIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastTreesFetchedAt) || '2024-07-08T00:00:00Z'

    const response = await apiClient.trees.fetchChanges(timestamp, treeIds)
    const trees = response.trees;
    
    // upload trees in local db
    for (const tree of trees) {
        tree.location = tree.location ? JSON.stringify(tree.location) : null;
        await daoClient.trees.upsertLiveTreeIntoLocalDb(tree);
    }

    // delete trees in local db
    for (const treeId of response.deleted_tree_ids) {
        await daoClient.trees.deleteLiveTreeFromLocalDb(treeId);
    }
    console.log('Done')
}

export const uploadTreesData = async () => {
    const daoClient = await DaoClient.authenticate();
    const trees = await daoClient.trees.getTrees(0, -1, undefined, true);

    const newTrees = trees.filter(tree => tree.change_type === 'add');
    const editedTrees = trees.filter(tree => tree.change_type === 'edit');
    const deletedTrees = trees.filter(tree => tree.change_type === 'delete');
    console.log(deletedTrees)
    await uploadDeletedTreesData(deletedTrees);
    deletedTrees.forEach(async (tree) => {
        await daoClient.trees.deleteLocalTree(tree.local_id);
    })

    await uploadEditedTreesData(editedTrees);
    editedTrees.forEach(async (tree) => {
        await daoClient.trees.updateTreeUploadStatus(tree.local_id);
    })

    await uploadNewTreesData(newTrees);
    newTrees.forEach(async (tree) => {
        await daoClient.trees.deleteLocalTree(tree.local_id);
    })
}

export const uploadNewTreesData = async (trees: Tree[]) => {
    let apiClient = new ApiClient()
    let data = trees.map(tree => {
        const location = tree.location ? JSON.parse(tree.location) : { coordinates: [0, 0] };
        return { ...tree, coordinates: location.coordinates}
    })
    for (let i = 0; i < data.length; i += 5) {
        await apiClient.trees.uploadTrees(data.slice(i, i + 5));
    }
}

export const uploadEditedTreesData = async (trees: Tree[]) => {
    let apiClient = new ApiClient()
    let data = trees.map(tree => {
        const location = tree.location ? JSON.parse(tree.location) : null;
        return { ...tree, location: location}
    })
    for (let i = 0; i < data.length; i++) {
        await apiClient.trees.updateTree({ tree: data[i] });
    }
}

export const uploadDeletedTreesData = async (trees: Tree[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < trees.length; i++) {
        await apiClient.trees.deleteTree(trees[i]);
    }
}