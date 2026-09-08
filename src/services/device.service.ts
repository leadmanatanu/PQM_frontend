import type { Device } from '../components/dashboard/device/devices-table';
import { apiClient, ApiResponse } from './api-client';

export interface MeterTypeItem {
    id: number;
    name: string;
}

export const fetchMeterTypes = async (): Promise<MeterTypeItem[]> => {
    try {
        const { data } =
            await apiClient.get<ApiResponse<MeterTypeItem[]>>(
                '/device/meterTypes'
            );

        return data.data ?? [];
    } catch (error) {
        console.error('Error fetching meter types:', error);
        return [];
    }
};
// ============================================================
// FETCH ALL DEVICES
// ============================================================

export const fetchDevices = async (): Promise<Device[]> => {
    try {
        const { data } =
            await apiClient.get<ApiResponse<Device[]>>('/device');

        return data.data ?? [];
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};


// ============================================================
// ADD DEVICE
// ============================================================

export const addDevice = async (
    device: Device
): Promise<any | undefined> => {
    try {
        const payload = {
            Name: device.name,

            IsActive:
                typeof device.isActive === 'boolean'
                    ? device.isActive
                    : device.isActive === '1',

            IP: device.ip,

            PORT: Number(device.port),


            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,

            ClientAddress:
                device.clientAddress ?? 16,

            ServerAddress:
                device.serverAddress ?? 1,

            Authentication:
                device.authentication ?? 'None',

            Password: device.password,

            Timeout:
                device.timeout ?? 30000,

            MeterTypeId:
                device.meterTypeId != null
                    ? Number(device.meterTypeId)
                    : null,

            TimeZoneId:
                device.timeZoneId ||
                'India Standard Time',

            // One device -> one schedule
            DeviceSyncScheduleId:
                device.deviceSyncScheduleId ?? null
        };

        const { data } =
            await apiClient.post<ApiResponse>(
                '/device',
                payload
            );

        return data;
    } catch (error) {
        console.error('Error adding device:', error);
        return undefined;
    }
};


// ============================================================
// EDIT DEVICE
// ============================================================

export const editDevice = async (
    device: Device
): Promise<any | undefined> => {
    try {
        const payload = {
            Id: device.id,

            Name: device.name,

            IsActive:
                typeof device.isActive === 'boolean'
                    ? device.isActive
                    : device.isActive === '1',

            IP: device.ip,

            PORT: device.port,

            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,

            ClientAddress:
                device.clientAddress ?? 16,

            ServerAddress:
                device.serverAddress ?? 1,

            Authentication:
                device.authentication ?? 'None',

            Password: device.password,

            Timeout:
                device.timeout ?? 30000,

            MeterTypeId:
                device.meterTypeId ?? null,

            TimeZoneId:
                device.timeZoneId ||
                'India Standard Time',

            // One device -> one schedule
            DeviceSyncScheduleId:
                device.deviceSyncScheduleId ?? null
        };

        const { data } =
            await apiClient.put<ApiResponse>(
                `/device/${device.id}`,
                payload
            );

        return data;
    } catch (error) {
        console.error('Error editing device:', error);
        return undefined;
    }
};


// ============================================================
// DELETE DEVICE
// ============================================================

export const deleteDevice = async (
    id: string | number
): Promise<any | undefined> => {
    try {
        const { data } =
            await apiClient.delete<ApiResponse>(
                `/device/${id}`
            );

        return data;
    } catch (error) {
        console.error('Error deleting device:', error);
        return undefined;
    }
};


// ============================================================
// TRIGGER DEVICE SYNC NOW
// ============================================================

export const syncDeviceNow = async (
    deviceId: string | number
): Promise<any> => {
    try {
        const { data } = await apiClient.post(
            `/device/${deviceId}/sync`
        );

        // Backend returned HTTP 200 but operation failed
        if (!data?.status) {
            return {
                status: false,
                statusCode: data?.statusCode,
                message:
                    data?.errors?.[0] ||
                    data?.message ||
                    data?.data?.message ||
                    `Failed to trigger sync for device ${deviceId}.`
            };
        }

        return {
            status: true,
            statusCode: data?.statusCode,
            data: data?.data,
            message:
                data?.data?.message ||
                data?.message ||
                `Sync request submitted for device ${deviceId}.`
        };

    } catch (error: any) {
        console.error(
            'Error triggering device sync:',
            error
        );

        return {
            status: false,
            statusCode: error?.response?.status,
            message:
                error?.response?.data?.errors?.[0] ||
                error?.response?.data?.message ||
                error?.message ||
                `Failed to trigger sync for device ${deviceId}.`
        };
    }
};

// ============================================================
// DISCOVER DEVICE PARAMETERS
// ============================================================

export const discoverDeviceParameters = async (
    id: string | number,
    objectType?: string
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${id}/discover-parameters`,
                null,
                {
                    params:
                        objectType &&
                        objectType !== 'All'
                            ? { objectType }
                            : {}
                }
            );

        return data;
    } catch (error) {
        console.error(
            'Error discovering device parameters:',
            error
        );

        return null;
    }
};


// ============================================================
// READ SINGLE DEVICE PARAMETER
// ============================================================

export const readDeviceParameter = async (
    deviceId: string | number,
    parameterId: string | number
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/read-parameter/${parameterId}`
            );

        return data;
    } catch (error) {
        console.error(
            'Error reading device parameter:',
            error
        );

        return null;
    }
};


