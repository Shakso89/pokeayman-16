
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, UserPlus, Edit3, Save, X, Camera, Users, BookOpen, GraduationCap } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ProfileTabs } from "@/components/teacher-profile/ProfileTabs";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

const TeacherProfilePage: React.FC = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const {
    teacher,
    isLoading,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isOwner,
    studentCount,
    friendRequestSent,
    handleSave,
    handleCancel,
    handleAddFriend,
    updateSocialLink
  } = useTeacherProfile(teacherId);

  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    joinedDate: ''
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!teacherId) return;
      
      try {
        // Load classes count
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', teacherId);

        if (classesError) throw classesError;

        // Load students count
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('teacher_id', teacherId);

        if (studentsError) throw studentsError;

        // Load teacher join date
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('created_at')
          .eq('id', teacherId)
          .single();

        setStats({
          totalClasses: classes?.length || 0,
          totalStudents: students?.length || 0,
          joinedDate: teacherData?.created_at ? new Date(teacherData.created_at).toLocaleDateString() : ''
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, [teacherId]);

  const handleSendMessage = () => {
    navigate("/messages", { 
      state: { 
        recipientId: teacherId, 
        recipientName: teacher?.displayName || teacher?.username 
      } 
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditData({
          ...editData,
          avatar: e.target.result.toString()
        });
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("teacher-not-found")}</h2>
          <Button onClick={() => navigate(-1)}>{t("go-back")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
          
          <div className="flex gap-2">
            {isOwner && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
            
            {isOwner && isEditing && (
              <>
                <Button
                  onClick={handleSave}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </>
            )}
            
            {!isOwner && (
              <>
                <Button
                  onClick={handleSendMessage}
                  className="flex items-center"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button
                  onClick={handleAddFriend}
                  variant="outline"
                  disabled={friendRequestSent}
                  className="flex items-center"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {friendRequestSent ? 'Request Sent' : 'Add Friend'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={isEditing ? editData.avatar || teacher.avatar : teacher.avatar} 
                    alt={teacher.displayName || teacher.username} 
                  />
                  <AvatarFallback className="text-3xl">
                    {(teacher.displayName || teacher.username || "T").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isOwner && isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600">
                        <Camera className="h-4 w-4" />
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Display Name</label>
                        <Input
                          value={editData.displayName || ''}
                          onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                          placeholder="Enter display name"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {teacher.displayName || teacher.username}
                        </h1>
                        <p className="text-gray-500 text-lg">@{teacher.username}</p>
                        {teacher.email && (
                          <p className="text-gray-400 text-sm">{teacher.email}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-2xl font-bold text-blue-700">{stats.totalClasses}</div>
                        <div className="text-sm text-blue-600">Classes</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <GraduationCap className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-2xl font-bold text-green-700">{stats.totalStudents}</div>
                        <div className="text-sm text-green-600">Students</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-sm font-bold text-purple-700">Joined</div>
                        <div className="text-sm text-purple-600">{stats.joinedDate}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <ProfileTabs 
          teacher={teacher}
          isEditing={isEditing}
          isOwner={isOwner}
          studentCount={studentCount}
          editData={editData}
          setEditData={setEditData}
          updateSocialLink={updateSocialLink}
        />
      </div>
    </div>
  );
};

export default TeacherProfilePage;
