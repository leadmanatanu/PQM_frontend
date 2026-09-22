"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";

import { fetchDeviceParameter, fetchDevices, fetchProfiles, ProfileItem, scanDevice } from "../../../api/device";
import { Device } from "../../../components/dashboard/device/devices-table";
import { DeviceFilters } from "../../../components/dashboard/devicereadings/device-selection";
import { DeviceRTable, LiveScanGroup, LiveScanItem } from "../../../components/dashboard/devicereadings/devices-table";

export default function Page(): React.JSX.Element {
	const [loading, setLoading] = useState<"devices" | "profiles" | "parameters" | null>("devices");
	const [devices, setDevices] = useState<Device[]>([]);
	const [profiles, setProfiles] = useState<ProfileItem[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | number>(0);
	const [selectedProfileIds, setSelectedProfileIds] = useState<number[]>([]);
	const [devParamArr, setDevParamArr] = useState<any[]>([]);

	// Live Scan States
	const [scanItems, setScanItems] = useState<LiveScanItem[]>([]);
	const [scanGroups, setScanGroups] = useState<LiveScanGroup[]>([]);
	const [scannedAt, setScannedAt] = useState<string | null>(null);
	const [isScanning, setIsScanning] = useState<boolean>(false);
	const [scanStatusText, setScanStatusText] = useState<string>("Connecting to DLMS meter and scanning live values...");
	const [hasScanned, setHasScanned] = useState<boolean>(false);
	const [concurrencyError, setConcurrencyError] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading("devices");
			try {
				const [fetchedDevices, fetchedProfiles] = await Promise.all([fetchDevices(), fetchProfiles()]);
				setDevices(fetchedDevices ?? []);
				setProfiles(fetchedProfiles ?? []);
			} catch (error) {
				console.error("Failed to fetch initial data:", error);
			} finally {
				setLoading(null);
			}
		};
		loadInitialData();
	}, []);

	// Fetches and merges parameters across one or more selected profiles.
	// If profileIds is empty, fetches the device's default/full parameter list (profileId = null).
	// Each parameter keeps its originating profileId/profileName so the UI can group by profile.
	const loadParameters = async (deviceId: string | number, profileIds: number[]) => {
		if (!deviceId || Number(deviceId) <= 0) {
			setDevParamArr([]);
			return;
		}

		setLoading("parameters");
		try {
			const idsToFetch: (number | null)[] = profileIds.length > 0 ? profileIds : [null];

			const results = await Promise.all(
				idsToFetch.map(async (pid) => {
					const response = await fetchDeviceParameter(deviceId, pid);
					const profile = pid === null ? null : profiles.find((p) => p.id === pid);
					const profileName = profile?.friendlyName || profile?.obisCode || "General";

					return (response?.data ?? []).map((param: any) => ({
						...param,
						profileId: pid,
						profileName,
					}));
				})
			);

			const rawList = results.flat();

			// Dedupe WITHIN a profile only — the same parameter may legitimately
			// belong to more than one profile and must be shown under each.
			const seenKeys = new Set<string>();
			const uniqueParams = rawList.filter((param: any) => {
				if (param.isVisible === false) return false;
				const key = `${param.profileId ?? "none"}::${param.name}`;
				if (seenKeys.has(key)) return false;
				seenKeys.add(key);
				return true;
			});
			setDevParamArr(uniqueParams);
		} catch (error) {
			console.error("Failed to fetch device parameters:", error);
			setDevParamArr([]);
		} finally {
			setLoading(null);
		}
	};

	const handleDeviceSelection = async (id: string | number) => {
		setSelectedDeviceId(id);
		setSelectedProfileIds([]);
		setHasScanned(false);
		setScanItems([]);
		setScanGroups([]);
		setScannedAt(null);
		setConcurrencyError(null);
		setErrorMessage(null);
		await loadParameters(id, []);
	};

	const handleProfileSelection = async (profileIds: number[]) => {
		setSelectedProfileIds(profileIds);
		await loadParameters(selectedDeviceId, profileIds);
	};

	const handleScanSubmit = async (params: {
		deviceId: string | number | null;
		profileIds: number[];
		paramIds: (string | number)[];
	}) => {
		if (!params.deviceId) return;

		setIsScanning(true);
		setScanStatusText("Connecting to DLMS meter and scanning live values...");
		setConcurrencyError(null);
		setErrorMessage(null);

		try {
			const result = await scanDevice(
				params.deviceId,
				params.profileIds.length > 0 ? params.profileIds : null,
				params.paramIds
			);
			if (result.status && result.data) {
				console.log("hello !");
				console.log("LIVE SCAN RESULT:", result);
				console.log("LIVE SCAN DATA:", result.data);
				console.log("LIVE SCAN GROUPS:", result.data?.groups);
				console.log("FIRST GROUP:", result.data?.groups?.[0]);
				console.log("FIRST GROUP ITEMS:", result.data?.groups?.[0]?.items);

				// setScanItems(result.data.items ?? []);
				setScanGroups(result.data.groups ?? []);
				setScannedAt(result.data.scannedAt ?? new Date().toISOString());
				setHasScanned(true);
			} else if (result.isConcurrencyError) {
				setConcurrencyError(result.error || "Device is currently syncing — please try scanning again in a moment");
				setHasScanned(false);
			} else {
				setErrorMessage(result.error || "Failed to connect and scan meter live values.");
				setHasScanned(false);
			}
		} catch (err: any) {
			setErrorMessage(err.message || "An error occurred during live scan.");
			setHasScanned(false);
		} finally {
			setIsScanning(false);
		}
	};

	return (
		<Stack spacing={2}>
			{/* Filter controls form */}
			<DeviceFilters
				devices={devices}
				profiles={profiles}
				parameters={devParamArr}
				selectedDeviceId={selectedDeviceId}
				selectedProfileIds={selectedProfileIds}
				onDeviceSelect={handleDeviceSelection}
				onProfileSelect={handleProfileSelection}
				onScan={handleScanSubmit}
				isLoadingProfiles={loading === "profiles"}
				isLoadingParams={loading === "parameters"}
				isScanning={isScanning}
			/>

			{/* Live Scan Results Table */}
			<DeviceRTable
				// items={scanItems}
				groups={scanGroups}
				scannedAt={scannedAt}
				isScanning={isScanning}
				scanStatusText={scanStatusText}
				hasScanned={hasScanned}
				concurrencyError={concurrencyError}
				errorMessage={errorMessage}
			/>
		</Stack>
	);
}
