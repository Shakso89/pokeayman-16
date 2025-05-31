
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";

const TeacherProfilePage: React.FC = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if this is the current user's profile
  const currentUserId = localStorage.getItem("currentTeacherId");
  const isOwner = currentUserId === teacherId;

  useEffect(() => {
    loadTeacherData();
  }, [teacherId]);

  const loadTeacherData = async () => {
    if (!teacherId) return;
    
    try {
      // Try to load from Supabase first
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setTeacher({
          id: data.id,
          username: data.username,
          displayName: data.display_name,
          email: data.email
        });
      }
    } catch (error) {
      console.error("Error loading from Supabase, falling back to localStorage:", error);
      
      // Fallback to localStorage
      const savedTeachers = localStorage.getItem("teachers");
      if (savedTeachers) {
        const teachers = JSON.parse(savedTeachers);
        const foundTeacher = teachers.find((t: any) => t.id === teacherId);
        if (foundTeacher) {
          setTeacher(foundTeacher);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    navigate("/messages", { state: { recipientId: teacherId, recipientName: teacher?.displayName || teacher?.username } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("teacher-not-found")}</h2>
          <Button onClick={() => navigate(-1)}>{t("go-back")}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
          
          {!isOwner && (
            <Button
              onClick={handleSendMessage}
              className="flex items-center"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("send-message")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {(teacher.displayName || teacher.username || "T").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    {teacher.displayName || teacher.username}
                  </h2>
                  <p className="text-gray-500 text-sm mb-2">@{teacher.username}</p>
                  {teacher.email && (
                    <p className="text-gray-500 text-sm">{teacher.email}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t("teacher-profile")}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t("display-name")}</label>
                    <p className="text-gray-900">{teacher.displayName || teacher.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t("username")}</label>
                    <p className="text-gray-900">@{teacher.username}</p>
                  </div>
                  {teacher.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">{t("email")}</label>
                      <p className="text-gray-900">{teacher.email}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
