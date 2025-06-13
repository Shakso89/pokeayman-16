
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardCards from "./DashboardCards";
import HomeworkList from "@/components/homework/HomeworkList";
import { supabase } from "@/integrations/supabase/client";

interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  onCreateClass: () => void;
  teacherId: string;
  isAdmin: boolean;
  onNavigateToClass?: (classId: string) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  onCreateClass,
  teacherId,
  isAdmin,
  onNavigateToClass
}) => {
  const { t } = useTranslation();
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  
  useEffect(() => {
    const loadTeacherClasses = async () => {
      if (!teacherId) return;
      
      try {
        console.log("Loading teacher classes for teacherId:", teacherId);
        
        // Get classes where teacher is the main teacher or an assistant
        const { data: supabaseClasses, error } = await supabase
          .from('classes')
          .select('*')
          .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`);

        if (error) {
          console.error("Error loading teacher classes from Supabase:", error);
          // Fallback to localStorage
          const localClasses = JSON.parse(localStorage.getItem("classes") || "[]");
          const filteredClasses = localClasses.filter((cls: any) => 
            cls.teacherId === teacherId || (cls.assistants && cls.assistants.includes(teacherId))
          );
          console.log("Using local classes:", filteredClasses);
          setTeacherClasses(filteredClasses);
          return;
        }

        console.log("Loaded classes from Supabase:", supabaseClasses);
        setTeacherClasses(supabaseClasses || []);
      } catch (error) {
        console.error("Error loading teacher classes:", error);
        // Fallback to localStorage
        const localClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const filteredClasses = localClasses.filter((cls: any) => 
          cls.teacherId === teacherId || (cls.assistants && cls.assistants.includes(teacherId))
        );
        console.log("Using local classes fallback:", filteredClasses);
        setTeacherClasses(filteredClasses);
      }
    };

    loadTeacherClasses();
  }, [teacherId]);
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <Tabs 
          key="teacher-main-dashboard-tabs"
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              {t("dashboard")}
            </TabsTrigger>
            <TabsTrigger value="homework">
              <BookOpen className="h-4 w-4 mr-2" />
              Homework
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardCards 
              teacherId={teacherId} 
              onManageClasses={onManageClasses} 
              isAdmin={isAdmin} 
              onNavigateToClass={onNavigateToClass}
              onAddStudent={onAddStudent}
            />
          </TabsContent>

          <TabsContent value="homework">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Homework Management</h3>
                <p className="text-sm text-gray-600">Manage homework across all your classes</p>
              </div>
              
              {teacherClasses.length > 0 ? (
                <HomeworkList 
                  classId=""
                  teacherId={teacherId}
                  isTeacher={true}
                  showClassSelector={true}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No classes found</p>
                  <p className="text-sm">Create a class to start managing homework.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainDashboard;
