
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { HomeworkAssignment, HomeworkSubmission } from "@/types/homework";
import { supabase } from "@/integrations/supabase/client";

export const useSubmissionOperations = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleApproveSubmission = async (
    submission: HomeworkSubmission,
    homeworkAssignments: HomeworkAssignment[],
    setHomeworkSubmissions: React.Dispatch<React.SetStateAction<HomeworkSubmission[]>>
  ) => {
    const homework = homeworkAssignments.find(hw => hw.id === submission.homeworkId);
    if (!homework) return;
    
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      // Award coins to student (implement this function)
      // awardCoinsToStudent(submission.studentId, homework.coinReward);
      
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? { ...sub, status: "approved" as const } : sub)
      );
      
      toast({
        title: t("submission-approved"),
        description: `${homework.coinReward} ${t("coins-awarded-to")} ${submission.studentName}`,
      });
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: t("error"),
        description: t("failed-to-approve-submission"),
        variant: "destructive"
      });
    }
  };
  
  const handleRejectSubmission = async (
    submission: HomeworkSubmission,
    feedback: string | undefined,
    setHomeworkSubmissions: React.Dispatch<React.SetStateAction<HomeworkSubmission[]>>
  ) => {
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'rejected',
          feedback: feedback || ''
        })
        .eq('id', submission.id);
        
      if (error) throw error;
      
      setHomeworkSubmissions(prev => 
        prev.map(sub => sub.id === submission.id ? { 
          ...sub, 
          status: "rejected" as const,
          feedback: feedback 
        } : sub)
      );
      
      toast({
        title: t("submission-rejected"),
        description: t("student-notified"),
      });
    } catch (error) {
      console.error("Error rejecting submission:", error);
      toast({
        title: t("error"),
        description: t("failed-to-reject-submission"),
        variant: "destructive"
      });
    }
  };

  return {
    handleApproveSubmission,
    handleRejectSubmission
  };
};
