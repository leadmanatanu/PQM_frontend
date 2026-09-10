//signalR services
// SignalR connection + subscribe/unsubscribe

import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from "@microsoft/signalr";

import { apiClient } from "./api-client";

const HUB_URL = `${apiClient}/hubs/device-status`;

class DeviceStatusHubService {
	private connection: HubConnection | null = null;

	async start(): Promise<void> {
		if (this.connection && this.connection.state === HubConnectionState.Connected) {
			return;
		}

		if (!this.connection) {
			this.connection = new HubConnectionBuilder()
				.withUrl(HUB_URL)
				.withAutomaticReconnect()
				.configureLogging(LogLevel.Information)
				.build();
		}

		await this.connection.start();

		console.log("Device Status SignalR connected");
	}

	async subscribeToDevices(deviceIds: string[]) {
		if (!this.connection) {
			await this.start();
		}

		if (this.connection!.state !== HubConnectionState.Connected) {
			return;
		}

		const ids = [...new Set(deviceIds.filter(Boolean))];

		if (ids.length === 0) return;

		await this.connection!.invoke("SubscribeToDevices", ids);
	}

	async unsubscribeFromDevices(deviceIds: string[]) {
		if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
			return;
		}

		const ids = [...new Set(deviceIds.filter(Boolean))];

		if (ids.length === 0) return;

		await this.connection.invoke("UnsubscribeFromDevices", ids);
	}

	onDeviceStatusChanged(callback: (deviceId: string, isOnline: boolean) => void) {
		if (!this.connection) return;

		this.connection.on("DeviceConnectionStatusChanged", (data: { deviceId: string; isOnline: boolean }) => {
			callback(data.deviceId, data.isOnline);
		});
	}

	removeDeviceStatusChangedListener() {
		this.connection?.off("DeviceConnectionStatusChanged");
	}
}

export const deviceStatusHub = new DeviceStatusHubService();
