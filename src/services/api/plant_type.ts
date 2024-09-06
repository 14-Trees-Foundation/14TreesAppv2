import { AxiosInstance } from "axios";
import { PlantTypeDeltaChangesResponse } from "../../model/plant_type"

export class PlantTypeService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async fetchChanges(timestamp: string, plant_type_ids: number[], offset: number): Promise<PlantTypeDeltaChangesResponse> {
        const url = `/api/appv2/fetchHelperData/plant-types`;
        const response = await this.api.post<PlantTypeDeltaChangesResponse>(url, { timestamp, plant_type_ids, offset });
        return response.data;
    }
}