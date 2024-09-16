import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Visit, VisitHelperDataResponse } from "../../model/visits"
import { handleApiError } from "./handleError";

export class VisitService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getVisits(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<Visit>> {
        const url = `/api/visits/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Visit>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitService::getVisits:", error)
        }
    }

    async createVisit(data: Visit): Promise<Visit> {
        try {
            const response = await this.api.post<Visit>(`/api/visits/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitService::createVisit:", error)
        }
    }

    async updateVisit(data: Visit): Promise<Visit> {
        try {
            const response = await this.api.put<Visit>(`/api/visits/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitService::updateVisit:", error)
        }
    }

    async deleteVisit(data: Visit): Promise<number> {
        if (!data.id) throw new Error('Visit id required to delete visit!')
        try {
            await this.api.delete<any>(`/api/visits/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("VisitService::deleteVisit:", error)
        }
    }

    async fetchChanges(timestamp: string, visit_ids: number[], offset: number, site_id?: number): Promise<VisitHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/visits`;
        try {
            const response = await this.api.post<VisitHelperDataResponse>(url, { site_id, timestamp, visit_ids, offset });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitService::fetchChanges:", error)
        }
    }
}