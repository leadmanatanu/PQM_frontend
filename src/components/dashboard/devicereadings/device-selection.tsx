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
    Chip,
    Typography,
    Grid,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

import type { Device } from '../../../components/dashboard/device/devices-table';
import type { ProfileItem } from '../../../services/profile.service';

interface DeviceFiltersProps {
    devices?: Device[];
    profiles?: ProfileItem[];
    parameters?: any[];
    selectedDeviceId?: string | number;
    selectedProfileId?: number | null;
    onDeviceSelect?: (id: string | number) => void;
    onProfileSelect?: (profileId: number | null) => void;
    onScan?: (scanParams: {
        deviceId: string | number | null;
        profileId: number | null;
        paramIds: (string | number)[];
    }) => void;
    isLoadingProfiles?: boolean;
    isLoadingParams?: boolean;
    isScanning?: boolean;
}

export function DeviceFilters({
    devices = [],
    profiles = [],
    parameters = [],
    selectedDeviceId = 0,
    selectedProfileId = null,
    onDeviceSelect = () => { },
    onProfileSelect = () => { },
    onScan = () => { },
    isLoadingProfiles = false,
    isLoadingParams = false,
    isScanning = false,
}: DeviceFiltersProps): React.JSX.Element {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);
    const [selectedParams, setSelectedParams] = useState<any[]>([]);

    const [errors, setErrors] = useState({
        device: false,
    });

    // Sync internal selectedDevice with prop changes
    useEffect(() => {
        if (selectedDeviceId && devices.length > 0) {
            const found = devices.find(d => String(d.id) === String(selectedDeviceId));
            if (found) setSelectedDevice(found);
        } else if (!selectedDeviceId) {
            setSelectedDevice(null);
        }
    }, [selectedDeviceId, devices]);

    // Sync internal selectedProfile with prop changes
    useEffect(() => {
        if (selectedProfileId && profiles.length > 0) {
            const found = profiles.find(p => p.profileId === selectedProfileId);
            if (found) setSelectedProfile(found);
        } else if (!selectedProfileId) {
            setSelectedProfile(null);
        }
    }, [selectedProfileId, profiles]);

    // Synchronize selected parameters with current parameters list
    useEffect(() => {
        if (selectedParams.length > 0) {
            const validIds = new Set(parameters.map((p: any) => p.id));
            const filtered = selectedParams.filter((p: any) => validIds.has(p.id));
            if (filtered.length !== selectedParams.length) {
                setSelectedParams(filtered);
            }
        }
    }, [parameters]);

    const handleDeviceChange = (
        event: React.SyntheticEvent,
        newValue: Device | null
    ) => {
        setSelectedDevice(newValue);
        setSelectedProfile(null);
        setSelectedParams([]);
        onDeviceSelect(newValue ? newValue.id : 0);
        onProfileSelect(null);
    };

    const handleProfileChange = (
        event: React.SyntheticEvent,
        newValue: ProfileItem | null
    ) => {
        setSelectedProfile(newValue);
        setSelectedParams([]);
        onProfileSelect(newValue ? newValue.profileId : null);
    };

    const handleScanClick = () => {
        const isDeviceMissing = !selectedDevice;
        setErrors({ device: isDeviceMissing });

        if (isDeviceMissing) return;

        onScan({
            deviceId: selectedDevice ? selectedDevice.id : null,
            profileId: selectedProfile ? selectedProfile.profileId : null,
            paramIds: selectedParams.map((p: any) => p.id),
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
                    {/* Row 1: Device Dropdown (6 cols), Profile Dropdown (6 cols) */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                id="device-filter-autocomplete"
                                options={devices}
                                size="small"
                                getOptionLabel={getDeviceLabel}
                                value={selectedDevice}
                                onChange={handleDeviceChange}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select or type to search device"
                                        variant="outlined"
                                        size="small"
                                        error={errors.device}
                                        helperText={errors.device ? "Device selection is required" : ""}
                                    />
                                )}
                                openOnFocus
                            />
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                id="profile-filter-autocomplete"
                                options={profiles}
                                size="small"
                                disabled={!selectedDevice || isLoadingProfiles}
                                getOptionLabel={(profile) => profile.friendlyName || profile.obisCode || ''}
                                value={selectedProfile}
                                onChange={handleProfileChange}
                                isOptionEqualToValue={(option, value) => option.profileId === value.profileId}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.profileId}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                                            <Typography variant="body2">{option.friendlyName}</Typography>
                                            <Chip
                                                label={option.category || 'TimeSeries'}
                                                size="small"
                                                variant="outlined"
                                                color={option.category === 'Static' ? 'secondary' : 'primary'}
                                                sx={{ fontSize: '0.7rem', height: '20px', ml: 1 }}
                                            />
                                        </Stack>
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={
                                            isLoadingProfiles
                                                ? "Loading profiles..."
                                                : selectedDevice
                                                ? "Select or type profile (optional - default all)"
                                                : "Select a device first"
                                        }
                                        variant="outlined"
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {isLoadingProfiles ? <CircularProgress color="inherit" size={16} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                                openOnFocus
                            />
                        </FormControl>
                    </Grid>

                    {/* Row 2: Parameters (Flex with Scan Button) */}
                    <Grid size={12}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                            <FormControl fullWidth size="small">
                                <Autocomplete
                                    id="parameter-filter-autocomplete"
                                    multiple
                                    disableCloseOnSelect
                                    options={parameters.length > 0 ? [{ id: 'SELECT_ALL', name: 'Select All' }, ...parameters] : []}
                                    size="small"
                                    disabled={!selectedDevice || isLoadingParams}
                                    getOptionLabel={(param) => param.name || ''}
                                    value={selectedParams}
                                    onChange={(event, newValue) => {
                                        const selectAllObj = newValue.find((item: any) => item.id === 'SELECT_ALL');
                                        if (selectAllObj) {
                                            if (selectedParams.length === parameters.length) {
                                                setSelectedParams([]);
                                            } else {
                                                setSelectedParams([...parameters]);
                                            }
                                        } else {
                                            setSelectedParams(newValue);
                                        }
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    renderOption={(props, option, { selected }) => {
                                        if (option.id === 'SELECT_ALL') {
                                            const allSelected = parameters.length > 0 && selectedParams.length === parameters.length;
                                            const someSelected = selectedParams.length > 0 && selectedParams.length < parameters.length;
                                            return (
                                                <li {...props} key="SELECT_ALL" style={{ borderBottom: '1px solid var(--mui-palette-divider)', fontWeight: 600 }}>
                                                    <Checkbox
                                                        icon={icon}
                                                        checkedIcon={checkedIcon}
                                                        style={{ marginRight: 8 }}
                                                        checked={allSelected}
                                                        indeterminate={someSelected}
                                                    />
                                                    Select All ({parameters.length})
                                                </li>
                                            );
                                        }
                                        return (
                                            <li {...props} key={option.id}>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{ marginRight: 8 }}
                                                    checked={selected}
                                                />
                                                {option.name}
                                            </li>
                                        );
                                    }}
                                    renderTags={(tagValue, getTagProps) =>
                                        tagValue.map((option, index) => {
                                            const { key, ...chipProps } = getTagProps({ index });
                                            return (
                                                <Chip
                                                    key={key}
                                                    label={option.name}
                                                    size="small"
                                                    {...chipProps}
                                                    sx={{ fontSize: '0.75rem', height: '22px' }}
                                                />
                                            );
                                        })
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={
                                                isLoadingParams
                                                    ? "Loading parameters..."
                                                    : selectedDevice
                                                    ? selectedParams.length > 0
                                                        ? `${selectedParams.length} parameter${selectedParams.length > 1 ? 's' : ''} selected`
                                                        : "Select parameters (optional - default all)"
                                                    : "Select a device first"
                                            }
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {isLoadingParams ? <CircularProgress color="inherit" size={16} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />
                                    )}
                                    openOnFocus
                                    limitTags={4}
                                    getLimitTagsText={(more) => `+${more} more`}
                                />
                            </FormControl>

                            <Button
                                variant="contained"
                                color="primary"
                                size="medium"
                                startIcon={isScanning ? <CircularProgress size={16} color="inherit" /> : <SearchIcon fontSize="small" />}
                                onClick={handleScanClick}
                                disabled={isScanning}
                                sx={{ height: 38, minWidth: 120, px: 2.5, fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0 }}
                            >
                                {isScanning ? "Scanning..." : "Scan"}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}