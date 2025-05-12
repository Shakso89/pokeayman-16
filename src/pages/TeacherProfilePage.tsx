
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserPlus, Edit, Phone, Instagram, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { PhotoGrid } from "@/components/profile/PhotoGrid";
import { ProfileSidebar } from "@/components/student-profile/ProfileSidebar";

interface SocialLinks {
  line?: string;
  whatsapp?: string;
  instagram?: string;
  phone?: string;
}

interface TeacherProfile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  avatar?: string;
  photos: string[];
  classes: string[];
  socialLinks?: SocialLinks;
}

export default function TeacherProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfile>>({});
  const [studentCount, setStudentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  // Check if current user is the owner of this profile
  const currentUserId = localStorage.getItem("teacherId");
  const isOwner = currentUserId === teacherId;
  
  useEffect(() => {
    if (teacherId) {
      loadTeacherProfile();
      checkFriendRequestStatus();
    }
  }, [teacherId]);
  
  const loadTeacherProfile = () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const foundTeacher = teachers.find((t: any) => t.id === teacherId);
      
      if (foundTeacher) {
        // Ensure photos array exists
        const teacherData = {
          ...foundTeacher,
          photos: foundTeacher.photos || [],
          socialLinks: foundTeacher.socialLinks || {}
        };
        
        setTeacher(teacherData);
        setEditData(teacherData);
        
        // Count students
        const classes = JSON.parse(localStorage.getItem("classes") || "[]");
        const teacherClasses = classes.filter((c: any) => 
          foundTeacher.classes?.includes(c.id)
        );
        
        let totalStudents = 0;
        teacherClasses.forEach((cls: any) => {
          totalStudents += cls.students?.length || 0;
        });
        
        setStudentCount(totalStudents);
      } else {
        toast.error("Teacher not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendRequestStatus = () => {
    if (!teacherId || !currentUserId) return;
    
    // Check if friend request exists in localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const existingRequest = friendRequests.find(
      (request: any) => 
        (request.senderId === currentUserId && request.receiverId === teacherId) ||
        (request.senderId === teacherId && request.receiverId === currentUserId)
    );
    
    if (existingRequest) {
      setFriendRequestSent(true);
    }
  };
  
  const handleSave = () => {
    if (!teacher) return;
    
    try {
      const teachers = JSON.parse(localStorage.getItem("teachers") || "[]");
      const index = teachers.findIndex((t: any) => t.id === teacherId);
      
      if (index !== -1) {
        teachers[index] = {
          ...teachers[index],
          displayName: editData.displayName || teacher.displayName,
          avatar: editData.avatar || teacher.avatar,
          photos: editData.photos || teacher.photos,
          socialLinks: editData.socialLinks || teacher.socialLinks
        };
        
        localStorage.setItem("teachers", JSON.stringify(teachers));
        
        // Update local state with new data
        setTeacher({
          ...teacher,
          displayName: editData.displayName || teacher.displayName,
          avatar: editData.avatar || teacher.avatar,
          photos: editData.photos || teacher.photos,
          socialLinks: editData.socialLinks || teacher.socialLinks
        });
        
        // If this is the current logged-in teacher, update their display name in localStorage
        if (isOwner) {
          localStorage.setItem("teacherDisplayName", editData.displayName || teacher.displayName);
        }
        
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };
  
  const handleCancel = () => {
    setEditData(teacher || {});
    setIsEditing(false);
  };
  
  const handleSendMessage = () => {
    if (!teacher) return;
    
    // Store the selected contact in localStorage
    localStorage.setItem("selectedContactId", teacher.id);
    localStorage.setItem("selectedContactType", "teacher");
    
    // Navigate to messages page
    navigate("/teacher/messages");
  };
  
  const handleAddFriend = () => {
    if (!teacher || !currentUserId) return;
    
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("studentName") || localStorage.getItem("teacherDisplayName") || "";
    
    // Create a friend request object
    const friendRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType,
      senderName: userName,
      receiverId: teacher.id,
      receiverType: "teacher",
      receiverName: teacher.displayName,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    friendRequests.push(friendRequest);
    localStorage.setItem("friendRequests", JSON.stringify(friendRequests));
    
    // Update UI
    setFriendRequestSent(true);
    toast.success("Friend request sent");
  };
  
  const updateSocialLink = (network: keyof SocialLinks, value: string) => {
    setEditData({
      ...editData,
      socialLinks: {
        ...(editData.socialLinks || {}),
        [network]: value
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Teacher not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar 
        userType={"teacher"}
        userName={localStorage.getItem("teacherDisplayName") || ""}
      />
      
      <div className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            className="mr-4"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Teacher Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <ProfileSidebar
            student={{
              id: teacher.id,
              displayName: teacher.displayName,
              username: teacher.username,
              avatar: teacher.avatar
            }}
            isOwner={isOwner}
            isEditing={isEditing}
            friendRequestSent={friendRequestSent}
            onEditClick={() => setIsEditing(true)}
            onSendMessageClick={handleSendMessage}
            onAddFriendClick={handleAddFriend}
            onSaveClick={handleSave}
            onCancelClick={handleCancel}
          />
          
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
              </TabsList>
              
              {/* Photos Tab */}
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                    <p className="text-sm text-gray-500">Upload up to 4 photos</p>
                  </CardHeader>
                  <CardContent>
                    <PhotoGrid 
                      photos={isEditing ? editData.photos || [] : teacher.photos || []}
                      maxPhotos={4}
                      editable={isOwner && isEditing}
                      onPhotosChange={photos => setEditData({...editData, photos})}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Students Tab */}
              <TabsContent value="students">
                <Card>
                  <CardHeader>
                    <CardTitle>Students</CardTitle>
                    <p className="text-sm text-gray-500">
                      Total students across all classes: {studentCount}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {studentCount > 0 ? (
                      <p>Students list would appear here in a real implementation</p>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No students yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Social Media Tab */}
              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                    <p className="text-sm text-gray-500">Optional contact information</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Line */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                          L
                        </div>
                        <div className="flex-grow">
                          {isEditing ? (
                            <Input
                              placeholder="Line ID"
                              value={editData.socialLinks?.line || ''}
                              onChange={(e) => updateSocialLink('line', e.target.value)}
                            />
                          ) : (
                            <p>
                              {teacher.socialLinks?.line ? (
                                teacher.socialLinks.line
                              ) : (
                                <span className="text-gray-400">No Line ID provided</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* WhatsApp */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                          W
                        </div>
                        <div className="flex-grow">
                          {isEditing ? (
                            <Input
                              placeholder="WhatsApp Number"
                              value={editData.socialLinks?.whatsapp || ''}
                              onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                            />
                          ) : (
                            <p>
                              {teacher.socialLinks?.whatsapp ? (
                                teacher.socialLinks.whatsapp
                              ) : (
                                <span className="text-gray-400">No WhatsApp number provided</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Instagram */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                          <Instagram className="h-4 w-4" />
                        </div>
                        <div className="flex-grow">
                          {isEditing ? (
                            <Input
                              placeholder="Instagram Username"
                              value={editData.socialLinks?.instagram || ''}
                              onChange={(e) => updateSocialLink('instagram', e.target.value)}
                            />
                          ) : (
                            <p>
                              {teacher.socialLinks?.instagram ? (
                                teacher.socialLinks.instagram
                              ) : (
                                <span className="text-gray-400">No Instagram username provided</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Phone */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="flex-grow">
                          {isEditing ? (
                            <Input
                              placeholder="Phone Number"
                              value={editData.socialLinks?.phone || ''}
                              onChange={(e) => updateSocialLink('phone', e.target.value)}
                            />
                          ) : (
                            <p>
                              {teacher.socialLinks?.phone ? (
                                teacher.socialLinks.phone
                              ) : (
                                <span className="text-gray-400">No phone number provided</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
