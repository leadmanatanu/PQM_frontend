'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import SensorsIcon from '@mui/icons-material/Sensors';
import dayjs from 'dayjs';

export interface LiveScanItem {
    parameterId: number;
    parameterName: string;
    obisCode: string;
    value: string;
    unit?: string | null;
    error?: string | null;
}

interface DeviceRTableProps {
    items?: LiveScanItem[];
    scannedAt?: string | null;
    isScanning?: boolean;
    scanStatusText?: string;
    hasScanned?: boolean;
    concurrencyError?: string | null;
    errorMessage?: string | null;
}

export function DeviceRTable({
    items = [],
    scannedAt = null,
    isScanning = false,
    scanStatusText = '',
    hasScanned = false,
    concurrencyError = null,
    errorMessage = null,
}: DeviceRTableProps): React.JSX.Element {

    const formattedScannedAt = scannedAt ? dayjs(scannedAt).format('YYYY-MM-DD HH:mm:ss') : null;

    if (isScanning) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Stack spacing={2} alignItems="center" justifyContent="center">
                        <CircularProgress size={36} />
                        <Typography variant="body1" fontWeight={600}>
                            Reading live meter values...
                        </Typography>
                    </Stack>
                </Box>
            </Card>
        );
    }

    if (concurrencyError) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 3 }}>
                    <Alert severity="warning" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        Device is currently syncing — please try scanning again in a moment
                    </Alert>
                </Box>
            </Card>
        );
    }

    if (errorMessage) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 3 }}>
                    <Alert severity="error" sx={{ fontSize: '0.9rem' }}>
                        {errorMessage}
                    </Alert>
                </Box>
            </Card>
        );
    }

    if (!hasScanned) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Select a device and click <strong>Scan</strong> to read current live meter values in real-time.
                    </Typography>
                </Box>
            </Card>
        );
    }

    if (items.length === 0) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No live parameter values returned for this scan.
                    </Typography>
                </Box>
            </Card>
        );
    }

    return (
        <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
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
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                    />
                )}
            </Box>
            <Divider />
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 700, py: 1.2, px: 2 }}>Parameter Name</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.2, px: 2 }}>OBIS Code</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, py: 1.2, px: 2 }}>Live Value</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.2, px: 2 }}>Unit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => {
                            const isEven = index % 2 === 0;
                            const isError = Boolean(item.error) || item.value === 'N/A';
                            return (
                                <TableRow key={item.parameterId || item.obisCode || index} hover sx={{ bgcolor: isEven ? 'background.paper' : 'action.hover' }}>
                                    <TableCell sx={{ py: 1, px: 2, fontWeight: 600, fontSize: '0.8125rem' }}>
                                        {item.parameterName}
                                    </TableCell>
                                    <TableCell sx={{ py: 1, px: 2, fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.secondary' }}>
                                        {item.obisCode}
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1, px: 2, fontWeight: 700, fontSize: '0.875rem', color: isError ? 'error.main' : 'primary.main' }}>
                                        {item.value || '—'}
                                    </TableCell>
                                    <TableCell sx={{ py: 1, px: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
                                        {item.unit || ''}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>
            <Divider />
            <Box sx={{ p: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                    Total live parameters scanned: {items.length} (View-Only, zero DB persistence)
                </Typography>
            </Box>
        </Card>
    );
}

