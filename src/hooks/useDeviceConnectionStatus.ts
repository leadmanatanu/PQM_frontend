import { useEffect, useMemo, useRef, useState } from "react";

import { deviceStatusHub } from "../services/deviceStatusHub";

export function useDeviceConnectionStatus(deviceIds: number[]) {
	const [connectionStatus, setConnectionStatus] = useState<Record<number, boolean>>({});

	const [isConnected, setIsConnected] = useState(false);

	const previousDeviceIds = useRef<number[]>([]);

	useEffect(() => {
		let mounted = true;
		let removeListener: (() => void) | undefined;

		const initialize = async () => {
			try {
				await deviceStatusHub.start();

				if (!mounted) return;

				setIsConnected(true);

				removeListener = deviceStatusHub.onDeviceStatusChanged((deviceId, isOnline) => {
					if (!mounted) return;

					console.log("📥 STATUS:", deviceId, isOnline);

					setConnectionStatus((prev) => ({
						...prev,
						[deviceId]: isOnline,
					}));
				});
			} catch (error) {
				console.error("❌ SignalR connection error:", error);

				if (mounted) {
					setIsConnected(false);
				}
			}
		};

		initialize();

		return () => {
			mounted = false;
			removeListener?.();
		};
	}, []);

	const normalizedDeviceIds = useMemo(() => {
		return [...new Set(deviceIds.filter((id) => Number.isInteger(id)))];
	}, [deviceIds]);

	useEffect(() => {
		if (!isConnected) return;

		const updateSubscriptions = async () => {
			const currentIds = normalizedDeviceIds;

			const oldIds = previousDeviceIds.current;

			const removedIds = oldIds.filter((id) => !currentIds.includes(id));

			const newIds = currentIds.filter((id) => !oldIds.includes(id));

			try {
				if (removedIds.length > 0) {
					await deviceStatusHub.unsubscribeFromDevices(removedIds);
				}

				if (newIds.length > 0) {
					await deviceStatusHub.subscribeToDevices(newIds);
				}

				previousDeviceIds.current = currentIds;
			} catch (error) {
				console.error("❌ Device subscription error:", error);
			}
		};

		updateSubscriptions();
	}, [normalizedDeviceIds, isConnected]);

	return {
		connectionStatus,
		isConnected,
	};
}
