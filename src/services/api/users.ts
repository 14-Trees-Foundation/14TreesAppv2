import { AxiosInstance } from "axios";

export class UserService {
    private api: AxiosInstance;

    constructor(api: AxiosInstance) {
        this.api = api;
    }
}