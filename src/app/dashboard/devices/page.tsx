"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import type { Metadata } from "next";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import { DownloadIcon } from "@phosphor-icons/react/dist/ssr/Download";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr/Plus";
import * as XLSX from "xlsx";

import { deleteDevice, fetchDevices, syncDeviceNow } from "../../../api/device";
import { AddDeviceForm } from "../../../components/dashboard/device/add-device-form";
import { DevicesFilters } from "../../../components/dashboard/device/devices-filters";
import { DevicesTable } from "../../../components/dashboard/device/devices-table";
import type { Device } from "../../../components/dashboard/device/devices-table";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnectionStatus";

function applyPagination(rows: Device[], page: number, rowsPerPage: number): Device[] {
	return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function Page(): React.JSX.Element {
	const [isVisible, setIsVisible] = useState(true);

	const [devices, setDevices] = useState<Device[]>([]);

	const [editingDevice, setEditingDevice] = useState<Device | null>(null);

	const [loading, setLoading] = useState<"fetch" | null>("fetch");

	const [syncingDeviceIds, setSyncingDeviceIds] = useState<Set<number>>(new Set());

	const [snackbarOpen, setSnackbarOpen] = useState(false);

	const [snackbarMessage, setSnackbarMessage] = useState("");

	const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "warning">("success");

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<number>>(new Set());
	// const { connectionStatus } = useDeviceConnectionStatus(deviceIds);

	// ---------------------------------------------------------
	// Fetch devices
	// ---------------------------------------------------------

	const loadDevices = async () => {
		setLoading("fetch");

		try {
			const fetchedDevices = await fetchDevices();

			setDevices(fetchedDevices ?? []);
		} catch (error) {
			console.error("Failed to fetch devices:", error);

			setSnackbarMessage("Failed to fetch devices");
			setSnackbarSeverity("error");
			setSnackbarOpen(true);
		} finally {
			setLoading(null);
		}
	};

	useEffect(() => {
		loadDevices();
	}, []);

	// ---------------------------------------------------------
	// Search + Filters
	// ---------------------------------------------------------

	const [searchQuery, setSearchQuery] = useState("");

	// Empty = no filter = show all
	const [meterTypeFilter, setMeterTypeFilter] = useState("");

	// Empty = no filter = show all
	const [connectionFilter, setConnectionFilter] = useState("");

	// Empty = no filter = show all
	const [scheduledFilter, setScheduledFilter] = useState("");

	// ---------------------------------------------------------
	// SignalR connection status
	// ---------------------------------------------------------

	const deviceIds = React.useMemo(() => {
		return devices.map((device) => device.id);
	}, [devices]);

	const { connectionStatus } = useDeviceConnectionStatus(deviceIds);

	// ---------------------------------------------------------
	// Search + Filters logic
	// ---------------------------------------------------------

	const filteredDevices = React.useMemo(() => {
		return (devices ?? []).filter((device) => {
			// ---------------------------------------------
			// Search
			// ---------------------------------------------

			const q = searchQuery.toLowerCase().trim();

			const matchesSearch =
				!q ||
				device.name?.toLowerCase().includes(q) ||
				device.serialNumber?.toLowerCase().includes(q) ||
				device.consumerNumber?.toLowerCase().includes(q) ||
				device.ip?.toLowerCase().includes(q);

			if (!matchesSearch) {
				return false;
			}

			// ---------------------------------------------
			// Meter Type
			// ---------------------------------------------

			if (meterTypeFilter) {
				const meterType = typeof device.meterType === "object" ? device.meterType?.name : device.meterType || "";

				if (meterType.toLowerCase() !== meterTypeFilter.toLowerCase()) {
					return false;
				}
			}

			// ---------------------------------------------
			// Connection
			// ---------------------------------------------

			if (connectionFilter) {
				const isOnline = connectionStatus[device.id];

				if (connectionFilter === "online" && isOnline !== true) {
					return false;
				}

				if (connectionFilter === "offline" && isOnline !== false) {
					return false;
				}
			}

			// ---------------------------------------------
			// Scheduled
			// ---------------------------------------------

			if (scheduledFilter) {
				const isScheduled = device.deviceSyncSchedule != null;

				const isEnabled = device.deviceSyncSchedule?.isEnabled === true;

				// Scheduled + Enabled
				if (scheduledFilter === "yes") {
					if (!isScheduled || !isEnabled) {
						return false;
					}
				}

				// Scheduled + Disabled
				if (scheduledFilter === "disabled") {
					if (!isScheduled || isEnabled) {
						return false;
					}
				}

				// No Schedule
				if (scheduledFilter === "no") {
					if (isScheduled) {
						return false;
					}
				}
			}

			return true;
		});
	}, [devices, searchQuery, meterTypeFilter, connectionFilter, scheduledFilter, connectionStatus]);

	// handle- Clear Filters
	const handleClearFilters = () => {
		setSearchQuery("");
		setMeterTypeFilter("");
		setConnectionFilter("");
		setScheduledFilter("");
		setPage(0);
	};

	// ---------------------------------------------------------
	// Reset page when filter/search changes
	// ---------------------------------------------------------

	useEffect(() => {
		setPage(0);
	}, [searchQuery, meterTypeFilter, connectionFilter, scheduledFilter]);

	// ---------------------------------------------------------
	// Pagination
	// ---------------------------------------------------------

	const totalRows = filteredDevices.length;

	// const paginatedDevices = applyPagination(filteredDevices, page, rowsPerPage);
	const paginatedDevices = filteredDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	// ---------------------------------------------------------
	// Toggle Add/Edit form
	// ---------------------------------------------------------

	const toggleVisibility = async (device: Device | null = null) => {
		setIsVisible((prev) => !prev);

		setEditingDevice(device);

		await loadDevices();
	};

	// ---------------------------------------------------------
	// Edit device
	// ---------------------------------------------------------

	const handleEdit = (deviceId: number) => {
		const device = (devices ?? []).find((d) => d.id === deviceId) || null;
		setIsVisible(false);

		setEditingDevice(device);
	};

	// ---------------------------------------------------------
	// Delete device
	// ---------------------------------------------------------

	const handleDelete = async (deviceId: number) => {
		try {
			const res = await deleteDevice(deviceId);

			if (res && res.status) {
				setDevices((prev) => prev.filter((d) => d.id !== deviceId));

				setSnackbarMessage(`Device deleted successfully.`);

				setSnackbarSeverity("success");
				setSnackbarOpen(true);
			} else {
				setSnackbarMessage(`Failed to delete device ${deviceId}.`);

				setSnackbarSeverity("error");
				setSnackbarOpen(true);
			}
		} catch (err) {
			setSnackbarMessage(`Error deleting device: ${err}`);

			setSnackbarSeverity("error");
			setSnackbarOpen(true);
		}
	};

	// ---------------------------------------------------------
	// Sync device now
	// ---------------------------------------------------------

	const handleSyncNow = async (deviceId: number) => {
		setSyncingDeviceIds((prev) => new Set(prev).add(deviceId));

		try {
			const result = await syncDeviceNow(deviceId);

			if (!result.status) {
				setSyncingDeviceIds((prev) => {
					const next = new Set(prev);

					next.delete(deviceId);

					return next;
				});

				if (result.statusCode === 409) {
					setSnackbarMessage(result.message || `Sync is already in progress for device ${deviceId}.`);

					setSnackbarSeverity("warning");
				} else {
					setSnackbarMessage(result.message || `Failed to trigger sync for device ${deviceId}.`);

					setSnackbarSeverity("error");
				}

				setSnackbarOpen(true);
			} else {
				setSnackbarMessage(`Sync initiated for device ${deviceId}. Live status will update below.`);

				setSnackbarSeverity("success");
				setSnackbarOpen(true);
			}
		} catch (error) {
			console.error(`Failed to sync device ${deviceId}:`, error);

			setSyncingDeviceIds((prev) => {
				const next = new Set(prev);

				next.delete(deviceId);

				return next;
			});

			setSnackbarMessage(`Failed to sync device ${deviceId}.`);

			setSnackbarSeverity("error");
			setSnackbarOpen(true);
		}
	};

	// ---------------------------------------------------------
	// Snackbar
	// ---------------------------------------------------------

	const handleSnackbarClose = () => {
		setSnackbarOpen(false);

		setSnackbarMessage("");
	};

	// ---------------------------------------------------------
	// Export devices
	// ---------------------------------------------------------

	const handleExport = () => {
		const devicesToExport =
			selectedDeviceIds.size === 0 ? devices : devices.filter((device) => selectedDeviceIds.has(device.id));

		const data = devicesToExport.map((device) => ({
			ID: device.id,

			Name: device.name,

			"Consumer No": device.consumerNumber,

			"Serial No": device.serialNumber,

			"Meter Type": device.meterType?.name,

			Status: connectionStatus[device.id] === true ? "Online" : "Offline",

			Schedule:
				device.deviceSyncSchedule == null
					? "No"
					: device.deviceSyncSchedule.isEnabled
						? device.deviceSyncSchedule.scheduledTime || "No"
						: "Disabled",

			IsActive: device.isActive,

			IP: device.ip,

			"Created Date": device.createdAt
				? new Date(device.createdAt).toLocaleString("en-IN", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})
				: "",

			"Last Sync": device.lastSync
				? new Date(device.lastSync).toLocaleString("en-IN", {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit",
					})
				: "Not Run",
		}));

		const worksheet = XLSX.utils.json_to_sheet(data);

		const workbook = XLSX.utils.book_new();

		XLSX.utils.book_append_sheet(workbook, worksheet, "Devices");

		XLSX.writeFile(workbook, "devices.xlsx");
	};

	// ---------------------------------------------------------
	// UI
	// ---------------------------------------------------------

	return (
		<div>
			<Stack spacing={3}>
				<Stack
					direction="row"
					spacing={2}
					justifyContent="space-between"
					alignItems="center"
					sx={{
						width: "100%",
						flexWrap: "wrap",
						overflow: "auto",
						padding: "7px",
					}}
				>
					{isVisible ? (
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
							sx={{
								flex: "1 1 auto",
								minWidth: 0,

								"@media (max-width: 994px)": {
									width: "100%",
								},
							}}
						>
							{/* Search */}

							<Box sx={{ minWidth: 250 }}>
								<DevicesFilters
									show={isVisible}
									value={searchQuery}
									onChange={(e) => {
										setSearchQuery(e.target.value);
										setPage(0);
									}}
								/>
							</Box>

							{/* Meter Type */}

							<FormControl size="small" sx={{ minWidth: 115 }}>
								<InputLabel>Meter Type</InputLabel>

								<Select
									value={meterTypeFilter}
									label="Meter Type"
									onChange={(e) => {
										setMeterTypeFilter(e.target.value);
										setPage(0);
									}}
								>
									<MenuItem>--Please choose an option--</MenuItem>
									<MenuItem value="abt">ABT</MenuItem>

									<MenuItem value="pqm">PQM</MenuItem>

									<MenuItem value="both">Both</MenuItem>
								</Select>
							</FormControl>

							{/* Connection */}

							<FormControl size="small" sx={{ minWidth: 115 }}>
								<InputLabel>Connection</InputLabel>

								<Select
									value={connectionFilter}
									label="Connection"
									onChange={(e) => {
										setConnectionFilter(e.target.value);
										setPage(0);
									}}
								>
									<MenuItem>--Please choose an option--</MenuItem>
									<MenuItem value="online">Online</MenuItem>

									<MenuItem value="offline">Offline</MenuItem>
								</Select>
							</FormControl>

							{/* Scheduled */}

							<FormControl size="small" sx={{ minWidth: 115 }}>
								<InputLabel>Scheduled</InputLabel>

								<Select
									value={scheduledFilter}
									label="Scheduled"
									onChange={(e) => {
										setScheduledFilter(e.target.value);
										setPage(0);
									}}
								>
									<MenuItem>--Please choose an option--</MenuItem>
									<MenuItem value="yes">Yes</MenuItem>
									<MenuItem value="disabled">Disabled</MenuItem>

									<MenuItem value="no">No</MenuItem>
								</Select>
							</FormControl>

							{/* Clear All Filters */}
							<Button
								variant="outlined"
								onClick={handleClearFilters}
								sx={{
									minWidth: { xs: "110px", sm: 100 },
									whiteSpace: "nowrap",
									color: "gray",
									borderColor: "#c2c2c2",
									"&:hover": {
										color: "black",
										borderColor: "#212636",
									},
								}}
							>
								Clear Filters
							</Button>
						</Stack>
					) : (
						<Box />
					)}

					{isVisible && (
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
							sx={{
								ml: "auto",

								"@media (max-width: 994px)": {
									width: "100%",
									flexBasis: "100%",
									justifyContent: "flex-start",
									ml: 0,
								},
							}}
						>
							<div>
								<Button
									startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
									variant="contained"
									onClick={() => toggleVisibility(null)}
								>
									Add
								</Button>
							</div>

							<div>
								<Button
									startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
									variant="contained"
									onClick={handleExport}
								>
									Export
								</Button>
							</div>
						</Stack>
					)}
				</Stack>

				<DevicesTable
					count={filteredDevices.length}
					page={page}
					rows={paginatedDevices}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(event) => {
						setRowsPerPage(parseInt(event.target.value, 10));
						setPage(0);
					}}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onSyncNow={handleSyncNow}
					syncingDeviceIds={syncingDeviceIds}
					onSelectionChange={setSelectedDeviceIds}
				/>

				<AddDeviceForm
					show={!isVisible}
					onToggleVisibility={toggleVisibility}
					editingDevice={editingDevice}
					setEditingDevice={setEditingDevice}
				/>
			</Stack>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={handleSnackbarClose}
				anchorOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				<Alert
					severity={snackbarSeverity}
					sx={{
						width: "100%",
					}}
					onClose={handleSnackbarClose}
					variant="filled"
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</div>
	);
}

export const metadata: Metadata = {
	title: "Devices | Dashboard",
};
