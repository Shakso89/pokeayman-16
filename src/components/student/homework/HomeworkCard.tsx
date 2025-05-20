
import React from "react";
import { HomeworkAssignment } from "@/types/homework";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistance } from "date-fns";
import { BookOpen, CheckCircle, Clock } from "lucide-react";

export interface HomeworkCardProps {
  homework: HomeworkAssignment;
  submitted: boolean;
  onSubmit: () => void;
  onView: () => void;
  t: (key: string) => string;
}

const HomeworkCard: React.FC<HomeworkCardProps> = ({
  homework,
  submitted,
  onSubmit,
  onView,
  t,
}) => {
  const expirationDate = new Date(homework.expiresAt);
  const now = new Date();
  const expired = expirationDate < now;
  
  // Calculate time remaining
  const timeRemaining = formatDistance(expirationDate, now, { addSuffix: true });

  return (
    <Card className={expired ? "opacity-70" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            <CardTitle className="text-lg">{homework.title}</CardTitle>
          </div>
          {submitted && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              {t("submitted")}
            </div>
          )}
        </div>
        <CardDescription className="flex items-center mt-1">
          <Clock className="h-4 w-4 mr-1 text-gray-500" />
          {expired ? (
            <span className="text-red-500">{t("expired")}</span>
          ) : (
            <span>{t("expires")} {timeRemaining}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{homework.description}</p>
        <div className="mt-2 text-sm text-blue-600">
          {t("reward")}: {homework.coinReward} {t("coins")}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        {submitted ? (
          <Button onClick={onView} variant="outline">
            {t("view-submission")}
          </Button>
        ) : !expired ? (
          <Button onClick={onSubmit}>
            {t("submit")}
          </Button>
        ) : (
          <Button disabled variant="outline">
            {t("expired")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HomeworkCard;
