import { DaoClient } from "../db/dao";


export const saveSyncInfo = async (daoClient: DaoClient, info: any) => {
    const data = JSON.parse(JSON.stringify(info)); // copy
    
    data.trees = JSON.stringify(data.trees);
    data.tree_images = JSON.stringify(data.tree_images);
    data.visit_images = JSON.stringify(data.visit_images);
    await daoClient.syncInfo.createSyncInfo(data);
}