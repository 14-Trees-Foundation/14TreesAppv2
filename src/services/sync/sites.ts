import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { Site } from "../../model/sites";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStoreSites = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    const siteIds = await daoClient.sites.getLiveSiteIds();
    const timestamp = await AsyncStorage.getItem(Constants.lastSitesFetchedAt) || '2020-01-01T00:00:00Z';

   try {
        const now = new Date().toISOString();
        const response = await apiClient.sites.fetchChanges(timestamp, siteIds)
        const sites = response.sites;

        // upload sites in local db
        for (const site of sites) {
            // await daoClient.sites.upsertLiveUserIntoLocalDb(site);
        }

        // delete sites in local db
        for (const siteId of response.deleted_site_ids) {
            await daoClient.sites.deleteLiveSiteFromLocalDb(siteId);
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
        await daoClient.sites.deleteLocalSite(site.local_id);
    })

    await uploadEditedSitesData(editedSites);
    editedSites.forEach(async (site) => {
        await daoClient.sites.updateSiteUploadStatus(site.local_id);
    })

    await uploadNewSitesData(newSites);
    newSites.forEach(async (site) => {
        await daoClient.sites.deleteLocalSite(site.local_id);
    })
}

export const uploadNewSitesData = async (sites: Site[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < sites.length; i++) {
        await apiClient.sites.createSite(sites[i]);
    }
}

export const uploadEditedSitesData = async (sites: Site[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < sites.length; i++) {
        await apiClient.sites.updateSite(sites[i]);
    }
}

export const uploadDeletedSitesData = async (sites: Site[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < sites.length; i++) {
        await apiClient.sites.deleteSite(sites[i]);
    }
}