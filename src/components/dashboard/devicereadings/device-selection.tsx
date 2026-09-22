// "use client";


// import CheckBoxIcon from "@mui/icons-material/CheckBox";
// import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// import {
// 	Autocomplete,
// 	Button,
// 	Card,
// 	CardContent,
// 	Chip,
// 	FormControl,
// 	Grid,
// 	Stack,
// 	TextField,
// 	Typography
// } from "@mui/material";
// import Checkbox from "@mui/material/Checkbox";
// import React, { useEffect, useRef, useState } from "react";

// import type { Device } from "../../../components/dashboard/device/devices-table";
// import type { ProfileItem } from "../../../services/profile.service";

// const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
// const checkedIcon = <CheckBoxIcon fontSize="small" />;

// interface DeviceFiltersProps {
// 	devices?: Device[];
// 	profiles?: ProfileItem[];
// 	parameters?: any[];
// 	selectedDeviceId?: string | number;
// 	selectedProfileIds?: number[];
// 	onDeviceSelect?: (id: string | number) => void;
// 	onProfileSelect?: (profileIds: number[]) => void;
// 	onScan?: (scanParams: {
// 		deviceId: string | number | null;
// 		profileIds: number[];
// 		paramIds: (string | number)[];
// 	}) => void;
// 	isLoadingProfiles?: boolean;
// 	isLoadingParams?: boolean;
// 	isScanning?: boolean;
// }
// export function DeviceFilters({
// 	devices = [],
// 	profiles = [],
// 	parameters = [],
// 	selectedDeviceId = 0,
// 	selectedProfileIds = [],
// 	onDeviceSelect = () => {},
// 	onProfileSelect = () => {},
// 	onScan = () => {},
// 	isLoadingProfiles = false,
// 	isLoadingParams = false,
// 	isScanning = false,
// }: DeviceFiltersProps): React.JSX.Element {
// 	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
// 	const [selectedProfiles, setSelectedProfiles] = useState<ProfileItem[]>([]);
// 	const [selectedParams, setSelectedParams] = useState<any[]>([]);

// 	const profileManualChangeRef = useRef(false);
// 	const [errors, setErrors] = useState({
// 		device: false,
// 	});

// 	console.log(profiles);
// 	// Sync internal selectedDevice with prop changes
// 	useEffect(() => {
// 		if (selectedDeviceId && devices.length > 0) {
// 			const found = devices.find((d) => String(d.id) === String(selectedDeviceId));
// 			if (found) setSelectedDevice(found);
// 		} else if (!selectedDeviceId) {
// 			setSelectedDevice(null);
// 		}
// 	}, [selectedDeviceId, devices]);

// 	// Sync internal selectedProfiles with prop changes
// 	useEffect(() => {
// 		if (selectedProfileIds.length > 0 && profiles.length > 0) {
// 			const found = profiles.filter((p) => selectedProfileIds.includes(p.id));
// 			setSelectedProfiles(found);
// 		} else if (selectedProfileIds.length === 0) {
// 			setSelectedProfiles([]);
// 		}
// 	}, [selectedProfileIds, profiles]);

// 	// Synchronize selected parameters with current parameters list
// 	useEffect(() => {
// 		if (selectedParams.length > 0) {
// 			const validIds = new Set(parameters.map((p: any) => p.id));
// 			const filtered = selectedParams.filter((p: any) => validIds.has(p.id));
// 			if (filtered.length !== selectedParams.length) {
// 				setSelectedParams(filtered);
// 			}
// 		}
// 	}, [parameters]);

// 	const handleDeviceChange = (event: React.SyntheticEvent, newValue: Device | null) => {
// 		setSelectedDevice(newValue);
// 		setSelectedProfiles([]);
// 		setSelectedParams([]);
// 		onDeviceSelect(newValue ? newValue.id : 0);
// 		onProfileSelect([]);
// 	};

// 	const handleProfileChange = (event: React.SyntheticEvent, newValue: ProfileItem[]) => {
// 		setSelectedProfiles(newValue);
// 		setSelectedParams([]);
// 		onProfileSelect(newValue.map((p) => p.id));
// 	};

// 	const handleScanClick = () => {
// 		const isDeviceMissing = !selectedDevice;
// 		setErrors({ device: isDeviceMissing });

// 		if (isDeviceMissing) return;

// 		onScan({
// 			deviceId: selectedDevice ? selectedDevice.id : null,
// 			profileIds: selectedProfiles.map((p) => p.id),
// 			paramIds: selectedParams.map((p: any) => p.id),
// 		});
// 	};

// 	const getDeviceLabel = (device: Device) => {
// 		if (!device) return "";
// 		const details = device.serialNumber ? device.serialNumber : device.ip ? device.ip : null;
// 		return details ? `${device.name} (${details})` : device.name;
// 	};

