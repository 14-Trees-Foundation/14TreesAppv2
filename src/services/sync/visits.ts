
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { Visit } from "../../model/visits";

export const fetchAndStoreVisits = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    const visitIds = await daoClient.visits.getLiveVisitIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastVisitFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();
        const response = await apiClient.visits.fetchChanges(timestamp, visitIds)
        const visits = response.visit;

        // upload visits in local db
        for (const visit of visits) {
            // user.roles = user.roles ? (user.roles as any).join(',') : '';
            await daoClient.visits.upsertLiveVisitIntoLocalDb(visit);
        }

        // delete visits in local db
        for (const visitId of response.deleted_visit_ids) {
            await daoClient.visits.deleteLiveVisitFromLocalDb(visitId);
        }
        await AsyncStorage.setItem(Constants.lastVisitFetchedAt, now);
        console.log('visits fetch Done!')
    } catch(err: any) {
        console.log('Inside fetchAndStorevisits:', err)
    }
}

export const uploadVisitData = async () => {
    const daoClient = await DaoClient.authenticate();
    const visits = await daoClient.visits.getVisits(0, -1, undefined, true);

    const newVisit = visits.filter(visit => visit.change_type === 'add');
    const editedVisits = visits.filter(visit => visit.change_type === 'edit');
    const deletedVisits = visits.filter(visit => visit.change_type === 'delete');

    await uploadDeletedVisitData(deletedVisits);
    deletedVisits.forEach(async (visit) => {
        await daoClient.visits.deleteLocalVisit(visit.local_id);
    })

    await uploadEditedVisitData(editedVisits);
    editedVisits.forEach(async (visit) => {
        await daoClient.visits.updateVisitUploadStatus(visit.local_id);
    })

    await uploadNewVisitData(newVisit);
    newVisit.forEach(async (visit) => {
        await daoClient.visits.deleteLocalVisit(visit.local_id);
    })

}

export const uploadNewVisitData = async (visits: Visit[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < visits.length; i++) {
        await apiClient.visits.createVisit(visits[i]);
    }
}

export const uploadEditedVisitData = async (visits: Visit[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < visits.length; i++) {
        await apiClient.visits.updateVisit(visits[i]);
    }
}

export const uploadDeletedVisitData = async (visits: Visit[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < visits.length; i++) {
        await apiClient.visits.deleteVisit(visits[i]);
    }
}