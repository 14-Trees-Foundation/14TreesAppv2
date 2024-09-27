import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { User, UserHelperDataResponse } from "../../model/user"
import { handleApiError } from "./handleError";

export class UserService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async getUsers(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<User>> {
        const url = `/api/users/get?offset=${offset}&limit=${limit}`;
        const response = await this.api.post<PaginatedResponse<User>>(url, { filters: filters });
        return response.data;
    }

    async searchUsers(searchStr: string): Promise<User[]> {
        const response = await this.api.get<User[]>(`/api/users/${searchStr}`);
        return response.data;
    }

    async createUser(data: User): Promise<User> {
        const response = await this.api.post<User>(`/api/users/`, data);
        return response.data;
    }

    async updateUser(data: User): Promise<User> {
        const response = await this.api.put<User>(`/api/users//${data.id}`, data);
        return response.data;
    }

    async deleteUser(data: User): Promise<number> {
        if (!data.id) throw new Error('User id required to delete user!')
        await this.api.delete<any>(`/api/users//${data.id}`);
        return data.id;
    }

    async fetchChanges(timestamp: string, user_ids: number[], offset: number): Promise<UserHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/users`;
        const response = await this.api.post<UserHelperDataResponse>(url, { timestamp, user_ids, offset });
        return response.data;
    }
}