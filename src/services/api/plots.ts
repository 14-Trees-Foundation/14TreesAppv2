import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Plots } from "../../model/plots"
import { handleApiError } from "./handleError";

export class PlotsClient {
    private api: AxiosInstance;
    
    constructor() {
        const baseURL = 'https://dev-api.14trees.org/api/plots';
        this.api = axios.create({
          baseURL: baseURL,
        });
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

    async deleteUser(data: Plots): Promise<number> {
        if (!data.id) throw new Error('User id required to delete user!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("UserClient::deleteUser:", error)
        }
    }
}