
import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getHomeworkTypeIcon } from "./HomeworkUtils";

interface ArchivedHomeworkTabProps {
  homeworks: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: Array<{ id: string; name: string }>;
  onDeleteHomework: (homeworkId: string) => void;
}

const ArchivedHomeworkTab: React.FC<ArchivedHomeworkTabProps> = ({
  homeworks,
  submissions,
  classes,
  onDeleteHomework
}) => {
  const { t } = useTranslation();
  
  // Helper functions
  const getSubmissionsForHomework = (homeworkId: string) => {
    return submissions.filter(sub => sub.homeworkId === homeworkId);
  };
  
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : t("unknown-class");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {homeworks.map(homework => {
        const homeworkSubmissions = getSubmissionsForHomework(homework.id);
        const approvedSubmissions = homeworkSubmissions.filter(sub => sub.status === "approved");
        
        return (
          <Card key={homework.id} className="bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getHomeworkTypeIcon(homework.type)}
                  <CardTitle className="ml-2 text-gray-600">{homework.title}</CardTitle>
                </div>
                <div className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium">
                  {getClassName(homework.classId)}
                </div>
              </div>
              <CardDescription className="mt-2">
                {t("expired")}: {new Date(homework.expiresAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">{t("submissions")}: {homeworkSubmissions.length}</p>
              <p className="text-sm text-gray-600">{t("approved")}: {approvedSubmissions.length}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => onDeleteHomework(homework.id)}>
                {t("delete-permanently")}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default ArchivedHomeworkTab;
