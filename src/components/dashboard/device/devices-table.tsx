import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import * as React from 'react';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SyncIcon from '@mui/icons-material/Sync';

import { useDeviceStatus } from '../../../hooks/use-device-status';
import { useSelection } from '../../../hooks/use-selection';

export interface Device {

    id: number;

    name: string;

    ip: string;

    PORT: number;

    isActive: boolean | string;

    isDeleted?: boolean | string;

    createdDate?: Date;

    createdId?: number;

    modifiedDate?: Date;

    modifiedId?: number;

    serialNumber: string;

    consumerNumber: string;

    lastSync?: Date;

    clientAddress?: number;

    serverAddress?: number;

    authentication?: string;

    password?: string;

    timeout?: number;

    status?: string;

    lastConnectionAttempt?: Date;

    lastError?: string;

    isConfigured?: boolean;

    meterTypeName?: string;

    meterType?: string;

    meterTypeId?: number | null;

    timeZoneId?: string;

    hasScheduleConfigured?: boolean;

    isScheduleEnabled?: boolean;

    scheduledTime?: string;

    deviceSyncScheduleId?: number | null;

}
interface DevicesTableProps {
    count?: number;
    page?: number;
    rows?: Device[];
    rowsPerPage?: number;
    show?: boolean;
    onEdit?: (deviceId: number) => void;
    onDelete?: (deviceId: number) => void;
    onSyncNow?: (deviceId: number) => void;
    onToggleActive?: (deviceId: number, newActiveState: boolean) => void;
    syncingDeviceIds?: Set<number>;
}

export function DevicesTable({
    count = 0,
    rows = [],
    page = 0,
    rowsPerPage = 10,
    show = true,
    onEdit = () => { },
    onDelete = () => { },
    onSyncNow = () => { },
    syncingDeviceIds = new Set<number>(),
}: DevicesTableProps): React.JSX.Element | null {
    if (!show) return null;
    const liveStatuses = useDeviceStatus();

    // Three-dot action menu state
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
    const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);

    const rowIds = React.useMemo(() => {
        return rows.map((device) => device.id);
    }, [rows]);

    const { selected } = useSelection(rowIds);

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
    if (selectedDevice) {
        onDelete(selectedDevice.id);
    }
    handleCloseMenu();
    };

    const selectedDeviceIsSyncing = selectedDevice
        ? (liveStatuses[selectedDevice.id]?.status === 'Syncing' || syncingDeviceIds.has(selectedDevice.id))
        : false;

    return (
        <Card sx={{ borderRadius: '8px' }}>
            <Box sx={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                <Table size="small" sx={{ width: '100%' }}>
                    <TableHead sx={{ bgcolor: 'var(--mui-palette-neutral-50)' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Serial No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Consumer No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Meter Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Connection</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Scheduled</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>IP</TableCell>
                            {/* <TableCell sx={{ fontWeight: 600 }}>PORT</TableCell> */}
                            <TableCell sx={{ fontWeight: 600 }}>Last Sync</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
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
                                const live = liveStatuses[row.id];
                                const connectionStatus =live?.status === 'Online' || live?.status === 'Syncing'? 'Online': 'Offline';
                                const lastSync = live && live.lastSync ? live.lastSync : row.lastSync;
                                const statusColor =connectionStatus === 'Online' ? 'success' : 'default';
                                const statusVariant =connectionStatus === 'Online' ? 'filled' : 'outlined';

                                const formatSchedTime = (t?: string) => {
                                    if (!t) return '';
                                    const clean = t.trim().substring(0, 5);
                                    const parts = clean.split(':');
                                    if (parts.length >= 2) {
                                        const h = parseInt(parts[0], 10);
                                        const m = parseInt(parts[1], 10);
                                        if (!isNaN(h) && !isNaN(m)) {
                                            const ampm = h >= 12 ? 'PM' : 'AM';
                                            const h12 = h % 12 || 12;
                                            return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                                        }
                                    }
                                    return clean;
                                };

                                return (
                                    <TableRow hover key={row.id} selected={isSelected}>
                                        <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.name}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.serialNumber}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.consumerNumber}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const rawVal = row.meterTypeName || row.meterType || row.meterTypeId;
                                                if (rawVal === undefined || rawVal === null || rawVal === '') return '-';
                                                
                                                // If numeric or numeric string ID, map to name
                                                const strVal = String(rawVal).trim();
                                                if (strVal === '1') return 'ABT';
                                                if (strVal === '2') return 'PQ';
                                                if (strVal === '3') return 'Both';
                                                
                                                return strVal || '-';
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={connectionStatus}
                                                color={statusColor}
                                                size="small"
                                                variant={statusVariant}
                                                sx={{ fontWeight: 600, minWidth: 80, textAlign: 'center' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.isScheduleEnabled ? (
                                                <Chip
                                                    label={row.scheduledTime ? `Yes (${formatSchedTime(row.scheduledTime)})` : 'Yes'}
                                                    color="success"
                                                    size="small"
                                                    variant="filled"
                                                    sx={{ fontWeight: 600, height: 24, fontSize: '0.75rem' }}
                                                />
                                            ) : row.hasScheduleConfigured ? (
                                                <Chip
                                                    label="Disabled"
                                                    color="warning"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="No"
                                                    color="default"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 24, fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ip}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {lastSync
                                                ? dayjs(lastSync).format('MMM D, YYYY HH:mm')
                                                : <Typography variant="caption" color="text.disabled">Never</Typography>}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenMenu(e, row)}
                                                aria-label="device options"
                                            >
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
                onPageChange={() => { }}
                onRowsPerPageChange={() => { }}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            {/* Three-Dot Dropdown Menu - Exactly Two Options: Sync Now and Edit */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleSyncNowClick} disabled={selectedDeviceIsSyncing}>
                    <ListItemIcon>
                        <SyncIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>
                        {selectedDeviceIsSyncing ? 'Syncing...' : 'Sync Now'}
                    </ListItemText>
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
        </Card>
    );
}
