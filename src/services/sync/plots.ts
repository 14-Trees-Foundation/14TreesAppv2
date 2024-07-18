import { ToastAndroid } from "react-native";
import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import {Plots} from  "../../model/plots";
import { LocalDatabase } from "../db/db";

// TODO: Implement the api call in backend to fetch the changes only
export const fetchAndStorePlots = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

     const plotIds = await daoClient.plot.getLivePlotIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastUsersFetchedAt) || '2020-01-01T00:00:00Z'
    
    try {
        const now = new Date().toISOString();
        const response = await apiClient.plots.fetchChanges(timestamp, plotIds)
        const plots = response.plots;

        // upload plot in local db
        for (const plot of plots) {
            // user.roles = user.roles ? (user.roles as any).join(',') : '';
            await daoClient.plot.upsertLivePlotIntoLocalDb(plot);
        }

        // delete plots in local db
        for (const plotId of response.deleted_plots_ids) {
            await daoClient.plot.deleteLivePlotFromLocalDb(plotId);
        }
        await AsyncStorage.setItem(Constants.lastUsersFetchedAt, now);
        console.log('Plots fetch Done!')
    } catch(err: any) {
        console.log('Inside fetchAndStorePlots:', err)
    }
}

export const uploadPlotsData = async () => {

    const daoClient = await DaoClient.authenticate();
    const plots = await daoClient.plot.getPlots(0, -1, undefined, true);


    const newPlots = plots.filter(plot => plot.change_type === 'add');
    const editedPlots = plots.filter(plot => plot.change_type === 'edit');
    const deletedPlots = plots.filter(plot => plot.change_type === 'delete');


    await uploadDeletedPlotsData(deletedPlots);
    deletedPlots.forEach(async (plot) => {
        await daoClient.plot.deleteLocalUser(plot.local_id);
    })

    await uploadEditedPlotsData(editedPlots);
    editedPlots.forEach(async (plot) => {
        await daoClient.plot.updateUserUploadStatus(plot.local_id);
    })

    await uploadNewPlotsData(newPlots);
    newPlots.forEach(async (plot) => {
        await daoClient.plot.deleteLocalUser(plot.local_id);
    })
}

export const uploadNewPlotsData = async (plots: Plots[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        await apiClient.plots.createPlot(plots[i]);
    }
}

export const uploadEditedPlotsData = async (plots: Plots[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        await apiClient.plots.updatePlot(plots[i]);
    }
}

export const uploadDeletedPlotsData = async (plots: Plots[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        await apiClient.plots.deletePlot(plots[i]);
    }
}