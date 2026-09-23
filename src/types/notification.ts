export interface Notification {
  id: number;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface CreateNotification {
  userId: number;
  title: string;
  message: string;
  type?: string;
}