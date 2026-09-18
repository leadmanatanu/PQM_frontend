import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SyncIcon from "@mui/icons-material/Sync";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import * as React from "react";

import { useSelection } from "../../../hooks/use-selection";
import { useDeviceConnectionStatus } from "../../../hooks/useDeviceConnectionStatus";

export interface Device {
	id: number;

	name: string;

	ip: string;

	port: number;

	isActive: boolean | string;

	isDeleted?: boolean | string;

	createdAt?: Date;

	createdId?: number;

	modifiedDate?: Date;

	modifiedId?: number;

	serialNumber: string;

	consumerNumber: string;

	lastSyncAt?: Date;

	clientAddress?: number;

	serverAddress?: number;

	authentication?: string;

	password?: string;

	timeout?: number;

	status?: string;

	lastConnectionAttempt?: Date;

	lastError?: string;

	isConfigured?: boolean;

	meterType?: {
		id: number;
		name: string;
		devices?: any[];
		parameters?: any[];
	};

	meterTypeId?: number | null;

	timeZoneId?: string;

	hasScheduleConfigured?: boolean;

	isScheduleEnabled?: boolean;

	scheduledTime?: string;

	deviceSyncSchedule?: {
		id: number;
		isEnabled: boolean;
		scheduledTime?: string;
		repeatMode?: string;
	} | null;

	deviceSyncScheduleId?: number | null;
}
interface DevicesTableProps {
	count?: number;
	page?: number;
	rows?: Device[];
	rowsPerPage?: number;
	show?: boolean;

	onPageChange?: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
	onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

	onEdit?: (deviceId: number) => void;
	onDelete?: (deviceId: number) => void;
	onSyncNow?: (deviceId: number) => void;
	onToggleActive?: (deviceId: number, newActiveState: boolean) => void;
	syncingDeviceIds?: Set<number>;

	onSelectionChange?: (selectedIds: Set<number>) => void;
}

