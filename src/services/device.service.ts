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

            PORT: Number(device.PORT),


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

            PORT: device.PORT ?? 0,

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
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/sync`
            );

        return data;
    } catch (error: any) {
        console.error(
            'Error triggering device sync:',
            error
        );

        return (
            error?.response?.data || {
                status: false,
                message: 'Failed to trigger sync'
            }
        );
    }
};


// ============================================================
// ENABLE DEVICE SYNC
// ============================================================

export const enableDeviceSync = async (
    deviceId: string | number
): Promise<boolean> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/enable-sync`
            );

        return data?.status ?? true;
    } catch (error) {
        console.error(
            'Error enabling device sync:',
            error
        );

        return false;
    }
};


// ============================================================
// DISABLE DEVICE SYNC
// ============================================================

export const disableDeviceSync = async (
    deviceId: string | number
): Promise<boolean> => {
    try {
        const { data } =
            await apiClient.post(
                `/device/${deviceId}/disable-sync`
            );

        return data?.status ?? true;
    } catch (error) {
        console.error(
            'Error disabling device sync:',
            error
        );

        return false;
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
    profileId?: number | null,
    paramIds?: (string | number)[] | null,
    onStatusChange?: (statusText: string) => void
): Promise<{
    status: boolean;
    data?: any;
    error?: string;
    isConcurrencyError?: boolean;
}> => {
    try {

        // --------------------------------------------------------
        // PHASE 1: Queue scan request
        // --------------------------------------------------------

        const postResp =
            await apiClient.post(
                `/device/${deviceId}/scan`,
                {
                    profileId:
                        profileId || null,

                    parameterIds:
                        paramIds &&
                        paramIds.length > 0
                            ? paramIds
                            : null
                }
            );

        if (!postResp.data?.status) {
            return {
                status: false,
                error:
                    postResp.data?.errors?.[0] ||
                    'Failed to queue scan request.'
            };
        }

        const {
            scanRequestId
        } = postResp.data.data;


        // --------------------------------------------------------
        // PHASE 2: Poll for result
        // --------------------------------------------------------

        const POLL_INTERVAL_MS = 1500;

        const TIMEOUT_MS =
            5 * 60 * 1000;

        const deadline =
            Date.now() + TIMEOUT_MS;

        while (Date.now() < deadline) {

            await new Promise(
                res =>
                    setTimeout(
                        res,
                        POLL_INTERVAL_MS
                    )
            );

            let pollResp: any;

            try {
                pollResp =
                    await apiClient.get(
                        `/device/${deviceId}/scan/result/${scanRequestId}`
                    );
            } catch (pollErr: any) {

                if (
                    pollErr.response?.status ===
                    409
                ) {
                    const msg =
                        pollErr.response.data
                            ?.errors?.[0] ||
                        'Device is currently syncing — please try scanning again in a moment';

                    return {
                        status: false,
                        error: msg,
                        isConcurrencyError: true
                    };
                }

                continue;
            }

            const pollData =
                pollResp?.data;

            if (!pollData)
                continue;


            if (!pollData.status) {

                const msg =
                    pollData?.errors?.[0] ||
                    'Scan failed.';

                const isConcurrency =
                    msg
                        .toLowerCase()
                        .includes('syncing') ||
                    msg
                        .toLowerCase()
                        .includes('scanning');

                return {
                    status: false,
                    error: msg,
                    isConcurrencyError:
                        isConcurrency
                };
            }


            const result =
                pollData.data;

            if (!result)
                continue;


            // ----------------------------------------------------
            // Pending
            // ----------------------------------------------------

            if (
                result.status ===
                'Pending'
            ) {

                if (
                    Date.now() -
                    (deadline - TIMEOUT_MS) >
                    45000
                ) {
                    return {
                        status: false,
                        error:
                            'Scan engine appears to be offline — request was queued but not processed by PQM.Console.'
                    };
                }

                onStatusChange?.(
                    'Scan queued, waiting for current sync to finish...'
                );

                continue;
            }


            // ----------------------------------------------------
            // Processing
            // ----------------------------------------------------

            if (
                result.status ===
                'Processing'
            ) {

                onStatusChange?.(
                    'Connecting to DLMS meter and scanning live values...'
                );

                continue;
            }


            // ----------------------------------------------------
            // Completed
            // ----------------------------------------------------

            const normalized = {

                scannedAt:
                    result.scannedAt ??
                    result.ScannedAt,

                deviceId:
                    result.deviceId ??
                    result.DeviceId,

                deviceName:
                    result.deviceName ??
                    result.DeviceName,

                items:
                    (
                        result.items ??
                        result.Items ??
                        []
                    ).map(
                        (it: any) => ({
                            parameterId:
                                it.parameterId ??
                                it.ParameterId,

                            parameterName:
                                it.parameterName ??
                                it.ParameterName,

                            obisCode:
                                it.obisCode ??
                                it.ObisCode,

                            value:
                                it.value ??
                                it.Value ??
                                '',

                            unit:
                                it.unit ??
                                it.Unit,

                            error:
                                it.error ??
                                it.Error
                        })
                    )
            };

            return {
                status: true,
                data: normalized
            };
        }


        // --------------------------------------------------------
        // TIMEOUT
        // --------------------------------------------------------

        return {
            status: false,
            error:
                'Scan timed out — the meter did not respond within 5 minutes.'
        };

    } catch (error: any) {

        if (
            error.response?.status ===
            409
        ) {
            const msg =
                error.response.data
                    ?.errors?.[0] ||
                'Device is currently syncing — please try scanning again in a moment';

            return {
                status: false,
                error: msg,
                isConcurrencyError: true
            };
        }

        const errMsg =
            error.response?.data
                ?.errors?.[0] ||
            error.message ||
            'Failed to scan device live readings.';

        return {
            status: false,
            error: errMsg
        };
    }
};