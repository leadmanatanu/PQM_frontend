import { apiClient, ApiResponse } from './api-client';

// Fetch device readings
export const fetchDeviceReading = async (
    deviceId: string | number,
    parameterId: string | number,
    pageNumber: number,
    pageSize: number,
    startDate: string,
    endDate: string
): Promise<any | null> => {
    try {
        const { data } = await apiClient.get<ApiResponse>('/devicelog/search', {
            params: { deviceId, parameterId, pageNumber, pageSize, startDate, endDate },
        });
        return data;
    } catch (error) {
        console.error('Error fetching device readings:', error);
        return null;
    }
};

// Fetch event readings
export const fetchEventReading = async (
    deviceId: string | number,
    eventType: string | number,
    pageNumber: number,
    pageSize: number,
    startDate: string,
    endDate: string
): Promise<any | null> => {
    try {
        const { data } = await apiClient.get<ApiResponse>('/eventslog/search', {
            params: { deviceId, eventType, pageNumber, pageSize, startDate, endDate },
        });
        return data;
    } catch (error) {
        console.error('Error fetching event readings:', error);
        return null;
    }
};

// Fetch Event Status Mappings dynamically from database
export const fetchEventStatusMappings = async (): Promise<any | null> => {
    try {
        const { data } = await apiClient.get('/eventstatusmapping');
        return data;
    } catch (error) {
        console.error("Error fetching event status mappings:", error);
        return null;
    }
};