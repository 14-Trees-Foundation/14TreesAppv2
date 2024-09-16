import { AxiosInstance } from "axios";
import { Image } from "../../model/common"
import { VisitImage, DeltaChangesResponse } from "../../model/visit_image"
import { handleApiError } from "./handleError";

export class VisitImageService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async createVisitImages(visitId: number, images: Image[]): Promise<VisitImage[]> {
        try {
            const response = await this.api.post<VisitImage[]>(`/api/visit-images/`, { visit_id: visitId, images: images });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitImageService::createVisitImages:", error)
        }
    }

    async deleteVisitImages(imageIds: number[]): Promise<void> {
        try {
            await this.api.post<void>(`/api/visit-images/delete`, { image_ids: imageIds });
        } catch (error: any) {
            return handleApiError("VisitImageService::deleteVisitImage:", error)
        }
    }

    async fetchChanges(timestamp: string, visit_image_ids: number[], offset: number, site_id?: number): Promise<DeltaChangesResponse> {
        const url = `/api/appv2/fetchHelperData/visit-images`;
        try {
            const response = await this.api.post<DeltaChangesResponse>(url, { site_id, timestamp, visit_image_ids, offset });
            return response.data;
        } catch (error: any) {
            return handleApiError("VisitImageService::fetchChanges:", error)
        }
    }
}