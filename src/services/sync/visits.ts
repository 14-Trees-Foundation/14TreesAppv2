
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { Visit } from "../../model/visits";
import { ToastAndroid } from "react-native";
import { INITIAL_TIMESTAMP } from "../../constants/constants";

export const fetchAndStoreVisits = async (siteId: number | undefined) => {
    console.log("fetchAndStoreVisits: for site: ", siteId)
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let visitIds = await daoClient.visits.getLiveVisitIds()
    let timestamp = await AsyncStorage.getItem(Constants.lastVisitsFetchedAt) || INITIAL_TIMESTAMP
    // if (siteId) {
    //     const resp = await daoClient.siteSync.getSiteLastSyncTime(siteId, Constants.lastVisitsFetchedAt);
    //     if (resp && new Date(timestamp).getTime() < new Date(resp.created_at).getTime()) timestamp = resp.created_at;
    // }

    try {
        const now = new Date().toISOString();

        let offset: number = 0;
        while (true) {
            const response = await apiClient.visits.fetchChanges(timestamp, visitIds, offset, siteId)
            const visits = response.visits;

            // upload visits in local db
            for (const visit of visits) {
                await daoClient.visits.upsertLiveVisitIntoLocalDb(visit);
            }

            // delete visits in local db
            for (const visitId of response.deleted_visit_ids) {
                await daoClient.visits.deleteLiveVisitFromLocalDb(visitId);
            }

            visitIds = []
            offset += visits.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }
        
        if (siteId) await daoClient.siteSync.createLastSyncTime(siteId, Constants.lastVisitsFetchedAt, now);
        else await AsyncStorage.setItem(Constants.lastVisitsFetchedAt, now);

        console.log('visits fetch Done!')
        ToastAndroid.show('Visits data upto date!', ToastAndroid.LONG)
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