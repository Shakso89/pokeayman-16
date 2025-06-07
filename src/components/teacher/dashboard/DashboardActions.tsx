import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardActionsProps {
  onAddStudent: () => void;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({ onAddStudent }) => {
  const { t } = useTranslation();

  return (
    <div className="flex gap-4 flex-wrap">
      <Button
        onClick={onAddStudent}
        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        {t("create-student")}
      </Button>
    </div>
  );
};

export default DashboardActions;
