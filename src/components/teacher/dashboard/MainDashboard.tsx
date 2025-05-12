import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Settings, UserPlus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardCards from "./DashboardCards";
import DashboardActions from "./DashboardActions";
import AccessRequestsTab from "./AccessRequestsTab";

interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  teacherId: string;
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
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              {t("dashboard")}
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Settings className="h-4 w-4 mr-2" />
              {t("actions")}
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-4 w-4 mr-2" />
              {t("access-requests")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardCards 
              teacherId={teacherId}
              creditInfo={creditInfo}
            />
          </TabsContent>
          
          <TabsContent value="actions">
            <DashboardActions 
              onAddStudent={onAddStudent}
              onManageClasses={onManageClasses}
              isAdmin={isAdmin}
            />
          </TabsContent>

          <TabsContent value="requests">
            <AccessRequestsTab teacherId={teacherId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MainDashboard;
