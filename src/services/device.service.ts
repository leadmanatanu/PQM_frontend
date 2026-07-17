import { apiClient, ApiResponse } from './api-client';
import type { Device } from '@/components/dashboard/device/devices-table';

// Fetch all devices
export const fetchDevices = async (): Promise<Device[]> => {
    try {
        const { data } = await apiClient.get<ApiResponse<Device[]>>('/device');
        return data.data;
    } catch (error) {
        console.error("Error fetching devices:", error);
        return [];
    }
};

// Add device
export const addDevice = async (device: Device): Promise<any | undefined> => {
    try {
        const payload = {
            Name: device.name,
            IsActive: device.isActive === '1',
            IP: device.ip,
            Port: device.port,
            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,
            ftpFolder: device.ftpFolder,
            ClientAddress: device.clientAddress ?? 16,
            ServerAddress: device.serverAddress ?? 1,
            Authentication: device.authentication ?? "None",
            Password: device.password,
            Timeout: device.timeout ?? 30000,
        };
        const { data } = await apiClient.post<ApiResponse>('/device', payload);
        return data;
    } catch (error) {
        console.error('Error adding device:', error);
        return undefined;
    }
};

// Edit device
export const editDevice = async (device: Device): Promise<any | undefined> => {
    try {
        const payload = {
            Id: device.id,
            Name: device.name,
            IsActive: device.isActive === '1',
            IP: device.ip,
            Port: device.port,
            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,
            ftpFolder: device.ftpFolder,
            ClientAddress: device.clientAddress ?? 16,
            ServerAddress: device.serverAddress ?? 1,
            Authentication: device.authentication ?? "None",
            Password: device.password,
            Timeout: device.timeout ?? 30000,
        };
        const { data } = await apiClient.put<ApiResponse>('/device', payload);
        return data;
    } catch (error) {
        console.error('Error editing device:', error);
        return undefined;
    }
};

// Delete device
export const deleteDevice = async (device: Device): Promise<any> => {
    if (!device.id) throw new Error('Device ID is required');
    try {
        const { data } = await apiClient.delete<ApiResponse>(`/device/${device.id}`);
        return data;
    } catch (error) {
        console.error('Error deleting device:', error);
        throw error;
    }
};

// Discover and read meter parameters
export const discoverDeviceParameters = async (id: string | number, objectType?: string): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${id}/discover-parameters`, null, {
            params: objectType && objectType !== 'All' ? { objectType } : {}
        });
        return data;
    } catch (error) {
        console.error("Error discovering device parameters:", error);
        return null;
    }
};

// Read a single parameter value from a device
export const readDeviceParameter = async (deviceId: string | number, parameterId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/read-parameter/${parameterId}`);
        return data;
    } catch (error) {
        console.error("Error reading device parameter:", error);
        return null;
    }
};

// Read a DLMS object (all parameters / attributes)
export const readDLMSObject = async (deviceId: string | number, objectId: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/read-object/${objectId}`);
        return data;
    } catch (error) {
        console.error("Error reading DLMS object:", error);
        return null;
    }
};

// Read multiple DLMS objects in batch (single connection)
export const readDLMSObjectsBatch = async (deviceId: string | number, objectIds: number[]): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/read-objects`, objectIds);
        return data;
    } catch (error) {
        console.error("Error reading DLMS objects in batch:", error);
        return null;
    }
};

// Write a DLMS object attribute value
export const writeDLMSObjectAttribute = async (
    deviceId: string | number,
    obisCode: string,
    value: string,
    attributeId: number = 2
): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/write-object`, {
            obisCode,
            value,
            attributeId
        });
        return data;
    } catch (error) {
        console.error("Error writing DLMS object attribute:", error);
        return null;
    }
};

// Fetch Device Configuration setup data
export const fetchDeviceConfiguration = async (id: string | number): Promise<any | null> => {
    try {
        const { data } = await apiClient.get(`/device/${id}/configuration`);
        return data;
    } catch (error) {
        console.error("Error fetching device configuration:", error);
        return null;
    }
};