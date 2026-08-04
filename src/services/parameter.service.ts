import { apiClient } from './api-client';

// Fetch device parameters with optional profileId filter
export const fetchDeviceParameter = async (
    id?: string | number | null,
    profileId?: string | number | null
): Promise<any | null> => {
    try {
        const params: Record<string, any> = {};
        if (id && Number(id) > 0) params.deviceId = id;
        if (profileId && Number(profileId) > 0) params.profileId = profileId;

        const { data } = await apiClient.get('/Parameter', { params });
        return data;
    } catch (error) {
        console.error("Error fetching device parameter:", error);
        return null;
    }
};

// Fetch parameters for a device (optionally filtered by profileId)
export const fetchParametersForDevice = async (
    deviceId: string | number,
    profileId?: string | number | null
): Promise<any | null> => {
    return fetchDeviceParameter(deviceId, profileId);
};