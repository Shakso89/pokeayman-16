
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import TeacherCredit from "@/components/teacher/TeacherCredit";
import DashboardActions from "./DashboardActions";
import DashboardCards from "./DashboardCards";

interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  teacherId: string | null;
  creditInfo: any;
  isAdmin: boolean;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  teacherId,
  creditInfo,
  isAdmin
}) => {
  const { t } = useTranslation();

  const renderMainContent = () => {
    if (activeTab === "dashboard") {
      return (
        <>
          <DashboardActions 
            onAddStudent={onAddStudent} 
            onViewCredits={() => setActiveTab("credits")} 
            creditsAmount={creditInfo?.credits}
          />
          
          <DashboardCards 
            onManageClasses={onManageClasses} 
            isAdmin={isAdmin}
          />
        </>
      );
    } else if (activeTab === "credits") {
      return <TeacherCredit teacherId={teacherId || ""} />;
    }
    return null;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="dashboard">{t("dashboard") || "Dashboard"}</TabsTrigger>
        <TabsTrigger value="credits" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          {t("credits") || "Credits"}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="mt-0">
        {renderMainContent()}
      </TabsContent>
      
      <TabsContent value="credits" className="mt-0">
        {renderMainContent()}
      </TabsContent>
    </Tabs>
  );
};

export default MainDashboard;
