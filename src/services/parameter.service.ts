import { apiClient, ApiResponse } from './api-client';

// Fetch device parameters
export const fetchDeviceParameter = async (id: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get(`/Parameter/${id}`);
        return data;
    } catch (error) {
        console.error("Error fetching device parameter:", error);
        return null;
    }
};

// Update device parameter mapping
export const updateDeviceParamMapping = async (deviceParams: any[]): Promise<any | undefined> => {
    try {
        const { data } = await apiClient.post<ApiResponse>('/deviceparammapping', deviceParams);
        return data;
    } catch (error) {
        console.error('Error updating device parameter mapping:', error);
        return undefined;
    }
};