import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { deviceStatusHub } from "../services/deviceStatusHub";

interface SignalRContextType {
	isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
	isConnected: false,
});

interface SignalRProviderProps {
	children: ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		let mounted = true;

		const startSignalR = async () => {
			try {
				// ✅ CHANGE:
				// SignalR connection starts globally,
				// not inside Devices page.
				await deviceStatusHub.start();

				if (mounted) {
					setIsConnected(true);
				}

				console.log("🌐 Global SignalR connected");
			} catch (error) {
				console.error("❌ Global SignalR connection error:", error);

				if (mounted) {
					setIsConnected(false);
				}
			}
		};

		startSignalR();

		return () => {
			mounted = false;

			// ⚠️ IMPORTANT:
			// Do NOT call deviceStatusHub.stop()
			// here.
			//
			// SignalR must remain alive when
			// Devices → Report → Scheduling etc.
			// changes happen.
		};
	}, []);

	return <SignalRContext.Provider value={{ isConnected }}>{children}</SignalRContext.Provider>;
}

export function useSignalR() {
	return useContext(SignalRContext);
}
