import axios, { AxiosInstance } from "axios";
import { Tree, TreeHelperDataResponse } from "../../model/tree"
import { handleApiError } from "./handleError";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Constants } from "../Utils";

export class TreeService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async fetchChanges(timestamp: string, tree_ids: number[], offset?: number, limit?: number): Promise<TreeHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/trees?`;
        try {
            const response = await this.api.post<TreeHelperDataResponse>(url, { timestamp, tree_ids, offset, limit: 10000 });
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeService::fetchChanges:", error)
        }
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
        return await this.api.post(url, sapling, { headers: { 'x-access-token': token } });
    }

    async deleteTree(tree: Tree) {
        const url = `/api/trees/${tree.id}`;
        return await this.api.delete(url);
    }

}