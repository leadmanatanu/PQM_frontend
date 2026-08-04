'use client';

import React, { useState, useEffect } from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    InputLabel,
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
    Tooltip,
    IconButton,
} from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';

import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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

    const [endValue, setEndValue] = useState<Dayjs | null>(dayjs());
    const [startValue, setStartValue] = useState<Dayjs | null>(
        dayjs().subtract(1, "day")
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
        start: false,
        end: false,
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

    const handleObjectTypeChange = (
        event: React.SyntheticEvent,
        newValue: string | null
    ) => {
        const val = newValue || 'All';
        setObjectType(val);
        setSelectedParams([]);
        onObjectTypeSelect(val);
    };

    const getFormattedDate = (val: Dayjs | null, isEnd: boolean) => {
        if (!val) return '';
        return isEnd ? val.format('YYYY-MM-DD 23:59:59') : val.format('YYYY-MM-DD 00:00:00');
    };

    const handleSearch = () => {
        const isDeviceMissing = !selectedDevice;
        const isStartMissing = !startValue;
        const isEndMissing = !endValue;
        const isDateInverted = Boolean(startValue && endValue && startValue.isAfter(endValue));

        const newErrors = {
            device: isDeviceMissing,
            start: isStartMissing || isDateInverted,
            end: isEndMissing || isDateInverted,
            dateInverted: isDateInverted,
        };
        setErrors(newErrors);

        if (isDeviceMissing || isStartMissing || isEndMissing || isDateInverted) return;

        onSearch({
            deviceId: selectedDevice ? selectedDevice.id : null,
            profileId: selectedProfile ? selectedProfile.profileId : null,
            objectType: objectType !== 'All' ? objectType : null,
            paramIds: selectedParams.map((p: any) => p.id),
            startDate: getFormattedDate(startValue, false),
            endDate: getFormattedDate(endValue, true),
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
                    {/* Row 1: Device, Profile, Start Date, End Date */}
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
                                            isLoadingProfiles
                                                ? "Loading profiles..."
                                                : selectedDevice
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
                            <DatePicker
                                label="Start Date"
                                value={startValue}
                                onChange={(newValue) => setStartValue(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: errors.start,
                                        helperText: errors.dateInverted
                                            ? "Start Date cannot be after End Date"
                                            : errors.start
                                            ? "Start date is required"
                                            : "",
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 3 }}>
                            <DatePicker
                                label="End Date"
                                value={endValue}
                                onChange={(newValue) => setEndValue(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        error: errors.end,
                                        helperText: errors.dateInverted
                                            ? "End Date must be after Start Date"
                                            : errors.end
                                            ? "End date is required"
                                            : "",
                                    },
                                }}
                            />
                        </Grid>
                    </LocalizationProvider>

                    {/* Row 2: Parameters + Aggregation Interval + Inline Search */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth size="small">
                            <Autocomplete
                                id="report-parameter-autocomplete"
                                multiple
                                disableCloseOnSelect
                                options={filteredParameters.length > 0 ? [{ id: 'SELECT_ALL', name: 'Select All' }, ...filteredParameters] : []}
                                size="small"
                                disabled={!selectedDevice || isLoadingParams}
                                getOptionLabel={(param) => param.name || ''}
                                value={selectedParams}
                                onChange={(event, newValue) => {
                                    const selectAllObj = newValue.find((item: any) => item.id === 'SELECT_ALL');
                                    if (selectAllObj) {
                                        if (selectedParams.length === filteredParameters.length) {
                                            setSelectedParams([]);
                                        } else {
                                            setSelectedParams([...filteredParameters]);
                                        }
                                    } else {
                                        setSelectedParams(newValue);
                                    }
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderOption={(props, option, { selected }) => {
                                    if (option.id === 'SELECT_ALL') {
                                        const allSelected = filteredParameters.length > 0 && selectedParams.length === filteredParameters.length;
                                        const someSelected = selectedParams.length > 0 && selectedParams.length < filteredParameters.length;
                                        return (
                                            <li {...props} key="SELECT_ALL" style={{ borderBottom: '1px solid var(--mui-palette-divider)', fontWeight: 600 }}>
                                                <Checkbox
                                                    icon={icon}
                                                    checkedIcon={checkedIcon}
                                                    style={{ marginRight: 8 }}
                                                    checked={allSelected}
                                                    indeterminate={someSelected}
                                                />
                                                Select All ({filteredParameters.length})
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
                                    />
                                )}
                                openOnFocus
                                limitTags={4}
                                getLimitTagsText={(more) => `+${more} more`}
                            />
                        </FormControl>
                    </Grid>

                    {/* <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="interval-select-label" sx={{ fontSize: '0.8125rem', lineHeight: '1em' }}>Interval</InputLabel>
                            <Select
                                labelId="interval-select-label"
                                id="interval-select"
                                value={intervalMinutes}
                                label="Interval"
                                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                                size="small"
                                sx={{
                                    fontSize: '0.8125rem',
                                    height: 38,
                                    '& .MuiSelect-select': { py: '8.5px' },
                                }}
                            >
                                <MenuItem value={5} sx={{ fontSize: '0.8125rem' }}>5 min</MenuItem>
                                <MenuItem value={15} sx={{ fontSize: '0.8125rem' }}>15 min</MenuItem>
                                <MenuItem value={30} sx={{ fontSize: '0.8125rem' }}>30 min</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid> */}

                    <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                        <Tooltip title="Export to Excel" arrow>
                            <span>
                                <IconButton
                                    color="primary"
                                    onClick={onExport}
                                    disabled={!canExport || isSearching}
                                    sx={{
                                        height: 38,
                                        width: 38,
                                        border: '1px solid',
                                        borderColor: 'primary.main',
                                        borderRadius: 1,
                                        '&:disabled': { borderColor: 'action.disabled' },
                                    }}
                                >
                                    <TableViewIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="primary"
                            size="medium"
                            startIcon={isSearching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon fontSize="small" />}
                            onClick={handleSearch}
                            disabled={isSearching}
                            sx={{ height: 38, flexGrow: 1, fontWeight: 600, fontSize: '0.8125rem' }}
                        >
                            {isSearching ? "Searching..." : "Search"}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
