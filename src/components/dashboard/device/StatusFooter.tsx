"use client";

import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

export type DeviceRunStatus = "loading" | "success" | "error" | "pending" | "stopped";

export interface DeviceRun {
	deviceId: number;
	deviceName?: string;
	progress: number;
	status: DeviceRunStatus;
	message?: string;
}

interface StatusFooterProps {
	open: boolean;
	devices: DeviceRun[];
	onStop?: (deviceId: number) => void;
	version?: string;
}

export function StatusFooter({ open, devices, onStop, version = "v1.1" }: StatusFooterProps): React.JSX.Element | null {
	const [expanded, setExpanded] = React.useState(false);

	if (!open || devices.length === 0) {
		return (
			<Box
				sx={{
					position: "fixed",
					bottom: 0,
					left: {
						xs: "var(--SideNav-width)",
						md: "var(--SideNav-width)",
					},
					right: 0,
					height: 42,
					zIndex: 1300,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					px: 2,
					backgroundColor: "#fff",
					borderTop: "1px solid #d9dce3",
					boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
				}}
			>
				<Typography variant="caption" fontWeight={600} color="text.secondary">
					No active sync process
				</Typography>

				<Typography variant="caption" fontWeight={600} color="text.secondary">
					PQM {version}
				</Typography>
			</Box>
		);
	}

	// --------------------------------------------------
	// TOP ROW DEVICE
	// Priority:
	// 1. Running
	// 2. Pending
	// 3. Error
	// 4. Stopped
	// 5. Success
	// --------------------------------------------------

	const runningDevice = [...devices]
		.reverse()
		.find((device) => device.status === "loading" || device.status === "pending");

	const errorDevice = [...devices].reverse().find((device) => device.status === "error");

	const stoppedDevice = [...devices].reverse().find((device) => device.status === "stopped");

	const successDevice = [...devices].reverse().find((device) => device.status === "success");

	const activeDevice = runningDevice || errorDevice || stoppedDevice || successDevice || devices[devices.length - 1];

	const progress = Math.min(Math.max(activeDevice.progress, 0), 100);

	const isRunning = activeDevice.status === "loading" || activeDevice.status === "pending";

	// --------------------------------------------------
	// STATUS ICON
	// --------------------------------------------------

	const getStatusIcon = (status: DeviceRunStatus) => {
		switch (status) {
			case "success":
				return (
					<CheckCircleIcon
						sx={{
							fontSize: 17,
							color: "success.main",
						}}
					/>
				);

			case "error":
				return (
					<ErrorIcon
						sx={{
							fontSize: 17,
							color: "error.main",
						}}
					/>
				);

			case "pending":
				return (
					<ScheduleIcon
						sx={{
							fontSize: 17,
							color: "warning.main",
						}}
					/>
				);

			case "stopped":
				return (
					<CloseIcon
						sx={{
							fontSize: 17,
							color: "error.main",
						}}
					/>
				);

			default:
				return null;
		}
	};

	// --------------------------------------------------
	// STATUS COLOR
	// --------------------------------------------------

	const getStatusColor = (status: DeviceRunStatus) => {
		switch (status) {
			case "success":
				return "success.main";

			case "error":
			case "stopped":
				return "error.main";

			case "pending":
				return "warning.main";

			default:
				return "text.secondary";
		}
	};

	// --------------------------------------------------
	// STATUS TEXT
	// --------------------------------------------------

	const getStatusText = (device: DeviceRun) => {
		switch (device.status) {
			case "loading":
				return "Running...";

			case "pending":
				return "Pending";

			case "error":
				return device.message || "Error";

			case "success":
				return device.message || "Successful";

			case "stopped":
				return device.message || "Stopped";

			default:
				return "";
		}
	};

	// --------------------------------------------------
	// DEVICE ROW
	// --------------------------------------------------

	const renderDeviceRow = (device: DeviceRun) => {
		const deviceProgress = Math.min(Math.max(device.progress, 0), 100);

		const deviceRunning = device.status === "loading" || device.status === "pending";

		return (
			<Box
				key={device.deviceId}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1,
					minHeight: 34,
					borderTop: "1px solid #eeeeee",
					px: 2,
				}}
			>
				{/* Device name */}
				<Typography
					variant="caption"
					fontWeight={600}
					noWrap
					sx={{
						width: {
							xs: 90,
							sm: 120,
							md: 150,
						},
					}}
				>
					{device.deviceName || `Device ${device.deviceId}`}
				</Typography>

				{/* RUNNING / LOADING */}
				{deviceRunning && (
					<>
						<Box
							sx={{
								width: {
									xs: 100,
									sm: 160,
									md: 220,
								},
							}}
						>
							<LinearProgress
								variant="determinate"
								value={deviceProgress}
								sx={{
									height: 6,
									borderRadius: 5,
								}}
							/>
						</Box>

						<Typography
							variant="caption"
							fontWeight={700}
							sx={{
								minWidth: 35,
							}}
						>
							{deviceProgress}%
						</Typography>

						{/* Stop */}
						<span>
							<IconButton
								size="small"
								onClick={() => onStop?.(device.deviceId)}
								title="Stop"
								sx={{
									width: 26,
									height: 26,
									ml: "auto",

									color: "error.main",
								}}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</span>
					</>
				)}

				{/* ERROR */}
				{device.status === "error" && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							ml: 1,
						}}
					>
						<ErrorIcon
							sx={{
								fontSize: 17,
								color: "error.main",
							}}
						/>

						<Typography variant="caption" fontWeight={700} color="error.main">
							{device.message || "Error"}
						</Typography>
					</Box>
				)}

				{/* SUCCESS */}
				{device.status === "success" && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							ml: 1,
						}}
					>
						<CheckCircleIcon
							sx={{
								fontSize: 17,
								color: "success.main",
							}}
						/>

						<Typography variant="caption" fontWeight={700} color="success.main">
							{device.message || "Successful"}
						</Typography>
					</Box>
				)}

				{/* STOPPED */}
				{device.status === "stopped" && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
							ml: 1,
						}}
					>
						<CloseIcon
							sx={{
								fontSize: 17,
								color: "error.main",
							}}
						/>

						<Typography variant="caption" fontWeight={700} color="error.main">
							{device.message || "Stopped"}
						</Typography>
					</Box>
				)}

				{/* PENDING */}
				{device.status === "pending" && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.5,
						}}
					>
						<ScheduleIcon
							sx={{
								fontSize: 17,
								color: "warning.main",
							}}
						/>

						<Typography variant="caption" fontWeight={700} color="warning.main">
							Pending
						</Typography>
					</Box>
				)}
			</Box>
		);
	};

	return (
		<Box
			sx={{
				position: "fixed",
				bottom: 0,

				left: {
					xs: 0,
					md: "var(--SideNav-width)",
				},

				right: 0,

				zIndex: 1300,

				backgroundColor: "#fff",

				borderTop: "1px solid #d9dce3",

				boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
			}}
		>
			{/* ================================================= */}
			{/* TOP ROW */}
			{/* ================================================= */}

			<Box
				sx={{
					height: 42,

					display: "flex",
					alignItems: "center",

					gap: 1,

					px: 2,
				}}
			>
				{/* STATUS ICON */}

				{isRunning ? (
					<ScheduleIcon
						sx={{
							fontSize: 18,
							color: "primary.main",
						}}
					/>
				) : (
					getStatusIcon(activeDevice.status)
				)}

				{/* DEVICE */}

				<Typography
					variant="body2"
					fontWeight={600}
					noWrap
					sx={{
						minWidth: {
							xs: 100,
							sm: 150,
						},
					}}
				>
					{isRunning
						? `Sync : ${activeDevice.deviceName || `Device ${activeDevice.deviceId}`}`
						: activeDevice.deviceName || `Device ${activeDevice.deviceId}`}
				</Typography>

				{/* PROGRESS ONLY WHEN RUNNING */}

				{isRunning && (
					<>
						<Box
							sx={{
								width: {
									xs: 120,
									sm: 220,
									md: 300,
								},
							}}
						>
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: 6,
									borderRadius: 5,
								}}
							/>
						</Box>

						<Typography
							variant="caption"
							fontWeight={700}
							sx={{
								minWidth: 35,
							}}
						>
							{progress}%
						</Typography>
						{/* STOP CURRENT RUNNING */}

						{isRunning && (
							<IconButton
								size="small"
								onClick={() => onStop?.(activeDevice.deviceId)}
								title="Stop"
								sx={{
									width: 24,
									height: 24,

									color: "error.main",
								}}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						)}
					</>
				)}

				{/* ERROR / SUCCESS / STOPPED */}

				{!isRunning && (
					<Typography variant="caption" fontWeight={700} color={getStatusColor(activeDevice.status)} noWrap>
						{getStatusText(activeDevice)}
					</Typography>
				)}

				{/* RIGHT SIDE */}

				<Box
					sx={{
						marginLeft: "auto",
						display: "flex",
						alignItems: "center",
						gap: 0.5,
					}}
				>
					{/* EXPAND / COLLAPSE */}

					<IconButton
						size="small"
						onClick={() => setExpanded((prev) => !prev)}
						title={expanded ? "Hide processes" : "Show processes"}
						sx={{
							width: 28,
							height: 28,
						}}
					>
						{expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
					</IconButton>

					{/* VERSION */}

					<Typography
						variant="caption"
						fontWeight={600}
						color="text.secondary"
						sx={{
							ml: 1,
							whiteSpace: "nowrap",
						}}
					>
						PQM {version}
					</Typography>
				</Box>
			</Box>

			{/* ================================================= */}
			{/* ALL PROCESSES */}
			{/* ================================================= */}

			{expanded && (
				<Box
					sx={{
						maxHeight: 150,
						overflowY: "auto",
						borderTop: "1px solid #eeeeee",
						pb: 0.5,
					}}
				>
					{devices.map(renderDeviceRow)}
				</Box>
			)}
		</Box>
	);
}
