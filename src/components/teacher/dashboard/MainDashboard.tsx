
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
  onManageSharedClasses?: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  onCreateClass,
  teacherId,
  isAdmin,
  onNavigateToClass,
  onManageSharedClasses
}) => {
  const { t } = useTranslation();
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  
  useEffect(() => {
    const loadTeacherClasses = async () => {
      if (!teacherId) return;
      
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('teacher_id', teacherId);

        if (error) {
          console.error("Error loading teacher classes:", error);
          return;
        }

        setTeacherClasses(data || []);
      } catch (error) {
        console.error("Error loading teacher classes:", error);
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
              onManageSharedClasses={onManageSharedClasses}
            />
          </TabsContent>

          <TabsContent value="homework">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">All Homework</h3>
              {teacherClasses.length > 0 ? (
                <div className="space-y-8">
                  {teacherClasses.map((classItem) => (
                    <div key={classItem.id} className="border rounded-lg p-4">
                      <h4 className="text-md font-medium mb-4">{classItem.name}</h4>
                      <HomeworkList 
                        classId={classItem.id}
                        teacherId={teacherId}
                        isTeacher={true}
                        showClassSelector={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No classes found. Create a class to start assigning homework.</p>
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
