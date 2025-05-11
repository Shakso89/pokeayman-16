
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

// This is a placeholder component since we're removing battle functionality
const BattleHistory: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="p-6">
      <p className="text-center text-gray-500">{t("no-battles")}</p>
    </div>
  );
};

export default BattleHistory;
