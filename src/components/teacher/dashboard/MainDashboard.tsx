
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import DashboardCards from "./DashboardCards";

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

  const handleClassNavigation = (classId: string) => {
    console.log("Navigating to class from dashboard:", classId);
    navigate(`/class-details/${classId}`);
  };

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
          {/* Classes content will be loaded by parent component */}
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
