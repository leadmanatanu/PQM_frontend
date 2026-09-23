import { apiClient, ApiResponse } from "./api-client";
import {
  Notification,
  CreateNotification,
} from "../types/notification";

export const getNotifications = async (
  userId: number
): Promise<Notification[]> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Notification[]>>(
      `/notification/GetAll/${userId}`
    );

    return data.data ?? [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const getUnreadCount = async (
  userId: number
): Promise<number> => {
  try {
    const { data } = await apiClient.get<ApiResponse<number>>(
      `/notification/GetUnreadCount/${userId}`
    );

    return data.data ?? 0;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

export const getNotificationById = async (
  id: number,
  userId: number
): Promise<Notification | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Notification>>(
      `/notification/GetById/${id}/${userId}`
    );

    return data.data ?? null;
  } catch (error) {
    console.error("Error fetching notification:", error);
    return null;
  }
};

export const addNotification = async (
  notification: CreateNotification
): Promise<Notification | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Notification>>(
      "/notification/Add",
      notification
    );

    return data.data ?? null;
  } catch (error) {
    console.error("Error adding notification:", error);
    return null;
  }
};

export const markAsRead = async (
  id: number,
  userId: number
): Promise<boolean> => {
  try {
    const { data } = await apiClient.put<ApiResponse<boolean>>(
      `/notification/MarkAsRead/${id}/${userId}`
    );

    return data.data ?? false;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

export const markAllAsRead = async (
  userId: number
): Promise<boolean> => {
  try {
    const { data } = await apiClient.put<ApiResponse<boolean>>(
      `/notification/MarkAllAsRead/${userId}`
    );

    return data.data ?? false;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};