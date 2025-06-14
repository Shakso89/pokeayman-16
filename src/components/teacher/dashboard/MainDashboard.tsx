
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
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classDataWarning, setClassDataWarning] = useState<string | null>(null);

  useEffect(() => {
    const loadTeacherClasses = async () => {
      if (!teacherId) {
        setIsLoadingClasses(false);
        return;
      }

      try {
        console.log("Loading teacher classes for teacherId:", teacherId);

        // Query all classes for debugging
        const { data: allClassesData, error: allError } = await supabase
          .from('classes')
          .select('*');

        if (allError) {
          console.error("Error loading classes from Supabase:", allError);
        } else {
          // Classes where teacherId matches or is assistant
          const classesForThisTeacher = (allClassesData || []).filter(
            (cls: any) =>
              cls.teacher_id === teacherId ||
              (Array.isArray(cls.assistants) && cls.assistants.includes(teacherId))
          );

          // Also show a warning if there are classes with teacher_id null
          const brokenClasses = (allClassesData || []).filter(
            (cls: any) =>
              (!cls.teacher_id || cls.teacher_id === null) &&
              (Array.isArray(cls.assistants) && cls.assistants.includes(teacherId))
          );
          if (brokenClasses.length > 0) {
            setClassDataWarning(
              `Warning: ${brokenClasses.length} class(es) have no teacher assigned (teacher_id is null). Please update your class records!`
            );
            // Optionally merge them into the visible list
            brokenClasses.forEach((broken) => {
              if (!classesForThisTeacher.find((c) => c.id === broken.id)) {
                classesForThisTeacher.push(broken);
              }
            });
          } else {
            setClassDataWarning(null);
          }

          setTeacherClasses(classesForThisTeacher);
          setIsLoadingClasses(false);
          return;
        }

        // Fallback to old query (won't be needed, but just in case)
        const { data: supabaseClasses, error } = await supabase
          .from('classes')
          .select('*')
          .or(`teacher_id.eq.${teacherId},assistants.cs.{${teacherId}}`);

        if (error) {
          // Fallback to localStorage
          const localClasses = JSON.parse(localStorage.getItem("classes") || "[]");
          const filteredClasses = localClasses.filter((cls: any) => 
            cls.teacherId === teacherId || (cls.assistants && cls.assistants.includes(teacherId))
          );
          setTeacherClasses(filteredClasses);
        } else {
          setTeacherClasses(supabaseClasses || []);
        }
      } catch (error) {
        // Fallback to localStorage
        const localClasses = JSON.parse(localStorage.getItem("classes") || "[]");
        const filteredClasses = localClasses.filter((cls: any) =>
          cls.teacherId === teacherId || (cls.assistants && cls.assistants.includes(teacherId))
        );
        setTeacherClasses(filteredClasses);
      } finally {
        setIsLoadingClasses(false);
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
              {classDataWarning && (
                <div className="bg-yellow-100 rounded px-4 py-2 text-yellow-800 font-bold">
                  {classDataWarning}
                </div>
              )}
              {isLoadingClasses ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Loading your classes...</p>
                </div>
              ) : (
                <HomeworkList 
                  classId=""
                  teacherId={teacherId}
                  isTeacher={true}
                  showClassSelector={true}
                  teacherClasses={teacherClasses}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainDashboard;

