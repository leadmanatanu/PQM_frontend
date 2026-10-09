import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../services/notification";
import { Notification } from "../types/notification";
import { deviceStatusHub } from "../services/deviceStatusHub";

export const useNotifications = (userId: number) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

const fetchNotifications = useCallback(async () => {
  if (!userId) return;

  setLoading(true);

  try {
    const [notificationData, count] = await Promise.all([
      getNotifications(userId),
      getUnreadCount(userId),
    ]);

    setNotifications((prev) => {
      const fetchedIds = new Set(
        notificationData.map((item) => item.id)
      );

      const newerNotifications = prev.filter(
        (item) => !fetchedIds.has(item.id)
      );

      return [...newerNotifications, ...notificationData];
    });

    setUnreadCount(count);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  } finally {
    setLoading(false);
  }
}, [userId]);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;

const unsubscribe = deviceStatusHub.onNotificationReceived(
  (incomingNotification) => {
    if (!isActive) return;

    const newNotification: Notification = {
      ...incomingNotification,
      isRead: false,
    };

    setNotifications((prev) => {
      if (prev.some((item) => item.id === newNotification.id)) {
        return prev;
      }

      return [newNotification, ...prev];
    });

    void fetchNotifications();
  }
);
    const initializeHub = async () => {
      try {
        await deviceStatusHub.start();

        if (!isActive) return;

        await deviceStatusHub.registerUser(userId);

        if (!isActive) return;

        console.log(
          "Notification SignalR registered for user:",
          userId
        );
      } catch (error) {
        console.error(
          "Failed to initialize notification SignalR:",
          error
        );
      }
    };

    void initializeHub();
    void fetchNotifications();

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [userId, fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    const notification = notifications.find((item) => item.id === id);

    if (!notification || notification.isRead) return;

    const success = await markAsRead(id, userId);

    if (success) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    const success = await markAllAsRead(userId);

    if (success) {
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );

      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
};