import { useEffect, useMemo, useRef, useState } from "react";

import { syncDeviceManager } from "../managers/syncDeviceManager";
import { deviceStatusHub } from "../services/deviceStatusHub";

export type SyncStatus = "loading" | "success" | "error" | "stopped";

export interface DeviceSyncStatus {
	deviceId: number;
	deviceName?: string;
	status: SyncStatus;
	progress: number;
	message?: string;
}

export function useDeviceConnectionStatus(deviceIds: number[]) {
	// =========================================================
	// DEVICE ONLINE / OFFLINE
	// =========================================================

	const [connectionStatus, setConnectionStatus] = useState<Record<number, boolean>>({});

	const [isConnected, setIsConnected] = useState(false);

	// =========================================================
	// DEVICE SYNC
	// =========================================================

	const [syncStatus, setSyncStatus] = useState<DeviceSyncStatus[]>([]);

	// deviceId -> lastSyncAt
	const [lastSyncUpdates, setLastSyncUpdates] = useState<Record<number, string>>({});

	const previousDeviceIds = useRef<number[]>([]);

	// =========================================================
	// START SIGNALR
	// =========================================================

	useEffect(() => {
		let mounted = true;

		let removeStatusListener: (() => void) | undefined;

		let removeLastSyncListener: (() => void) | undefined;

		let removeSyncStartedListener: (() => void) | undefined;

		let removeSyncProgressListener: (() => void) | undefined;

		let removeSyncCompletedListener: (() => void) | undefined;

		let removeSyncFailedListener: (() => void) | undefined;

		let removeSyncStoppedListener: (() => void) | undefined;

		const initialize = async () => {
			try {
				await deviceStatusHub.start();

				if (!mounted) {
					return;
				}

				setIsConnected(true);

				// =================================================
				// DEVICE ONLINE / OFFLINE
				// =================================================

				removeStatusListener = deviceStatusHub.onDeviceStatusChanged((deviceId, isOnline) => {
					if (!mounted) {
						return;
					}

					setConnectionStatus((prev) => ({
						...prev,
						[deviceId]: isOnline,
					}));
				});

				// =================================================
				// DEVICE LAST SYNC CHANGED
				// =================================================

				removeLastSyncListener = deviceStatusHub.onDeviceLastSyncChanged((data) => {
					if (!mounted) {
						return;
					}

					console.log("📥 DeviceLastSyncChanged:", data);

					setLastSyncUpdates((prev) => ({
						...prev,
						[data.deviceId]: data.lastSyncAt,
					}));
				});

				// =================================================
				// SYNC STARTED
				// =================================================

				removeSyncStartedListener = deviceStatusHub.onSyncStarted((data: DeviceSyncStatus) => {
					if (!mounted) {
						return;
					}

					console.log("SYNC STARTED:", data);

					setSyncStatus((prev) => {
						const exists = prev.some((item) => item.deviceId === data.deviceId);

						if (exists) {
							return prev.map((item) =>
								item.deviceId === data.deviceId
									? {
											...item,
											...data,
											status: "loading",
											progress: data.progress ?? 0,
										}
									: item
							);
						}

						return [
							...prev,
							{
								...data,
								status: "loading",
								progress: data.progress ?? 0,
							},
						];
					});
				});

				// =================================================
				// SYNC PROGRESS
				// =================================================

				removeSyncProgressListener = deviceStatusHub.onSyncProgress((data: DeviceSyncStatus) => {
					if (!mounted) {
						return;
					}

					console.log("SYNC PROGRESS:", data);

					setSyncStatus((prev) =>
						prev.map((item) =>
							item.deviceId === data.deviceId
								? {
										...item,
										...data,
										status: "loading",
									}
								: item
						)
					);
				});

				// =================================================
				// SYNC COMPLETED
				// =================================================

				removeSyncCompletedListener = deviceStatusHub.onSyncCompleted((data: DeviceSyncStatus) => {
					if (!mounted) {
						return;
					}

					console.log("SYNC COMPLETED:", data);

					// Long-running sync is finished
					syncDeviceManager.remove(data.deviceId);

					setSyncStatus((prev) =>
						prev.map((item) =>
							item.deviceId === data.deviceId
								? {
										...item,
										...data,
										status: "success",
										progress: 100,
									}
								: item
						)
					);
				});

				// =================================================
				// SYNC FAILED
				// =================================================

				removeSyncStoppedListener = deviceStatusHub.onSyncStopped((data: DeviceSyncStatus) => {
					if (!mounted) {
						return;
					}

					console.log("SYNC STOPPED:", data);

					// Sync stopped
					syncDeviceManager.remove(data.deviceId);

					setSyncStatus((prev) =>
						prev.map((item) =>
							item.deviceId === data.deviceId
								? {
										...item,
										...data,
										status: "stopped",
									}
								: item
						)
					);
				});

				// =================================================
				// SYNC STOPPED
				// =================================================

				removeSyncStoppedListener = deviceStatusHub.onSyncStopped((data: DeviceSyncStatus) => {
					if (!mounted) {
						return;
					}

					console.log("SYNC STOPPED:", data);

					setSyncStatus((prev) =>
						prev.map((item) =>
							item.deviceId === data.deviceId
								? {
										...item,
										...data,
										status: "stopped",
									}
								: item
						)
					);
				});
			} catch (error) {
				console.error("❌ SignalR connection error:", error);

				if (mounted) {
					setIsConnected(false);
				}
			}
		};

		initialize();

		// =========================================================
		// CLEANUP
		// =========================================================

		return () => {
			mounted = false;

			removeStatusListener?.();
			removeLastSyncListener?.();

			removeSyncStartedListener?.();
			removeSyncProgressListener?.();
			removeSyncCompletedListener?.();
			removeSyncFailedListener?.();
			removeSyncStoppedListener?.();

			// Don't stop shared SignalR connection.
		};
	}, []);

	// =========================================================
	// NORMALIZE DEVICE IDS
	// =========================================================

	const normalizedDeviceIds = useMemo(() => {
		return [...new Set(deviceIds.filter((id) => Number.isInteger(id)))];
	}, [deviceIds]);

	// =========================================================
	// DEVICE SUBSCRIPTIONS
	// =========================================================

	useEffect(() => {
		if (!isConnected) {
			return;
		}

		const updateSubscriptions = async () => {
			const currentIds = normalizedDeviceIds;
			const oldIds = previousDeviceIds.current;
			const syncingIds = syncDeviceManager.getAll();

			const removedIds = oldIds.filter((id) => !currentIds.includes(id) && !syncingIds.includes(id));

			const newIds = currentIds.filter((id) => !oldIds.includes(id));

			// ================================
			// CONSOLE DEBUG
			// ================================
			console.log("start");
			console.log("📡 CURRENT DEVICE IDS:", currentIds);

			console.log("🔄 SYNC SUBSCRIBED DEVICE IDS:", syncingIds);

			console.log("📡 PREVIOUS SUBSCRIBED DEVICE IDS:", oldIds);

			console.log("🟢 NEW DEVICES TO SUBSCRIBE:", newIds);

			console.log("🔴 DEVICES TO UNSUBSCRIBE:", removedIds);

			try {
				// ================================
				// UNSUBSCRIBE
				// ================================

				if (removedIds.length > 0) {
					console.log("📤 Sending UnsubscribeToDevices:", removedIds);

					await deviceStatusHub.unsubscribeFromDevices(removedIds);
				}

				// ================================
				// SUBSCRIBE
				// ================================

				if (newIds.length > 0) {
					console.log("📥 Sending SubscribeToDevices:", newIds);

					await deviceStatusHub.subscribeToDevices(newIds);
				}

				// Update local subscription list
				previousDeviceIds.current = currentIds;

				console.log("✅ CURRENT SUBSCRIBED DEVICE LIST:", previousDeviceIds.current);
				console.log("end");
			} catch (error) {
				console.error("❌ Device subscription error:", error);
			}
		};

		updateSubscriptions();
	}, [normalizedDeviceIds, isConnected]);

	// =========================================================
	// RETURN
	// =========================================================

	return {
		connectionStatus,
		isConnected,
		syncStatus,
		setSyncStatus,
		lastSyncUpdates,
	};
}
