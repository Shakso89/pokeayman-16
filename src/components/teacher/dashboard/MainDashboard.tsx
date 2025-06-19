
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, MessageSquare, TrendingUp, ExternalLink } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import DashboardCards from "./DashboardCards";
import { supabase } from "@/integrations/supabase/client";

interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  onNavigateToClass: (classId: string) => void;
  onCreateClass: () => void;
  teacherId: string;
  isAdmin: boolean;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  onNavigateToClass,
  onCreateClass,
  teacherId,
  isAdmin
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleClassNavigation = (classId: string) => {
    console.log("Navigating to class from dashboard:", classId);
    navigate(`/class-details/${classId}`);
  };

  // Fetch classes where teacher is creator or assistant
  const fetchTeacherClasses = async () => {
    if (!teacherId || isAdmin) return;
    
    setLoading(true);
    try {
      // Get classes where teacher is the creator
      const { data: createdClasses, error: createdError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId);

      // Get classes where teacher is an assistant
      const { data: assistantClasses, error: assistantError } = await supabase
        .from('classes')
        .select('*')
        .contains('assistants', [teacherId]);

      if (createdError && assistantError) {
        console.error('Error fetching classes:', { createdError, assistantError });
        return;
      }

      // Combine and deduplicate classes
      const allClasses = [
        ...(createdClasses || []),
        ...(assistantClasses || [])
      ];

      // Remove duplicates based on class ID
      const uniqueClasses = allClasses.filter((cls, index, self) => 
        index === self.findIndex(c => c.id === cls.id)
      );

      // Add role information
      const classesWithRoles = uniqueClasses.map(cls => ({
        ...cls,
        role: cls.teacher_id === teacherId ? 'creator' : 'assistant'
      }));

      setTeacherClasses(classesWithRoles);
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchTeacherClasses();
    }
  }, [activeTab, teacherId, isAdmin]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">{t("dashboard")}</TabsTrigger>
          <TabsTrigger value="classes">{t("classes")}</TabsTrigger>
          <TabsTrigger value="homework">{t("homework")}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardCards 
            teacherId={teacherId} 
            isAdmin={isAdmin}
            onManageClasses={onManageClasses}
            onAddStudent={onAddStudent}
            onNavigateToClass={onNavigateToClass}
          />
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("quick-actions")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button onClick={onAddStudent} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("add-student")}
                </Button>
                <Button onClick={onManageClasses} variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {t("manage-classes")}
                </Button>
                <Button onClick={() => navigate("/messages")} variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("messages")}
                </Button>
                <Button onClick={() => navigate("/reports")} variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("reports")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("your-classes")}</h3>
            <Button onClick={onManageClasses}>
              <BookOpen className="h-4 w-4 mr-2" />
              {t("manage-classes")}
            </Button>
          </div>
          
          {/* Teacher's Classes List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading classes...</p>
            </div>
          ) : teacherClasses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No classes found</p>
                <p className="text-sm text-gray-400 mb-4">
                  You haven't created any classes or been added as an assistant yet
                </p>
                <Button onClick={onManageClasses} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Class
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherClasses.map((cls) => (
                <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        {cls.description && (
                          <p className="text-sm text-gray-600 mt-1">{cls.description}</p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cls.role === 'creator' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {cls.role === 'creator' ? 'Creator' : 'Assistant'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {cls.students?.length || 0} students
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleClassNavigation(cls.id)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Button>
                    </div>
                    {cls.created_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        Created {new Date(cls.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="homework" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{t("homework-management")}</h3>
          </div>
          {/* Homework content will be loaded by parent component */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MainDashboard;
