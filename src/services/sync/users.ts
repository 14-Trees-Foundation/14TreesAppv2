
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { User } from "../../model/user";
import { ToastAndroid } from "react-native";

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

export const uploadUsersData = async () => {
    const daoClient = await DaoClient.authenticate();
    const users = await daoClient.users.getUsers(0, -1, undefined, true);

    const newUsers = users.filter(user => user.change_type === 'add');
    const editedUsers = users.filter(user => user.change_type === 'edit');
    const deletedUsers = users.filter(user => user.change_type === 'delete');

    await uploadDeletedUsersData(deletedUsers);
    deletedUsers.forEach(async (user) => {
        await daoClient.users.deleteLocalUser(user.local_id);
    })

    await uploadEditedUsersData(editedUsers);
    editedUsers.forEach(async (user) => {
        await daoClient.users.updateUserUploadStatus(user.local_id);
    })

    await uploadNewUsersData(newUsers);
    newUsers.forEach(async (user) => {
        await daoClient.users.deleteLocalUser(user.local_id);
    })

}

export const uploadNewUsersData = async (users: User[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        await apiClient.users.createUser(users[i]);
    }
}

export const uploadEditedUsersData = async (users: User[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        await apiClient.users.updateUser(users[i]);
    }
}

export const uploadDeletedUsersData = async (users: User[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < users.length; i++) {
        await apiClient.users.deleteUser(users[i]);
    }
}