// 	return (
// 		<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
// 			<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
// 				<Grid container spacing={1.5}>
// 					{/* Row 1: Device Dropdown (6 cols), Profile Dropdown (6 cols) */}
// 					<Grid size={{ xs: 12, md: 6 }}>
// 						<FormControl fullWidth size="small">
// 							<Autocomplete
// 								id="device-filter-autocomplete"
// 								options={devices}
// 								size="small"
// 								getOptionLabel={getDeviceLabel}
// 								value={selectedDevice}
// 								onChange={handleDeviceChange}
// 								isOptionEqualToValue={(option, value) => option.id === value.id}
// 								renderInput={(params) => (
// 									<TextField
// 										{...params}
// 										label="Select or type to search device"
// 										variant="outlined"
// 										size="small"
// 										error={errors.device}
// 										helperText={errors.device ? "Device selection is required" : ""}
// 									/>
// 								)}
// 								openOnFocus
// 							/>
// 						</FormControl>
// 					</Grid>

// 					<Grid size={{ xs: 12, md: 6 }}>
// 						<FormControl fullWidth size="small">
// 							<Autocomplete
// 								id="profile-filter-autocomplete"
// 								multiple
// 								disableCloseOnSelect
// 								options={profiles}
// 								size="small"
// 								disabled={!selectedDevice || isLoadingProfiles}
// 								getOptionLabel={(profile) => profile.friendlyName || profile.obisCode || ""}
// 								value={selectedProfiles}
// 								onChange={handleProfileChange}
// 								isOptionEqualToValue={(option, value) => option.id === value.id}
// 								renderOption={(props, option, { selected }) => (
// 									<li {...props} key={option.id}>
// 										<Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
// 										<Typography variant="body2">{option.friendlyName}</Typography>
// 									</li>
// 								)}
// 								renderTags={(tagValue, getTagProps) =>
// 									tagValue.map((option, index) => {
// 										const { key, ...chipProps } = getTagProps({ index });
// 										return (
// 											<Chip
// 												key={key}
// 												label={option.friendlyName}
// 												size="small"
// 												{...chipProps}
// 												sx={{ fontSize: "0.75rem", height: "22px" }}
// 											/>
// 										);
// 									})
// 								}
// 								renderInput={(params) => (
// 									<TextField
// 										{...params}
// 										label={
// 											selectedDevice
// 												? selectedProfiles.length > 0
// 													? `${selectedProfiles.length} profile${selectedProfiles.length > 1 ? "s" : ""} selected`
// 													: "Select profile(s) (optional - default all)"
// 												: "Select a device first"
// 										}
// 										variant="outlined"
// 										size="small"
// 									/>
// 								)}
// 								openOnFocus
// 								limitTags={3}
// 								getLimitTagsText={(more) => `+${more} more`}
// 							/>
// 						</FormControl>
// 					</Grid>

// 					{/* Row 2: Parameters (Flex with Scan Button) */}
// 					<Grid size={12}>
// 						<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: "100%" }}>
// 							<FormControl fullWidth size="small">
// 								<Autocomplete
// 									id="parameter-filter-autocomplete"
// 									multiple
// 									disableCloseOnSelect
// 									options={parameters.length > 0 ? [{ id: "SELECT_ALL", name: "Select All" }, ...parameters] : []}
// 									size="small"
// 									disabled={!selectedDevice || isLoadingParams}
// 									getOptionLabel={(param) => param.name || ""}
// 									value={selectedParams}
// 									onChange={(event, newValue) => {
// 										const selectAllObj = newValue.find((item: any) => item.id === "SELECT_ALL");
// 										if (selectAllObj) {
// 											if (selectedParams.length === parameters.length) {
// 												setSelectedParams([]);
// 											} else {
// 												setSelectedParams([...parameters]);
// 											}
// 										} else {
// 											setSelectedParams(newValue);
// 										}
// 									}}
// 									isOptionEqualToValue={(option, value) => option.id === value.id}
// 									renderOption={(props, option, { selected }) => {
// 										if (option.id === "SELECT_ALL") {
// 											const allSelected = parameters.length > 0 && selectedParams.length === parameters.length;
// 											const someSelected = selectedParams.length > 0 && selectedParams.length < parameters.length;
// 											return (
// 												<li
// 													{...props}
// 													key="SELECT_ALL"
// 													style={{ borderBottom: "1px solid var(--mui-palette-divider)", fontWeight: 600 }}
// 												>
// 													<Checkbox
// 														icon={icon}
// 														checkedIcon={checkedIcon}
// 														style={{ marginRight: 8 }}
// 														checked={allSelected}
// 														indeterminate={someSelected}
// 													/>
// 													Select All ({parameters.length})
// 												</li>
// 											);
// 										}
// 										return (
// 											<li {...props} key={option.id}>
// 												<Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
// 												{option.name}
// 											</li>
// 										);
// 									}}
// 									renderTags={(tagValue, getTagProps) =>
// 										tagValue.map((option, index) => {
// 											const { key, ...chipProps } = getTagProps({ index });
// 											return (
// 												<Chip
// 													key={key}
// 													label={option.name}
// 													size="small"
// 													{...chipProps}
// 													sx={{ fontSize: "0.75rem", height: "22px" }}
// 												/>
// 											);
// 										})
// 									}
// 									renderInput={(params) => (
// 										<TextField
// 											{...params}
// 											label={
// 												selectedDevice
// 													? selectedParams.length > 0
// 														? `${selectedParams.length} parameter${selectedParams.length > 1 ? "s" : ""} selected`
// 														: "Select parameters (optional - default all)"
// 													: "Select a device first"
// 											}
// 											variant="outlined"
// 											size="small"
// 										/>
// 									)}
// 									openOnFocus
// 									limitTags={4}
// 									getLimitTagsText={(more) => `+${more} more`}
// 								/>
// 							</FormControl>

