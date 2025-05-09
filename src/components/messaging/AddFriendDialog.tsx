
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FriendRequest } from "@/types/pokemon";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AddFriendDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: () => void;
}

const AddFriendDialog: React.FC<AddFriendDialogProps> = ({
  isOpen,
  onClose,
  onFriendAdded
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  
  const userType = localStorage.getItem("userType");
  const userId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const userName = userType === "teacher" ? 
    localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") : 
    localStorage.getItem("studentName");
  
  useEffect(() => {
    if (isOpen) {
      loadPendingRequests();
    }
  }, [isOpen]);
  
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
      
      // Add avatar and display name if available
      return {
        ...request,
        senderAvatar: senderDetails?.avatar,
        senderDisplayName: senderDetails?.displayName || request.senderName
      };
    });
    
    setPendingRequests(requestsWithDetails);
  };
  
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    
    // Don't show the current user
    const teacherResults = teachers
      .filter((t: any) => 
        t.id !== userId && 
        (t.username.toLowerCase().includes(term) || 
        (t.displayName && t.displayName.toLowerCase().includes(term)))
      )
      .map((t: any) => ({
        id: t.id,
        name: t.displayName || t.username,
        username: t.username,
        avatar: t.avatar,
        type: "teacher"
      }));
    
    const studentResults = students
      .filter((s: any) => 
        s.id !== userId && 
        (s.username.toLowerCase().includes(term) || 
        (s.displayName && s.displayName.toLowerCase().includes(term)) ||
        (s.name && s.name.toLowerCase().includes(term)))
      )
      .map((s: any) => ({
        id: s.id,
        name: s.displayName || s.name,
        username: s.username,
        avatar: s.avatar,
        type: "student"
      }));
    
    setSearchResults([...teacherResults, ...studentResults]);
  };
  
  const checkExistingRequest = (otherUserId: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    
    // Check if there's an existing request in either direction
    return allRequests.find(request => 
      (request.senderId === userId && request.receiverId === otherUserId) ||
      (request.receiverId === userId && request.senderId === otherUserId)
    );
  };
  
  const handleSendRequest = (user: any) => {
    if (!userId || !userName) return;
    
    // Check if already friends or a request is pending
    const existingRequest = checkExistingRequest(user.id);
    
    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        toast({
          title: t("already-friends"),
          description: t("already-friends-description"),
        });
      } else {
        toast({
          title: t("request-exists"),
          description: existingRequest.senderId === userId 
            ? t("request-already-sent")
            : t("request-already-received"),
        });
      }
      return;
    }
    
    // Create new friend request
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      senderId: userId,
      senderType: userType as "teacher" | "student",
      senderName: userName,
      receiverId: user.id,
      receiverType: user.type,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Add to localStorage
    const allRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    allRequests.push(newRequest);
    localStorage.setItem("friendRequests", JSON.stringify(allRequests));
    
    toast({
      title: t("request-sent"),
      description: t("request-sent-description"),
    });
    
    // Reset search
    setSearchTerm("");
    setSearchResults([]);
  };
  
  const handleAcceptRequest = (requestId: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const updatedRequests = allRequests.map(request => 
      request.id === requestId ? { ...request, status: "accepted" } : request
    );
    
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
    
    toast({
      title: t("request-accepted"),
      description: t("request-accepted-description"),
    });
    
    // Refresh requests
    loadPendingRequests();
    onFriendAdded();
  };
  
  const handleRejectRequest = (requestId: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const updatedRequests = allRequests.map(request => 
      request.id === requestId ? { ...request, status: "rejected" } : request
    );
    
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
    
    toast({
      title: t("request-rejected"),
      description: t("request-rejected-description"),
    });
    
    // Refresh requests
    loadPendingRequests();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("add-friends")}</DialogTitle>
          <DialogDescription>
            {t("add-friends-description")}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t("search")}</TabsTrigger>
            <TabsTrigger value="requests">
              {t("requests")}
              {pendingRequests.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="mt-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={t("search-by-name-or-username")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch}>{t("search")}</Button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name?.substring(0, 2).toUpperCase() || "NA"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username} • {user.type}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user)}
                    >
                      {t("send-request")}
                    </Button>
                  </div>
                ))
              ) : searchTerm ? (
                <p className="text-center py-4 text-gray-500">{t("no-results")}</p>
              ) : (
                <p className="text-center py-4 text-gray-500">{t("search-prompt")}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-4">
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
                        <p className="text-xs text-gray-500">{request.senderType}</p>
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
                <p className="text-center py-4 text-gray-500">{t("no-pending-requests")}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendDialog;
