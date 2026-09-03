"use client";

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import type { Metadata } from 'next';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import { AddDeviceForm } from '../../../components/dashboard/device/add-device-form';
import { DevicesFilters } from '../../../components/dashboard/device/devices-filters';
import { DevicesTable } from '../../../components/dashboard/device/devices-table';

import type { Device } from '../../../components/dashboard/device/devices-table';

import {
  deleteDevice,
  disableDeviceSync,
  enableDeviceSync,
  fetchDevices,
  syncDeviceNow
} from '../../../api/device';

import * as XLSX from 'xlsx';


function applyPagination(
  rows: Device[],
  page: number,
  rowsPerPage: number
): Device[] {
  return rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
}


export default function Page(): React.JSX.Element {

  const [isVisible, setIsVisible] = useState(true);

  const [devices, setDevices] = useState<Device[]>([]);

  const [editingDevice, setEditingDevice] =
    useState<Device | null>(null);

  const [loading, setLoading] =
    useState<'fetch' | null>('fetch');

  const [syncingDeviceIds, setSyncingDeviceIds] =
    useState<Set<number>>(new Set());

  const [snackbarOpen, setSnackbarOpen] =
    useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    useState('');

  const [snackbarSeverity, setSnackbarSeverity] =
    useState<'success' | 'error' | 'warning'>('success');

  const page = 0;
  const rowsPerPage = 10;


  // ---------------------------------------------------------
  // Fetch devices
  // ---------------------------------------------------------

  const loadDevices = async () => {

    setLoading('fetch');

    try {

      const fetchedDevices = await fetchDevices();

      setDevices(fetchedDevices ?? []);

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


  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------

  const [searchQuery, setSearchQuery] =
    useState('');


  const filteredDevices =
    (devices ?? []).filter((device) => {

      if (!searchQuery.trim()) {
        return true;
      }

      const q = searchQuery
        .toLowerCase()
        .trim();

      return (
        device.name?.toLowerCase().includes(q) ||
        device.serialNumber?.toLowerCase().includes(q) ||
        device.consumerNumber?.toLowerCase().includes(q) ||
        device.ip?.toLowerCase().includes(q)
      );

    });


  // ---------------------------------------------------------
  // Pagination
  // ---------------------------------------------------------

  const totalRows =
    filteredDevices.length;

  const paginatedDevices =
    applyPagination(
      filteredDevices,
      page,
      rowsPerPage
    );


  // ---------------------------------------------------------
  // Toggle Add/Edit form
  // ---------------------------------------------------------

  const toggleVisibility = async (
    device: Device | null = null
  ) => {

    setIsVisible((prev) => !prev);

    setEditingDevice(device);

    await loadDevices();

  };


  // ---------------------------------------------------------
  // Edit device
  // ---------------------------------------------------------

  const handleEdit = (
    deviceId: number
  ) => {

    const device =
      (devices ?? []).find(
        (d) => d.id === deviceId
      ) || null;

    setIsVisible(false);

    setEditingDevice(device);

  };


  // ---------------------------------------------------------
  // Delete device
  // ---------------------------------------------------------

  const handleDelete = async (
    deviceId: number
  ) => {

    try {

      const res =
        await deleteDevice(deviceId);

      if (res && res.status) {

        setDevices((prev) =>
          prev.filter(
            (d) => d.id !== deviceId
          )
        );

        setSnackbarMessage(
          `Device ${deviceId} soft-deleted successfully.`
        );

        setSnackbarSeverity('success');
        setSnackbarOpen(true);

      } else {

        setSnackbarMessage(
          `Failed to delete device ${deviceId}.`
        );

        setSnackbarSeverity('error');
        setSnackbarOpen(true);

      }

    } catch (err) {

      setSnackbarMessage(
        `Error deleting device: ${err}`
      );

      setSnackbarSeverity('error');
      setSnackbarOpen(true);

    }

  };


  // ---------------------------------------------------------
  // Sync device now
  // ---------------------------------------------------------

  const handleSyncNow = async (
    deviceId: number
  ) => {

    setSyncingDeviceIds((prev) =>
      new Set(prev).add(deviceId)
    );

    try {

      const result =
        await syncDeviceNow(deviceId);

      if (!result.status) {

        setSyncingDeviceIds((prev) => {

          const next =
            new Set(prev);

          next.delete(deviceId);

          return next;

        });


        if (result.statusCode === 409) {

          setSnackbarMessage(
            result.message ||
            `Sync is already in progress for device ${deviceId}.`
          );

          setSnackbarSeverity('warning');

        } else {

          setSnackbarMessage(
            result.message ||
            `Failed to trigger sync for device ${deviceId}.`
          );

          setSnackbarSeverity('error');

        }

        setSnackbarOpen(true);

      } else {

        setSnackbarMessage(
          `Sync initiated for device ${deviceId}. Live status will update below.`
        );

        setSnackbarSeverity('success');
        setSnackbarOpen(true);

      }

    } catch (error) {

      console.error(
        `Failed to sync device ${deviceId}:`,
        error
      );

      setSyncingDeviceIds((prev) => {

        const next =
          new Set(prev);

        next.delete(deviceId);

        return next;

      });

      setSnackbarMessage(
        `Failed to sync device ${deviceId}.`
      );

      setSnackbarSeverity('error');
      setSnackbarOpen(true);

    }

  };


  // ---------------------------------------------------------
  // Toggle device active state
  // ---------------------------------------------------------

  const handleToggleActive = async (
    deviceId: number,
    newActiveState: boolean
  ) => {

    // Optimistic update

    setDevices((prev) =>
      prev.map((d) =>
        d.id === deviceId
          ? {
              ...d,
              isActive: newActiveState
            }
          : d
      )
    );


    const success =
      newActiveState
        ? await enableDeviceSync(deviceId)
        : await disableDeviceSync(deviceId);


    if (success) {

      setSnackbarMessage(
        `Device ${deviceId} is now ${
          newActiveState
            ? 'Active'
            : 'Inactive'
        }.`
      );

      setSnackbarSeverity('success');
      setSnackbarOpen(true);

    } else {

      // Revert optimistic update

      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                isActive: !newActiveState
              }
            : d
        )
      );

      setSnackbarMessage(
        `Failed to update active state for device ${deviceId}.`
      );

      setSnackbarSeverity('error');
      setSnackbarOpen(true);

    }

  };


  // ---------------------------------------------------------
  // Snackbar
  // ---------------------------------------------------------

  const handleSnackbarClose = () => {

    setSnackbarOpen(false);

    setSnackbarMessage('');

  };


  // ---------------------------------------------------------
  // Export devices
  // ---------------------------------------------------------

  const handleExport = () => {

    const data =
      (devices ?? []).map(
        (device) => ({

          ID: device.id,

          Name: device.name,

          'Serial No':
            device.serialNumber,

          'Consumer No':
            device.consumerNumber,

          Status:
            device.isActive
              ? 'Active'
              : 'Inactive',

          IP: device.ip,

          'Created Date':
            device.createdDate || ''

        })
      );


    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Devices'
    );

    XLSX.writeFile(
      workbook,
      'devices.xlsx'
    );

  };


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (

    <div>

      <Stack spacing={3}>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%'
          }}
        >

          {isVisible ? (

            <DevicesFilters
              show={isVisible}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
            />

          ) : (

            <Box />

          )}


          {isVisible && (

            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >

              <div>

                <Button
                  startIcon={
                    <PlusIcon
                      fontSize="var(--icon-fontSize-md)"
                    />
                  }
                  variant="contained"
                  onClick={() =>
                    toggleVisibility(null)
                  }
                >
                  Add
                </Button>

              </div>


              <div>

                <Button
                  startIcon={
                    <DownloadIcon
                      fontSize="var(--icon-fontSize-md)"
                    />
                  }
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
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >

        <Alert
          severity={snackbarSeverity}
          sx={{
            width: '100%'
          }}
          onClose={handleSnackbarClose}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>

      </Snackbar>

    </div>

  );

}


export const metadata: Metadata = {
  title: 'Devices | Dashboard'
};