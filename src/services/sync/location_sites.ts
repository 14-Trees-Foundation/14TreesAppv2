import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import { ToastAndroid } from "react-native";
import { Utils } from "../Utils";
import { MAHARASHTRA_LOCATION_ID } from "../../constants/constants";

export const fetchAndStoreLocationSites = async () => {
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    try {
        await daoClient.locationSites.clearAll();

        let offset = 0;
        const limit = 100;
        while (true) {
            const response = await apiClient.sites.getSites(offset, limit);
            console.log(`[location_sites] batch offset=${offset} received=${response.results.length} total=${response.total}`);
            if (offset === 0 && response.results.length > 0) {
                console.log('[location_sites] first item sample:', JSON.stringify(response.results[0]));
            }
            for (const site of response.results) {
                await daoClient.locationSites.upsertLocationSite(site);
            }

            offset += response.results.length;
            console.log(`location_sites: ${offset}/${response.total}`);
            if (offset >= response.total || response.results.length === 0) break;
        }
        const localCount = await daoClient.locationSites.getLocationSites(0, -1);
        console.log(`[location_sites] local DB count after sync: ${localCount.length}`);

        console.log('Location sites fetch done!');
        ToastAndroid.show('Sites data up to date!', ToastAndroid.LONG);
    } catch (error: any) {
        const errorLog = {
            msg: 'Error inside fetchAndStoreLocationSites',
            error: JSON.stringify(error),
            stackTrace: error.stack,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
};
