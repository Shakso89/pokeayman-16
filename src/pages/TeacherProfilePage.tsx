
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { ProfileTabs } from "@/components/teacher-profile/ProfileTabs";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

const TeacherProfilePage: React.FC = () => {
  const { teacherId: routeTeacherId } = useParams();
  const navigate = useNavigate();
  const localTeacherId = localStorage.getItem("teacherId");
  const teacherId = routeTeacherId || localTeacherId;
  
  const {
    teacher,
    isLoading,
    isSaving,
    error,
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
    updateSocialLink,
  } = useTeacherProfile(teacherId);

  const [activeTab, setActiveTab] = useState("photos");

  const userType = localStorage.getItem("userType") as "teacher" | "student";
  const userName = localStorage.getItem("teacherDisplayName") || localStorage.getItem("teacherUsername") || "Teacher";

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      console.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditData({ ...editData, avatarUrl: e.target.result.toString() });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (!teacherId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Missing Teacher ID</h1>
            <p className="text-gray-600 mb-4">No teacher ID provided in URL or local storage</p>
            <Button onClick={() => navigate("/teacher-dashboard")}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar userType={userType} userName={userName} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading teacher profile...</span>
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
            <div className="space-x-2">
              <Button onClick={handleBackClick}>Go Back</Button>
              <Button onClick={() => navigate("/teacher-dashboard")} variant="outline">
                Go to Dashboard
              </Button>
            </div>
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
              <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
            {isOwner && isEditing && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button variant="outline">
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
                  <AvatarImage src={isEditing ? editData.avatarUrl : teacher.avatarUrl} />
                  <AvatarFallback className="text-2xl">
                    {teacher.displayName?.[0]?.toUpperCase() || "T"}
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
                    value={editData.displayName || ''}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    placeholder="Display Name"
                    className="text-3xl font-bold mb-2 text-center md:text-left"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mb-2">{teacher.displayName}</h2>
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
                    {teacher.classes.length} Classes
                  </Badge>
                  <Badge className="px-3 py-1 text-base bg-green-100 text-green-800">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {studentCount} Students
                  </Badge>
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
              <div className="text-3xl font-bold text-blue-600">{teacher.classes.length}</div>
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
              <div className="text-3xl font-bold text-green-600">{studentCount}</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Active Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{teacher.classes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <ProfileTabs
          teacher={teacher}
          isEditing={isEditing}
          isOwner={isOwner}
          studentCount={studentCount}
          editData={editData}
          setEditData={setEditData}
          updateSocialLink={updateSocialLink}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default TeacherProfilePage;
