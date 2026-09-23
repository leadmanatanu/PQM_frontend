class SyncDeviceManager {
	private syncingDevices = new Set<number>();

	add(deviceId: number) {
		this.syncingDevices.add(deviceId);

		console.log("🟢 Long-running sync device:", deviceId);
	}

	remove(deviceId: number) {
		this.syncingDevices.delete(deviceId);

		console.log("🔴 Long-running sync finished:", deviceId);
	}

	has(deviceId: number) {
		return this.syncingDevices.has(deviceId);
	}

	getAll(): number[] {
		return Array.from(this.syncingDevices);
	}
}

export const syncDeviceManager = new SyncDeviceManager();
