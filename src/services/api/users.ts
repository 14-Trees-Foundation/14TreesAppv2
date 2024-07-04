import axios, { AxiosInstance } from "axios";
import { FilterItem, PaginatedResponse } from "../../model/common"
import { User } from "../../model/user"
import { handleApiError } from "./handleError";

export class UserClient {
    private api: AxiosInstance;
    
    constructor() {
        const baseURL = 'https://dev-api.14trees.org/api/users';
        this.api = axios.create({
          baseURL: baseURL,
        });
    }

    async getUsers(offset: number, limit: number, filters?: FilterItem[]): Promise<PaginatedResponse<User>> {
        const url = `/get?offset=${offset}&limit=${limit}`;
        try {
            const response = await this.api.post<PaginatedResponse<User>>(url, { filters: filters });
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::getUsers:", error)
        }
    }

    async searchUsers(searchStr: string): Promise<User[]> {
        try {
            const response = await this.api.get<User[]>(`/${searchStr}`);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::searchUsers:", error)
        }
    }

    async createUser(data: User): Promise<User> {
        try {
            const response = await this.api.post<User>(`/`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::createUser:", error)
        }
    }

    async updateUser(data: User): Promise<User> {
        try {
            const response = await this.api.put<User>(`/${data.id}`, data);
            return response.data;
        } catch (error: any) {
            return handleApiError("UserClient::updateUser:", error)
        }
    }

    async deleteUser(data: User): Promise<number> {
        if (!data.id) throw new Error('User id required to delete user!')
        try {
            await this.api.delete<any>(`/${data.id}`);
            return data.id;
        } catch (error: any) {
            return handleApiError("UserClient::deleteUser:", error)
        }
    }
}