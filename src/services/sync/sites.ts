import { ToastAndroid } from "react-native";
import { SitesClient } from "../api/sites";
import { LocalDatabase } from "../db/db";
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStoreSites = async () => {
    // fetch data from the backend
    const apiClient = new SitesClient();
    const daoClient = await DaoClient.authenticate();

    // const siteIds = await daoClient.sites.getLiveSiteIds()

   try {
        const now = new Date().toISOString();
        const response = await apiClient.sites.fetchChanges(timestamp, siteIds)
        const sites = response.sites;

        // upload sites in local db
        for (const site of sites) {
            site.roles = site.roles ? (site.roles as any).join(',') : '';
            // await daoClient.sites.upsertLiveUserIntoLocalDb(site);
        }

        // delete sites in local db
        for (const siteId of response.deleted_site_ids) {
            // await daoClient.sites.deleteLiveUserFromLocalDb(userId);
        }
        await AsyncStorage.setItem(Constants.lastSitesFetchedAt, now);
        console.log('Sites fetch Done!')
    } catch(err: any) {
        console.log('Inside fetchAndStoreSites:', err)
    }
}

export const uploadSitesData = async () => {

    const daoClient = await DaoClient.authenticate();
    const sites = await daoClient.sites.getSites(0, -1, undefined, true);

    const newSites = sites.filter(site => site.change_type === 'add');
    const editedSites = sites.filter(site => site.change_type === 'edit');
    const deletedSites = sites.filter(site => site.change_type === 'delete');

    await uploadDeletedSitesData(deletedSites);
    deletedSites.forEach(async (site) => {
        // await daoClient.sites.delete(site.local_id);
    })

    await uploadEditedSitesData(editedSites);
    editedSites.forEach(async (site) => {
        // await daoClient.sites.updateUserUploadStatus(user.local_id);
    })

    await uploadNewSitesData(newSites);
    newSites.forEach(async (site) => {
        // await daoClient.sites.deleteLocalUsr(user.local_id);
    })
}