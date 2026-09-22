"use client";

import Box from "@mui/material/Box";
import * as React from "react";
import { useEffect, useState } from "react";

import { fetchDeviceParameter, fetchDevices, fetchProfiles, ProfileItem } from "../../../api/device";
import { Device } from "../../../components/dashboard/device/devices-table";
import { ReportFilters } from "../../../components/dashboard/report/report-selection";
import { DeviceRTable } from "../../../components/dashboard/report/report-table";
import { exportAggregatedReport, fetchAggregatedReport } from "../../../services/logs.service";

interface ReportGroup {
	profileId: number | null;
	profileName: string | null;
	items: any[];
}

export default function Page(): React.JSX.Element {
	const [loading, setLoading] = useState<"devices" | "profiles" | "parameters" | "search" | null>("devices");
	const [devices, setDevices] = useState<Device[]>([]);
	const [profiles, setProfiles] = useState<ProfileItem[]>([]);
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | number>(0);
	const [selectedProfileIds, setSelectedProfileIds] = useState<number[]>([]);
	const [selectedObjectType, setSelectedObjectType] = useState<string>("All");
	const [objectTypes, setObjectTypes] = useState<string[]>(["All"]);
	const [devParamArr, setDevParamArr] = useState<any[]>([]);

	// Grouped report data (no more pagination state)
	const [reportGroups, setReportGroups] = useState<ReportGroup[]>([]);
	const [hasSearched, setHasSearched] = useState<boolean>(false);
	const [lastSearchParams, setLastSearchParams] = useState<{
		deviceId: string | number | null;
		profileIds: number[];
		objectType: string | null;
		paramIds: (string | number)[];
		startDate: string;
		endDate: string;
		intervalMinutes: number;
	} | null>(null);

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

	const loadParameters = async (deviceId: string | number, profileIds: number[]) => {
		if (!deviceId || Number(deviceId) <= 0) {
			setDevParamArr([]);
			setObjectTypes(["All"]);
			return;
		}

		setLoading("parameters");

		try {
			const responses = profileIds.length
				? await Promise.all(profileIds.map((id) => fetchDeviceParameter(deviceId, id)))
				: [await fetchDeviceParameter(deviceId, null)];

			const params = responses.flatMap((r) => r?.data ?? []);
			const seen = new Set<string>();

			const uniqueParams = params.filter((p: any) => {
				if (p.isVisible === false || seen.has(p.name)) return false;
				seen.add(p.name);
				return true;
			});

			setDevParamArr(uniqueParams);
			setObjectTypes(["All", ...Array.from(new Set(uniqueParams.map((p) => p.objectType).filter(Boolean)))]);
		} catch (error) {
			console.error("Failed to fetch device parameters:", error);
			setDevParamArr([]);
			setObjectTypes(["All"]);
		} finally {
			setLoading(null);
		}
	};

	const handleDeviceSelection = async (id: string | number) => {
		setSelectedDeviceId(id);
		setSelectedProfileIds([]);
		setSelectedObjectType("All");
		setHasSearched(false);
		setReportGroups([]);
		setLastSearchParams(null);
		await loadParameters(id, []);
	};

	const handleProfileSelection = async (profileIds: number[]) => {
		setSelectedProfileIds(profileIds);
		await loadParameters(selectedDeviceId, profileIds);
	};

	const handleObjectTypeSelection = (objType: string) => {
		setSelectedObjectType(objType);
	};

	const executeSearch = async (
		deviceId: string | number | null,
		profileIds: number[],
		objectType: string | null,
		paramIds: (string | number)[],
		startDate: string,
		endDate: string,
		intervalMinutes: number
	) => {
		setLoading("search");
		try {
			const response = await fetchAggregatedReport(
				deviceId,
				profileIds,
				objectType,
				paramIds.length > 0 ? paramIds : null,
				startDate,
				endDate,
				intervalMinutes
			);

			const payload = response?.data;
			const groups: ReportGroup[] = Array.isArray(payload?.groups) ? payload.groups : [];

			setReportGroups(groups);
			setHasSearched(true);
		} catch (error) {
			console.error("Failed to search aggregated report readings:", error);
			setReportGroups([]);
			setHasSearched(true);
		} finally {
			setLoading(null);
		}
	};

	const handleSearchSubmit = (params: {
		deviceId: string | number | null;
		profileIds: number[];
		objectType: string | null;
		paramIds: (string | number)[];
		startDate: string;
		endDate: string;
		intervalMinutes: number;
	}) => {
		setLastSearchParams(params);
		executeSearch(
			params.deviceId,
			params.profileIds,
			params.objectType,
			params.paramIds,
			params.startDate,
			params.endDate,
			params.intervalMinutes
		);
	};

	const handleExport = () => {
		if (!lastSearchParams || !lastSearchParams.deviceId) return;
		exportAggregatedReport(
			lastSearchParams.deviceId,
			lastSearchParams.profileIds,
			lastSearchParams.objectType,
			lastSearchParams.paramIds,
			lastSearchParams.startDate,
			lastSearchParams.endDate,
			lastSearchParams.intervalMinutes
		);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 84px)",
				maxHeight: "calc(100vh - 84px)",
				overflow: "hidden",
				gap: 2,
			}}
		>
			{/* Filter controls form */}
			<ReportFilters
				devices={devices}
				profiles={profiles}
				parameters={devParamArr}
				objectTypes={objectTypes}
				selectedDeviceId={selectedDeviceId}
				selectedProfileIds={selectedProfileIds}
				selectedObjectType={selectedObjectType}
				onDeviceSelect={handleDeviceSelection}
				onProfileSelect={handleProfileSelection}
				onObjectTypeSelect={handleObjectTypeSelection}
				onSearch={handleSearchSubmit}
				onExport={handleExport}
				canExport={!!lastSearchParams?.deviceId && loading !== "search"}
				isLoadingProfiles={loading === "profiles"}
				isLoadingParams={loading === "parameters"}
				isSearching={loading === "search"}
			/>

			{/* Grouped-by-profile readings, each group independently collapsible/scrollable */}
			<DeviceRTable groups={reportGroups} hasSearched={hasSearched} isSearching={loading === "search"} />
		</Box>
	);
}
