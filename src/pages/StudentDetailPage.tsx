
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { UploadPhotos } from "@/components/profile/UploadPhotos";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft, MessageSquare, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FriendRequest } from "@/types/pokemon";

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
      } else {
        toast({
          description: t("student-not-found"),
          variant: "destructive",
        });
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
      
      toast({
        description: "Avatar updated successfully!",
      });
    }
  };

  const isOwnProfile = userType === "student" && 
    localStorage.getItem("studentId") === actualStudentId;
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
    
    toast({
      description: t("friend-request-sent"),
    });
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
    
    toast({
      description: t("friend-request-accepted"),
    });
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
          {/* Student Profile Card */}
          <Card className="col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {student.avatar ? (
                      <img 
                        src={student.avatar} 
                        alt={student.displayName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">
                          {student.displayName.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardTitle>{student.displayName}</CardTitle>
              <p className="text-sm text-gray-500">@{student.username}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("class")}:</p>
                  <p>{student.classId || t("no-class-assigned")}</p>
                </div>
                
                {/* Social actions - only show if not own profile */}
                {!isOwnProfile && (
                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full"
                      onClick={handleSendMessage}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t("send-message")}
                    </Button>
                    
                    {alreadyFriends ? (
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("already-friends")}
                      </Button>
                    ) : friendRequestSent ? (
                      <Button 
                        className="w-full"
                        variant="outline"
                        disabled
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("friend-request-sent")}
                      </Button>
                    ) : friendRequestPending ? (
                      <Button 
                        className="w-full"
                        variant="secondary"
                        onClick={handleAcceptFriendRequest}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("accept-friend-request")}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={handleFriendRequest}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {t("add-friend")}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList className="mb-4">
                <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
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
                      readOnly={!canEdit}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
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
