import axios from 'axios';

const API_URL = 'http://localhost:5135/api';

export interface ApiResponse<T = any> {
    status: string;
    statusCode: number;
    data: T;
}

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});