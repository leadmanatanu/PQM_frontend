import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';

export interface DeviceStatusUpdate {
  deviceId: number;
  status: string; // Online, Offline, Error, Syncing
  lastSync?: string;
  lastError?: string;
}

// Singleton state and connection variables shared by all hooks
let globalConnection: HubConnection | null = null;
let isStarting = false;
const listeners = new Set<(update: DeviceStatusUpdate) => void>();
let globalStatuses: Record<number, { status: string; lastSync?: string; lastError?: string }> = {};

function startGlobalConnection() {
  if (!globalConnection) {
    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5135';
    const HUB_URL = `${apiBase}/hubs/device`;

    globalConnection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    globalConnection.on('DeviceStatusChanged', (update: any) => {
      const deviceId = update.deviceId ?? update.DeviceId;
      const status = update.status ?? update.Status;
      const lastSync = update.lastSync ?? update.LastSync;
      const lastError = update.lastError ?? update.LastError;

      if (deviceId === undefined || deviceId === null) return;

      const normalizedUpdate: DeviceStatusUpdate = {
        deviceId,
        status: status ?? 'Offline',
        lastSync,
        lastError,
      };

      globalStatuses = {
        ...globalStatuses,
        [normalizedUpdate.deviceId]: {
          status: normalizedUpdate.status,
          lastSync: normalizedUpdate.lastSync,
          lastError: normalizedUpdate.lastError,
        },
      };

      listeners.forEach((listener) => listener(normalizedUpdate));
    });
  }

  if (globalConnection.state === HubConnectionState.Disconnected && !isStarting) {
    isStarting = true;
    globalConnection
      .start()
      .then(() => {
        isStarting = false;
      })
      .catch((err) => {
        isStarting = false;
        console.error('SignalR: Error establishing connection to DeviceHub:', err);
      });
  }
}

export function useDeviceStatus() {
  const [statuses, setStatuses] = useState<Record<number, { status: string; lastSync?: string; lastError?: string }>>(globalStatuses);

  useEffect(() => {
    startGlobalConnection();

    // Sync state on mount
    setStatuses(globalStatuses);

    const listener = () => {
      setStatuses({ ...globalStatuses });
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return statuses;
}

