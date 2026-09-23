import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";

interface NotificationProps {
  userId: number;
}

export default function Notification({
  userId,
}: NotificationProps) {
  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(null);

  const [activeTab, setActiveTab] =
    useState<"all" | "unread">("all");

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(userId);

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const displayedNotifications =
    activeTab === "unread"
      ? notifications.filter(
          (notification) => !notification.isRead
        )
      : notifications;

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ width: 360, maxHeight: 500 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ p: 2 }}
          >
            <Typography fontWeight={600}>
              Notifications
            </Typography>

            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Stack>

          <Divider />

          {/* All / Unread */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ px: 2, py: 1 }}
          >
            <Button
              size="small"
              variant={
                activeTab === "all"
                  ? "contained"
                  : "text"
              }
              onClick={() => setActiveTab("all")}
            >
              All
            </Button>

            <Button
              size="small"
              variant={
                activeTab === "unread"
                  ? "contained"
                  : "text"
              }
              onClick={() => setActiveTab("unread")}
            >
              Unread
            </Button>
          </Stack>

          <Divider />

          <Box
            sx={{
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            {loading ? (
              <Typography sx={{ p: 2 }}>
                Loading...
              </Typography>
            ) : displayedNotifications.length === 0 ? (
              <Typography
                sx={{ p: 3 }}
                color="text.secondary"
                textAlign="center"
              >
                No notifications
              </Typography>
            ) : (
              displayedNotifications.map(
                (notification) => (
                  <Box
                    key={notification.id}
                    onClick={() =>
                      !notification.isRead &&
                      markAsRead(notification.id)
                    }
                    sx={{
                      p: 2,
                      cursor: notification.isRead
                        ? "default"
                        : "pointer",
                      backgroundColor:
                        notification.isRead
                          ? "transparent"
                          : "action.hover",
                      "&:hover": {
                        backgroundColor:
                          "action.selected",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={
                        notification.isRead
                          ? 400
                          : 600
                      }
                    >
                      {notification.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {notification.message}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                )
              )
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}