"use client";

import Box from "@mui/material/Box";
import * as React from "react";
import { useEffect, useState } from "react";

import { fetchDevices, ProfileItem } from "../../../api/device";
import { Device } from "../../../components/dashboard/device/devices-table";
import { ReportFilters } from "../../../components/dashboard/report/report-selection";
import { DeviceRTable } from "../../../components/dashboard/report/report-table";
import {
	exportAggregatedReport,
	fetchAggregatedReport,
	fetchParametersByProfile,
	fetchProfilesByDevice,
} from "../../../services/logs.service";

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
	const [blockLoadPage, setBlockLoadPage] = useState<number>(1);
	const BLOCK_LOAD_PAGE_SIZE = 96;
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
            const fetchedDevices = await fetchDevices();

            setDevices(fetchedDevices ?? []);
            setProfiles([]);
        } catch (error) {
            console.error("Failed to fetch devices:", error);
        } finally {
            setLoading(null);
        }
    };

    loadInitialData();
}, []);

	const handleDeviceSelection = async (id: string | number) => {
    setSelectedDeviceId(id);
    setSelectedProfileIds([]);
    setSelectedObjectType("All");
    setDevParamArr([]);
    setObjectTypes(["All"]);
    setHasSearched(false);
    setReportGroups([]);
    setLastSearchParams(null);

    if (!id || Number(id) <= 0) {
        setProfiles([]);
        return;
    }

    setLoading("profiles");

    try {
        const response = await fetchProfilesByDevice(id);

        const deviceProfiles: ProfileItem[] = response?.data ?? [];

        // Load profiles for this device
        setProfiles(deviceProfiles);

        // Do NOT select profiles automatically
        setSelectedProfileIds([]);

        // Do NOT load parameters yet
        setDevParamArr([]);
        setObjectTypes(["All"]);
    } catch (error) {
        console.error(
            "Failed to fetch profiles for device:",
            error
        );

        setProfiles([]);
        setSelectedProfileIds([]);
        setDevParamArr([]);
        setObjectTypes(["All"]);
    } finally {
        setLoading(null);
    }
};
	const handleProfileSelection = async (profileIds: number[]) => {
    setSelectedProfileIds(profileIds);

    if (!selectedDeviceId || Number(selectedDeviceId) <= 0) {
        setDevParamArr([]);
        setObjectTypes(["All"]);
        return;
    }

    if (profileIds.length === 0) {
        setDevParamArr([]);
        setObjectTypes(["All"]);
        return;
    }

    setLoading("parameters");

    try {
        const responses = await Promise.all(
            profileIds.map((profileId) =>
                fetchParametersByProfile(profileId)
            )
        );

        const allParameters = responses.flatMap(
            (response) => response?.data ?? []
        );

        // Remove duplicate parameters by ID
        const uniqueParameters = Array.from(
            new Map(
                allParameters.map((parameter: any) => [
                    parameter.id,
                    parameter,
                ])
            ).values()
        );

        setDevParamArr(uniqueParameters);

        const uniqueObjectTypes = Array.from(
            new Set(
                uniqueParameters
                    .map((parameter: any) => parameter.objectType)
                    .filter(Boolean)
            )
        );

        setObjectTypes(["All", ...uniqueObjectTypes]);
    } catch (error) {
        console.error(
            "Failed to fetch parameters for selected profiles:",
            error
        );

        setDevParamArr([]);
        setObjectTypes(["All"]);
    } finally {
        setLoading(null);
    }
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
    intervalMinutes: number,
    pageNumber: number = 1
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
				intervalMinutes,
				pageNumber,
				BLOCK_LOAD_PAGE_SIZE
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
		setBlockLoadPage(1);
		setLastSearchParams(params);

		executeSearch(
			params.deviceId,
			params.profileIds,
			params.objectType,
			params.paramIds,
			params.startDate,
			params.endDate,
			params.intervalMinutes,
			1
		);
	};

	const handleBlockLoadPageChange = (page: number) => {
    if (!lastSearchParams) return;

    setBlockLoadPage(page);

    executeSearch(
        lastSearchParams.deviceId,
        lastSearchParams.profileIds,
        lastSearchParams.objectType,
        lastSearchParams.paramIds,
        lastSearchParams.startDate,
        lastSearchParams.endDate,
        lastSearchParams.intervalMinutes,
        page
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
			<DeviceRTable groups={reportGroups} hasSearched={hasSearched} isSearching={loading === "search"} onBlockLoadPageChange={handleBlockLoadPageChange} />
		</Box>
	);
}
