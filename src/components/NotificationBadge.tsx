import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: string;
  link?: string;
}

const NotificationBadge: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Load notifications from localStorage
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (error) {
        console.error("Error parsing notifications:", error);
        setNotifications([]);
      }
    } else {
      // Demo notifications for testing
      const demoNotifications = [
        {
          id: "1",
          title: t("new-pokemon-available"),
          message: t("new-pokemon-message"),
          read: false,
          date: new Date().toISOString(),
        },
        {
          id: "2",
          title: t("welcome"),
          message: t("welcome-message"),
          read: true,
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
      ];
      setNotifications(demoNotifications);
      localStorage.setItem("notifications", JSON.stringify(demoNotifications));
    }
  }, [t]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    
    // If has link, navigate
    if (notification.link) {
      window.location.href = notification.link;
    } else {
      // Otherwise show dialog
      setSelectedNotification(notification);
      setIsDialogOpen(true);
    }
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
    toast(t("notifications-cleared"));
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">{t("notifications")}</h3>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllNotifications}
                className="text-xs"
              >
                {t("clear-all")}
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {t("no-notifications")}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Notification Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p>{selectedNotification?.message}</p>
            <p className="text-xs text-gray-400 mt-4">
              {selectedNotification ? formatDate(selectedNotification.date) : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationBadge;
