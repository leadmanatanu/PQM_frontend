"use client";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Metadata } from 'next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import dayjs from 'dayjs';
import * as signalR from '@microsoft/signalr';
import { config } from '../../../config';
import { DevicesFilters } from '../../../components/dashboard/device/devices-filters';
import { DevicesTable } from '../../../components/dashboard/device/devices-table';
import { AddDeviceForm } from '../../../components/dashboard/device/add-device-form';
import type { Device } from '../../../components/dashboard/device/devices-table';
import { fetchDevices, deleteDevice, syncDeviceNow, enableDeviceSync, disableDeviceSync } from '../../../api/device';
import { fetchAllDeviceSchedules } from '../../../services/schedule.service';
import * as XLSX from 'xlsx';

function applyPagination(rows: Device[], page: number, rowsPerPage: number): Device[] {
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export default function Page(): React.JSX.Element {
  const [isVisible, setIsVisible] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState<'fetch' | null>('fetch');
  const [syncingDeviceIds, setSyncingDeviceIds] = useState<Set<number>>(new Set());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const page = 0;
  const rowsPerPage = 10;

  // ---- Fetch devices on mount ----
  const loadDevices = async () => {
    setLoading('fetch');
    try {
      const [fetchedDevices, fetchedSchedules] = await Promise.all([
        fetchDevices(),
        fetchAllDeviceSchedules().catch(() => [])
      ]);

      const scheduleMap = new Map(fetchedSchedules.map(s => [s.deviceId, s]));

      const merged = (fetchedDevices ?? []).map(dev => {
        const sched = scheduleMap.get(dev.id);
        return {
          ...dev,
          hasScheduleConfigured: !!sched,
          isScheduleEnabled: sched ? sched.isEnabled : false,
          scheduledTime: sched?.scheduledTime
        };
      });

      setDevices(merged);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setSnackbarMessage('Failed to fetch devices');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = (devices ?? []).filter((device) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      device.name?.toLowerCase().includes(q) ||
      device.serialNumber?.toLowerCase().includes(q) ||
      device.consumerNumber?.toLowerCase().includes(q) ||
      device.ip?.toLowerCase().includes(q)
    );
  });

  const totalRows = filteredDevices.length;
  const paginatedDevices = applyPagination(filteredDevices, page, rowsPerPage);

  const toggleVisibility = async (device: Device | null = null) => {
    setIsVisible((prev) => !prev);
    setEditingDevice(device);
    await loadDevices();
  };

  const handleEdit = (deviceId: number) => {
    const device = (devices ?? []).find((d) => d.id === deviceId) || null;
    setIsVisible(false);
    setEditingDevice(device);
  };

  const handleDelete = async (deviceId: number) => {
    try {
      const res = await deleteDevice(deviceId);
      if (res && res.status) {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        setSnackbarMessage(`Device ${deviceId} soft-deleted successfully.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(`Failed to delete device ${deviceId}.`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage(`Error deleting device: ${err}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSyncNow = async (deviceId: number) => {
    setSyncingDeviceIds((prev) => new Set(prev).add(deviceId));

    const result = await syncDeviceNow(deviceId);
    if (!result.status) {
      setSyncingDeviceIds((prev) => {
        const next = new Set(prev);
        next.delete(deviceId);
        return next;
      });

      if (result.statusCode === 409) {
        setSnackbarMessage(result.message || `Sync is already in progress for device ${deviceId}.`);
        setSnackbarSeverity('warning');
      } else {
        setSnackbarMessage(result.message || `Failed to trigger sync for device ${deviceId}.`);
        setSnackbarSeverity('error');
      }
      setSnackbarOpen(true);
    } else {
      setSnackbarMessage(`Sync initiated for device ${deviceId}. Live status will update below.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  const handleToggleActive = async (deviceId: number, newActiveState: boolean) => {
    // Optimistic state update across page & table
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, isActive: newActiveState } : d))
    );

    const success = newActiveState
      ? await enableDeviceSync(deviceId)
      : await disableDeviceSync(deviceId);

    if (success) {
      setSnackbarMessage(`Device ${deviceId} is now ${newActiveState ? 'Active' : 'Inactive'}.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } else {
      // Revert optimistic update on failure
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, isActive: !newActiveState } : d))
      );
      setSnackbarMessage(`Failed to update active state for device ${deviceId}.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const handleExport = () => {
    const data = (devices ?? []).map(device => ({
      ID: device.id,
      Name: device.name,
      'Serial No': device.serialNumber,
      'Consumer No': device.consumerNumber,
      Status: device.isActive ? 'Active' : 'Inactive',
      IP: device.ip,
      Port: device.port,
      'Created Date': device.createdDate || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');
    XLSX.writeFile(workbook, 'devices.xlsx');
  };

  return (
    <div aria-busy={!!loading}>
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
          {isVisible ? (
            <DevicesFilters
              show={isVisible}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : <Box />}
          {isVisible && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <div>
                <Button
                  startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                  variant="contained"
                  onClick={() => toggleVisibility(null)}
                >
                  Add
                </Button>
              </div>
              <div>
                <Button
                  startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
                  variant="contained"
                  onClick={handleExport}
                >
                  Export
                </Button>
              </div>
            </Stack>
          )}
        </Stack>
        <DevicesTable
          show={isVisible}
          count={totalRows}
          page={page}
          rows={paginatedDevices}
          rowsPerPage={rowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSyncNow={handleSyncNow}
          onToggleActive={handleToggleActive}
          syncingDeviceIds={syncingDeviceIds}
        />
        <AddDeviceForm
          show={!isVisible}
          onToggleVisibility={toggleVisibility}
          editingDevice={editingDevice}
          setEditingDevice={setEditingDevice}
        />
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          onClose={handleSnackbarClose}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
export const metadata: Metadata = { title: 'Devices | Dashboard' };
//export const metadata = { title: `Devices | Dashboard | ${config.site.name}` } satisfies Metadata;

// export default function Page(): React.JSX.Element {
//     const [isVisible, setIsVisible] = useState(true);
//     const [devices, setDevices] = useState<Device[]>([]);
//     const [editingDevice, setEditingDevice] = useState<Device | null>(null);
//     const page = 0;
//     const rowsPerPage = 10;

//     useEffect(() => {
//         const loadDevices = async () => {
//             const fetchedDevices = await fetchDevices();
//             setDevices(fetchedDevices);
//         };
//         loadDevices();
//     }, []);

//     const totalRows = devices.length;
//     const paginatedDevices = applyPagination(devices, page, rowsPerPage);

//     // const toggleVisibility = () => {
//     //     setIsVisible((prev) => !prev);
//     // };
//     const toggleVisibility = (device: Device | null = null) => {
//         setIsVisible((prev) => !prev);
//         // setEditingDevice(device);
//     };

//     const handleEdit = (deviceId: string) => {
//         const device = devices.find((d) => d.id === deviceId) || null;
//         toggleVisibility(device);
//         setEditingDevice(device);
//     };

//     const handleDelete = async(deviceId: string) => {
//         const device = devices.find((d) => d.id === deviceId) || null;
//         // toggleVisibility(device);
//         // setEditingDevice(device);
//         const response = await deleteDevice(device);
//     };

//     const handleExport = () => {
//         // Map devices to a format suitable for Excel
//         const data = devices.map(device => ({
//             ID: device.id,
//             Name: device.name,
//             'Serial No': device.serialNo,
//             'Consumer No': device.consumerNo,
//             'FTP Folder': device.ftpFolder,
//             Status: device.isActive ? 'Active' : 'Inactive',
//             IP: device.ip,
//             Port: device.port,
//             'Created Date': device.createdDate || '',
//         }));

//         // Create a new workbook and worksheet
//         const worksheet = XLSX.utils.json_to_sheet(data);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');

//         // Generate and download the Excel file
//         XLSX.writeFile(workbook, 'devices.xlsx');
//     };

//     return (
//         <Stack spacing={3}>
//             <Stack>
//                 <Stack direction="row" spacing={3}>
//                     <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
//                         <Typography variant="h4">Devices</Typography>
//                     </Stack>
//                     {isVisible && (
//                         <>
//                             <div>
//                                 <Button
//                                     startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
//                                     variant="contained"
//                                     onClick={toggleVisibility}
//                                 >
//                                     Add
//                                 </Button>
//                             </div>
//                             <div>
//                                 <Button
//                                     startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
//                                     variant="contained"
//                                     onClick={handleExport}
//                                 >
//                                     Export
//                                 </Button>
//                             </div>
//                         </>
//                     )}
//                 </Stack>
//                 <DevicesFilters show={isVisible} />
//                 <DevicesTable
//                     show={isVisible}
//                     count={totalRows}
//                     page={page}
//                     rows={paginatedDevices}
//                     rowsPerPage={rowsPerPage}
//                     onEdit={handleEdit}
//                     onDelete={handleDelete}
//                 />
//             </Stack>
//             <Stack>
//                 <AddDeviceForm
//                     show={!isVisible}
//                     onToggleVisibility={toggleVisibility}
//                     editingDevice={editingDevice}
//                     setEditingDevice={setEditingDevice}
//                 />
//             </Stack>
//         </Stack>
//     );
// }


