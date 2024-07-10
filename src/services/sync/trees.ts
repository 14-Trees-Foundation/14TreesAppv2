import { ToastAndroid } from "react-native";
import { UserClient } from "../api/users";
import { LocalDatabase } from "../db/db";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStoreTrees = async () => {
    // fetch data from the backend
    const apiClient = new UserClient();
    const response = await apiClient.getUsers(0, 1);
    const users = response.results;
    // upload users in local db
    const localDb = await LocalDatabase.authenticate();
    for (const user of users) {
        await localDb.users.upsertLiveUserIntoLocalDb(user);
    }
}

// export const uploadUsersData = async () => {

//     const dbClient = await LocalDatabase.authenticate();;
//     const apiClient = new UserClient();
    
//     if (!dbClient.users) {
//         ToastAndroid.show("Something went wrong. please try again letter", 10);
//         return;
//     }
//     try {
//         const users = await dbClient.users.getLocalUsers(0, -1, false);
//         for (const user of users ) {
//             const resp = await apiClient.createUser(user);
//             if (!resp) console.log(user);
//             else await dbClient.users.updateLocalUserUploadStatus(user.local_id);
//         }
//     } catch (error: any) {
//         console.error("sync::uploadUsersData:", error.message, error.stack)
//     }
// }