export function DevicesTable({
	count = 0,
	rows = [],
	page = 0,
	rowsPerPage = 10,
	show = true,

	onPageChange = () => {},
	onRowsPerPageChange = () => {},

	onEdit = () => {},
	onDelete = () => {},
	onSyncNow = () => {},
	syncingDeviceIds = new Set<number>(),

	onSelectionChange = () => {},
}: DevicesTableProps): React.JSX.Element | null {
	const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);

	const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);

	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

	const rowIds = React.useMemo(() => {
		return rows.map((device) => device.id);
	}, [rows]);

	// const visibleDeviceIds = React.useMemo(() => {
	// 	return rows.map((device) => String(device.id));
	// }, [rows]);

	const visibleDeviceIds = React.useMemo(() => {
		return rows.map((device) => device.id);
	}, [rows]);

	const { connectionStatus } = useDeviceConnectionStatus(visibleDeviceIds);

	const { selected } = useSelection(rowIds);

	if (!show) return null;

	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, device: Device) => {
		setMenuAnchorEl(event.currentTarget);
		setSelectedDevice(device);
	};

	const handleCloseMenu = () => {
		setMenuAnchorEl(null);
		setSelectedDevice(null);
	};

	const handleSyncNowClick = () => {
		if (selectedDevice) {
			onSyncNow(selectedDevice.id);
		}
		handleCloseMenu();
	};

	const handleEditClick = () => {
		if (selectedDevice) {
			onEdit(selectedDevice.id);
		}
		handleCloseMenu();
	};
	const handleDeleteClick = () => {
		if (!selectedDevice) return;

		setDeleteDialogOpen(true);
		setMenuAnchorEl(null);
	};

	// Delete confirm function
	const handleConfirmDelete = () => {
		if (selectedDevice) {
			onDelete(selectedDevice.id);
		}

		setDeleteDialogOpen(false);
		setSelectedDevice(null);
	};

	// delete Cancel function
	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
	};

	const selectedDeviceIsSyncing = selectedDevice ? syncingDeviceIds.has(selectedDevice.id) : false;

	//checkbox uses
	const [selectedDeviceIds, setSelectedDeviceIds] = React.useState<Set<number>>(new Set());

	return (
		<Card sx={{ borderRadius: "8px" }}>
			<Box sx={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>
				<Table size="small" sx={{ width: "100%" }}>
					<TableHead sx={{ bgcolor: "var(--mui-palette-neutral-50)" }}>
						<TableRow>
							<TableCell padding="checkbox">
								<Checkbox
									checked={rows.length > 0 && rows.every((row) => selectedDeviceIds.has(row.id))}
									indeterminate={
										rows.some((row) => selectedDeviceIds.has(row.id)) &&
										!rows.every((row) => selectedDeviceIds.has(row.id))
									}
									onChange={(event) => {
										const next = new Set(selectedDeviceIds);

										if (event.target.checked) {
											rows.forEach((row) => next.add(row.id));
										} else {
											rows.forEach((row) => next.delete(row.id));
										}

										setSelectedDeviceIds(next);
										onSelectionChange(next);
									}}
								/>
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Serial No</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Consumer No</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Meter Type</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Connection</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Scheduled</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>IsActive</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Last Sync</TableCell>
							<TableCell sx={{ fontWeight: 600 }} align="center">
								Action
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={9} align="center" sx={{ py: 3 }}>
									<Typography variant="body2" color="text.secondary">
										No devices found.
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							rows.map((row) => {
								const isSelected = selected?.has(row.id);

								// Merge static DB data with live SignalR updates
								const liveStatus = connectionStatus[row.id];

								const connectionStatusText =
									liveStatus === true ? "Online" : liveStatus === false ? "Offline" : "Checking...";

								const lastSyncAt = row.lastSyncAt;
								const statusColor = connectionStatusText === "Online" ? "success" : "default";
								const statusVariant = connectionStatusText === "Online" ? "filled" : "outlined";

								const formatSchedTime = (t?: string) => {
									if (!t) return "";
									const clean = t.trim().substring(0, 5);
									const parts = clean.split(":");
									if (parts.length >= 2) {
										const h = parseInt(parts[0], 10);
										const m = parseInt(parts[1], 10);
										if (!isNaN(h) && !isNaN(m)) {
											const ampm = h >= 12 ? "PM" : "AM";
											const h12 = h % 12 || 12;
											return `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
										}
									}
									return clean;
								};

								return (
									<TableRow hover key={row.id} selected={isSelected}>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selectedDeviceIds.has(row.id)}
												onChange={(event) => {
													const next = new Set(selectedDeviceIds);

													if (event.target.checked) {
														next.add(row.id);
													} else {
														next.delete(row.id);
													}

													setSelectedDeviceIds(next);
													onSelectionChange(next);
												}}
											/>
										</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>{row.name}</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>{row.serialNumber}</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>{row.consumerNumber}</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}> {row.meterType?.name || "-"}</TableCell>
										<TableCell>
											<Chip
												label={connectionStatusText}
												color={statusColor}
												size="small"
												variant={statusVariant}
												sx={{
													fontWeight: 600,
													minWidth: 80,
													textAlign: "center",
													height: 24,
													"& .MuiChip-label": {
														padding: "2px 5px",
													},
												}}
											/>
										</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>
											{row.deviceSyncSchedule
												? row.deviceSyncSchedule?.isEnabled
													? formatSchedTime(row.deviceSyncSchedule.scheduledTime)
													: "Disabled"
												: "No"}
										</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>
											{row.isActive ? (
												<CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
											) : (
												<CloseIcon sx={{ color: "error.main", fontSize: 20 }} />
											)}
										</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>{row.ip}</TableCell>
										<TableCell sx={{ whiteSpace: "nowrap" }}>
											{lastSyncAt ? (
												dayjs(lastSyncAt).format("MMM D, YYYY HH:mm")
											) : (
												<Typography variant="caption" color="text.disabled">
													Never
												</Typography>
											)}
										</TableCell>
										<TableCell align="center">
											<IconButton size="small" onClick={(e) => handleOpenMenu(e, row)} aria-label="device options">
												<MoreVertIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</Box>

			<Divider />
			<TablePagination
				component="div"
				count={count}
				page={page}
				rowsPerPage={rowsPerPage}
				rowsPerPageOptions={[5, 10, 25]}
				onPageChange={onPageChange}
				onRowsPerPageChange={onRowsPerPageChange}
				slotProps={{
					select: {
						native: true,
					},
				}}
			/>

			{/* Three-Dot Dropdown Menu - Exactly Two Options: Sync Now and Edit */}
			<Menu
				anchorEl={menuAnchorEl}
				open={Boolean(menuAnchorEl)}
				onClose={handleCloseMenu}
				transformOrigin={{ horizontal: "right", vertical: "top" }}
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
			>
				<MenuItem onClick={handleSyncNowClick} disabled={selectedDeviceIsSyncing}>
					<ListItemIcon>
						<SyncIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>{selectedDeviceIsSyncing ? "Syncing..." : "Sync Now"}</ListItemText>
				</MenuItem>

				<MenuItem onClick={handleEditClick}>
					<ListItemIcon>
						<EditIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Edit</ListItemText>
				</MenuItem>
				<MenuItem onClick={handleDeleteClick}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Delete</ListItemText>
				</MenuItem>
			</Menu>

			{/* Dialog box */}
			<Dialog open={deleteDialogOpen} onClose={handleCancelDelete} maxWidth="xs" fullWidth>
				<DialogTitle sx={{ fontWeight: 600 }}>Delete Device</DialogTitle>

				<DialogContent>
					<Typography>
						Are you sure you want to delete <strong>{selectedDevice?.name}</strong>?
					</Typography>
				</DialogContent>

				<DialogActions sx={{ px: 3, py: 2 }}>
					<Button onClick={handleCancelDelete} color="inherit">
						Cancel
					</Button>

					<Button onClick={handleConfirmDelete} variant="contained" color="error">
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Card>
	);
}
