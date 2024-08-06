import { AxiosInstance } from "axios";
import { UserHelperDataResponse } from "../../model/user";
import { handleApiError } from "./handleError";

export class UserService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }

    async fetchChanges(timestamp: string, user_ids: number[]): Promise<UserHelperDataResponse> {
        const url = `/api/appv2/fetchHelperData/users`;
        try {
            const response = await this.api.post<UserHelperDataResponse>(url, { timestamp, user_ids });
            return response.data;
        } catch (error: any) {
            return handleApiError("UserService::fetchChanges:", error)
        }
    }
}