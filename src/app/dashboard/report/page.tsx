'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { DeviceRTable } from '@/components/dashboard/report/report-table';
import { ReportFilters } from '@/components/dashboard/report/report-selection';

import {
    fetchDevices,
    fetchProfiles,
    fetchDeviceParameter,
    ProfileItem
} from '@/api/device';
import { fetchAggregatedReport, exportAggregatedReport } from '@/services/logs.service';
import { Device } from '@/components/dashboard/device/devices-table';

interface DeviceLog {
    [key: string]: any;
}

export default function Page(): React.JSX.Element {
    const [loading, setLoading] = useState<'devices' | 'profiles' | 'parameters' | 'search' | null>('devices');
    const [devices, setDevices] = useState<Device[]>([]);
    const [profiles, setProfiles] = useState<ProfileItem[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | number>(0);
    const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
    const [selectedObjectType, setSelectedObjectType] = useState<string>('All');
    const [objectTypes, setObjectTypes] = useState<string[]>(['All']);
    const [devParamArr, setDevParamArr] = useState<any[]>([]);
    const [deviceLogArr, setDeviceLogArr] = useState<DeviceLog[]>([]);

    // Search & Pagination states
    const [searchPage, setSearchPage] = useState<number>(0);
    const [searchRowsPerPage, setSearchRowsPerPage] = useState<number>(20);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [lastSearchParams, setLastSearchParams] = useState<{
        deviceId: string | number | null;
        profileId: number | null;
        objectType: string | null;
        paramIds: (string | number)[];
        startDate: string;
        endDate: string;
        intervalMinutes: number;
    } | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading('devices');
            try {
                const [fetchedDevices, fetchedProfiles] = await Promise.all([
                    fetchDevices(),
                    fetchProfiles()
                ]);
                setDevices(fetchedDevices ?? []);
                setProfiles(fetchedProfiles ?? []);
            } catch (error) {
                console.error('Failed to fetch initial data:', error);
            } finally {
                setLoading(null);
            }
        };
        loadInitialData();
    }, []);

    const loadParameters = async (deviceId: string | number, profileId: number | null) => {
        if (!deviceId || Number(deviceId) <= 0) {
            setDevParamArr([]);
            setObjectTypes(['All']);
            return;
        }

        setLoading('parameters');
        try {
            const fetchedDeviceParameter = await fetchDeviceParameter(deviceId, profileId);
            const rawList = fetchedDeviceParameter?.data ?? [];
            const seenNames = new Set<string>();
            const uniqueParams = rawList.filter((param: any) => {
                if (param.isVisible === false) return false;
                if (seenNames.has(param.name)) return false;
                seenNames.add(param.name);
                return true;
            });
            setDevParamArr(uniqueParams);

            // Extract distinct ObjectType values
            const distinctObjTypes = Array.from(
                new Set(uniqueParams.map((p: any) => p.objectType).filter(Boolean))
            ) as string[];
            setObjectTypes(['All', ...distinctObjTypes]);
        } catch (error) {
            console.error('Failed to fetch device parameters:', error);
            setDevParamArr([]);
            setObjectTypes(['All']);
        } finally {
            setLoading(null);
        }
    };

    const handleDeviceSelection = async (id: string | number) => {
        setSelectedDeviceId(id);
        setSelectedProfileId(null);
        setSelectedObjectType('All');
        setHasSearched(false);
        setDeviceLogArr([]);
        setTotalCount(0);
        setLastSearchParams(null);
        setSearchPage(0);
        await loadParameters(id, null);
    };

    const handleProfileSelection = async (profileId: number | null) => {
        setSelectedProfileId(profileId);
        await loadParameters(selectedDeviceId, profileId);
    };

    const handleObjectTypeSelection = (objType: string) => {
        setSelectedObjectType(objType);
    };

    const executeSearch = async (
        deviceId: string | number | null,
        profileId: number | null,
        objectType: string | null,
        paramIds: (string | number)[],
        startDate: string,
        endDate: string,
        intervalMinutes: number,
        pageNumber: number,
        pageSize: number
    ) => {
        setLoading('search');
        try {
            const response = await fetchAggregatedReport(
                deviceId,
                profileId,
                objectType,
                paramIds.length > 0 ? paramIds : null,
                startDate,
                endDate,
                intervalMinutes,
                pageNumber + 1,
                pageSize
            );

            const payload = response?.data;
            const list = Array.isArray(payload?.deviceLogSearch)
                ? payload.deviceLogSearch
                : (Array.isArray(payload) ? payload : (Array.isArray(response) ? response : []));

            const total = payload?.totalCount ?? response?.totalCount ?? list.length;

            setDeviceLogArr(list);
            setTotalCount(total);
            setHasSearched(true);
        } catch (error) {
            console.error('Failed to search aggregated report readings:', error);
            setDeviceLogArr([]);
            setTotalCount(0);
            setHasSearched(true);
        } finally {
            setLoading(null);
        }
    };

    const handleSearchSubmit = (params: {
        deviceId: string | number | null;
        profileId: number | null;
        objectType: string | null;
        paramIds: (string | number)[];
        startDate: string;
        endDate: string;
        intervalMinutes: number;
    }) => {
        setLastSearchParams(params);
        setSearchPage(0);
        executeSearch(
            params.deviceId,
            params.profileId,
            params.objectType,
            params.paramIds,
            params.startDate,
            params.endDate,
            params.intervalMinutes,
            0,
            searchRowsPerPage
        );
    };

    const handleExport = () => {
        if (!lastSearchParams || !lastSearchParams.deviceId) return;
        exportAggregatedReport(
            lastSearchParams.deviceId,
            lastSearchParams.profileId,
            lastSearchParams.objectType,
            lastSearchParams.paramIds,
            lastSearchParams.startDate,
            lastSearchParams.endDate,
            lastSearchParams.intervalMinutes
        );
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setSearchPage(newPage);
        if (lastSearchParams) {
            executeSearch(
                lastSearchParams.deviceId,
                lastSearchParams.profileId,
                lastSearchParams.objectType,
                lastSearchParams.paramIds,
                lastSearchParams.startDate,
                lastSearchParams.endDate,
                lastSearchParams.intervalMinutes,
                newPage,
                searchRowsPerPage
            );
        }
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        setSearchRowsPerPage(newSize);
        setSearchPage(0);
        if (lastSearchParams) {
            executeSearch(
                lastSearchParams.deviceId,
                lastSearchParams.profileId,
                lastSearchParams.objectType,
                lastSearchParams.paramIds,
                lastSearchParams.startDate,
                lastSearchParams.endDate,
                lastSearchParams.intervalMinutes,
                0,
                newSize
            );
        }
    };

    if (loading === 'devices') {
        return (
            <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ minHeight: '300px' }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">Loading devices...</Typography>
            </Stack>
        );
    }

    return (
        <Stack spacing={2}>

            {/* Filter controls form */}
            <ReportFilters
                devices={devices}
                profiles={profiles}
                parameters={devParamArr}
                objectTypes={objectTypes}
                selectedDeviceId={selectedDeviceId}
                selectedProfileId={selectedProfileId}
                selectedObjectType={selectedObjectType}
                onDeviceSelect={handleDeviceSelection}
                onProfileSelect={handleProfileSelection}
                onObjectTypeSelect={handleObjectTypeSelection}
                onSearch={handleSearchSubmit}
                onExport={handleExport}
                canExport={!!lastSearchParams?.deviceId && loading !== 'search'}
                isLoadingProfiles={loading === 'profiles'}
                isLoadingParams={loading === 'parameters'}
                isSearching={loading === 'search'}
            />

            {/* Pivoted Readings Table — rows=parameters, columns=aggregated time buckets */}
            <DeviceRTable
                rows={deviceLogArr}
                totalCount={totalCount}
                page={searchPage}
                rowsPerPage={searchRowsPerPage}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                hasSearched={hasSearched}
            />
        </Stack>
    );
}
