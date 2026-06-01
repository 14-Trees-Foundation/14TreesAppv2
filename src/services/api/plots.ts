import { AxiosInstance } from "axios";
import { LocationPlot, Plot, PlotHelperDataResponse} from "../../model/plot"
import { handleApiError } from "./handleError";

export class PlotService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getPlots(siteLocationId: number): Promise<LocationPlot[]> {
        const url = `/api/locations/hierarchy?parent_id=${siteLocationId}`;
        try {
            const response = await this.api.get<{ locations: LocationPlot[] }>(url);
            return response.data.locations ?? [];
        } catch (error: any) {
            return handleApiError("PlotService::getPlots:", error)
        }
    }

    async createPlot(data: Plot): Promise<Plot> {
        try {
            const response = await this.api.post<Plot>(`/api/plots/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotService::createPlot:", error)
        }
    }

    async updatePlot(data: Plot): Promise<Plot> {
        try {
            const response = await this.api.put<Plot>(`api/plots/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotService::updatePlot:", error)
        }
    }

    async deletePlot(data: Plot): Promise<number> {
        if (!data.id) throw new Error('Plot id required to delete plot!')
        try {
            await this.api.delete<any>(`/api/plots/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("PlotService::deletePlot:", error)
        }
    }

    async fetchChanges(timestamp: string, plot_ids: number[], offset: number, location_id?: number): Promise<PlotHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/plots`;
        try {
            const response = await this.api.post<PlotHelperDataResponse>(url, { location_id, timestamp, plot_ids, offset });
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotService::fetchChanges:", error)
        }
    }
}