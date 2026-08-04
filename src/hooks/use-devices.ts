import * as React from 'react';
import type { Device } from '../components/dashboard/device/devices-table';
import * as deviceService from '../services/device.service';

export function useDevices() {
  const [devices, setDevices] = React.useState<Device[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDevices = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await deviceService.fetchDevices();
      setDevices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const addDevice = async (device: Device) => {
    setLoading(true);
    try {
      const result = await deviceService.addDevice(device);
      await fetchDevices();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to add device');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editDevice = async (device: Device) => {
    setLoading(true);
    try {
      const result = await deviceService.editDevice(device);
      await fetchDevices();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to edit device');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    reload: fetchDevices,
    addDevice,
    editDevice,
  };
}