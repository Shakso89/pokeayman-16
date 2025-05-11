
import React from "react";
import { CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

interface BattleHistoryProps {
  battles: any[];
  studentId: string;
}

const BattleHistory: React.FC<BattleHistoryProps> = () => {
  const { t } = useTranslation();
  
  return (
    <CardContent className="p-6">
      <div className="text-center py-8">
        <p className="text-gray-500">{t("battle-mode-removed")}</p>
      </div>
    </CardContent>
  );
};

export default BattleHistory;
