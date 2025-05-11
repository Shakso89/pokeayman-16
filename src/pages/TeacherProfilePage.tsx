
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserPlus, UserCheck, Instagram, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { FriendRequest, Teacher } from "@/types/pokemon";
import { PhotosTab } from "@/components/profile/PhotosTab";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TeacherProfilePage: React.FC = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [friendStatus, setFriendStatus] = useState<"none" | "pending" | "accepted">("none");
  const [studentCount, setStudentCount] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<{
    displayName: string;
    instagram?: string;
    whatsapp?: string;
    line?: string;
    phone?: string;
  }>({
    displayName: "",
  });
  
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
        
        // Initialize edit data
        setEditData({
          displayName: teacher.displayName || "",
          instagram: teacher.socialMedia?.instagram,
          whatsapp: teacher.socialMedia?.whatsapp,
          line: teacher.socialMedia?.line,
          phone: teacher.socialMedia?.phone,
        });
        
        // Count students
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        const teacherStudents = students.filter((s: any) => s.teacherId === teacher.id);
        setStudentCount(teacherStudents.length);
      } else {
        toast.error(t("teacher-not-found"));
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      toast.error(t("error-loading-teacher"));
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendStatus = (id: string) => {
    if (!currentUserId || userType === "teacher") return;
    
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
      
      toast.success(t("friend-request-sent"));
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(t("error-sending-request"));
    }
  };

  const handleSaveChanges = () => {
    if (!teacher) return;
    
    try {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const index = teachers.findIndex((t: Teacher) => t.id === teacher.id);
      
      if (index !== -1) {
        teachers[index] = {
          ...teachers[index],
          displayName: editData.displayName,
          socialMedia: {
            instagram: editData.instagram,
            whatsapp: editData.whatsapp,
            line: editData.line,
            phone: editData.phone,
          }
        };
        
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // If this is the current user's profile, update localStorage
        if (isOwnProfile && userType === "teacher") {
          localStorage.setItem("teacherDisplayName", editData.displayName);
        }
        
        setTeacher(teachers[index]);
        setIsEditMode(false);
        toast.success(t("profile-updated"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("error-updating-profile"));
    }
  };

  const handleSendMessage = () => {
    if (!teacher) return;
    
    // Navigate to messages page
    navigate(userType === "teacher" ? "/teacher/messages" : "/student/messages");
    
    // Store the selected contact in localStorage for the messages page to use
    localStorage.setItem("selectedContactId", teacher.id);
    localStorage.setItem("selectedContactType", "teacher");
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
                {isEditMode ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName">{t("display-name")}</Label>
                        <Input 
                          id="displayName" 
                          value={editData.displayName} 
                          onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input 
                          id="instagram" 
                          value={editData.instagram || ""} 
                          onChange={(e) => setEditData({...editData, instagram: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input 
                          id="whatsapp" 
                          value={editData.whatsapp || ""} 
                          onChange={(e) => setEditData({...editData, whatsapp: e.target.value})}
                          placeholder="+1234567890"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="line">Line</Label>
                        <Input 
                          id="line" 
                          value={editData.line || ""} 
                          onChange={(e) => setEditData({...editData, line: e.target.value})}
                          placeholder="line_id"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">{t("phone")}</Label>
                        <Input 
                          id="phone" 
                          value={editData.phone || ""} 
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          placeholder="+1234567890"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1" 
                          onClick={handleSaveChanges}
                        >
                          {t("save")}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => setIsEditMode(false)}
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t("students-managed")}:</p>
                      <p>{studentCount}</p>
                    </div>
                    
                    {/* Social Media Section */}
                    {(teacher.socialMedia?.instagram || 
                      teacher.socialMedia?.whatsapp || 
                      teacher.socialMedia?.line || 
                      teacher.socialMedia?.phone) && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">{t("social-media")}:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.socialMedia?.instagram && (
                            <a 
                              href={`https://instagram.com/${teacher.socialMedia.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                            >
                              <Instagram className="h-4 w-4" />
                              <span>{teacher.socialMedia.instagram}</span>
                            </a>
                          )}
                          
                          {teacher.socialMedia?.phone && (
                            <a 
                              href={`tel:${teacher.socialMedia.phone}`}
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{teacher.socialMedia.phone}</span>
                            </a>
                          )}
                          
                          {teacher.socialMedia?.whatsapp && (
                            <div className="flex items-center gap-1 text-sm bg-gray-100 rounded-full px-3 py-1">
                              <span>WhatsApp: {teacher.socialMedia.whatsapp}</span>
                            </div>
                          )}
                          
                          {teacher.socialMedia?.line && (
                            <div className="flex items-center gap-1 text-sm bg-gray-100 rounded-full px-3 py-1">
                              <span>Line: {teacher.socialMedia.line}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {isOwnProfile ? (
                      <Button 
                        className="mt-4" 
                        onClick={() => setIsEditMode(true)}
                      >
                        {t("edit-profile")}
                      </Button>
                    ) : (
                      <div className="space-y-2 mt-4">
                        <Button 
                          className="w-full" 
                          onClick={handleSendMessage}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t("send-message")}
                        </Button>
                        
                        {userType === "student" && (
                          <>
                            {friendStatus === "none" && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={handleSendFriendRequest}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {t("add-friend")}
                              </Button>
                            )}
                            {friendStatus === "pending" && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                disabled
                              >
                                {t("request-pending")}
                              </Button>
                            )}
                            {friendStatus === "accepted" && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                disabled
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                {t("friends")}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList className="mb-4">
                <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
                <TabsTrigger value="students">{t("students")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("teacher-photos")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotosTab 
                      photos={teacher.photos || []} 
                      onPhotoClick={setSelectedPhoto}
                      onSavePhotos={(photos) => {
                        if (!isOwnProfile) return;
                        
                        const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
                        const index = teachers.findIndex((t: Teacher) => t.id === teacher.id);
                        
                        if (index !== -1) {
                          teachers[index].photos = photos;
                          localStorage.setItem("teachers", JSON.stringify(teachers));
                          setTeacher({...teacher, photos});
                          toast.success(t("photos-updated"));
                        }
                      }}
                      maxPhotos={4}
                      readOnly={!isOwnProfile}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("students-managed")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StudentsListTab teacherId={teacher.id} />
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

// Component to display students managed by this teacher
const StudentsListTab: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const [students, setStudents] = useState<any[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadStudents = () => {
      try {
        const allStudents = JSON.parse(localStorage.getItem("students") || "[]");
        const filteredStudents = allStudents.filter((s: any) => s.teacherId === teacherId);
        setStudents(filteredStudents);
      } catch (error) {
        console.error("Error loading students:", error);
      }
    };
    
    loadStudents();
  }, [teacherId]);

  const handleStudentClick = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  if (students.length === 0) {
    return <p className="text-gray-500">{t("no-students-found")}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {students.map((student) => (
        <div 
          key={student.id}
          className="flex items-center p-4 bg-white rounded-lg border shadow-sm cursor-pointer hover:bg-gray-50"
          onClick={() => handleStudentClick(student.id)}
        >
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={student.avatar} alt={student.displayName} />
            <AvatarFallback>{student.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.displayName}</p>
            <p className="text-sm text-gray-500">@{student.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeacherProfilePage;
