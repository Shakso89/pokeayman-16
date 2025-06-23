import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MessageSquare,
  UserPlus,
  Edit3,
  Save,
  X,
  Camera,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ProfileTabs } from "@/components/teacher-profile/ProfileTabs";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import AppHeader from "@/components/AppHeader";

const TeacherProfilePage: React.FC = () => {
  const { teacherId: routeId } = useParams();
  const localTeacherId = localStorage.getItem("teacherId");
  const teacherId = routeId || localTeacherId;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("photos");

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
    updateSocialLink,
  } = useTeacherProfile(teacherId);

  const [joinedDate, setJoinedDate] = useState('');

  useEffect(() => {
    const loadJoinDate = async () => {
      if (!teacherId) return;
      const { data, error } = await supabase
        .from("teachers")
        .select("created_at")
        .eq("id", teacherId)
        .single();

      if (!error && data?.created_at) {
        setJoinedDate(new Date(data.created_at).toLocaleDateString());
      }
    };
    loadJoinDate();
  }, [teacherId]);

  const handleSendMessage = () => {
    if (!teacher?.id) return;
    navigate("/messages", {
      state: {
        recipientId: teacher.id,
        recipientName: teacher.displayName || teacher.username,
      },
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      return toast({
        title: "Error",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEditData({ ...editData, avatar_url: e.target.result.toString() });
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center animate-pulse text-gray-600 text-lg">{t("loading")}</div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t("teacher-not-found")}</h2>
          <Button onClick={() => navigate(-1)}>{t("go-back")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        userType="teacher"
        userName={teacher.username}
        userAvatar={teacher.avatar_url || "/default-avatar.png"}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
          </Button>

          <div className="flex gap-2">
            {isOwner && !isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
            {isOwner && isEditing && (
              <>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </>
            )}
            {!isOwner && (
              <>
                <Button onClick={handleSendMessage}>
                  <MessageSquare className="h-4 w-4 mr-2" /> Message
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

        <Card className="mb-6">
          <CardContent className="p-6 flex gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={editData.avatar_url || teacher.avatar_url} />
                <AvatarFallback className="text-xl">
                  {teacher.displayName?.[0]?.toUpperCase() || "T"}
                </AvatarFallback>
              </Avatar>
              {isOwner && isEditing && (
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                  <div className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {isEditing ? (
                <Input
                  value={editData.displayName || ''}
                  onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                  placeholder="Display Name"
                />
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{teacher.displayName || teacher.username}</h1>
                  <p className="text-gray-500">@{teacher.username}</p>
                  <p className="text-gray-400 text-sm">{teacher.email}</p>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<BookOpen />} title="Classes" count={teacher.classes?.length || 0} onClick={() => setActiveTab("classes")} color="blue" />
                <StatCard icon={<GraduationCap />} title="Students" count={studentCount} onClick={() => setActiveTab("students")} color="green" />
                <StatCard icon={<Users />} title="Joined" content={joinedDate} color="purple" />
              </div>
            </div>
          </CardContent>
        </Card>

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

const StatCard = ({ icon, title, count, content, onClick, color }: any) => (
  <Card
    className={`cursor-pointer border-${color}-200 bg-${color}-50 transition-shadow hover:shadow-lg`}
    onClick={onClick}
  >
    <CardContent className="p-4 text-center">
      <div className={`text-${color}-600 flex justify-center mb-2`}>{icon}</div>
      {typeof count !== "undefined" ? (
        <div className={`text-2xl font-bold text-${color}-700`}>{count}</div>
      ) : (
        <div className={`text-sm text-${color}-700`}>{content}</div>
      )}
      <div className={`text-sm text-${color}-600`}>{title}</div>
    </CardContent>
  </Card>
);

export default TeacherProfilePage;
