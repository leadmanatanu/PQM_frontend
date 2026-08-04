'use client';

import * as React from 'react';
import {
    Box,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    TextField,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    Alert,
    Snackbar,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    OutlinedInput,
    InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { useDeviceStatus } from '../../../hooks/use-device-status';
import {
    fetchAllDeviceSchedules,
    updateDeviceSchedule,
    DeviceScheduleItem
} from '../../../services/schedule.service';
import { fetchDevices } from '../../../services/device.service';
import type { Device } from '../../../components/dashboard/device/devices-table';

export default function SchedulingPage(): React.JSX.Element {
    const [schedules, setSchedules] = React.useState<DeviceScheduleItem[]>([]);
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    // Modal dialog state
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [modalMode, setModalMode] = React.useState<'create' | 'edit'>('create');
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<number | ''>('');
    const [modalTime, setModalTime] = React.useState<string>('00:00');
    const [modalEnabled, setModalEnabled] = React.useState<boolean>(true);
    const [savingModal, setSavingModal] = React.useState<boolean>(false);
    const [modalDeviceLabel, setModalDeviceLabel] = React.useState<string>('');

    // Search filter state
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    // Toast notification
    const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Real-time SignalR statuses
    const liveStatuses = useDeviceStatus();
    const prevStatusesRef = React.useRef<Record<number, string>>({});

    const loadData = React.useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [scheduleData, deviceList] = await Promise.all([
                fetchAllDeviceSchedules(),
                fetchDevices()
            ]);
            setSchedules(scheduleData ?? []);
            setDevices(deviceList ?? []);
        } catch (err) {
            console.error('Failed to load device schedules:', err);
            setSnackbar({ open: true, message: 'Failed to load schedules.', severity: 'error' });
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    // Initial load + 60s fallback poll
    React.useEffect(() => {
        loadData(true);
        // Fallback polling once per minute (60s) to keep NextRunAtUtc current
        const timer = setInterval(() => {
            loadData(false);
        }, 60000);
        return () => clearInterval(timer);
    }, [loadData]);

    // Automatically re-fetch schedule timestamps when SignalR reports a sync transition (Syncing -> Online/Error)
    React.useEffect(() => {
        let syncFinished = false;
        Object.entries(liveStatuses).forEach(([idStr, live]) => {
            const devId = Number(idStr);
            const prev = prevStatusesRef.current[devId];
            if (prev === 'Syncing' && live.status !== 'Syncing') {
                syncFinished = true;
            }
            prevStatusesRef.current[devId] = live.status;
        });

        if (syncFinished) {
            loadData(false);
        }
    }, [liveStatuses, loadData]);

    // Open Modal in CREATE mode
    const handleOpenCreateModal = () => {
        setModalMode('create');
        const defaultDev = devices.length > 0 ? devices[0].id : '';
        setSelectedDeviceId(defaultDev);
        setModalTime('00:00');
        setModalEnabled(true);
        setModalDeviceLabel('');
        setModalOpen(true);
    };

    // Open Modal in EDIT mode for a specific row
    const handleOpenEditModal = (row: DeviceScheduleItem) => {
        setModalMode('edit');
        setSelectedDeviceId(row.deviceId);
        setModalTime(row.scheduledTime ? row.scheduledTime.substring(0, 5) : '00:00');
        setModalEnabled(row.isEnabled);
        setModalDeviceLabel(`${row.deviceName} (${row.ip || 'ID: ' + row.deviceId})`);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        if (savingModal) return;
        setModalOpen(false);
    };

    const handleSaveSchedule = async () => {
        if (!selectedDeviceId || Number(selectedDeviceId) <= 0) {
            setSnackbar({ open: true, message: 'Please select a valid device.', severity: 'error' });
            return;
        }

        setSavingModal(true);
        try {
            const devIdNum = Number(selectedDeviceId);
            const res = await updateDeviceSchedule(devIdNum, {
                isEnabled: modalEnabled,
                scheduledTime: modalTime,
                repeatMode: 'Daily'
            });

            if (res.status) {
                const targetDev = devices.find(d => d.id === devIdNum);
                const devName = targetDev?.name || `Device ${devIdNum}`;
                setSnackbar({
                    open: true,
                    message: `Schedule successfully saved for ${devName}.`,
                    severity: 'success'
                });
                setModalOpen(false);
                await loadData(true);
            } else {
                setSnackbar({
                    open: true,
                    message: res.errors?.[0] || 'Failed to save schedule.',
                    severity: 'error'
                });
            }
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err.message || 'An error occurred while saving schedule.',
                severity: 'error'
            });
        } finally {
            setSavingModal(false);
        }
    };

    const formatScheduledTimeDisplay = (timeStr?: string) => {
        if (!timeStr) return '—';
        try {
            const clean = timeStr.trim().substring(0, 5);
            const parts = clean.split(':');
            if (parts.length >= 2) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const h12 = hours % 12 || 12;
                    const mStr = minutes.toString().padStart(2, '0');
                    const hStr = h12.toString().padStart(2, '0');
                    return `${clean} (${hStr}:${mStr} ${ampm})`;
                }
            }
            return clean;
        } catch {
            return timeStr;
        }
    };

    const formatUtcDisplay = (isoString?: string | null) => {
        if (!isoString) return '—';
        try {
            let str = isoString.trim();
            if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-')) {
                str += 'Z';
            }
            const d = new Date(str);
            if (isNaN(d.getTime())) return isoString;
            return d.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    const getStatusChip = (deviceId: number, defaultStatus: string) => {
        const live = liveStatuses[deviceId];
        const status = live?.status ?? defaultStatus;

        if (status === 'Syncing') {
            return (
                <Chip
                    size="small"
                    icon={<CircularProgress size={12} color="inherit" />}
                    label="Syncing..."
                    color="info"
                    variant="filled"
                    sx={{ fontWeight: 600, minWidth: 80, textAlign: 'center' }}
                />
            );
        }

        if (status === 'Online') {
            return <Chip size="small" label="Online" color="success" variant="outlined" />;
        }

        if (status === 'Error') {
            return <Chip size="small" label="Error" color="error" variant="outlined" />;
        }

        return <Chip size="small" label={status || 'Offline'} color="default" variant="outlined" />;
    };

    const getDeviceDisplayLabel = (dev: Device) => {
        const detail = dev.serialNumber || dev.ip || null;
        return detail ? `${dev.name} (${detail})` : dev.name;
    };

    const isAnySyncing = schedules.some(s => {
        const live = liveStatuses[s.deviceId];
        return (live?.status === 'Syncing' || s.status === 'Syncing');
    });

    const isSyncEngineOffline = schedules.some(s => {
        if (!s.isEnabled) return false;
        if (!s.lastRunAtUtc) return true;
        const lastRun = new Date(s.lastRunAtUtc.endsWith('Z') ? s.lastRunAtUtc : s.lastRunAtUtc + 'Z');
        const hoursDiff = (Date.now() - lastRun.getTime()) / (1000 * 3600);
        return hoursDiff > 26;
    });

    const filteredSchedules = schedules.filter(row => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
            row.deviceName?.toLowerCase().includes(q) ||
            row.ip?.toLowerCase().includes(q)
        );
    });

    return (
        <Box sx={{ p: 0 }}>
            {/* Top Action Bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <OutlinedInput
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    placeholder="Search device name..."
                    startAdornment={
                        <InputAdornment position="start">
                            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
                        </InputAdornment>
                    }
                    sx={{
                        maxWidth: '300px',
                        width: '100%',
                        borderRadius: '8px',
                        bgcolor: 'var(--mui-palette-background-paper)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--mui-palette-divider)',
                        }
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

            {/* Sync Engine Offline Warning Banner */}
            {isSyncEngineOffline && (
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon fontSize="inherit" />}
                    sx={{ mb: 2.5, fontWeight: 500, borderRadius: 2 }}
                >
                    <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'inline', mr: 1 }}>
                        ⚠ Sync Engine Warning:
                    </Typography>
                    One or more enabled device schedules have not executed a successful run in over 26 hours. The PQMMeterReader Windows service or sync engine may be offline.
                </Alert>
            )}

            {/* Active Syncing Progress Alert Banner */}
            {isAnySyncing && (
                <Alert
                    severity="info"
                    icon={<CircularProgress size={20} color="inherit" />}
                    sx={{ mb: 2.5, fontWeight: 500, borderRadius: 2 }}
                >
                    <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'inline', mr: 1 }}>
                        Meter Synchronization in Progress —
                    </Typography>
                    Reading DLMS profile parameters from active meters... Data will automatically refresh upon completion (~1-2 minutes).
                </Alert>
            )}

            {/* Read-Only Table */}
            <Card elevation={2} sx={{ position: 'relative', overflow: 'hidden' }}>
                {(loading || isAnySyncing) && (
                    <LinearProgress color="primary" sx={{ height: 4, width: '100%' }} />
                )}
                <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Scheduled Time (Local)</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Enabled</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Next Run (Local Time)</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Last Run</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Device Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Loading schedules...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredSchedules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            {searchQuery.trim() ? `No schedule matching "${searchQuery}" found.` : 'No active schedules found. Click "Add Schedule" to configure one.'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSchedules.map(row => {
                                    const live = liveStatuses[row.deviceId];
                                    const isRowSyncing = (live?.status === 'Syncing') || row.status === 'Syncing';

                                    let isRowStale = false;
                                    if (row.isEnabled) {
                                        if (!row.lastRunAtUtc) {
                                            isRowStale = true;
                                        } else {
                                            const lr = new Date(row.lastRunAtUtc.endsWith('Z') ? row.lastRunAtUtc : row.lastRunAtUtc + 'Z');
                                            isRowStale = (Date.now() - lr.getTime()) / (1000 * 3600) > 26;
                                        }
                                    }

                                    return (
                                        <TableRow
                                            key={row.deviceId}
                                            hover
                                            sx={{
                                                ...(isRowSyncing && {
                                                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                    transition: 'background-color 0.3s ease'
                                                }),
                                                ...(isRowStale && !isRowSyncing && {
                                                    bgcolor: 'rgba(237, 108, 2, 0.06)'
                                                })
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {row.deviceName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    TZ: {row.timeZoneId || 'India Standard Time'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{row.ip || '—'}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {formatScheduledTimeDisplay(row.scheduledTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isEnabled ? (
                                                    <Chip
                                                        label="Enabled"
                                                        color="success"
                                                        size="small"
                                                        variant="filled"
                                                        sx={{ fontWeight: 600, height: 24 }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Disabled"
                                                        color="default"
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 24 }}
                                                    />
                                                )}
                                            </TableCell>
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
                                            <TableCell>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="caption">
                                                        {formatUtcDisplay(row.lastRunAtUtc)}
                                                    </Typography>
                                                    {row.lastRunStatus && (
                                                        <Chip
                                                            size="small"
                                                            label={row.lastRunStatus}
                                                            color={row.lastRunStatus === 'Success' ? 'success' : 'error'}
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                    {isRowStale && (
                                                        <Chip
                                                            size="small"
                                                            icon={<WarningAmberIcon sx={{ fontSize: '12px !important' }} />}
                                                            label="Sync Stale (>26h)"
                                                            color="warning"
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusChip(row.deviceId, row.status)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenEditModal(row)}
                                                >
                                                    Edit
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

            {/* Schedule Create / Edit Modal Dialog */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
                    {modalMode === 'create' ? 'Add Device Sync Schedule' : 'Edit Device Sync Schedule'}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {/* Device Selector */}
                        <FormControl fullWidth size="small" disabled={modalMode === 'edit'}>
                            <InputLabel id="schedule-device-select-label">Device</InputLabel>
                            <Select
                                labelId="schedule-device-select-label"
                                id="schedule-device-select"
                                value={selectedDeviceId}
                                label="Device"
                                onChange={e => setSelectedDeviceId(e.target.value as number)}
                            >
                                {devices.map(dev => (
                                    <MenuItem key={dev.id} value={dev.id}>
                                        {getDeviceDisplayLabel(dev)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Scheduled Time */}
                        <TextField
                            label="Scheduled Time (Local)"
                            type="time"
                            size="small"
                            value={modalTime}
                            onChange={e => setModalTime(e.target.value)}
                            inputProps={{ step: 300 }}
                            fullWidth
                            helperText="Set the daily local time when automatic profile synchronization will run."
                        />

                        {/* Enabled Toggle */}
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={modalEnabled}
                                    onChange={e => setModalEnabled(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Schedule Enabled"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={handleCloseModal} disabled={savingModal} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveSchedule}
                        disabled={savingModal || !selectedDeviceId}
                        startIcon={savingModal ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {savingModal ? 'Saving...' : 'Save Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
