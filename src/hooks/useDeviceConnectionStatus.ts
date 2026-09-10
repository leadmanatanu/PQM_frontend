// signalR hook
// React state + currently visible 10 devices

import { useEffect, useRef, useState } from "react";

import { deviceStatusHub } from "../services/deviceStatusHub";

export function useDeviceConnectionStatus(deviceIds: string[]) {
	const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});

	const [isConnected, setIsConnected] = useState(false);

	const previousDeviceIds = useRef<string[]>([]);

	useEffect(() => {
		let mounted = true;

		const initialize = async () => {
			try {
				await deviceStatusHub.start();

				if (!mounted) return;

				setIsConnected(true);

				deviceStatusHub.onDeviceStatusChanged((deviceId, isOnline) => {
					if (!mounted) return;

					setConnectionStatus((prev) => ({
						...prev,
						[deviceId]: isOnline,
					}));
				});
			} catch (error) {
				console.error("SignalR connection error:", error);
			}
		};

		initialize();

		return () => {
			mounted = false;

			deviceStatusHub.removeDeviceStatusChangedListener();
		};
	}, []);

	useEffect(() => {
		if (!isConnected) return;

		const updateSubscriptions = async () => {
			const currentIds = [...new Set(deviceIds.filter(Boolean))];

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
				console.error("Device subscription error:", error);
			}
		};

		updateSubscriptions();
	}, [deviceIds, isConnected]);

	return {
		connectionStatus,
		isConnected,
	};
}
