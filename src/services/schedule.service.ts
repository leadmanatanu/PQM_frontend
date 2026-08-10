import { apiClient, ApiResponse } from './api-client';

export interface DeviceScheduleItem {
    deviceId: number;
    deviceName: string;
    ip: string;
    status: string;
    lastSync?: string | null;
    timeZoneId: string;
    isEnabled: boolean;
    scheduledTime: string; // "HH:mm"
    repeatMode: string;
    nextRunAtUtc?: string | null;
    lastRunAtUtc?: string | null;
    lastRunStatus?: string | null;
}

// Fetch schedules for all active devices
export const fetchAllDeviceSchedules = async (): Promise<DeviceScheduleItem[]> => {
    try {
        const { data } = await apiClient.get<ApiResponse<DeviceScheduleItem[]>>('/device/schedules');
        return data.data ?? [];
    } catch (error) {
        console.error("Error fetching device schedules:", error);
        return [];
    }
};

// Update schedule for a specific device
export const updateDeviceSchedule = async (
    deviceId: number,
    payload: { isEnabled: boolean; scheduledTime: string; repeatMode?: string }
): Promise<any> => {
    try {
        const { data } = await apiClient.put<ApiResponse>(`/device/${deviceId}/schedule`, payload);
        return data;
    } catch (error) {
        console.error("Error updating device schedule:", error);
        throw error;
    }
};
