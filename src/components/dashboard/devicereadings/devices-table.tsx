"use client";

import * as React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SensorsIcon from "@mui/icons-material/Sensors";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";

export interface LiveScanItem {
	parameterId: number;
	parameterName: string;
	obisCode: string;
	value: string;
	unit?: string | null;
	error?: string | null;
	profileId?: number | null;
	profileName?: string | null;
}

export interface LiveScanGroup {
	profileId: number;
	profileName: string;

	items: LiveScanItem[];
}

interface DeviceRTableProps {
	groups?: LiveScanGroup[];
	scannedAt?: string | null;
	isScanning?: boolean;
	scanStatusText?: string;
	hasScanned?: boolean;
	concurrencyError?: string | null;
	errorMessage?: string | null;
}

export function DeviceRTable({
	groups = [],
	scannedAt = null,
	isScanning = false,
	hasScanned = false,
	concurrencyError = null,
	errorMessage = null,
}: DeviceRTableProps): React.JSX.Element {
	const formattedScannedAt = scannedAt ? dayjs(scannedAt).format("YYYY-MM-DD HH:mm:ss") : null;

	const [expanded, setExpanded] = React.useState<number | null>(null);

	React.useEffect(() => {
		setExpanded(groups.length === 1 ? groups[0].profileId : null);
	}, [scannedAt, groups]);

	if (isScanning) {
		return (
			<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
				<Box sx={{ p: 6, textAlign: "center" }}>
					<Stack spacing={2} alignItems="center">
						<CircularProgress size={36} />
						<Typography fontWeight={600}>Reading live meter values...</Typography>
					</Stack>
				</Box>
			</Card>
		);
	}

	if (concurrencyError) {
		return (
			<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
				<Box sx={{ p: 3 }}>
					<Alert severity="warning">Device is currently syncing — please try scanning again in a moment</Alert>
				</Box>
			</Card>
		);
	}

	if (errorMessage) {
		return (
			<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
				<Box sx={{ p: 3 }}>
					<Alert severity="error">{errorMessage}</Alert>
				</Box>
			</Card>
		);
	}

	if (!hasScanned) {
		return (
			<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
				<Box sx={{ p: 6, textAlign: "center" }}>
					<Typography color="text.secondary">
						Select a device and click <strong>Scan</strong> to read current live meter values in real-time.
					</Typography>
				</Box>
			</Card>
		);
	}

	if (!groups.length) {
		return (
			<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
				<Box sx={{ p: 6, textAlign: "center" }}>
					<Typography color="text.secondary">No live parameter values returned for this scan.</Typography>
				</Box>
			</Card>
		);
	}

	const totalCount = groups.reduce((sum, group) => sum + (group.items?.length ?? 0), 0);

	return (
		<Card sx={{ maxWidth: "1400px", width: "100%", borderRadius: "8px" }}>
			<Box
				sx={{
					p: 2,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 1,
				}}
			>
				<Typography variant="subtitle1" fontWeight={700}>
					Live Parameter Snapshot
				</Typography>

				{formattedScannedAt && (
					<Chip
						icon={<SensorsIcon />}
						label={`Scanned at ${formattedScannedAt}`}
						color="success"
						variant="outlined"
						size="small"
					/>
				)}
			</Box>

			<Divider />

			{groups.map((group) => {
				const panelId = group.profileId;
				const isOpen = expanded === panelId;

				// const errorCount = group.items.filter((item) => item.error || item.value === "N/A").length;

				const items = group.items ?? [];

				const errorCount = items.filter((item) => item.error || item.value === "N/A").length;
				return (
					<Accordion
						key={panelId}
						expanded={isOpen}
						onChange={(_, open) => setExpanded(open ? panelId : null)}
						disableGutters
						elevation={0}
						square
						sx={{
							"&:before": { display: "none" },
							borderBottom: "1px solid",
							borderColor: "divider",
						}}
					>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							sx={{
								bgcolor: isOpen ? "action.selected" : "action.hover",
								px: 2,
							}}
						>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
								<Typography variant="subtitle2" fontWeight={700}>
									{group.profileName}
								</Typography>

								<Chip
									// label={`${group.items.length} param${group.items.length === 1 ? "" : "s"}`}
									label={`${items.length} param${items.length === 1 ? "" : "s"}`}
									size="small"
									variant="outlined"
								/>

								{errorCount > 0 && (
									<Chip label={`${errorCount} failed`} size="small" color="error" variant="outlined" />
								)}
							</Stack>
						</AccordionSummary>

						<AccordionDetails sx={{ p: 0 }}>
							{items.length ? (
								<Box sx={{ overflowX: "auto" }}>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 700 }}>Parameter Name</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>OBIS Code</TableCell>
												<TableCell align="right" sx={{ fontWeight: 700 }}>
													Live Value
												</TableCell>
												<TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
											</TableRow>
										</TableHead>

										<TableBody>
											{items.map((item, itemIndex) => {
												const isError = Boolean(item.error) || item.value === "N/A";

												return (
													<TableRow
														key={`${panelId}-${item.parameterId}-${itemIndex}`}
														hover
														sx={{
															bgcolor: itemIndex % 2 === 0 ? "background.paper" : "action.hover",
														}}
													>
														<TableCell
															sx={{
																fontWeight: 600,
																fontSize: "0.8125rem",
															}}
														>
															{item.parameterName}
														</TableCell>

														<TableCell
															sx={{
																fontSize: "0.75rem",
																fontFamily: "monospace",
																color: "text.secondary",
															}}
														>
															{item.obisCode}
														</TableCell>

														<TableCell
															align="right"
															sx={{
																fontWeight: 700,
																fontSize: "0.875rem",
																color: isError ? "error.main" : "primary.main",
															}}
														>
															{item.value || "—"}
														</TableCell>

														<TableCell
															sx={{
																fontSize: "0.75rem",
																color: "text.secondary",
															}}
														>
															{item.unit || ""}
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</Box>
							) : (
								<Box sx={{ p: 3, textAlign: "center" }}>
									<Typography variant="body2" color="text.secondary">
										No live parameter values returned for this profile.
									</Typography>
								</Box>
							)}
						</AccordionDetails>
					</Accordion>
				);
			})}

			<Box
				sx={{
					p: 1.5,
					px: 2,
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<Typography variant="caption" color="text.secondary">
					{groups.length} profile
					{groups.length === 1 ? "" : "s"} · Total live parameters scanned: {totalCount}
				</Typography>
			</Box>
		</Card>
	);
}
