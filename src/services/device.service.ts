import { apiClient, ApiResponse } from './api-client';
import type { Device } from '../components/dashboard/device/devices-table';

// Fetch all devices
export const fetchDevices = async (): Promise<Device[]> => {
    try {
        const { data } = await apiClient.get<ApiResponse<Device[]>>('/device');
        return data.data ?? [];
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
            IsActive: typeof device.isActive === 'boolean' ? device.isActive : device.isActive === '1',
            IP: device.ip,
            Port: device.port,
            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,
            ClientAddress: device.clientAddress ?? 16,
            ServerAddress: device.serverAddress ?? 1,
            Authentication: device.authentication ?? "None",
            Password: device.password,
            Timeout: device.timeout ?? 30000,
            MeterTypeName: device.meterTypeName,
            MeterType: device.meterTypeName,
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
            IsActive: device.isActive === '1' || device.isActive === true,
            IP: device.ip,
            Port: device.port,
            SerialNumber: device.serialNumber,
            ConsumerNumber: device.consumerNumber,
            ClientAddress: device.clientAddress ?? 16,
            ServerAddress: device.serverAddress ?? 1,
            Authentication: device.authentication ?? "None",
            Password: device.password,
            Timeout: device.timeout ?? 30000,
            MeterTypeName: device.meterTypeName,
            MeterType: device.meterTypeName ? { Name: device.meterTypeName } : undefined,
            TimeZoneId: device.timeZoneId || 'India Standard Time',
        };
        const { data } = await apiClient.put<ApiResponse>(`/device/${device.id}`, payload);
        return data;
    } catch (error) {
        console.error('Error editing device:', error);
        return undefined;
    }
};

// Delete device
export const deleteDevice = async (id: string | number): Promise<any | undefined> => {
    try {
        const { data } = await apiClient.delete<ApiResponse>(`/device/${id}`);
        return data;
    } catch (error) {
        console.error('Error deleting device:', error);
        return undefined;
    }
};

// Trigger device sync now
export const syncDeviceNow = async (deviceId: string | number): Promise<any> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/sync`);
        return data;
    } catch (error: any) {
        console.error("Error triggering device sync:", error);
        return error?.response?.data || { status: false, message: 'Failed to trigger sync' };
    }
};

// Enable device sync
export const enableDeviceSync = async (deviceId: string | number): Promise<boolean> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/enable-sync`);
        return data?.status ?? true;
    } catch (error) {
        console.error("Error enabling device sync:", error);
        return false;
    }
};

// Disable device sync
export const disableDeviceSync = async (deviceId: string | number): Promise<boolean> => {
    try {
        const { data } = await apiClient.post(`/device/${deviceId}/disable-sync`);
        return data?.status ?? true;
    } catch (error) {
        console.error("Error disabling device sync:", error);
        return false;
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

// Save Device Configuration setup data
export const saveDeviceConfiguration = async (id: string | number, parameterIds: number[]): Promise<any | null> => {
    try {
        const { data } = await apiClient.post(`/device/${id}/configuration`, { parameterIds });
        return data;
    } catch (error) {
        console.error("Error saving device configuration:", error);
        return null;
    }
};

// Scan device live meter parameter values (real-time view-only).
// Phase 1: POST /scan → receives scanRequestId (PQM.Console executes the DLMS connection).
// Phase 2: Poll GET /scan/result/{scanRequestId} every 1.5s until Completed or Failed.
// PQM.Console is the ONLY process that opens a DlmsMeterReader connection, so scan and sync
// are serialized through the same process and lock — no cross-process race condition possible.
export const scanDevice = async (
    deviceId: string | number,
    profileId?: number | null,
    paramIds?: (string | number)[] | null,
    onStatusChange?: (statusText: string) => void
): Promise<{ status: boolean; data?: any; error?: string; isConcurrencyError?: boolean }> => {
    try {
        // Phase 1: Queue the scan request
        const postResp = await apiClient.post(`/device/${deviceId}/scan`, {
            profileId: profileId || null,
            parameterIds: paramIds && paramIds.length > 0 ? paramIds : null,
        });

        if (!postResp.data?.status) {
            return {
                status: false,
                error: postResp.data?.errors?.[0] || 'Failed to queue scan request.',
            };
        }

        const { scanRequestId } = postResp.data.data;

        // Phase 2: Poll for result (PQM.Console picks up and executes within ~5s tick)
        const POLL_INTERVAL_MS = 1500;
        const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
        const deadline = Date.now() + TIMEOUT_MS;

        while (Date.now() < deadline) {
            await new Promise(res => setTimeout(res, POLL_INTERVAL_MS));

            let pollResp: any;
            try {
                pollResp = await apiClient.get(`/device/${deviceId}/scan/result/${scanRequestId}`);
            } catch (pollErr: any) {
                if (pollErr.response?.status === 409) {
                    const msg = pollErr.response.data?.errors?.[0] || 'Device is currently syncing — please try scanning again in a moment';
                    return { status: false, error: msg, isConcurrencyError: true };
                }
                continue; // transient poll error, retry
            }

            const pollData = pollResp?.data;
            if (!pollData) continue;

            if (!pollData.status) {
                const msg = pollData?.errors?.[0] || 'Scan failed.';
                const isConcurrency = msg.toLowerCase().includes('syncing') || msg.toLowerCase().includes('scanning');
                return { status: false, error: msg, isConcurrencyError: isConcurrency };
            }

            const result = pollData.data;
            if (!result) continue;

            // Still pending or processing — report status to callback if provided
            if (result.status === 'Pending') {
                // If it stays Pending for > 45 seconds, PQM.Console engine is likely offline
                if (Date.now() - (deadline - TIMEOUT_MS) > 45000) {
                    return { status: false, error: 'Scan engine appears to be offline — request was queued but not processed by PQM.Console.' };
                }
                onStatusChange?.('Scan queued, waiting for current sync to finish...');
                continue;
            }
            if (result.status === 'Processing') {
                onStatusChange?.('Connecting to DLMS meter and scanning live values...');
                continue;
            }

            // Completed — result contains { scannedAt, deviceId, deviceName, items } (camelCase from JsonSerializer)
            // The backend deserializes resultJson as object, so property names follow the C# serializer output.
            // Normalise to the shape the page expects.
            const normalized = {
                scannedAt: result.scannedAt ?? result.ScannedAt,
                deviceId: result.deviceId ?? result.DeviceId,
                deviceName: result.deviceName ?? result.DeviceName,
                items: (result.items ?? result.Items ?? []).map((it: any) => ({
                    parameterId: it.parameterId ?? it.ParameterId,
                    parameterName: it.parameterName ?? it.ParameterName,
                    obisCode: it.obisCode ?? it.ObisCode,
                    value: it.value ?? it.Value ?? '',
                    unit: it.unit ?? it.Unit,
                    error: it.error ?? it.Error,
                })),
            };
            return { status: true, data: normalized };
        }

        return { status: false, error: 'Scan timed out — the meter did not respond within 5 minutes.' };

    } catch (error: any) {
        if (error.response?.status === 409) {
            const msg = error.response.data?.errors?.[0] || 'Device is currently syncing — please try scanning again in a moment';
            return { status: false, error: msg, isConcurrencyError: true };
        }
        const errMsg = error.response?.data?.errors?.[0] || error.message || 'Failed to scan device live readings.';
        return { status: false, error: errMsg };
    }
};
