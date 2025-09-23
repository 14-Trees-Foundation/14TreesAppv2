import { AxiosInstance } from "axios";
import { Tree, TreeAnalytics, TreeHelperDataResponse, TreePlantationInfo } from "../../model/tree"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants, Utils } from "../Utils";
import { FilterItem, PaginatedResponse } from "../../model/common";

export class TreeService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async fetchChanges(timestamp: string, tree_ids: number[], offset?: number, site_id?: number): Promise<TreeHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/trees`;
        const response = await this.api.post<TreeHelperDataResponse>(url, { site_id, timestamp, tree_ids, offset, limit: 10000 });
        return response.data;
    }

    async uploadTrees(trees: any[]) {
        const userId = await Utils.getUserId();
        const url = `/api/appv2/uploadTrees`;
        const response = await this.api.post(url, trees, { headers: { 'user-id': userId.toString() }});
        if (response) {
          return response.data;
        }
        return;
    }

    async updateTree(sapling: any) {
        const token =  await AsyncStorage.getItem(Constants.authToken);
        const url = `/api/appv2/updateSapling`;
        const response = await this.api.post(url, sapling, { headers: { 'x-access-token': token } });
        return response.data;
    }

    // Upload visitor-only images (no tree yet). Backend should link by sapling_id and visit_id.
    async uploadVisitorImages(
        saplingId: string,
        images: { name: string; data: string; type: 'user_tree_image'|'user_card_image' }[],
        visitId?: number | null,
        visitorId?: number | null,
    ) {
        const url = `/api/appv2/upload-visitor-images`;
        const payload: any = { sapling_id: saplingId, images };
        if (visitId) payload.visit_id = visitId;
        if (visitorId) payload.visitor_id = visitorId;
        const response = await this.api.post(url, payload);
        return response?.data;
    }

    async deleteTree(tree: Tree) {
        const url = `/api/trees/${tree.id}`;
        return await this.api.delete(url);
    }

    async analyticsCount(userName: string): Promise<TreeAnalytics> {
        const url = `/api/appv2/trees-count?name=${userName}`;
        const response =  await this.api.get<TreeAnalytics>(url);
        return response.data;
    }

    async getTreesPlantationInfo(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<TreePlantationInfo>> {
        const url = `/api/trees/get-trees-plantation-info?offset=${offset}&limit=${limit}`;
        const response = await this.api.post<PaginatedResponse<TreePlantationInfo>>(url, { filters: filters });
        return response.data;
    }

}