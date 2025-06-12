import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
  type: string;
}
const NotificationBadge: React.FC = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const teacherId = localStorage.getItem("teacherId");
  const studentId = localStorage.getItem("studentId");
  const currentUserId = teacherId || studentId;
  const userType = localStorage.getItem("userType");

  // Load notifications from Supabase
  const loadNotifications = async () => {
    if (!currentUserId) return;
    try {
      console.log("Loading notifications for user:", currentUserId, "type:", userType);
      const {
        data,
        error
      } = await supabase.from('notifications').select('*').eq('recipient_id', currentUserId).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error("Error loading notifications:", error);
        return;
      }
      console.log("Loaded notifications:", data);
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup realtime subscription for notifications
  useEffect(() => {
    if (currentUserId) {
      loadNotifications();
      console.log("Setting up realtime subscription for notifications");
      // Subscribe to new notifications
      const channel = supabase.channel('notifications-realtime').on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${currentUserId}`
      }, payload => {
        console.log("New notification received:", payload.new);
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);

        // Show toast for new notification
        toast(newNotification.title, {
          description: newNotification.message
        });
      }).on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${currentUserId}`
      }, payload => {
        console.log("Notification updated:", payload.new);
        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new as Notification : n));
      }).subscribe();
      return () => {
        console.log("Cleaning up notification subscription");
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId]);
  const unreadCount = notifications.filter(n => !n.read).length;
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        const {
          error
        } = await supabase.from('notifications').update({
          read: true
        }).eq('id', notification.id);
        if (!error) {
          setNotifications(prev => prev.map(n => n.id === notification.id ? {
            ...n,
            read: true
          } : n));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    console.log("Handling notification click:", notification.type, "User type:", userType);

    // Handle navigation based on notification type and user type
    if (notification.type === 'homework_update' && userType === 'teacher') {
      // Navigate to teacher dashboard homework tab
      navigate('/teacher-dashboard');
      setTimeout(() => {
        const event = new CustomEvent('switchToHomeworkTab');
        window.dispatchEvent(event);
      }, 100);
    } else if (notification.type === 'homework_update' && userType === 'student') {
      // Navigate to student dashboard homework tab
      navigate('/student-dashboard');
      setTimeout(() => {
        const event = new CustomEvent('switchToHomeworkTab');
        window.dispatchEvent(event);
      }, 100);
    } else if (notification.type === 'homework_submission' && userType === 'teacher') {
      // Navigate to teacher dashboard and open homework review
      navigate('/teacher-dashboard');
      setTimeout(() => {
        const event = new CustomEvent('switchToHomeworkTab');
        window.dispatchEvent(event);
      }, 100);
    } else if (notification.type === 'coin_award' || notification.type === 'coin_removal') {
      // Navigate to appropriate dashboard
      if (userType === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/teacher-dashboard');
      }
    } else if (notification.type === 'pokemon_award' || notification.type === 'pokemon_removal') {
      // Navigate to Pokemon collection
      if (userType === 'student') {
        navigate('/student-dashboard');
        setTimeout(() => {
          const event = new CustomEvent('openPokemonTab');
          window.dispatchEvent(event);
        }, 100);
      } else {
        navigate('/teacher-dashboard');
      }
    } else if (notification.type === 'friend_request' || notification.type === 'friend_accepted') {
      // Navigate to messages or friends page
      navigate('/messages');
    } else if (notification.type === 'class_share_request') {
      // Navigate to shared classes management
      navigate('/teacher-dashboard');
      setTimeout(() => {
        const event = new CustomEvent('switchToSharedClassesTab');
        window.dispatchEvent(event);
      }, 100);
    } else if (notification.link) {
      // Use the provided link
      navigate(notification.link);
    } else {
      // Otherwise show dialog
      setSelectedNotification(notification);
      setIsDialogOpen(true);
    }
  };
  const markAllAsRead = async () => {
    if (!currentUserId) return;
    try {
      const {
        error
      } = await supabase.from('notifications').update({
        read: true
      }).eq('recipient_id', currentUserId).eq('read', false);
      if (!error) {
        setNotifications(prev => prev.map(n => ({
          ...n,
          read: true
        })));
        toast("All notifications marked as read");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  const clearAllNotifications = async () => {
    if (!currentUserId) return;
    try {
      const {
        error
      } = await supabase.from('notifications').delete().eq('recipient_id', currentUserId);
      if (!error) {
        setNotifications([]);
        toast("Notifications cleared");
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative bg-zinc-300 hover:bg-zinc-200">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-medium">{t("notifications")}</h3>
            {notifications.length > 0 && <div className="flex gap-2">
                {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                    Mark Read
                  </Button>}
                <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-xs">
                  Clear All
                </Button>
              </div>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? <div className="p-8 text-center text-gray-500">
                Loading notifications...
              </div> : notifications.length > 0 ? <div>
                {notifications.map(notification => <div key={notification.id} className={`p-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? "bg-blue-50" : ""}`} onClick={() => handleNotificationClick(notification)}>
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>)}
              </div> : <div className="p-8 text-center text-gray-500">
                No notifications
              </div>}
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
              {selectedNotification ? formatDate(selectedNotification.created_at) : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>;
};
export default NotificationBadge;