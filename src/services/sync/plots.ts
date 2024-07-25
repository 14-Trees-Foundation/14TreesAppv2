import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";
import { Plot } from  "../../model/plot";

export const fetchAndStorePlots = async () => {
    // fetch data from the backend
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    let plotIds = await daoClient.plots.getLivePlotIds()
    const timestamp = await AsyncStorage.getItem(Constants.lastPlotsFetchedAt) || '2020-01-01T00:00:00Z'
    
    try {
        const now = new Date().toISOString();

        let offset: number = 0;
        while (true) {
            const response = await apiClient.plots.fetchChanges(timestamp, plotIds, offset)
            const plots = response.plots;

            // upload plot in local db
            for (const plot of plots) {
                plot.tags = plot.tags ? (plot.tags as any).join(',') : '';
                await daoClient.plots.upsertLivePlotIntoLocalDb(plot);
            }

            // delete plots in local db
            for (const plotId of response.deleted_plot_ids) {
                await daoClient.plots.deleteLivePlotFromLocalDb(plotId);
            }

            plotIds = []
            offset += plots.length;
            console.log(offset+"/"+response.total)
            if (offset >= response.total) break;
        }

        await AsyncStorage.setItem(Constants.lastPlotsFetchedAt, now);
        console.log('Plots fetch Done!')
    } catch(err: any) {
        console.log('Inside fetchAndStorePlots:', err)
    }
}

export const uploadPlotsData = async () => {

    const daoClient = await DaoClient.authenticate();
    const plots = await daoClient.plots.getPlots(0, -1, undefined, true);


    const newPlots = plots.filter(plot => plot.change_type === 'add');
    const editedPlots = plots.filter(plot => plot.change_type === 'edit');
    const deletedPlots = plots.filter(plot => plot.change_type === 'delete');


    await uploadDeletedPlotsData(deletedPlots);
    deletedPlots.forEach(async (plot) => {
        await daoClient.plots.deleteLocalPlot(plot.local_id);
    })

    await uploadEditedPlotsData(editedPlots);
    editedPlots.forEach(async (plot) => {
        await daoClient.plots.updatePlotUploadStatus(plot.local_id);
    })

    await uploadNewPlotsData(newPlots);
    newPlots.forEach(async (plot) => {
        await daoClient.plots.deleteLocalPlot(plot.local_id);
    })
}

export const uploadNewPlotsData = async (plots: Plot[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        const data: any = { ...plots[i], tags: plots[i].tags ? plots[i].tags?.split(',') : null }
        await apiClient.plots.createPlot(data);
    }
}

export const uploadEditedPlotsData = async (plots: Plot[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        const data: any = { ...plots[i], tags: plots[i].tags ? plots[i].tags?.split(',') : null }
        await apiClient.plots.updatePlot(data);
    }
}

export const uploadDeletedPlotsData = async (plots: Plot[]) => {
    let apiClient = new ApiClient()
    for (let i = 0; i < plots.length; i++) {
        await apiClient.plots.deletePlot(plots[i]);
    }
}