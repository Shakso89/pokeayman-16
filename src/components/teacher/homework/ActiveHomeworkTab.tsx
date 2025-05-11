
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { HomeworkCard } from "./HomeworkCard";
import { awardCoinsToStudent } from "@/utils/pokemon";
import { useToast } from "@/hooks/use-toast";

interface ActiveHomeworkTabProps {
  homeworks: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: { id: string, name: string }[];
  onAwardCoins: (studentId: string, studentName: string) => void;
  onDeleteHomework: (homeworkId: string) => void;
}

const ActiveHomeworkTab: React.FC<ActiveHomeworkTabProps> = ({
  homeworks,
  submissions,
  classes,
  onAwardCoins,
  onDeleteHomework
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Handle submission approval
  const handleApproveSubmission = (submission: HomeworkSubmission) => {
    // Find the homework
    const homework = homeworks.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    // Update submission status
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    const submissionIndex = allSubmissions.findIndex((sub: HomeworkSubmission) => sub.id === submission.id);
    
    if (submissionIndex !== -1) {
      allSubmissions[submissionIndex].status = "approved";
      localStorage.setItem("homeworkSubmissions", JSON.stringify(allSubmissions));
      
      // Award coins to student
      awardCoinsToStudent(submission.studentId, homework.coinReward);
      
      toast({
        title: t("submission-approved"),
        description: `${t("coins-awarded")}: ${homework.coinReward}`,
      });
    }
  };
  
  // Handle submission rejection
  const handleRejectSubmission = (submission: HomeworkSubmission) => {
    // Update submission status
    const allSubmissions = JSON.parse(localStorage.getItem("homeworkSubmissions") || "[]");
    const submissionIndex = allSubmissions.findIndex((sub: HomeworkSubmission) => sub.id === submission.id);
    
    if (submissionIndex !== -1) {
      allSubmissions[submissionIndex].status = "rejected";
      localStorage.setItem("homeworkSubmissions", JSON.stringify(allSubmissions));
      
      toast({
        title: t("submission-rejected"),
      });
    }
  };
  
  // Navigate to student profile
  const handleNavigateToStudentProfile = (studentId: string) => {
    navigate(`/student/profile/${studentId}`);
  };
  
  // Get submissions for a homework
  const getSubmissionsForHomework = (homeworkId: string) => {
    return submissions.filter(sub => sub.homeworkId === homeworkId);
  };
  
  // Get class name for a homework
  const getClassName = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass?.name || t("unknown-class");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {homeworks.map(homework => (
        <HomeworkCard
          key={homework.id}
          homework={homework}
          className={getClassName(homework.classId)}
          submissions={getSubmissionsForHomework(homework.id)}
          onApproveSubmission={handleApproveSubmission}
          onRejectSubmission={handleRejectSubmission}
          onAwardCoins={onAwardCoins}
          onDeleteHomework={onDeleteHomework}
          onNavigateToStudentProfile={handleNavigateToStudentProfile}
          isActive={true}
        />
      ))}
    </div>
  );
};

export default ActiveHomeworkTab;
