"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
	Alert,
	Autocomplete,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	InputAdornment,
	MenuItem,
	OutlinedInput,
	Paper,
	Snackbar,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";

import { editDevice, fetchDevices } from "../../../api/device";
import type { Device } from "../../../components/dashboard/device/devices-table";
import {
	createDeviceSchedule,
	deleteDeviceSchedule,
	DeviceScheduleItem,
	fetchAllDeviceSchedules,
	updateDeviceSchedule,
} from "../../../services/schedule.service";

export default function SchedulingPage(): React.JSX.Element {
	// Schedule data
	const [schedules, setSchedules] = React.useState<DeviceScheduleItem[]>([]);

	const [loading, setLoading] = React.useState<boolean>(true);

	// Modal dialog state
	const [modalOpen, setModalOpen] = React.useState<boolean>(false);

	const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");

	const [modalTime, setModalTime] = React.useState<string>("00:00");

	const [modalEnabled, setModalEnabled] = React.useState<boolean>(true);

	const [selectedScheduleId, setSelectedScheduleId] = React.useState<number | null>(null);

	const [savingModal, setSavingModal] = React.useState<boolean>(false);

	// ============================================================
	// SCHEDULE DEVICE MANAGEMENT
	// ============================================================

	const [devices, setDevices] = React.useState<Device[]>([]);

	const [manageDialogOpen, setManageDialogOpen] = React.useState(false);

	const [selectedManageSchedule, setSelectedManageSchedule] = React.useState<DeviceScheduleItem | null>(null);

	const [manageLoading, setManageLoading] = React.useState(false);

	const [savingDeviceId, setSavingDeviceId] = React.useState<number | null>(null);

	const [deviceSearch, setDeviceSearch] = React.useState("");

	const [selectedDeviceIds, setSelectedDeviceIds] = React.useState<number[]>([]);

	// Device already assigned to another schedule
	const [changeDeviceDialogOpen, setChangeDeviceDialogOpen] = React.useState(false);

	const [pendingDevices, setPendingDevices] = React.useState<Device[]>([]);

	// Search filter
	const [searchQuery, setSearchQuery] = React.useState<string>("");

	// Toast notification
	const [snackbar, setSnackbar] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	//delete pop-up
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deletingSchedule, setDeletingSchedule] = React.useState<DeviceScheduleItem | null>(null);
	const [deleting, setDeleting] = React.useState(false);

	const handleOpenDeleteDialog = (row: DeviceScheduleItem) => {
		setDeletingSchedule(row);
		setDeleteDialogOpen(true);
	};

	const handleCloseDeleteDialog = () => {
		if (deleting) return;

		setDeleteDialogOpen(false);
		setDeletingSchedule(null);
	};

	// ============================================================
	// LOAD SCHEDULES
	// ============================================================

	const loadData = React.useCallback(async (showLoading = true) => {
		if (showLoading) {
			setLoading(true);
		}

		try {
			const [scheduleData, deviceData] = await Promise.all([fetchAllDeviceSchedules(), fetchDevices()]);

			setSchedules(scheduleData ?? []);
			setDevices(deviceData ?? []);
		} catch (err) {
			console.error("Failed to load schedules/devices:", err);

			setSnackbar({
				open: true,
				message: "Failed to load schedules/devices.",
				severity: "error",
			});
		} finally {
			if (showLoading) {
				setLoading(false);
			}
		}
	}, []);

	// ============================================================
	// MANAGE SCHEDULE DEVICES
	// ============================================================

	const handleOpenManageDialog = (schedule: DeviceScheduleItem) => {
		setSelectedManageSchedule(schedule);

		setSelectedDeviceIds([]);
		setDeviceSearch("");
		setManageDialogOpen(true);
	};

	const handleCloseManageDialog = () => {
		if (savingDeviceId !== null) {
			return;
		}

		setManageDialogOpen(false);
		setSelectedManageSchedule(null);
		setSelectedDeviceIds([]);
		setDeviceSearch("");
	};

	// ============================================================
	// GET DEVICES ATTACHED TO SELECTED SCHEDULE
	// ============================================================

	const attachedDevices = React.useMemo(() => {
		if (!selectedManageSchedule) {
			return [];
		}

		return devices.filter((device) => device.deviceSyncScheduleId === selectedManageSchedule.id);
	}, [devices, selectedManageSchedule]);

	// ============================================================
	// GET CURRENT SCHEDULE OF A DEVICE
	// ============================================================

	const getDeviceSchedule = (device: Device): DeviceScheduleItem | null => {
		if (device.deviceSyncScheduleId === null || device.deviceSyncScheduleId === undefined) {
			return null;
		}

		return schedules.find((schedule) => schedule.id === device.deviceSyncScheduleId) ?? null;
	};

	// ============================================================
	// DEVICES AVAILABLE IN MANAGE DROPDOWN
	// ============================================================

	const availableDevices = React.useMemo(() => {
		const query = deviceSearch.trim().toLowerCase();

		return devices
			.filter((device) => device.deviceSyncScheduleId !== selectedManageSchedule?.id)
			.filter((device) => {
				if (!query) return true;

				return [device.id, device.name, device.serialNumber, device.consumerNumber]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(query));
			});
	}, [devices, deviceSearch, selectedManageSchedule]);

	// ============================================================
	// CHANGE DEVICE SCHEDULE - CONFIRMATION
	// ============================================================

	const handleConfirmDeviceScheduleChange = async () => {
		if (!pendingDevices || !selectedManageSchedule) {
			return;
		}

		try {
			setSavingDeviceId(pendingDevices[0]?.id ?? null);

			await Promise.all(
				pendingDevices.map((device) =>
					editDevice({
						...device,
						deviceSyncScheduleId: selectedManageSchedule.id,
					})
				)
			);

			// Update local device state
			setDevices((prev) =>
				prev.map((device) =>
					pendingDevices.some((pending) => pending.id === device.id)
						? {
								...device,
								deviceSyncScheduleId: selectedManageSchedule.id,
							}
						: device
				)
			);

			setChangeDeviceDialogOpen(false);
			setPendingDevices([]);
			setSelectedDeviceIds([]);
			setDeviceSearch("");

			setSnackbar({
				open: true,
				message: "Device schedule changed successfully.",
				severity: "success",
			});
		} catch (error) {
			console.error("Failed to change device schedule:", error);

			setSnackbar({
				open: true,
				message: "Failed to change device schedule.",
				severity: "error",
			});
		} finally {
			setSavingDeviceId(null);
		}
	};

	const handleCancelDeviceScheduleChange = () => {
		setChangeDeviceDialogOpen(false);
		setPendingDevices([]);
	};

	// ============================================================
	// ADD DEVICE TO SCHEDULE
	// ============================================================

	const assignDeviceToSchedule = async (device: Device, scheduleId: number) => {
		try {
			setSavingDeviceId(device.id);

			await editDevice({
				...device,
				deviceSyncScheduleId: scheduleId,
			});

			// Local state immediately update
			setDevices((prev) =>
				prev.map((item) =>
					item.id === device.id
						? {
								...item,
								deviceSyncScheduleId: scheduleId,
							}
						: item
				)
			);
			setSelectedDeviceIds([]);
			setDeviceSearch("");

			setSnackbar({
				open: true,
				message: "Device added to schedule successfully.",
				severity: "success",
			});
		} catch (error) {
			console.error("Failed to add device:", error);

			setSnackbar({
				open: true,
				message: "Failed to add device.",
				severity: "error",
			});
		} finally {
			setSavingDeviceId(null);
		}
	};

	//multiple device assign  logic
	const assignMultipleDevices = async (selectedDevices: Device[], scheduleId: number) => {
		try {
			setSavingDeviceId(selectedDevices[0]?.id ?? null);

			await Promise.all(
				selectedDevices.map((device) =>
					editDevice({
						...device,
						deviceSyncScheduleId: scheduleId,
					})
				)
			);

			setDevices((prev) =>
				prev.map((device) => {
					const isSelected = selectedDevices.some((selected) => selected.id === device.id);

					return isSelected
						? {
								...device,
								deviceSyncScheduleId: scheduleId,
							}
						: device;
				})
			);

			setSelectedDeviceIds([]);
			setDeviceSearch("");

			setSnackbar({
				open: true,
				message: `${selectedDevices.length} device${
					selectedDevices.length === 1 ? "" : "s"
				} added to schedule successfully.`,
				severity: "success",
			});
		} catch (error) {
			console.error("Failed to add devices:", error);

			setSnackbar({
				open: true,
				message: "Failed to add devices.",
				severity: "error",
			});
		} finally {
			setSavingDeviceId(null);
		}
	};

	const handleAddDevicesToSchedule = async () => {
		if (selectedDeviceIds.length === 0 || !selectedManageSchedule) {
			return;
		}

		const selectedDevices = devices.filter((device) => selectedDeviceIds.includes(device.id));

		if (selectedDevices.length === 0) {
			return;
		}

		// Find devices already assigned
		// to another schedule
		const alreadyAssignedDevices = selectedDevices.filter((device) => {
			const currentScheduleId = device.deviceSyncScheduleId;

			return (
				currentScheduleId !== null && currentScheduleId !== undefined && currentScheduleId !== selectedManageSchedule.id
			);
		});

		// If one or more devices are already
		// assigned somewhere else → confirmation
		if (alreadyAssignedDevices.length > 0) {
			setPendingDevices(alreadyAssignedDevices);
			setChangeDeviceDialogOpen(true);
			return;
		}

		// All selected devices are unassigned
		await assignMultipleDevices(selectedDevices, selectedManageSchedule.id);
	};

	// ============================================================
	// REMOVE DEVICE FROM SCHEDULE
	// ============================================================

	const handleRemoveDeviceFromSchedule = async (device: Device) => {
		try {
			setSavingDeviceId(device.id);

			await editDevice({
				...device,
				deviceSyncScheduleId: null,
			});

			// Local state immediately update
			setDevices((prev) =>
				prev.map((item) =>
					item.id === device.id
						? {
								...item,
								deviceSyncScheduleId: null,
							}
						: item
				)
			);

			setSnackbar({
				open: true,
				message: "Device removed from schedule.",
				severity: "success",
			});
		} catch (error) {
			console.error("Failed to remove device:", error);

			setSnackbar({
				open: true,
				message: "Failed to remove device.",
				severity: "error",
			});
		} finally {
			setSavingDeviceId(null);
		}
	};

	const getAttachedDeviceCount = (scheduleId: number) => {
		return devices.filter((device) => device.deviceSyncScheduleId === scheduleId).length;
	};

	// ============================================================
	// INITIAL LOAD + 60 SECOND POLLING
	// ============================================================

	React.useEffect(() => {
		loadData(true);

		const timer = setInterval(() => {
			loadData(false);
		}, 60000);

		return () => clearInterval(timer);
	}, [loadData]);

	// ============================================================
	// CREATE MODAL
	// ============================================================

	const handleOpenCreateModal = () => {
		setModalMode("create");

		setSelectedScheduleId(null);

		setModalTime("00:00");
		setModalEnabled(true);

		setModalOpen(true);
	};

	// ============================================================
	// EDIT MODAL
	// ============================================================

	const handleOpenEditModal = (row: DeviceScheduleItem) => {
		setModalMode("edit");
		setSelectedScheduleId(row.id);

		setModalTime(row.scheduledTime ? row.scheduledTime.substring(0, 5) : "00:00");

		setModalEnabled(row.isEnabled);

		setModalOpen(true);
	};
	// ============================================================
	// CLOSE MODAL
	// ============================================================

	const handleCloseModal = () => {
		if (savingModal) {
			return;
		}

		setModalOpen(false);
	};

	// ============================================================
	// SAVE SCHEDULE
	// CREATE / UPDATE
	// ============================================================

	const handleSaveSchedule = async () => {
		setSavingModal(true);

		try {
			const payload = {
				isEnabled: modalEnabled,
				scheduledTime: modalTime,
				repeatMode: "Daily",
			};

			let res;

			// ----------------------------
			// CREATE
			// ----------------------------

			if (modalMode === "create") {
				res = await createDeviceSchedule(payload);
			}

			// ----------------------------
			// UPDATE
			// ----------------------------
			else {
				if (selectedScheduleId === null) {
					throw new Error("Schedule ID is missing.");
				}

				res = await updateDeviceSchedule(selectedScheduleId, payload);
			}

			// ----------------------------
			// SUCCESS
			// ----------------------------

			if (res.status) {
				setSnackbar({
					open: true,
					message: modalMode === "create" ? "Schedule successfully created." : "Schedule successfully updated.",
					severity: "success",
				});

				setModalOpen(false);

				setSelectedScheduleId(null);

				await loadData(true);
			}

			// ----------------------------
			// API ERROR
			// ----------------------------
			else {
				setSnackbar({
					open: true,
					message: res.errors?.[0] || "Failed to save schedule.",
					severity: "error",
				});
			}
		} catch (err: any) {
			console.error("Error saving schedule:", err);

			setSnackbar({
				open: true,
				message: err.message || "An error occurred while saving schedule.",
				severity: "error",
			});
		} finally {
			setSavingModal(false);
		}
	};

	// delete logic
	const handleDeleteSchedule = async () => {
		if (!deletingSchedule) return;

		setDeleting(true);

		try {
			const res = await deleteDeviceSchedule(deletingSchedule.id);

			if (res?.status === false) {
				setSnackbar({
					open: true,
					message: res.errors?.[0] || "Failed to delete schedule.",
					severity: "error",
				});
				return;
			}

			setSnackbar({
				open: true,
				message: "Schedule deleted successfully.",
				severity: "success",
			});

			setDeleteDialogOpen(false);
			setDeletingSchedule(null);

			await loadData(false);
		} catch (err: any) {
			console.error("Error deleting schedule:", err);

			const status = err?.response?.status;

			const backendMessage =
				err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.response?.data?.title;

			setSnackbar({
				open: true,
				message:
					status === 409
						? backendMessage || "Cannot delete this schedule because it is linked to an active device."
						: backendMessage || "Failed to delete schedule.",
				severity: "error",
			});
		} finally {
			setDeleting(false);
		}
	};

	// ============================================================
	// FORMAT SCHEDULED TIME
	// ============================================================

	const formatScheduledTimeDisplay = (timeStr?: string) => {
		if (!timeStr) {
			return "—";
		}

		try {
			const clean = timeStr.trim().substring(0, 5);

			const parts = clean.split(":");

			if (parts.length >= 2) {
				const hours = parseInt(parts[0], 10);

				const minutes = parseInt(parts[1], 10);

				if (!isNaN(hours) && !isNaN(minutes)) {
					const ampm = hours >= 12 ? "PM" : "AM";

					const h12 = hours % 12 || 12;

					const mStr = minutes.toString().padStart(2, "0");

					const hStr = h12.toString().padStart(2, "0");

					return `${clean} (${hStr}:${mStr} ${ampm})`;
				}
			}

			return clean;
		} catch {
			return timeStr;
		}
	};

	// ============================================================
	// FORMAT UTC DATE
	// ============================================================

	const formatUtcDisplay = (isoString?: string | null) => {
		if (!isoString) {
			return "—";
		}

		try {
			let str = isoString.trim();

			if (!str.endsWith("Z") && !str.includes("+") && !str.includes("-")) {
				str += "Z";
			}

			const d = new Date(str);

			if (isNaN(d.getTime())) {
				return isoString;
			}

			return d.toLocaleString(undefined, {
				month: "short",
				day: "numeric",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
		} catch {
			return isoString;
		}
	};

	// ============================================================
	// CHECK SYNC ENGINE STATUS
	// ============================================================

	const isSyncEngineOffline = schedules.some((schedule) => {
		if (!schedule.isEnabled) {
			return false;
		}

		if (!schedule.lastRunAtUtc) {
			return true;
		}

		const lastRun = new Date(schedule.lastRunAtUtc.endsWith("Z") ? schedule.lastRunAtUtc : schedule.lastRunAtUtc + "Z");

		const hoursDiff = (Date.now() - lastRun.getTime()) / (1000 * 3600);

		return hoursDiff > 26;
	});

	// ============================================================
	// FILTER SCHEDULES
	// ============================================================

	const filteredSchedules = schedules.filter((row) => {
		if (!searchQuery.trim()) {
			return true;
		}

		const q = searchQuery.toLowerCase().trim();

		return (
			row.scheduledTime?.toLowerCase().includes(q) ||
			row.repeatMode?.toLowerCase().includes(q) ||
			row.lastRunStatus?.toLowerCase().includes(q)
		);
	});

	// ============================================================
	// UI
	// ============================================================

	return (
		<Box sx={{ p: 0 }}>
			{/* =====================================================
                TOP ACTION BAR
            ===================================================== */}

			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
				<OutlinedInput
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					size="small"
					placeholder="Search schedules..."
					startAdornment={
						<InputAdornment position="start">
							<MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
						</InputAdornment>
					}
					sx={{
						maxWidth: "300px",
						width: "100%",
						borderRadius: "8px",
						bgcolor: "var(--mui-palette-background-paper)",

						"& .MuiOutlinedInput-notchedOutline": {
							borderColor: "var(--mui-palette-divider)",
						},
					}}
				/>

				<Stack direction="row" spacing={1.5}>
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshIcon />}
						onClick={() => loadData(true)}
						disabled={loading}
					>
						Refresh
					</Button>

					<Button
						variant="contained"
						color="primary"
						size="small"
						startIcon={<AddIcon />}
						onClick={handleOpenCreateModal}
					>
						Add Schedule
					</Button>
				</Stack>
			</Stack>

			{/* =====================================================
                SCHEDULE TABLE
            ===================================================== */}

			<Card
				elevation={2}
				sx={{
					position: "relative",
					overflow: "hidden",
				}}
			>
				<TableContainer component={Paper} sx={{ borderRadius: 1 }}>
					<Table sx={{ minWidth: 900 }}>
						<TableHead
							sx={{
								bgcolor: "action.hover",
							}}
						>
							<TableRow>
								<TableCell sx={{ fontWeight: 600 }}>Scheduled Time</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Repeat</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Enabled</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Next Run</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Last Run</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>

								<TableCell sx={{ fontWeight: 600 }}>Devices</TableCell>

								<TableCell align="center" sx={{ fontWeight: 600 }}>
									Action
								</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
										<CircularProgress />
									</TableCell>
								</TableRow>
							) : filteredSchedules.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center" sx={{ py: 6 }}>
										<Typography variant="body1" color="text.secondary">
											{searchQuery.trim()
												? `No schedule matching "${searchQuery}" found.`
												: 'No schedules found. Click "Add Schedule" to configure one.'}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredSchedules.map((row) => {
									let isRowStale = false;

									if (row.isEnabled) {
										if (!row.lastRunAtUtc) {
											isRowStale = true;
										} else {
											const lr = new Date(row.lastRunAtUtc.endsWith("Z") ? row.lastRunAtUtc : row.lastRunAtUtc + "Z");

											isRowStale = (Date.now() - lr.getTime()) / (1000 * 3600) > 26;
										}
									}

									return (
										<TableRow key={row.id} hover>
											{/* TIME */}

											<TableCell>
												<Typography variant="body2" fontWeight={600}>
													{formatScheduledTimeDisplay(row.scheduledTime)}
												</Typography>
											</TableCell>

											{/* REPEAT */}

											<TableCell>
												<Typography variant="body2">{row.repeatMode || "Daily"}</Typography>
											</TableCell>

											{/* ENABLED */}

											<TableCell>
												{row.isEnabled ? (
													<CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
												) : (
													<CloseIcon sx={{ color: "error.main", fontSize: 20 }} />
												)}
											</TableCell>
											{/* NEXT RUN */}

											<TableCell>
												{row.isEnabled ? (
													<Typography variant="body2" fontWeight={500}>
														{formatUtcDisplay(row.nextRunAtUtc)}
													</Typography>
												) : (
													<Typography variant="caption" color="text.disabled">
														Disabled
													</Typography>
												)}
											</TableCell>

											{/* LAST RUN */}

											<TableCell>
												<Stack spacing={0.5}>
													<Typography variant="caption">
														{row.lastRunAtUtc ? formatUtcDisplay(row.lastRunAtUtc) : "Not Run"}
													</Typography>
												</Stack>
											</TableCell>

											{/* STATUS */}

											<TableCell>
												{row.lastRunStatus ? (
													<Chip
														size="small"
														label={row.lastRunStatus}
														color={row.lastRunStatus === "Success" ? "success" : "error"}
														variant="outlined"
														sx={{
															height: 24,
															"& .MuiChip-label": {
																padding: "2px 5px",
															},
														}}
													/>
												) : (
													<Chip
														size="small"
														label="Not Run"
														color="default"
														variant="outlined"
														sx={{
															height: 24,
															"& .MuiChip-label": {
																padding: "2px 5px",
															},
														}}
													/>
												)}
											</TableCell>

											{/* Device */}
											<TableCell>
												<Chip
													size="small"
													label={`${getAttachedDeviceCount(row.id)} Device${
														getAttachedDeviceCount(row.id) === 1 ? "" : "s"
													}`}
													variant="outlined"
												/>
											</TableCell>

											{/* ACTION */}

											<TableCell align="center">
												<Button
													variant="outlined"
													color="primary"
													size="small"
													sx={{
														minWidth: 0,
														height: 24,
														padding: "2px 8px",
													}}
													onClick={() => handleOpenManageDialog(row)}
												>
													Manage
												</Button>
												<Button
													variant="outlined"
													color="primary"
													size="small"
													sx={{
														minWidth: 0,
														height: 24,
														padding: "2px 8px",
														ml: 1,
													}}
													onClick={() => handleOpenEditModal(row)}
												>
													Edit
												</Button>
												<Button
													variant="outlined"
													color="error"
													size="small"
													sx={{
														minWidth: 0,
														height: 24,
														padding: "2px 5px",
														ml: 1,
													}}
													onClick={() => handleOpenDeleteDialog(row)}
												>
													Delete
												</Button>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Card>

			{/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

			<Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
				<DialogTitle
					sx={{
						fontWeight: 600,
						pb: 1,
					}}
				>
					{modalMode === "create" ? "Add Schedule" : "Edit Schedule"}
				</DialogTitle>

				<DialogContent dividers>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<TextField
							label="Scheduled Time"
							type="time"
							size="small"
							value={modalTime}
							onChange={(e) => setModalTime(e.target.value)}
							inputProps={{
								step: 300,
							}}
							fullWidth
							helperText="Select the daily time for automatic meter synchronization."
						/>

						<FormControlLabel
							control={
								<Switch checked={modalEnabled} onChange={(e) => setModalEnabled(e.target.checked)} color="primary" />
							}
							label={modalEnabled ? "Enabled" : "Disabled"}
						/>
					</Stack>
				</DialogContent>

				<DialogActions
					sx={{
						px: 3,
						py: 2,
					}}
				>
					<Button onClick={handleCloseModal} disabled={savingModal} color="inherit">
						Cancel
					</Button>

					<Button variant="contained" color="primary" onClick={handleSaveSchedule} disabled={savingModal}>
						{savingModal ? "Saving..." : "Save Schedule"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* =====================================================
    			DELETE CONFIRMATION MODAL
				===================================================== */}

			<Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Delete Schedule</DialogTitle>

				<DialogContent>
					<Typography>Are you sure you want to delete this schedule?</Typography>

					{deletingSchedule?.scheduledTime && (
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							Scheduled Time: <strong>{formatScheduledTimeDisplay(deletingSchedule.scheduledTime)}</strong>
						</Typography>
					)}
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={handleCloseDeleteDialog} disabled={deleting} color="inherit">
						Cancel
					</Button>

					<Button onClick={handleDeleteSchedule} variant="contained" color="error" disabled={deleting}>
						{deleting ? "Deleting..." : " Delete"}
					</Button>
				</DialogActions>
			</Dialog>
			{/* ============================================================
   				 MANAGE SCHEDULE DEVICES
				============================================================ */}

			<Dialog open={manageDialogOpen} onClose={handleCloseManageDialog} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Manage Schedule</DialogTitle>

				<DialogContent dividers>
					{/* Schedule Information */}

					{selectedManageSchedule && (
						<Box sx={{ mb: 3 }}>
							<Typography variant="body1" fontWeight={600}>
								{formatScheduledTimeDisplay(selectedManageSchedule.scheduledTime)}
								{" · "}
								{selectedManageSchedule.repeatMode || "Daily"}
							</Typography>
						</Box>
					)}

					{/* Attached Devices */}

					<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
						Attached Devices ({attachedDevices.length})
					</Typography>

					{attachedDevices.length === 0 ? (
						<Box
							sx={{
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 1,
								p: 2,
								mb: 3,
							}}
						>
							<Typography variant="body2" color="text.secondary">
								No devices attached to this schedule.
							</Typography>
						</Box>
					) : (
						<Stack spacing={1} sx={{ mb: 3 }}>
							{attachedDevices.map((device) => (
								<Box
									key={device.id}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										border: "1px solid",
										borderColor: "divider",
										borderRadius: 1,
										px: 1.5,
										py: 1,
									}}
								>
									<Box>
										<Typography variant="body2" fontWeight={600}>
											{device.name || `Device ${device.id}`}
										</Typography>

										<Typography variant="caption" color="text.secondary">
											ID: {device.id}
										</Typography>
									</Box>

									<Button
										size="small"
										variant="outlined"
										color="error"
										disabled={savingDeviceId === device.id}
										onClick={() => handleRemoveDeviceFromSchedule(device)}
									>
										{savingDeviceId === device.id ? "Removing..." : "Remove"}
									</Button>
								</Box>
							))}
						</Stack>
					)}

					{/* Add Device */}

					<Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
						Add Device
					</Typography>

					<Autocomplete
						multiple
						fullWidth
						size="small"
						sx={{ mb: 1.8 }}
						slotProps={{
							listbox: {
								sx: {
									maxHeight: 200,
								},
							},
						}}
						options={devices.filter((device) => device.deviceSyncScheduleId !== selectedManageSchedule?.id)}
						value={devices.filter((device) => selectedDeviceIds.includes(device.id))}
						disableCloseOnSelect
						getOptionLabel={(device) => `${device.name || `Device ${device.id}`} — ID ${device.id}`}
						isOptionEqualToValue={(option, value) => option.id === value.id}
						filterOptions={(options, { inputValue }) => {
							const query = inputValue.trim().toLowerCase();

							if (!query) return options;

							return options.filter((device) =>
								[device.id, device.name, device.serialNumber, device.consumerNumber]
									.filter(Boolean)
									.some((value) => String(value).toLowerCase().includes(query))
							);
						}}
						onChange={(_, newValue) => {
							setSelectedDeviceIds(newValue.map((device) => device.id));
						}}
						renderOption={(props, device, { selected }) => {
							const currentSchedule = getDeviceSchedule(device);

							return (
								<li {...props} key={device.id}>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											width: "100%",
										}}
									>
										<input
											type="checkbox"
											checked={selected}
											readOnly
											style={{
												width: 18,
												height: 18,
												cursor: "pointer",
											}}
										/>

										<Box sx={{ width: "100%" }}>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													gap: 1,
													flexWrap: "wrap",
												}}
											>
												<Typography variant="body2" fontWeight={600}>
													{device.name || `Device ${device.id}`} — ID {device.id}
												</Typography>

												<Typography variant="caption" color={currentSchedule ? "text.secondary" : "error.main"}>
													{currentSchedule ? `Currently assigned to ${currentSchedule.scheduledTime}` : "Unassigned"}
												</Typography>
											</Box>

											<Typography variant="caption" color="text.secondary">
												{device.serialNumber ? `Serial: ${device.serialNumber}` : ""}
												{device.consumerNumber ? ` · Consumer: ${device.consumerNumber}` : ""}
											</Typography>
										</Box>
									</Box>
								</li>
							);
						}}
						renderInput={(params) => <TextField {...params} label="Add Devices" placeholder="Search devices..." />}
						renderTags={(selectedDevices, getTagProps) =>
							selectedDevices.map((device, index) => (
								<Chip
									{...getTagProps({ index })}
									key={device.id}
									label={device.name || `Device ${device.id}`}
									size="small"
								/>
							))
						}
					/>
				</DialogContent>

				<DialogActions
					sx={{
						px: 3,
						py: 2,
					}}
				>
					<Button onClick={handleCloseManageDialog} color="inherit">
						Cancel
					</Button>

					<Button
						variant="contained"
						color="primary"
						disabled={selectedDeviceIds === null || savingDeviceId !== null}
						onClick={handleAddDevicesToSchedule}
					>
						{savingDeviceId !== null ? "Adding..." : "Add Device"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Change Device Schedule Confirmation */}
			<Dialog open={changeDeviceDialogOpen} onClose={handleCancelDeviceScheduleChange} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Change Device Schedule?</DialogTitle>

				<DialogContent dividers>
					{pendingDevices.length > 0 && selectedManageSchedule && (
						<>
							<Typography variant="body1" sx={{ mb: 2 }}>
								The following device
								{pendingDevices.length > 1 ? "s are" : " is"} already assigned to another schedule:
							</Typography>

							<Box
								sx={{
									p: 2,
									borderRadius: 1,
									bgcolor: "action.hover",
									mb: 2,
								}}
							>
								<Typography variant="body2" color="text.secondary">
									Current Schedule
								</Typography>
								<Stack spacing={1}>
									{pendingDevices.map((device) => {
										const currentSchedule = getDeviceSchedule(device);

										return (
											<Typography key={device.id} variant="body1" fontWeight={600}>
												{device.name || `Device ${device.id}`} —{" "}
												{currentSchedule
													? `${formatScheduledTimeDisplay(
															currentSchedule.scheduledTime
														)} · ${currentSchedule.repeatMode || "Daily"}`
													: "No Schedule"}
											</Typography>
										);
									})}
								</Stack>
							</Box>

							<Typography variant="body2" sx={{ mb: 1 }}>
								Do you want to move this device to:
							</Typography>

							<Typography variant="body1" fontWeight={600}>
								{formatScheduledTimeDisplay(selectedManageSchedule.scheduledTime)}
								{" · "}
								{selectedManageSchedule.repeatMode || "Daily"}
							</Typography>
						</>
					)}
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={handleCancelDeviceScheduleChange} color="inherit">
						Cancel
					</Button>

					<Button
						onClick={handleConfirmDeviceScheduleChange}
						variant="contained"
						color="primary"
						disabled={savingDeviceId !== null}
					>
						{savingDeviceId !== null ? "Changing..." : "Change"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* =====================================================
                SNACKBAR
            ===================================================== */}

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() =>
					setSnackbar((prev) => ({
						...prev,
						open: false,
					}))
				}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
			>
				<Alert
					onClose={() =>
						setSnackbar((prev) => ({
							...prev,
							open: false,
						}))
					}
					severity={snackbar.severity}
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
