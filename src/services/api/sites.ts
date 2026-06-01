import { AxiosInstance } from "axios";
import { PaginatedResponse } from "../../model/common"
import { LocationSite, Site, SiteHelperDataResponse } from "../../model/sites"
import { handleApiError } from "./handleError";
import { MAHARASHTRA_LOCATION_ID } from "../../constants/constants";

export class SiteService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getSites(offset: number, limit: number): Promise<PaginatedResponse<LocationSite>> {
        const url = `/api/locations?type=site&ancestor_id=${MAHARASHTRA_LOCATION_ID}&offset=${offset}&limit=${limit}`;
        const response = await this.api.get<PaginatedResponse<LocationSite>>(url);
        return response.data;
    }

    async createSite(data: Site): Promise<Site> {
        try {
            const response = await this.api.post<Site>(`/api/sites`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("SitesClient::createSites:", error)
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

    async fetchChanges(timestamp: string, site_ids: number[], offset: number): Promise<SiteHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/sites`;
        try {
            const response = await this.api.post<SiteHelperDataResponse>(url, { timestamp, site_ids, offset });
            return response.data;
        } catch (error: any) {
            return handleApiError("SiteService::fetchChanges:", error)
        }
    }
}