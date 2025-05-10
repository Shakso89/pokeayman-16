
import React from "react";
import { format } from "date-fns";
import { Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Battle } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface BattleCardProps {
  battle: Battle;
  studentId: string | null;
  hasSubmittedAnswer: (battle: Battle) => boolean;
  getTimeRemaining: (timeLimit: string) => string;
  formatDateTime: (dateString: string) => string;
  onBattleSelect: (battle: Battle) => void;
  joinBattle: (battle: Battle) => void;
}

export const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  studentId,
  hasSubmittedAnswer,
  getTimeRemaining,
  formatDateTime,
  onBattleSelect,
  joinBattle,
}) => {
  const { t } = useTranslation();
  
  return (
    <Card key={battle.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{battle.name}</CardTitle>
          <Badge variant="outline">
            {getTimeRemaining(battle.timeLimit)}
          </Badge>
        </div>
        <CardDescription>{battle.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSubmittedAnswer(battle) ? (
          <Badge variant="default" className="mb-2">
            {t("answer-submitted")}
          </Badge>
        ) : (
          <Badge variant="destructive" className="mb-2">
            {t("answer-required")}
          </Badge>
        )}
        
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {t("ends-at")}: {formatDateTime(battle.timeLimit)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          {t("reward")}: {(battle.baseReward || 0) + (battle.participants?.length || 0)} {t("coins")}
        </div>
        <Button
          onClick={() => {
            joinBattle(battle);
            onBattleSelect(battle);
          }}
        >
          {hasSubmittedAnswer(battle) ? t("view-submission") : t("answer-battle")}
        </Button>
      </CardFooter>
    </Card>
  );
};
