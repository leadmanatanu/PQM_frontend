'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import * as React from 'react';
import { useMemo, useState } from 'react';

interface Reading {
    id: number | string;
    parameterName: string;
    parameterId: number;
    profileId: number | null;
    profileName: string | null;
    value: string;
    dateStamp: string | null;
}

interface ReportGroup {
    profileId: number | null;
    profileName: string | null;
    items: Reading[];
}

interface ReportRTableProps {
    groups?: ReportGroup[];
    hasSearched?: boolean;
    isSearching?: boolean;
    /** Max height of each profile group's scrollable table area */
    groupMaxHeight?: number | string;
}

// Pivot helper to construct matrix of [Parameter x Timestamp] for a single group's items
function buildPivotData(rows: Reading[]) {
    const timestampSet = new Set<string>();
    rows.forEach((r) => {
        if (r.dateStamp) timestampSet.add(r.dateStamp);
    });
    const timestamps = Array.from(timestampSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const paramMap = new Map<number, string>();
    rows.forEach((r) => {
        if (!paramMap.has(r.parameterId)) paramMap.set(r.parameterId, r.parameterName);
    });
    const params = Array.from(paramMap.entries()).map(([id, name]) => ({ id, name }));

    const cellLookup = new Map<number, Map<string, string>>();
    rows.forEach((r) => {
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

const PARAM_COL_WIDTH = 280;
const TS_COL_WIDTH = 85;

function ProfileGroupTable({ group, maxHeight }: { group: ReportGroup; maxHeight: number | string }) {
    const [hoveredTimestamp, setHoveredTimestamp] = useState<string | null>(null);
    const { timestamps, params, cellLookup } = useMemo(() => buildPivotData(group.items), [group.items]);

    return (
        <Box
            sx={{
                maxHeight,
                overflowX: 'auto',
                overflowY: 'auto',
                position: 'relative',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
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
                            <TableRow key={param.id} hover sx={{ height: 34 }}>
                                <TableCell
                                    sx={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 4,
                                        bgcolor: (theme) =>
                                            isEven
                                                ? theme.palette.mode === 'dark'
                                                    ? '#111927'
                                                    : '#ffffff'
                                                : theme.palette.mode === 'dark'
                                                    ? '#1a2232'
                                                    : '#f8f9fa',
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
    );
}

function groupKey(group: ReportGroup, idx: number): string {
    return String(group.profileId ?? `unassigned-${idx}`);
}

export function DeviceRTable({
    groups = [],
    hasSearched = false,
    isSearching = false,
    groupMaxHeight = 420,
}: ReportRTableProps): React.JSX.Element {
    // eslint-disable-next-line no-console
    console.log('[DeviceRTable] groups prop received:', groups);

    // Single-open accordion: only one profile group expanded at a time.
    // Auto-expand the sole group when there's exactly one; otherwise start collapsed.
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    React.useEffect(() => {
        setExpandedKey(groups.length === 1 ? groupKey(groups[0], 0) : null);
    }, [groups]);

    const handleToggle = (key: string) => (_e: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedKey(isExpanded ? key : null);
    };

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

    const isEmpty = groups.length === 0 || groups.every((g) => g.items.length === 0);

    if (isEmpty) {
        return (
            <Card sx={{ maxWidth: '1400px', width: '100%' }}>
                <Box sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        {hasSearched
                            ? 'No results found matching your search criteria.'
                            : 'Please select a device and click Search to load aggregated report readings.'}
                    </Typography>
                </Box>
            </Card>
        );
    }

    return (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {groups.map((group, idx) => {
                const key = groupKey(group, idx);
                const label = group.profileName || 'Unassigned Profile';

                return (
                    <Accordion
                        key={key}
                        expanded={expandedKey === key}
                        onChange={handleToggle(key)}
                        disableGutters
                        sx={{ borderRadius: '8px', '&:before': { display: 'none' }, boxShadow: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ({group.items.length} readings)
                                </Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <ProfileGroupTable group={group} maxHeight={groupMaxHeight} />
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
}
