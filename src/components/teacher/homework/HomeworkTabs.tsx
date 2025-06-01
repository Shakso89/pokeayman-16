
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import ActiveHomeworkTab from "./ActiveHomeworkTab";
import ArchivedHomeworkTab from "./ArchivedHomeworkTab";
import ReviewHomeworkTab from "./ReviewHomeworkTab";

interface HomeworkTabsProps {
  activeTab: "active" | "archived" | "review";
  onTabChange: (tab: "active" | "archived" | "review") => void;
  activeHomework: HomeworkAssignment[];
  archivedHomework: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: { id: string, name: string }[];
  onAwardCoins: (studentId: string, studentName: string) => void;
  onApproveSubmission: (submission: HomeworkSubmission) => void;
  onRejectSubmission: (submission: HomeworkSubmission, feedback?: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
  onCreateHomework: (classId: string, className: string) => void;
}

const HomeworkTabs: React.FC<HomeworkTabsProps> = ({
  activeTab,
  onTabChange,
  activeHomework,
  archivedHomework,
  submissions,
  classes,
  onAwardCoins,
  onApproveSubmission,
  onRejectSubmission,
  onDeleteHomework,
  onCreateHomework
}) => {
  const { t } = useTranslation();
  
  const pendingSubmissions = submissions.filter(s => s.status === "pending");

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 bg-white shadow-sm">
        <TabsTrigger 
          value="active" 
          className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 font-medium"
        >
          {t("active-homework")}
        </TabsTrigger>
        <TabsTrigger 
          value="review"
          className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 font-medium relative"
        >
          {t("review-submissions")}
          {pendingSubmissions.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingSubmissions.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger 
          value="archived"
          className="data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700 font-medium"
        >
          {t("archived-homework")}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="active" className="mt-6">
        <ActiveHomeworkTab
          activeHomework={activeHomework}
          submissions={submissions}
          classes={classes}
          onAwardCoins={onAwardCoins}
          onApproveSubmission={onApproveSubmission}
          onRejectSubmission={onRejectSubmission}
          onDeleteHomework={onDeleteHomework}
          onNavigateToStudentProfile={(studentId) => {}}
          onCreateHomework={onCreateHomework}
        />
      </TabsContent>

      <TabsContent value="review" className="mt-6">
        <ReviewHomeworkTab
          activeHomework={activeHomework}
          submissions={submissions}
          classes={classes}
          onApproveSubmission={onApproveSubmission}
          onRejectSubmission={(submission, feedback) => onRejectSubmission(submission, feedback)}
        />
      </TabsContent>

      <TabsContent value="archived" className="mt-6">
        <ArchivedHomeworkTab
          archivedHomework={archivedHomework}
          submissions={submissions}
          classes={classes}
          onAwardCoins={onAwardCoins}
          onApproveSubmission={onApproveSubmission}
          onRejectSubmission={onRejectSubmission}
          onDeleteHomework={onDeleteHomework}
          onNavigateToStudentProfile={(studentId) => {}}
          onCreateHomework={onCreateHomework}
        />
      </TabsContent>
    </Tabs>
  );
};

export default HomeworkTabs;
