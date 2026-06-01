import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import { Constants, Utils } from "../Utils";
import { INITIAL_TIMESTAMP } from "../../constants/constants";
import { ToastAndroid } from "react-native";

export const fetchAndStoreDeltaPlantTypes = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let plantTypeIds = await daoClient.plantTypes.getLivePlantTypeIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastPlantTypesFetchedAt) || INITIAL_TIMESTAMP

    try {
        const now = new Date().toISOString();

        let offset = 0;
        while (true) {
            const response = await apiClient.plantTypes.fetchChanges(timestamp, plantTypeIds, offset)
            const plantTypes = response.plant_types;

            // upload visit images in local db
            for (const plantType of plantTypes) {
                await daoClient.plantTypes.upsertLivePlantTypeIntoLocalDb(plantType);
            }

            // delete visit images in local db
            for (const plantTypeId of response.deleted_plant_type_ids) {
                await daoClient.plantTypes.deleteLivePlantTypeFromLocalDb(plantTypeId);
            }

            plantTypeIds = []
            offset += plantTypes.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }

        await AsyncStorage.setItem(Constants.lastPlantTypesFetchedAt, now);
        console.log('Plant types fetch Done!')
        ToastAndroid.show('Plant types data upto date!', ToastAndroid.LONG)
    } catch (error: any) {
        const stackTrace = error.stack;
        const errorLog = {
            msg: 'Error inside fetchAndStoreDeltaPlantTypes',
            error: JSON.stringify(error),
            stackTrace: stackTrace,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
}