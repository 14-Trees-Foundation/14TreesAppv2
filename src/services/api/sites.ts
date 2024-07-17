import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Sites , CreateSiteRequest , SiteHelperDataResponse } from "../../model/sites"
import { handleApiError } from "./handleError";

export class SitesClient {
    private api: AxiosInstance;

    
    constructor(api: AxiosInstance) {
        this.api = api;
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

    async fetchChanges(timestamp: string, site_ids: number[]): Promise<SiteHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/users`;
        try {
            const response = await this.api.post<SiteHelperDataResponse>(url, { timestamp, site_ids });
            return response.data;
        } catch (error: any) {
            return handleApiError("SiteService::fetchChanges:", error)
        }
    }
}