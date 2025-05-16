
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardActionsProps {
  onAddStudent: () => void;
  onManageClasses?: () => void;
  isAdmin?: boolean;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({ 
  onAddStudent, 
  onManageClasses,
  isAdmin
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 flex-wrap">
      <Button 
        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        onClick={onAddStudent}
      >
        <UserPlus className="h-4 w-4" />
        {t("create-student")}
      </Button>
      
      {onManageClasses && (
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={onManageClasses}
        >
          {t("manage-classes")}
        </Button>
      )}
    </div>
  );
};

export default DashboardActions;
