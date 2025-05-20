import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Settings, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import DashboardCards from "./DashboardCards";
import DashboardActions from "./DashboardActions";
import AccessRequestsTab from "./AccessRequestsTab";
import { Button } from "@/components/ui/button";
interface MainDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddStudent: () => void;
  onManageClasses: () => void;
  onCreateClass: () => void;
  teacherId: string;
  isAdmin: boolean;
}
const MainDashboard: React.FC<MainDashboardProps> = ({
  activeTab,
  setActiveTab,
  onAddStudent,
  onManageClasses,
  onCreateClass,
  teacherId,
  isAdmin
}) => {
  const {
    t
  } = useTranslation();
  return <div className="grid grid-cols-1 gap-6">
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">
              <Home className="h-4 w-4 mr-2" />
              {t("dashboard")}
            </TabsTrigger>
            <TabsTrigger value="actions_and_requests">
              <Settings className="h-4 w-4 mr-2" />
              {t("actions-and-requests")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <DashboardCards teacherId={teacherId} onManageClasses={onManageClasses} isAdmin={isAdmin} />
            
            {/* Create Class button in the dashboard tab */}
            <div className="mt-6">
              
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
    </div>;
};
export default MainDashboard;