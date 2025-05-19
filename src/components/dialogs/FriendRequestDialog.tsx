
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";

interface FriendRequest {
  id: string;
  senderId: string;
  senderType: string;
  senderName?: string;
  senderAvatar?: string;
  receiverId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface FriendRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FriendRequestDialog: React.FC<FriendRequestDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  const currentUserId = localStorage.getItem("studentId") || localStorage.getItem("teacherId");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (open) {
      loadFriendRequests();
    }
  }, [open]);

  const loadFriendRequests = () => {
    try {
      const storedRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      const pendingRequests = storedRequests.filter(
        (req: FriendRequest) => 
          req.receiverId === currentUserId && 
          req.status === "pending"
      );
      
      // Enrich requests with sender info
      const enrichedRequests = pendingRequests.map((req: FriendRequest) => {
        // Get sender info from localStorage for demo purposes
        // In a real app, this would be a database query
        if (req.senderType === "student") {
          const students = JSON.parse(localStorage.getItem("students") || "[]");
          const sender = students.find((s: any) => s.id === req.senderId);
          if (sender) {
            return {
              ...req,
              senderName: sender.displayName || sender.display_name || sender.username,
              senderAvatar: sender.avatar
            };
          }
        } else if (req.senderType === "teacher") {
          const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
          const sender = teachers.find((t: any) => t.id === req.senderId);
          if (sender) {
            return {
              ...req,
              senderName: sender.displayName || sender.display_name || sender.username,
              senderAvatar: sender.avatar
            };
          }
        }
        return req;
      });
      
      setRequests(enrichedRequests);
    } catch (error) {
      console.error("Error loading friend requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // First search in the database
      const { data: dbResults, error } = await supabase
        .from('students')
        .select('id, username, display_name')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);
        
      if (error) {
        console.error("Error searching students:", error);
      }
      
      let results = dbResults || [];
      
      // Also search in localStorage for demo/legacy support
      try {
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const localResults = students.filter((s: any) => 
          s.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (s.displayName && s.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        
        // Merge results, avoiding duplicates
        const dbIds = new Set(results.map((r: any) => r.id));
        const mergedResults = [
          ...results, 
          ...localResults
            .filter((r: any) => !dbIds.has(r.id))
            .map((s: any) => ({
              id: s.id,
              username: s.username,
              display_name: s.displayName || s.display_name || s.username
            }))
        ];
        
        // Filter out current user
        results = mergedResults.filter((r: any) => r.id !== currentUserId);
      } catch (e) {
        console.error("Error searching localStorage:", e);
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No matches found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error during search");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = (userId: string, displayName: string) => {
    try {
      // Check if request already exists
      const existingRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      const exists = existingRequests.some(
        (req: FriendRequest) => 
          req.senderId === currentUserId && 
          req.receiverId === userId &&
          req.status === "pending"
      );
      
      if (exists) {
        toast.info("Friend request already sent");
        return;
      }
      
      // Create new request
      const newRequest: FriendRequest = {
        id: `fr-${Date.now()}`,
        senderId: currentUserId!,
        senderType: userType!,
        receiverId: userId,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      existingRequests.push(newRequest);
      localStorage.setItem("friendRequests", JSON.stringify(existingRequests));
      
      toast.success(`Friend request sent to ${displayName}`);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    try {
      const allRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      const updatedRequests = allRequests.map((req: FriendRequest) => {
        if (req.id === requestId) {
          return { ...req, status: "accepted" };
        }
        return req;
      });
      
      localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
      
      // Update the UI
      setRequests(requests.filter(req => req.id !== requestId));
      
      toast.success("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = (requestId: string) => {
    try {
      const allRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      const updatedRequests = allRequests.map((req: FriendRequest) => {
        if (req.id === requestId) {
          return { ...req, status: "rejected" };
        }
        return req;
      });
      
      localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
      
      // Update the UI
      setRequests(requests.filter(req => req.id !== requestId));
      
      toast.success("Friend request rejected");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add-friends") || "Add Friends"}</DialogTitle>
          <DialogDescription>
            {t("add-friends-description") || "Find and connect with other students and teachers"}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t("search") || "Search"}</TabsTrigger>
            <TabsTrigger value="requests">{t("requests") || "Requests"}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder={t("search-by-username") || "Search by username"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {t("search") || "Search"}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-800 font-bold">
                          {(result.display_name || result.username || "").substring(0, 2).toUpperCase()}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-medium">{result.display_name || result.username}</p>
                        <p className="text-sm text-gray-500">{result.username}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSendFriendRequest(result.id, result.display_name || result.username)}
                    >
                      {t("add") || "Add"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {isLoading ? t("searching") || "Searching..." : searchQuery ? t("no-results") || "No results found" : t("search-to-find-friends") || "Search to find friends"}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        {request.senderAvatar ? (
                          <img src={request.senderAvatar} alt={request.senderName} />
                        ) : (
                          <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-800 font-bold">
                            {(request.senderName || "").substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.senderName || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{request.senderType}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        {t("reject") || "Reject"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        {t("accept") || "Accept"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {t("no-pending-requests") || "No pending friend requests"}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-center">
          <Button 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            {t("close") || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestDialog;
