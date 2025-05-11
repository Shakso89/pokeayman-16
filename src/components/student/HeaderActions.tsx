
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const HeaderActions: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-end mt-4">
      <Link to="/student/rankings">
        <Button variant="outline" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          {t("rankings")}
        </Button>
      </Link>
    </div>
  );
};

export default HeaderActions;
