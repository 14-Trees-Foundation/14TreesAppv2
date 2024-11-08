import { AxiosInstance } from "axios";
import { SyncInfo, DeltaChangesResponse } from "../../model/sync_info"

export class SyncInfoService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async createSyncInfo(syncInfo: SyncInfo, userId: number): Promise<SyncInfo> {
        const response = await this.api.post<SyncInfo>(`/api/appv2/sync-history`, {sync_info: syncInfo, user_id: userId});
        return response.data;
    }

    async fetchDeltaChanges(timestamp: string, user_id: number, offset: number): Promise<DeltaChangesResponse> {
        const url = `/api/appv2/fetchHelperData/sync-history`;
        const response = await this.api.post<DeltaChangesResponse>(url, { user_id, timestamp, offset });
        return response.data;
    }
}