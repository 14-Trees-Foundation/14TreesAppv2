import { ToastAndroid } from "react-native";
import { SitesClient } from "../api/sites";
import { LocalDatabase } from "../db/db";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStoreSites = async () => {
    // fetch data from the backend
    const apiClient = new SitesClient();
    const response = await apiClient.getSites(0, 1);
    const sites = response.results;
    // upload users in local db
    const localDb = await LocalDatabase.authenticate();
    for (const site of sites) {
        // await localDb.users.upsertLiveUserIntoLocalDb(site);
    }
}

export const uploadSitesData = async () => {

    const dbClient = await LocalDatabase.authenticate();;
    const apiClient = new SitesClient();
    
    if (!dbClient.users) {
        ToastAndroid.show("Something went wrong. please try again letter", 10);
        return;
    }
    try {
        const users = await dbClient.users.getLocalUsers(0, -1, false);
        for (const user of users ) {
            const resp = await apiClient.createSiets(site);
            if (!resp) console.log(user);
            else await dbClient.users.updateLocalUserUploadStatus(user.local_id);
        }
    } catch (error: any) {
        console.error("sync::uploadSitesData:", error.message, error.stack)
    }
}