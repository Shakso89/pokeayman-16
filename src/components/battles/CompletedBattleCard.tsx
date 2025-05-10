
import React from "react";
import { format } from "date-fns";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Battle } from "@/types/pokemon";
import { useTranslation } from "@/hooks/useTranslation";

interface CompletedBattleCardProps {
  battle: Battle;
  studentId: string | null;
  formatDateTime: (dateString: string) => string;
  isExpired: (timeLimit: string) => boolean;
}

export const CompletedBattleCard: React.FC<CompletedBattleCardProps> = ({
  battle,
  studentId,
  formatDateTime,
  isExpired,
}) => {
  const { t } = useTranslation();
  
  const userWon = battle.winner?.studentId === studentId;
  const userParticipated = battle.participants?.includes(studentId || "");
  const userSubmitted = battle.answers?.some(answer => answer.studentId === studentId);
  
  return (
    <Card key={battle.id} className={`hover:shadow-md transition-shadow ${
      userWon ? "border-yellow-400" : ""
    }`}>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{battle.name}</CardTitle>
          <Badge variant="outline" className={isExpired(battle.timeLimit) ? "bg-red-50" : ""}>
            {battle.status === "completed" ? t("completed") : t("expired")}
          </Badge>
        </div>
        <CardDescription>{battle.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {userWon ? (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
            <p className="font-medium flex items-center">
              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
              {t("you-won-battle")}
            </p>
            <p className="text-sm text-gray-700">
              {t("reward-received").replace("{{coins}}", ((battle.baseReward || 0) + (battle.participants?.length || 0)).toString())}
            </p>
          </div>
        ) : battle.winner ? (
          <div className="mb-3">
            <p className="font-medium">{t("winner")}: {battle.winner.studentName}</p>
            {userSubmitted && (
              <p className="text-sm text-gray-500">{t("better-luck-next-time")}</p>
            )}
          </div>
        ) : (
          <p className="mb-3 text-gray-500">{t("no-winner-declared")}</p>
        )}
        
        <div className="text-sm text-gray-500">
          {userParticipated ? (
            <Badge variant="outline" className="bg-blue-50">
              {userSubmitted ? t("you-participated-and-submitted") : t("you-participated")}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50">
              {t("you-did-not-participate")}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          {formatDateTime(battle.timeLimit)}
        </div>
        <div className="text-sm text-gray-500">
          {battle.participants?.length || 0} {t("participants")}
        </div>
      </CardFooter>
    </Card>
  );
};
