import { apiClient } from './api-client';

// Fetch connected headers for a device
export const fetchConnectedHeaders = async (deviceId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get(`/connectedheader/device/${deviceId}`);
        return data;
    } catch (error) {
        console.error("Error fetching connected headers:", error);
        return null;
    }
};

// Fetch DLMS objects for a header
export const fetchDLMSObjects = async (headerId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get(`/dlmsobject/header/${headerId}`);
        return data;
    } catch (error) {
        console.error("Error fetching DLMS objects:", error);
        return null;
    }
};

// Fetch parameters for a DLMS object
export const fetchObjectParameters = async (objectId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get(`/objectparameter/object/${objectId}`);
        return data;
    } catch (error) {
        console.error("Error fetching object parameters:", error);
        return null;
    }
};

// Fetch the latest clock reading for a device
export const fetchClockLatest = async (deviceId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get('/clock/latest', {
            params: { deviceId }
        });
        return data;
    } catch (error) {
        console.error("Error fetching latest clock:", error);
        return null;
    }
};

// Fetch the latest activity calendar for a device
export const fetchActivityCalendarLatest = async (deviceId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get('/activitycalendar/latest', {
            params: { deviceId }
        });
        return data;
    } catch (error) {
        console.error("Error fetching latest activity calendar:", error);
        return null;
    }
};

// Fetch ProfileGenericEntry records
export const fetchProfileGenericEntries = async (
    deviceId: string | number,
    obisCode: string,
    columnName?: string,
    startDate?: string,
    endDate?: string
): Promise<any | null> => {
    try {
        const { data } = await apiClient.get('/profilegeneric/entries', {
            params: { deviceId, obisCode, columnName, startDate, endDate }
        });
        return data;
    } catch (error) {
        console.error("Error fetching profile entries:", error);
        return null;
    }
};