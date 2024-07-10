import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Tree } from "../../model/tree"
import { handleApiError } from "./handleError";

export class TreeClient {
    private api: AxiosInstance;
    
    constructor() {
        const baseURL = 'https://dev-api.14trees.org/api/trees';
        this.api = axios.create({
          baseURL: baseURL,
        });
    }

    async getTrees(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<Tree>> {
        const url = `/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<Tree>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeClient::getTrees:", error)
        }
    }

    async searchTrees(searchStr: string): Promise<Tree[]> {
        try {
            const response = await this.api.get<Tree[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeClient::searchTrees:", error)
        }
    }

    async createTree(data: Tree): Promise<Tree> {
        try {
            const response = await this.api.post<Tree>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeClient::createTree:", error)
        }
    }

    async updateTree(data: Tree): Promise<Tree> {
        try {
            const response = await this.api.put<Tree>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("TreeClient::updateTree:", error)
        }
    }

    async deleteTree(data: Tree): Promise<number> {
        if (!data.id) throw new Error('Tree id required to delete !')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("TreeClient::deleteTree:", error)
        }
    }
}