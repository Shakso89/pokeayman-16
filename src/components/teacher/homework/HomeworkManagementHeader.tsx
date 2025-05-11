
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface HomeworkManagementHeaderProps {
  onBack: () => void;
  onCreateHomework: (classId: string, className: string) => void;
  classes: Array<{ id: string; name: string }>;
}

const HomeworkManagementHeader: React.FC<HomeworkManagementHeaderProps> = ({ 
  onBack, 
  onCreateHomework,
  classes
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center mb-6">
      <Button variant="outline" onClick={onBack} className="mr-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t("back")}
      </Button>
      <h2 className="text-2xl font-bold flex-1">{t("homework-management")}</h2>
      <Button 
        onClick={() => onCreateHomework(classes[0]?.id || "", classes[0]?.name || "")}
      >
        {t("create-homework")}
      </Button>
    </div>
  );
};

export default HomeworkManagementHeader;
