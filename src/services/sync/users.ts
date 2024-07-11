
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";

export const fetchAndStoreUsers = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    const userIds = await daoClient.users.getLiveUserIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastUsersFetchedAt) || '2024-07-01T00:00:00Z'

    const response = await apiClient.users.fetchChanges(timestamp, userIds)
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
    console.log('Fetch Users Done!')
}
