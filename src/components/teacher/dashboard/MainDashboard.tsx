
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import DashboardCards from "./DashboardCards";
import RecentClasses from "./RecentClasses";
import StudentsManagement from "./StudentsManagement";
import { useHomeworkManagement } from "../homework/hooks/useHomeworkManagement";
import TeacherHomeworkManagement from "../homework/TeacherHomeworkManagement";

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
  // Get homework data for notifications
  const {
    submissions,
    activeHomework,
    archivedHomework,
    classes,
    loadHomework
  } = useHomeworkManagement(teacherId);

  const [teacherData, setTeacherData] = useState<any>(null);

  const pendingSubmissions = submissions.filter(sub => sub.status === 'pending').length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="homework" className="relative">
          Homework
          {pendingSubmissions > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 text-xs px-1 py-0 min-w-[20px] h-5 flex items-center justify-center animate-pulse"
            >
              {pendingSubmissions}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
        <DashboardCards 
          teacherId={teacherId}
          onAddStudent={onAddStudent}
          onManageClasses={onManageClasses}
          onNavigateToClass={onNavigateToClass}
          isAdmin={isAdmin}
        />
        <RecentClasses 
          classes={classes}
          loading={false}
          onNavigateToClass={onNavigateToClass}
        />
      </TabsContent>

      <TabsContent value="students" className="space-y-6">
        <StudentsManagement
          teacherId={teacherId}
          teacherData={teacherData}
          onTeacherDataUpdate={setTeacherData}
        />
      </TabsContent>

      <TabsContent value="homework" className="space-y-6">
        <TeacherHomeworkManagement teacherId={teacherId} />
      </TabsContent>
    </Tabs>
  );
};

export default MainDashboard;
