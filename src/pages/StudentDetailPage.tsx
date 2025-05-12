import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { UploadPhotos } from "@/components/profile/UploadPhotos";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft, MessageSquare, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FriendRequest } from "@/types/pokemon";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";

interface StudentData {
  id: string;
  username: string;
  displayName: string;
  teacherId: string;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  classId?: string;
}

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string, studentId?: string }>();
  const [student, setStudent] = useState<StudentData | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState<boolean>(false);
  const [friendRequestPending, setFriendRequestPending] = useState<boolean>(false);
  const [alreadyFriends, setAlreadyFriends] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<Partial<StudentData>>({});

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const userName = userType === "teacher" ?
    localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") :
    localStorage.getItem("studentName");
  
  // Use the ID from either parameter
  const actualStudentId = studentId || id;
  
  // Check if current user is the owner of this profile
  const isOwnProfile = userType === "student" && localStorage.getItem("studentId") === actualStudentId;

  useEffect(() => {
    if (actualStudentId) {
      loadStudentData(actualStudentId);
      checkFriendshipStatus(actualStudentId);
    }
  }, [actualStudentId]);
  
  const loadStudentData = (id: string) => {
    const studentsData = localStorage.getItem("students");
    if (studentsData) {
      const students = JSON.parse(studentsData);
      const foundStudent = students.find((s: StudentData) => s.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
        setEditData(foundStudent);
      } else {
        toast(t("student-not-found"));
        navigate(-1);
      }
    }
  };

  const checkFriendshipStatus = (targetId: string) => {
    if (!currentUserId) return;
    
    const friendRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    
    // Check if there's already a request sent
    const existingSentRequest = friendRequests.find(request => 
      request.senderId === currentUserId && 
      request.receiverId === targetId
    );
    
    if (existingSentRequest) {
      if (existingSentRequest.status === "pending") {
        setFriendRequestSent(true);
      } else if (existingSentRequest.status === "accepted") {
        setAlreadyFriends(true);
      }
    }
    
    // Check if there's a pending request received
    const existingReceivedRequest = friendRequests.find(request => 
      request.senderId === targetId && 
      request.receiverId === currentUserId &&
      request.status === "pending"
    );
    
    if (existingReceivedRequest) {
      setFriendRequestPending(true);
    }
    
    // Check if they're already friends (request accepted in either direction)
    const existingFriendship = friendRequests.find(request => 
      ((request.senderId === currentUserId && request.receiverId === targetId) ||
       (request.senderId === targetId && request.receiverId === currentUserId)) &&
      request.status === "accepted"
    );
    
    if (existingFriendship) {
      setAlreadyFriends(true);
    }
  };

  const handleAvatarUpdate = (newAvatar: string) => {
    // Update student data in localStorage
    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const studentIndex = students.findIndex((s: any) => s.id === actualStudentId);
    
    if (studentIndex !== -1) {
      students[studentIndex].avatar = newAvatar;
      localStorage.setItem("students", JSON.stringify(students));
      
      // Update component state
      setStudent({
        ...student!,
        avatar: newAvatar
      });
      
      toast("Avatar updated successfully!");
    }
  };

  const canEdit = userType === "teacher" || isOwnProfile;

  const handleSendMessage = () => {
    if (!student) return;
    
    // Navigate to messages page
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    
    // Store the selected contact in localStorage for the messages page to use
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
  };

  const handleFriendRequest = () => {
    if (!student || !currentUserId || !userName) return;
    
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType as "teacher" | "student",
      senderName: userName,
      receiverId: student.id,
      receiverType: "student",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Add to localStorage
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    allRequests.push(newRequest);
    localStorage.setItem("friendRequests", JSON.stringify(allRequests));
    
    setFriendRequestSent(true);
    
    toast(t("friend-request-sent"));
  };

  const handleAcceptFriendRequest = () => {
    if (!student || !currentUserId) return;
    
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const updatedRequests = allRequests.map(request => {
      if (request.senderId === student.id && request.receiverId === currentUserId && request.status === "pending") {
        return { ...request, status: "accepted" };
      }
      return request;
    });
    
    localStorage.setItem("friendRequests", JSON.stringify(updatedRequests));
    
    setFriendRequestPending(false);
    setAlreadyFriends(true);
    
    toast(t("friend-request-accepted"));
  };
  
  const handleSave = () => {
    if (!student) return;
    
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: any) => s.id === actualStudentId);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.displayName || student.displayName,
          avatar: editData.avatar || student.avatar
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        
        // Update the student in local state
        setStudent({
          ...student,
          displayName: editData.displayName || student.displayName,
          avatar: editData.avatar || student.avatar
        });
        
        // If this is the current logged-in student, update their name in localStorage
        if (isOwnProfile) {
          localStorage.setItem("studentName", editData.displayName || student.displayName);
        }
        
        setIsEditing(false);
        toast(t("profile-updated-successfully"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast(t("failed-to-save-profile"));
    }
  };
  
  const handleCancel = () => {
    setEditData(student || {});
    setIsEditing(false);
  };

  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar 
          userType={userType as "teacher" | "student"} 
          userName={userType === "teacher" ? localStorage.getItem("teacherDisplayName") || "Teacher" : localStorage.getItem("studentName") || ""}
        />
        <div className="container mx-auto py-8 px-4 text-center">
          <p>{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"}
        userName={userType === "teacher" ? 
          localStorage.getItem("teacherDisplayName") || "Teacher" : 
          localStorage.getItem("studentName") || ""}
      />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("student-profile")}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student Profile Sidebar */}
          <ProfileSidebar
            student={{
              id: student.id,
              displayName: student.displayName,
              username: student.username,
              avatar: student.avatar
            }}
            isOwner={isOwnProfile}
            isEditing={isEditing}
            friendRequestSent={friendRequestSent}
            onEditClick={() => setIsEditing(true)}
            onSendMessageClick={handleSendMessage}
            onAddFriendClick={friendRequestPending ? handleAcceptFriendRequest : handleFriendRequest}
            onSaveClick={handleSave}
            onCancelClick={handleCancel}
          />
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList className="mb-4">
                <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
                {isOwnProfile && <TabsTrigger value="settings">{t("settings")}</TabsTrigger>}
              </TabsList>
              
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("student-photos")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadPhotos 
                      avatarImage={student.avatar || null}
                      onSave={handleAvatarUpdate} 
                      readOnly={!canEdit || (isOwnProfile && !isEditing)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {isOwnProfile && (
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account-settings")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t("display-name")}:</label>
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editData.displayName || ""} 
                              onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                              className="w-full px-3 py-2 border rounded-md mt-1"
                            />
                          ) : (
                            <p>{student.displayName}</p>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">{t("username")}:</label>
                          <p>{student.username}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* Photo View Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>{t("photo")}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex items-center justify-center p-2">
              <img 
                src={selectedPhoto} 
                alt="Enlarged" 
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetailPage;
