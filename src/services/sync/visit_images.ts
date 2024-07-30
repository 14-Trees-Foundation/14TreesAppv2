
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { ToastAndroid } from "react-native";
import { VisitImage } from "../../model/visit_image";

export const fetchAndStoreVisitImages = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let visitImageIds = await daoClient.visitImages.getLiveVisitImageIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastVisitImagesFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();

        let offset = 0;
        while (true) {
            const response = await apiClient.visitImages.fetchChanges(timestamp, visitImageIds, offset)
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

        await AsyncStorage.setItem(Constants.lastVisitImagesFetchedAt, now);
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

export const uploadVisitImagesData = async () => {
    
    const daoClient = await DaoClient.authenticate();
    const visitImages = await daoClient.visitImages.getVisitImages(false);
    const deletedImages = visitImages.filter(image => image.is_deleted === 1)
    const newImages = visitImages.filter(image => image.is_deleted === 0)

    await deleteImages(daoClient, deletedImages);
    await uploadNewImages(daoClient, newImages);

    await daoClient.visitImages.deleteUploadedImages();
}

const deleteImages = async (daoClient: DaoClient, images: VisitImage[]) => {
    const apiClient = new ApiClient();
    let imageIds: number[] = [] 
    images.forEach(image => { if (image.id) imageIds.push(image.id) });

    await apiClient.visitImages.deleteVisitImages(imageIds);

    for (const image of images) {
        await daoClient.visitImages.markImageUploaded(image.local_id)
    }
}

const uploadNewImages = async (daoClient: DaoClient, visitImages: VisitImage[]) => {
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
        const images = visitImagesMap[visitId];
        await apiClient.visitImages.createVisitImages(visitId, images)

        for (const image of images) {
            await daoClient.visitImages.markImageUploaded(image.local_id)
        }
    }
}