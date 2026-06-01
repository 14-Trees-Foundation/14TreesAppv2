import { ApiClient } from "../api/api";
import { DaoClient } from "../db/dao";
import { ToastAndroid } from "react-native";
import { Utils } from "../Utils";

export const fetchAndStoreLocationPlots = async (siteLocationId: number) => {
    const apiClient = new ApiClient();
    const daoClient = await DaoClient.authenticate();

    try {
        await daoClient.locationPlots.clearByParent(siteLocationId);
        console.log(`[location_plots] cleared existing plots for site ${siteLocationId}`);

        const plots = await apiClient.plots.getPlots(siteLocationId);
        console.log(`[location_plots] API returned ${plots.length} plots for site ${siteLocationId}`);
        if (plots.length > 0) {
            console.log('[location_plots] first item sample:', JSON.stringify(plots[0]));
        }

        for (const plot of plots) {
            const oldPlot = await daoClient.plots.getPlotByExactName(plot.location_name);
            console.log(`[location_plots] plot="${plot.location_name}" old_plot_id=${oldPlot?.id ?? null}`);
            await daoClient.locationPlots.upsertLocationPlot(plot, oldPlot?.id ?? null);
        }

        console.log(`location_plots: fetched ${plots.length} plots for site ${siteLocationId}`);
        ToastAndroid.show('Plots data up to date!', ToastAndroid.LONG);
    } catch (error: any) {
        const errorLog = {
            msg: 'Error inside fetchAndStoreLocationPlots',
            error: JSON.stringify(error),
            stackTrace: error.stack,
        };
        await Utils.logException(JSON.stringify(errorLog));
    }
};
