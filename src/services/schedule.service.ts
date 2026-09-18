import { apiClient, ApiResponse } from "./api-client";

export interface DeviceScheduleItem {
	id: number;
	isEnabled: boolean;
	scheduledTime: string; // "HH:mm"
	repeatMode: string;
	nextRunAtUtc?: string | null;
	lastRunAtUtc?: string | null;
	lastRunStatus?: string | null;
}

export interface DeviceScheduleRequest {
	isEnabled: boolean;
	scheduledTime: string;
	repeatMode?: string;
}

// Fetch all global schedules
export const fetchAllDeviceSchedules = async (): Promise<DeviceScheduleItem[]> => {
	try {
		const { data } = await apiClient.get<ApiResponse<DeviceScheduleItem[]>>("/device/schedules");
		return data.data ?? [];
	} catch (error) {
		console.error("Error fetching device schedules:", error);
		return [];
	}
};

// Create a new global schedule
export const createDeviceSchedule = async (payload: DeviceScheduleRequest): Promise<any> => {
	try {
		const { data } = await apiClient.post<ApiResponse>("/device/schedule", payload);

		return data;
	} catch (error) {
		console.error("Error creating device schedule:", error);
		throw error;
	}
};

// Update an existing schedule by schedule ID
export const updateDeviceSchedule = async (id: number, payload: DeviceScheduleRequest): Promise<any> => {
	try {
		const { data } = await apiClient.put<ApiResponse>(`/device/schedule/${id}`, payload);

		return data;
	} catch (error) {
		console.error("Error updating device schedule:", error);
		throw error;
	}
};

//delete schedule
export const deleteDeviceSchedule = async (scheduleId: number) => {
	try {
		const response = await apiClient.delete(`/device/schedule/${scheduleId}`);

		return response.data;
	} catch (error: any) {
		throw error;
	}
};

// Get a single schedule by ID
export const fetchDeviceSchedule = async (id: number): Promise<DeviceScheduleItem | null> => {
	try {
		const { data } = await apiClient.get<ApiResponse<DeviceScheduleItem>>(`/device/schedule/${id}`);

		return data.data ?? null;
	} catch (error) {
		console.error("Error fetching device schedule:", error);
		return null;
	}
};
