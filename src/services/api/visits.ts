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
        const url = `/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Visit>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitClient::getVists:", error)
        }
    }

    async searchVisits(searchStr: string): Promise<Visit[]> {
        try {
            const response = await this.api.get<Visit[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitClient::searchVists:", error)
        }
    }

    async createVisit(data: Visit): Promise<Visit> {
        try {
            const response = await this.api.post<Visit>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitClient::createVisit:", error)
        }
    }

    async updateVisit(data: Visit): Promise<Visit> {
        try {
            const response = await this.api.put<Visit>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitClient::updateVisit:", error)
        }
    }

    async deleteVisit(data: Visit): Promise<number> {
        if (!data.id) throw new Error('Visit id required to delete visit!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("VisitClient::deleteVisit:", error)
        }
    }

    async fetchChanges(timestamp: string, visit_ids: number[]): Promise<VisitHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/visits`;
        try {
            const response = await this.api.post<VisitHelperDataResponse>(url, { timestamp, visit_ids });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitClient::fetchChanges:", error)
        }
    }
}