import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

import { apiClient } from "./api-client";

const apiBaseUrl = apiClient.defaults.baseURL;

if (!apiBaseUrl) {
  throw new Error("API base URL is not configured");
}

const serverUrl = apiBaseUrl.replace(/\/api\/?$/, "");
const HUB_URL = `${serverUrl}/hubs/notificationHub`;

class NotificationHubService {
  private connection: HubConnection | null = null;
  private startPromise: Promise<void> | null = null;

  private getConnection(): HubConnection {
    if (!this.connection) {
      this.connection = new HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      this.connection.onreconnecting((error) => {
        console.warn("Notification SignalR reconnecting...", error);
      });

      this.connection.onreconnected(() => {
        console.log("Notification SignalR reconnected");
      });

      this.connection.onclose((error) => {
        console.warn("Notification SignalR connection closed", error);
      });
    }

    return this.connection;
  }

  async start(): Promise<void> {
    const connection = this.getConnection();

    if (connection.state === HubConnectionState.Connected) {
      return;
    }

    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = connection
      .start()
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }
}

export const notificationHub = new NotificationHubService();