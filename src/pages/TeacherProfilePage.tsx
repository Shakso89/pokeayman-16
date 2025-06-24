
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Edit3,
  Save,
  X,
  Camera,
  Users,
  BookOpen,
  GraduationCap,
  School,
  Calendar,
  Mail,
  Loader2,
  MessageSquare,
  UserPlus
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TeacherProfile {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  school_id?: string;
  school_name?: string;
  created_at: string;
  role: string;
  social_links?: {
    line?: string;
    whatsapp?: string;
    instagram?: string;
    phone?: string;
  };
  photos?: string[];
  class_count: number;
  student_count: number;
  classes: Array<{
    id: string;
    name: string;
    student_count: number;
  }>;
}

const TeacherProfilePage: React.FC = () => {
  const { teacherId: routeId } = useParams();
  const localTeacherId = localStorage.getItem("teacherId");
  const teacherId = routeId || localTeacherId;
  const navigate = useNavigate();
  
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<TeacherProfile>>({});
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  const currentUserId = localStorage.getItem("teacherId");
  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const userName = localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") || "Teacher";
  const isOwner = currentUserId === teacherId;

  useEffect(() => {
    if (teacherId) {
      fetchTeacherProfile();
    }
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    if (!teacherId) return;

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching teacher profile for ID:", teacherId);

      // Get teacher profile
      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select(`
          *,
          schools (name)
        `)
        .eq("id", teacherId)
        .single();

      if (teacherError) {
        console.error("Error fetching teacher:", teacherError);
        throw new Error("Teacher not found");
      }

      // Get teacher's classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", teacherId);

      if (classesError) {
        console.warn("Error fetching classes:", classesError);
      }

      // Get student count for each class
      const classesWithCounts = await Promise.all(
        (classesData || []).map(async (cls) => {
          const { data: students } = await supabase
            .from("student_profiles")
            .select("id", { count: "exact" })
            .eq("class_id", cls.id);

          return {
            ...cls,
            student_count: students?.length || 0
          };
        })
      );

      const totalStudents = classesWithCounts.reduce((sum, cls) => sum + cls.student_count, 0);

      const profile: TeacherProfile = {
        id: teacherData.id,
        username: teacherData.username,
        display_name: teacherData.display_name || teacherData.username,
        email: teacherData.email,
        avatar_url: teacherData.avatar_url,
        school_id: teacherData.school_id,
        school_name: teacherData.schools?.name,
        created_at: teacherData.created_at,
        role: teacherData.role || 'teacher',
        social_links: teacherData.social_links || {},
        photos: teacherData.photos || [],
        class_count: classesWithCounts.length,
        student_count: totalStudents,
        classes: classesWithCounts
      };

      setTeacher(profile);
      setEditData(profile);

    } catch (err: any) {
      console.error("Error loading teacher profile:", err);
      setError(err.message || "Failed to load teacher profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!teacher || !teacherId) return;

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          display_name: editData.display_name,
          avatar_url: editData.avatar_url,
          social_links: editData.social_links,
          photos: editData.photos,
        })
        .eq('id', teacherId);

      if (error) throw error;

      setTeacher({ ...teacher, ...editData });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditData(teacher || {});
    setIsEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditData({ ...editData, avatar_url: e.target.result.toString() });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = () => {
    if (!teacher?.id) return;
    navigate("/messages", {
      state: {
        recipientId: teacher.id,
        recipientName: teacher.display_name || teacher.username,
      },
    });
  };

  const handleAddFriend = () => {
    // Implement friend request logic
    setFriendRequestSent(true);
    toast({
      title: "Friend Request Sent",
      description: `Friend request sent to ${teacher?.display_name}`,
    });
  };

  const updateSocialLink = (platform: string, value: string) => {
    setEditData({
      ...editData,
      social_links: {
        ...editData.social_links,
        [platform]: value
      }
    });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Profile</h1>
            <p className="text-gray-600 mb-4">{error || "Teacher not found"}</p>
            <Button onClick={handleBackClick}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar userType={userType} userName={userName} />
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackClick}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Teacher Profile</h1>
          </div>

          <div className="flex gap-2">
            {isOwner && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
            {isOwner && isEditing && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button onClick={handleSendMessage} variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button
                  onClick={handleAddFriend}
                  disabled={friendRequestSent}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {friendRequestSent ? "Request Sent" : "Add Friend"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={editData.avatar_url || teacher.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {teacher.display_name?.[0]?.toUpperCase() || "T"}
                  </AvatarFallback>
                </Avatar>
                {isOwner && isEditing && (
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                      <Camera className="h-4 w-4" />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <Input
                    value={editData.display_name || ''}
                    onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                    placeholder="Display Name"
                    className="text-3xl font-bold mb-2 text-center md:text-left"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mb-2">{teacher.display_name}</h2>
                )}
                
                <p className="text-xl text-gray-600 mb-4">@{teacher.username}</p>
                {teacher.email && (
                  <p className="text-gray-500 mb-4 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    {teacher.email}
                  </p>
                )}
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <Badge className="px-3 py-1 text-base bg-blue-100 text-blue-800">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {teacher.class_count} Classes
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-green-100 text-green-800">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {teacher.student_count} Students
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-purple-100 text-purple-800">
                    {teacher.role.charAt(0).toUpperCase() + teacher.role.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  {teacher.school_name && (
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <School className="h-4 w-4" />
                      <span>{teacher.school_name}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(teacher.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Users className="h-4 w-4" />
                    <span>{teacher.student_count} total students</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Classes Taught
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{teacher.class_count}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{teacher.student_count}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Years Teaching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {Math.ceil((Date.now() - new Date(teacher.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Classes ({teacher.classes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {teacher.classes.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teacher.classes.map((cls) => (
                      <Card key={cls.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{cls.name}</h3>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{cls.student_count} students</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No classes assigned yet</p>
                    <p className="text-sm">Classes will appear here when assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">LINE ID</label>
                      <Input
                        value={editData.social_links?.line || ''}
                        onChange={(e) => updateSocialLink('line', e.target.value)}
                        placeholder="Enter LINE ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WhatsApp</label>
                      <Input
                        value={editData.social_links?.whatsapp || ''}
                        onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                        placeholder="Enter WhatsApp number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Instagram</label>
                      <Input
                        value={editData.social_links?.instagram || ''}
                        onChange={(e) => updateSocialLink('instagram', e.target.value)}
                        placeholder="Enter Instagram handle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <Input
                        value={editData.social_links?.phone || ''}
                        onChange={(e) => updateSocialLink('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teacher.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span>{teacher.email}</span>
                      </div>
                    )}
                    {teacher.social_links?.line && (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-green-500 rounded text-white text-xs flex items-center justify-center">L</div>
                        <span>{teacher.social_links.line}</span>
                      </div>
                    )}
                    {teacher.social_links?.whatsapp && (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-green-600 rounded text-white text-xs flex items-center justify-center">W</div>
                        <span>{teacher.social_links.whatsapp}</span>
                      </div>
                    )}
                    {teacher.social_links?.instagram && (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-pink-500 rounded text-white text-xs flex items-center justify-center">I</div>
                        <span>@{teacher.social_links.instagram}</span>
                      </div>
                    )}
                    {teacher.social_links?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center">P</div>
                        <span>{teacher.social_links.phone}</span>
                      </div>
                    )}
                    {!teacher.email && !teacher.social_links?.line && !teacher.social_links?.whatsapp && 
                     !teacher.social_links?.instagram && !teacher.social_links?.phone && (
                      <p className="text-gray-500 text-center py-8">No contact information available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                {teacher.photos && teacher.photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {teacher.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Camera className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No photos uploaded yet</p>
                    <p className="text-sm">Photos will appear here when added</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
