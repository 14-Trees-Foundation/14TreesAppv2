
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { ToastAndroid } from "react-native";
import { VisitImage } from "../../model/visit_image";
import { saveSyncInfo } from "./sync_info";
import { INITIAL_TIMESTAMP } from "../../constants/constants";

export const fetchAndStoreVisitImages = async (siteId?: number) => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let visitImageIds = await daoClient.visitImages.getLiveVisitImageIds()
    let timestamp = await AsyncStorage.getItem(Constants.lastVisitImagesFetchedAt) || INITIAL_TIMESTAMP
    if (siteId) {
        const resp = await daoClient.siteSync.getSiteLastSyncTime(siteId, Constants.lastVisitImagesFetchedAt);
        if (resp && new Date(timestamp).getTime() < new Date(resp.created_at).getTime()) timestamp = resp.created_at;
    }

    try {
        const now = new Date().toISOString();

        let offset = 0;
        while (true) {
            const response = await apiClient.visitImages.fetchChanges(timestamp, visitImageIds, offset, siteId)
            const visitImages = response.visit_images;

            // upload visit images in local db
            for (const visitImage of visitImages) {
                await daoClient.visitImages.upsertLiveVisitIntoLocalDb(visitImage);
            }

            // delete visit images in local db
            for (const visitImageId of response.deleted_visit_image_ids) {
                await daoClient.visitImages.deleteLiveVisitImageFromLocalDb(visitImageId);
            }

            visitImageIds = []
            offset += visitImages.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }

        if (siteId) await daoClient.siteSync.createLastSyncTime(siteId, Constants.lastVisitImagesFetchedAt, now);
        else await AsyncStorage.setItem(Constants.lastVisitImagesFetchedAt, now);
        
        console.log('Visit images fetch Done!')
        ToastAndroid.show('Visit Images data upto date!', ToastAndroid.LONG)
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

export const uploadVisitImagesData = async (syncTime: string) => {
    try {
        const daoClient = await DaoClient.authenticate();
        const visitImages = await daoClient.visitImages.getVisitImages(false);
        const deletedImages = visitImages.filter(image => image.is_deleted === 1)
        const newImages = visitImages.filter(image => image.is_deleted === 0)
    
        const syncInfo = await Utils.getSyncInfoBySyncTime(syncTime);
    
        await deleteImages(daoClient, deletedImages, syncInfo);
        await uploadNewImages(daoClient, newImages, syncInfo);
    
        await daoClient.visitImages.deleteUploadedImages();
    } catch(error: any) {
        Utils.saveErrorLog("UploadVisitImages::uploadVisitImagesData", error)
    }
}

const deleteImages = async (daoClient: DaoClient, images: VisitImage[], syncInfo: any) => {
    try {
        const apiClient = new ApiClient();
        let imageIds: number[] = [] 
        images.forEach(image => { if (image.id) imageIds.push(image.id) });
    
        await apiClient.visitImages.deleteVisitImages(imageIds);
    
        for (const image of images) {
            await daoClient.visitImages.markImageUploaded(image.local_id);
            syncInfo.visit_images.delete += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        }
    } catch(error: any) {
        Utils.saveErrorLog("UploadVisitImages::deleteImages", error)
    }
}

const uploadNewImages = async (daoClient: DaoClient, visitImages: VisitImage[], syncInfo: any) => {
    const apiClient = new ApiClient();

    let visitIds: number[] = [];
    let visitImagesMap: Record<number, VisitImage[]> = {};
    for (let visitImage of visitImages) {
        if (Object.hasOwn(visitImagesMap, visitImage.visit_id)) {
            visitImagesMap[visitImage.visit_id].push(visitImage);
        } else {
            visitIds.push(visitImage.visit_id);
            visitImagesMap[visitImage.visit_id] = [visitImage]
        }
    }

    for (const visitId of visitIds) {

        try {
            const stopSync = await AsyncStorage.getItem(Constants.isForceSyncStop);
            if (stopSync) break;
            
            const images = visitImagesMap[visitId];
            await apiClient.visitImages.createVisitImages(visitId, images)
    
            for (const image of images) {
                await daoClient.visitImages.markImageUploaded(image.local_id);
                syncInfo.visit_images.add += 1;
                syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
                await saveSyncInfo(daoClient, syncInfo);
            }
        } catch(error: any) {
            Utils.saveErrorLog("UploadVisitImages::uploadNewImages", error)
        }
    }
}