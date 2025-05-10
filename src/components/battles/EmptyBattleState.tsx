
import React from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";

interface EmptyBattleStateProps {
  type: "active" | "completed";
}

export const EmptyBattleState: React.FC<EmptyBattleStateProps> = ({ type }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">
          {type === "active" ? t("no-active-battles") : t("no-completed-battles")}
        </h3>
        <p className="text-gray-500">
          {type === "active" ? t("no-active-battles-description") : t("no-completed-battles-description")}
        </p>
      </CardContent>
    </Card>
  );
};
