"use client";

import * as React from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
	Alert,
	Box,
	Button,
	Card,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	InputAdornment,
	OutlinedInput,
	Paper,
	Snackbar,
	Stack,
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

	const [selectedScheduleId, setSelectedScheduleId] = React.useState<number | null>(null);

	const [savingModal, setSavingModal] = React.useState<boolean>(false);

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
			const scheduleData = await fetchAllDeviceSchedules();

			setSchedules(scheduleData ?? []);
		} catch (err) {
			console.error("Failed to load schedules:", err);

			setSnackbar({
				open: true,
				message: "Failed to load schedules.",
				severity: "error",
			});
		} finally {
			if (showLoading) {
				setLoading(false);
			}
		}
	}, []);

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

		setModalOpen(true);
	};

	// ============================================================
	// EDIT MODAL
	// ============================================================

	const handleOpenEditModal = (row: DeviceScheduleItem) => {
		setModalMode("edit");

		setSelectedScheduleId(row.id);

		setModalTime(row.scheduledTime ? row.scheduledTime.substring(0, 5) : "00:00");

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
				isEnabled: true,
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
													<Chip
														size="small"	
														label="Yes"
														// color="success"
														variant="outlined"
														sx={{
															fontWeight: 600,
															height: 24,
														}}
													/>
												) : (
													<Chip
														size="small"
														label="No"
														color="default"
														variant="outlined"
														sx={{
															height: 24,
														}}
													/>
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

													{row.lastRunStatus && (
														<Chip
															size="small"
															label={row.lastRunStatus}
															color={row.lastRunStatus === "Success" ? "success" : "error"}
															variant="outlined"
															sx={{
																height: 20,
																fontSize: "0.7rem",
															}}
														/>
													)}
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
													/>
												) : (
													<Chip size="small" label="Not Run" color="default" variant="outlined" />
												)}
											</TableCell>

											{/* ACTION */}

											<TableCell align="center">
												<Button
													variant="outlined"
													color="primary"
													size="small"
													onClick={() => handleOpenEditModal(row)}
												>
													Edit
												</Button>
												<Button
													variant="outlined"
													color="error"
													size="small"
													sx={{ ml: 1 }}
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
