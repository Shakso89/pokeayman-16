
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { HomeworkSubmission, Homework } from "@/types/homework";
import { awardCoinsToStudent } from "@/utils/pokemon/studentPokemon";
import { checkAndConsumeCredits } from "@/utils/creditsService";

export const useSubmissionOperations = () => {
  const handleApproveSubmission = async (
    submission: HomeworkSubmission,
    homework: Homework[],
    setSubmissions: React.Dispatch<React.SetStateAction<HomeworkSubmission[]>>
  ) => {
    try {
      // Find the homework to get coin reward
      const homeworkItem = homework.find(hw => hw.id === submission.homework_id);
      if (!homeworkItem) {
        toast({
          title: "Error",
          description: "Homework not found",
          variant: "destructive"
        });
        return;
      }

      // Check and consume credits equal to coin reward
      const teacherId = localStorage.getItem("teacherId");
      if (!teacherId) {
        toast({
          title: "Error",
          description: "Teacher ID not found",
          variant: "destructive"
        });
        return;
      }

      const canProceed = await checkAndConsumeCredits(
        teacherId, 
        homeworkItem.coin_reward, 
        `Approving homework submission (${homeworkItem.coin_reward} coins reward)`
      );
      
      if (!canProceed) {
        return; // Credits check failed, don't approve submission
      }

      const { error } = await supabase
        .from('homework_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (error) throw error;

      // Award coins to student
      awardCoinsToStudent(submission.student_id, homeworkItem.coin_reward);

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submission.id 
            ? { ...sub, status: 'approved' as const }
            : sub
        )
      );

      toast({
        title: "Success",
        description: `Submission approved! ${homeworkItem.coin_reward} coins awarded to ${submission.student_name}. ${homeworkItem.coin_reward} credits consumed.`
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive"
      });
    }
  };

  const handleRejectSubmission = async (
    submission: HomeworkSubmission,
    feedback: string | undefined,
    setSubmissions: React.Dispatch<React.SetStateAction<HomeworkSubmission[]>>
  ) => {
    try {
      const { error } = await supabase
        .from('homework_submissions')
        .update({ 
          status: 'rejected',
          feedback: feedback || null
        })
        .eq('id', submission.id);

      if (error) throw error;

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === submission.id 
            ? { ...sub, status: 'rejected' as const, feedback }
            : sub
        )
      );

      toast({
        title: "Success",
        description: "Submission rejected"
      });
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive"
      });
    }
  };

  return {
    handleApproveSubmission,
    handleRejectSubmission
  };
};
