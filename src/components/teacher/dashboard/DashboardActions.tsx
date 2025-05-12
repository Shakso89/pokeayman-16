
import React from "react";
import { UserPlus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardActionsProps {
  onAddStudent: () => void;
  onViewCredits: () => void;
  creditsAmount?: number;
}

const DashboardActions: React.FC<DashboardActionsProps> = ({ 
  onAddStudent, 
  onViewCredits, 
  creditsAmount 
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center mb-6">
      <Button 
        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
        onClick={onAddStudent}
      >
        <UserPlus className="h-4 w-4" />
        {t("create-student")}
      </Button>
      
      <Button 
        className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
        onClick={onViewCredits}
      >
        <CreditCard className="h-4 w-4" />
        {creditsAmount !== undefined ? `${creditsAmount} ${t("credits")}` : t("view-credits")}
      </Button>
    </div>
  );
};

export default DashboardActions;
