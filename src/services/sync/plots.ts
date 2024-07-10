import { ToastAndroid } from "react-native";
import { PlotsClient } from "../api/plots";
import { LocalDatabase } from "../db/db";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStorePlots = async () => {
    // fetch data from the backend
    const apiClient = new PlotsClient();
    const response = await apiClient.getPlots(0, 1);
    const plots = response.results;
    // upload users in local db
    const localDb = await LocalDatabase.authenticate();
    for (const plot of plots) {
        // await localDb.users.upsertLiveUserIntoLocalDb(plot);
    }
}

export const uploadPlotssData = async () => {

    const dbClient = await LocalDatabase.authenticate();;
    const apiClient = new PlotsClient();
    
    if (!dbClient.plots) {
        ToastAndroid.show("Something went wrong. please try again letter", 10);
        return;
    }
    try {
        const plots = await dbClient.plots.getPlots(0, -1, false);
        for (const plot of plots ) {
            const resp = await apiClient.createPlot(plot);
            if (!resp) console.log(plot);
            // else await dbClient.users.updateLocalUserUploadStatus(plot.local_id);
        }
    } catch (error: any) {
        console.error("sync::uploadPlotsData:", error.message, error.stack)
    }
}