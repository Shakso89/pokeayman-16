
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// This is a placeholder component since we're removing battle functionality
const BattleHistory: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{t("battle-history") || "Battle History"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-gray-50 rounded-full p-6 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2" />
              <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
              <path d="M18 22V5l-6-3-6 3v17" />
              <path d="M12 7v5" />
              <path d="M10 9h4" />
            </svg>
          </div>
          <p className="text-center text-gray-500 mb-2">{t("no-battles") || "No battle history available"}</p>
          <p className="text-sm text-center text-gray-400">
            {t("battle-history-description") || "Battle histories will appear here once you start battling with other students"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BattleHistory;
