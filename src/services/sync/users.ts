import { ToastAndroid } from "react-native";
import { UserClient } from "../api/users";
import { LocalDatabase } from "../db/db"

const uploadUsersData = async () => {

    const dbClient = new LocalDatabase();
    const apiClient = new UserClient();
    
    if (!dbClient.users) {
        ToastAndroid.show("Something went wrong. please try again letter", 10);
        return;
    }
    try {
        const users = await dbClient.users.getLocalUsers(0, -1, false);
        for (const user of users ) {
            const resp = await apiClient.createUser(user);
            if (!resp) console.log(user);
        }
    } catch (error: any) {
        console.error("sync::uploadUsersData:", error.message, error.stack)
    }
}