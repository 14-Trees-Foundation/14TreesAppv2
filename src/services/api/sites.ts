import { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Site, SiteHelperDataResponse } from "../../model/sites"
import { handleApiError } from "./handleError";

export class SiteService {
    private api: AxiosInstance;
    
    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getSites(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<Site>> {
        const url = `/api/sites/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Site>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::getSites:", error)
        }
    }

    async createSite(data: Site): Promise<Site> {
        try {
            const response = await this.api.post<Site>(`/api/sites`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::createSiets:", error)
        }
    }

    async updateSite(data: Site): Promise<Site> {
        try {
            const response = await this.api.put<Site>(`/api/sites/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::updateSite:", error)
        }
    }

    async deleteSite(data: Site): Promise<number> {
        if (!data.id) throw new Error('Site id required to delete Site!')
        try {
            await this.api.delete<any>(`/api/sites/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("SitesClient::deleteSite:", error)
        }
    }

    async fetchChanges(timestamp: string, site_ids: number[]): Promise<SiteHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/sites`;
        try {
            const response = await this.api.post<SiteHelperDataResponse>(url, { timestamp, site_ids });
            return response.data;
        } catch (error: any) {
            return handleApiError("SiteService::fetchChanges:", error)
        }
    }
}