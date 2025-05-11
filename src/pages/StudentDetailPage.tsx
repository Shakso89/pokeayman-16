
import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { NavBar } from "@/components/NavBar";
import { PhotosTab } from "@/components/profile/PhotosTab";
import { useTranslation } from "@/hooks/useTranslation";
import { ChevronLeft, MessageSquare, UserPlus, UserCheck, Instagram, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FriendRequest, Student, Pokemon } from "@/types/pokemon";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PokemonList from "@/components/student/PokemonList";

const StudentDetailPage: React.FC = () => {
  const { id, studentId } = useParams<{ id?: string, studentId?: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState<boolean>(false);
  const [friendRequestPending, setFriendRequestPending] = useState<boolean>(false);
  const [alreadyFriends, setAlreadyFriends] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<{
    displayName: string;
    instagram?: string;
    whatsapp?: string;
    line?: string;
    phone?: string;
  }>({
    displayName: "",
  });

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
      loadStudentPokemons(actualStudentId);
      checkFriendshipStatus(actualStudentId);
    }
  }, [actualStudentId]);
  
  const loadStudentData = (id: string) => {
    const studentsData = localStorage.getItem("students");
    if (studentsData) {
      const students = JSON.parse(studentsData);
      const foundStudent = students.find((s: Student) => s.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
        
        // Initialize edit data
        setEditData({
          displayName: foundStudent.displayName || "",
          instagram: foundStudent.socialMedia?.instagram,
          whatsapp: foundStudent.socialMedia?.whatsapp,
          line: foundStudent.socialMedia?.line,
          phone: foundStudent.socialMedia?.phone,
        });
      } else {
        toast.error(t("student-not-found"));
        navigate(-1);
      }
    }
  };

  const loadStudentPokemons = (id: string) => {
    try {
      const studentPokemons = JSON.parse(localStorage.getItem("studentPokemons") || "[]");
      const studentPokemon = studentPokemons.find((sp: any) => sp.studentId === id);
      if (studentPokemon) {
        setPokemons(studentPokemon.pokemons || []);
      }
    } catch (error) {
      console.error("Error loading student pokemons:", error);
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

  const handleSaveChanges = () => {
    if (!student) return;
    
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: any) => s.id === student.id);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.displayName,
          socialMedia: {
            instagram: editData.instagram,
            whatsapp: editData.whatsapp,
            line: editData.line,
            phone: editData.phone,
          }
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        
        // If this is the current user's profile, update localStorage
        if (isOwnProfile && userType === "student") {
          localStorage.setItem("studentName", editData.displayName);
        }
        
        setStudent(students[index]);
        setIsEditMode(false);
        toast.success(t("profile-updated"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("error-updating-profile"));
    }
  };

  const isOwnProfile = userType === "student" && 
    localStorage.getItem("studentId") === actualStudentId;
  const canEdit = isOwnProfile;

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
    
    toast.success(t("friend-request-sent"));
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
    
    toast.success(t("friend-request-accepted"));
  };

  if (!isLoggedIn) {
    return <Navigate to={userType === "teacher" ? "/teacher-login" : "/student-login"} />;
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar 
          userType={userType as "teacher" | "student"} 
          userName={userName || ""}
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
        userName={userName || ""}
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
                      <p className="text-sm font-medium text-gray-500">{t("class")}:</p>
                      <p>{student.classId || t("no-class-assigned")}</p>
                    </div>
                    
                    {/* Social Media Section */}
                    {(student.socialMedia?.instagram || 
                      student.socialMedia?.whatsapp || 
                      student.socialMedia?.line || 
                      student.socialMedia?.phone) && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">{t("social-media")}:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.socialMedia?.instagram && (
                            <a 
                              href={`https://instagram.com/${student.socialMedia.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                            >
                              <Instagram className="h-4 w-4" />
                              <span>{student.socialMedia.instagram}</span>
                            </a>
                          )}
                          
                          {student.socialMedia?.phone && (
                            <a 
                              href={`tel:${student.socialMedia.phone}`}
                              className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1"
                            >
                              <Phone className="h-4 w-4" />
                              <span>{student.socialMedia.phone}</span>
                            </a>
                          )}
                          
                          {student.socialMedia?.whatsapp && (
                            <div className="flex items-center gap-1 text-sm bg-gray-100 rounded-full px-3 py-1">
                              <span>WhatsApp: {student.socialMedia.whatsapp}</span>
                            </div>
                          )}
                          
                          {student.socialMedia?.line && (
                            <div className="flex items-center gap-1 text-sm bg-gray-100 rounded-full px-3 py-1">
                              <span>Line: {student.socialMedia.line}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Buttons section */}
                    {isOwnProfile ? (
                      <Button 
                        className="mt-4" 
                        onClick={() => setIsEditMode(true)}
                      >
                        {t("edit-profile")}
                      </Button>
                    ) : (
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
                            <UserCheck className="h-4 w-4 mr-2" />
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList className="mb-4">
                <TabsTrigger value="photos">{t("photos")}</TabsTrigger>
                <TabsTrigger value="pokemon">{t("pokemon")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("student-photos")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotosTab 
                      photos={student.photos || []} 
                      onPhotoClick={setSelectedPhoto}
                      onSavePhotos={(photos) => {
                        if (!canEdit) return;
                        
                        const students = JSON.parse(localStorage.getItem("students") || "[]");
                        const index = students.findIndex((s: Student) => s.id === student.id);
                        
                        if (index !== -1) {
                          students[index].photos = photos;
                          localStorage.setItem("students", JSON.stringify(students));
                          setStudent({...student, photos});
                          toast.success(t("photos-updated"));
                        }
                      }}
                      maxPhotos={4}
                      readOnly={!canEdit}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pokemon">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("pokemon-collection")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pokemons.length > 0 ? (
                      <PokemonList pokemons={pokemons} />
                    ) : (
                      <p className="text-gray-500 text-center py-4">{t("no-pokemon-found")}</p>
                    )}
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
