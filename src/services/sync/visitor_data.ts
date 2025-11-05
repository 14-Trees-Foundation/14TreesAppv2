import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import { Constants, Utils } from "../Utils";
import { TreeImage } from "../../model/tree_image";
import { saveSyncInfo } from "./sync_info";

// Upload visitor-only images and reflect counts in sync_info.visitor_data
export const uploadVisitorData = async (syncTime: string) => {
    try {
        const daoClient = await DaoClient.authenticate();

        // Get all pending visitor images (two types)
        const treeImages = await daoClient.treeImages.getTreeImages('user_tree_image', false);
        const cardImages = await daoClient.treeImages.getTreeImages('user_card_image', false);
        const allImages = [...treeImages, ...cardImages];

        if (allImages.length === 0) return;

        const resp = await daoClient.syncInfo.getSyncInfoBySyncTime(syncTime);
        const syncInfo = {
            ...resp,
            trees: JSON.parse(resp.trees),
            tree_images: JSON.parse(resp.tree_images),
            visit_images: JSON.parse(resp.visit_images),
            visitor_data: typeof (resp as any).visitor_data === 'string' ? JSON.parse((resp as any).visitor_data) : ((resp as any).visitor_data || {"user_tree_image":0,"user_card_image":0})
        } as any;

        await uploadVisitorImages(daoClient, allImages, syncInfo);

        // Cleanup already-uploaded images (consistent with other flows)
        await daoClient.treeImages.deleteUploadedImages();
    } catch (error: any) {
        Utils.saveErrorLog("UploadVisitorData::uploadVisitorData", error);
    }
}

const uploadVisitorImages = async (daoClient: DaoClient, images: TreeImage[], syncInfo: any) => {
    const apiClient = new ApiClient();

    // Group by sapling_id to upload per sapling
    const grouped: Record<string, TreeImage[]> = {};
    for (const img of images) {
        grouped[img.sapling_id] = grouped[img.sapling_id] || [];
        grouped[img.sapling_id].push(img);
    }

    for (const saplingId of Object.keys(grouped)) {
        try {
            const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
            if (stopSync) break;

            const imgs = grouped[saplingId];

            // Build payload for /api/appv2/upload-visitor-images
            const payloadImages = imgs.map(i => ({ name: i.name, data: i.data, type: i.type as any }));

            // Derive optional visitorId from any image.user_id (local user id mapped to live id if present)
            // If not available, backend will still link via sapling_id later.
            const visitorId = imgs.find(i => !!i.user_id)?.user_id ?? undefined;

            // Derive optional visitId from any image.visit_id
            const visitId = imgs.find(i => !!i.visit_id)?.visit_id ?? undefined;

            await apiClient.trees.uploadVisitorImages(saplingId, payloadImages as any, visitId as any, visitorId as any);

            // Mark images and update counts
            for (const i of imgs) {
                await daoClient.treeImages.markImageUploaded(i.local_id);
                syncInfo.visitor_data[i.type] = (syncInfo.visitor_data[i.type] || 0) + 1;
                syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
                await saveSyncInfo(daoClient, syncInfo);
            }
        } catch (err: any) {
            Utils.saveErrorLog("UploadVisitorData::uploadVisitorImages", err);
        }
    }
}