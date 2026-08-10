'use client';

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import dayjs from 'dayjs';

interface Reading {
    id: number | string;
    parameterName: string;
    parameterId: number;
    value: string;
    dateStamp: string | null;
}

interface ReportRTableProps {
    rows?: any[];
    totalCount?: number;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (event: unknown, newPage: number) => void;
    onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    hasSearched?: boolean;
    isSearching?: boolean;
}

// Pivot helper to construct matrix of [Parameter x Timestamp]
function buildPivotData(rows: Reading[]) {
    const timestampSet = new Set<string>();
    rows.forEach(r => {
        if (r.dateStamp) timestampSet.add(r.dateStamp);
    });
    const timestamps = Array.from(timestampSet).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    const paramMap = new Map<number, string>();
    rows.forEach(r => {
        if (!paramMap.has(r.parameterId)) paramMap.set(r.parameterId, r.parameterName);
    });
    const params = Array.from(paramMap.entries()).map(([id, name]) => ({ id, name }));

    const cellLookup = new Map<number, Map<string, string>>();
    rows.forEach(r => {
        if (!r.dateStamp) return;
        if (!cellLookup.has(r.parameterId)) cellLookup.set(r.parameterId, new Map());
        cellLookup.get(r.parameterId)!.set(r.dateStamp, r.value);
    });

    return { timestamps, params, cellLookup };
}

function formatTimestampHeader(ts: string): { primary: string; secondary: string } {
    const d = dayjs(ts);
    if (!d.isValid()) return { primary: ts, secondary: '' };
    return {
        primary: d.format('HH:mm'),
        secondary: d.format('MMM D'),
    };
}

