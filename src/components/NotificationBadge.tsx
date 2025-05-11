import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendRequest } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "@/components/ui/toast";

const NotificationBadge: React.FC = () => {
  const { t } = useTranslation();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  
  const userType = localStorage.getItem("userType");
  const userId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  
  useEffect(() => {
    loadPendingRequests();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingRequests, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadPendingRequests = () => {
    if (!userId) return;
    
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const pending = allRequests.filter(request => 
      request.status === "pending" && 
      request.receiverId === userId
    );
    
    // Get sender details
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    
    const requestsWithDetails = pending.map(request => {
      // Find the sender
      let senderDetails;
      if (request.senderType === "teacher") {
        senderDetails = teachers.find((t: any) => t.id === request.senderId);
      } else {
        senderDetails = students.find((s: any) => s.id === request.senderId);
      }
      
      return {
        ...request,
        senderAvatar: senderDetails?.avatar,
        senderDisplayName: senderDetails?.displayName || request.senderName
      };
    });
    
    setPendingRequests(requestsWithDetails);
  };
  
  const handleAcceptRequest = (requestId: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const updatedRequests = allRequests.map(request => 
      request.id === requestId ? { ...request, status: "accepted" } : request
    );
    
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
    
    // Refresh the pending requests
    loadPendingRequests();
  };
  
  const handleRejectRequest = (requestId: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const updatedRequests = allRequests.map(request => 
      request.id === requestId ? { ...request, status: "rejected" } : request
    );
    
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
    
    // Refresh the pending requests
    loadPendingRequests();
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {pendingRequests.length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium">{t("notifications")}</h4>
          <p className="text-sm text-gray-500">
            {pendingRequests.length > 0 
              ? t("friend-requests-pending", { count: pendingRequests.length }) 
              : t("no-notifications")}
          </p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.senderAvatar} />
                    <AvatarFallback>
                      {request.senderDisplayName?.substring(0, 2).toUpperCase() || "NA"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.senderDisplayName}</p>
                    <p className="text-xs text-gray-500">{t("sent-friend-request")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    {t("accept")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    {t("reject")}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>{t("no-pending-requests")}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBadge;
