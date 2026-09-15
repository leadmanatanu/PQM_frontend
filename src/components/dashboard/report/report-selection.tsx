"use client";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import SearchIcon from "@mui/icons-material/Search";
import {
	Autocomplete,
	Button,
	Card,
	CardContent,
	CircularProgress,
	FormControl,
	Grid,
	Popover,
	Stack,
	TextField
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ClearIcon from "@mui/icons-material/Clear";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";

import type { Device } from "../../../components/dashboard/device/devices-table";
import type { ProfileItem } from "../../../services/profile.service";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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
	objectTypes = ["All"],
	selectedDeviceId = 0,
	selectedProfileId = null,
	selectedObjectType = "All",
	onDeviceSelect = () => {},
	onProfileSelect = () => {},
	onObjectTypeSelect = () => {},
	onSearch = () => {},
	isLoadingProfiles = false,
	isLoadingParams = false,
	isSearching = false,
	onExport = () => {},
	canExport = false,
}: ReportFiltersProps): React.JSX.Element {
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [selectedProfile, setSelectedProfile] = useState<ProfileItem | null>(null);
	const [objectType, setObjectType] = useState<string>(selectedObjectType || "All");
	const [selectedParams, setSelectedParams] = useState<any[]>([]);
	const [intervalMinutes, setIntervalMinutes] = useState<number>(15);

	// Single consolidated Date-Time range (From / To)
	const today = dayjs();
	const [fromValue, setFromValue] = useState<Dayjs | null>(today.startOf("day"));
	const [toValue, setToValue] = useState<Dayjs | null>(today.endOf("day"));
	const [rangeStart, setRangeStart] = useState<Dayjs | null>(today);
	const [rangeEnd, setRangeEnd] = useState<Dayjs | null>(today);
	const [dateRangeAnchor, setDateRangeAnchor] = useState<HTMLElement | null>(null);

	const handleDateSelect = (date: Dayjs | null) => {
	if (!date) return;

	if (!rangeStart || rangeEnd) {
		setRangeStart(date);
		setRangeEnd(null);
	} else if (date.isBefore(rangeStart, "day")) {
		setRangeStart(date);
		setRangeEnd(null);
	} else {
		setRangeEnd(date);
	}
};

	// Sync selectedDevice with prop changes
	useEffect(() => {
		if (selectedDeviceId && devices.length > 0) {
			const found = devices.find((d) => String(d.id) === String(selectedDeviceId));
			if (found) setSelectedDevice(found);
		} else if (!selectedDeviceId) {
			setSelectedDevice(null);
		}
	}, [selectedDeviceId, devices]);

	// Sync selectedProfile with prop changes
	useEffect(() => {
		if (selectedProfileId && profiles.length > 0) {
			const found = profiles.find((p) => p.id === selectedProfileId);
			if (found) setSelectedProfile(found);
		} else if (!selectedProfileId) {
			setSelectedProfile(null);
		}
	}, [selectedProfileId, profiles]);

	// Filter parameters by selected Object Type if specified
	const filteredParameters = React.useMemo(() => {
		if (!objectType || objectType === "All") return parameters;
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

	const handleDeviceChange = (event: React.SyntheticEvent, newValue: Device | null) => {
		setSelectedDevice(newValue);
		setSelectedProfile(null);
		setObjectType("All");
		setSelectedParams([]);
		onDeviceSelect(newValue ? newValue.id : 0);
		onProfileSelect(null);
		onObjectTypeSelect("All");
	};

	const handleProfileChange = (event: React.SyntheticEvent, newValue: ProfileItem | null) => {
		setSelectedProfile(newValue);
		setSelectedParams([]);
		onProfileSelect(newValue ? newValue.id : null);
	};

	const handleClearFilters = () => {
	const today = dayjs();

	setSelectedDevice(null);
	setSelectedProfile(null);
	setObjectType("All");
	setSelectedParams([]);
	setIntervalMinutes(15);

	// Reset date range to today
	setFromValue(today.startOf("day"));
	setToValue(today.endOf("day"));

	setRangeStart(today);
	setRangeEnd(today);

	setDateRangeAnchor(null);

	setErrors({
		device: false,
		from: false,
		to: false,
		dateInverted: false,
	});
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

		const formattedStart = fromValue ? fromValue.format("YYYY-MM-DD HH:mm:ss") : "";
		const formattedEnd = toValue ? toValue.format("YYYY-MM-DD HH:mm:ss") : "";

		onSearch({
			deviceId: selectedDevice ? selectedDevice.id : null,
			profileId: selectedProfile ? selectedProfile.id : null,
			objectType: objectType !== "All" ? objectType : null,
			paramIds: selectedParams.map((p: any) => p.id),
			startDate: formattedStart,
			endDate: formattedEnd,
			intervalMinutes,
		});
	};

	const getDeviceLabel = (device: Device) => {
		if (!device) return "";
		const details = device.serialNumber ? device.serialNumber : device.ip ? device.ip : null;
		return details ? `${device.name} (${details})` : device.name;
	};

	return (
		<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
			<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
				<Grid container spacing={1.5}>
					{/* Row 1: Device, Profile, From (DateTime), To (DateTime) */}
					<Grid size={{ xs: 12, md: 4 }}>
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

					<Grid size={{ xs: 12, md: 4 }}>
						<FormControl fullWidth size="small">
							<Autocomplete
								id="report-profile-autocomplete"
								options={profiles}
								size="small"
								disabled={!selectedDevice || isLoadingProfiles}
								getOptionLabel={(profile) => profile.friendlyName || profile.obisCode || ""}
								value={selectedProfile}
								onChange={handleProfileChange}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								renderInput={(params) => (
									<TextField
										{...params}
										label={selectedDevice ? "Select profile (optional - default all)" : "Select a device first"}
										variant="outlined"
										size="small"
									/>
								)}
								openOnFocus
							/>
						</FormControl>
					</Grid>

					<LocalizationProvider dateAdapter={AdapterDayjs}>
	<Grid size={{ xs: 12, md: 4 }}>
		<TextField
	label="Date Range"
	value={
		fromValue && toValue
			? `${fromValue.format("DD-MM-YYYY")} → ${toValue.format("DD-MM-YYYY")}`
			: ""
	}
	placeholder="Select date range"
	size="small"
	fullWidth
	onClick={(e) => {
		setRangeStart(fromValue);
		setRangeEnd(toValue);
		setDateRangeAnchor(e.currentTarget);
	}}
	InputProps={{
		readOnly: true,
		endAdornment:
			fromValue && toValue ? (
				<ClearIcon
					sx={{ cursor: "pointer" }}
					onClick={(e) => {
						e.stopPropagation();
						setFromValue(null);
						setToValue(null);
						setRangeStart(null);
						setRangeEnd(null);
					}}
				/>
			) : (
				<CalendarMonthIcon />
			),
	}}
/>
		<Popover
			open={Boolean(dateRangeAnchor)}
			anchorEl={dateRangeAnchor}
			onClose={() => setDateRangeAnchor(null)}
			anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
		>
			<Stack sx={{ p: 1.5, width: 320 }}>
				<DateCalendar
	value={rangeEnd || rangeStart}
	onChange={handleDateSelect}
	slots={{
		day: (props) => {
			const selected = props.day.isSame(rangeStart, "day") || props.day.isSame(rangeEnd, "day");
			const today = props.day.isSame(dayjs(), "day");

			return (
				<PickersDay
					{...props}
					sx={{
						...(today && !selected && {
							border: "1px solid",
							borderColor: "primary.main"
						}),
						...(selected && {
							backgroundColor: "primary.main",
							color: "common.white",
							"&:hover": { backgroundColor: "primary.dark" }
						})
					}}
				/>
			);
		}
	}}
/>
				<Stack direction="row" justifyContent="flex-end" spacing={1}>
					<Button size="small" onClick={() => setDateRangeAnchor(null)}>
						Cancel
					</Button>
					<Button
						size="small"
						variant="contained"
						disabled={!rangeStart || !rangeEnd}
						onClick={() => {
							setFromValue(rangeStart?.startOf("day") || null);
							setToValue(rangeEnd?.endOf("day") || null);
							setDateRangeAnchor(null);
						}}
					>
						Apply
					</Button>
				</Stack>
			</Stack>
		</Popover>
	</Grid>
</LocalizationProvider>
					{/* Row 2: Parameters Autocomplete, Action Buttons */}
					<Grid size={{ xs: 12, md: 7.5 }}>
						<FormControl fullWidth size="small">
							<Autocomplete
								multiple
								id="report-parameters-autocomplete"
								options={filteredParameters}
								size="small"
								disableCloseOnSelect
								disabled={!selectedDevice || isLoadingParams}
								getOptionLabel={(option) => {
									if (typeof option === "string") return option;
									const unitStr = option.unit ? ` (${option.unit})` : "";
									return `${option.name}${unitStr}`;
								}}
								value={selectedParams}
								onChange={(e, newValue) => setSelectedParams(newValue)}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								renderOption={(props, option, { selected }) => {
									const { key, ...optionProps } = props;
									return (
										<li key={key} {...optionProps}>
											<Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
											{option.name} {option.unit ? `(${option.unit})` : ""}
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

					<Grid size={{ xs: 12, md: 4.5 }}>
						<Stack direction="row" spacing={1.5} justifyContent="flex-end" alignItems="center">
							<Button
								variant="outlined"
								color="secondary"
								onClick={handleClearFilters}
								sx={{ height: 38, px: 2, textTransform: "none", fontWeight: 600 }}
							>
								Clear Filter
							</Button>
							<Button
								variant="outlined"
								color="secondary"
								size="small"
								onClick={onExport}
								disabled={!canExport || isSearching}
								sx={{ height: 38, px: 2, textTransform: "none", fontWeight: 600 }}
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
								sx={{ height: 38, px: 3, textTransform: "none", fontWeight: 600 }}
							>
								{isSearching ? "Searching..." : "Search"}
							</Button>
						</Stack>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}
