
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { User } from "../../model/user";
import { ToastAndroid } from "react-native";
import { saveSyncInfo } from "./sync_info";

export const fetchAndStoreUsers = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let userIds = await daoClient.users.getLiveUserIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastUsersFetchedAt) || '2020-01-01T00:00:00Z'

    try {
        const now = new Date().toISOString();
        
        let offset = 0;
        while (true) {
            const response = await apiClient.users.fetchChanges(timestamp, userIds, offset)
            const users = response.users;

            // upload users in local db
            for (const user of users) {
                user.roles = user.roles ? (user.roles as any).join(',') : '';
                await daoClient.users.upsertLiveUserIntoLocalDb(user);
            }

            // delete users in local db
            for (const userId of response.deleted_user_ids) {
                await daoClient.users.deleteLiveUserFromLocalDb(userId);
            }

            userIds = []
            offset += users.length;
            console.log(offset + "/" + response.total)
            if (offset >= response.total) break;
        }
        
        await AsyncStorage.setItem(Constants.lastUsersFetchedAt, now);
        console.log('Users fetch Done!')
        ToastAndroid.show('users data upto date!', ToastAndroid.LONG)
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

export const uploadUsersData = async (syncTime: string) => {

    try {
        const daoClient = await DaoClient.authenticate();
        const users = await daoClient.users.getUsers(0, -1, undefined, true);
    
        const newUsers = users.filter(user => user.change_type === 'add');
        const editedUsers = users.filter(user => user.change_type === 'edit');
        const deletedUsers = users.filter(user => user.change_type === 'delete');
    
        const syncInfo = await Utils.getSyncInfoBySyncTime(syncTime);
        await uploadDeletedUsersData(daoClient, deletedUsers, syncInfo);
        await uploadEditedUsersData(daoClient, editedUsers, syncInfo);
        await uploadNewUsersData(daoClient, newUsers, syncInfo);
    } catch (error: any) {
        Utils.saveErrorLog("UploadUser::uploadUsersData", error);
    }
}

export const uploadSingleUsersData = async (localId: number, syncTime: string) => {

    try {
        const daoClient = await DaoClient.authenticate();
        const user = await daoClient.users.getUserByLocalId(localId);
    
        const syncInfo = await Utils.getSyncInfoBySyncTime(syncTime);
        if (user && user.change_type === 'edit') await uploadEditedUsersData(daoClient, [user], syncInfo);
        if (user && user.change_type === 'add') await uploadNewUsersData(daoClient, [user], syncInfo);
    } catch (error: any) {
        Utils.saveErrorLog("UploadUser::uploadUsersData", error);
    }
}

export const uploadNewUsersData = async (daoClient: DaoClient, users: User[], syncInfo: any) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        try {
            const user = await apiClient.users.createUser(users[i]);
            user.local_id = users[i].local_id;
            await daoClient.users.updateLiveUserByLocalId(user);

            syncInfo.users.add += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        } catch (error: any) {
            Utils.saveErrorLog("UploadUser::uploadNewUsersData", error);
        }
    }
}

export const uploadEditedUsersData = async (daoClient: DaoClient, users: User[], syncInfo: any) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        try {
            const user = await apiClient.users.updateUser(users[i]);
            user.local_id = users[i].local_id;
            await daoClient.users.updateLiveUserByLocalId(user);

            syncInfo.users.edit += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        } catch (error: any) {
            Utils.saveErrorLog("UploadUser::uploadEditedUsersData", error);
        }
    }
}

export const uploadDeletedUsersData = async (daoClient: DaoClient, users: User[], syncInfo: any) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        try {
            await apiClient.users.deleteUser(users[i]);
            await daoClient.users.deleteLocalUser(users[i].local_id);

            syncInfo.users.delete += 1;
            syncInfo.upload_time = new Date().getTime() - new Date(syncInfo.synced_at).getTime();
            await saveSyncInfo(daoClient, syncInfo);
        } catch (error: any) {
            Utils.saveErrorLog("UploadUser::uploadDeletedUsersData", error);
        }
    }
}