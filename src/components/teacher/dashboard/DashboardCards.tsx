
import React from "react";
import { useNavigate } from "react-router-dom";
import { School, MessageSquare, BarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardCardsProps {
  onManageClasses: () => void;
  isAdmin?: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ onManageClasses, isAdmin = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6 text-blue-500" />
            {t("manage-classes")}
          </CardTitle>
          <CardDescription>
            {isAdmin ? t("manage-schools-classes") : t("manage-classes-desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {isAdmin 
              ? t("admin-manage-classes-details") 
              : t("manage-classes-details")}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button" 
            onClick={onManageClasses}
          >
            {t("manage-classes")}
          </Button>
        </CardFooter>
      </Card>

      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-500" />
            {t("messages")}
          </CardTitle>
          <CardDescription>
            {t("school-collab-desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {t("school-collab-details")}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button"
            onClick={() => navigate("/teacher/messages")}
          >
            {t("messages")}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="hover:shadow-lg transition-all pokemon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-purple-500" />
            {t("reports-analytics")}
          </CardTitle>
          <CardDescription>
            {t("student-participation")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            {t("student-engagement")}
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full pokemon-button"
            onClick={() => navigate("/teacher/reports")}
          >
            {t("reports-analytics")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardCards;
