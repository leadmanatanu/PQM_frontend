'use client';

import React, { useState, useEffect } from 'react';
import {
    FormControl,
    TextField,
    Autocomplete,
    Card,
    CardContent,
    Button,
    Stack,
    CircularProgress,
    Typography,
    Grid,
    Tooltip,
    Box,
} from '@mui/material';

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

import type { Device } from '../../../components/dashboard/device/devices-table';
import type { ProfileItem } from '../../../services/profile.service';

interface ReportFiltersProps {
    devices?: Device[];
    profiles?: ProfileItem[];
    parameters?: any[];
    objectTypes?: string[];
    selectedDeviceId?: string | number;
    selectedProfileId?: number | null;
    selectedObjectType?: string;
    onDeviceSelect?: (id: string | number) => void;
    onProfileSelect?: (profileId: number | null) => void;
    onObjectTypeSelect?: (objectType: string) => void;
    onSearch?: (searchParams: {
        deviceId: string | number | null;
        profileId: number | null;
        objectType: string | null;
        paramIds: (string | number)[];
        startDate: string;
        endDate: string;
        intervalMinutes: number;
    }) => void;
    isLoadingProfiles?: boolean;
    isLoadingParams?: boolean;
    isSearching?: boolean;
    onExport?: () => void;
    canExport?: boolean;
}

