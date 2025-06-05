
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Settings, BookOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardCards from "./DashboardCards";
import DashboardActions from "./DashboardActions";
import AccessRequestsTab from "./AccessRequestsTab";
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
    // Load teacher's classes for homework tab
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
        {/* Add unique key to isolate this Tabs component */}
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
            <TabsTrigger value="actions_and_requests">
              <Settings className="h-4 w-4 mr-2" />
              {t("actions-and-requests")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardCards 
              teacherId={teacherId} 
              onManageClasses={onManageClasses} 
              isAdmin={isAdmin} 
              onNavigateToClass={onNavigateToClass}
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
          
          <TabsContent value="actions_and_requests">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actions Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t("actions")}</h3>
                <DashboardActions onAddStudent={onAddStudent} onManageClasses={onManageClasses} onCreateClass={onCreateClass} isAdmin={isAdmin} />
              </div>
              
              {/* Access Requests Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{t("access-requests")}</h3>
                <AccessRequestsTab teacherId={teacherId} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainDashboard;
