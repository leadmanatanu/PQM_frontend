import { apiClient, ApiResponse } from "./api-client";

// Fetch device readings — paginated by distinct timestamps (columns).
// parameterIds: array of selected parameter IDs; empty/undefined = all parameters.
// pageSize: number of timestamp columns per page (default 20).
export const fetchDeviceReading = async (
	deviceId?: string | number | null,
	parameterIds?: (string | number)[] | null,
	startDate?: string,
	endDate?: string,
	pageNumber: number = 1,
	pageSize: number = 20,
	profileId?: string | number | null
): Promise<any | null> => {
	try {
		const params: Record<string, any> = { pageNumber, pageSize };
		if (deviceId && Number(deviceId) > 0) params.deviceId = deviceId;
		if (profileId && Number(profileId) > 0) params.profileId = profileId;
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		// Send parameterIds as repeated query keys: ?parameterIds=1&parameterIds=2
		// axios serializes arrays with the same key when using params + paramsSerializer
		if (parameterIds && parameterIds.length > 0) {
			params.parameterIds = parameterIds.map(Number).filter((n) => n > 0);
		}

		const { data } = await apiClient.get<ApiResponse>("/devicelog/search", {
			params,
			// Serialize arrays as repeated keys (default axios behavior with arrays)
			paramsSerializer: (p) => {
				const parts: string[] = [];
				for (const [key, value] of Object.entries(p)) {
					if (Array.isArray(value)) {
						value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
					} else if (value !== undefined && value !== null) {
						parts.push(`${key}=${encodeURIComponent(value)}`);
					}
				}
				return parts.join("&");
			},
		});
		return data;
	} catch (error) {
		console.error("Error fetching live reading:", error);
		return null;
	}
};

// Fetch aggregated report readings (5, 15, 30 min intervals), grouped by profile.
// No pagination — backend now returns the full grouped result set in one call.
export const fetchAggregatedReport = async (
	deviceId?: string | number | null,
	profileIds?: number[],
	objectType?: string | null,
	parameterIds?: (string | number)[] | null,
	startDate?: string,
	endDate?: string,
	intervalMinutes: number = 15
): Promise<any | null> => {
	try {
		const params: Record<string, any> = { intervalMinutes };
		if (deviceId && Number(deviceId) > 0) params.deviceId = deviceId;
		if (profileIds && profileIds.length > 0) {
			params.profileIds = profileIds.map(Number).filter((id) => id > 0);
		}
		if (objectType && objectType !== "All") params.objectType = objectType;
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		if (parameterIds && parameterIds.length > 0) {
			params.parameterIds = parameterIds.map(Number).filter((n) => n > 0);
		}

		const { data } = await apiClient.get<ApiResponse>("/report/aggregate", {
			params,
			paramsSerializer: (p) => {
				const parts: string[] = [];
				for (const [key, value] of Object.entries(p)) {
					if (Array.isArray(value)) {
						value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
					} else if (value !== undefined && value !== null) {
						parts.push(`${key}=${encodeURIComponent(value)}`);
					}
				}
				return parts.join("&");
			},
		});

		// eslint-disable-next-line no-console
		console.log("[fetchAggregatedReport] response from /report/aggregate:", data);

		return data;
	} catch (error) {
		console.error("Error fetching aggregated report:", error);
		return null;
	}
};

// Trigger export of parameter readings (CSV or Excel)
export const exportDeviceReading = (
	deviceId?: string | number | null,
	parameterIds?: (string | number)[] | null,
	startDate?: string,
	endDate?: string,
	profileId?: string | number | null,
	format: "csv" | "excel" = "csv"
): void => {
	const params = new URLSearchParams();
	if (deviceId && Number(deviceId) > 0) params.append("deviceId", String(deviceId));
	if (profileId && Number(profileId) > 0) params.append("profileId", String(profileId));
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);
	if (format) params.append("format", format);

	if (parameterIds && parameterIds.length > 0) {
		parameterIds.forEach((id) => {
			if (Number(id) > 0) params.append("parameterIds", String(id));
		});
	}

	const downloadUrl = `${apiClient}/devicelog/Export?${params.toString()}`;
	window.open(downloadUrl, "_blank");
};

// Trigger export of aggregated report (Excel)
export const exportAggregatedReport = (
	deviceId?: string | number | null,
	profileIds?: number[],
	objectType?: string | null,
	parameterIds?: (string | number)[] | null,
	startDate?: string,
	endDate?: string,
	intervalMinutes: number = 15
): void => {
	const params = new URLSearchParams();
	if (deviceId && Number(deviceId) > 0) params.append("deviceId", String(deviceId));
	if (profileIds && profileIds.length > 0) {
		profileIds.forEach((id) => {
			if (Number(id) > 0) {
				params.append("profileIds", String(id));
			}
		});
	}
	if (objectType && objectType !== "All") params.append("objectType", objectType);
	if (startDate) params.append("startDate", startDate);
	if (endDate) params.append("endDate", endDate);
	params.append("intervalMinutes", String(intervalMinutes));

	if (parameterIds && parameterIds.length > 0) {
		parameterIds.forEach((id) => {
			if (Number(id) > 0) params.append("parameterIds", String(id));
		});
	}

	const downloadUrl = `${apiClient}/report/export?${params.toString()}`;
	window.open(downloadUrl, "_blank");
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
		const { data } = await apiClient.get<ApiResponse>("/eventslog/search", {
			params: { deviceId, eventType, pageNumber, pageSize, startDate, endDate },
		});
		return data;
	} catch (error) {
		console.error("Error fetching event readings:", error);
		return null;
	}
};