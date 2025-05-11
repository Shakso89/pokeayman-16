
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, UserPlus, Edit, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { PhotoGrid } from "@/components/profile/PhotoGrid";

interface StudentProfile {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  photos: string[];
  classId?: string;
  pokemonCollection?: { id: string; name: string; image: string }[];
  contactInfo?: string;
}

export default function StudentProfilePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  
  // Check if current user is the owner of this profile
  const currentUserId = localStorage.getItem("studentId");
  const isOwner = currentUserId === studentId;
  
  useEffect(() => {
    if (studentId) {
      loadStudentProfile();
      // Check if friend request was already sent
      checkFriendRequestStatus();
    }
  }, [studentId]);
  
  const loadStudentProfile = () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const foundStudent = students.find((s: any) => s.id === studentId);
      
      if (foundStudent) {
        // Ensure photos array exists
        const studentData = {
          ...foundStudent,
          photos: foundStudent.photos || [],
          pokemonCollection: foundStudent.pokemonCollection || []
        };
        
        setStudent(studentData);
        setEditData(studentData);
      } else {
        toast.error("Student not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error loading student profile:", error);
      toast.error("Error loading profile");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkFriendRequestStatus = () => {
    if (!studentId || !currentUserId) return;
    
    // Check if friend request exists in localStorage
    const friendRequests = JSON.parse(localStorage.getItem("friendRequests") || "[]");
    const existingRequest = friendRequests.find(
      (request: any) => 
        (request.senderId === currentUserId && request.receiverId === studentId) ||
        (request.senderId === studentId && request.receiverId === currentUserId)
    );
    
    if (existingRequest) {
      setFriendRequestSent(true);
    }
  };
  
  const handleSave = () => {
    if (!student) return;
    
    try {
      const students = JSON.parse(localStorage.getItem("students") || "[]");
      const index = students.findIndex((s: any) => s.id === studentId);
      
      if (index !== -1) {
        students[index] = {
          ...students[index],
          displayName: editData.displayName || student.displayName,
          avatar: editData.avatar || student.avatar,
          photos: editData.photos || student.photos,
          contactInfo: editData.contactInfo
        };
        
        localStorage.setItem("students", JSON.stringify(students));
        setStudent({...student, ...editData});
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };
  
  const handleCancel = () => {
    setEditData(student || {});
    setIsEditing(false);
  };
  
  const handleSendMessage = () => {
    if (!student) return;
    
    // Store the selected contact in localStorage
    localStorage.setItem("selectedContactId", student.id);
    localStorage.setItem("selectedContactType", "student");
    
    // Navigate to messages page
    navigate("/student/messages");
  };
  
  const handleAddFriend = () => {
    if (!student || !currentUserId) return;
    
    const userType = localStorage.getItem("userType");
    const userName = localStorage.getItem("studentName") || localStorage.getItem("teacherUsername") || "";
    
    // Create a friend request object
    const friendRequest = {
      id: `fr-${Date.now()}`,
      senderId: currentUserId,
      senderType: userType,
      senderName: userName,
      receiverId: student.id,
      receiverType: "student",
      receiverName: student.displayName,
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Student not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar 
        userType={localStorage.getItem("userType") as "teacher" | "student"}
        userName={localStorage.getItem("studentName") || localStorage.getItem("teacherUsername") || ""}
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
          <h1 className="text-2xl font-bold">Student Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
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
                {!isOwner && (
                  <div className="mt-4">
                    <Button 
                      className="w-full mb-2"
                      onClick={handleSendMessage}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleAddFriend}
                      disabled={friendRequestSent}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {friendRequestSent ? "Friend Request Sent" : "Add Friend"}
                    </Button>
                  </div>
                )}
                
                {isOwner && !isEditing && (
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
                
                {isOwner && isEditing && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="photos">
              <TabsList>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="pokemon">Pokémon</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
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
                      photos={isEditing ? editData.photos || [] : student.photos || []}
                      maxPhotos={4}
                      editable={isOwner && isEditing}
                      onPhotosChange={photos => setEditData({...editData, photos})}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Pokemon Tab */}
              <TabsContent value="pokemon">
                <Card>
                  <CardHeader>
                    <CardTitle>Pokémon Collection</CardTitle>
                    <p className="text-sm text-gray-500">
                      {student.pokemonCollection?.length || 0} Pokémon collected
                    </p>
                  </CardHeader>
                  <CardContent>
                    {student.pokemonCollection && student.pokemonCollection.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {student.pokemonCollection.map((pokemon) => (
                          <div 
                            key={pokemon.id} 
                            className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
                          >
                            <div className="p-2 bg-gray-50">
                              <img 
                                src={pokemon.image} 
                                alt={pokemon.name}
                                className="w-full h-24 object-contain"
                              />
                            </div>
                            <div className="p-2 text-center">
                              <p className="text-sm font-medium">{pokemon.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No Pokémon collected yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Contact Info Tab */}
              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isEditing ? (
                        <div>
                          <Label htmlFor="contactInfo">Contact Information</Label>
                          <Input
                            id="contactInfo"
                            placeholder="Add your contact information"
                            value={editData.contactInfo || ''}
                            onChange={(e) => setEditData({...editData, contactInfo: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      ) : (
                        <p>
                          {student.contactInfo ? (
                            student.contactInfo
                          ) : (
                            <span className="text-gray-400">No contact information provided</span>
                          )}
                        </p>
                      )}
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
