
import React from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardHeaderProps {
  isAdmin: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isAdmin }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Card className="mb-6 border-none shadow-lg pokemon-gradient-bg text-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t("welcome-teacher")}</h2>
            <p>{t("manage-classes-description")}</p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => navigate("/admin-dashboard")}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {t("admin-dashboard")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHeader;