export function ReportFilters({
    devices = [],
    profiles = [],
    parameters = [],
    objectTypes = ['All'],
    selectedDeviceId = 0,
    selectedProfileId = null,
    selectedObjectType = 'All',
    onDeviceSelect = () => { },
    onProfileSelect = () => { },
    onObjectTypeSelect = () => { },
    onSearch = () => { },
    isLoadingProfiles = false,
    isLoadingParams = false,
    isSearching = false,
    onExport = () => { },
    canExport = false,
}: ReportFiltersProps): React.JSX.Element {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);
    const [objectType, setObjectType] = useState<string>(selectedObjectType || 'All');
    const [selectedParams, setSelectedParams] = useState<any[]>([]);
    const [intervalMinutes, setIntervalMinutes] = useState<number>(15);

    // Single consolidated Date-Time range (From / To)
    const [fromValue, setFromValue] = useState<Dayjs | null>(
        dayjs().subtract(30, 'days').startOf('day')
    );
    const [toValue, setToValue] = useState<Dayjs | null>(
        dayjs().endOf('day')
    );

    // Sync selectedDevice with prop changes
    useEffect(() => {
        if (selectedDeviceId && devices.length > 0) {
            const found = devices.find(d => String(d.id) === String(selectedDeviceId));
            if (found) setSelectedDevice(found);
        } else if (!selectedDeviceId) {
            setSelectedDevice(null);
        }
    }, [selectedDeviceId, devices]);

    // Sync selectedProfile with prop changes
    useEffect(() => {
        if (selectedProfileId && profiles.length > 0) {
            const found = profiles.find(p => p.profileId === selectedProfileId);
            if (found) setSelectedProfile(found);
        } else if (!selectedProfileId) {
            setSelectedProfile(null);
        }
    }, [selectedProfileId, profiles]);

    // Filter parameters by selected Object Type if specified
    const filteredParameters = React.useMemo(() => {
        if (!objectType || objectType === 'All') return parameters;
        return parameters.filter((p: any) => p.objectType === objectType);
    }, [parameters, objectType]);

    // Clean up selected params if options change
    useEffect(() => {
        if (selectedParams.length === 0) return;
        const validIds = new Set(filteredParameters.map((p: any) => p.id));
        const stillValid = selectedParams.filter((p: any) => validIds.has(p.id));
        if (stillValid.length !== selectedParams.length) {
            setSelectedParams(stillValid);
        }
    }, [filteredParameters]);

    const [errors, setErrors] = useState({
        device: false,
        from: false,
        to: false,
        dateInverted: false,
    });

    const handleDeviceChange = (
        event: React.SyntheticEvent,
        newValue: Device | null
    ) => {
        setSelectedDevice(newValue);
        setSelectedProfile(null);
        setObjectType('All');
        setSelectedParams([]);
        onDeviceSelect(newValue ? newValue.id : 0);
        onProfileSelect(null);
        onObjectTypeSelect('All');
    };

    const handleProfileChange = (
        event: React.SyntheticEvent,
        newValue: ProfileItem | null
    ) => {
        setSelectedProfile(newValue);
        setSelectedParams([]);
        onProfileSelect(newValue ? newValue.profileId : null);
    };

    const handleSearch = () => {
        const isDeviceMissing = !selectedDevice;
        const isFromMissing = !fromValue;
        const isToMissing = !toValue;
        const isDateInverted = Boolean(fromValue && toValue && fromValue.isAfter(toValue));

        const newErrors = {
            device: isDeviceMissing,
            from: isFromMissing || isDateInverted,
            to: isToMissing || isDateInverted,
            dateInverted: isDateInverted,
        };
        setErrors(newErrors);

        if (isDeviceMissing || isFromMissing || isToMissing || isDateInverted) return;

        const formattedStart = fromValue ? fromValue.format('YYYY-MM-DD HH:mm:ss') : '';
        const formattedEnd = toValue ? toValue.format('YYYY-MM-DD HH:mm:ss') : '';

        onSearch({
            deviceId: selectedDevice ? selectedDevice.id : null,
            profileId: selectedProfile ? selectedProfile.profileId : null,
            objectType: objectType !== 'All' ? objectType : null,
            paramIds: selectedParams.map((p: any) => p.id),
            startDate: formattedStart,
            endDate: formattedEnd,
            intervalMinutes,
        });
    };

    const getDeviceLabel = (device: Device) => {
        if (!device) return '';
        const details = device.serialNumber ? device.serialNumber : device.ip ? device.ip : null;
        return details ? `${device.name} (${details})` : device.name;
    };

    return (
        <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={1.5}>
                    {/* Row 1: Device, Profile, From (DateTime), To (DateTime) */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                id="report-device-autocomplete"
                                options={devices}
                                size="small"
                                getOptionLabel={getDeviceLabel}
                                value={selectedDevice}
                                onChange={handleDeviceChange}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select or search device"
                                        variant="outlined"
                                        size="small"
                                        error={errors.device}
                                        helperText={errors.device ? "Please select a device" : ""}
                                    />
                                )}
                                openOnFocus
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                id="report-profile-autocomplete"
                                options={profiles}
                                size="small"
                                disabled={!selectedDevice || isLoadingProfiles}
                                getOptionLabel={(profile) => profile.friendlyName || profile.obisCode || ''}
                                value={selectedProfile}
                                onChange={handleProfileChange}
                                isOptionEqualToValue={(option, value) => option.profileId === value.profileId}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            selectedDevice
                                                ? "Select profile (optional - default all)"
                                                : "Select a device first"
                                        }
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                openOnFocus
                            />
                        </FormControl>
                    </Grid>

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <DateTimePicker
                                label="From"
                                value={fromValue}
                                onChange={(newValue) => setFromValue(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: errors.from,
                                        helperText: errors.dateInverted
                                            ? "From cannot be after To"
                                            : errors.from
                                            ? "From date & time is required"
                                            : "",
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <DateTimePicker
                                label="To"
                                value={toValue}
                                onChange={(newValue) => setToValue(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: errors.to,
                                        helperText: errors.dateInverted
                                            ? "To must be after From"
                                            : errors.to
                                            ? "To date & time is required"
                                            : "",
                                    },
                                }}
                            />
                        </Grid>
                    </LocalizationProvider>

                    {/* Row 2: Parameters Autocomplete, Action Buttons */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                multiple
                                id="report-parameters-autocomplete"
                                options={filteredParameters}
                                size="small"
                                disableCloseOnSelect
                                disabled={!selectedDevice || isLoadingParams}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    const unitStr = option.unit ? ` (${option.unit})` : '';
                                    return `${option.name}${unitStr}`;
                                }}
                                value={selectedParams}
                                onChange={(e, newValue) => setSelectedParams(newValue)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderOption={(props, option, { selected }) => {
                                    const { key, ...optionProps } = props;
                                    return (
                                        <li key={key} {...optionProps}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.name} {option.unit ? `(${option.unit})` : ''}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            !selectedDevice
                                                ? "Select a device first"
                                                : isLoadingParams
                                                ? "Loading parameters..."
                                                : "Select parameters (optional - default all)"
                                        }
                                        placeholder={selectedParams.length === 0 ? "All Parameters" : ""}
                                        size="small"
                                    />
                                )}
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                onClick={onExport}
                                disabled={!canExport || isSearching}
                                sx={{ height: 38, px: 2, textTransform: 'none', fontWeight: 600 }}
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                                onClick={handleSearch}
                                disabled={isSearching}
                                sx={{ height: 38, px: 3, textTransform: 'none', fontWeight: 600 }}
                            >
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
