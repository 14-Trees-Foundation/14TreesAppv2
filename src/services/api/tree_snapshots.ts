import { AxiosInstance } from "axios";
import { Image } from "../../model/common"
import { TreeSnapshot, DeltaChangesResponse } from "../../model/tree_snapshot"
import { handleApiError } from "./handleError";

export class TreeSnapshotService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async createTreeSnapshots(saplingId: string, user_id: number, images: Image[]): Promise<TreeSnapshot[]> {
        try {
            const response = await this.api.post<TreeSnapshot[]>(`/api/tree-snapshots`, { sapling_id: saplingId, user_id: user_id, images: images });
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeSnapshotService::createVisitImages:", error)
        }
    }

    async deleteTreeSnapshots(imageIds: number[]): Promise<void> {
        try {
            await this.api.post<void>(`/api/tree-snapshots/delete`, { image_ids: imageIds });
        } catch (error: any) {
            return handleApiError("TreeSnapshotService::deleteTreeSnapshots:", error)
        }
    }

    async fetchChanges(timestamp: string, tree_snapshot_ids: number[], offset: number, site_id?: number): Promise<DeltaChangesResponse> {
        const url = `/api/appv2/fetchHelperData/tree-snapshots`;
        try {
            const response = await this.api.post<DeltaChangesResponse>(url, { site_id, timestamp, tree_snapshot_ids, offset });
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeSnapshotService::fetchChanges:", error)
        }
    }
}