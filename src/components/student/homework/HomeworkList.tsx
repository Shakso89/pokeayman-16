
import React from "react";
import { HomeworkAssignment } from "@/types/homework";
import HomeworkCard from "./HomeworkCard";
import { Card, CardContent } from "@/components/ui/card";

export interface HomeworkListProps {
  homeworks: HomeworkAssignment[];
  userSubmissions: any[];
  onSubmit: (homework: HomeworkAssignment) => void;
  onView: (homework: HomeworkAssignment) => void;
  t: (key: string) => string;
}

const HomeworkList: React.FC<HomeworkListProps> = ({
  homeworks,
  userSubmissions,
  onSubmit,
  onView,
  t,
}) => {
  if (homeworks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 pb-6 text-center text-gray-500">
          {t("no-homework-available")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {homeworks.map((homework) => {
        // Find if user has submitted this homework
        const submitted = userSubmissions.some(
          (sub) => sub.homeworkId === homework.id
        );

        return (
          <HomeworkCard
            key={homework.id}
            homework={homework}
            submitted={submitted}
            onSubmit={() => onSubmit(homework)}
            onView={() => onView(homework)}
            t={t}
          />
        );
      })}
    </div>
  );
};

export default HomeworkList;
