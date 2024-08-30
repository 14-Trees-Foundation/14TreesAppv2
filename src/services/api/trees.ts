import { AxiosInstance } from "axios";
import { Tree, TreeAnalytics, TreeHelperDataResponse } from "../../model/tree"
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";

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
        const url = `/api/appv2/uploadTrees`;
        const response = await this.api.post(url, trees);
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

    async deleteTree(tree: Tree) {
        const url = `/api/trees/${tree.id}`;
        return await this.api.delete(url);
    }

    async analyticsCount(userName: string): Promise<TreeAnalytics> {
        const url = `/api/appv2/trees-count?name=${userName}`;
        const response =  await this.api.get<TreeAnalytics>(url);
        return response.data;
    }

}