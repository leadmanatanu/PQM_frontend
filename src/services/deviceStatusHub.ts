import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";

import { apiClient } from "./api-client";

const apiBaseUrl = apiClient.defaults.baseURL;

if (!apiBaseUrl) {
	throw new Error("API base URL is not configured");
}

const serverUrl = apiBaseUrl.replace(/\/api\/?$/, "");

const HUB_URL = `${serverUrl}/hubs/device`;

class DeviceStatusHubService {
	private connection: HubConnection | null = null;
	private startPromise: Promise<void> | null = null;

	// =========================================================
	// GET / CREATE CONNECTION
	// =========================================================

	private getConnection(): HubConnection {
		if (!this.connection) {
			this.connection = new HubConnectionBuilder()
				.withUrl(HUB_URL)
				.withAutomaticReconnect()
				.configureLogging(LogLevel.Information)
				.build();

			this.connection.onreconnecting((error) => {
				console.warn("SignalR reconnecting...", error);
			});

			this.connection.onreconnected(() => {
				console.log("SignalR reconnected");
			});

			this.connection.onclose((error) => {
				console.warn("SignalR connection closed", error);
			});
		}

		return this.connection;
	}

	// =========================================================
	// START CONNECTION
	// =========================================================

	async start(): Promise<void> {
		const connection = this.getConnection();

		if (connection.state === HubConnectionState.Connected) {
			return;
		}

		if (this.startPromise) {
			return this.startPromise;
		}

		this.startPromise = connection.start().finally(() => {
			this.startPromise = null;
		});

		return this.startPromise;
	}

	// =========================================================
	// DEVICE SUBSCRIPTION
	// =========================================================

	async subscribeToDevices(deviceIds: number[]) {
		await this.start();

		const connection = this.getConnection();

		if (connection.state !== HubConnectionState.Connected) {
			throw new Error("SignalR is not connected");
		}

		const ids = [...new Set(deviceIds.filter((id) => Number.isInteger(id)))];

		if (ids.length === 0) {
			return;
		}

		await connection.invoke("SubscribeToDevices", ids);

		console.log("✅ Devices subscribed:", ids);
	}

	async unsubscribeFromDevices(deviceIds: number[]) {
		const connection = this.getConnection();

		if (connection.state !== HubConnectionState.Connected) {
			return;
		}

		const ids = [...new Set(deviceIds.filter((id) => Number.isInteger(id)))];

		if (ids.length === 0) {
			return;
		}

		console.log("📤 UnsubscribeFromDevices:", ids);

		await connection.invoke("UnsubscribeFromDevices", ids);
	}

	// =========================================================
	// DEVICE ONLINE / OFFLINE
	// =========================================================

	onDeviceStatusChanged(callback: (deviceId: number, isOnline: boolean) => void) {
		const connection = this.getConnection();

		const handler = (data: { deviceId: number; isOnline: boolean }) => {
			console.log("📡 DeviceConnectionStatusChanged:", data);

			callback(data.deviceId, data.isOnline);
		};

		connection.on("DeviceConnectionStatusChanged", handler);

		return () => {
			connection.off("DeviceConnectionStatusChanged", handler);
		};
	}

	// =========================================================
	// DEVICE LAST SYNC CHANGED
	// =========================================================

	onDeviceLastSyncChanged(callback: (data: { deviceId: number; lastSyncAt: string }) => void) {
		const connection = this.getConnection();

		const handler = (data: { deviceId: number; lastSyncAt: string }) => {
			callback(data);
		};

		connection.on("DeviceLastSyncChanged", handler);

		return () => {
			connection.off("DeviceLastSyncChanged", handler);
		};
	}

	// =========================================================
	// SYNC STARTED
	// =========================================================

	onSyncStarted(callback: (data: any) => void) {
		const connection = this.getConnection();

		connection.on("SyncStarted", callback);

		return () => {
			connection.off("SyncStarted", callback);
		};
	}

	// =========================================================
	// SYNC PROGRESS
	// =========================================================

	onSyncProgress(callback: (data: any) => void) {
		const connection = this.getConnection();

		connection.on("SyncProgress", callback);

		return () => {
			connection.off("SyncProgress", callback);
		};
	}

	// =========================================================
	// SYNC COMPLETED
	// =========================================================

	onSyncCompleted(callback: (data: any) => void) {
		const connection = this.getConnection();

		connection.on("SyncCompleted", callback);

		return () => {
			connection.off("SyncCompleted", callback);
		};
	}

	// =========================================================
	// SYNC FAILED
	// =========================================================

	onSyncFailed(callback: (data: any) => void) {
		const connection = this.getConnection();

		connection.on("SyncFailed", callback);

		return () => {
			connection.off("SyncFailed", callback);
		};
	}

	// =========================================================
	// SYNC STOPPED
	// =========================================================

	onSyncStopped(callback: (data: any) => void) {
		const connection = this.getConnection();

		connection.on("SyncStopped", callback);

		return () => {
			connection.off("SyncStopped", callback);
		};
	}
}

export const deviceStatusHub = new DeviceStatusHubService();
