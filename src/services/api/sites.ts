import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Sites } from "../../model/sites"
import { handleApiError } from "./handleError";

export class SitesClient {
    private api: AxiosInstance;
    
    constructor() {
        const baseURL = 'https://dev-api.14trees.org/api/sites';
        this.api = axios.create({
          baseURL: baseURL,
        });
    }

    async getSites(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<Sites>> {
        const url = `/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Sites>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::getSites:", error)
        }
    }

    async searchSites(searchStr: string): Promise<Sites[]> {
        try {
            const response = await this.api.get<Sites[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::searchSites:", error)
        }
    }

    async createSiets(data: Sites): Promise<Sites> {
        try {
            const response = await this.api.post<Sites>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::createSiets:", error)
        }
    }

    async updateSite(data: Sites): Promise<Sites> {
        try {
            const response = await this.api.put<Sites>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::updateSite:", error)
        }
    }

    async deleteSite(data: Sites): Promise<number> {
        if (!data.id) throw new Error('Site id required to delete Site!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("SitesClient::deleteSite:", error)
        }
    }
}