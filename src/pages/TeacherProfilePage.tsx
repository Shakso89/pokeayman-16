
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserPlus, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { FriendRequest } from "@/types/pokemon";
import { UploadPhotos } from "@/components/profile/UploadPhotos";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Teacher {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  avatar?: string;
  classes?: string[];
}

const TeacherProfilePage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted">("none");
  const [studentCount, setStudentCount] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const userType = localStorage.getItem("userType");
  const currentUserId = userType === "teacher" ? 
    localStorage.getItem("teacherId") : 
    localStorage.getItem("studentId");
  const isOwnProfile = currentUserId === teacherId;
  
  useEffect(() => {
    if (teacherId) {
      loadTeacherData(teacherId);
      checkFriendStatus(teacherId);
    }
  }, [teacherId]);
  
  const loadTeacherData = (id: string) => {
    setIsLoading(true);
    try {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const teacher = teachers.find((t: Teacher) => t.id === id);
      
      if (teacher) {
        setTeacher(teacher);
        
        // Count students
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const classStudents = students.filter((s: any) => 
          s.classId && teacher.classes?.includes(s.classId)
        );
        setStudentCount(classStudents.length);
      } else {
        toast({
          title: t("error"),
          description: t("teacher-not-found"),
          variant: "destructive",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      toast({
        title: t("error"),
        description: t("error-loading-teacher"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendStatus = (id: string) => {
    if (!currentUserId) return;
    
    try {
      const friendRequests: FriendRequest[] = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      
      // Check for any requests between current user and viewed teacher
      const existingRequest = friendRequests.find(request => 
        (request.senderId === currentUserId && request.receiverId === id) ||
        (request.receiverId === currentUserId && request.senderId === id)
      );
      
      if (existingRequest) {
        setFriendStatus(existingRequest.status as "pending" | "accepted");
      }
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };
  
  const handleSendFriendRequest = () => {
    if (!currentUserId || !teacher) return;
    
    try {
      const currentUserName = userType === "teacher" ?
        localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") :
        localStorage.getItem("studentName");
      
      const newRequest: FriendRequest = {
        id: `fr-${Date.now()}`,
        senderId: currentUserId,
        senderType: userType as "teacher" | "student",
        senderName: currentUserName || "",
        receiverId: teacher.id,
        receiverType: "teacher",
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
      friendRequests.push(newRequest);
      localStorage.setItem("friendRequests", JSON.stringify(friendRequests));
      
      setFriendStatus("pending");
      
      toast({
        title: t("request-sent"),
        description: t("friend-request-sent"),
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: t("error"),
        description: t("error-sending-request"),
        variant: "destructive",
      });
    }
  };
  
  if (isLoading || !teacher) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg">{t("loading")}</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar 
        userType={userType as "teacher" | "student"}
        userName={
          userType === "teacher" 
            ? localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") 
            : localStorage.getItem("studentName")
        }
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
          <h1 className="text-2xl font-bold">{t("teacher-profile")}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teacher Profile Card */}
          <Card className="col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
                    {teacher.avatar ? (
                      <img 
                        src={teacher.avatar} 
                        alt={teacher.displayName || teacher.username} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">
                          {(teacher.displayName || teacher.username).substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <CardTitle>{teacher.displayName || teacher.username}</CardTitle>
              <p className="text-sm text-gray-500">@{teacher.username}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("classes-managed")}:</p>
                  <p>{teacher.classes?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t("total-students")}:</p>
                  <p>{studentCount}</p>
                </div>
                
                {!isOwnProfile && (
                  <div className="mt-4">
                    {friendStatus === "none" && (
                      <Button className="w-full" onClick={handleSendFriendRequest}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t("add-friend")}
                      </Button>
                    )}
                    {friendStatus === "pending" && (
                      <Button className="w-full" variant="secondary" disabled>
                        {t("request-pending")}
                      </Button>
                    )}
                    {friendStatus === "accepted" && (
                      <Button className="w-full" variant="outline" disabled>
                        <UserCheck className="mr-2 h-4 w-4" />
                        {t("friends")}
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
                    <CardTitle>{t("teacher-photos")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadPhotos 
                      userId={teacher.id} 
                      userType="teacher" 
                      isOwnProfile={isOwnProfile}
                      onPhotoClick={(url) => setSelectedPhoto(url)}
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

export default TeacherProfilePage;
