
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { HomeworkCard } from "./HomeworkCard";

interface ActiveHomeworkTabProps {
  homeworks: HomeworkAssignment[];
  submissions: HomeworkSubmission[];
  classes: Array<{ id: string; name: string }>;
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Helper functions
  const getSubmissionsForHomework = (homeworkId: string) => {
    return submissions.filter(sub => sub.homeworkId === homeworkId);
  };
  
  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : t("unknown-class");
  };

  const handleApproveSubmission = (submission: HomeworkSubmission) => {
    // Find the homework to get the reward amount
    const homework = homeworks.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    // Update submission status
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === submission.id) {
        return { ...sub, status: "approved" as const };
      }
      return sub;
    });
    
    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
    
    // Award coins to student
    awardCoinsToStudent(submission.studentId, homework.coinReward);
  };

  const handleRejectSubmission = (submission: HomeworkSubmission) => {
    // Update submission status
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === submission.id) {
        return { ...sub, status: "rejected" as const };
      }
      return sub;
    });
    
    // Save updated submissions
    localStorage.setItem("homeworkSubmissions", JSON.stringify(updatedSubmissions));
  };

  const navigateToStudentProfile = (studentId: string) => {
    navigate(`/teacher/student/${studentId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          onNavigateToStudentProfile={navigateToStudentProfile}
          isActive={true}
        />
      ))}
    </div>
  );
};

// Add this import at the top
import { awardCoinsToStudent } from "@/utils/pokemon";

export default ActiveHomeworkTab;
