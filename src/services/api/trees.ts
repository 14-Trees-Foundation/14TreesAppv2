import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { Tree } from "../../model/tree"
import { handleApiError } from "./handleError";

export class UserClient {
    private api: AxiosInstance;
    
    constructor() {
        const baseURL = 'https://dev-api.14trees.org/api/users';
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
            return handleApiError("UserClient::getUsers:", error)
        }
    }

    async searchTrees(searchStr: string): Promise<Tree[]> {
        try {
            const response = await this.api.get<Tree[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::searchUsers:", error)
        }
    }

    async createTree(data: Tree): Promise<Tree> {
        try {
            const response = await this.api.post<Tree>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::createUser:", error)
        }
    }

    async updateTree(data: Tree): Promise<Tree> {
        try {
            const response = await this.api.put<Tree>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::updateUser:", error)
        }
    }

    async deleteTree(data: Tree): Promise<number> {
        if (!data.id) throw new Error('User id required to delete user!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("UserClient::deleteUser:", error)
        }
    }
}