export function DeviceRTable({
    rows = [],
    totalCount = 0,
    page = 0,
    rowsPerPage = 20,
    onPageChange = () => { },
    onRowsPerPageChange = () => { },
    hasSearched = false,
    isSearching = false,
}: ReportRTableProps): React.JSX.Element {
    const [hoveredTimestamp, setHoveredTimestamp] = useState<string | null>(null);

    if (isSearching) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Stack spacing={2} alignItems="center" justifyContent="center">
                        <CircularProgress size={36} />
                        <Typography variant="body1" fontWeight={600}>
                            Loading report...
                        </Typography>
                    </Stack>
                </Box>
            </Card>
        );
    }

    const isEmpty = rows.length === 0;

    if (isEmpty) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        {hasSearched
                            ? "No results found matching your search criteria."
                            : "Please select a device and click Search to load aggregated report readings."}
                    </Typography>
                </Box>
                <Divider />
                <TablePagination
                    component="div"
                    count={totalCount}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="Timestamps per page:"
                />
            </Card>
        );
    }

    const { timestamps, params, cellLookup } = buildPivotData(rows);

    const PARAM_COL_WIDTH = 280;
    const TS_COL_WIDTH = 85;

    return (
        <Card sx={{ maxWidth: '1400px', width: '100%', borderRadius: '8px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowX: 'auto',
                    overflowY: 'auto',
                    position: 'relative',
                }}
            >
                <Table
                    size="medium"
                    sx={{
                        minWidth: PARAM_COL_WIDTH + timestamps.length * TS_COL_WIDTH,
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    position: 'sticky',
                                    top: 0,
                                    left: 0,
                                    zIndex: 10,
                                    bgcolor: 'background.paper',
                                    fontWeight: 'bold',
                                    width: PARAM_COL_WIDTH,
                                    minWidth: PARAM_COL_WIDTH,
                                    maxWidth: PARAM_COL_WIDTH,
                                    borderRight: '2px solid',
                                    borderRightColor: 'divider',
                                    borderBottom: '2px solid',
                                    borderBottomColor: 'divider',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '3px 0 5px -2px rgba(0,0,0,0.12)',
                                    py: 1.5,
                                    px: 2,
                                    fontSize: '0.875rem',
                                }}
                            >
                                Parameter
                            </TableCell>

                            {timestamps.map((ts) => {
                                const { primary, secondary } = formatTimestampHeader(ts);
                                const isHovered = hoveredTimestamp === ts;
                                return (
                                    <Tooltip key={ts} title={dayjs(ts).format('YYYY-MM-DD HH:mm:ss')} placement="top">
                                        <TableCell
                                            align="center"
                                            onMouseEnter={() => setHoveredTimestamp(ts)}
                                            onMouseLeave={() => setHoveredTimestamp(null)}
                                            sx={{
                                                fontWeight: 'bold',
                                                minWidth: TS_COL_WIDTH,
                                                width: TS_COL_WIDTH,
                                                bgcolor: isHovered ? 'action.selected' : 'background.paper',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 3,
                                                whiteSpace: 'nowrap',
                                                lineHeight: 1.2,
                                                py: 1.25,
                                                px: 1,
                                                borderBottom: '2px solid',
                                                borderBottomColor: 'divider',
                                                transition: 'background-color 0.15s ease',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Box component="span" display="block" sx={{ fontSize: '0.825rem', fontWeight: 700 }}>
                                                {primary}
                                            </Box>
                                            <Box component="span" display="block" sx={{ fontSize: '0.675rem', color: 'text.secondary', fontWeight: 400, mt: 0.25 }}>
                                                {secondary}
                                            </Box>
                                        </TableCell>
                                    </Tooltip>
                                );
                            })}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {params.map((param, rowIdx) => {
                            const isEven = rowIdx % 2 === 0;

                            return (
                                <TableRow
                                    key={param.id}
                                    hover
                                    sx={{ height: 34 }}
                                >
                                    <TableCell
                                        sx={{
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 4,
                                            bgcolor: (theme) =>
                                                isEven
                                                    ? (theme.palette.mode === 'dark' ? '#111927' : '#ffffff')
                                                    : (theme.palette.mode === 'dark' ? '#1a2232' : '#f8f9fa'),
                                            fontWeight: 500,
                                            width: PARAM_COL_WIDTH,
                                            minWidth: PARAM_COL_WIDTH,
                                            maxWidth: PARAM_COL_WIDTH,
                                            borderRight: '2px solid',
                                            borderRightColor: 'divider',
                                            boxShadow: '3px 0 5px -2px rgba(0,0,0,0.12)',
                                            fontSize: '0.75rem',
                                            py: 0.75,
                                            px: 1.5,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Tooltip title={param.name} placement="right">
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    width: '100%',
                                                }}
                                            >
                                                {param.name}
                                            </Box>
                                        </Tooltip>
                                    </TableCell>

                                    {timestamps.map((ts) => {
                                        const val = cellLookup.get(param.id)?.get(ts);
                                        const isHovered = hoveredTimestamp === ts;
                                        return (
                                            <TableCell
                                                key={ts}
                                                align="center"
                                                onMouseEnter={() => setHoveredTimestamp(ts)}
                                                onMouseLeave={() => setHoveredTimestamp(null)}
                                                sx={{
                                                    fontWeight: val ? 500 : 400,
                                                    color: val ? 'primary.main' : 'text.disabled',
                                                    fontSize: '0.75rem',
                                                    py: 0.75,
                                                    px: 0.75,
                                                    minWidth: TS_COL_WIDTH,
                                                    width: TS_COL_WIDTH,
                                                    whiteSpace: 'nowrap',
                                                    bgcolor: isHovered ? 'action.hover' : 'transparent',
                                                    transition: 'background-color 0.15s ease',
                                                }}
                                            >
                                                {val || '-'}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Box>

            <Divider />

            {/* Bottom summary & Pagination */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.5, bgcolor: 'background.paper', flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary">
                    Showing {params.length} parameters across {timestamps.length} timestamp columns (Page {page + 1} of {Math.ceil(totalCount / rowsPerPage) || 1})
                </Typography>
                <TablePagination
                    component="div"
                    count={totalCount}
                    onPageChange={onPageChange}
                    onRowsPerPageChange={onRowsPerPageChange}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 20, 50]}
                    labelRowsPerPage="Timestamps per page:"
                    sx={{ borderBottom: 'none', flexShrink: 0 }}
                />
            </Box>
        </Card>
    );
}
