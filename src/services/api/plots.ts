import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Plots  , PlotHelperDataResponse} from "../../model/plots"
import { handleApiError } from "./handleError";

export class PlotsService {
    private api: AxiosInstance;
    
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getPlots(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<Plots>> {
        const url = `/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Plots>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotsClient::getPlots:", error)
        }
    }

    async searchPlots(searchStr: string): Promise<Plots[]> {
        try {
            const response = await this.api.get<Plots[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotsClient::searchPlots:", error)
        }
    }

    async createPlot(data: Plots): Promise<Plots> {
        try {
            const response = await this.api.post<Plots>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotsClient::createPlot:", error)
        }
    }

    async updatePlot(data: Plots): Promise<Plots> {
        try {
            const response = await this.api.put<Plots>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotsClient::updatePlot:", error)
        }
    }

    async deletePlot(data: Plots): Promise<number> {
        if (!data.id) throw new Error('Plot id required to delete plot!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("PlotClient::deletePlot:", error)
        }
    }

    async fetchChanges(timestamp: string, plot_ids: number[]): Promise<PlotHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/plots`;
        try {
            const response = await this.api.post<PlotHelperDataResponse>(url, { timestamp, plot_ids });
            return response.data;
        } catch (error: any) {
            return handleApiError("PlotsService::fetchChanges:", error)
        }
    }
}