// 							<Button
// 								variant="contained"
// 								color="primary"
// 								size="medium"
// 								// startIcon={
// 								// 	isScanning ? <CircularProgress size={16} color="inherit" /> : <SearchIcon fontSize="small" />
// 								// }
// 								onClick={handleScanClick}
// 								disabled={isScanning}
// 								sx={{ height: 38, minWidth: 120, px: 2.5, fontWeight: 600, fontSize: "0.8125rem", flexShrink: 0 }}
// 							>
// 								Scan
// 							</Button>
// 						</Stack>
// 					</Grid>
// 				</Grid>
// 			</CardContent>
// 		</Card>
// 	);
// }




"use client";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import {
	Autocomplete,
	Button,
	Card,
	CardContent,
	Chip,
	FormControl,
	Grid,
	Stack,
	TextField,
	Typography
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import React, { useEffect, useRef, useState } from "react";

import type { Device } from "../../../components/dashboard/device/devices-table";
import type { ProfileItem } from "../../../services/profile.service";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface DeviceFiltersProps {
	devices?: Device[];
	profiles?: ProfileItem[];
	parameters?: any[];
	selectedDeviceId?: string | number;
	selectedProfileIds?: number[];
	onDeviceSelect?: (id: string | number) => void;
	onProfileSelect?: (profileIds: number[]) => void;
	onScan?: (scanParams: {
		deviceId: string | number | null;
		profileIds: number[];
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
	selectedProfileIds = [],
	onDeviceSelect = () => {},
	onProfileSelect = () => {},
	onScan = () => {},
	isLoadingProfiles = false,
	isLoadingParams = false,
	isScanning = false,
}: DeviceFiltersProps): React.JSX.Element {
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
	const [selectedProfiles, setSelectedProfiles] = useState<ProfileItem[]>([]);
	const [selectedParams, setSelectedParams] = useState<any[]>([]);

	const profileManualChangeRef = useRef(false);
	const [errors, setErrors] = useState({
		device: false,
	});

	// Unique key for a parameter row — the same parameter id can appear under
	// more than one profile, so the profile must be part of the identity.
	const getParamKey = (param: any) => `${param.profileId ?? "none"}-${param.id}`;

	// Sync internal selectedDevice with prop changes
	useEffect(() => {
		if (selectedDeviceId && devices.length > 0) {
			const found = devices.find((d) => String(d.id) === String(selectedDeviceId));
			if (found) setSelectedDevice(found);
		} else if (!selectedDeviceId) {
			setSelectedDevice(null);
		}
	}, [selectedDeviceId, devices]);

	// Sync internal selectedProfiles with prop changes
	useEffect(() => {
		if (selectedProfileIds.length > 0 && profiles.length > 0) {
			const found = profiles.filter((p) => selectedProfileIds.includes(p.id));
			setSelectedProfiles(found);
		} else if (selectedProfileIds.length === 0) {
			setSelectedProfiles([]);
		}
	}, [selectedProfileIds, profiles]);

	// Synchronize selected parameters with current parameters list
	useEffect(() => {
		if (selectedParams.length > 0) {
			const validKeys = new Set(parameters.map((p: any) => getParamKey(p)));
			const filtered = selectedParams.filter((p: any) => validKeys.has(getParamKey(p)));
			if (filtered.length !== selectedParams.length) {
				setSelectedParams(filtered);
			}
		}
	}, [parameters]);

	const handleDeviceChange = (event: React.SyntheticEvent, newValue: Device | null) => {
		setSelectedDevice(newValue);
		setSelectedProfiles([]);
		setSelectedParams([]);
		onDeviceSelect(newValue ? newValue.id : 0);
		onProfileSelect([]);
	};

	const handleProfileChange = (event: React.SyntheticEvent, newValue: ProfileItem[]) => {
		setSelectedProfiles(newValue);
		setSelectedParams([]);
		onProfileSelect(newValue.map((p) => p.id));
	};

	const handleScanClick = () => {
		const isDeviceMissing = !selectedDevice;
		setErrors({ device: isDeviceMissing });

		if (isDeviceMissing) return;

		onScan({
			deviceId: selectedDevice ? selectedDevice.id : null,
			profileIds: selectedProfiles.map((p) => p.id),
			// Same parameter selected under two profiles must only be sent once.
			paramIds: [...new Set(selectedParams.map((p: any) => p.id))],
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
								multiple
								disableCloseOnSelect
								options={profiles}
								size="small"
								disabled={!selectedDevice || isLoadingProfiles}
								getOptionLabel={(profile) => profile.friendlyName || profile.obisCode || ""}
								value={selectedProfiles}
								onChange={handleProfileChange}
								isOptionEqualToValue={(option, value) => option.id === value.id}
								renderOption={(props, option, { selected }) => (
									<li {...props} key={option.id}>
										<Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
										<Typography variant="body2">{option.friendlyName}</Typography>
									</li>
								)}
								renderTags={(tagValue, getTagProps) =>
									tagValue.map((option, index) => {
										const { key, ...chipProps } = getTagProps({ index });
										return (
											<Chip
												key={key}
												label={option.friendlyName}
												size="small"
												{...chipProps}
												sx={{ fontSize: "0.75rem", height: "22px" }}
											/>
										);
									})
								}
								renderInput={(params) => (
									<TextField
										{...params}
										label={
											selectedDevice
												? selectedProfiles.length > 0
													? `${selectedProfiles.length} profile${selectedProfiles.length > 1 ? "s" : ""} selected`
													: "Select profile(s) (optional - default all)"
												: "Select a device first"
										}
										variant="outlined"
										size="small"
									/>
								)}
								openOnFocus
								limitTags={3}
								getLimitTagsText={(more) => `+${more} more`}
							/>
						</FormControl>
					</Grid>

					{/* Row 2: Parameters (Flex with Scan Button) */}
					<Grid size={12}>
						<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: "100%" }}>
							<FormControl fullWidth size="small">
								<Autocomplete
									id="parameter-filter-autocomplete"
									multiple
									disableCloseOnSelect
									options={
										parameters.length > 0
											? [{ id: "SELECT_ALL", name: "Select All", profileId: null, profileName: "" }, ...parameters]
											: []
									}
									groupBy={(option: any) => (option.id === "SELECT_ALL" ? "" : option.profileName || "General")}
									size="small"
									disabled={!selectedDevice || isLoadingParams}
									getOptionLabel={(param) => param.name || ""}
									value={selectedParams}
									onChange={(event, newValue) => {
										const selectAllObj = newValue.find((item: any) => item.id === "SELECT_ALL");
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
									isOptionEqualToValue={(option: any, value: any) => getParamKey(option) === getParamKey(value)}
									renderOption={(props, option, { selected }) => {
										if (option.id === "SELECT_ALL") {
											const allSelected = parameters.length > 0 && selectedParams.length === parameters.length;
											const someSelected = selectedParams.length > 0 && selectedParams.length < parameters.length;
											return (
												<li
													{...props}
													key="SELECT_ALL"
													style={{ borderBottom: "1px solid var(--mui-palette-divider)", fontWeight: 600 }}
												>
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
											<li {...props} key={getParamKey(option)}>
												<Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
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
													sx={{ fontSize: "0.75rem", height: "22px" }}
												/>
											);
										})
									}
									renderInput={(params) => (
										<TextField
											{...params}
											label={
												selectedDevice
													? selectedParams.length > 0
														? `${selectedParams.length} parameter${selectedParams.length > 1 ? "s" : ""} selected`
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

							<Button
								variant="contained"
								color="primary"
								size="medium"
								// startIcon={
								// 	isScanning ? <CircularProgress size={16} color="inherit" /> : <SearchIcon fontSize="small" />
								// }
								onClick={handleScanClick}
								disabled={isScanning}
								sx={{ height: 38, minWidth: 120, px: 2.5, fontWeight: 600, fontSize: "0.8125rem", flexShrink: 0 }}
							>
								Scan
							</Button>
						</Stack>
					</Grid>
				</Grid>
			</CardContent>
		</Card>
	);
}