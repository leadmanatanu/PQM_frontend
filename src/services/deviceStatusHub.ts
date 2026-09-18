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

			this.connection.onreconnected(async () => {
				console.log("SignalR reconnected");
			});

			this.connection.onclose((error) => {
				console.warn("SignalR connection closed", error);
			});
		}

		return this.connection;
	}

	async start(): Promise<void> {
		const connection = this.getConnection();

		if (connection.state === HubConnectionState.Connected) {
			return;
		}

		if (this.startPromise) {
			return this.startPromise;
		}

		this.startPromise = connection
			.start()

			.finally(() => {
				this.startPromise = null;
			});

		return this.startPromise;
	}

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

	onDeviceStatusChanged(callback: (deviceId: number, isOnline: boolean) => void) {
		const connection = this.getConnection();

		const handler = (data: { deviceId: number; isOnline: boolean }) => {
			callback(data.deviceId, data.isOnline);
		};

		connection.on("DeviceConnectionStatusChanged", handler);

		return () => {
			connection.off("DeviceConnectionStatusChanged", handler);
		};
	}
}

export const deviceStatusHub = new DeviceStatusHubService();