// ============================================================
// READ DLMS OBJECT
// ============================================================

export const readDLMSObject = async (
    deviceId: string | number,
    objectId: string | number
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/read-object/${objectId}`
            );

        return data;
    } catch (error) {
        console.error(
            'Error reading DLMS object:',
            error
        );

        return null;
    }
};


// ============================================================
// READ MULTIPLE DLMS OBJECTS
// ============================================================

export const readDLMSObjectsBatch = async (
    deviceId: string | number,
    objectIds: number[]
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/read-objects`,
                objectIds
            );

        return data;
    } catch (error) {
        console.error(
            'Error reading DLMS objects in batch:',
            error
        );

        return null;
    }
};


// ============================================================
// WRITE DLMS OBJECT ATTRIBUTE
// ============================================================

export const writeDLMSObjectAttribute = async (
    deviceId: string | number,
    obisCode: string,
    value: string,
    attributeId: number = 2
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/write-object`,
                {
                    obisCode,
                    value,
                    attributeId
                }
            );

        return data;
    } catch (error) {
        console.error(
            'Error writing DLMS object attribute:',
            error
        );

        return null;
    }
};

// ============================================================
// FETCH DEVICE CONFIGURATION
// ============================================================

export const fetchDeviceConfiguration = async (
    id: string | number
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.get(
                `/device/${id}/configuration`
            );

        return data;
    } catch (error) {
        console.error(
            'Error fetching device configuration:',
            error
        );

        return null;
    }
};


// ============================================================
// SAVE DEVICE CONFIGURATION
// ============================================================

export const saveDeviceConfiguration = async (
    id: string | number,
    parameterIds: number[]
): Promise<any | null> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${id}/configuration`,
                {
                    parameterIds
                }
            );

        return data;
    } catch (error) {
        console.error(
            'Error saving device configuration:',
            error
        );

        return null;
    }
};


// ============================================================
// SCAN DEVICE
// ============================================================

export const scanDevice = async (
    deviceId: string | number,
    profileIds?: number[] | null,
    paramIds?: (string | number)[] | null
): Promise<{
    status: boolean;
    data?: any;
    error?: string;
    isConcurrencyError?: boolean;
}> => {
    try {
        const { data } = await apiClient.post(
            `/device/${deviceId}/live-scan`,
            {
                profileIds: profileIds && profileIds.length > 0 ? profileIds : null,
                parameterIds: paramIds && paramIds.length > 0 ? paramIds : null
            }
        );

        if (!data?.status) {
            return { status: false, error: data?.errors?.[0] || 'Live scan failed.' };
        }

        const result = data.data;
        return {
            status: true,
            data: {
                scannedAt: result.scannedAt,
                deviceId: result.deviceId,
                deviceName: result.deviceName,
                items: (result.items ?? []).map((it: any) => ({
                    parameterId: it.parameterId,
                    parameterName: it.parameterName,
                    obisCode: it.obisCode,
                    value: it.value ?? '',
                    unit: it.unit,
                    error: it.error
                }))
            }
        };
    } catch (error: any) {
        if (error.response?.status === 409) {
            return {
                status: false,
                error: error.response.data?.errors?.[0] || 'Device is currently syncing — please try scanning again in a moment',
                isConcurrencyError: true
            };
        }
        return {
            status: false,
            error: error.response?.data?.errors?.[0] || error.message || 'Failed to scan device live readings.'
        };
    }
};