
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { Image } from "../../model/common";

export const fetchAndStoreVisitImages = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    const visitImageIds = await daoClient.visitImages.getLiveVisitImageIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastVisitImagesFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();
        const response = await apiClient.visitImages.fetchChanges(timestamp, visitImageIds)
        const visitImages = response.visit_images;
        console.log(JSON.stringify(response))
        // upload visit images in local db
        for (const visitImage of visitImages) {
            await daoClient.visitImages.upsertLiveVisitIntoLocalDb(visitImage);
        }

        // delete visit images in local db
        for (const visitImageId of response.deleted_visit_image_ids) {
            await daoClient.visitImages.deleteLiveVisitFromLocalDb(visitImageId);
        }

        await AsyncStorage.setItem(Constants.lastVisitImagesFetchedAt, now);
        console.log('Visit images fetch Done!')
    } catch(err: any) {
        console.log('Inside fetchAndStoreVisitImages:', err)
    }
}

export const uploadVisitImagesData = async () => {
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();
    const visitImages = await daoClient.visitImages.getVisitImages(false);

    let visitIds: number[] = [];
    let visitImagesMap: Record<number, Image[]> = {};
    for (let visitImage of visitImages) {
        if (Object.hasOwn(visitImagesMap, visitImage.visit_id)) {
            visitImagesMap[visitImage.visit_id].push({ name: visitImage.name, data: visitImage.data });
        } else {
            visitIds.push(visitImage.visit_id);
            visitImagesMap[visitImage.visit_id] = [{ name: visitImage.name, data: visitImage.data }]
        }
    }

    for (const visitId of visitIds) {
        const images = visitImagesMap[visitId];
        await apiClient.visitImages.createVisitImages(visitId, images)
    }

    for (const image of visitImages) {
        await daoClient.visitImages.markImageUploaded(image.local_id)
    }
    await daoClient.visitImages.deleteUploadedImages();
}
